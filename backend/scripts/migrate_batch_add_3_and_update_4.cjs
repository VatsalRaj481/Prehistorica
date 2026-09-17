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

// 1. Existing target updates
const EXISTING_UPDATES = [
  {
    id: 53,
    name: 'Shonisaurus',
    scientificName: 'Shonisaurus popularis',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = typeof currentMediaStr === 'string' ? JSON.parse(currentMediaStr) : (currentMediaStr || []); } catch(e){}
      const nonArt = mediaArr.filter(m => m.type !== 'art');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Shonisaurus_BW_2.jpg',
        type: 'art',
        credit: 'Nobu Tamura (CC BY 2.5)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Shonisaurus_BW_2.jpg'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  },
  {
    id: 3154,
    name: 'Geosaurus giganteus',
    scientificName: 'Geosaurus giganteus',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = typeof currentMediaStr === 'string' ? JSON.parse(currentMediaStr) : (currentMediaStr || []); } catch(e){}
      const nonArt = mediaArr.filter(m => m.type !== 'art');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Geosaurus_giganteus.png',
        type: 'art',
        credit: 'Mark T. Young et al. (CC BY 2.5)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Geosaurus_giganteus.png'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  },
  {
    id: 3155,
    name: 'Metriorhynchus geoffroyii',
    scientificName: 'Metriorhynchus geoffroyii',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = typeof currentMediaStr === 'string' ? JSON.parse(currentMediaStr) : (currentMediaStr || []); } catch(e){}
      const nonArt = mediaArr.filter(m => m.type !== 'art');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Metriorhynchus_BW.jpg',
        type: 'art',
        credit: 'Nobu Tamura (CC BY 2.5)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Metriorhynchus_BW.jpg'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  },
  {
    id: 3170,
    name: 'Plesiosuchus manselii',
    scientificName: 'Plesiosuchus manselii',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = typeof currentMediaStr === 'string' ? JSON.parse(currentMediaStr) : (currentMediaStr || []); } catch(e){}
      const nonArt = mediaArr.filter(m => m.type !== 'art');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Plesiosuchus_restoration.png',
        type: 'art',
        credit: 'Mark T. Young et al. (CC BY 2.5)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Plesiosuchus_restoration.png'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  }
];

