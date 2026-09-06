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

// Target 1: Suchomimus tenerensis (#3183)
const NEW_SUCHOMIMUS_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Life_reconstruction_of_Suchomimus_tenerensis.png',
    type: 'art',
    credit: 'Connor Ashbridge (CC BY 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Life_reconstruction_of_Suchomimus_tenerensis.png'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Suchomimus_swim_2.png',
    type: 'habitat_scene',
    credit: 'Slate Weasel (Public domain)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Suchomimus_swim_2.png'
  }
];

// Target 2: Carnotaurus sastrei (#29)
const NEW_CARNOTAURUS_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Carnotaurus_life_restoration_%28mirrored%29.jpg',
    type: 'art',
    credit: 'Lida Xing and Yi Liu (CC BY 2.5)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Carnotaurus_life_restoration_(mirrored).jpg'
  },
  {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/29-Carnotaurus.jpg',
    type: 'photo',
    credit: 'Lida Xing and Yi Liu (CC BY 2.5)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Carnotaurus_life_restoration_(mirrored).jpg'
  }
];

// Target 3: Isisaurus colberti (#2316)
const NEW_ISISAURUS_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Isisaurus_colberti_life_restoration.png',
    type: 'art',
    credit: 'Ansh Saxena (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Isisaurus_colberti_life_restoration.png'
  },
  {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/2316-perfect-art.png',
    type: 'skeletal_reconstruction',
    credit: 'DNB XD (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Isisaurus_life_restoration.png'
  }
];

// Target 4: Pterodaustro guinazui (#523)
const NEW_PTERODAUSTRO_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Pterodaustro_%28life_restoration%29.jpg',
    type: 'art',
    credit: 'Petr Menshikov (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pterodaustro_(life_restoration).jpg'
  },
  {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/523-Pterodaustro.jpg',
    type: 'fossil_specimen',
    credit: 'Life reconstruction illustration',
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Pterodaustro.jpg'
  }
];

// Target 5: Scaphognathus crassirostris (#210)
const NEW_SCAPHOGNATHUS_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Scaphognathus_%28life_restoration%29.png',
    type: 'art',
    credit: 'Rudolf Hima (CC BY 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Scaphognathus_(life_restoration).png'
  },
  {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/210-Scaphognathus.jpg',
    type: 'fossil_specimen',
    credit: 'Life reconstruction illustration',
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Scaphognathus.jpg'
  }
];

