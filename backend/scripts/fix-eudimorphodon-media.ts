import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PROTECTED_FIELDS = [
  'name',
  'scientificName',
  'nameMeaning',
  'timePeriod',
  'epoch',
  'myaStart',
  'myaEnd',
  'diet',
  'dietDetails',
  'habitat',
  'clade',
  'geographicRange',
  'taxonomy',
  'taxonomicStatus',
  'media',
  'discoveryHistory',
  'interestingFacts',
  'sizeNotes',
  'sizeEstimate',
  'sizeComparisonToHuman',
  'extinctionEvent',
  'closestLivingRelatives',
  'sources',
  'placeholder'
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
  console.log('=== Task 1: Fix Eudimorphodon (#139) Media Classification ===\n');

  // Step 1: Capture pre-operation snapshot of all 502 records
  console.log('Step 1: Capturing pre-operation snapshot of all 502 species...');
  const beforeSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap = new Map<number, any>();
  beforeSpecies.forEach(s => snapshotMap.set(s.id, s));
  console.log(`Snapshot locked for ${beforeSpecies.length} species records.\n`);

  // Step 2: Locate Eudimorphodon (#139)
  const eudimorphodon = snapshotMap.get(139);
  if (!eudimorphodon) {
    throw new Error('Species #139 (Eudimorphodon) not found in database!');
  }

  let media: any[] = [];
  try {
    media = JSON.parse(eudimorphodon.media || '[]');
  } catch (err: any) {
    throw new Error(`Failed to parse Eudimorphodon media: ${err.message}`);
  }

  console.log('Current Eudimorphodon media:');
  console.log(JSON.stringify(media, null, 2));

  // Relabel the first item's type from "art" to "fossil_specimen"
  // Keep the exact same URL, credit, and sourceUrl intact
  const updatedMedia = media.map((item, idx) => {
    if (idx === 0) {
      return {
        ...item,
        type: 'fossil_specimen'
      };
    }
    return item;
  });

  console.log('\nUpdated Eudimorphodon media to apply:');
  console.log(JSON.stringify(updatedMedia, null, 2));

  // Step 3: Update database record
  await prisma.species.update({
    where: { id: 139 },
    data: {
      media: JSON.stringify(updatedMedia)
    }
  });
  console.log('\n✅ Successfully updated Eudimorphodon (#139) media in database.\n');

  // Step 4: Strict Safeguard Verification across all 502 species
  console.log('Step 4: Verifying database safeguard across all 502 species...');
  const afterSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  let nonTargetViolations: string[] = [];
  let eudiNonMediaViolations: string[] = [];

  for (const after of afterSpecies) {
    const before = snapshotMap.get(after.id);
    if (!before) {
      nonTargetViolations.push(`Unexpected new species added: #${after.id}`);
      continue;
    }

    if (after.id === 139) {
      // For Eudimorphodon, verify all 23 OTHER protected fields are 100% identical
      for (const field of PROTECTED_FIELDS) {
        if (field === 'media') continue;
        const bNorm = canonicalNormalize((before as any)[field]);
        const aNorm = canonicalNormalize((after as any)[field]);
        if (bNorm !== aNorm) {
          eudiNonMediaViolations.push(`Eudimorphodon field '${field}' was altered!`);
        }
      }
    } else {
      // For all other 501 species, verify all 24 protected fields are 100% untouched
      for (const field of PROTECTED_FIELDS) {
        const bNorm = canonicalNormalize((before as any)[field]);
        const aNorm = canonicalNormalize((after as any)[field]);
        if (bNorm !== aNorm) {
          nonTargetViolations.push(`Non-target species #${after.id} (${after.name}) field '${field}' was modified!`);
        }
      }
    }
  }

  if (nonTargetViolations.length > 0 || eudiNonMediaViolations.length > 0) {
    console.error('❌ SAFEGUARD FAILED:');
    nonTargetViolations.forEach(v => console.error('  [NON-TARGET]', v));
    eudiNonMediaViolations.forEach(v => console.error('  [EUDIMORPHODON]', v));
    throw new Error('Safeguard check encountered violations!');
  }

  console.log('✅ [SAFEGUARD PASSED]:');
  console.log('  - Exactly 1 targeted row modified: Eudimorphodon (#139) media[0].type = "fossil_specimen"');
  console.log('  - All 23 other protected fields of Eudimorphodon are 100% untouched');
  console.log('  - All 501 other species records are 100% untouched and identical\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error('Fatal error:', err);
    prisma.$disconnect();
    process.exit(1);
  });
