const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

async function uploadToSupabase(fileName, buffer, contentType) {
  const url = `${supabaseUrl}/storage/v1/object/species-silhouettes/${fileName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      'Content-Type': contentType,
      'x-upsert': 'true'
    },
    body: buffer
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload failed for ${fileName} (${res.status}): ${errText}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/species-silhouettes/${fileName}`;
}

const SINRAPTOR_DEF = {
  id: 5221,
  name: 'Sinraptor',
  scientificName: 'Sinraptor dongi',
  nameMeaning: 'Chinese thief of Dong Zhiming',
  timePeriod: 'Late Jurassic',
  epoch: 'Late Jurassic (Oxfordian)',
  myaStart: 161.0,
  myaEnd: 157.0,
  diet: 'carnivore',
  dietDetails: 'Apex carnivorous carnosaur preying on sauropods (such as Mamenchisaurus and Klamelisaurus) and stegosaurs like Jiangjunosaurus across semi-arid river basins.',
  habitat: 'terrestrial',
  clade: 'Theropod',
  taxonomicStatus: 'valid',
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Reptilia',
    clade: 'Dinosauria',
    order: 'Saurischia',
    suborder: 'Theropoda',
    clade_rank: 'Carnosauria',
    superfamily: 'Allosauroidea',
    family: 'Metriacanthosauridae',
    subfamily: 'Metriacanthosaurinae',
    genus: 'Sinraptor',
    species: 'Sinraptor dongi',
    source: 'Paleobiology Database (PBDB) + Currie & Zhao (1993)'
  }),
  geographicRange: JSON.stringify({
    continent: 'Asia',
    region: 'Junggar Basin, Xinjiang',
    country: 'China',
    fossilFormation: 'Shishugou Formation'
  }),
  sizeEstimate: JSON.stringify({
    length: { value: 7.6, unit: 'm', confidence: 'well-supported' },
    height: { value: 2.5, unit: 'm', confidence: 'well-supported' },
    weight: { value: 1300, unit: 'kg', confidence: 'estimated' }
  }),
  sizeNotes: 'Medium-to-large allosauroid carnosaur measuring approximately 7.6 meters (25 ft) in length and weighing roughly 1,000 to 1,500 kg based on holotype IVPP 10600.',
  sizeComparisonToHuman: true,
  silhouetteUuid: '3ee39f8e-9216-4fa4-abba-1d1d024b2c99',
  silhouetteCredit: 'James Neenan',
  silhouetteLicense: 'CC0 1.0 Universal Public Domain Dedication',
  silhouetteTaxon: 'Metriacanthosauridae (Sinraptoridae)',
  silhouetteTier: 'generic approximation, not species-specific',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Sinraptor_NT_%28no_bg%29.png',
      type: 'art',
      credit: 'Nobu Tamura (CC BY 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sinraptor_NT_(no_bg).png'
    }
  ]),
  discoveryHistory: 'Discovered in September 1987 in the Shishugou Formation of the Junggar Basin in Xinjiang, China during a joint expedition of the Dinosaur Project (China-Canada). Formally described in 1993 by Philip J. Currie and Zhao Xijin, naming the species in honor of distinguished Chinese paleontologist Dong Zhiming.',
  interestingFacts: JSON.stringify([
    'Despite having "raptor" in its name, Sinraptor is not a dromaeosaurid (like Velociraptor), but a formidable allosauroid carnosaur ancestral to later giant carnosaurs.',
    'The holotype specimen (IVPP 10600) is one of the most complete carnosaur skeletons ever found in Asia, preserving an articulated skull with delicate pneumatic features.',
    'Paleopathologists documented healed bite marks on the facial bones of the holotype, providing direct evidence of face-biting combat with other carnosaurs.',
    'Coexisted in the diverse Jurassic Shishugou ecosystem alongside the basal proceratosaurid tyrannosauroid Guanlong and the bizarre beaked herbivorous ceratosaur Limusaurus.'
  ]),
  extinctionEvent: 'Late Jurassic Faunal Turnover (~145 MYA)',
  closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)']),
  sources: JSON.stringify([
    {
      citation: "Currie, P. J., & Zhao, X. J. (1993). A new carnosaur (Dinosauria, Theropoda) from the Jurassic of Xinjiang, People's Republic of China. Canadian Journal of Earth Sciences, 30(10), 2037-2081.",
      url: 'https://doi.org/10.1139/e93-179'
    }
  ]),
  placeholder: false
};

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('AUDITED MIGRATION: INGEST SINRAPTOR (#5221)');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration database snapshot
  console.log('Step 1: Capturing pre-migration database snapshot...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Database baseline: ${allBefore.length} species.`);

  if (allBefore.length !== 590) {
    throw new Error(`Expected exactly 590 species before migration, found ${allBefore.length}!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preSnapshotPath = path.join(snapshotDir, `pre_sinraptor_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Upload vector silhouette to Supabase Storage
  console.log('Step 2: Uploading Sinraptor silhouette to Supabase Storage...');
  const silFileName = `${SINRAPTOR_DEF.silhouetteUuid}.svg`;
  let silPublicUrl = `${supabaseUrl}/storage/v1/object/public/species-silhouettes/${silFileName}`;

  try {
    const headRes = await fetch(silPublicUrl, { method: 'HEAD' });
    if (headRes.ok) {
      console.log(`  - Silhouette ${silFileName} already exists in Supabase.`);
    } else {
      console.log(`  - Downloading vector SVG from PhyloPic...`);
      const svgUrl = `https://images.phylopic.org/images/${SINRAPTOR_DEF.silhouetteUuid}/vector.svg`;
      const svgRes = await fetch(svgUrl);
      if (!svgRes.ok) throw new Error(`PhyloPic fetch failed: ${svgRes.status}`);
      const svgBuf = Buffer.from(await svgRes.arrayBuffer());
      silPublicUrl = await uploadToSupabase(silFileName, svgBuf, 'image/svg+xml');
      console.log(`    -> Uploaded to Supabase: ${silPublicUrl}`);
    }
  } catch (err) {
    console.warn(`    Warning checking/uploading: ${err.message}`);
  }

  const silhouettePayload = JSON.stringify({
    url: silPublicUrl,
    sourceUrl: `https://www.phylopic.org/images/${SINRAPTOR_DEF.silhouetteUuid}`,
    license: SINRAPTOR_DEF.silhouetteLicense,
    credit: SINRAPTOR_DEF.silhouetteCredit,
    taxon: SINRAPTOR_DEF.silhouetteTaxon,
    taxonMatch: SINRAPTOR_DEF.silhouetteTier
  });

  // STEP 3: Insert Sinraptor (Insert-Only Policy)
  console.log('\nStep 3: Inserting Sinraptor (ID 5221) via Insert-Only Policy...');
  const {
    silhouetteUuid,
    silhouetteCredit,
    silhouetteLicense,
    silhouetteTaxon,
    silhouetteTier,
    ...dbFields
  } = SINRAPTOR_DEF;

  const created = await prisma.species.create({
    data: {
      ...dbFields,
      comparisonSilhouette: silhouettePayload
    }
  });
  console.log(`  ✓ Inserted ID ${created.id}: ${created.name} (${created.scientificName})`);

  // STEP 4: Post-migration database snapshot & invariant validation
  console.log('\nStep 4: Capturing post-migration database snapshot & running invariant validation...');
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const postSnapshotPath = path.join(snapshotDir, `post_sinraptor_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== 591) {
    throw new Error(`Expected exactly 591 species after insertion, found ${allAfter.length}!`);
  }

  const sinraptorInDb = allAfter.find(s => s.id === 5221);
  if (!sinraptorInDb || sinraptorInDb.name !== 'Sinraptor') {
    throw new Error('Sinraptor missing from post-migration state!');
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
  console.log(`  - New species inserted: 1 (ID 5221: Sinraptor)`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetUntouched} / 590 (100.0%)`);

  if (unexpectedDiffs.length > 0) {
    console.error('\n❌ CRITICAL: Regressions detected:');
    unexpectedDiffs.forEach(d => console.error('    ✕ ' + d));
    throw new Error('Anti-regression safeguard invariant violated! Aborting.');
  }
  console.log('  ✅ 100% SAFEGUARD VERIFIED: Zero regressions detected across all non-target records.\n');

  // STEP 5: Synchronize Static JSON Archives
  console.log('Step 5: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // 1. species_full_export.json
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
  fullExport.push(sinraptorInDb);
  fs.writeFileSync(fullExportPath, JSON.stringify(fullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json (${fullExport.length} total records)`);

  // 2. species_jurassic.json
  const jurPath = path.join(prismaDir, 'species_jurassic.json');
  const jurJson = JSON.parse(fs.readFileSync(jurPath, 'utf8'));
  jurJson.push(sinraptorInDb);
  fs.writeFileSync(jurPath, JSON.stringify(jurJson, null, 2), 'utf8');
  console.log(`  ✓ Updated species_jurassic.json (${jurJson.length} total records)`);

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ ALL SINRAPTOR INGESTION OPERATIONS COMPLETED WITH 100% INVARIANT VERIFICATION!');
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
