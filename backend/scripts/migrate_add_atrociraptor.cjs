const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const { GoogleGenAI } = require('@google/genai');

const prisma = new PrismaClient();

const apiKey = process.env.GEMINI_API_KEY;
const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

const ATROCIRAPTOR_DEF = {
  id: 5420,
  name: 'Atrociraptor',
  scientificName: 'Atrociraptor marshalli',
  nameMeaning: 'Savage robber of Wayne Marshall',
  timePeriod: 'Late Cretaceous',
  epoch: 'Late Cretaceous (Early Maastrichtian)',
  myaStart: 72.1,
  myaEnd: 71.0,
  diet: 'carnivore',
  dietDetails: 'Hypercarnivorous predator preying upon small vertebrates, juvenile hadrosaurs, ceratopsians, early mammals, and squamates, utilizing robust, deep jaws and enlarged recurved teeth specialized for crushing and delivering powerful bites compared to gracile dromaeosaurids.',
  habitat: 'terrestrial',
  clade: 'Theropod',
  taxonomicStatus: 'valid',
  geographicRange: JSON.stringify({
    continent: 'North America',
    region: 'Red Deer River Valley (Drumheller, Alberta)',
    country: 'Canada',
    fossilFormation: 'Horseshoe Canyon Formation (Horseshoe Canyon Member)',
    coordinates: [51.46, -112.71]
  }),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Reptilia',
    order: 'Saurischia',
    suborder: 'Theropoda',
    clade: 'Dromaeosauridae',
    subfamily: 'Saurornitholestinae',
    family: 'Dromaeosauridae',
    genus: 'Atrociraptor',
    species: 'Atrociraptor marshalli',
    source: 'Paleobiology Database (PBDB txn:132126) + Currie & Varricchio (2004)'
  }),
  sizeEstimate: JSON.stringify({
    length: { value: 1.8, unit: 'm', confidence: 'estimated' },
    height: { value: 0.6, unit: 'm', confidence: 'estimated' },
    weight: { value: 15, unit: 'kg', confidence: 'estimated' }
  }),
  sizeNotes: 'Small, powerfully built dromaeosaurid theropod measuring approximately 1.8 to 2.0 meters (6 to 6.6 ft) in total length, standing 0.6 meters at the hip, with an estimated body mass of roughly 15 kg (33 lbs). Distinguished from other dromaeosaurs by its unusually deep, robust snout and enlarged recurved dentition.',
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/8d1c194f-3bf7-4114-a32e-5b895167a017.svg',
    sourceUrl: 'https://www.phylopic.org/images/8d1c194f-3bf7-4114-a32e-5b895167a017',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    credit: 'Richard Rich',
    taxon: 'Dromaeosauridae (Representative: Saurornitholestinae / Dromaeosauridae)',
    taxonMatch: 'generic approximation, not species-specific'
  }),
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Atrociraptor.jpg',
      type: 'art',
      credit: 'FunkMonk (CC BY-SA 3.0 / GFDL)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Atrociraptor.jpg'
    }
  ]),
  discoveryHistory: 'Discovered in 1995 by collector Wayne Marshall in the Horseshoe Canyon Member of the Horseshoe Canyon Formation near Drumheller, Alberta, Canada. The holotype specimen (RTMP 95.166.1) includes both premaxillae, a right maxilla, dentaries, teeth, and numerous cranial fragments. The specimen was formally described and named Atrociraptor marshalli in 2004 by renowned Canadian paleontologist Philip J. Currie and American paleontologist David J. Varricchio.',
  interestingFacts: JSON.stringify([
    'Unlike the long, shallow snouts of Velociraptor and Saurornitholestes, Atrociraptor possessed an exceptionally short, deep, and heavily built facial skeleton engineered for generating elevated bite forces.',
    'Its teeth were unusually large, strongly recurved, and oriented at a pronounced angle within the jaw, featuring isodont serrations specialized for delivering high-stress shearing bites into tough vertebrate tissue.',
    'Discovered in 1995 near Drumheller along the Red Deer River in Alberta, a region famously known for yielding world-class Upper Cretaceous dinosaur fossil assemblages.',
    'Cladistic analyses by Currie and Varricchio (2004), Longrich and Currie (2009), and Evans et al. (2013) classify Atrociraptor within the dromaeosaurid subfamily Saurornitholestinae alongside Saurornitholestes and Bambiraptor.',
    'Coexisted within the humid subtropical coastal lowlands of the Western Interior Seaway alongside the apex tyrannosaurid Albertosaurus sarcophagus, the hadrosaur Edmontosaurus regalis, and the ceratopsian Pachyrhinosaurus.'
  ]),
  extinctionEvent: 'K-Pg extinction event (66 MYA)',
  closestLivingRelatives: JSON.stringify({
    status: 'established',
    groups: [
      'Modern Birds (Aves / Neornithes - direct surviving avian theropods)',
      'Crocodilians (Crocodilia - closest living non-dinosaurian outgroup)'
    ],
    rationale: 'Aves (modern birds) are biologically surviving avian theropod dinosaurs, nested within Coelurosauria / Maniraptora / Paraves. Crocodilians represent the nearest extant sister outgroup to Dinosauria.',
    ecologicalAnalogues: [
      'Ground Hornbills & Secretarybirds (Bucorvidae & Sagittariidae - terrestrial pursuit predators)',
      'Medium Raptors & Birds of Prey (Accipitridae & Falconidae - raptorial carnivorous hunting)'
    ],
    sources: [
      {
        title: 'Currie, P. J., & Varricchio, D. J. (2004). A new dromaeosaurid from the Horseshoe Canyon Formation (Upper Cretaceous) of Alberta, Canada. Feathered Dragons: Studies on the Transition from Dinosaurs to Birds, 112-132.',
        url_or_doi: 'https://doc.rero.ch/record/14330'
      },
      {
        title: 'Brusatte, S. L., et al. (2014). Gradual Assembly of Avian Body Plan Culminated in Rapid Diversification of Dinosaur Lineage. Current Biology, 24(20), 2386-2392.',
        url_or_doi: 'https://doi.org/10.1016/j.cub.2014.08.034'
      }
    ],
    verified: true
  }),
  sources: JSON.stringify([
    {
      citation: 'Currie, P. J., & Varricchio, D. J. (2004). A new dromaeosaurid from the Horseshoe Canyon Formation (Upper Cretaceous) of Alberta, Canada. Feathered Dragons, 112-132.',
      url: 'https://doc.rero.ch/record/14330'
    },
    {
      citation: 'Paleobiology Database (PBDB) taxon record txn:132126',
      url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=132126'
    },
    {
      citation: 'Longrich, N. R., & Currie, P. J. (2009). A microraptorine (Dinosauria-Dromaeosauridae) from the Late Cretaceous of North America. PNAS, 106(13), 5002-5007.',
      url: 'https://doi.org/10.1073/pnas.0811664106'
    }
  ]),
  placeholder: false
};

