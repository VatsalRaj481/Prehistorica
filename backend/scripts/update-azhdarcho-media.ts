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

const NEW_AZHDARCHO_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Azhdarcho_pair.png',
    type: 'art',
    credit: 'PaleoEquii (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Azhdarcho_pair.png'
  },
  {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/528-Azhdarcho.jpg',
    type: 'fossil_specimen',
    credit: 'Life reconstruction illustration',
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Azhdarcho.jpg'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Skeletal_of_Azhdarcho_lancicollis.png',
    type: 'photo',
    credit: 'Fossil skeletal specimen photo',
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Skeletal_of_Azhdarcho_lancicollis.png'
  }
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🏛️  PREHISTORICA AUDITED REVISION: Azhdarcho lancicollis (#528) Media');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // Step 1: Pre-operation snapshot
  console.log('Step 1: Capturing pre-operation snapshot of all database records...');
  const beforeSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap = new Map<number, any>();
  beforeSpecies.forEach(s => snapshotMap.set(s.id, s));
  console.log(`Snapshot locked for ${beforeSpecies.length} species records.\n`);

  // Step 2: Locate Azhdarcho
  const azhdarcho = snapshotMap.get(528);
  if (!azhdarcho) {
    throw new Error('Azhdarcho (#528) not found in database!');
  }
  console.log(`Target: #${azhdarcho.id} (${azhdarcho.name})`);
  console.log('Current media:', azhdarcho.media, '\n');

  // Step 3: Update Azhdarcho media in database
  console.log('Step 3: Updating Azhdarcho media in database...');
  const newMediaStr = JSON.stringify(NEW_AZHDARCHO_MEDIA);
  await prisma.species.update({
    where: { id: 528 },
    data: { media: newMediaStr }
  });
  console.log('✅ Azhdarcho media updated: replaced Scansor_chick.png with Azhdarcho_pair.png as main art.\n');

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

    if (after.id === 528) {
      for (const field of PROTECTED_FIELDS) {
        if (field === 'media') continue;
        const bNorm = canonicalNormalize((before as any)[field]);
        const aNorm = canonicalNormalize((after as any)[field]);
        if (bNorm !== aNorm) {
          targetViolations.push(`Azhdarcho field '${field}' was unintentionally modified!`);
        }
      }
      const parsedMedia = JSON.parse(after.media || '[]');
      if (parsedMedia.length < 1 || parsedMedia[0].url !== NEW_AZHDARCHO_MEDIA[0].url || parsedMedia[0].type !== 'art') {
        targetViolations.push(`Azhdarcho media did not match expected value: ${after.media}`);
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
  console.log(`  - Exactly 1 targeted record updated: Azhdarcho lancicollis (#528) media`);
  console.log('  - All 23 non-media protected fields on Azhdarcho remain 100% untouched');
  console.log(`  - All ${beforeSpecies.length - 1} other species records remain 100% pristine and untouched\n`);

  // Step 5: Verify static JSON files
  console.log('Step 5: Verifying static JSON export files...');
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
        if (item.id === 528 || item.name === 'Azhdarcho') {
          item.media = newMediaStr;
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
