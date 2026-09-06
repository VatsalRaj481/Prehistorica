import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const NEW_PREONDACTYLUS_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Preondactylus_NT.jpg',
    type: 'art',
    credit: 'Nobu Tamura (CC BY 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Preondactylus_NT.jpg'
  },
  {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/140-Preondactylus.jpg',
    type: 'fossil_specimen',
    credit: 'Life reconstruction illustration',
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Preondactylus.jpg'
  }
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🏛️  PREHISTORICA AUDITED REVISION: Preondactylus buffarinii (#140) Media');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // Step 1: Pre-operation snapshot
  console.log('Step 1: Capturing pre-operation snapshot of all database records...');
  const beforeSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap = new Map<number, any>();
  beforeSpecies.forEach(s => snapshotMap.set(s.id, s));
  console.log(`Snapshot locked for ${beforeSpecies.length} species records.\n`);

  // Step 2: Locate Preondactylus
  const preondactylus = snapshotMap.get(140);
  if (!preondactylus) {
    throw new Error('Preondactylus (#140) not found in database!');
  }
  console.log(`Target: #${preondactylus.id} (${preondactylus.name})`);
  console.log('Current media:', preondactylus.media, '\n');

  // Step 3: Update Preondactylus media in database
  console.log('Step 3: Updating Preondactylus media in database...');
  const newMediaStr = JSON.stringify(NEW_PREONDACTYLUS_MEDIA);
  await prisma.species.update({
    where: { id: 140 },
    data: { media: newMediaStr }
  });
  console.log('✅ Preondactylus media updated: set primary art to Nobu Tamura life restoration.\n');

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

    if (after.id === 140) {
      for (const field of PROTECTED_FIELDS) {
        if (field === 'media') continue;
        const bNorm = canonicalNormalize((before as any)[field]);
        const aNorm = canonicalNormalize((after as any)[field]);
        if (bNorm !== aNorm) {
          targetViolations.push(`Preondactylus field '${field}' was unintentionally modified!`);
        }
      }
      const parsedMedia = JSON.parse(after.media || '[]');
      if (parsedMedia.length < 1 || parsedMedia[0].url !== NEW_PREONDACTYLUS_MEDIA[0].url || parsedMedia[0].type !== 'art') {
        targetViolations.push(`Preondactylus media did not match expected value: ${after.media}`);
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
  console.log(`  - Exactly 1 targeted record updated: Preondactylus buffarinii (#140) media`);
  console.log('  - All 23 non-media protected fields on Preondactylus remain 100% untouched');
  console.log(`  - All ${beforeSpecies.length - 1} other species records remain 100% pristine and untouched\n`);

  // Step 5: Synchronize static JSON files
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
      for (const sp of data) {
        if (sp.id === 140 || sp.name === 'Preondactylus') {
          sp.media = newMediaStr;
          sp.updatedAt = new Date().toISOString();
          updatedCount++;
        }
      }
    }

    if (updatedCount > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      console.log(`  - Synced ${path.basename(filePath)} (${updatedCount} instance updated)`);
    } else {
      console.log(`  - No instance found in ${path.basename(filePath)}`);
    }
  }

  console.log('\n✨ Preondactylus media update and safeguard synchronization completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
