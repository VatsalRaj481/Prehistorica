import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface StorageFile {
  name: string;
  path: string;
  size: number;
}

interface DBMediaRef {
  speciesId: number;
  speciesName: string;
  scientificName: string;
  mediaType: string;
  rawUrl: string;
  extractedPath: string | null;
  normalizedPath: string | null;
}

async function listStorageFolder(prefix: string = ''): Promise<StorageFile[]> {
  let allFiles: StorageFile[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/list/species-media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prefix,
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' }
      })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to list storage (status ${res.status}): ${text}`);
    }

    const items: any[] = await res.json();
    if (!items || items.length === 0) break;

    for (const item of items) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (!item.id && (!item.metadata || Object.keys(item.metadata).length === 0)) {
        const subFiles = await listStorageFolder(fullPath);
        allFiles.push(...subFiles);
      } else {
        allFiles.push({
          name: item.name,
          path: fullPath,
          size: item.metadata?.size || 0
        });
      }
    }

    if (items.length < limit) break;
    offset += limit;
  }

  return allFiles;
}

function extractStoragePath(urlStr: string): string | null {
  if (!urlStr) return null;
  try {
    const cleanUrl = urlStr.split('?')[0].split('#')[0];
    const marker = '/species-media/';
    const idx = cleanUrl.indexOf(marker);
    if (idx !== -1) {
      return cleanUrl.substring(idx + marker.length);
    }
    if (cleanUrl.startsWith('species-media/')) {
      return cleanUrl.substring('species-media/'.length);
    }
  } catch (e) {}
  return null;
}

function normalizePath(p: string): string {
  try {
    let decoded = decodeURIComponent(p);
    decoded = decoded.replace(/^\/+/, '').replace(/\/\/+/g, '/');
    return decoded.trim();
  } catch (e) {
    return p.trim();
  }
}

async function runAudit() {
  const storageFiles = await listStorageFolder('');
  const speciesList = await prisma.species.findMany();

  const speciesById = new Map<number, typeof speciesList[0]>();
  for (const s of speciesList) {
    speciesById.set(s.id, s);
  }

  const dbRefs: DBMediaRef[] = [];
  const exactPathsInDb = new Set<string>();
  const normalizedPathsInDb = new Map<string, DBMediaRef[]>();
  const speciesFullTextMap = new Map<number, string>();

  for (const s of speciesList) {
    const fullText = JSON.stringify(s);
    speciesFullTextMap.set(s.id, fullText);

    let mediaArr: any[] = [];
    if (s.media) {
      try {
        mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : s.media;
      } catch (e) {}
    }

    if (Array.isArray(mediaArr)) {
      for (const item of mediaArr) {
        if (item && item.url) {
          const rawUrl = String(item.url);
          const extPath = extractStoragePath(rawUrl);
          const normPath = extPath ? normalizePath(extPath) : null;

          const ref: DBMediaRef = {
            speciesId: s.id,
            speciesName: s.name,
            scientificName: s.scientificName,
            mediaType: item.type || 'unknown',
            rawUrl,
            extractedPath: extPath,
            normalizedPath: normPath
          };

          dbRefs.push(ref);

          if (extPath) {
            exactPathsInDb.add(extPath);
          }
          if (normPath) {
            if (!normalizedPathsInDb.has(normPath)) {
              normalizedPathsInDb.set(normPath, []);
            }
            normalizedPathsInDb.get(normPath)!.push(ref);
          }
        }
      }
    }
  }

  const exactMatches: { file: StorageFile; ref: DBMediaRef }[] = [];
  const formatMatches: { file: StorageFile; ref: DBMediaRef; reason: string }[] = [];
  const confirmedOrphans: { file: StorageFile; suspectedSpecies: string; suspectedSpeciesId: number | null }[] = [];

  for (const file of storageFiles) {
    const rawPath = file.path;
    const normPath = normalizePath(rawPath);

    if (exactPathsInDb.has(rawPath)) {
      const refs = dbRefs.filter(r => r.extractedPath === rawPath);
      exactMatches.push({ file, ref: refs[0] });
      continue;
    }

    if (normalizedPathsInDb.has(normPath)) {
      const refs = normalizedPathsInDb.get(normPath)!;
      formatMatches.push({
        file,
        ref: refs[0],
        reason: `URL encoding or path case difference (DB path: '${refs[0].extractedPath}', Storage path: '${rawPath}')`
      });
      continue;
    }

    let caseMatchRef: DBMediaRef | null = null;
    for (const [np, refs] of normalizedPathsInDb.entries()) {
      if (np.toLowerCase() === normPath.toLowerCase()) {
        caseMatchRef = refs[0];
        break;
      }
    }
    if (caseMatchRef) {
      formatMatches.push({
        file,
        ref: caseMatchRef,
        reason: `Case mismatch (DB: '${caseMatchRef.extractedPath}', Storage: '${rawPath}')`
      });
      continue;
    }

    let foundInDbText = false;
    let textMatchSpecies: typeof speciesList[0] | null = null;
    for (const s of speciesList) {
      const dump = speciesFullTextMap.get(s.id)!;
      if (dump.includes(rawPath) || dump.includes(encodeURIComponent(rawPath)) || dump.includes(normPath)) {
        foundInDbText = true;
        textMatchSpecies = s;
        break;
      }
    }

    if (foundInDbText && textMatchSpecies) {
      formatMatches.push({
        file,
        ref: {
          speciesId: textMatchSpecies.id,
          speciesName: textMatchSpecies.name,
          scientificName: textMatchSpecies.scientificName,
          mediaType: 'found_in_db_text',
          rawUrl: rawPath,
          extractedPath: rawPath,
          normalizedPath: normPath
        },
        reason: `Found elsewhere in species #${textMatchSpecies.id} (${textMatchSpecies.name}) DB record, but not in media array`
      });
      continue;
    }

    let suspectedSpecies = "Unknown / Unidentified";
    let suspectedSpeciesId: number | null = null;

    const idMatch = rawPath.match(/^(\d+)[-_]/);
    if (idMatch) {
      const spId = parseInt(idMatch[1]);
      suspectedSpeciesId = spId;
      const sp = speciesById.get(spId);
      if (sp) {
        suspectedSpecies = `Species #${sp.id}: ${sp.name} (${sp.scientificName})`;
      } else {
        suspectedSpecies = `Species ID #${spId} (Former/Deleted DB ID)`;
      }
    } else {
      const filenameLower = rawPath.toLowerCase();
      for (const s of speciesList) {
        const nameClean = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const sciClean = s.scientificName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (nameClean.length > 3 && filenameLower.replace(/[^a-z0-9]/g, '').includes(nameClean)) {
          suspectedSpecies = `Species #${s.id}: ${s.name} (${s.scientificName})`;
          suspectedSpeciesId = s.id;
          break;
        } else if (sciClean.length > 3 && filenameLower.replace(/[^a-z0-9]/g, '').includes(sciClean)) {
          suspectedSpecies = `Species #${s.id}: ${s.name} (${s.scientificName})`;
          suspectedSpeciesId = s.id;
          break;
        }
      }
    }

    confirmedOrphans.push({ file, suspectedSpecies, suspectedSpeciesId });
  }

  const totalStorageBytes = storageFiles.reduce((acc, f) => acc + f.size, 0);
  const exactBytes = exactMatches.reduce((acc, m) => acc + m.file.size, 0);
  const formatBytes = formatMatches.reduce((acc, m) => acc + m.file.size, 0);
  const orphanBytes = confirmedOrphans.reduce((acc, o) => acc + o.file.size, 0);

  const reportData = {
    summary: {
      totalStorageFiles: storageFiles.length,
      totalStorageBytes,
      totalStorageMB: (totalStorageBytes / (1024 * 1024)).toFixed(2),
      exactMatchesCount: exactMatches.length,
      exactMatchesBytes: exactBytes,
      exactMatchesMB: (exactBytes / (1024 * 1024)).toFixed(2),
      possibleMatchesCount: formatMatches.length,
      possibleMatchesBytes: formatBytes,
      possibleMatchesMB: (formatBytes / (1024 * 1024)).toFixed(2),
      confirmedOrphansCount: confirmedOrphans.length,
      confirmedOrphansBytes: orphanBytes,
      confirmedOrphansMB: (orphanBytes / (1024 * 1024)).toFixed(2),
      totalSpeciesInDB: speciesList.length,
      totalMediaURLsInDB: dbRefs.length
    },
    possibleMatches: formatMatches,
    confirmedOrphans: confirmedOrphans.map((o, idx) => ({
      index: idx + 1,
      filename: o.file.path,
      sizeBytes: o.file.size,
      sizeKB: (o.file.size / 1024).toFixed(1),
      sizeMB: (o.file.size / (1024 * 1024)).toFixed(2),
      suspectedSpecies: o.suspectedSpecies,
      suspectedSpeciesId: o.suspectedSpeciesId
    }))
  };

  fs.writeFileSync(path.join(__dirname, 'orphan_audit_results.json'), JSON.stringify(reportData, null, 2));
  console.log("Audit complete! Saved output to orphan_audit_results.json");
}

runAudit().catch(console.error).finally(() => prisma.$disconnect());
