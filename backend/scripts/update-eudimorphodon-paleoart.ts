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

const NEW_EUDIMORPHODON_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Eudimorphodon_NT_small.jpg',
    type: 'art',
    credit: 'Nobu Tamura (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Eudimorphodon_NT_small.jpg'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Triassic_fossils.png',
    type: 'photo',
    credit: 'Fossil skeletal specimen photo',
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Triassic_fossils.png'
  }
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🏛️  PREHISTORICA AUDITED PALEOART REVISION: Eudimorphodon (#139)');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // Step 1: Pre-operation snapshot of all 502 database records
  console.log('Step 1: Capturing pre-operation snapshot of all database records...');
  const beforeSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap = new Map<number, any>();
  beforeSpecies.forEach(s => snapshotMap.set(s.id, s));
  console.log(`Snapshot locked for ${beforeSpecies.length} species records.\n`);

  // Step 2: Locate Eudimorphodon
  console.log('Step 2: Locating Eudimorphodon in snapshot...');
  const eudimorphodon = snapshotMap.get(139) || beforeSpecies.find(s => s.name.toLowerCase() === 'eudimorphodon');
  if (!eudimorphodon) {
    throw new Error('Eudimorphodon record not found in database!');
  }
  console.log(`Found Eudimorphodon: ID #${eudimorphodon.id} (${eudimorphodon.name} / ${eudimorphodon.scientificName})`);
  console.log('Current media:', eudimorphodon.media, '\n');

  // Step 3: Execute targeted update in database
  console.log('Step 3: Updating Eudimorphodon paleoart media in database...');
  const newMediaStr = JSON.stringify(NEW_EUDIMORPHODON_MEDIA);

  await prisma.species.update({
    where: { id: eudimorphodon.id },
    data: { media: newMediaStr }
  });
  console.log('✅ Updated Eudimorphodon (#139) media -> Set primary art to Nobu Tamura restoration\n');

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

    if (after.id === eudimorphodon.id) {
      // Check 23 other fields
      for (const field of PROTECTED_FIELDS) {
        if (field === 'media') continue;
        const bNorm = canonicalNormalize((before as any)[field]);
        const aNorm = canonicalNormalize((after as any)[field]);
        if (bNorm !== aNorm) {
          targetViolations.push(`Eudimorphodon field '${field}' was unintentionally modified!`);
        }
      }
      // Check media matches expected value
      const parsedMedia = JSON.parse(after.media || '[]');
      if (parsedMedia.length < 1 || parsedMedia[0].url !== 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Eudimorphodon_NT_small.jpg' || parsedMedia[0].type !== 'art') {
        targetViolations.push(`Eudimorphodon media did not match expected value: ${after.media}`);
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
  console.log(`  - Exactly 1 targeted record updated: Eudimorphodon (#${eudimorphodon.id}) media`);
  console.log('  - All 23 non-media protected fields on Eudimorphodon remain 100% untouched');
  console.log(`  - All ${beforeSpecies.length - 1} other species records remain 100% pristine and untouched\n`);

  // Step 5: Synchronize static JSON export files
  console.log('Step 5: Synchronizing static JSON export files...');
  const jsonFilesToSync = [
    path.join(__dirname, '../prisma/species_full_export.json'),
    path.join(__dirname, '../prisma/species_triassic.json')
  ];

  for (const filePath of jsonFilesToSync) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    let updatedCount = 0;
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.name === 'Eudimorphodon' || item.id === 139) {
          item.media = newMediaStr;
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
    console.error('Fatal error during paleoart revision:', err);
    prisma.$disconnect();
    process.exit(1);
  });