function buildEmbeddingText(s) {
  let factsStr = '';
  try {
    const facts = JSON.parse(s.interestingFacts || '[]');
    if (Array.isArray(facts)) factsStr = facts.join(' ');
  } catch {
    factsStr = s.interestingFacts || '';
  }

  let geoStr = '';
  try {
    const geo = JSON.parse(s.geographicRange || '{}');
    geoStr = [geo.region, geo.country, geo.fossilFormation].filter(Boolean).join(', ');
  } catch {
    geoStr = s.geographicRange || '';
  }

  return `Species: ${s.name} (${s.scientificName}). Clade: ${s.clade}. Diet: ${s.diet} - ${s.dietDetails}. Habitat: ${s.habitat}. Time Period: ${s.timePeriod} (${s.epoch || ''}), living approximately ${s.myaStart} to ${s.myaEnd} million years ago. Geographic Range / Formations: ${geoStr}. Discovery & Paleobiology: ${s.discoveryHistory}. Key Facts: ${factsStr}. Size: ${s.sizeNotes}.`.slice(0, 1800);
}

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('AUDITED MIGRATION: INGEST ATROCIRAPTOR MARSHALLI (#5420)');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration database snapshot & invariant baseline check
  console.log('Step 1: Capturing pre-migration database snapshot...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Database baseline: ${allBefore.length} species.`);

  if (allBefore.length !== 789) {
    throw new Error(`Expected exactly 789 species before migration, found ${allBefore.length}!`);
  }

  const existingAtroci = allBefore.find(s => s.name.toLowerCase() === 'atrociraptor' || s.scientificName.toLowerCase() === 'atrociraptor marshalli');
  if (existingAtroci) {
    throw new Error(`Atrociraptor already exists in database with ID ${existingAtroci.id}!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preSnapshotPath = path.join(snapshotDir, `pre_atrociraptor_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Insert Atrociraptor (Insert-Only Policy)
  console.log('Step 2: Inserting Atrociraptor (ID 5420) via Insert-Only Policy...');
  const created = await prisma.species.create({
    data: ATROCIRAPTOR_DEF
  });
  console.log(`  ✓ Inserted ID ${created.id}: ${created.name} (${created.scientificName})`);

  // Update autoincrement sequence to max id
  try {
    await prisma.$executeRawUnsafe("SELECT setval(pg_get_serial_sequence('\"Species\"', 'id'), (SELECT MAX(id) FROM \"Species\"));");
    console.log('  ✓ PostgreSQL autoincrement sequence synced to MAX(id).');
  } catch (seqErr) {
    console.warn(`  ! Sequence sync note: ${seqErr.message}`);
  }

  // STEP 3: Post-migration database snapshot & invariant validation
  console.log('\nStep 3: Capturing post-migration database snapshot & running invariant validation...');
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const postSnapshotPath = path.join(snapshotDir, `post_atrociraptor_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== 790) {
    throw new Error(`Expected exactly 790 species after insertion, found ${allAfter.length}!`);
  }

  const atrociInDb = allAfter.find(s => s.id === 5420);
  if (!atrociInDb || atrociInDb.name !== 'Atrociraptor') {
    throw new Error('Atrociraptor missing or corrupted in post-migration state!');
  }

  let nonTargetUntouched = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    const diffs = [];
    for (const key of Object.keys(before)) {
      if (key === 'updatedAt') continue;
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        diffs.push(key);
      }
    }
    if (diffs.length > 0) {
      unexpectedDiffs.push(`NON-TARGET ID ${before.id} (${before.name}) was modified! Fields: ${diffs.join(', ')}`);
    } else {
      nonTargetUntouched++;
    }
  }

  console.log(`\nVerification Summary:`);
  console.log(`  - New species inserted: 1 (ID 5420: Atrociraptor)`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetUntouched} / 789 (100.0%)`);

  if (unexpectedDiffs.length > 0) {
    console.error('\n❌ CRITICAL: Regressions detected:');
    unexpectedDiffs.forEach(d => console.error('    ✕ ' + d));
    throw new Error('Anti-regression safeguard invariant violated! Aborting.');
  }
  console.log('  ✅ 100% SAFEGUARD VERIFIED: Zero regressions detected across all non-target records.\n');

  // STEP 4: Generate pgvector Semantic Embedding
  console.log('Step 4: Generating pgvector semantic embedding for Atrociraptor (#5420)...');
  if (aiClient) {
    try {
      const textToEmbed = buildEmbeddingText(atrociInDb);
      const res = await aiClient.models.embedContent({
        model: 'gemini-embedding-2',
        contents: textToEmbed,
        config: { outputDimensionality: 768 }
      });
      const vector = res.embeddings?.[0]?.values;
      if (vector && Array.isArray(vector)) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "SpeciesEmbedding" ("speciesId", "content", "embedding")
           VALUES ($1, $2, $3::vector)
           ON CONFLICT ("speciesId") DO UPDATE 
           SET "content" = EXCLUDED."content", "embedding" = EXCLUDED."embedding";`,
          atrociInDb.id,
          textToEmbed,
          `[${vector.join(',')}]`
        );
        console.log('  ✓ pgvector semantic embedding successfully stored in SpeciesEmbedding table.');
      }
    } catch (embedErr) {
      console.warn(`  ! Note on embedding generation: ${embedErr.message}`);
    }
  } else {
    console.warn('  ! GEMINI_API_KEY not set; skipping vector embedding.');
  }

  // STEP 5: Synchronize Static JSON Archives
  console.log('\nStep 5: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // 1. species_full_export.json
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
  fullExport.push(atrociInDb);
  fullExport.sort((a, b) => a.id - b.id);
  fs.writeFileSync(fullExportPath, JSON.stringify(fullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json (${fullExport.length} total records)`);

  // 2. species_cretaceous.json
  const crePath = path.join(prismaDir, 'species_cretaceous.json');
  const creJson = JSON.parse(fs.readFileSync(crePath, 'utf8'));
  creJson.push(atrociInDb);
  creJson.sort((a, b) => a.id - b.id);
  fs.writeFileSync(crePath, JSON.stringify(creJson, null, 2), 'utf8');
  console.log(`  ✓ Updated species_cretaceous.json (${creJson.length} total records)`);

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ ALL ATROCIRAPTOR INGESTION OPERATIONS COMPLETED WITH 100% INVARIANT VERIFICATION!');
  console.log('════════════════════════════════════════════════════════════════════════════\n');
}

main()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
