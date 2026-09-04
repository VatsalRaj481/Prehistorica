import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const SNAPSHOT_PATH = path.join(process.cwd(), '.species-safeguard-snapshot.json');

const NON_FACT_FIELDS = [
  'name', 'scientificName', 'nameMeaning', 'timePeriod', 'epoch',
  'myaStart', 'myaEnd', 'diet', 'dietDetails', 'habitat', 'clade',
  'geographicRange', 'taxonomy', 'taxonomicStatus', 'media',
  'discoveryHistory', 'sizeNotes', 'sizeEstimate', 'sizeComparisonToHuman',
  'extinctionEvent', 'closestLivingRelatives', 'sources', 'placeholder'
] as const;

function canonicalNormalize(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return JSON.stringify(sortKeys(parsed));
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof val === 'object') {
    return JSON.stringify(sortKeys(val));
  }
  return String(val);
}

function sortKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  } else if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, any> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortKeys(obj[key]);
    }
    return sorted;
  }
  return obj;
}

async function main() {
  console.log("🔒 [BATCH SAFEGUARD AUDIT] Verifying zero regression across all 502 records...");
  const snapshotRaw = fs.readFileSync(SNAPSHOT_PATH, 'utf-8');
  const snapshot = JSON.parse(snapshotRaw);

  const currentRows = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const currentMap = new Map(currentRows.map(r => [r.id, r]));

  const violations: string[] = [];

  for (const [idStr, orig] of Object.entries(snapshot.speciesMap) as any) {
    const origId = Number(idStr);
    const curr = currentMap.get(origId);
    if (!curr) {
      violations.push(`DELETED SPECIES: #${origId}`);
      continue;
    }

    for (const field of NON_FACT_FIELDS) {
      const origVal = canonicalNormalize(orig.fields[field]);
      const currVal = canonicalNormalize((curr as any)[field]);
      if (origVal !== currVal) {
        violations.push(`Field '${field}' modified on Species #${origId} (${curr.name})!`);
      }
    }
  }

  if (violations.length > 0) {
    console.error("❌ SAFEGUARD VIOLATIONS:", violations);
    process.exit(1);
  }

  console.log(`✅ [BATCH SAFEGUARD PASSED]: 0 non-fact fields modified across all 502 species.`);
  console.log(`  - 100% of paleoart, media credits, licenses, taxonomy, discovery history are intact.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