// 2. New species additions
const NEW_SPECIES_DEFS = [
  {
    id: 5193,
    name: 'Dakosaurus',
    scientificName: 'Dakosaurus maximus',
    nameMeaning: 'Biter lizard (Greek "dakos" meaning biter + "sauros" lizard)',
    timePeriod: 'Late Jurassic',
    epoch: 'Late Jurassic (Kimmeridgian to Tithonian)',
    myaStart: 157.3,
    myaEnd: 145.0,
    diet: 'carnivore',
    dietDetails: 'Apex marine macropredator with serrated ziphodont teeth adapted for severing flesh and preying on other marine reptiles and large cephalopods.',
    habitat: 'marine',
    clade: 'Crocodylomorph',
    taxonomicStatus: 'valid',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Archosauria',
      order: 'Crocodylomorpha',
      suborder: 'Thalattosuchia',
      family: 'Metriorhynchidae',
      subfamily: 'Geosaurinae',
      genus: 'Dakosaurus',
      species: 'Dakosaurus maximus',
      source: 'Paleobiology Database (PBDB) + Young et al. (2012)'
    }),
    geographicRange: JSON.stringify({
      continent: 'Europe',
      region: 'Western & Central Europe',
      country: 'Germany, England, France, Switzerland',
      fossilFormation: 'Kimmeridge Clay, Solnhofen Limestone',
      coordinates: [48.9, 11.0]
    }),
    sizeEstimate: JSON.stringify({
      length: { value: 4.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.0, unit: 'm', confidence: 'well-supported' },
      weight: { value: 1000, unit: 'kg', confidence: 'estimated' }
    }),
    sizeNotes: 'Large, robust marine metriorhynchid crocodylomorph measuring approximately 4.5 to 5.0 meters (15 to 16.4 ft) in length and weighing an estimated 1,000 kg.',
    sizeComparisonToHuman: true,
    silhouetteUuid: '2c1cd803-6075-4fe6-993d-b9e0a62fc786',
    silhouetteCredit: 'Dmitry Bogdanov (vectorized by T. Michael Keesey)',
    silhouetteLicense: 'Creative Commons Attribution 3.0 Unported',
    silhouetteTaxon: 'Dakosaurus maximus',
    silhouetteTier: 'species-specific',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Dakosaurus2.jpg',
        type: 'art',
        credit: 'Dmitry Bogdanov (CC BY 3.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dakosaurus2.jpg'
      }
    ]),
    discoveryHistory: '• First described in 1843 by German paleontologist Theodor Plieninger as Geosaurus maximus, then assigned to its own genus Dakosaurus in 1856 by Friedrich August von Quenstedt.\n• Known from exceptional fossil remains found in the Kimmeridge Clay of England and Solnhofen Limestone of Germany.\n• Long nicknamed "Godzilla" due to its remarkably deep, bulldog-like skull and robust, serrated teeth unlike any other marine crocodile.\n• Crucial in demonstrating metriorhynchid apex marine predator adaptations.',
    interestingFacts: JSON.stringify([
      'Dakosaurus possessed an unusually robust, deep snout and serrated ziphodont teeth, resembling theropod dinosaurs rather than typical slender-snouted crocodylomorphs.',
      'Unlike modern semi-aquatic crocodilians, Dakosaurus was fully marine with clawless paddle-like flippers and a hypocercal tail fin.',
      'Fossilized salt glands located above its orbits allowed Dakosaurus to drink seawater and excrete excess mineral salts, similar to marine pelagic reptiles and birds.',
      'Alongside Plesiosuchus, Dakosaurus was an apex carnivore capable of preying on ichthyosaurs and plesiosaurs in Late Jurassic European epicontinental seas.'
    ]),
    extinctionEvent: 'Early Cretaceous faunal turnover',
    closestLivingRelatives: JSON.stringify(['Modern Crocodilians (Crocodilia)']),
    sources: JSON.stringify([
      {
        citation: 'Young, M. T., Brusatte, S. L., De Andrade, M. B., Desojo, J. B., Beatty, B. L., Steel, L., Fernández, M. S., Sakamoto, M., Ruiz-Omeñaca, J. I., & Schoch, R. R. (2012). The cranial osteology and feeding ecology of the metriorhynchid crocodylomorph genera Dakosaurus and Plesiosuchus from the Late Jurassic of Europe. PLoS ONE, 7(9), e44985.',
        url: 'https://doi.org/10.1371/journal.pone.0044985'
      },
      {
        citation: 'Paleobiology Database (PBDB) - Dakosaurus maximus',
        url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=36585'
      }
    ]),
    placeholder: false
  },
  {
    id: 5194,
    name: 'Carbonemys',
    scientificName: 'Carbonemys cofrinii',
    nameMeaning: 'Coal turtle (Latin "carbo" for coal + Greek "emys" turtle, honoring David Cofrin)',
    timePeriod: 'Paleocene',
    epoch: 'Paleocene (Selandian)',
    myaStart: 60.0,
    myaEnd: 58.0,
    diet: 'carnivore',
    dietDetails: 'Macrophagous freshwater carnivore with massive, reinforced jaws capable of crushing heavy-shelled mollusks and small-to-medium crocodyliforms.',
    habitat: 'freshwater',
    clade: 'Other',
    taxonomicStatus: 'valid',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      order: 'Testudines',
      suborder: 'Pleurodira',
      superfamily: 'Pelomedusoidea',
      family: 'Podocnemididae',
      genus: 'Carbonemys',
      species: 'Carbonemys cofrinii',
      source: 'Paleobiology Database (PBDB) + Cadena et al. (2012)'
    }),
    geographicRange: JSON.stringify({
      continent: 'South America',
      region: 'La Guajira',
      country: 'Colombia',
      fossilFormation: 'Cerrejón Formation',
      coordinates: [11.1, -72.6]
    }),
    sizeEstimate: JSON.stringify({
      length: { value: 2.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.9, unit: 'm', confidence: 'well-supported' },
      weight: { value: 950, unit: 'kg', confidence: 'estimated' }
    }),
    sizeNotes: 'Giant freshwater side-necked turtle with a shell carapace measuring 1.72 meters (5 ft 8 in) and a total body length around 2.5 to 3.0 meters (8.2 to 9.8 ft), weighing nearly 1,000 kg.',
    sizeComparisonToHuman: true,
    silhouetteUuid: '51865a39-6564-4288-8124-741d011ee747',
    silhouetteCredit: 'Haplochromis',
    silhouetteLicense: 'Creative Commons Attribution 4.0 International',
    silhouetteTaxon: 'Podocnemididae',
    silhouetteTier: 'generic approximation, not species-specific',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Carbonemys_Cofrinii.jpg',
        type: 'art',
        credit: 'AuntSpray (CC BY-SA 3.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Carbonemys_Cofrinii.jpg'
      }
    ]),
    discoveryHistory: '• Discovered in 2005 at the Cerrejón open-pit coal mine in northern Colombia by a paleontological team from the Smithsonian Tropical Research Institute and the University of Florida.\n• Formally described in 2012 by Edwin Cadena, Daniel Ksepka, Carlos Jaramillo, and Jonathan Bloch in the Journal of Systematic Palaeontology.\n• Generic name references the immense coal beds where it was entombed, while the specific name honors donor Dr. David Cofrin.\n• Proved that giant chelonians thrived in warm hyperthermal tropical river systems after the extinction of non-avian dinosaurs.',
    interestingFacts: JSON.stringify([
      'Carbonemys had a carapace measuring 1.72 meters (5.6 ft) in length, making it one of the largest freshwater turtles to ever exist.',
      'It lived in the equatorial swamp-forests of the Cerrejón basin alongside Titanoboa cerrejonensis, the largest snake ever discovered.',
      'Its massive, boxy skull and powerful beak possessed immense crushing power, capable of shearing through armored crocodylomorphs and giant freshwater clams.',
      'It belongs to Pleurodira (side-necked turtles), which fold their necks horizontally sideways into their shell rather than retracting straight backward.'
    ]),
    extinctionEvent: null,
    closestLivingRelatives: JSON.stringify(['South American River Turtles (Podocnemididae)']),
    sources: JSON.stringify([
      {
        citation: 'Cadena, E. A., Ksepka, D. T., Jaramillo, C. A., & Bloch, J. I. (2012). New pelomedusoid turtles from the late Palaeocene Cerrejón Formation of Colombia and their implications for phylogeny and body size evolution. Journal of Systematic Palaeontology, 10(2), 313-331.',
        url: 'https://doi.org/10.1080/14772019.2011.569031'
      },
      {
        citation: 'Paleobiology Database (PBDB) - Carbonemys cofrinii',
        url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=234327'
      }
    ]),
    placeholder: false
  },
  {
    id: 5195,
    name: 'Meiolania',
    scientificName: 'Meiolania platyceps',
    nameMeaning: 'Small roamer (Greek "meion" smaller + "elaino" to wander or roam)',
    timePeriod: 'Pleistocene to Holocene',
    epoch: 'Pleistocene to Early Holocene',
    myaStart: 0.12,
    myaEnd: 0.002,
    diet: 'herbivore',
    dietDetails: 'Herbivorous browser feeding on tough coastal and island vegetation, ferns, palms, and shrubs.',
    habitat: 'terrestrial',
    clade: 'Other',
    taxonomicStatus: 'valid',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Testudinata',
      family: 'Meiolaniidae',
      genus: 'Meiolania',
      species: 'Meiolania platyceps',
      source: 'Paleobiology Database (PBDB) + Owen (1886)'
    }),
    geographicRange: JSON.stringify({
      continent: 'Oceania',
      region: 'South Pacific Islands',
      country: 'Australia (Lord Howe Island, New Caledonia)',
      fossilFormation: 'Lord Howe Island Calcarenite',
      coordinates: [-31.55, 159.08]
    }),
    sizeEstimate: JSON.stringify({
      length: { value: 2.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.8, unit: 'm', confidence: 'well-supported' },
      weight: { value: 450, unit: 'kg', confidence: 'estimated' }
    }),
    sizeNotes: 'Large, heavily armored terrestrial stem-turtle reaching approximately 2.0 meters (6.6 ft) in total length and weighing an estimated 400 to 500 kg.',
    sizeComparisonToHuman: true,
    silhouetteUuid: '92a0a972-9910-4756-9329-decbe15e738c',
    silhouetteCredit: 'PhyloPic Contributor',
    silhouetteLicense: 'CC0 1.0 Universal Public Domain Dedication',
    silhouetteTaxon: 'Meiolania platyceps',
    silhouetteTier: 'species-specific',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Meiolania_turtle_%28Meiolania_brevicollis%29.png',
        type: 'art',
        credit: 'ARC CoE CABAH (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Meiolania_turtle_(Meiolania_brevicollis).png'
      }
    ]),
    discoveryHistory: '• First described in 1886 by British paleontologist Sir Richard Owen based on fossils unearthed on Lord Howe Island in New South Wales, Australia.\n• Owen initially mistook its strange, horned skull for a large monitor lizard (hence the name "small roamer", contrasting with Megalania).\n• Later articulated skeletons proved it was a heavily armored stem-turtle that could not retract its head into its shell.\n• One of the last surviving non-testudine stem-turtles, surviving on isolated Pacific islands until around 2,000 years ago.',
    interestingFacts: JSON.stringify([
      'Meiolania possessed two large, lateral horns protruding from its skull, giving its head a span of over 60 cm (2 ft) and preventing it from withdrawing into its shell.',
      'Its tail was fully encased in bony rings and ended in a spiked, mace-like club used defensively against predators.',
      'Sir Richard Owen originally named it thinking it was a giant lizard related to Megalania before recognizing its chelonian affinities.',
      'Meiolania survived well into human prehistoric times on isolated islands before being driven to extinction by early Lapita settlers around 2,000 to 3,000 years ago.'
    ]),
    extinctionEvent: 'Quaternary extinction event (anthropogenic / island arrival)',
    closestLivingRelatives: JSON.stringify(['Crown Turtles (Testudines)']),
    sources: JSON.stringify([
      {
        citation: 'Owen, R. (1886). Description of fossil remains, including foot-bones, of Megalania prisca. Philosophical Transactions of the Royal Society of London, 177, 327-330.',
        url: 'https://doi.org/10.1098/rstl.1886.0015'
      },
      {
        citation: 'White, A. W., Worthy, T. H., Hawkins, S., Bedford, S., & Spriggs, M. (2010). Megafaunal meiolaniid horned turtles survived until early human settlement in Vanuatu, Southwest Pacific. Proceedings of the National Academy of Sciences, 107(35), 15512-15516.',
        url: 'https://doi.org/10.1073/pnas.1005780107'
      },
      {
        citation: 'Paleobiology Database (PBDB) - Meiolania platyceps',
        url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=37644'
      }
    ]),
    placeholder: false
  }
];

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA SAFEGUARD MIGRATION: INGEST 3 SPECIES & UPDATE 4 MEDIA RECORDS');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Capture Pre-Migration Snapshot
  console.log('Step 1: Capturing pre-migration snapshot of all species in database...');
  const allBefore = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`  Retrieved ${allBefore.length} species records from database.`);

  if (allBefore.length !== 562) {
    throw new Error(`Expected exactly 562 species in database prior to migration, found ${allBefore.length}. Aborting!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'prisma', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const preSnapshotPath = path.join(snapshotDir, 'pre_batch_562_snapshot.json');
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Mirror PhyloPic vector SVGs to Supabase Storage
  console.log('Step 2: Mirroring PhyloPic vector SVGs to Supabase Storage...');
  const silhouetteMap = new Map();

  for (const sp of NEW_SPECIES_DEFS) {
    const svgSourceUrl = `https://images.phylopic.org/images/${sp.silhouetteUuid}/vector.svg`;
    console.log(`  Downloading vector SVG for ${sp.name} (${sp.silhouetteUuid})...`);
    const svgRes = await fetch(svgSourceUrl);
    if (!svgRes.ok) {
      throw new Error(`Failed to download vector SVG from ${svgSourceUrl} (status ${svgRes.status})`);
    }
    const svgBuf = Buffer.from(await svgRes.arrayBuffer());
    const fileName = `${sp.silhouetteUuid}.svg`;
    const publicUrl = await uploadToSupabase(fileName, svgBuf, 'image/svg+xml');
    console.log(`  ✓ Uploaded to Supabase: ${publicUrl}`);

    const payload = JSON.stringify({
      url: publicUrl,
      sourceUrl: `https://www.phylopic.org/images/${sp.silhouetteUuid}`,
      license: sp.silhouetteLicense,
      credit: sp.silhouetteCredit,
      taxon: sp.silhouetteTaxon,
      taxonMatch: sp.silhouetteTier
    });
    silhouetteMap.set(sp.id, payload);
  }
  console.log('  ✓ All 3 silhouettes mirrored successfully.\n');

  // STEP 3: Update Primary Paleoart on Existing Target Records
  console.log('Step 3: Updating primary paleoart on 4 existing target species...');
  for (const upd of EXISTING_UPDATES) {
    const existing = allBefore.find(s => s.id === upd.id);
    if (!existing) {
      throw new Error(`Target species ID ${upd.id} (${upd.name}) not found in pre-state!`);
    }
    const newMedia = upd.getNewMedia(existing.media);
    await prisma.species.update({
      where: { id: upd.id },
      data: { media: newMedia }
    });
    console.log(`  ✓ [UPDATED ID ${upd.id}] ${upd.name} (${upd.scientificName}) media updated.`);
  }
  console.log('  ✓ Target media updates completed.\n');

  // STEP 4: Insert-Only Additions for 3 New Species
  console.log('Step 4: Executing insert-only addition of 3 new species...');
  for (const sp of NEW_SPECIES_DEFS) {
    const silhouettePayload = silhouetteMap.get(sp.id);
    const { silhouetteUuid, silhouetteCredit, silhouetteLicense, silhouetteTaxon, silhouetteTier, ...dbFields } = sp;

    const created = await prisma.species.create({
      data: {
        ...dbFields,
        comparisonSilhouette: silhouettePayload
      }
    });
    console.log(`  ✓ [INSERTED ID ${created.id}] ${created.name} (${created.scientificName})`);
  }
  console.log('  ✓ All 3 new species successfully inserted.\n');

  // STEP 5: Post-Migration Snapshot & Strict 100% Anti-Regression Verification
  console.log('Step 5: Verifying post-migration state and anti-regression invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, 'post_batch_565_snapshot.json');
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== 565) {
    throw new Error(`Expected exactly 565 records after additions, but found ${allAfter.length}!`);
  }

  // Verify new species presence
  for (const sp of NEW_SPECIES_DEFS) {
    const found = allAfter.find(s => s.id === sp.id);
    if (!found || found.name !== sp.name) {
      throw new Error(`New species ID ${sp.id} (${sp.name}) missing or invalid in post-state!`);
    }
  }

  const targetIds = new Set(EXISTING_UPDATES.map(u => u.id));
  let nonTargetUntouched = 0;
  let targetCorrectlyUpdated = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    if (targetIds.has(before.id)) {
      // Check that only media (and updatedAt) changed
      const diffs = [];
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt' || key === 'media') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          diffs.push(key);
        }
      }
      if (diffs.length > 0) {
        unexpectedDiffs.push(`Target ID ${before.id} (${before.name}) had unexpected field changes: ${diffs.join(', ')}`);
      } else {
        targetCorrectlyUpdated++;
      }
    } else {
      // Non-target must be 100% bit-for-bit identical
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
  console.log(`  - New species inserted: 3 (IDs: 5193, 5194, 5195)`);
  console.log(`  - Target species updated: ${targetCorrectlyUpdated} / 4 (IDs: 53, 3154, 3155, 3170)`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetUntouched} / 558 (100.0%)`);

  if (unexpectedDiffs.length > 0) {
    console.error('\n❌ CRITICAL: Regressions detected:');
    unexpectedDiffs.forEach(d => console.error('    ✕ ' + d));
    throw new Error('Anti-regression safeguard invariant violated! Aborting.');
  }
  console.log('  ✅ 100% SAFEGUARD VERIFIED: Zero regressions detected across all non-target records.\n');

  // STEP 6: Synchronize Static JSON Archives
  console.log('Step 6: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // 1. species_full_export.json: update targets and append 3 new species
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
  const updatedFullExport = fullExport.map(item => {
    if (targetIds.has(item.id)) {
      const fresh = allAfter.find(s => s.id === item.id);
      return { ...item, media: fresh.media };
    }
    return item;
  });
  for (const sp of NEW_SPECIES_DEFS) {
    const fresh = allAfter.find(s => s.id === sp.id);
    updatedFullExport.push(fresh);
  }
  fs.writeFileSync(fullExportPath, JSON.stringify(updatedFullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json (${updatedFullExport.length} total records)`);

  // 2. species_jurassic.json: update Geosaurus, Metriorhynchus, Plesiosuchus; append Dakosaurus (5193)
  const jurPath = path.join(prismaDir, 'species_jurassic.json');
  const jurJson = JSON.parse(fs.readFileSync(jurPath, 'utf8'));
  const updatedJur = jurJson.map(item => {
    if (targetIds.has(item.id)) {
      const fresh = allAfter.find(s => s.id === item.id);
      return { ...item, media: fresh.media };
    }
    return item;
  });
  const dakoFresh = allAfter.find(s => s.id === 5193);
  updatedJur.push(dakoFresh);
  fs.writeFileSync(jurPath, JSON.stringify(updatedJur, null, 2), 'utf8');
  console.log(`  ✓ Updated species_jurassic.json (${updatedJur.length} total records)`);

  // 3. species_triassic.json: update Shonisaurus (53)
  const triPath = path.join(prismaDir, 'species_triassic.json');
  const triJson = JSON.parse(fs.readFileSync(triPath, 'utf8'));
  const updatedTri = triJson.map(item => {
    if (item.id === 53) {
      const fresh = allAfter.find(s => s.id === 53);
      return { ...item, media: fresh.media };
    }
    return item;
  });
  fs.writeFileSync(triPath, JSON.stringify(updatedTri, null, 2), 'utf8');
  console.log(`  ✓ Updated species_triassic.json (${updatedTri.length} total records)`);

  // 4. species_others.json: append Carbonemys (5194) and Meiolania (5195)
  const othersPath = path.join(prismaDir, 'species_others.json');
  const othersJson = JSON.parse(fs.readFileSync(othersPath, 'utf8'));
  const carboFresh = allAfter.find(s => s.id === 5194);
  const meioFresh = allAfter.find(s => s.id === 5195);
  othersJson.push(carboFresh, meioFresh);
  fs.writeFileSync(othersPath, JSON.stringify(othersJson, null, 2), 'utf8');
  console.log(`  ✓ Updated species_others.json (${othersJson.length} total records)`);

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ ALL OPERATIONS COMPLETED SUCCESSFULLY WITH ZERO REGRESSIONS!');
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
