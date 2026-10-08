const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DILONG_RECORD = {
  name: 'Dilong',
  scientificName: 'Dilong paradoxus',
  nameMeaning: 'Emperor dragon with a paradox',
  timePeriod: 'Early Cretaceous',
  epoch: 'Early Cretaceous (Barremian, ~126.0–125.0 Ma)',
  myaStart: 126.0,
  myaEnd: 125.0,
  diet: 'carnivore',
  dietDetails: 'Agile small cursorial predator preying on small mammals, lizards, early avians, and juvenile ornithischians across the temperate montane lake basin forests of the Jehol Biota.',
  habitat: 'terrestrial',
  clade: 'Theropod',
  geographicRange: JSON.stringify({
    continent: 'Asia',
    region: 'Lujiatun Bed, Beipiao, Liaoning Province',
    country: 'China',
    fossilFormation: 'Yixian Formation (Jehol Biota)',
    coordinates: [41.53, 120.45]
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
    family: 'Proceratosauridae',
    genus: 'Dilong',
    species: 'Dilong paradoxus',
    source: 'Xu, X., Norell, M. A., Kuang, X., Wang, X., Zhao, Q., & Jia, C. (2004). Basal tyrannosauroids from China and evidence for protofeathers in tyrannosauroids. Nature, 431(7009), 680-684.'
  }),
  taxonomicStatus: 'valid',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Dilong_paradoxus_VQER_35.JPG',
      type: 'art',
      credit: 'LadyofHats (CC0 1.0 Universal / Public Domain)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dilong_paradoxus_VQER_35.JPG'
    }
  ]),
  discoveryHistory: '• Discovered in the volcanic Lujiatun Bed of the lower Yixian Formation near Beipiao, western Liaoning Province, China.\n• Formally described in October 2004 in Nature by Xu Xing, Mark Norell, Kuang Xuewen, Wang Xiaolin, Zhao Qi, and Jia Chengkai.\n• Holotype IVPP V 14243 comprises a nearly complete articulated skull and partial postcranial skeleton preserving clear filamentous protofeather integument (stage II simple branched plumes) along the lower jaw and caudal vertebrae.\n• Dilong delivered the first direct paleontological proof that early tyrannosauroids possessed insulating plumage, demonstrating that feather-like integument was ancestral to coelurosaurs long before the evolution of giant tyrannosaurids.',
  interestingFacts: JSON.stringify([
    'Described in 2004 by Xu Xing and colleagues, Dilong was the very first tyrannosauroid ever discovered with direct fossil impressions of protofeathers preserved in volcanic ash.',
    'The generic name translates to "Emperor dragon", while the specific name paradoxus highlights the surprising realization that ferocious apex tyrannosaur ancestors began as small, plumage-covered carnivores.',
    'Measuring just 1.6 meters (5.2 ft) in length and weighing roughly 11 to 15 kg, Dilong was an agile pursuit predator that relied on speed rather than bone-crushing brute force.',
    'Its simple filamentous integument reached up to 2 centimeters in length, providing vital thermal insulation during the chilly, snow-dusted winters of the Early Cretaceous Liaoning volcanic highlands.',
    'Phylogenetic analyses recover Dilong either as a basal tyrannosauroid or nested inside Proceratosauridae alongside Guanlong and Proceratosaurus.'
  ]),
  sizeNotes: 'Total body length approximately 1.6 meters (5.2 ft), with a hip height of 0.55 meters and an estimated body mass of 12 kg (~26 lbs). Proportions reflect an agile, slender cursorial predator with three-fingered grasping forelimbs.',
  sizeEstimate: JSON.stringify({
    length: { value: 1.6, unit: 'm', confidence: 'well-supported' },
    height: { value: 0.55, unit: 'm', confidence: 'well-supported' },
    weight: { value: 12, unit: 'kg', confidence: 'estimated' }
  }),
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/5770eb59-b382-4867-bdcc-f304eb4f0020.png',
    sourceUrl: 'https://www.phylopic.org/images/5770eb59-b382-4867-bdcc-f304eb4f0020',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    credit: 'Tasman Dixon',
    taxon: 'Tyrannosauroidea (Representative: Yutyrannus huali)',
    taxonMatch: 'clade approximation (feathered basal tyrannosauroid), not species-specific'
  }),
  extinctionEvent: 'Mid-Cretaceous faunal turnover (~120 MYA)',
  closestLivingRelatives: JSON.stringify({
    status: 'established',
    groups: [
      'Modern Birds (Aves / Neornithes - direct surviving coelurosaurian theropods)',
      'Crocodilians (Crocodilia - closest living non-dinosaurian outgroup)'
    ],
    rationale: 'Aves (modern birds) are biologically surviving coelurosaurian theropods, sharing ancestral filamentous integument homologous with early tyrannosauroid protofeathers.',
    ecologicalAnalogues: [
      'Small Wild Felids (Servals, Ocelots - small, agile terrestrial stalkers taking small vertebrates)',
      'Roadrunners & Secretarybirds (cursorial predatory birds running down small prey)'
    ],
    sources: [
      {
        title: 'Xu, X., et al. (2004). Basal tyrannosauroids from China and evidence for protofeathers in tyrannosauroids. Nature, 431(7009), 680-684.',
        url_or_doi: 'https://doi.org/10.1038/nature02855'
      }
    ],
    verified: true
  }),
  sources: JSON.stringify([
    {
      citation: 'Xu, X., Norell, M. A., Kuang, X., Wang, X., Zhao, Q., & Jia, C. (2004). Basal tyrannosauroids from China and evidence for protofeathers in tyrannosauroids. Nature, 431(7009), 680-684.',
      url: 'https://doi.org/10.1038/nature02855'
    },
    {
      citation: 'Dilong paradoxus taxon profile - Paleobiology Database (PBDB)',
      url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=64109'
    }
  ]),
  placeholder: false
};

