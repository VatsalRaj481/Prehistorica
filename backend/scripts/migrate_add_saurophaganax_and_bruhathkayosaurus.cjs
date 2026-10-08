const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SAUROPHAGANAX_RECORD = {
  name: 'Saurophaganax',
  scientificName: 'Saurophaganax maximus',
  nameMeaning: 'Greatest lord of lizard-eaters',
  timePeriod: 'Late Jurassic',
  epoch: 'Late Jurassic (Kimmeridgian–Tithonian, ~152–145 Ma)',
  myaStart: 152.0,
  myaEnd: 145.0,
  diet: 'carnivore',
  dietDetails: 'Apex hypercarnivore of the Late Jurassic Morrison ecosystem, adapted for hunting megaherbivorous sauropods (Apatosaurus, Diplodocus, Camarasaurus) and armored stegosaurs. Postcranial and cranial dimensions surpass standard Allosaurus fragilis specimens by approximately 25%.',
  habitat: 'terrestrial',
  clade: 'Theropod',
  geographicRange: JSON.stringify({
    continent: 'North America',
    region: 'Kenton, Cimarron County, Oklahoma',
    country: 'United States',
    fossilFormation: 'Morrison Formation (Upper Jurassic)',
    coordinates: [36.90, -102.96]
  }),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Reptilia',
    clade: 'Dinosauria',
    order: 'Saurischia',
    suborder: 'Theropoda',
    superfamily: 'Allosauroidea',
    family: 'Allosauridae',
    genus: 'Saurophaganax',
    species: 'Saurophaganax maximus',
    source: 'Chure, D. J. (1995). A reassessment of the gigantic theropod Saurophagus maximus from the Morrison Formation of Oklahoma. Sixth Symposium on Mesozoic Terrestrial Ecosystems and Biota, pp. 103-106.'
  }),
  taxonomicStatus: 'disputed',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Saurophaganax_NT.jpg',
      type: 'art',
      credit: 'Nobu Tamura (CC BY 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Saurophaganax_NT.jpg'
    }
  ]),
  discoveryHistory: '• Discovered between 1931 and 1932 by John Willis Stovall and Works Progress Administration (WPA) excavation crews in the Morrison Formation of Cimarron County, Oklahoma (Quarry Pit 1).\n• In 1941, Stovall informally coined the name "Saurophagus", but the moniker was preoccupied by a tyrant flycatcher described by William John Swainson in 1831, rendering it an invalid junior homonym.\n• In 1995, paleontologist Daniel J. Chure formally published the replacement name Saurophaganax maximus, establishing dorsal neural arch OMNH 1123 as the holotype and noting subhorizontal flanges on its chevrons and unique transverse vertebral laminations.\n• A persistent taxonomic debate surrounds the taxon: several prominent researchers (e.g., Gregory S. Paul, Thomas Holtz) advocate classifying it as an exceptionally large species of Allosaurus (Allosaurus maximus), while others maintain generic separation based on distinct axial autapomorphies.',
  interestingFacts: JSON.stringify([
    'Saurophaganax is the largest known carnivorous dinosaur of the Jurassic period in North America, with length estimates reaching up to 10.5 to 13 meters and mass exceeding 3.5 to 4.5 tonnes.',
    'Originally unearthed by WPA crews in the 1930s, its initial name "Saurophagus" ("lizard eater") was rejected because a living tyrant flycatcher bird already held the exact same genus name.',
    'The valid holotype OMNH 1123 is curated at the Sam Noble Oklahoma Museum of Natural History, featuring unique horizontal bony laminations connecting the neural spine bases.',
    'Its taxonomic status remains contested: while cataloged as a distinct genus by many specialists, others classify it as Allosaurus maximus, arguing the anatomical differences fall within intra-generic variation of giant allosaurs.',
    'As the ultimate apex predator of the Morrison savannahs, it shared its habitat with Allosaurus fragilis, Torvosaurus tanneri, and Ceratosaurus nasicornis, demonstrating remarkable ecological niche partitioning among giant theropods.'
  ]),
  sizeNotes: 'Estimated total length ranges from 10.5 to 13.0 meters (34–43 ft), with a hip height of approximately 3.4 meters and body mass between 3,000 to 4,500 kg (~3.3–5.0 tons). It rivals or exceeds Cretaceous apex theropods like Tyrannosaurus and Carcharodontosaurus in length, making it the supreme carnivore of the Jurassic Morrison Formation.',
  sizeEstimate: JSON.stringify({
    length: { value: 11.5, unit: 'm', confidence: 'estimated' },
    height: { value: 3.4, unit: 'm', confidence: 'estimated' },
    weight: { value: 3800, unit: 'kg', confidence: 'estimated' }
  }),
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/77061207-c2e3-4c0c-bcba-9e78cde9807d.svg',
    sourceUrl: 'https://www.phylopic.org/images/77061207-c2e3-4c0c-bcba-9e78cde9807d',
    license: 'Attribution 4.0 International',
    credit: 'Will Toosey',
    taxon: 'Allosauridae (Representative: Allosaurus fragilis)',
    taxonMatch: 'family approximation (Allosauridae), not species-specific'
  }),
  extinctionEvent: 'Jurassic-Cretaceous faunal turnover / Morrison horizon faunal transition (~145 MYA)',
  closestLivingRelatives: JSON.stringify({
    status: 'established',
    groups: [
      'Modern Birds (Aves / Neornithes - direct surviving avian theropods)',
      'Crocodilians (Crocodilia - closest living non-dinosaurian outgroup)'
    ],
    rationale: 'Modern birds (Aves) are extant coelurosaurian theropod dinosaurs, phylogenetically nested within Saurischia. Crocodilians represent the closest living non-dinosaurian sister group within Archosauria.',
    ecologicalAnalogues: [
      'Apex Big Cats (Panthera tigris, Panthera leo - apex terrestrial ambush predators hunting megaherbivores)',
      'Large Birds of Prey (Accipitridae - raptorial hunting adaptations)'
    ],
    sources: [
      {
        title: 'Chure, D. J. (1995). A reassessment of the gigantic theropod Saurophagus maximus from the Morrison Formation of Oklahoma.',
        url_or_doi: 'https://doi.org/10.1080/02724634.1995.10011244'
      },
      {
        title: 'Holtz, T. R., Jr. (2012). Dinosaurs: The Most Complete, Up-to-Date Encyclopedia for Dinosaur Lovers of All Ages.',
        url_or_doi: 'https://www.geol.umd.edu/~tholtz/dinoarchive/dinorange.htm'
      }
    ],
    verified: true
  }),
  sources: JSON.stringify([
    {
      citation: 'Chure, D. J. (1995). A reassessment of the gigantic theropod Saurophagus maximus from the Morrison Formation (Upper Jurassic) of Oklahoma. In Sixth Symposium on Mesozoic Terrestrial Ecosystems and Biota, Short Papers, pp. 103-106.',
      url: 'https://www.semanticscholar.org/paper/A-reassessment-of-the-gigantic-theropod-Saurophagus-Chure/074e2d3dfdd83b63a925da898a129035677d2944'
    },
    {
      citation: 'Saurophaganax maximus description and specimen database - Paleobiology Database (PBDB)',
      url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=53322'
    }
  ]),
  placeholder: false
};

