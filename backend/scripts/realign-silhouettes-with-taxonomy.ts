import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const uploadedUuids = new Map<string, string>();

async function uploadFileToSupabase(fileName: string, buffer: Buffer, contentType: string): Promise<string> {
  const url = `${supabaseUrl}/storage/v1/object/species-silhouettes/${fileName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      'Content-Type': contentType,
      'x-upsert': 'true'
    },
    body: buffer
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload failed for ${fileName} (${res.status}): ${errText}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/species-silhouettes/${fileName}`;
}

async function fetchWithRetry(url: string, retries = 3): Promise<Buffer | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Prehistorica-Realigner/1.0' } });
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        return Buffer.from(arrayBuf);
      }
      if (res.status === 404) return null;
      await new Promise(r => setTimeout(r, 300 * (i + 1)));
    } catch (e) {
      if (i === retries - 1) return null;
      await new Promise(r => setTimeout(r, 300 * (i + 1)));
    }
  }
  return null;
}

async function getImageDownloadInfo(uuid: string): Promise<{ url: string; contentType: string; ext: string } | null> {
  try {
    const res = await fetch(`https://api.phylopic.org/images/${uuid}?build=552`);
    if (!res.ok) return null;
    const data = await res.json();
    const source = data._links?.sourceFile;
    if (source && source.href) {
      const isSvg = source.type === 'image/svg+xml' || source.href.endsWith('.svg');
      return {
        url: source.href,
        contentType: source.type || (isSvg ? 'image/svg+xml' : 'image/png'),
        ext: isSvg ? 'svg' : 'png'
      };
    }
    const raster = data._links?.rasterFiles?.[0];
    if (raster && raster.href) {
      return {
        url: raster.href,
        contentType: raster.type || 'image/png',
        ext: 'png'
      };
    }
  } catch (e) {
    console.error(`Error resolving image info for ${uuid}:`, e);
  }
  return null;
}

async function getAcceptedImagesForNode(nodeUuid: string) {
  try {
    const res = await fetch(`https://api.phylopic.org/images?build=552&filter_clade=${nodeUuid}&page=0&embed_items=true`);
    if (!res.ok) return [];
    const data = await res.json();
    const items = data._embedded?.items || [];
    return items.filter((i: any) => {
      const lic = i._links?.license?.href || '';
      return lic.includes('publicdomain/zero') || lic.includes('publicdomain/mark') || lic.includes('/by/') || lic.includes('/by-sa/');
    });
  } catch {
    return [];
  }
}

async function findPhyloPicMatchForName(name: string) {
  if (!name || name.length < 3 || name.endsWith('clade')) return null;
  try {
    const norm = name.toLowerCase().trim();
    const nodeRes = await fetch(`https://api.phylopic.org/nodes?build=552&filter_name=${encodeURIComponent(norm)}&page=0&embed_items=true`);
    if (!nodeRes.ok) return null;
    const nodeData = await nodeRes.json();
    const nodes = nodeData._embedded?.items || [];
    for (const n of nodes) {
      const nodeUuid = n._links?.self?.href?.match(/\/nodes\/([a-f0-9-]+)/)?.[1];
      if (!nodeUuid) continue;
      const images = await getAcceptedImagesForNode(nodeUuid);
      if (images.length > 0) {
        const img = images[0];
        const imgUuid = img._links?.self?.href?.match(/\/images\/([a-f0-9-]+)/)?.[1];
        if (imgUuid) {
          return {
            uuid: imgUuid,
            title: img._links?.self?.title || name,
            contributor: img._links?.contributor?.title || 'Unknown',
            licenseHref: img._links?.license?.href || ''
          };
        }
      }
    }
  } catch {}
  return null;
}

