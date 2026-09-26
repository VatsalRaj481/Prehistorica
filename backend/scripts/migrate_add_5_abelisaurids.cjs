const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const NEW_SPECIES = [
  {
    id: 5227,
    name: 'Rahiolisaurus',
    scientificName: 'Rahiolisaurus gujaratensis',
    nameMeaning: 'Rahioli lizard',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Maastrichtian)',
    myaStart: 70.0,
    myaEnd: 66.0,
    diet: 'carnivore',
    dietDetails: 'Apex cursorial predator that hunted sauropods (such as Isisaurus and Jainosaurus) and smaller herbivores across the semi-arid floodplains of the Indian subcontinent.',
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
      family: 'Abelisauridae',
      subfamily: 'Majungasaurinae',
      genus: 'Rahiolisaurus',
      species: 'Rahiolisaurus gujaratensis',
      source: 'Novas et al. (2010)'
    }),
    geographicRange: JSON.stringify({
      continent: 'Asia',
      region: 'Gujarat / Madhya Pradesh',
      country: 'India',
      fossilFormation: 'Lameta Formation'
    }),
    sizeEstimate: JSON.stringify({
      length: { value: 8.0, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.4, unit: 'm', confidence: 'estimated' },
      weight: { value: 1800, unit: 'kg', confidence: 'estimated' }
    }),
    sizeNotes: 'Large, slender-limbed abelisaurid reaching approximately 8 meters (26 ft) in length and weighing around 1.5 to 2 tonnes, notably more gracile than its sympatric relative Rajasaurus.',
    sizeComparisonToHuman: true,
    comparisonSilhouette: JSON.stringify({
      url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/1730665f-ffb8-4026-b9a6-e36ba92bbc24.svg',
      sourceUrl: 'https://www.phylopic.org/images/1730665f-ffb8-4026-b9a6-e36ba92bbc24',
      license: 'Attribution 3.0 Unported',
      credit: 'T. Michael Keesey',
      taxon: 'Abelisauridae (Representative: Dahalokely tokana)',
      taxonMatch: 'generic approximation, not species-specific'
    }),
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Rahiolisaurus_restoration.png',
        type: 'art',
        credit: 'Paleocolour (CC BY-SA 3.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rahiolisaurus_restoration.png'
      }
    ]),
    discoveryHistory: 'Unearthed between 1995 and 1997 near the village of Rahioli in Gujarat, India, and formally described in 2010 by Fernando Novas and an international team of paleontologists. The quarry yielded a monodominant bonebed containing at least seven individuals ranging from juveniles to mature adults.',
    interestingFacts: JSON.stringify([
      'The discovery of seven associated individuals in a single quarry provides compelling evidence for gregarious social behavior or pack-hunting strategies among abelisaurid theropods.',
      'Rahiolisaurus coexisted directly with another large abelisaurid, Rajasaurus narmadensis, in the Lameta Formation, demonstrating ecological niche partitioning between gracile cursorial and robust crushing forms.',
      'Unlike Rajasaurus, Rahiolisaurus exhibited a more slender, cursorial build with elongated metatarsals and a distinct lack of prominent nasal crests or rugose cranial ornamentation.',
      'Lived on the isolated Indian island continent as it drifted northward through the Indian Ocean toward Asia during the terminal Maastrichtian stage.'
    ]),
    extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)']),
    sources: JSON.stringify([
      {
        citation: 'Novas, F. E., Chatterjee, S., Rudra, D. K., & Datta, P. M. (2010). Rahiolisaurus gujaratensis, n. gen. n. sp., a new abelisaurid theropod from the Late Cretaceous of India. New Aspects of Mesozoic Biodiversity, Lecture Notes in Earth Sciences, 132, 45-62.',
        url: 'https://doi.org/10.1007/978-3-642-10311-7_3'
      }
    ]),
    placeholder: false
  },
  {
    id: 5228,
    name: 'Thanos',
    scientificName: 'Thanos simonattoi',
    nameMeaning: 'Thanos (Marvel Titan) + honoring discoverer Sérgio Simonatto',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Santonian)',
    myaStart: 86.0,
    myaEnd: 83.0,
    diet: 'carnivore',
    dietDetails: 'Medium-sized hypercarnivore hunting small crocodylomorphs, turtles, lizards, and juvenile titanosaur sauropods.',
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
      family: 'Abelisauridae',
      clade: 'Brachyrostra',
      genus: 'Thanos',
      species: 'Thanos simonattoi',
      source: 'Delcourt & Iori (2020)'
    }),
    geographicRange: JSON.stringify({
      continent: 'South America',
      region: 'São Paulo',
      country: 'Brazil',
      fossilFormation: 'São José do Rio Preto Formation (Bauru Group)'
    }),
    sizeEstimate: JSON.stringify({
      length: { value: 5.5, unit: 'm', confidence: 'estimated' },
      height: { value: 1.8, unit: 'm', confidence: 'estimated' },
      weight: { value: 850, unit: 'kg', confidence: 'estimated' }
    }),
    sizeNotes: 'Estimated at 5.5 to 6.5 meters in total body length and around 800 to 1,000 kg in body mass, representing a mid-tier abelisaurid predator of the Bauru Group.',
    sizeComparisonToHuman: true,
    comparisonSilhouette: JSON.stringify({
      url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/1730665f-ffb8-4026-b9a6-e36ba92bbc24.svg',
      sourceUrl: 'https://www.phylopic.org/images/1730665f-ffb8-4026-b9a6-e36ba92bbc24',
      license: 'Attribution 3.0 Unported',
      credit: 'T. Michael Keesey',
      taxon: 'Abelisauridae (Representative: Dahalokely tokana)',
      taxonMatch: 'generic approximation, not species-specific'
    }),
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Thanos_simonattoi.png',
        type: 'art',
        credit: 'Juan(-username-) (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Thanos_simonattoi.png'
      }
    ]),
    discoveryHistory: 'Found in 2014 by Brazilian paleontologist Sérgio Simonatto in outcropping strata of the São José do Rio Preto Formation near Ibirá, São Paulo, Brazil. Formally described by Rafael Delcourt and Fabiano Vidoi Iori in late 2018 (published in 2020), gaining international fame for its Marvel Comics-inspired namesake.',
    interestingFacts: JSON.stringify([
      'Named after Thanos, the fictional cosmic supervillain created by Jim Starlin for Marvel Comics, combined with the patronym simonattoi honoring its finder.',
      'The holotype consists of a well-preserved axis vertebra possessing unique keels and neurocentral synapomorphies placing it within the short-snouted clade Brachyrostra.',
      'Thanos shared its semi-arid inland environment with an even larger, unnamed megaraptoran theropod, serving as the fast, agile medium carnivore of the fauna.',
      'Presents unique vertebral architecture, including a pronounced frontoventral keel and forward-oriented prezygapophyses suited for stabilizing the neck during predatory strikes.'
    ]),
    extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)']),
    sources: JSON.stringify([
      {
        citation: 'Delcourt, R., & Iori, F. V. (2020). A new Abelisauridae (Dinosauria: Theropoda) from São José do Rio Preto Formation, Upper Cretaceous of Brazil and comments on the Bauru Group fauna. Historical Biology, 32(7), 917-924.',
        url: 'https://doi.org/10.1080/08912963.2018.1546700'
      }
    ]),
    placeholder: false
  },
  {
    id: 5229,
    name: 'Viavenator',
    scientificName: 'Viavenator exxoni',
    nameMeaning: 'Road hunter of ExxonMobil',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Santonian)',
    myaStart: 86.3,
    myaEnd: 83.6,
    diet: 'carnivore',
    dietDetails: 'Active macropredator equipped with a kinetic skull and reinforced spine designed to withstand high torsional stress while tackling medium-to-large titanosaur sauropods.',
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
      family: 'Abelisauridae',
      clade: 'Furileusauria',
      genus: 'Viavenator',
      species: 'Viavenator exxoni',
      source: 'Filippi et al. (2016)'
    }),
    geographicRange: JSON.stringify({
      continent: 'South America',
      region: 'Neuquén Province / Patagonia',
      country: 'Argentina',
      fossilFormation: 'Bajo de la Carpa Formation'
    }),
    sizeEstimate: JSON.stringify({
      length: { value: 5.6, unit: 'm', confidence: 'well-supported' },
      height: { value: 1.8, unit: 'm', confidence: 'well-supported' },
      weight: { value: 850, unit: 'kg', confidence: 'estimated' }
    }),
    sizeNotes: 'Moderately sized abelisaurid reaching 5.6 meters (18.4 ft) in length and weighing around 850 kg, serving as the holotype genus of the specialized South American clade Furileusauria.',
    sizeComparisonToHuman: true,
    comparisonSilhouette: JSON.stringify({
      url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/1730665f-ffb8-4026-b9a6-e36ba92bbc24.svg',
      sourceUrl: 'https://www.phylopic.org/images/1730665f-ffb8-4026-b9a6-e36ba92bbc24',
      license: 'Attribution 3.0 Unported',
      credit: 'T. Michael Keesey',
      taxon: 'Abelisauridae (Representative: Dahalokely tokana)',
      taxonMatch: 'generic approximation, not species-specific'
    }),
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Viavenator.jpg',
        type: 'art',
        credit: 'Paleocolour (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Viavenator.jpg'
      }
    ]),
    discoveryHistory: 'Found in 2014 northwest of Rincón de los Sauces in Neuquén Province, Argentina, during oil access road building by ExxonMobil. Described in 2016 by Leonardo Filippi and colleagues based on an exquisitely preserved articulated skeleton including a complete braincase, vertebrae, ribs, and limb elements.',
    interestingFacts: JSON.stringify([
      'Computed tomography (CT) scans of the Viavenator neurocranium revealed an inner ear with an elongated horizontal semicircular canal, indicating specialized rapid lateral head reflexes and downward gaze orientation during prey pursuit.',
      'Served as the anchor taxon for establishing the clade Furileusauria (\'stiff-backed lizards\'), characterized by hyper-ossified vertebral interlocks that rigidified the middle torso for explosive forward propulsion.',
      'The name honors ExxonMobil Exploration Argentina for providing funding, logistical support, and paleontological heritage preservation during fossil salvage.',
      'Possessed specialized hyposphene-hypantrum accessory articulations in its dorsal vertebrae, making its backbone remarkably resistant to rotational torque while subduing struggling prey.'
    ]),
    extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)']),
    sources: JSON.stringify([
      {
        citation: 'Filippi, L. S., Méndez, A. H., Juárez Valieri, R. D., & Garrido, A. C. (2016). A new brachyrostran with hypertrophied axial structures reveals an unexpected radiation of latest Cretaceous abelisaurids. Cretaceous Research, 61, 209-219.',
        url: 'https://doi.org/10.1016/j.cretres.2015.12.018'
      }
    ]),
    placeholder: false
  },
  {
    id: 5230,
    name: 'Skorpiovenator',
    scientificName: 'Skorpiovenator bustingorryi',
    nameMeaning: 'Scorpion hunter + honoring landowner Manuel Bustingorry',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Cenomanian to Turonian)',
    myaStart: 95.0,
    myaEnd: 93.0,
    diet: 'carnivore',
    dietDetails: 'Ferocious apex predator with heavily textured, compact jaws armed with 19 to 21 serrated teeth per side, adapted to deliver powerful crushing bites against titanosaur sauropods.',
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
      family: 'Abelisauridae',
      clade: 'Brachyrostra',
      genus: 'Skorpiovenator',
      species: 'Skorpiovenator bustingorryi',
      source: 'Canale et al. (2009)'
    }),
    geographicRange: JSON.stringify({
      continent: 'South America',
      region: 'Neuquén Province / Patagonia',
      country: 'Argentina',
      fossilFormation: 'Huincul Formation'
    }),
    sizeEstimate: JSON.stringify({
      length: { value: 6.2, unit: 'm', confidence: 'well-supported' },
      height: { value: 2.1, unit: 'm', confidence: 'well-supported' },
      weight: { value: 1400, unit: 'kg', confidence: 'well-supported' }
    }),
    sizeNotes: 'Robust, heavy-set abelisaurid measuring 6.2 meters (20.3 ft) in length and weighing approximately 1.4 tonnes, possessing one of the most complete skeletons known in the clade.',
    sizeComparisonToHuman: true,
    comparisonSilhouette: JSON.stringify({
      url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/1730665f-ffb8-4026-b9a6-e36ba92bbc24.svg',
      sourceUrl: 'https://www.phylopic.org/images/1730665f-ffb8-4026-b9a6-e36ba92bbc24',
      license: 'Attribution 3.0 Unported',
      credit: 'T. Michael Keesey',
      taxon: 'Abelisauridae (Representative: Dahalokely tokana)',
      taxonMatch: 'generic approximation, not species-specific'
    }),
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Skorpiovenator_bustingorryi.jpg',
        type: 'art',
        credit: 'Paleocolour (colour) & D-Juan (lineart) (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Skorpiovenator_bustingorryi.jpg'
      }
    ]),
    discoveryHistory: 'Discovered in 2008 on the Bustingorry family ranch near Villa El Chocón in Neuquén, Argentina. Excavated by paleontologists Juan Ignacio Canale, Carlos Scanferla, and Federico Agnolin. The holotype is one of the most articulated abelisaur skeletons ever unearthed, missing only the distal forelimbs and tail tip.',
    interestingFacts: JSON.stringify([
      'Named \'scorpion hunter\' because the field team encountered dozens of aggressive scorpions (Bothriurus) swarming around the excavation pit in the scorching Patagonian desert.',
      'The skull of Skorpiovenator is remarkably short and tall, with deeply rugose, pitted external bone surfaces that supported thick keratinous armor or bosses in life.',
      'Coexisted with the colossal carcharodontosaurid Mapusaurus and giant titanosaurs like Argentinosaurus, occupying the mid-tier apex carnivore niche.',
      'Possessed disproportionately tiny, vestigial four-fingered forelimbs characteristic of derived abelisaurids, rendering the arms non-functional for prey capture.'
    ]),
    extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)']),
    sources: JSON.stringify([
      {
        citation: 'Canale, J. I., Scanferla, C. A., Agnolin, F. L., & Novas, F. E. (2009). New carnivorous dinosaur from the Late Cretaceous of NW Patagonia and the evolution of abelisaurid theropods. Naturwissenschaften, 96(3), 409-414.',
        url: 'https://doi.org/10.1007/s00114-008-0487-4'
      }
    ]),
    placeholder: false
  },
  {
    id: 5231,
    name: 'Quilmesaurus',
    scientificName: 'Quilmesaurus curriei',
    nameMeaning: 'Quilmes (indigenous nation) lizard + honoring Philip J. Currie',
    timePeriod: 'Late Cretaceous',
    epoch: 'Late Cretaceous (Campanian to Maastrichtian)',
    myaStart: 75.0,
    myaEnd: 70.0,
    diet: 'carnivore',
    dietDetails: 'Swift, agile theropod predator hunting hadrosaurids (like Willinakaqe), saltasaurine sauropods, and ornithischians in southern South American coastal wetlands.',
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
      family: 'Abelisauridae',
      clade: 'Furileusauria',
      genus: 'Quilmesaurus',
      species: 'Quilmesaurus curriei',
      source: 'Coria (2001)'
    }),
    geographicRange: JSON.stringify({
      continent: 'South America',
      region: 'Río Negro Province / Patagonia',
      country: 'Argentina',
      fossilFormation: 'Allen Formation'
    }),
    sizeEstimate: JSON.stringify({
      length: { value: 5.3, unit: 'm', confidence: 'estimated' },
      height: { value: 1.7, unit: 'm', confidence: 'estimated' },
      weight: { value: 750, unit: 'kg', confidence: 'estimated' }
    }),
    sizeNotes: 'Estimated at 5.3 meters in length and roughly 750 kg in body mass, with distinctive cursorial specializations in the lower leg and cnemial crest.',
    sizeComparisonToHuman: true,
    comparisonSilhouette: JSON.stringify({
      url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/1730665f-ffb8-4026-b9a6-e36ba92bbc24.svg',
      sourceUrl: 'https://www.phylopic.org/images/1730665f-ffb8-4026-b9a6-e36ba92bbc24',
      license: 'Attribution 3.0 Unported',
      credit: 'T. Michael Keesey',
      taxon: 'Abelisauridae (Representative: Dahalokely tokana)',
      taxonMatch: 'generic approximation, not species-specific'
    }),
    media: JSON.stringify([
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Quilmesaurus_curriei.jpg',
        type: 'art',
        credit: 'Paleocolour (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Quilmesaurus_curriei.jpg'
      }
    ]),
    discoveryHistory: 'Collected in 1988 by fieldwork teams from the Universidad Nacional del Comahue in the Salitral Ojo de Agua region of Río Negro, Argentina. Described in 2001 by celebrated Argentine paleontologist Rodolfo Coria, who named it in honor of the native Quilmes people and Canadian theropod expert Philip J. Currie.',
    interestingFacts: JSON.stringify([
      'The generic name honors the Quilmes, a brave indigenous Diaguita group from northwestern Argentina who fiercely resisted both the Inca Empire and Spanish colonization.',
      'Originally considered of enigmatic affinity with possible coelurosaurian traits, subsequent anatomical restudy demonstrated clear abelisaurid synapomorphies in the distal tibia and cnemial crest.',
      'Phylogenetic studies placed Quilmesaurus in Furileusauria alongside Viavenator and Carnotaurus, illustrating the explosive radiation of abelisaurs across terminal Cretaceous Gondwana.',
      'Inhabited the coastal estuarine marshes of the Allen Formation, an ecosystem rich in hadrosaurs, titanosaur nesting colonies, and diverse aquatic vertebrates.'
    ]),
    extinctionEvent: 'K-Pg Extinction Event (66 MYA)',
    closestLivingRelatives: JSON.stringify(['Modern Birds (Aves)']),
    sources: JSON.stringify([
      {
        citation: 'Coria, R. A. (2001). A new theropod from the Late Cretaceous of Patagonia. In Tanke, D. H. & Carpenter, K. (eds.), Mesozoic Vertebrate Life, Indiana University Press, Bloomington, pp. 3-9.',
        url: 'https://www.worldcat.org/title/mesozoic-vertebrate-life/oclc/45888806'
      },
      {
        citation: 'Juárez Valieri, R. D., Fiorelli, L. E., & Cruz, L. E. (2010). Quilmesaurus curriei Coria, 2001. Su validez taxonómica y relaciones filogenéticas. Revista del Museo Argentino de Ciencias Naturales, 12(1), 77-88.',
        url: 'http://www.macn.secyt.gov.ar/investigacion/revistas/rmacn/12/rmacn_12_1_77-88.pdf'
      }
    ]),
    placeholder: false
  }
];

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('AUDITED MIGRATION: ADD 5 ABELISAURID THEROPODS (IDs 5227–5231)');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration database snapshot
  console.log('Step 1: Capturing pre-migration database snapshot...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Database baseline: ${allBefore.length} species.`);

  if (allBefore.length !== 596) {
    throw new Error(`Expected exactly 596 species before migration, found ${allBefore.length}!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preSnapshotPath = path.join(snapshotDir, `pre_add_5_abelisaurs_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Insert new species (Insert-Only Policy)
  console.log('Step 2: Inserting 5 new species via Insert-Only Policy...');
  const insertedSpecies = [];
  for (const spDef of NEW_SPECIES) {
    const existing = await prisma.species.findFirst({
      where: {
        OR: [
          { id: spDef.id },
          { name: { equals: spDef.name, mode: 'insensitive' } }
        ]
      }
    });

    if (existing) {
      throw new Error(`Species ${spDef.name} (or ID ${spDef.id}) already exists in DB! Aborting.`);
    }

    const created = await prisma.species.create({
      data: spDef
    });
    console.log(`  ✓ Inserted ID ${created.id}: ${created.name} (${created.scientificName})`);
    insertedSpecies.push(created);
  }

  // STEP 3: Post-migration database snapshot & invariant validation
  console.log('\nStep 3: Capturing post-migration database snapshot & running invariant validation...');
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const postSnapshotPath = path.join(snapshotDir, `post_add_5_abelisaurs_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== 601) {
    throw new Error(`Expected exactly 601 species after insertion, found ${allAfter.length}!`);
  }

  // Verify all 5 inserted species exist
  for (const expected of NEW_SPECIES) {
    const found = allAfter.find(s => s.id === expected.id);
    if (!found || found.name !== expected.name) {
      throw new Error(`New species ID ${expected.id} (${expected.name}) missing from post-migration DB!`);
    }
  }

  // Verify 100% of non-target records remain untouched
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
  console.log(`  - New species inserted: ${insertedSpecies.length} / 5`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetUntouched} / 596 (100.0%)`);

  if (unexpectedDiffs.length > 0) {
    console.error('\n❌ CRITICAL: Regressions detected:');
    unexpectedDiffs.forEach(d => console.error('    ✕ ' + d));
    throw new Error('Anti-regression safeguard invariant violated! Aborting.');
  }
  console.log('  ✅ 100% SAFEGUARD VERIFIED: Zero regressions detected across all non-target records.\n');

  // STEP 4: Synchronize Static JSON Archives
  console.log('Step 4: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // 1. species_full_export.json
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
  for (const sp of insertedSpecies) {
    fullExport.push(sp);
  }
  fs.writeFileSync(fullExportPath, JSON.stringify(fullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json (${fullExport.length} total records)`);

  // 2. species_cretaceous.json
  const cretPath = path.join(prismaDir, 'species_cretaceous.json');
  const cretJson = JSON.parse(fs.readFileSync(cretPath, 'utf8'));
  for (const sp of insertedSpecies) {
    cretJson.push(sp);
  }
  fs.writeFileSync(cretPath, JSON.stringify(cretJson, null, 2), 'utf8');
  console.log(`  ✓ Updated species_cretaceous.json (${cretJson.length} total records)`);

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ ALL 5 ABELISAURID INGESTION OPERATIONS COMPLETED WITH 100% INVARIANT VERIFICATION!');
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
