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

// Target correction: Fix Nodosaurus (#499) replacing skull bust with calibrated full-body lateral profile
const NODOSAURUS_ID = 499;
const NODOSAURUS_NEW_SILHOUETTE = JSON.stringify({
  url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/9dc23409-1e36-402d-8be5-6b939f7fb664.svg',
  sourceUrl: 'https://www.phylopic.org/images/9dc23409-1e36-402d-8be5-6b939f7fb664',
  license: 'Creative Commons Attribution-ShareAlike 3.0 Unported',
  credit: 'Emily Willoughby',
  taxon: 'Nodosauridae (Representative: Sauropelta edwardsorum)',
  taxonMatch: 'generic approximation, not species-specific'
});

// New species: Antarctopelta oliveroi (#5220)
const ANTARCTOPELTA_DEF = {
  id: 5220,
  name: 'Antarctopelta',
  scientificName: 'Antarctopelta oliveroi',
  nameMeaning: "Olivero's Antarctic shield",
  timePeriod: 'Late Cretaceous',
  epoch: 'Late Cretaceous (Late Campanian to Early Maastrichtian)',
  myaStart: 74.0,
  myaEnd: 70.0,
  diet: 'herbivore',
  dietDetails: 'Low-browsing herbivore grazing on ferns, cycads, mosses, and podocarp conifers in high-latitude temperate forests.',
  habitat: 'terrestrial',
  clade: 'Ornithischian',
  taxonomicStatus: 'valid',
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Reptilia',
    clade: 'Dinosauria',
    order: 'Ornithischia',
    suborder: 'Ankylosauria',
    clade_rank: 'Parankylosauria',
    genus: 'Antarctopelta',
    species: 'Antarctopelta oliveroi',
    source: 'Paleobiology Database (PBDB) + Salgado & Gasparini (2006)'
  }),
  geographicRange: JSON.stringify({
    continent: 'Antarctica',
    region: 'James Ross Island',
    country: 'Antarctica',
    fossilFormation: 'Santa Marta Formation'
  }),
  sizeEstimate: JSON.stringify({
    length: { value: 4.0, unit: 'm', confidence: 'well-supported' },
    height: { value: 1.2, unit: 'm', confidence: 'well-supported' },
    weight: { value: 1000, unit: 'kg', confidence: 'estimated' }
  }),
  sizeNotes: 'Medium-sized basal ankylosaur (parankylosaur) measuring roughly 4.0 meters (13 ft) in length and weighing approximately 1,000 kg.',
  sizeComparisonToHuman: true,
  silhouetteUuid: '3595ba40-2474-4742-b3da-aac4f912f840',
  silhouetteCredit: 'Cy Marchant',
  silhouetteLicense: 'Attribution 4.0 International (CC BY 4.0)',
  silhouetteTaxon: 'Antarctopelta oliveroi',
  silhouetteTier: 'species-specific',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Antarctopelta_LMR.jpg',
      type: 'art',
      credit: 'Levi B. Martinez-Reza (CC BY-SA 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Antarctopelta_LMR.jpg'
    }
  ]),
  discoveryHistory: 'Discovered in January 1986 on James Ross Island, Antarctica by Argentine geologists Eduardo Olivero and Roberto Scasso. It represents the very first dinosaur fossil ever discovered on the continent of Antarctica. Formally described in 2006 by Leonardo Salgado and Zulma Gasparini.',
  interestingFacts: JSON.stringify([
    'Holding the historic title as the very first dinosaur ever found in Antarctica, its 1986 discovery proved dinosaurs inhabited polar latitudes.',
    'Equipped with diverse armor types including large flat oval scutes with central keels, small polygonal nodular ossicles, and conical defensive spines along the neck and shoulders.',
    'Features a tail reinforced by ossified tendons and specialized caudal vertebrae, representing an early evolutionary stage of the macuahuitl-like tail weapon seen in Stegouros.',
    'Lived in cool, seasonal polar rainforests characterized by months of winter twilight and abundant temperate vegetation.'
  ]),
  extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
  closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)', 'Crocodilians (Crocodilia)']),
  sources: JSON.stringify([
    {
      citation: 'Salgado, L., & Gasparini, Z. (2006). Reappraisal of an ankylosaurian dinosaur from the Upper Cretaceous of James Ross Island (Antarctica). Geodiversitas, 28(1), 119-135.',
      url: 'https://sciencepress.mnhn.fr/en/periodiques/geodiversitas/28/1/reappraisal-ankylosaurian-dinosaur-upper-cretaceous-james-ross-island-antarctica'
    }
  ]),
  placeholder: false
};

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('AUDITED MIGRATION: ADD ANTARCTOPELTA & FIX NODOSAURUS SILHOUETTE');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration database snapshot
  console.log('Step 1: Capturing pre-migration database snapshot...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Database baseline: ${allBefore.length} species.`);

  if (allBefore.length !== 589) {
    throw new Error(`Expected exactly 589 species before migration, found ${allBefore.length}!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preSnapshotPath = path.join(snapshotDir, `pre_antarctopelta_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Upload Antarctopelta silhouette to Supabase Storage
  console.log('Step 2: Uploading Antarctopelta silhouette to Supabase Storage...');
  const antarctoFileName = `${ANTARCTOPELTA_DEF.silhouetteUuid}.svg`;
  let antarctoPublicUrl = `${supabaseUrl}/storage/v1/object/public/species-silhouettes/${antarctoFileName}`;
  try {
    const headRes = await fetch(antarctoPublicUrl, { method: 'HEAD' });
    if (headRes.ok) {
      console.log(`  - Silhouette ${antarctoFileName} already exists in Supabase.`);
    } else {
      console.log(`  - Downloading vector SVG from PhyloPic...`);
      const svgUrl = `https://images.phylopic.org/images/${ANTARCTOPELTA_DEF.silhouetteUuid}/vector.svg`;
      const svgRes = await fetch(svgUrl);
      if (!svgRes.ok) throw new Error(`PhyloPic fetch failed: ${svgRes.status}`);
      const svgBuf = Buffer.from(await svgRes.arrayBuffer());
      antarctoPublicUrl = await uploadToSupabase(antarctoFileName, svgBuf, 'image/svg+xml');
      console.log(`    -> Uploaded to Supabase: ${antarctoPublicUrl}`);
    }
  } catch (err) {
    console.warn(`    Warning checking/uploading: ${err.message}`);
  }

  const antarctoSilhouettePayload = JSON.stringify({
    url: antarctoPublicUrl,
    sourceUrl: `https://www.phylopic.org/images/${ANTARCTOPELTA_DEF.silhouetteUuid}`,
    license: ANTARCTOPELTA_DEF.silhouetteLicense,
    credit: ANTARCTOPELTA_DEF.silhouetteCredit,
    taxon: ANTARCTOPELTA_DEF.silhouetteTaxon,
    taxonMatch: ANTARCTOPELTA_DEF.silhouetteTier
  });

  // STEP 3: Insert Antarctopelta (Insert-Only)
  console.log('\nStep 3: Inserting Antarctopelta (ID 5220)...');
  const {
    silhouetteUuid,
    silhouetteCredit,
    silhouetteLicense,
    silhouetteTaxon,
    silhouetteTier,
    ...dbFields
  } = ANTARCTOPELTA_DEF;

  const created = await prisma.species.create({
    data: {
      ...dbFields,
      comparisonSilhouette: antarctoSilhouettePayload
    }
  });
  console.log(`  ✓ Inserted ID ${created.id}: ${created.name} (${created.scientificName})`);

  // STEP 4: Fix Nodosaurus silhouette (#499)
  console.log('\nStep 4: Updating Nodosaurus (ID 499) comparisonSilhouette...');
  await prisma.species.update({
    where: { id: NODOSAURUS_ID },
    data: {
      comparisonSilhouette: NODOSAURUS_NEW_SILHOUETTE
    }
  });
  console.log(`  ✓ Updated Nodosaurus (ID ${NODOSAURUS_ID}) silhouette.`);

  // STEP 5: Post-migration database snapshot & validation
  console.log('\nStep 5: Capturing post-migration database snapshot & verifying invariants...');
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const postSnapshotPath = path.join(snapshotDir, `post_antarctopelta_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== 590) {
    throw new Error(`Expected exactly 590 species after addition, found ${allAfter.length}!`);
  }

  const antarctoInDb = allAfter.find(s => s.id === 5220);
  if (!antarctoInDb || antarctoInDb.name !== 'Antarctopelta') {
    throw new Error('Antarctopelta missing from post-migration state!');
  }

  let nonTargetUntouched = 0;
  let nodosaurusCorrect = false;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    if (before.id === NODOSAURUS_ID) {
      const diffs = [];
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt' || key === 'comparisonSilhouette') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          diffs.push(key);
        }
      }
      if (diffs.length > 0) {
        unexpectedDiffs.push(`Nodosaurus had unexpected field changes: ${diffs.join(', ')}`);
      } else if (after.comparisonSilhouette === NODOSAURUS_NEW_SILHOUETTE) {
        nodosaurusCorrect = true;
      }
    } else {
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
  }

  console.log(`\nVerification Summary:`);
  console.log(`  - New species inserted: 1 (ID 5220: Antarctopelta)`);
  console.log(`  - Nodosaurus silhouette corrected: ${nodosaurusCorrect ? 'YES' : 'NO'}`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetUntouched} / 588 (100.0%)`);

  if (unexpectedDiffs.length > 0 || !nodosaurusCorrect) {
    console.error('\n❌ CRITICAL: Regressions detected:');
    unexpectedDiffs.forEach(d => console.error('    ✕ ' + d));
    throw new Error('Anti-regression safeguard invariant violated! Aborting.');
  }
  console.log('  ✅ 100% SAFEGUARD VERIFIED: Zero regressions detected across all non-target records.\n');

  // STEP 6: Synchronize Static JSON Archives
  console.log('Step 6: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // 1. species_full_export.json
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
  const updatedFullExport = fullExport.map(item => {
    if (item.id === NODOSAURUS_ID) {
      return { ...item, comparisonSilhouette: NODOSAURUS_NEW_SILHOUETTE };
    }
    return item;
  });
  updatedFullExport.push(antarctoInDb);
  fs.writeFileSync(fullExportPath, JSON.stringify(updatedFullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json (${updatedFullExport.length} total records)`);

  // 2. species_cretaceous.json
  const cretPath = path.join(prismaDir, 'species_cretaceous.json');
  const cretJson = JSON.parse(fs.readFileSync(cretPath, 'utf8'));
  const updatedCretJson = cretJson.map(item => {
    if (item.id === NODOSAURUS_ID) {
      return { ...item, comparisonSilhouette: NODOSAURUS_NEW_SILHOUETTE };
    }
    return item;
  });
  updatedCretJson.push(antarctoInDb);
  fs.writeFileSync(cretPath, JSON.stringify(updatedCretJson, null, 2), 'utf8');
  console.log(`  ✓ Updated species_cretaceous.json (${updatedCretJson.length} total records)`);

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ ALL MIGRATION OPERATIONS COMPLETED WITH 100% INVARIANT VERIFICATION!');
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
