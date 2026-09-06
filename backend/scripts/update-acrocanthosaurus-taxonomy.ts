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

type ProtectedField = typeof PROTECTED_FIELDS[number];

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

const CORRECT_ACROCANTHOSAURUS_TAXONOMY = {
  domain: 'Eukaryota',
  kingdom: 'Animalia',
  phylum: 'Chordata',
  class: 'Reptilia',
  order: 'Saurischia',
  family: 'Carcharodontosauridae',
  genus: 'Acrocanthosaurus',
  species: 'Acrocanthosaurus atokensis',
  source: 'Paleobiology Database (PBDB) + GBIF'
};

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🏛️  PREHISTORICA AUDITED REVISION: Acrocanthosaurus (#459) Taxonomy');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // Step 1: Pre-operation snapshot
  console.log('Step 1: Capturing pre-operation snapshot of all database records...');
  const beforeSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap = new Map<number, any>();
  beforeSpecies.forEach(s => snapshotMap.set(s.id, s));
  console.log(`Snapshot locked for ${beforeSpecies.length} species records.\n`);

  // Step 2: Locate Acrocanthosaurus
  const acrocanthosaurus = snapshotMap.get(459);
  if (!acrocanthosaurus) {
    throw new Error('Acrocanthosaurus (#459) not found in database!');
  }
  console.log(`Target: #${acrocanthosaurus.id} (${acrocanthosaurus.name} / ${acrocanthosaurus.scientificName})`);
  console.log('Current taxonomy:', acrocanthosaurus.taxonomy, '\n');

  // Step 3: Update Acrocanthosaurus taxonomy in database
  console.log('Step 3: Updating Acrocanthosaurus taxonomy in database...');
  const newTaxonomyStr = JSON.stringify(CORRECT_ACROCANTHOSAURUS_TAXONOMY);
  await prisma.species.update({
    where: { id: 459 },
    data: { taxonomy: newTaxonomyStr }
  });
  console.log('✅ Acrocanthosaurus taxonomy updated -> Family: Carcharodontosauridae, Order: Saurischia\n');

  // Step 4: Safeguard verification
  console.log('Step 4: Executing post-operation safeguard verification across all species...');
  const afterSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const nonTargetViolations: string[] = [];
  const targetViolations: string[] = [];

  if (afterSpecies.length !== beforeSpecies.length) {
    throw new Error(`CRITICAL: Species count changed from ${beforeSpecies.length} to ${afterSpecies.length}!`);
  }

  for (const after of afterSpecies) {
    const before = snapshotMap.get(after.id);
    if (!before) {
      nonTargetViolations.push(`Unexpected row appeared: #${after.id}`);
      continue;
    }

    if (after.id === 459) {
      for (const field of PROTECTED_FIELDS) {
        if (field === 'taxonomy') continue;
        const bNorm = canonicalNormalize((before as any)[field]);
        const aNorm = canonicalNormalize((after as any)[field]);
        if (bNorm !== aNorm) {
          targetViolations.push(`Acrocanthosaurus field '${field}' was unintentionally modified!`);
        }
      }
      const parsedTax = JSON.parse(after.taxonomy || '{}');
      if (parsedTax.family !== 'Carcharodontosauridae') {
        targetViolations.push(`Acrocanthosaurus family mismatch: ${parsedTax.family}`);
      }
      if (parsedTax.order !== 'Saurischia') {
        targetViolations.push(`Acrocanthosaurus order mismatch: ${parsedTax.order}`);
      }
    } else {
      for (const field of PROTECTED_FIELDS) {
        const bNorm = canonicalNormalize((before as any)[field]);
        const aNorm = canonicalNormalize((after as any)[field]);
        if (bNorm !== aNorm) {
          nonTargetViolations.push(`Non-target species #${after.id} (${after.name}) field '${field}' was modified!`);
        }
      }
    }
  }

  if (nonTargetViolations.length > 0 || targetViolations.length > 0) {
    console.error('❌ SAFEGUARD AUDIT FAILED:');
    nonTargetViolations.forEach(v => console.error('  [NON-TARGET VIOLATION]', v));
    targetViolations.forEach(v => console.error('  [TARGET VIOLATION]', v));
    throw new Error('Safeguard check encountered violations!');
  }

  console.log('✅ [SAFEGUARD AUDIT PASSED]:');
  console.log(`  - Exactly 1 targeted record updated: Acrocanthosaurus (#459) taxonomy`);
  console.log('  - All 23 non-taxonomy protected fields on Acrocanthosaurus remain 100% untouched');
  console.log(`  - All ${beforeSpecies.length - 1} other species records remain 100% pristine and untouched\n`);

  // Step 5: Verify static JSON files
  console.log('Step 5: Synchronizing static JSON export files...');
  const jsonFilesToSync = [
    path.join(__dirname, '../prisma/species_full_export.json'),
    path.join(__dirname, '../prisma/species_cretaceous.json')
  ];

  for (const filePath of jsonFilesToSync) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    let updatedCount = 0;
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.id === 459 || item.name === 'Acrocanthosaurus') {
          item.taxonomy = newTaxonomyStr;
          updatedCount++;
        }
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`  - Synced ${updatedCount} entries in ${path.basename(filePath)}`);
    }
  }

  console.log('\n✨ [ALL OPERATIONS COMPLETE]: Database and JSON exports synchronized successfully.\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error('Fatal error during revision:', err);
    prisma.$disconnect();
    process.exit(1);
  });
