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

const CORRECT_GUANLONG_TAXONOMY = {
  domain: 'Eukaryota',
  kingdom: 'Animalia',
  phylum: 'Chordata',
  class: 'Reptilia',
  order: 'Saurischia',
  family: 'Proceratosauridae',
  genus: 'Guanlong',
  species: 'Guanlong wucaii'
};

const CORRECT_PROCERATOSAURUS_TAXONOMY = {
  domain: 'Eukaryota',
  kingdom: 'Animalia',
  phylum: 'Chordata',
  class: 'Reptilia',
  order: 'Saurischia',
  family: 'Proceratosauridae',
  genus: 'Proceratosaurus',
  species: 'Proceratosaurus bradleyi'
};

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🏛️  PREHISTORICA AUDITED TAXONOMY REVISION: Guanlong & Proceratosaurus');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // Step 1: Capture pre-operation snapshot of all species in database
  console.log('Step 1: Capturing pre-operation snapshot of all database records...');
  const beforeSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap = new Map<number, any>();
  beforeSpecies.forEach(s => snapshotMap.set(s.id, s));
  console.log(`Snapshot locked for ${beforeSpecies.length} species records.\n`);

  // Step 2: Locate Guanlong and Proceratosaurus
  console.log('Step 2: Locating Guanlong and Proceratosaurus in snapshot...');
  const guanlong = beforeSpecies.find(s => s.name.toLowerCase() === 'guanlong' || s.scientificName.toLowerCase().startsWith('guanlong'));
  const proceratosaurus = beforeSpecies.find(s => s.name.toLowerCase() === 'proceratosaurus' || s.scientificName.toLowerCase().startsWith('proceratosaurus'));

  if (!guanlong) {
    throw new Error('Guanlong record not found in database!');
  }
  if (!proceratosaurus) {
    throw new Error('Proceratosaurus record not found in database!');
  }

  console.log(`Found Guanlong: ID #${guanlong.id} (${guanlong.name} / ${guanlong.scientificName})`);
  console.log(`  Current taxonomy: ${guanlong.taxonomy}`);
  console.log(`Found Proceratosaurus: ID #${proceratosaurus.id} (${proceratosaurus.name} / ${proceratosaurus.scientificName})`);
  console.log(`  Current taxonomy: ${proceratosaurus.taxonomy}\n`);

  // Step 3: Perform targeted updates in database
  console.log('Step 3: Executing audited taxonomy update for Guanlong and Proceratosaurus...');
  const guanlongTaxonomyStr = JSON.stringify(CORRECT_GUANLONG_TAXONOMY);
  const proceratosaurusTaxonomyStr = JSON.stringify(CORRECT_PROCERATOSAURUS_TAXONOMY);

  await prisma.species.update({
    where: { id: guanlong.id },
    data: { taxonomy: guanlongTaxonomyStr }
  });
  console.log(`✅ Updated Guanlong (#${guanlong.id}) taxonomy -> Family: Proceratosauridae, Order: Saurischia`);

  await prisma.species.update({
    where: { id: proceratosaurus.id },
    data: { taxonomy: proceratosaurusTaxonomyStr }
  });
  console.log(`✅ Updated Proceratosaurus (#${proceratosaurus.id}) taxonomy -> Family: Proceratosauridae, Order: Saurischia\n`);

  // Step 4: Strict post-operation safeguard verification across all species
  console.log('Step 4: Executing post-operation safeguard verification across all species...');
  const afterSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const nonTargetViolations: string[] = [];
  const targetViolations: string[] = [];

  if (afterSpecies.length !== beforeSpecies.length) {
    throw new Error(`CRITICAL SAFEGUARD VIOLATION: Species count changed from ${beforeSpecies.length} to ${afterSpecies.length}!`);
  }

  for (const after of afterSpecies) {
    const before = snapshotMap.get(after.id);
    if (!before) {
      nonTargetViolations.push(`Unexpected unknown species row appeared: #${after.id}`);
      continue;
    }

    if (after.id === guanlong.id) {
      // Check 23 other fields
      for (const field of PROTECTED_FIELDS) {
        if (field === 'taxonomy') continue;
        const bNorm = canonicalNormalize((before as any)[field]);
        const aNorm = canonicalNormalize((after as any)[field]);
        if (bNorm !== aNorm) {
          targetViolations.push(`Guanlong field '${field}' was unintentionally modified!`);
        }
      }
      // Check taxonomy matches exact new value
      const parsedTax = JSON.parse(after.taxonomy || '{}');
      if (parsedTax.family !== 'Proceratosauridae' || parsedTax.order !== 'Saurischia' || parsedTax.genus !== 'Guanlong' || parsedTax.species !== 'Guanlong wucaii') {
        targetViolations.push(`Guanlong taxonomy did not match expected value: ${after.taxonomy}`);
      }
    } else if (after.id === proceratosaurus.id) {
      // Check 23 other fields
      for (const field of PROTECTED_FIELDS) {
        if (field === 'taxonomy') continue;
        const bNorm = canonicalNormalize((before as any)[field]);
        const aNorm = canonicalNormalize((after as any)[field]);
        if (bNorm !== aNorm) {
          targetViolations.push(`Proceratosaurus field '${field}' was unintentionally modified!`);
        }
      }
      // Check taxonomy matches exact new value
      const parsedTax = JSON.parse(after.taxonomy || '{}');
      if (parsedTax.family !== 'Proceratosauridae' || parsedTax.order !== 'Saurischia' || parsedTax.genus !== 'Proceratosaurus' || parsedTax.species !== 'Proceratosaurus bradleyi') {
        targetViolations.push(`Proceratosaurus taxonomy did not match expected value: ${after.taxonomy}`);
      }
    } else {
      // All other species must have ALL 24 protected fields 100% unchanged
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
  console.log(`  - Exactly 2 targeted records updated: Guanlong (#${guanlong.id}) and Proceratosaurus (#${proceratosaurus.id})`);
  console.log('  - All 23 non-taxonomy protected fields on Guanlong and Proceratosaurus remain 100% untouched');
  console.log(`  - All ${beforeSpecies.length - 2} other species records remain 100% pristine and untouched\n`);

  // Step 5: Synchronize static JSON export files
  console.log('Step 5: Synchronizing static JSON export files...');
  const jsonFilesToSync = [
    path.join(__dirname, '../prisma/species_full_export.json'),
    path.join(__dirname, '../prisma/species_jurassic.json')
  ];

  for (const filePath of jsonFilesToSync) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    let updatedCount = 0;
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.name === 'Guanlong' || item.scientificName === 'Guanlong wucaii') {
          item.taxonomy = guanlongTaxonomyStr;
          updatedCount++;
        } else if (item.name === 'Proceratosaurus' || item.scientificName === 'Proceratosaurus bradleyi') {
          item.taxonomy = proceratosaurusTaxonomyStr;
          updatedCount++;
        }
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`  - Synced ${updatedCount} entries in ${path.basename(filePath)}`);
    }
  }

  console.log('\n✨ [ALL OPERATIONS COMPLETE]: Database and JSON exports updated under strict safeguard.\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error('Fatal error during taxonomy revision:', err);
    prisma.$disconnect();
    process.exit(1);
  });
