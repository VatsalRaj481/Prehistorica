const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TROMEROSAURUS_RECORD = {
  name: 'Tromerosaurus',
  scientificName: 'Tromerosaurus solumons',
  nameMeaning: 'Frightful lizard of the lonely mountain',
  timePeriod: 'Late Cretaceous',
  epoch: 'Late Cretaceous (Campanian, ~76.7–76.4 Ma)',
  myaStart: 76.7,
  myaEnd: 76.4,
  diet: 'carnivore',
  dietDetails: 'Apex or high-tier carnivore preying on contemporary ornithischians such as hadrosaurs (Corythosaurus, Parasaurolophus), ceratopsians (Centrosaurus), and ankylosaurs in coastal floodplain paleoenvironments.',
  habitat: 'terrestrial',
  clade: 'Theropod',
  geographicRange: JSON.stringify({
    continent: 'North America',
    region: 'Dinosaur Provincial Park (Alberta)',
    country: 'Canada',
    fossilFormation: 'Oldman Formation & Dinosaur Park Formation',
    coordinates: [50.76, -111.48]
  }),
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
    subfamily: 'Albertosaurinae',
    genus: 'Tromerosaurus',
    species: 'Tromerosaurus solumons',
    source: 'Powers et al. (2026), Journal of Vertebrate Paleontology (doi:10.1080/02724634.2026.2728669)'
  }),
  taxonomicStatus: 'valid',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Tromerosaurus_TD.png',
      type: 'art',
      credit: 'TotalDino (CC BY 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tromerosaurus_TD.png'
    }
  ]),
  discoveryHistory: '• Holotype UALVP 52981 discovered in 2010 by Stuart Plotkin in the upper Oldman Formation (quarry Q258) of Dinosaur Provincial Park, Alberta, Canada, and excavated by University of Alberta crews in 2010–2011.\n• Initially referred to Daspletosaurus without detailed osteological evaluation.\n• Re-examination of referred specimens TMP 1994.012.0602 (previously considered the largest adult Gorgosaurus libratus) and TMP 1995.005.0001 from the lower Dinosaur Park Formation revealed consistent diagnostic features.\n• Formally described in October 2026 by Mark J. Powers, James G. Napoli, Philip J. Currie, and colleagues in the Journal of Vertebrate Paleontology as the distinct genus and species Tromerosaurus solumons.',
  interestingFacts: JSON.stringify([
    'Described in October 2026 by Powers et al., Tromerosaurus solumons represents a pivotal tyrannosaurid exhibiting a mosaic of traits bridging Albertosaurinae and Tyrannosaurinae.',
    'The generic name translates to "frightful lizard", while the species name solumons ("lonely mountain") references both its isolated shelf-like lacrimal boss and Tolkien\'s Lonely Mountain (Erebor) from The Hobbit.',
    'Its skull proportions are characteristic of albertosaurines, with a femur (0.95 m) longer than its skull (0.90 m), yet its temporal skull region is laterally expanded similar to tyrannosaurines.',
    'The largest referred specimen, TMP 1994.012.0602, was long considered the benchmark for the largest and most mature adult Gorgosaurus libratus before detailed reanalysis reassigned it to Tromerosaurus.',
    'Phylogenetic parsimony recovers Tromerosaurus as the basalmost known albertosaurine, demonstrating that albertosaurines and tyrannosaurines diverged later and diversified more rapidly than previously realized.'
  ]),
  sizeNotes: 'Holotype UALVP 52981 represents a subadult/adult individual measuring approximately 7.0 meters (23 ft) in length with a 0.95 m femur. The largest referred specimen (TMP 1994.012.0602, previously regarded as an exceptionally mature Gorgosaurus) reached an estimated 8.5 to 8.9 meters (28–29 ft) in length and a body mass of approximately 2,000 to 2,500 kg.',
  sizeEstimate: JSON.stringify({
    length: { value: 7.0, unit: 'm', confidence: 'well-supported' },
    height: { value: 2.4, unit: 'm', confidence: 'estimated' },
    weight: { value: 2000, unit: 'kg', confidence: 'estimated' }
  }),
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/02e30c15-3233-449b-a623-85314f79e870.png',
    sourceUrl: 'https://www.phylopic.org/images/02e30c15-3233-449b-a623-85314f79e870',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    credit: 'Craig Dylke',
    taxon: 'Albertosaurinae (Representative: Albertosaurus sarcophagus)',
    taxonMatch: 'subfamily approximation (Albertosaurinae), not species-specific'
  }),
  extinctionEvent: 'Cretaceous-Paleogene (K-Pg) extinction event (66 MYA)',
  closestLivingRelatives: JSON.stringify({
    status: 'established',
    groups: [
      'Modern Birds (Aves / Neornithes - direct surviving avian theropods)',
      'Crocodilians (Crocodilia - closest living non-dinosaurian outgroup)'
    ],
    rationale: 'Aves (modern birds) are biologically surviving avian theropod dinosaurs, nested within Coelurosauria / Tyrannosauroidea. Crocodilians represent the nearest extant sister outgroup to Dinosauria.',
    ecologicalAnalogues: [
      'Ground Hornbills & Ratites (Ostriches, Emus - cursorial bipedal terrestrial carnivores/pursuit runners)',
      'Large Birds of Prey (Accipitridae & Falconidae - raptorial hunting adaptations)'
    ],
    sources: [
      {
        title: 'Powers, M. J., et al. (2026). A new albertosaurine from the Oldman Formation, Alberta, Canada. Journal of Vertebrate Paleontology, e2728669.',
        url_or_doi: 'https://doi.org/10.1080/02724634.2026.2728669'
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
      citation: 'Powers, M. J., Napoli, J. G., Coppock, C. C., Sharpe, H. S., Garros, C. W., Demers-Potvin, A. V., Raun, G. S., Stock, J. C., Miyashita, T., & Currie, P. J. (2026). A new albertosaurine from the Oldman Formation, Alberta, Canada, illuminates ambiguity between albertosaurine and tyrannosaurine characteristics. Journal of Vertebrate Paleontology, e2728669.',
      url: 'https://doi.org/10.1080/02724634.2026.2728669'
    },
    {
      citation: 'Tromerosaurus solumons description and taxonomy - Paleobiology Database (PBDB) & Wikipedia',
      url: 'https://en.wikipedia.org/wiki/Tromerosaurus'
    }
  ]),
  placeholder: false
};

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA SAFEGUARD MIGRATION: ADD NEW SPECIES TROMEROSAURUS');
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
  const preSnapshotPath = path.join(snapshotDir, `pre_add_tromerosaurus_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Duplicate check for new species
  console.log('Step 2: Checking if Tromerosaurus already exists...');
  const existing = allBefore.find(s => s.name.toLowerCase() === TROMEROSAURUS_RECORD.name.toLowerCase());
  if (existing) {
    throw new Error(`CRITICAL: Species "${TROMEROSAURUS_RECORD.name}" already exists in database with ID ${existing.id}!`);
  }
  console.log('  ✓ Duplicate check passed: Tromerosaurus is new.\n');

  // Calculate next ID
  const maxId = allBefore.reduce((m, s) => Math.max(m, s.id), 0);
  const nextId = maxId + 1;
  console.log(`Step 3: Preparing insert for Tromerosaurus with ID ${nextId}...`);

  const recordToInsert = {
    id: nextId,
    ...TROMEROSAURUS_RECORD
  };

  const created = await prisma.species.create({
    data: recordToInsert
  });
  console.log(`  ✓ Successfully inserted species "${created.name}" with ID ${created.id}!\n`);

  // STEP 4: Post-migration snapshot & verification
  console.log('Step 4: Capturing post-migration snapshot and verifying anti-regression invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, `post_add_tromerosaurus_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  const expectedTotal = allBefore.length + 1;
  if (allAfter.length !== expectedTotal) {
    throw new Error(`CRITICAL: Species count mismatch! Expected: ${expectedTotal}, Got: ${allAfter.length}`);
  }

  let preExistingUntouched = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    let isIdentical = true;
    for (const key of Object.keys(before)) {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        isIdentical = false;
        unexpectedDiffs.push(`Pre-existing species ID ${before.id} (${before.name}) was modified in '${key}'!`);
      }
    }
    if (isIdentical) {
      preExistingUntouched++;
    }
  }

  if (unexpectedDiffs.length > 0) {
    console.error('CRITICAL SAFEGUARD FAILURES:');
    unexpectedDiffs.forEach(d => console.error('  - ' + d));
    throw new Error('Anti-regression verification failed!');
  }

  console.log(`  ✓ Verified: 100% of pre-existing species (${preExistingUntouched}/${allBefore.length}) remain completely untouched!`);
  console.log(`  ✓ Verified: Tromerosaurus added cleanly with ID ${created.id}.`);
  console.log(`  ✓ Total cataloged specimens in database: ${allAfter.length}\n`);

  // STEP 5: Synchronize Static JSON Archives
  console.log('Step 5: Synchronizing static JSON archives...');
  const fullExportPath = path.join(__dirname, '..', 'prisma', 'species_full_export.json');
  fs.writeFileSync(fullExportPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Synced master export (${allAfter.length} species): ${fullExportPath}`);

  const jurassicSpecies = allAfter.filter(s => (s.timePeriod || '').toLowerCase().includes('jurassic'));
  const cretaceousSpecies = allAfter.filter(s => (s.timePeriod || '').toLowerCase().includes('cretaceous'));
  const triassicSpecies = allAfter.filter(s => (s.timePeriod || '').toLowerCase().includes('triassic'));
  const otherSpecies = allAfter.filter(s => {
    const tp = (s.timePeriod || '').toLowerCase();
    return !tp.includes('jurassic') && !tp.includes('cretaceous') && !tp.includes('triassic');
  });

  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_jurassic.json'), JSON.stringify(jurassicSpecies, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_cretaceous.json'), JSON.stringify(cretaceousSpecies, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_triassic.json'), JSON.stringify(triassicSpecies, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_others.json'), JSON.stringify(otherSpecies, null, 2), 'utf8');
  console.log(`  ✓ Synchronized:
      - species_jurassic.json (${jurassicSpecies.length} species)
      - species_cretaceous.json (${cretaceousSpecies.length} species)
      - species_triassic.json (${triassicSpecies.length} species)
      - species_others.json (${otherSpecies.length} species)\n`);

  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('✅ TROMEROSAURUS MIGRATION COMPLETE & VERIFIED WITH ZERO REGRESSION');
  console.log('════════════════════════════════════════════════════════════════════════════');
}

main()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
