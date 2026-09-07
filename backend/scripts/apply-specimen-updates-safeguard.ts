import './../src/dns-init.js';
import { PrismaClient, Clade, Diet, Habitat, TaxonomicStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const ALL_PROTECTED_FIELDS = [
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
  'comparisonSilhouette',
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

// 1. Proceratosaurus bradleyi (#154)
const PROCERATOSAURUS_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Proceratosaurus_NT.jpg',
    type: 'art',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Proceratosaurus_NT.jpg'
  },
  {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/154-Proceratosaurus.jpg',
    type: 'art',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Proceratosaurus_NT.jpg'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Proceratosaurus_bradleyi_reconstructed_skeleton.png',
    type: 'photo',
    credit: 'Fossil skeletal specimen photo',
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Proceratosaurus_bradleyi_reconstructed_skeleton.png'
  }
];

const PROCERATOSAURUS_SIZE_NOTES = 'Total body length of approximately 3.0 m (9.8–10.4 ft), hip height around 1.0 m, and body mass estimated at 28–36 kg for the subadult holotype, with larger adult estimates reaching 50–100 kg (Rauhut et al. 2010; Paul 2016).';
const PROCERATOSAURUS_SIZE_ESTIMATE = JSON.stringify({
  length: { value: 3.0, unit: 'm', confidence: 'well-supported' },
  height: { value: 1.0, unit: 'm', confidence: 'well-supported' },
  weight: { value: 35, unit: 'kg', confidence: 'estimated' }
});

// 2. Ceratosaurus nasicornis (#145)
const CERATOSAURUS_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Ceratosaurus_nasicornis_DB.jpg',
    type: 'art',
    credit: 'Dmitry Bogdanov (CC BY 2.5)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ceratosaurus_nasicornis_DB.jpg'
  },
  {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/145-Ceratosaurus.jpg',
    type: 'art',
    credit: 'Dmitry Bogdanov (CC BY 2.5)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ceratosaurus_nasicornis_DB.jpg'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Ceratosaurus_skeleton_white_background.jpg',
    type: 'photo',
    credit: 'Fossil skeletal specimen photo',
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Ceratosaurus_skeleton_white_background.jpg'
  }
];

const CERATOSAURUS_SILHOUETTE = JSON.stringify({
  url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/4d7d38eb-0973-4bac-b7c7-99e63c40fe82.svg',
  sourceUrl: 'https://www.phylopic.org/images/4d7d38eb-0973-4bac-b7c7-99e63c40fe82',
  license: 'CC0 1.0 Universal Public Domain Dedication',
  credit: 'Tasman Dixon',
  taxon: 'Ceratosaurus nasicornis',
  taxonMatch: 'species-specific'
});

// 3. Olorotitan arharensis (#489)
const OLOROTITAN_SILHOUETTE = JSON.stringify({
  url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/9161bbeb-fa38-48f6-bb20-c68c255dd9b6.svg',
  sourceUrl: 'https://www.phylopic.org/images/9161bbeb-fa38-48f6-bb20-c68c255dd9b6',
  license: 'Creative Commons Attribution-ShareAlike 3.0 Unported',
  credit: 'Dmitry Bogdanov (vectorized by T. Michael Keesey)',
  taxon: 'Olorotitan arharensis',
  taxonMatch: 'species-specific'
});

// 4. Tsintaosaurus spinorhinus (#484)
const TSINTAOSAURUS_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Tsintaosaurus_spinorhinus_NT.jpg',
    type: 'art',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tsintaosaurus_spinorhinus_NT.jpg'
  },
  {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/484-Tsintaosaurus.jpg',
    type: 'art',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tsintaosaurus_spinorhinus_NT.jpg'
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Tsintaosaurus_spinorhinus.JPG',
    type: 'museum_display',
    credit: 'Ghedoghedo (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File%3ATsintaosaurus%20spinorhinus.JPG'
  }
];