const BRUHATHKAYOSAURUS_RECORD = {
  name: 'Bruhathkayosaurus',
  scientificName: 'Bruhathkayosaurus matleyi',
  nameMeaning: 'Huge-bodied lizard',
  timePeriod: 'Late Cretaceous',
  epoch: 'Late Cretaceous (Maastrichtian, ~72.1–66.0 Ma)',
  myaStart: 72.1,
  myaEnd: 66.0,
  diet: 'herbivore',
  dietDetails: 'Colossal high-browsing titanosaurian sauropod foraging on conifers, cycads, and angiosperms across the tropical deltaic river floodplains of the late Cretaceous Indian subcontinent.',
  habitat: 'terrestrial',
  clade: 'Sauropod',
  geographicRange: JSON.stringify({
    continent: 'Asia',
    region: 'Kallamedu, Ariyalur District, Tamil Nadu',
    country: 'India',
    fossilFormation: 'Kallamedu Formation (Cauvery Basin)',
    coordinates: [11.13, 79.08]
  }),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Reptilia',
    clade: 'Dinosauria',
    order: 'Saurischia',
    suborder: 'Sauropodomorpha',
    clade2: 'Sauropoda',
    clade3: 'Titanosauria',
    genus: 'Bruhathkayosaurus',
    species: 'Bruhathkayosaurus matleyi',
    source: 'Yadagiri, P., & Ayyasami, K. (1987). A carnosaurian dinosaur from the Kallamedu Formation (Upper Cretaceous), Tamil Nadu. Records of the Geological Survey of India, 115(2), 38-46; Pal, S., & Ayyasami, K. (2022). The lost titan of Cauvery. Geology Today.'
  }),
  taxonomicStatus: 'nomen_dubium',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Bruhathkayosaurus_matleyi_updated.png',
      type: 'art',
      credit: 'PaleoGeek (CC BY-SA 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bruhathkayosaurus_matleyi_updated.png'
    }
  ]),
  discoveryHistory: '• Discovered in 1978 near Kallamedu village in Tamil Nadu, southern India, by Geological Survey of India (GSI) paleontologists P. Yadagiri and K. Ayyasami.\n• Formally described in 1987 (Records of the GSI) and initially misidentified as a giant carnosaur / theropod, before subsequent evaluations correctly recognized it as a titanosaurian sauropod.\n• Catastrophic loss of holotype GSI PAL/SR/20: The excavated bones (including a reported 2.0-meter tibia and partial femur) were never stabilized with resin or plaster jackets. Stored in field sheds under tropical monsoon conditions, the fragile clay-hosted fossils completely disintegrated before accessioning into permanent museum collections.\n• Re-examinations in 2022–2023: Independent studies by Pal & Ayyasami (2022) and Molina-Pérez & Larramendi (2023) analyzed surviving field photographs, scaling lines, and notes, verifying authentic titanosaur osteology while confirming that without physical holotypes, the taxon must be treated with rigorous scientific caveats as a nomen dubium.',
  interestingFacts: JSON.stringify([
    'Curatorial Caveat: Bruhathkayosaurus is classified as a nomen dubium because its physical holotype fossils disintegrated due to monsoon humidity before modern museum preservation, meaning its dimensions cannot be physically re-examined.',
    'Surviving field documentation and photos indicate a tibia approximately 2.0 meters (6.6 ft) long—substantially larger than the 1.55-meter tibiae of Argentinosaurus and Patagotitan.',
    'Biomechanical scaling extrapolations estimate its body length between 35 to 44 meters (115–144 ft) and body mass between 110 to 170 tonnes, potentially rivaling the blue whale as the heaviest animal known.',
    'Initially published in 1987 as a predatory carnosaur ("flesh-eating lizard"), paleontologists soon realized the massive limb bones belonged to an advanced titanosaurian sauropod.',
    'Recent re-analyses in 2022–2023 by Pal, Ayyasami, Molina-Pérez, and Larramendi refuted claims that the fossils were petrified tree trunks, confirming authentic titanosaurian trabecular bone structure from archived field photographs.'
  ]),
  sizeNotes: '[CURATORIAL CAUTIONARY NOTE]: Because the holotype deteriorated and no physical fossils survive, dimensions are speculative upper-bound biomechanical extrapolations from archived 1978 field photographs and measurements. The reported 2.0 m tibia suggests a body length of 35–44 meters (115–144 ft), hip height of ~6.5–7.0 m, and body mass between 110,000 to 170,000 kg (110–170 tonnes), making it arguably the largest land animal proposed in paleontological literature.',
  sizeEstimate: JSON.stringify({
    length: { value: 39.0, unit: 'm', confidence: 'speculative_extrapolation' },
    height: { value: 7.0, unit: 'm', confidence: 'speculative_extrapolation' },
    weight: { value: 130000, unit: 'kg', confidence: 'speculative_extrapolation' }
  }),
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/6a1bd3a4-f0f2-44dd-b6ea-e2cdf65b421a.svg',
    sourceUrl: 'https://www.phylopic.org/images/6a1bd3a4-f0f2-44dd-b6ea-e2cdf65b421a',
    license: 'Attribution 3.0 Unported',
    credit: 'T. Michael Keesey',
    taxon: 'Titanosauria (Representative: Paralititan stromeri)',
    taxonMatch: 'clade approximation (Titanosauria), not species-specific'
  }),
  extinctionEvent: 'Cretaceous-Paleogene (K-Pg) extinction event (66 MYA)',
  closestLivingRelatives: JSON.stringify({
    status: 'established',
    groups: [
      'Modern Birds (Aves / Neornithes - surviving dinosaurian lineage)',
      'Crocodilians (Crocodilia - closest living non-dinosaurian outgroup)'
    ],
    rationale: 'Sauropods are saurischian dinosaurs whose only living phylogenetic descendants/relatives are birds (Aves), with Crocodilia as the nearest living non-dinosaurian archosaur sister outgroup.',
    ecologicalAnalogues: [
      'African Bush Elephant (Loxodonta africana - largest extant terrestrial megaherbivore / keystone landscape engineer)',
      'Blue Whale (Balaenoptera musculus - comparable extreme biological mass ceiling)'
    ],
    sources: [
      {
        title: 'Pal, S., & Ayyasami, K. (2022). The lost titan of Cauvery. Geology Today, 38(3), 112-116.',
        url_or_doi: 'https://doi.org/10.1111/gto.12390'
      },
      {
        title: 'Molina-Pérez, R., & Larramendi, A. (2023). Dinosaur Facts and Figures: The Sauropods and Other Sauropodomorphs. Princeton University Press.',
        url_or_doi: 'https://doi.org/10.1515/9780691202976'
      }
    ],
    verified: true
  }),
  sources: JSON.stringify([
    {
      citation: 'Pal, S., & Ayyasami, K. (2022). The lost titan of Cauvery. Geology Today, 38(3), 112-116.',
      url: 'https://doi.org/10.1111/gto.12390'
    },
    {
      citation: 'Molina-Pérez, R., & Larramendi, A. (2023). Dinosaur Facts and Figures: The Sauropods and Other Sauropodomorphs. Princeton University Press.',
      url: 'https://press.princeton.edu/books/hardcover/9780691190693/dinosaur-facts-and-figures'
    },
    {
      citation: 'Bruhathkayosaurus matleyi taxon record - Paleobiology Database (PBDB)',
      url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=65223'
    }
  ]),
  placeholder: false
};

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA SAFEGUARD MIGRATION: ADD SAUROPHAGANAX & BRUHATHKAYOSAURUS');
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
  const preSnapshotPath = path.join(snapshotDir, `pre_add_saurophaganax_bruhathkayosaurus_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Duplicate check for new species
  console.log('Step 2: Checking if Saurophaganax or Bruhathkayosaurus already exist...');
  const existingSauro = allBefore.find(s => s.name.toLowerCase() === SAUROPHAGANAX_RECORD.name.toLowerCase());
  if (existingSauro) {
    throw new Error(`CRITICAL: Species "${SAUROPHAGANAX_RECORD.name}" already exists in database with ID ${existingSauro.id}!`);
  }
  const existingBruhat = allBefore.find(s => s.name.toLowerCase() === BRUHATHKAYOSAURUS_RECORD.name.toLowerCase());
  if (existingBruhat) {
    throw new Error(`CRITICAL: Species "${BRUHATHKAYOSAURUS_RECORD.name}" already exists in database with ID ${existingBruhat.id}!`);
  }
  console.log('  ✓ Duplicate check passed: Both species are new additions.\n');

  // STEP 3: Compute next IDs and insert records
  const maxId = allBefore.reduce((m, s) => Math.max(m, s.id), 0);
  const saurophaganaxId = maxId + 1;
  const bruhathkayosaurusId = maxId + 2;

  console.log(`Step 3: Inserting Saurophaganax (ID: ${saurophaganaxId}) and Bruhathkayosaurus (ID: ${bruhathkayosaurusId})...`);

  const createdSauro = await prisma.species.create({
    data: {
      id: saurophaganaxId,
      ...SAUROPHAGANAX_RECORD
    }
  });
  console.log(`  ✓ Successfully inserted species "${createdSauro.name}" with ID ${createdSauro.id} (Status: ${createdSauro.taxonomicStatus})`);

  const createdBruhat = await prisma.species.create({
    data: {
      id: bruhathkayosaurusId,
      ...BRUHATHKAYOSAURUS_RECORD
    }
  });
  console.log(`  ✓ Successfully inserted species "${createdBruhat.name}" with ID ${createdBruhat.id} (Status: ${createdBruhat.taxonomicStatus})\n`);

  // STEP 4: Post-migration snapshot & verification
  console.log('Step 4: Capturing post-migration snapshot and verifying anti-regression invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, `post_add_saurophaganax_bruhathkayosaurus_${timestamp}.json`);
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
  console.log('✅ SAUROPHAGANAX & BRUHATHKAYOSAURUS MIGRATION COMPLETE & VERIFIED');
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
