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

const ORNITHOMIMUS_DEF = {
  id: 5222,
  name: 'Ornithomimus',
  scientificName: 'Ornithomimus velox',
  nameMeaning: 'Swift bird mimic',
  timePeriod: 'Late Cretaceous',
  epoch: 'Late Cretaceous (Late Campanian to Maastrichtian)',
  myaStart: 76.5,
  myaEnd: 66.0,
  diet: 'omnivore',
  dietDetails: 'Omnivorous forager consuming seeds, fruits, foliage, insects, and small vertebrates using a specialized shearing keratinous beak.',
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
    infraorder: 'Ornithomimosauria',
    family: 'Ornithomimidae',
    genus: 'Ornithomimus',
    species: 'Ornithomimus velox',
    source: 'Paleobiology Database (PBDB) + Marsh (1890)'
  }),
  geographicRange: JSON.stringify({
    continent: 'North America',
    region: 'Alberta / Colorado / Montana / Wyoming',
    country: 'Canada, United States',
    fossilFormation: 'Dinosaur Park Formation, Horseshoe Canyon Formation, Denver Formation'
  }),
  sizeEstimate: JSON.stringify({
    length: { value: 3.8, unit: 'm', confidence: 'well-supported' },
    height: { value: 1.5, unit: 'm', confidence: 'well-supported' },
    weight: { value: 170, unit: 'kg', confidence: 'estimated' }
  }),
  sizeNotes: 'Slender, cursorial ornithomimid measuring roughly 3.5 to 4.0 meters (11.5 to 13 ft) in length and weighing approximately 150 to 180 kg.',
  sizeComparisonToHuman: true,
  silhouetteUuid: 'b778f21e-0415-4990-b7be-27dc3ce21405',
  silhouetteCredit: 'Christiana Garros',
  silhouetteLicense: 'Attribution 4.0 International (CC BY 4.0)',
  silhouetteTaxon: 'Ornithomimus',
  silhouetteTier: 'genus-specific',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Ornithomimus_TD.png',
      type: 'art',
      credit: 'TotalDino (CC BY-SA 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ornithomimus_TD.png'
    }
  ]),
  discoveryHistory: 'First described in 1890 by American paleontologist Othniel Charles Marsh based on limb bones from the Denver Formation of Colorado. Remarkable complete skeletons—including specimens preserving soft-tissue plumage impressions and skin—were later unearthed in Dinosaur Provincial Park and along the Red Deer River in Alberta, Canada.',
  interestingFacts: JSON.stringify([
    'Groundbreaking 2012 fossil discoveries from Alberta provided the first definitive physical evidence of feathered dinosaurs in North America, preserving filamentous plumage and pennibrachia (wing feathers).',
    'Ontogenetic studies revealed that while juveniles possessed down-like protofeathers, only adult Ornithomimus grew pennaceous wing feathers, indicating wings originally evolved for courtship display or egg brooding rather than flight.',
    'Built for extreme sprinting, its elongated tibiae, fused metatarsals, and hollow bones enabled speeds estimated up to 50–70 km/h (30–45 mph), making it one of the fastest dinosaurs.',
    'Possessed a toothless, keratinous rhamphotheca with delicate internal ridges resembling modern waterfowl, indicating an opportunistic omnivorous diet of vegetation, seeds, and small animals.'
  ]),
  extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
  closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)']),
  sources: JSON.stringify([
    {
      citation: 'Marsh, O. C. (1890). Description of new dinosaurian reptiles. The American Journal of Science, 39(229), 81-86.',
      url: 'https://doi.org/10.2475/ajs.s3-39.229.81'
    },
    {
      citation: 'Zelenitsky, D. K., Therrien, F., Erickson, G. M., et al. (2012). Feathered dinosaurs from North America provide insight into wing origins. Science, 338(6106), 510-514.',
      url: 'https://doi.org/10.1126/science.1225376'
    }
  ]),
  placeholder: false
};

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('AUDITED MIGRATION: INGEST ORNITHOMIMUS (#5222)');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration database snapshot
  console.log('Step 1: Capturing pre-migration database snapshot...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Database baseline: ${allBefore.length} species.`);

  if (allBefore.length !== 591) {
    throw new Error(`Expected exactly 591 species before migration, found ${allBefore.length}!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preSnapshotPath = path.join(snapshotDir, `pre_ornithomimus_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Upload vector silhouette to Supabase Storage
  console.log('Step 2: Uploading Ornithomimus silhouette to Supabase Storage...');
  const silFileName = `${ORNITHOMIMUS_DEF.silhouetteUuid}.svg`;
  let silPublicUrl = `${supabaseUrl}/storage/v1/object/public/species-silhouettes/${silFileName}`;

  try {
    const headRes = await fetch(silPublicUrl, { method: 'HEAD' });
    if (headRes.ok) {
      console.log(`  - Silhouette ${silFileName} already exists in Supabase.`);
    } else {
      console.log(`  - Downloading vector SVG from PhyloPic...`);
      const svgUrl = `https://images.phylopic.org/images/${ORNITHOMIMUS_DEF.silhouetteUuid}/vector.svg`;
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
    sourceUrl: `https://www.phylopic.org/images/${ORNITHOMIMUS_DEF.silhouetteUuid}`,
    license: ORNITHOMIMUS_DEF.silhouetteLicense,
    credit: ORNITHOMIMUS_DEF.silhouetteCredit,
    taxon: ORNITHOMIMUS_DEF.silhouetteTaxon,
    taxonMatch: ORNITHOMIMUS_DEF.silhouetteTier
  });

  // STEP 3: Insert Ornithomimus (Insert-Only Policy)
  console.log('\nStep 3: Inserting Ornithomimus (ID 5222) via Insert-Only Policy...');
  const {
    silhouetteUuid,
    silhouetteCredit,
    silhouetteLicense,
    silhouetteTaxon,
    silhouetteTier,
    ...dbFields
  } = ORNITHOMIMUS_DEF;

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
  const postSnapshotPath = path.join(snapshotDir, `post_ornithomimus_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== 592) {
    throw new Error(`Expected exactly 592 species after insertion, found ${allAfter.length}!`);
  }

  const ornithomimusInDb = allAfter.find(s => s.id === 5222);
  if (!ornithomimusInDb || ornithomimusInDb.name !== 'Ornithomimus') {
    throw new Error('Ornithomimus missing from post-migration state!');
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
  console.log(`  - New species inserted: 1 (ID 5222: Ornithomimus)`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetUntouched} / 591 (100.0%)`);

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
  fullExport.push(ornithomimusInDb);
  fs.writeFileSync(fullExportPath, JSON.stringify(fullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json (${fullExport.length} total records)`);

  // 2. species_cretaceous.json
  const cretPath = path.join(prismaDir, 'species_cretaceous.json');
  const cretJson = JSON.parse(fs.readFileSync(cretPath, 'utf8'));
  cretJson.push(ornithomimusInDb);
  fs.writeFileSync(cretPath, JSON.stringify(cretJson, null, 2), 'utf8');
  console.log(`  ✓ Updated species_cretaceous.json (${cretJson.length} total records)`);

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ ALL ORNITHOMIMUS INGESTION OPERATIONS COMPLETED WITH 100% INVARIANT VERIFICATION!');
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