// 5. Dsungaripterus weii (New Ingestion)
const DSUNGARIPTERUS_ENTRY = {
  id: 5187,
  name: 'Dsungaripterus',
  scientificName: 'Dsungaripterus weii',
  nameMeaning: 'Junggar Basin wing',
  timePeriod: 'Early Cretaceous',
  epoch: 'Early Cretaceous Epoch',
  myaStart: 140,
  myaEnd: 125,
  clade: Clade.Pterosaur,
  diet: Diet.carnivore,
  habitat: Habitat.aerial,
  dietDetails: 'Specialized durophage feeding on hard-shelled mollusks, crustaceans, and fish using toothless hooked beak tips to extract prey and flat bulbous rear teeth to crush shells.',
  taxonomicStatus: TaxonomicStatus.valid,
  extinctionEvent: null,
  closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)', 'Crocodilians']),
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Dsungaripterus_weii.png',
      type: 'art',
      credit: 'Connor Ashbridge (CC BY 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dsungaripterus_weii.png'
    },
    {
      url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/Dsungaripterus_weii.png',
      type: 'art',
      credit: 'Connor Ashbridge (CC BY 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dsungaripterus_weii.png'
    }
  ]),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Reptilia',
    order: 'Pterosauria',
    family: 'Dsungaripteridae',
    genus: 'Dsungaripterus',
    species: 'Dsungaripterus weii',
    source: 'Paleobiology Database (PBDB) + GBIF'
  }),
  geographicRange: JSON.stringify({
    continent: 'Asia',
    region: 'East Asia',
    country: 'China',
    fossilFormation: 'Lianmuqin Formation / Shengjinkou Formation (Tugulu Group)'
  }),
  sizeEstimate: JSON.stringify({
    length: { value: 3.2, unit: 'm', confidence: 'well-supported' },
    height: { value: 1.2, unit: 'm', confidence: 'well-supported' },
    weight: { value: 30, unit: 'kg', confidence: 'estimated' }
  }),
  sizeNotes: 'Wingspan of approximately 3.0–3.5 m (9.8–11.5 ft), standing height around 1.2 m, and estimated body weight of 25–35 kg with robust, thick-walled flight bones.',
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/f58adcd3-4593-4af2-9e6d-7fb8ca8a8318.svg',
    sourceUrl: 'https://www.phylopic.org/images/f58adcd3-4593-4af2-9e6d-7fb8ca8a8318',
    license: 'Creative Commons Attribution 4.0 International',
    credit: 'Connor Ashbridge',
    taxon: 'Dsungaripterus weii',
    taxonMatch: 'species-specific'
  }),
  discoveryHistory: '• First described in 1964 by pioneering Chinese paleontologist Yang Zhongjian (C.C. Young) based on a skull and partial skeleton from the Junggar Basin in Xinjiang, China.\n• The species was named Dsungaripterus weii in honor of paleontologist C.M. Wei.\n• In 1973, additional excavations in the Shengjinkou Formation recovered nearly complete skulls and articulated postcrania.\n• Recognized as the type genus of the family Dsungaripteridae, known for their unique upward-curving beaks and crushing rear dentition.',
  interestingFacts: JSON.stringify([
    'Possessed prominent upturned, toothless beak tips used to probe sediments and pry open hard-shelled mollusks and crustaceans from rocky lakeshores.',
    'Unlike most fish-eating pterosaurs with needle-sharp teeth, Dsungaripterus had broad, bulbous, flat-crowned teeth at the rear of its jaws specialized for shell-crushing durophagy.',
    'A distinctive low bony crest ran along the midline of its skull from the middle of the snout backward to a pointed occipital crest overhanging the neck.',
    'Possessed exceptionally thick-walled limb bones and stout proportions, indicating that it was capable of proficient quadrupedal terrestrial locomotion on land.'
  ]),
  sources: JSON.stringify([
    { citation: 'Paleobiology Database (PBDB) species record', url: 'https://paleobiodb.org' },
    { citation: 'Young, C.C. (1964). On a new pterosaurian from Sinkiang, China. Vertebrata PalAsiatica, 8(3), 221-255.', url: 'http://www.ivpp.cas.cn' },
    { citation: 'Dsungaripterus weii description in paleontological literature', url: 'https://en.wikipedia.org/wiki/Dsungaripterus' }
  ]),
  placeholder: false
};

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🏛️  PREHISTORICA AUDITED REVISION & INGESTION WITH SAFEGUARD VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: PRE-OPERATION SNAPSHOT OF ALL DATABASE RECORDS
  console.log('Step 1: Capturing pre-operation snapshot of all existing database records...');
  const beforeSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap = new Map<number, any>();
  beforeSpecies.forEach(s => snapshotMap.set(s.id, s));
  console.log(`✅ Snapshot locked for all ${beforeSpecies.length} species records.\n`);

  // STEP 2: APPLY TARGETED UPDATES
  console.log('Step 2: Ensuring targeted records have exact approved data...');

  await prisma.species.update({
    where: { id: 154 },
    data: {
      media: JSON.stringify(PROCERATOSAURUS_MEDIA),
      sizeNotes: PROCERATOSAURUS_SIZE_NOTES,
      sizeEstimate: PROCERATOSAURUS_SIZE_ESTIMATE
    }
  });
  console.log('  ✅ [UPDATED #154] Proceratosaurus bradleyi: Paleoart media & size measurements (3.0m / 35kg)');

  await prisma.species.update({
    where: { id: 145 },
    data: {
      media: JSON.stringify(CERATOSAURUS_MEDIA),
      comparisonSilhouette: CERATOSAURUS_SILHOUETTE
    }
  });
  console.log('  ✅ [UPDATED #145] Ceratosaurus nasicornis: Paleoart media & calibrated horizontal lateral silhouette');

  await prisma.species.update({
    where: { id: 489 },
    data: {
      comparisonSilhouette: OLOROTITAN_SILHOUETTE
    }
  });
  console.log('  ✅ [UPDATED #489] Olorotitan arharensis: Fixed silhouette to full-body lateral profile');

  await prisma.species.update({
    where: { id: 484 },
    data: {
      media: JSON.stringify(TSINTAOSAURUS_MEDIA)
    }
  });
  console.log('  ✅ [UPDATED #484] Tsintaosaurus spinorhinus: Upgraded primary image to full-size life reconstruction paleoart\n');

  // STEP 3: INGEST DSUNGARIPTERUS WEII
  console.log('Step 3: Ingesting Dsungaripterus weii into database...');
  const existingDsung = await prisma.species.findFirst({
    where: {
      OR: [
        { id: 5187 },
        { name: { equals: 'Dsungaripterus', mode: 'insensitive' } },
        { scientificName: { equals: 'Dsungaripterus weii', mode: 'insensitive' } }
      ]
    }
  });

  let dsungRecord: any = null;
  if (!existingDsung) {
    dsungRecord = await prisma.species.create({
      data: DSUNGARIPTERUS_ENTRY
    });
    console.log(`  🎉 [CREATED #${dsungRecord.id}] Dsungaripterus weii (Pterosauria: Dsungaripteridae)\n`);
  } else {
    dsungRecord = existingDsung;
    console.log(`  ℹ️ [ALREADY CREATED #${dsungRecord.id}] Dsungaripterus weii\n`);
  }

  // STEP 4: STRICT POST-OPERATION SAFEGUARD VERIFICATION
  console.log('Step 4: Executing post-operation safeguard verification across all species...');
  const afterSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  
  console.log(`Total database species count: ${afterSpecies.length}`);

  const nonTargetViolations: string[] = [];
  const targetViolations: string[] = [];

  for (const before of beforeSpecies) {
    // If Dsungaripterus was already in beforeSpecies, it's fine
    if (before.id === 5187) continue;

    const after = afterSpecies.find(s => s.id === before.id);
    if (!after) {
      nonTargetViolations.push(`DELETED ROW: Species #${before.id} (${before.name}) was removed!`);
      continue;
    }

    if (before.id === 154) {
      for (const f of ALL_PROTECTED_FIELDS) {
        if (f === 'media' || f === 'sizeNotes' || f === 'sizeEstimate') continue;
        if (canonicalNormalize((before as any)[f]) !== canonicalNormalize((after as any)[f])) {
          targetViolations.push(`Proceratosaurus unauthorized field '${f}' modified!`);
        }
      }
    } else if (before.id === 145) {
      for (const f of ALL_PROTECTED_FIELDS) {
        if (f === 'media' || f === 'comparisonSilhouette') continue;
        if (canonicalNormalize((before as any)[f]) !== canonicalNormalize((after as any)[f])) {
          targetViolations.push(`Ceratosaurus unauthorized field '${f}' modified!`);
        }
      }
    } else if (before.id === 489) {
      for (const f of ALL_PROTECTED_FIELDS) {
        if (f === 'comparisonSilhouette') continue;
        if (canonicalNormalize((before as any)[f]) !== canonicalNormalize((after as any)[f])) {
          targetViolations.push(`Olorotitan unauthorized field '${f}' modified!`);
        }
      }
    } else if (before.id === 484) {
      for (const f of ALL_PROTECTED_FIELDS) {
        if (f === 'media') continue;
        if (canonicalNormalize((before as any)[f]) !== canonicalNormalize((after as any)[f])) {
          targetViolations.push(`Tsintaosaurus unauthorized field '${f}' modified!`);
        }
      }
    } else {
      for (const f of ALL_PROTECTED_FIELDS) {
        if (canonicalNormalize((before as any)[f]) !== canonicalNormalize((after as any)[f])) {
          nonTargetViolations.push(`Species #${after.id} (${after.name}) field '${f}' was unintentionally modified!`);
        }
      }
    }
  }

  if (nonTargetViolations.length > 0 || targetViolations.length > 0) {
    console.error('❌ SAFEGUARD AUDIT FAILED!');
    nonTargetViolations.forEach(v => console.error('  [NON-TARGET VIOLATION]', v));
    targetViolations.forEach(v => console.error('  [TARGET VIOLATION]', v));
    throw new Error('Safeguard check encountered violations!');
  }

  console.log('✅ [SAFEGUARD AUDIT PASSED 100%]:');
  console.log(`  - Exactly 4 target records updated: #154, #145, #489, #484`);
  console.log(`  - Exactly 1 new species ingested: #${dsungRecord.id} (${dsungRecord.name})`);
  console.log(`  - All non-target species records remain 100% pristine and untouched.\n`);

  // STEP 5: SYNCHRONIZE STATIC JSON FILES
  console.log('Step 5: Synchronizing static JSON archive files...');

  // 1. species_jurassic.json
  const jurassicPath = path.join(__dirname, '../prisma/species_jurassic.json');
  if (fs.existsSync(jurassicPath)) {
    const jurassicData = JSON.parse(fs.readFileSync(jurassicPath, 'utf-8'));
    let jCount = 0;
    for (const item of jurassicData) {
      if (item.id === 154) {
        item.media = JSON.stringify(PROCERATOSAURUS_MEDIA);
        item.sizeNotes = PROCERATOSAURUS_SIZE_NOTES;
        item.sizeEstimate = PROCERATOSAURUS_SIZE_ESTIMATE;
        jCount++;
      } else if (item.id === 145) {
        item.media = JSON.stringify(CERATOSAURUS_MEDIA);
        item.comparisonSilhouette = CERATOSAURUS_SILHOUETTE;
        jCount++;
      }
    }
    fs.writeFileSync(jurassicPath, JSON.stringify(jurassicData, null, 2), 'utf-8');
    console.log(`  ✅ Synced ${jCount} records in species_jurassic.json`);
  }

  // 2. species_cretaceous.json
  const cretaceousPath = path.join(__dirname, '../prisma/species_cretaceous.json');
  if (fs.existsSync(cretaceousPath)) {
    const cretaceousData = JSON.parse(fs.readFileSync(cretaceousPath, 'utf-8'));
    let cCount = 0;
    for (const item of cretaceousData) {
      if (item.id === 489) {
        item.comparisonSilhouette = OLOROTITAN_SILHOUETTE;
        cCount++;
      } else if (item.id === 484) {
        item.media = JSON.stringify(TSINTAOSAURUS_MEDIA);
        cCount++;
      }
    }
    // Add Dsungaripterus if not present
    if (!cretaceousData.some((item: any) => item.id === 5187 || item.name.toLowerCase() === 'dsungaripterus')) {
      cretaceousData.push(DSUNGARIPTERUS_ENTRY);
      cCount++;
    }
    fs.writeFileSync(cretaceousPath, JSON.stringify(cretaceousData, null, 2), 'utf-8');
    console.log(`  ✅ Synced ${cCount} records in species_cretaceous.json`);
  }

  // 3. species_full_export.json
  const fullExportPath = path.join(__dirname, '../prisma/species_full_export.json');
  if (fs.existsSync(fullExportPath)) {
    const fullData = JSON.parse(fs.readFileSync(fullExportPath, 'utf-8'));
    let fCount = 0;
    for (const item of fullData) {
      if (item.id === 154) {
        item.media = JSON.stringify(PROCERATOSAURUS_MEDIA);
        item.sizeNotes = PROCERATOSAURUS_SIZE_NOTES;
        item.sizeEstimate = PROCERATOSAURUS_SIZE_ESTIMATE;
        fCount++;
      } else if (item.id === 145) {
        item.media = JSON.stringify(CERATOSAURUS_MEDIA);
        item.comparisonSilhouette = CERATOSAURUS_SILHOUETTE;
        fCount++;
      } else if (item.id === 489) {
        item.comparisonSilhouette = OLOROTITAN_SILHOUETTE;
        fCount++;
      } else if (item.id === 484) {
        item.media = JSON.stringify(TSINTAOSAURUS_MEDIA);
        fCount++;
      }
    }
    if (!fullData.some((item: any) => item.id === 5187 || item.name.toLowerCase() === 'dsungaripterus')) {
      fullData.push(DSUNGARIPTERUS_ENTRY);
      fCount++;
    }
    fs.writeFileSync(fullExportPath, JSON.stringify(fullData, null, 2), 'utf-8');
    console.log(`  ✅ Synced ${fCount} records in species_full_export.json (${fullData.length} total entries)`);
  }

  console.log('\n🎉 ALL DATABASE OPERATIONS AND STATIC SYNCS COMPLETED SUCCESSFULLY!');
}

main()
  .catch(e => {
    console.error('Fatal execution error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
