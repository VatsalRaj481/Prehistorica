const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Target updates
const MEDIA_UPDATES = {
  160: { // Stokesosaurus clevelandi
    name: 'Stokesosaurus',
    newArt: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Stokesosaurus_by_Tom_Parker.png',
      type: 'art',
      credit: 'Tom Parker (CC BY-SA 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Stokesosaurus_by_Tom_Parker.png'
    }
  },
  1747: { // Eotyrannus lengi
    name: 'Eotyrannus lengi',
    newArt: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Eotyrannus_NT.png',
      type: 'art',
      credit: 'Nobu Tamura (CC BY-SA 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Eotyrannus_NT.png'
    }
  },
  193: { // Othnielosaurus
    name: 'Othnielosaurus',
    newArt: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Othnielosaurus_BW.jpg',
      type: 'art',
      credit: 'Nobu Tamura (CC BY 2.5)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Othnielosaurus_BW.jpg'
    }
  },
  159: { // Marshosaurus
    name: 'Marshosaurus',
    newArt: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Marshosaurus_TD.png',
      type: 'art',
      credit: 'TotalDino (CC BY 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Marshosaurus_TD.png'
    }
  }
};

// New species definitions
const NEW_SPECIES = [
  {
    id: 5232,
    name: 'Raptorex',
    scientificName: 'Raptorex kriegsteini',
    nameMeaning: 'Robber king (honoring Roman Kriegstein)',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Campanian to Maastrichtian, ~70 Ma)',
    myaStart: 72.0,
    myaEnd: 68.0,
    diet: 'carnivore',
    dietDetails: 'Carnivorous predator preying on small ornithischians, oviraptorosaurs, and sauropod juveniles with deep crushing jaws and serrated ziphodont dentition.',
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
      superfamily: 'Tyrannosauroidea',
      family: 'Tyrannosauridae',
      genus: 'Raptorex',
      species: 'Raptorex kriegsteini',
      source: 'Paleobiology Database (PBDB) + Sereno et al. (2009)'
    }),
    geographicRange: JSON.stringify({
      continent: 'Asia',
      region: 'Gobi Desert / Nemegt Basin',
      country: 'Mongolia',
      fossilFormation: 'Nemegt Formation (or Iren Dabasu Formation)'
    }),
    sizeEstimate: JSON.stringify({
      length: { value: 2.7, unit: 'm', confidence: 'well-supported' },
      height: { value: 0.9, unit: 'm', confidence: 'well-supported' },
      weight: { value: 65, unit: 'kg', confidence: 'estimated' }
    }),
    sizeNotes: 'Compact juvenile tyrannosauroid measuring approximately 2.5 to 3.0 meters (8.2 to 9.8 ft) in length and weighing roughly 65 to 80 kg.',
    sizeComparisonToHuman: true,
    comparisonSilhouette: JSON.stringify({
      url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/499fe1d6-a3c5-4219-a60e-d5ae93031bda.svg',
      sourceUrl: 'https://www.phylopic.org/images/499fe1d6-a3c5-4219-a60e-d5ae93031bda',
      license: 'Public Domain Dedication (CC0 1.0)',
      credit: 'Scott Hartman',
      taxon: 'Tyrannosauroidea (Representative: Alioramus remotus)',
      taxonMatch: 'generic approximation, not species-specific'
    }),
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Raptorex_NT.jpg',
        type: 'art',
        credit: 'Nobu Tamura (CC BY 3.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Raptorex_NT.jpg'
      }
    ]),
    discoveryHistory: 'First described in 2009 by American paleontologist Paul Sereno and colleagues based on a nearly complete subadult skeleton (LH PV18) purchased by private collector Roman Kriegstein and later repatriated to China. While originally publicized as a 125-million-year-old Early Cretaceous ancestral prototype of tyrannosaurids, subsequent histochemical and osteohistological re-analyses by Denver Fowler (2011) and Newbrey et al. (2013) demonstrated the specimen is a juvenile tyrannosaurid from the Late Cretaceous (~70 Ma) of the Nemegt Basin in Mongolia.',
    interestingFacts: JSON.stringify([
      'Originally hailed in 2009 as an evolutionary "blueprint" showing that all classic tyrannosaurid adaptations (puny arms, massive skull, cursorial hindlimbs) evolved at miniature size 60 million years before T. rex.',
      'Subsequent microstructural bone histology by Fowler et al. (2011) revealed the holotype specimen was not an adult, but a fast-growing juvenile only 5 to 6 years old at death.',
      'Fish vertebrae associated with the fossil matrix match the Late Cretaceous Nemegt Formation of Mongolia rather than the Early Cretaceous Yixian Formation, sparking major debate over fossil provenance and antiquity trade.',
      'Despite ontogenetic controversy, Raptorex remains a critical specimen for understanding the craniofacial ontogeny and rapid growth trajectories of Asian tyrannosaurids.'
    ]),
    extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)']),
    sources: JSON.stringify([
      {
        citation: 'Sereno, P. C., et al. (2009). Tyrannosaurid skeletal design first evolved at small body size. Science, 326(5951), 418-421.',
        url: 'https://doi.org/10.1126/science.1177428'
      },
      {
        citation: 'Fowler, D. W., et al. (2011). Reanalysis of "Raptorex kriegsteini": a juvenile tyrannosaurid dinosaur from Mongolia. PLoS ONE, 6(6), e21376.',
        url: 'https://doi.org/10.1371/journal.pone.0021376'
      }
    ])
  },
  {
    id: 5233,
    name: 'Juratyrant',
    scientificName: 'Juratyrant langhami',
    nameMeaning: 'Jurassic tyrant (honoring Peter Langham)',
    timePeriod: 'Late Jurassic',
    epoch: 'Late Jurassic (Tithonian, ~152 to 149.2 Ma)',
    myaStart: 152.0,
    myaEnd: 149.0,
    diet: 'carnivore',
    dietDetails: 'Agile carnivore hunting contemporaneous ornithischians, sauropod hatchlings, and pterosaurs using sharp, recurved teeth and grasping tridactyl forelimbs.',
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
      superfamily: 'Tyrannosauroidea',
      family: 'Proceratosauridae',
      genus: 'Juratyrant',
      species: 'Juratyrant langhami',
      source: 'Paleobiology Database (PBDB) + Brusatte & Benson (2013)'
    }),
    geographicRange: JSON.stringify({
      continent: 'Europe',
      region: 'Dorset / English Channel coast',
      country: 'United Kingdom',
      fossilFormation: 'Kimmeridge Clay Formation'
    }),
    sizeEstimate: JSON.stringify({
      length: { value: 5.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.6, unit: 'm', confidence: 'well-supported' },
      weight: { value: 350, unit: 'kg', confidence: 'estimated' }
    }),
    sizeNotes: 'Medium-sized, slender pantyrannosaurian theropod measuring approximately 5 meters (16.4 ft) in length and weighing around 300 to 450 kg.',
    sizeComparisonToHuman: true,
    comparisonSilhouette: JSON.stringify({
      url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/acfb2eb3-745f-4058-8d6f-09471def7fd4.svg',
      sourceUrl: 'https://www.phylopic.org/images/acfb2eb3-745f-4058-8d6f-09471def7fd4',
      license: 'Public Domain Dedication (CC0 1.0)',
      credit: 'Scott Hartman',
      taxon: 'Tyrannosauroidea (Representative: Eotyrannus lengi)',
      taxonMatch: 'generic approximation, not species-specific'
    }),
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Juratyrant_signed.jpg',
        type: 'art',
        credit: 'Nobu Tamura (CC BY-SA 3.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Juratyrant_signed.jpg'
      }
    ]),
    discoveryHistory: 'Discovered in 1984 by commercial fossil collector Peter Langham at Freshwater Steps near Kimmeridge in Dorset, England. The specimen (OUMNH J.3311), consisting of an articulated pelvis, sacrum, hindlimb elements, and caudal vertebrae, was initially assigned to the American genus Stokesosaurus by Roger Benson in 2008 as Stokesosaurus langhami. In 2013, Stephen Brusatte and Roger Benson erected the distinct genus Juratyrant based on unique pelvic synapomorphies including a distinct perinarial fossa and iliac crest morphology.',
    interestingFacts: JSON.stringify([
      'Represents one of the most complete and geologically recent Jurassic tyrannosauroids known from the European archipelago.',
      'Preserves a specialized ischiadic apron and prominent supraacetabular crest on the ilium characteristic of the basal tyrannosauroid radiation.',
      'Demonstrates that tyrannosauroids were already widespread across Laurasian island landmasses in the Late Jurassic, coexisting with large megalosauroids and allosauroids long before attaining apex-predator status in the Cretaceous.',
      'Its discovery in the marine Kimmeridge Clay Formation indicates the carcass drifted out into shallow coastal waters before burial in anoxic marine muds.'
    ]),
    extinctionEvent: 'Late Jurassic Regional Faunal Turnover (~145 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)']),
    sources: JSON.stringify([
      {
        citation: 'Benson, R. B. J. (2008). New information on Stokesosaurus, a tyrannosauroid dinosaur from the Late Jurassic of North America and the United Kingdom. Journal of Vertebrate Paleontology, 28(3), 732-750.',
        url: 'https://doi.org/10.1671/0272-4634(2008)28[732:NIOSAD]2.0.CO;2'
      },
      {
        citation: 'Brusatte, S. L., & Benson, R. B. J. (2013). The systematics of Late Jurassic tyrannosauroids (Dinosauria: Theropoda) from Europe and North America. Acta Palaeontologica Polonica, 58(1), 47-54.',
        url: 'https://doi.org/10.4202/app.2011.0141'
      }
    ])
  }
];

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA SAFEGUARD MIGRATION: ADD RAPTOREX & JURATYRANT + UPDATE 4 MEDIA');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration snapshot
  console.log('Step 1: Capturing pre-migration snapshot of all species in database...');
  const allBefore = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`  Retrieved ${allBefore.length} species records from database.`);

  const snapshotDir = path.join(__dirname, '..', 'prisma', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preSnapshotPath = path.join(snapshotDir, `pre_add_and_update_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Duplicate check for new species
  console.log('Step 2: Performing duplicate checks for new additions...');
  for (const s of NEW_SPECIES) {
    const dup = allBefore.find(b => b.name.toLowerCase() === s.name.toLowerCase() || b.scientificName.toLowerCase() === s.scientificName.toLowerCase() || b.id === s.id);
    if (dup) {
      throw new Error(`CRITICAL: Species ${s.name} (ID: ${s.id}) already exists with ID ${dup.id}!`);
    }
  }
  console.log('  ✓ Duplicate check passed cleanly for all additions.\n');

  // STEP 3: Insert new species (Insert-Only Policy)
  console.log('Step 3: Inserting new species records...');
  for (const s of NEW_SPECIES) {
    await prisma.species.create({
      data: s
    });
    console.log(`  ✓ Inserted ${s.name} (ID: ${s.id})`);
  }
  console.log();

  // STEP 4: Update media for 4 existing species
  console.log('Step 4: Executing audited media updates for 4 target species...');
  for (const [idStr, updateInfo] of Object.entries(MEDIA_UPDATES)) {
    const id = parseInt(idStr, 10);
    const existing = allBefore.find(s => s.id === id);
    if (!existing) {
      throw new Error(`Target species ID ${id} (${updateInfo.name}) not found in database!`);
    }

    let mediaArr = [];
    try {
      mediaArr = typeof existing.media === 'string' ? JSON.parse(existing.media) : (existing.media || []);
    } catch {
      mediaArr = [];
    }

    // Retain existing art as historical plate and place new art at priority 1
    const oldArt = mediaArr.filter(m => m.type === 'art').map(m => ({
      ...m,
      type: 'fossil_specimen',
      credit: m.credit ? `${m.credit} (Historical plate)` : 'Historical restoration'
    }));
    const nonArt = mediaArr.filter(m => m.type !== 'art');
    const updatedMedia = [updateInfo.newArt, ...nonArt, ...oldArt];

    await prisma.species.update({
      where: { id },
      data: { media: JSON.stringify(updatedMedia) }
    });
    console.log(`  ✓ Updated media for ID ${id} (${updateInfo.name})`);
  }
  console.log();

  // STEP 5: Post-migration snapshot & verification
  console.log('Step 5: Capturing post-migration snapshot and verifying anti-regression invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, `post_add_and_update_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  const expectedTotal = allBefore.length + NEW_SPECIES.length;
  if (allAfter.length !== expectedTotal) {
    throw new Error(`CRITICAL: Species count mismatch! Expected: ${expectedTotal}, Got: ${allAfter.length}`);
  }

  const targetUpdateIds = new Set(Object.keys(MEDIA_UPDATES).map(k => parseInt(k, 10)));
  const newIds = new Set(NEW_SPECIES.map(s => s.id));
  let nonTargetUntouched = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    if (targetUpdateIds.has(before.id)) {
      // Target species: check that only media & updatedAt changed
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt' || key === 'media') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          unexpectedDiffs.push(`Target ID ${before.id} had unexpected modification in field '${key}'`);
        }
      }
    } else {
      // Non-target species: must be 100% bit-for-bit identical
      let isIdentical = true;
      for (const key of Object.keys(before)) {
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          isIdentical = false;
          unexpectedDiffs.push(`Non-target species ID ${before.id} (${before.name}) was modified in '${key}'!`);
        }
      }
      if (isIdentical) {
        nonTargetUntouched++;
      }
    }
  }

  if (unexpectedDiffs.length > 0) {
    console.error('CRITICAL SAFEGUARD FAILURES:');
    unexpectedDiffs.forEach(d => console.error('  - ' + d));
    throw new Error('Anti-regression verification failed!');
  }

  console.log(`  ✓ Verified: 100% of non-target species (${nonTargetUntouched}/${allBefore.length - targetUpdateIds.size}) remain completely untouched!`);
  console.log(`  ✓ Verified: All 4 target species updated their media cleanly.`);
  console.log(`  ✓ Verified: All 2 new species added cleanly.`);
  console.log(`  ✓ Total cataloged specimens in database: ${allAfter.length}\n`);

  // STEP 6: Synchronize Static JSON Archives
  console.log('Step 6: Synchronizing static JSON archives...');
  const fullExportPath = path.join(__dirname, '..', 'prisma', 'species_full_export.json');
  fs.writeFileSync(fullExportPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Synced master export (${allAfter.length} species): ${fullExportPath}`);

  // Sync species_jurassic.json
  const jurassicPath = path.join(__dirname, '..', 'prisma', 'species_jurassic.json');
  if (fs.existsSync(jurassicPath)) {
    const jurassicList = JSON.parse(fs.readFileSync(jurassicPath, 'utf8'));
    // Update existing in jurassic list
    const updatedJurassic = jurassicList.map(s => {
      const match = allAfter.find(a => a.id === s.id);
      return match || s;
    });
    // Add Juratyrant if not present
    if (!updatedJurassic.some(s => s.id === 5233)) {
      const juratyrant = allAfter.find(a => a.id === 5233);
      if (juratyrant) updatedJurassic.push(juratyrant);
    }
    fs.writeFileSync(jurassicPath, JSON.stringify(updatedJurassic, null, 2), 'utf8');
    console.log(`  ✓ Synced Jurassic fauna archive (${updatedJurassic.length} species): ${jurassicPath}`);
  }

  // Sync species_cretaceous.json
  const cretaceousPath = path.join(__dirname, '..', 'prisma', 'species_cretaceous.json');
  if (fs.existsSync(cretaceousPath)) {
    const cretaceousList = JSON.parse(fs.readFileSync(cretaceousPath, 'utf8'));
    const updatedCretaceous = cretaceousList.map(s => {
      const match = allAfter.find(a => a.id === s.id);
      return match || s;
    });
    // Add Raptorex if not present
    if (!updatedCretaceous.some(s => s.id === 5232)) {
      const raptorex = allAfter.find(a => a.id === 5232);
      if (raptorex) updatedCretaceous.push(raptorex);
    }
    fs.writeFileSync(cretaceousPath, JSON.stringify(updatedCretaceous, null, 2), 'utf8');
    console.log(`  ✓ Synced Cretaceous fauna archive (${updatedCretaceous.length} species): ${cretaceousPath}`);
  }

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('MIGRATION COMPLETED SUCCESSFULLY WITH 100% SAFEGUARD INTEGRITY');
  console.log('════════════════════════════════════════════════════════════════════════════\n');
}

main()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
