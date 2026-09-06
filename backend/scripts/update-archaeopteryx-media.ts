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

const NEW_ARCHAEOPTERYX_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Archaeopteryx_lithographica_by_durbed.jpg',
    type: 'art',
    credit: 'Durbed (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Archaeopteryx_lithographica_by_durbed.jpg'
  },
  {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/21-Archaeopteryx.jpg',
    type: 'photo',
    credit: 'DBCLS (CC BY 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:202010_Archaeopteryx_lithographica.png'
  }
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🏛️  PREHISTORICA AUDITED REVISION: Archaeopteryx lithographica (#21) Media');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // Step 1: Pre-operation snapshot
  console.log('Step 1: Capturing pre-operation snapshot of all database records...');
  const beforeSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap = new Map<number, any>();
  beforeSpecies.forEach(s => snapshotMap.set(s.id, s));
  console.log(`Snapshot locked for ${beforeSpecies.length} species records.\n`);

  // Step 2: Locate Archaeopteryx
  const archaeopteryx = snapshotMap.get(21);
  if (!archaeopteryx) {
    throw new Error('Archaeopteryx (#21) not found in database!');
  }
  console.log(`Target: #${archaeopteryx.id} (${archaeopteryx.name})`);
  console.log('Current media:', archaeopteryx.media, '\n');

  // Step 3: Update Archaeopteryx media in database
  console.log('Step 3: Updating Archaeopteryx media in database...');
  const newMediaStr = JSON.stringify(NEW_ARCHAEOPTERYX_MEDIA);
  await prisma.species.update({
    where: { id: 21 },
    data: { media: newMediaStr }
  });
  console.log('✅ Archaeopteryx media updated: set primary art to Durbed life restoration.\n');

  // Step 4: Strict safeguard verification across all species
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

    if (after.id === 21) {
      for (const field of PROTECTED_FIELDS) {
        if (field === 'media') continue;
        const bNorm = canonicalNormalize((before as any)[field]);
        const aNorm = canonicalNormalize((after as any)[field]);
        if (bNorm !== aNorm) {
          targetViolations.push(`Archaeopteryx field '${field}' was unintentionally modified!`);
        }
      }
      const parsedMedia = JSON.parse(after.media || '[]');
      if (parsedMedia.length < 1 || parsedMedia[0].url !== NEW_ARCHAEOPTERYX_MEDIA[0].url || parsedMedia[0].type !== 'art') {
        targetViolations.push(`Archaeopteryx media did not match expected value: ${after.media}`);
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
  console.log(`  - Exactly 1 targeted record updated: Archaeopteryx lithographica (#21) media`);
  console.log('  - All 23 non-media protected fields on Archaeopteryx remain 100% untouched');
  console.log(`  - All ${beforeSpecies.length - 1} other species records remain 100% pristine and untouched\n`);

  // Step 5: Synchronize static JSON files
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
        if (item.id === 21 || item.name === 'Archaeopteryx lithographica') {
          item.media = newMediaStr;
          updatedCount++;
        }
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`  - Synced ${updatedCount} entries in ${path.basename(filePath)}`);
    }
  }

  // Also sync species.json if it has reconstructionImageUrl for Archaeopteryx
  const speciesJsonPath = path.join(__dirname, '../prisma/species.json');
  if (fs.existsSync(speciesJsonPath)) {
    const speciesData = JSON.parse(fs.readFileSync(speciesJsonPath, 'utf-8'));
    if (Array.isArray(speciesData)) {
      for (const item of speciesData) {
        if (item.name === 'Archaeopteryx lithographica' || item.id === 21) {
          item.reconstructionImageUrl = NEW_ARCHAEOPTERYX_MEDIA[0].url;
        }
      }
      fs.writeFileSync(speciesJsonPath, JSON.stringify(speciesData, null, 2), 'utf-8');
      console.log(`  - Synced species.json reconstructionImageUrl`);
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
