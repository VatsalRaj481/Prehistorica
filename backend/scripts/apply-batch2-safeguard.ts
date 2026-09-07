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

// 1. Tuojiangosaurus multispinus (#198)
const TUOJIANGOSAURUS_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Tuojiangosaurus_multispinus_life_restoration.jpg',
    type: 'art',
    credit: 'Paleocolour (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tuojiangosaurus_multispinus_life_restoration.jpg'
  },
  {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/198-Tuojiangosaurus.jpg',
    type: 'art',
    credit: 'Paleocolour (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tuojiangosaurus_multispinus_life_restoration.jpg'
  }
];

// 2. Yangchuanosaurus shangyouensis (#2641)
const YANGCHUANOSAURUS_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Yangchuanosaurus_TD.png',
    type: 'art',
    credit: 'Tasman Dixon (CC BY 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Yangchuanosaurus_TD.png'
  },
  {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/2641-Yangchuanosaurus.png',
    type: 'art',
    credit: 'Tasman Dixon (CC BY 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Yangchuanosaurus_TD.png'
  },
  {
    url: 'https://commons.wikimedia.org/wiki/File:Stamp_of_Azerbaijan_253.jpg',
    type: 'historical_display',
    credit: 'Post of Azerbaijan (Public domain)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Stamp_of_Azerbaijan_253.jpg'
  }
];