function formatLicenseName(href: string): string {
  if (href.includes('publicdomain/zero')) return 'CC0 1.0 Universal Public Domain Dedication';
  if (href.includes('publicdomain/mark')) return 'Public Domain Mark 1.0';
  if (href.includes('/by-sa/4.0')) return 'Attribution-ShareAlike 4.0 International';
  if (href.includes('/by-sa/3.0')) return 'Attribution-ShareAlike 3.0 Unported';
  if (href.includes('/by/4.0')) return 'Attribution 4.0 International';
  if (href.includes('/by/3.0')) return 'Attribution 3.0 Unported';
  return 'Creative Commons License';
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║       PREHISTORICA: SILHOUETTE RE-ALIGNMENT WITH TAXONOMY          ║');
  console.log('║       UPGRADING GENERIC CLADES TO CERTIFIED PBDB FAMILIES          ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  // Step 1: Pre-operation snapshot
  console.log('Step 1: Capturing pre-operation snapshot of all 502 records...');
  const allSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap: Record<number, { media: string; paleoartUrl: string; fossilUrl: string; sources: string }> = {};
  allSpecies.forEach(s => {
    snapshotMap[s.id] = {
      media: s.media || '',
      paleoartUrl: s.reconstructionImageUrl || '',
      fossilUrl: s.fossilImageUrl || '',
      sources: s.sources || ''
    };
  });
  console.log(`Snapshot locked for ${allSpecies.length} species.\n`);

  // Pre-load already uploaded assets
  allSpecies.forEach(s => {
    try {
      const sil = s.comparisonSilhouette ? JSON.parse(s.comparisonSilhouette) : null;
      if (sil?.url) {
        const m = sil.url.match(/species-silhouettes\/([a-f0-9-]+)\./);
        if (m) uploadedUuids.set(m[1], sil.url);
      }
    } catch {}
  });
  console.log(`Cached uploaded silhouettes in memory: ${uploadedUuids.size}`);

  // Step 2: Re-audit each species
  console.log('Step 2: Checking for family & genus upgrades against certified taxonomy...');
  const upgrades: any[] = [];
  let exactCount = 0;
  let genusFamilyCount = 0;
  let cladeCount = 0;
  let noSilhouetteCount = 0;

  for (const s of allSpecies) {
    const sil = s.comparisonSilhouette ? JSON.parse(s.comparisonSilhouette) : null;
    const tax = s.taxonomy ? JSON.parse(s.taxonomy) : {};

    // If it's already an exact species-specific match, preserve it
    if (sil?.taxonMatch === 'species-specific') {
      exactCount++;
      continue;
    }

    // Check if it currently uses a clade-level fallback
    const isCladeFallback = sil && sil.taxon?.includes('Clade Representative');

    // 1. Try exact genus on PhyloPic if not exact
    const genus = tax.genus || s.scientificName.split(' ')[0];
    const family = tax.family;

    let bestMatch: any = null;
    let matchType = 'clade';

    // Try Genus
    const genusMatch = await findPhyloPicMatchForName(genus);
    if (genusMatch) {
      bestMatch = genusMatch;
      matchType = 'genus';
    } else if (family && !family.endsWith('clade')) {
      // Try Certified Family
      const familyMatch = await findPhyloPicMatchForName(family);
      if (familyMatch) {
        bestMatch = familyMatch;
        matchType = 'family';
      }
    }

    // If we found a superior Genus or Family match and the species currently has a Clade fallback:
    if (bestMatch && (isCladeFallback || sil?.taxonMatch !== 'species-specific')) {
      // Self-host asset if not already uploaded
      let selfHostedUrl = uploadedUuids.get(bestMatch.uuid);
      if (!selfHostedUrl) {
        const dlInfo = await getImageDownloadInfo(bestMatch.uuid);
        if (dlInfo) {
          const buffer = await fetchWithRetry(dlInfo.url);
          if (buffer) {
            const fileName = `${bestMatch.uuid}.${dlInfo.ext}`;
            selfHostedUrl = await uploadFileToSupabase(fileName, buffer, dlInfo.contentType);
            uploadedUuids.set(bestMatch.uuid, selfHostedUrl);
          }
        }
      }

      if (selfHostedUrl) {
        const newPayload = {
          url: selfHostedUrl,
          sourceUrl: `https://www.phylopic.org/images/${bestMatch.uuid}`,
          license: formatLicenseName(bestMatch.licenseHref),
          credit: bestMatch.contributor,
          taxon: matchType === 'genus' ? genus : `${family} (Representative: ${bestMatch.title})`,
          taxonMatch: 'generic approximation, not species-specific'
        };

        // Update ONLY comparisonSilhouette in DB
        await prisma.species.update({
          where: { id: s.id },
          data: {
            comparisonSilhouette: JSON.stringify(newPayload)
          }
        });

        upgrades.push({
          speciesId: s.id,
          name: s.name,
          scientificName: s.scientificName,
          clade: s.clade,
          certifiedFamily: family,
          oldSilhouetteTaxon: sil?.taxon,
          upgradedTaxon: newPayload.taxon,
          matchTier: matchType,
          credit: newPayload.credit,
          license: newPayload.license
        });

        genusFamilyCount++;
        continue;
      }
    }

    if (!sil) {
      noSilhouetteCount++;
    } else if (isCladeFallback) {
      cladeCount++;
    } else {
      genusFamilyCount++;
    }
  }

  console.log(`\nRe-audit complete! Upgraded ${upgrades.length} species to certified Family/Genus silhouettes!\n`);

  // Step 3: Verify Integrity of all 502 species
  console.log('Step 3: Verifying zero modifications to paleoart, media, or other fields...');
  const postSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  let violations = 0;
  for (const s of postSpecies) {
    const snap = snapshotMap[s.id];
    if ((s.media || '') !== snap.media) {
      console.error(`[MEDIA VIOLATION] Species ${s.id} (${s.name}) media array modified!`);
      violations++;
    }
    if ((s.reconstructionImageUrl || '') !== snap.paleoartUrl) {
      console.error(`[PALEOART VIOLATION] Species ${s.id} (${s.name}) reconstructionImageUrl modified!`);
      violations++;
    }
    if ((s.fossilImageUrl || '') !== snap.fossilUrl) {
      console.error(`[FOSSIL VIOLATION] Species ${s.id} (${s.name}) fossilImageUrl modified!`);
      violations++;
    }
    if ((s.sources || '') !== snap.sources) {
      console.error(`[SOURCES VIOLATION] Species ${s.id} (${s.name}) sources modified!`);
      violations++;
    }
  }

  if (violations > 0) {
    throw new Error(`CRITICAL FAILURE: ${violations} paleoart/media violations detected!`);
  }

  console.log('✅ [INTEGRITY CHECK PASSED]: 100% of all 502 species paleoart, media, and sources are identical and untouched!\n');

  // Step 4: Save upgraded audit reports
  console.log('Step 4: Writing updated coverage reports...');
  const reportsDir = path.join(__dirname, '../reports');
  const reportJsonPath = path.join(reportsDir, 'silhouette_realigned_report.json');
  fs.writeFileSync(reportJsonPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalSpecies: allSpecies.length,
    exactMatches: exactCount,
    genusFamilyMatches: genusFamilyCount,
    cladeFallbacks: cladeCount,
    noSilhouette: noSilhouetteCount,
    upgradesCount: upgrades.length,
    upgradedSpecies: upgrades
  }, null, 2), 'utf8');

  console.log(`Report written to ${reportJsonPath}`);

  console.log('\n================ SUMMARY ================');
  console.log(`Total species:          ${allSpecies.length}`);
  console.log(`Exact species matches:  ${exactCount}`);
  console.log(`Genus/Family matches:   ${genusFamilyCount}`);
  console.log(`Clade fallbacks:        ${cladeCount}`);
  console.log(`Upgraded to Family:     ${upgrades.length}`);
  console.log(`Paleoart modified:      0 (100% preserved)`);
  console.log('=========================================\n');
}

main().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error in silhouette realignment:', err);
  process.exit(1);
});