const SINORNITHOSAURUS_RECORD = {
  name: 'Sinornithosaurus',
  scientificName: 'Sinornithosaurus millenii',
  nameMeaning: 'Chinese bird-lizard of the millennium',
  timePeriod: 'Early Cretaceous',
  epoch: 'Early Cretaceous (Barremian–Aptian, ~125.0–122.0 Ma)',
  myaStart: 125.0,
  myaEnd: 122.0,
  diet: 'carnivore',
  dietDetails: 'Small agile predatory dromaeosaurid, hunting primitive birds (Confuciusornis), small mammals, lizards, and insects in the canopy and understory of the Jehol volcanic lake forests.',
  habitat: 'terrestrial',
  clade: 'Theropod',
  geographicRange: JSON.stringify({
    continent: 'Asia',
    region: 'Sihetun Quarry, Beipiao, Liaoning Province',
    country: 'China',
    fossilFormation: 'Yixian Formation (Jehol Biota)',
    coordinates: [41.60, 120.50]
  }),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Reptilia',
    clade: 'Dinosauria',
    order: 'Saurischia',
    suborder: 'Theropoda',
    family: 'Dromaeosauridae',
    subfamily: 'Microraptorinae',
    genus: 'Sinornithosaurus',
    species: 'Sinornithosaurus millenii',
    source: 'Xu, X., Wang, X. L., & Wu, X. C. (1999). A dromaeosaurid dinosaur with a filamentous integument from the Yixian Formation of China. Nature, 401(6750), 262-266.'
  }),
  taxonomicStatus: 'valid',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Sinornithosaurus.jpg',
      type: 'art',
      credit: 'Nobu Tamura (CC BY 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sinornithosaurus.jpg'
    }
  ]),
  discoveryHistory: '• Discovered in 1999 at the Sihetun fossil locality of the lower Yixian Formation in Liaoning Province, China.\n• Formally described in September 1999 in Nature by Xu Xing, Wang Xiaolin, and Wu Xiao-chun as the fifth non-avian dinosaur discovered with fossilized feathers.\n• Holotype IVPP V 12855 preserves a nearly complete articulated skeleton exhibiting branched feather integument, modern avian-like shoulder structures, and a furcula.\n• In 2009, a controversial study by Gong et al. argued that grooved teeth and a putative maxillary depression indicated venomous capabilities, but subsequent cranial osteological analyses (Gianechini et al., 2010) demonstrated these dental grooves are standard morphological features common in many theropods.',
  interestingFacts: JSON.stringify([
    'Described in 1999 on the eve of the third millennium, Sinornithosaurus was the very first dromaeosaurid (raptor) ever proven to possess feathers.',
    'Microscopic melanosome analysis of its fossilized plumage in 2010 revealed that Sinornithosaurus possessed striking iridescent coloration, with alternating bands of rust-red, dark brown, and black.',
    'A famous 2009 hypothesis suggested Sinornithosaurus was venomous due to grooved maxillary teeth, but modern paleontologists confirmed the grooves are normal structural features found across many theropods and monitor lizards.',
    'Its shoulder girdle and arms exhibited remarkable avian adaptations, including a wishbone (furcula) and mobile shoulder joints that closely mirrored early flying birds like Archaeopteryx.',
    'As a member of Microraptorinae, it possessed backward-facing pubic bones and curved sickled claws on its second toes, ideal for pouncing on early perching birds like Confuciusornis.'
  ]),
  sizeNotes: 'Total body length approximately 1.2 meters (3.9 ft), with a hip height of 0.35 meters and an estimated body mass of 3.5 kg (~7.7 lbs). Built with lightweight, hollow pneumatic bones and feathered wings.',
  sizeEstimate: JSON.stringify({
    length: { value: 1.2, unit: 'm', confidence: 'well-supported' },
    height: { value: 0.35, unit: 'm', confidence: 'well-supported' },
    weight: { value: 3.5, unit: 'kg', confidence: 'estimated' }
  }),
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/90bf7ae5-8653-4dbf-ae36-8854ac711dab.svg',
    sourceUrl: 'https://www.phylopic.org/images/90bf7ae5-8653-4dbf-ae36-8854ac711dab',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    credit: 'T. Michael Keesey',
    taxon: 'Microraptorinae (Representative: Microraptor zhaoianus)',
    taxonMatch: 'subfamily approximation (Microraptorinae), not species-specific'
  }),
  extinctionEvent: 'Mid-Cretaceous faunal turnover (~120 MYA)',
  closestLivingRelatives: JSON.stringify({
    status: 'established',
    groups: [
      'Modern Birds (Aves / Neornithes - surviving avian theropods)',
      'Crocodilians (Crocodilia - closest living non-dinosaurian sister group)'
    ],
    rationale: 'Dromaeosaurids are among the closest known non-avian dinosaurian relatives of modern birds, belonging to Paraves.',
    ecologicalAnalogues: [
      'Goshawks & Forest Falcons (Accipitridae - small arboreal agile raptors maneuvering through dense foliage)',
      'Martens & Tree Ocelots (small, agile arboreal ambush predators)'
    ],
    sources: [
      {
        title: 'Xu, X., et al. (1999). A dromaeosaurid dinosaur with a filamentous integument from the Yixian Formation of China. Nature, 401(6750), 262-266.',
        url_or_doi: 'https://doi.org/10.1038/45769'
      },
      {
        title: 'Gianechini, F. A., et al. (2010). The myth of the venomous dinosaur: Sinornithosaurus did not have a venom apparatus. Palaeontology, 53(4), 925-932.',
        url_or_doi: 'https://doi.org/10.1111/j.1475-4983.2010.00974.x'
      }
    ],
    verified: true
  }),
  sources: JSON.stringify([
    {
      citation: 'Xu, X., Wang, X. L., & Wu, X. C. (1999). A dromaeosaurid dinosaur with a filamentous integument from the Yixian Formation of China. Nature, 401(6750), 262-266.',
      url: 'https://doi.org/10.1038/45769'
    },
    {
      citation: 'Sinornithosaurus millenii description and taxon record - Paleobiology Database (PBDB)',
      url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=68244'
    }
  ]),
  placeholder: false
};

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA SAFEGUARD MIGRATION: ADD DILONG & SINORNITHOSAURUS');
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
  const preSnapshotPath = path.join(snapshotDir, `pre_add_dilong_sinornithosaurus_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Duplicate check
  console.log('Step 2: Checking if Dilong or Sinornithosaurus already exist...');
  const existingDilong = allBefore.find(s => s.name.toLowerCase() === DILONG_RECORD.name.toLowerCase());
  if (existingDilong) {
    throw new Error(`CRITICAL: Species "${DILONG_RECORD.name}" already exists in database with ID ${existingDilong.id}!`);
  }
  const existingSinornitho = allBefore.find(s => s.name.toLowerCase() === SINORNITHOSAURUS_RECORD.name.toLowerCase());
  if (existingSinornitho) {
    throw new Error(`CRITICAL: Species "${SINORNITHOSAURUS_RECORD.name}" already exists in database with ID ${existingSinornitho.id}!`);
  }
  console.log('  ✓ Duplicate check passed: Both species are new additions.\n');

  // STEP 3: Compute next IDs and insert
  const maxId = allBefore.reduce((m, s) => Math.max(m, s.id), 0);
  const dilongId = maxId + 1;
  const sinornithosaurusId = maxId + 2;

  console.log(`Step 3: Inserting Dilong (ID: ${dilongId}) and Sinornithosaurus (ID: ${sinornithosaurusId})...`);

  const createdDilong = await prisma.species.create({
    data: {
      id: dilongId,
      ...DILONG_RECORD
    }
  });
  console.log(`  ✓ Successfully inserted species "${createdDilong.name}" with ID ${createdDilong.id}`);

  const createdSinornitho = await prisma.species.create({
    data: {
      id: sinornithosaurusId,
      ...SINORNITHOSAURUS_RECORD
    }
  });
  console.log(`  ✓ Successfully inserted species "${createdSinornitho.name}" with ID ${createdSinornitho.id}\n`);

  // STEP 4: Post-migration snapshot & verification
  console.log('Step 4: Capturing post-migration snapshot and verifying anti-regression invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, `post_add_dilong_sinornithosaurus_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  const expectedTotal = allBefore.length + 2;
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
  console.log('✅ DILONG & SINORNITHOSAURUS MIGRATION COMPLETE & VERIFIED');
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