const CORRECT_SCAPHOGNATHUS_SIZE_NOTES = 'Wingspan of approximately 0.9 m (3.0 ft); body weight estimated around 0.3–0.5 kg.';
const CORRECT_SCAPHOGNATHUS_SIZE_ESTIMATE = JSON.stringify({
  length: { value: 0.9, unit: 'm', confidence: 'well-supported' },
  height: { value: 0.2, unit: 'm', confidence: 'estimated' },
  weight: { value: 0.4, unit: 'kg', confidence: 'estimated' }
});

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🏛️  PREHISTORICA AUDITED REVISION: 5 Species Paleoart & Scaphognathus Size');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // Step 1: Pre-operation snapshot
  console.log('Step 1: Capturing pre-operation snapshot of all database records...');
  const beforeSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap = new Map<number, any>();
  beforeSpecies.forEach(s => snapshotMap.set(s.id, s));
  console.log(`Snapshot locked for ${beforeSpecies.length} species records.\n`);

  // Step 2: Verify targets exist
  const targets = [3183, 29, 2316, 523, 210];
  for (const tid of targets) {
    if (!snapshotMap.has(tid)) {
      throw new Error(`Target species ID #${tid} not found in database!`);
    }
  }

  // Step 3: Execute updates in database
  console.log('Step 3: Updating database records...');

  // 1. Suchomimus (#3183)
  await prisma.species.update({
    where: { id: 3183 },
    data: { media: JSON.stringify(NEW_SUCHOMIMUS_MEDIA) }
  });
  console.log('  ✅ Updated Suchomimus (#3183) media');

  // 2. Carnotaurus (#29)
  await prisma.species.update({
    where: { id: 29 },
    data: { media: JSON.stringify(NEW_CARNOTAURUS_MEDIA) }
  });
  console.log('  ✅ Updated Carnotaurus (#29) media');

  // 3. Isisaurus (#2316)
  await prisma.species.update({
    where: { id: 2316 },
    data: { media: JSON.stringify(NEW_ISISAURUS_MEDIA) }
  });
  console.log('  ✅ Updated Isisaurus (#2316) media');

  // 4. Pterodaustro (#523)
  await prisma.species.update({
    where: { id: 523 },
    data: { media: JSON.stringify(NEW_PTERODAUSTRO_MEDIA) }
  });
  console.log('  ✅ Updated Pterodaustro (#523) media');

  // 5. Scaphognathus (#210)
  await prisma.species.update({
    where: { id: 210 },
    data: {
      media: JSON.stringify(NEW_SCAPHOGNATHUS_MEDIA),
      sizeNotes: CORRECT_SCAPHOGNATHUS_SIZE_NOTES,
      sizeEstimate: CORRECT_SCAPHOGNATHUS_SIZE_ESTIMATE
    }
  });
  console.log('  ✅ Updated Scaphognathus (#210) media + measurements\n');

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

    if (after.id === 3183) {
      for (const field of PROTECTED_FIELDS) {
        if (field === 'media') continue;
        if (canonicalNormalize((before as any)[field]) !== canonicalNormalize((after as any)[field])) {
          targetViolations.push(`Suchomimus field '${field}' unintentionally modified!`);
        }
      }
    } else if (after.id === 29) {
      for (const field of PROTECTED_FIELDS) {
        if (field === 'media') continue;
        if (canonicalNormalize((before as any)[field]) !== canonicalNormalize((after as any)[field])) {
          targetViolations.push(`Carnotaurus field '${field}' unintentionally modified!`);
        }
      }
    } else if (after.id === 2316) {
      for (const field of PROTECTED_FIELDS) {
        if (field === 'media') continue;
        if (canonicalNormalize((before as any)[field]) !== canonicalNormalize((after as any)[field])) {
          targetViolations.push(`Isisaurus field '${field}' unintentionally modified!`);
        }
      }
    } else if (after.id === 523) {
      for (const field of PROTECTED_FIELDS) {
        if (field === 'media') continue;
        if (canonicalNormalize((before as any)[field]) !== canonicalNormalize((after as any)[field])) {
          targetViolations.push(`Pterodaustro field '${field}' unintentionally modified!`);
        }
      }
    } else if (after.id === 210) {
      for (const field of PROTECTED_FIELDS) {
        if (field === 'media' || field === 'sizeNotes' || field === 'sizeEstimate') continue;
        if (canonicalNormalize((before as any)[field]) !== canonicalNormalize((after as any)[field])) {
          targetViolations.push(`Scaphognathus field '${field}' unintentionally modified!`);
        }
      }
    } else {
      for (const field of PROTECTED_FIELDS) {
        if (canonicalNormalize((before as any)[field]) !== canonicalNormalize((after as any)[field])) {
          nonTargetViolations.push(`Non-target species #${after.id} (${after.name}) field '${field}' modified!`);
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
  console.log('  - Exactly 5 targeted records updated: #3183, #29, #2316, #523, #210');
  console.log('  - All non-target protected fields on the 5 species remain 100% untouched');
  console.log(`  - All ${beforeSpecies.length - 5} other species records remain 100% pristine and untouched\n`);

  // Step 5: Synchronize static JSON files
  console.log('Step 5: Synchronizing static JSON export files...');

  // Sync species_cretaceous.json
  const cretaceousPath = path.join(__dirname, '../prisma/species_cretaceous.json');
  if (fs.existsSync(cretaceousPath)) {
    const data = JSON.parse(fs.readFileSync(cretaceousPath, 'utf-8'));
    let synced = 0;
    for (const item of data) {
      if (item.id === 3183) {
        item.media = JSON.stringify(NEW_SUCHOMIMUS_MEDIA);
        synced++;
      } else if (item.id === 29) {
        item.media = JSON.stringify(NEW_CARNOTAURUS_MEDIA);
        synced++;
      } else if (item.id === 2316) {
        item.media = JSON.stringify(NEW_ISISAURUS_MEDIA);
        synced++;
      } else if (item.id === 523) {
        item.media = JSON.stringify(NEW_PTERODAUSTRO_MEDIA);
        synced++;
      }
    }
    fs.writeFileSync(cretaceousPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`  - Synced ${synced} entries in species_cretaceous.json`);
  }

  // Sync species_jurassic.json
  const jurassicPath = path.join(__dirname, '../prisma/species_jurassic.json');
  if (fs.existsSync(jurassicPath)) {
    const data = JSON.parse(fs.readFileSync(jurassicPath, 'utf-8'));
    let synced = 0;
    for (const item of data) {
      if (item.id === 210) {
        item.media = JSON.stringify(NEW_SCAPHOGNATHUS_MEDIA);
        item.sizeNotes = CORRECT_SCAPHOGNATHUS_SIZE_NOTES;
        item.sizeEstimate = CORRECT_SCAPHOGNATHUS_SIZE_ESTIMATE;
        synced++;
      }
    }
    fs.writeFileSync(jurassicPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`  - Synced ${synced} entries in species_jurassic.json`);
  }

  // Sync species_full_export.json
  const fullExportPath = path.join(__dirname, '../prisma/species_full_export.json');
  if (fs.existsSync(fullExportPath)) {
    const data = JSON.parse(fs.readFileSync(fullExportPath, 'utf-8'));
    let synced = 0;
    for (const item of data) {
      if (item.id === 3183) {
        item.media = JSON.stringify(NEW_SUCHOMIMUS_MEDIA);
        synced++;
      } else if (item.id === 29) {
        item.media = JSON.stringify(NEW_CARNOTAURUS_MEDIA);
        synced++;
      } else if (item.id === 2316) {
        item.media = JSON.stringify(NEW_ISISAURUS_MEDIA);
        synced++;
      } else if (item.id === 523) {
        item.media = JSON.stringify(NEW_PTERODAUSTRO_MEDIA);
        synced++;
      } else if (item.id === 210) {
        item.media = JSON.stringify(NEW_SCAPHOGNATHUS_MEDIA);
        item.sizeNotes = CORRECT_SCAPHOGNATHUS_SIZE_NOTES;
        item.sizeEstimate = CORRECT_SCAPHOGNATHUS_SIZE_ESTIMATE;
        synced++;
      }
    }
    fs.writeFileSync(fullExportPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`  - Synced ${synced} entries in species_full_export.json`);
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