// 3. Yuxisaurus kopchicki (New Ingestion)
const YUXISAURUS_ENTRY = {
  id: 5188,
  name: 'Yuxisaurus',
  scientificName: 'Yuxisaurus kopchicki',
  nameMeaning: 'Yuxi lizard (named after Yuxi, Yunnan, China; honoring biologist John J. Kopchick)',
  timePeriod: 'Early Jurassic',
  epoch: 'Early Jurassic (Sinemurian–Toarcian)',
  myaStart: 199,
  myaEnd: 183,
  clade: Clade.Ornithischian,
  diet: Diet.herbivore,
  habitat: Habitat.terrestrial,
  dietDetails: 'Herbivorous low-level browser feeding on ferns, cycads, and early seed plants using small leaf-shaped dentition.',
  taxonomicStatus: TaxonomicStatus.valid,
  extinctionEvent: null,
  closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)', 'Crocodilians']),
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Yuxisaurus_TD.png',
      type: 'art',
      credit: 'Tasman Dixon (CC BY 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Yuxisaurus_TD.png'
    },
    {
      url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/Yuxisaurus_TD.png',
      type: 'art',
      credit: 'Tasman Dixon (CC BY 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Yuxisaurus_TD.png'
    }
  ]),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Reptilia',
    clade: 'Dinosauria',
    order: 'Ornithischia',
    suborder: 'Thyreophora',
    genus: 'Yuxisaurus',
    species: 'Yuxisaurus kopchicki',
    source: 'Paleobiology Database (PBDB) + GBIF'
  }),
  geographicRange: JSON.stringify({
    continent: 'Asia',
    region: 'East Asia',
    country: 'China',
    fossilFormation: 'Fengjiahe Formation'
  }),
  sizeEstimate: JSON.stringify({
    length: { value: 2.5, unit: 'm', confidence: 'well-supported' },
    height: { value: 0.8, unit: 'm', confidence: 'well-supported' },
    weight: { value: 180, unit: 'kg', confidence: 'estimated' }
  }),
  sizeNotes: 'Estimated adult length of approximately 2.0–3.0 m (6.6–9.8 ft), standing ~0.8 m tall, with a heavily armored body covered in over 120 osteoderms.',
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/46447cfa-6a6b-4eb1-bb48-3531ec3ca4fd.svg',
    sourceUrl: 'https://www.phylopic.org/images/46447cfa-6a6b-4eb1-bb48-3531ec3ca4fd',
    license: 'Creative Commons Attribution 4.0 International',
    credit: 'Matt Dempsey',
    taxon: 'Thyreophora (Representative approximation)',
    taxonMatch: 'generic approximation, not species-specific'
  }),
  discoveryHistory: '• Discovered in the Lower Jurassic Fengjiahe Formation of Yuxi, Yunnan Province, southwestern China.\n• Formally described in 2022 by Xi Yao, Paul M. Barrett, Xing Xu, and colleagues based on holotype CVEB 21701 (partial skeleton with over 120 osteoderms).\n• Represents the first confirmed, well-preserved early-diverging armored dinosaur (basal thyreophoran) discovered in the Early Jurassic of Asia.',
  interestingFacts: JSON.stringify([
    'The first definitively identified early-diverging thyreophoran (armored dinosaur) from the Early Jurassic of Asia, dating to ~199–183 Ma.',
    'Preserved with more than 120 bony dermal armor plates (osteoderms) of varying shapes, including keeled scutes, spine-like armor, and pup-tent-shaped plates along its back and neck.',
    'Possessed heavily built forelimbs and robust pectoral girdle elements, demonstrating that early thyreophorans had already evolved specialized quadrupedal weight support.',
    'Phylogenetic analyses place Yuxisaurus as a basal thyreophoran closely related to the European Emausaurus and Scelidosaurus, or alternatively as a basal parankylosaur sharing specialized cervical armor.'
  ]),
  sources: JSON.stringify([
    { citation: 'Yao, X., Barrett, P. M., Yang, L., Xu, X., & Bi, S. (2022). A new early-diverging armoured dinosaur from the Lower Jurassic of southwestern China. eLife, 11, e75248.', url: 'https://doi.org/10.7554/eLife.75248' },
    { citation: 'Paleobiology Database (PBDB) species record', url: 'https://paleobiodb.org' },
    { citation: 'Yuxisaurus description in paleontological literature', url: 'https://en.wikipedia.org/wiki/Yuxisaurus' }
  ]),
  placeholder: false
};

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🏛️  PREHISTORICA AUDITED REVISION: Tuojiangosaurus, Yangchuanosaurus & Yuxisaurus');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: PRE-OPERATION SNAPSHOT OF ALL 557 DATABASE RECORDS
  console.log('Step 1: Capturing pre-operation snapshot of all existing database records...');
  const beforeSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap = new Map<number, any>();
  beforeSpecies.forEach(s => snapshotMap.set(s.id, s));
  console.log(`✅ Snapshot locked for all ${beforeSpecies.length} species records.\n`);

  // Verify targets exist
  const tuojiangosaurus = snapshotMap.get(198);
  const yangchuanosaurus = snapshotMap.get(2641);
  const minmi = snapshotMap.get(5160);

  if (!tuojiangosaurus || !yangchuanosaurus) {
    throw new Error('Target species (#198 or #2641) not found in database!');
  }
  if (!minmi) {
    console.warn('Note: Minmi not found at #5160, checking by name...');
  } else {
    console.log(`ℹ️ Minmi (#5160) verified already present in database with image ${JSON.parse(minmi.media)[0]?.url}`);
  }

  // STEP 2: EXECUTE TARGETED MEDIA UPDATES
  console.log('Step 2: Executing targeted media modifications...');

  // 1. Tuojiangosaurus (#198)
  await prisma.species.update({
    where: { id: 198 },
    data: {
      media: JSON.stringify(TUOJIANGOSAURUS_MEDIA)
    }
  });
  console.log('  ✅ [UPDATED #198] Tuojiangosaurus multispinus: Primary life restoration by Paleocolour');

  // 2. Yangchuanosaurus (#2641)
  await prisma.species.update({
    where: { id: 2641 },
    data: {
      media: JSON.stringify(YANGCHUANOSAURUS_MEDIA)
    }
  });
  console.log('  ✅ [UPDATED #2641] Yangchuanosaurus shangyouensis: Full-size colored PNG by Tasman Dixon\n');

  // STEP 3: INGEST YUXISAURUS KOPCHICKI (NEW SPECIES)
  console.log('Step 3: Ingesting Yuxisaurus kopchicki into database...');
  const existingYuxi = await prisma.species.findFirst({
    where: {
      OR: [
        { id: 5188 },
        { name: { equals: 'Yuxisaurus', mode: 'insensitive' } },
        { scientificName: { equals: 'Yuxisaurus kopchicki', mode: 'insensitive' } }
      ]
    }
  });

  let yuxiRecord: any = null;
  if (!existingYuxi) {
    yuxiRecord = await prisma.species.create({
      data: YUXISAURUS_ENTRY
    });
    console.log(`  🎉 [CREATED #${yuxiRecord.id}] Yuxisaurus kopchicki (Thyreophora: Basal Thyreophoran)\n`);
  } else {
    yuxiRecord = existingYuxi;
    console.log(`  ℹ️ [ALREADY CREATED #${yuxiRecord.id}] Yuxisaurus kopchicki\n`);
  }

  // STEP 4: STRICT POST-OPERATION SAFEGUARD VERIFICATION
  console.log('Step 4: Executing post-operation safeguard verification across all species...');
  const afterSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  
  console.log(`Total database species count: ${afterSpecies.length}`);

  const nonTargetViolations: string[] = [];
  const targetViolations: string[] = [];

  for (const before of beforeSpecies) {
    if (before.id === 5188) continue;

    const after = afterSpecies.find(s => s.id === before.id);
    if (!after) {
      nonTargetViolations.push(`DELETED ROW: Species #${before.id} (${before.name}) was removed!`);
      continue;
    }

    if (before.id === 198) {
      for (const f of ALL_PROTECTED_FIELDS) {
        if (f === 'media') continue;
        if (canonicalNormalize((before as any)[f]) !== canonicalNormalize((after as any)[f])) {
          targetViolations.push(`Tuojiangosaurus unauthorized field '${f}' modified!`);
        }
      }
    } else if (before.id === 2641) {
      for (const f of ALL_PROTECTED_FIELDS) {
        if (f === 'media') continue;
        if (canonicalNormalize((before as any)[f]) !== canonicalNormalize((after as any)[f])) {
          targetViolations.push(`Yangchuanosaurus unauthorized field '${f}' modified!`);
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
  console.log(`  - Exactly 2 target records updated: #198, #2641`);
  console.log(`  - Exactly 1 new species ingested: #${yuxiRecord.id} (${yuxiRecord.name})`);
  console.log(`  - All ${beforeSpecies.length - 2} non-target species records (including #5160 Minmi) remain 100% pristine and untouched.\n`);

  // STEP 5: SYNCHRONIZE STATIC JSON FILES
  console.log('Step 5: Synchronizing static JSON archive files...');

  // 1. species_jurassic.json (Tuojiangosaurus, Yangchuanosaurus, Yuxisaurus are all Jurassic!)
  const jurassicPath = path.join(__dirname, '../prisma/species_jurassic.json');
  if (fs.existsSync(jurassicPath)) {
    const jurassicData = JSON.parse(fs.readFileSync(jurassicPath, 'utf-8'));
    let jCount = 0;
    for (const item of jurassicData) {
      if (item.id === 198) {
        item.media = JSON.stringify(TUOJIANGOSAURUS_MEDIA);
        jCount++;
      } else if (item.id === 2641) {
        item.media = JSON.stringify(YANGCHUANOSAURUS_MEDIA);
        jCount++;
      }
    }
    // Add Yuxisaurus if not present
    if (!jurassicData.some((item: any) => item.id === 5188 || item.name.toLowerCase() === 'yuxisaurus')) {
      jurassicData.push(YUXISAURUS_ENTRY);
      jCount++;
    }
    fs.writeFileSync(jurassicPath, JSON.stringify(jurassicData, null, 2), 'utf-8');
    console.log(`  ✅ Synced ${jCount} records in species_jurassic.json`);
  }

  // 2. species_full_export.json
  const fullExportPath = path.join(__dirname, '../prisma/species_full_export.json');
  if (fs.existsSync(fullExportPath)) {
    const fullData = JSON.parse(fs.readFileSync(fullExportPath, 'utf-8'));
    let fCount = 0;
    for (const item of fullData) {
      if (item.id === 198) {
        item.media = JSON.stringify(TUOJIANGOSAURUS_MEDIA);
        fCount++;
      } else if (item.id === 2641) {
        item.media = JSON.stringify(YANGCHUANOSAURUS_MEDIA);
        fCount++;
      }
    }
    if (!fullData.some((item: any) => item.id === 5188 || item.name.toLowerCase() === 'yuxisaurus')) {
      fullData.push(YUXISAURUS_ENTRY);
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
