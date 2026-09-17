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

// 1. Existing target updates (media only)
const EXISTING_UPDATES = [
  {
    id: 5166,
    name: 'Hyaenodon',
    scientificName: 'Hyaenodon horridus',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = typeof currentMediaStr === 'string' ? JSON.parse(currentMediaStr) : (currentMediaStr || []); } catch(e){}
      const nonArt = mediaArr.filter(m => m.type !== 'art');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Hyaenodon_NT_small.jpg',
        type: 'art',
        credit: 'Nobu Tamura (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hyaenodon_NT_small.jpg'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  },
  {
    id: 5172,
    name: 'Megacerops',
    scientificName: 'Megacerops coloradensis',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = typeof currentMediaStr === 'string' ? JSON.parse(currentMediaStr) : (currentMediaStr || []); } catch(e){}
      const nonArt = mediaArr.filter(m => m.type !== 'art');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Megacerops-coloradensis.jpg',
        type: 'art',
        credit: 'Dmitry Bogdanov (CC BY 3.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Megacerops-coloradensis.jpg'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  }
];

// 2. New species additions
const NEW_SPECIES_DEFS = [
  {
    id: 5190,
    name: 'Ampelosaurus',
    scientificName: 'Ampelosaurus atacis',
    nameMeaning: 'Vine lizard (from the vineyard regions of Campagne-sur-Aude, France)',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Late Campanian to Early Maastrichtian)',
    myaStart: 70.6,
    myaEnd: 66.0,
    diet: 'herbivore',
    dietDetails: 'High- and low-browsing herbivore consuming robust Late Cretaceous flora, including conifers, cycads, and early flowering plants.',
    habitat: 'terrestrial',
    clade: 'Sauropod',
    taxonomicStatus: 'valid',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Dinosauria',
      order: 'Saurischia',
      suborder: 'Sauropodomorpha',
      unrankedClade: 'Titanosauria',
      family: 'Saltasauridae',
      genus: 'Ampelosaurus',
      species: 'Ampelosaurus atacis',
      source: 'Paleobiology Database (PBDB) + Le Loeuff (1995)'
    }),
    geographicRange: JSON.stringify({
      continent: 'Europe',
      region: 'Occitanie',
      country: 'France, Spain',
      fossilFormation: 'Marnes Rouges Inférieures Formation, Villalba de la Sierra Formation',
      coordinates: [43.0, 2.3]
    }),
    sizeEstimate: JSON.stringify({
      length: { value: 15.0, unit: 'm', confidence: 'estimated' },
      height: { value: 4.0, unit: 'm', confidence: 'estimated' },
      weight: { value: 8000, unit: 'kg', confidence: 'estimated' }
    }),
    sizeNotes: 'Medium-sized titanosaur measuring approximately 15 to 16 meters (49 to 52 ft) in total length and weighing an estimated 8,000 kg.',
    sizeComparisonToHuman: true,
    silhouetteUuid: 'b591e0da-c9f0-4fbc-9c0d-93109c48c2bb',
    silhouetteCredit: 'Ryan S. Soledade',
    silhouetteLicense: 'CC0 1.0 Universal Public Domain Dedication',
    silhouetteTaxon: 'Saltasauridae',
    silhouetteTier: 'generic approximation, not species-specific',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/AmpelosaurusDB.jpg',
        type: 'art',
        credit: 'Dmitry Bogdanov (CC BY 3.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:AmpelosaurusDB.jpg'
      }
    ]),
    discoveryHistory: '• Discovered in 1989 near Campagne-sur-Aude in the Aude department of southern France by an excavation team led by French paleontologist Jean Le Loeuff.\n• Formally described in 1995 as Ampelosaurus atacis; the generic name derives from Greek "ampelos" (vine) because the holotype quarry was surrounded by vineyards.\n• Numerous articulated and associated skeletons have since been recovered, making it one of the best-known European sauropods.\n• Provided definitive evidence of dermal armor (osteoderms and spines) among European titanosaurians.',
    interestingFacts: JSON.stringify([
      'Ampelosaurus is one of the most comprehensively known European sauropods, with hundreds of bones and osteoderms discovered in southern France and Spain.',
      'It possessed distinctive dermal armor consisting of heavy osteoderms and defensive spines embedded in its hide to defend against abelisaurid theropods.',
      'Its generic name translates to "vine lizard" because the fossil quarry was discovered nestled directly within the vineyards of Château de Campagne.',
      'Unlike earlier giant sauropods, Ampelosaurus lived in an island archipelago environment that covered Late Cretaceous Europe.'
    ]),
    extinctionEvent: 'Cretaceous-Paleogene (K-Pg) extinction event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)']),
    sources: JSON.stringify([
      {
        citation: 'Le Loeuff, J. (1995). Ampelosaurus atacis (nov. gen., nov. sp.), un nouveau Titanosauridae (Dinosauria, Sauropoda) du Crétacé supérieur de la Haute Vallée de l\'Aude (France). Comptes Rendus de l\'Académie des Sciences, Série IIA, 321(8), 693-699.',
        url: 'https://gallica.bnf.fr/ark:/12148/bpt6k6249767r'
      },
      {
        citation: 'Klein, N., Sander, P. M., Stein, K., Le Loeuff, J., Carballido, J. L., & Buffeteau, E. (2012). Modified laminar bone in Ampelosaurus atacis (Sauropoda): implications for sauropod bone growth. Biology Letters, 8(4), 627-630.',
        url: 'https://doi.org/10.1098/rsbl.2012.0223'
      },
      {
        citation: 'Paleobiology Database (PBDB) - Ampelosaurus atacis',
        url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=54308'
      }
    ]),
    placeholder: false
  },
  {
    id: 5191,
    name: 'Dakotaraptor',
    scientificName: 'Dakotaraptor steini',
    nameMeaning: 'Dakota plunderer (honoring paleontologist Walter W. Stein)',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Late Maastrichtian)',
    myaStart: 68.0,
    myaEnd: 66.0,
    diet: 'carnivore',
    dietDetails: 'Hypercarnivorous pursuit predator specialized in hunting medium-sized ornithopods, ceratopsians, and juvenile dinosaurs with sickle claws and serrated teeth.',
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
      family: 'Dromaeosauridae',
      subfamily: 'Dromaeosaurinae',
      genus: 'Dakotaraptor',
      species: 'Dakotaraptor steini',
      source: 'Paleobiology Database (PBDB) + DePalma et al. (2015)'
    }),
    geographicRange: JSON.stringify({
      continent: 'North America',
      region: 'Great Plains',
      country: 'United States',
      fossilFormation: 'Hell Creek Formation',
      coordinates: [45.5, -103.5]
    }),
    sizeEstimate: JSON.stringify({
      length: { value: 5.5, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.8, unit: 'm', confidence: 'well-supported' },
      weight: { value: 300, unit: 'kg', confidence: 'estimated' }
    }),
    sizeNotes: 'Large, gracile dromaeosaurid measuring approximately 5.5 meters (18 ft) in total length and weighing roughly 220 to 350 kg.',
    sizeComparisonToHuman: true,
    silhouetteUuid: '5cbe4ae0-b16b-4735-8980-180f98a652d4',
    silhouetteCredit: 'Walter Vladimir',
    silhouetteLicense: 'CC BY 3.0 Unported',
    silhouetteTaxon: 'Dakotaraptor steini',
    silhouetteTier: 'species-specific',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Dakotaraptor_wiki_%28white_background%29.jpg',
        type: 'art',
        credit: 'Emily Willoughby (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dakotaraptor_wiki_(white_background).jpg'
      }
    ]),
    discoveryHistory: '• First unearthed in Harding County, South Dakota in 2005 by paleontologist Robert DePalma in the famous Late Cretaceous Hell Creek Formation.\n• Formally described in 2015 by Robert A. DePalma, David A. Burnham, Larry D. Martin, Peter L. Larson, and Robert T. Bakker.\n• Named Dakotaraptor steini in honor of paleontologist Walter W. Stein.\n• Crucially preserved ulnar quill knobs, providing direct osteological proof of large pennaceous feathers on its forelimbs.',
    interestingFacts: JSON.stringify([
      'Dakotaraptor is one of the largest dromaeosaurids known to science, rivaling Utahraptor in length but possessing a far more slender, cursorial limb structure built for speed.',
      'The ulna bore 10 clear, distinct quill knobs (papillae), providing irrefutable physical proof that Dakotaraptor sported well-developed feathered wings despite being flightless.',
      'It shared the Maastrichtian Hell Creek ecosystem alongside apex predator Tyrannosaurus rex, filling the mesopredator niche.',
      'Its second pedal digit featured a massive, razor-sharp sickle killing claw measuring over 16 cm (6.3 in) along the outer curve.'
    ]),
    extinctionEvent: 'Cretaceous-Paleogene (K-Pg) extinction event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)']),
    sources: JSON.stringify([
      {
        citation: 'DePalma, R. A., Burnham, D. A., Martin, L. D., Larson, P. L., & Bakker, R. T. (2015). The first giant raptor (Theropoda: Dromaeosauridae) from the Hell Creek Formation. Paleontological Contributions, 14, 1-16.',
        url: 'https://doi.org/10.17161/1808.18764'
      },
      {
        citation: 'Paleobiology Database (PBDB) - Dakotaraptor steini',
        url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=331189'
      }
    ]),
    placeholder: false
  },
  {
    id: 5192,
    name: 'Nundasuchus',
    scientificName: 'Nundasuchus songeaensis',
    nameMeaning: 'Predator crocodile of Songea (Swahili "nunda" meaning predator/monster + Greek "suchus")',
    timePeriod: 'Middle Triassic',
    epoch: 'Middle Triassic (Anisian)',
    myaStart: 247.2,
    myaEnd: 242.0,
    diet: 'carnivore',
    dietDetails: 'Apex terrestrial carnivore equipped with blade-like recurved serrated ziphodont teeth capable of tearing flesh and dismembering dicynodonts and rhynchosaurs.',
    habitat: 'terrestrial',
    clade: 'Archosauriform',
    taxonomicStatus: 'valid',
    taxonomy: JSON.stringify({
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: 'Chordata',
      class: 'Reptilia',
      clade: 'Archosauriformes',
      unrankedClade1: 'Archosauria',
      unrankedClade2: 'Pseudosuchia',
      genus: 'Nundasuchus',
      species: 'Nundasuchus songeaensis',
      source: 'Paleobiology Database (PBDB) + Nesbitt et al. (2014)'
    }),
    geographicRange: JSON.stringify({
      continent: 'Africa',
      region: 'Ruvuma Basin',
      country: 'Tanzania',
      fossilFormation: 'Manda Beds (Lifua Member)',
      coordinates: [-10.6, 35.6]
    }),
    sizeEstimate: JSON.stringify({
      length: { value: 2.8, unit: 'm', confidence: 'estimated' },
      height: { value: 0.8, unit: 'm', confidence: 'estimated' },
      weight: { value: 90, unit: 'kg', confidence: 'estimated' }
    }),
    sizeNotes: 'Robust quadrupedal archosauriform measuring an estimated 2.7 to 3.0 meters (9 to 10 ft) in length and weighing approximately 60 to 120 kg.',
    sizeComparisonToHuman: true,
    silhouetteUuid: 'b5927c68-da04-47ba-80ba-616059a82b9d',
    silhouetteCredit: 'Miguel Hernández',
    silhouetteLicense: 'CC0 1.0 Universal Public Domain Dedication',
    silhouetteTaxon: 'Nundasuchus songeaensis',
    silhouetteTier: 'species-specific',
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Nundasuchus_Songeaensis.png',
        type: 'art',
        credit: 'Aquakeeper14 (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Nundasuchus_Songeaensis.png'
      }
    ]),
    discoveryHistory: '• Discovered in 2007 in the Middle Triassic Lifua Member of the Manda Beds in southwestern Tanzania during an international expedition led by Sterling Nesbitt.\n• Formally described and named in 2014 by Sterling J. Nesbitt, Christian A. Sidor, Kenneth D. Angielczyk, Roger M. H. Smith, and Linda A. Tsuji.\n• Generic name combines the Swahili word "nunda" (predator or mythical beast) with Greek "suchus" (crocodile), while the specific epithet honors the nearby town of Songea.\n• Represents an evolutionary intermediate offering critical clues into early archosaurian diversification after the Permian-Triassic extinction.',
    interestingFacts: JSON.stringify([
      'Nundasuchus represents a critical transitional archosauriform possessing a striking mosaic of ancestral reptile features and advanced suchian archosaurian anatomy.',
      'Its back was protected by double rows of overlapping bony osteoderms, providing defense and spinal rigidity.',
      'The generic name incorporates the Swahili term "nunda", meaning a legendary predator or fierce beast.',
      'Fossils were recovered from the famous Manda Beds of Tanzania, revealing the complex predatory faunas that flourished right before the emergence of the first dinosaurs.'
    ]),
    extinctionEvent: 'Middle/Late Triassic faunal turnover',
    closestLivingRelatives: JSON.stringify(['Crocodilians (Crocodilia)']),
    sources: JSON.stringify([
      {
        citation: 'Nesbitt, S. J., Sidor, C. A., Angielczyk, K. D., Smith, R. M., & Tsuji, L. A. (2014). A new archosaur from the Manda beds (Anisian, Middle Triassic) of southern Tanzania and its implications for character evolution at the base of Archosauria. Journal of Vertebrate Paleontology, 34(6), 1478-1481.',
        url: 'https://doi.org/10.7987/14-00049'
      },
      {
        citation: 'Paleobiology Database (PBDB) - Nundasuchus songeaensis',
        url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=311246'
      }
    ]),
    placeholder: false
  }
];

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA SAFEGUARD MIGRATION: INGEST 3 SPECIES & UPDATE 2 MEDIA RECORDS');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Capture Pre-Migration Snapshot
  console.log('Step 1: Capturing pre-migration snapshot of all species in database...');
  const allBefore = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`  Retrieved ${allBefore.length} species records from database.`);

  if (allBefore.length !== 559) {
    throw new Error(`Expected exactly 559 species in database prior to migration, found ${allBefore.length}. Aborting!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'prisma', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const preSnapshotPath = path.join(snapshotDir, 'pre_batch_559_snapshot.json');
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
  console.log('Step 3: Updating primary paleoart on 2 existing target species...');
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

  const postSnapshotPath = path.join(snapshotDir, 'post_batch_562_snapshot.json');
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== 562) {
    throw new Error(`Expected exactly 562 records after additions, but found ${allAfter.length}!`);
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
  console.log(`  - New species inserted: 3 (IDs: 5190, 5191, 5192)`);
  console.log(`  - Target species updated: ${targetCorrectlyUpdated} / 2 (IDs: 5166, 5172)`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetUntouched} / 557 (100.0%)`);

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

  // 2. species_cretaceous.json: append Ampelosaurus (5190) and Dakotaraptor (5191)
  const cretPath = path.join(prismaDir, 'species_cretaceous.json');
  const cretJson = JSON.parse(fs.readFileSync(cretPath, 'utf8'));
  const ampeloFresh = allAfter.find(s => s.id === 5190);
  const dakotaFresh = allAfter.find(s => s.id === 5191);
  cretJson.push(ampeloFresh, dakotaFresh);
  fs.writeFileSync(cretPath, JSON.stringify(cretJson, null, 2), 'utf8');
  console.log(`  ✓ Updated species_cretaceous.json (${cretJson.length} total records)`);

  // 3. species_triassic.json: append Nundasuchus (5192)
  const triPath = path.join(prismaDir, 'species_triassic.json');
  const triJson = JSON.parse(fs.readFileSync(triPath, 'utf8'));
  const nundaFresh = allAfter.find(s => s.id === 5192);
  triJson.push(nundaFresh);
  fs.writeFileSync(triPath, JSON.stringify(triJson, null, 2), 'utf8');
  console.log(`  ✓ Updated species_triassic.json (${triJson.length} total records)`);

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
