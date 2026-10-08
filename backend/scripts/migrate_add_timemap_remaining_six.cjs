const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SALTOPUS_RECORD = {
  name: 'Saltopus',
  scientificName: 'Saltopus elginensis',
  nameMeaning: 'Hopping foot from Elgin',
  timePeriod: 'Late Triassic',
  epoch: 'Late Triassic (Carnian, ~230.0–225.0 Ma)',
  myaStart: 230.0,
  myaEnd: 225.0,
  diet: 'carnivore',
  dietDetails: 'Small, nimble cursorial predator and opportunistic insectivore preying on early lepidosaurs, insects, and small tetrapods across arid sandstone dune fields.',
  habitat: 'terrestrial',
  clade: 'Silesaurid',
  geographicRange: JSON.stringify({
    continent: 'Europe',
    region: 'Lossiemouth Sandstone Formation, Morayshire',
    country: 'United Kingdom (Scotland)',
    fossilFormation: 'Lossiemouth Sandstone Formation',
    coordinates: [57.71, -3.31]
  }),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Reptilia',
    clade: 'Dinosauriformes',
    order: 'Saurischia',
    family: 'Silesauridae',
    genus: 'Saltopus',
    species: 'Saltopus elginensis',
    source: 'Benton, M. J., & Walker, A. D. (2011). Saltopus, a dinosauriform from the Upper Triassic of Scotland. Earth and Environmental Science Transactions of the Royal Society of Edinburgh, 101(3-4), 285-299.'
  }),
  taxonomicStatus: 'valid',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Saltopus_NT_small.jpg',
      type: 'art',
      credit: 'Nobu Tamura (CC BY 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Saltopus_NT_small.jpg'
    }
  ]),
  discoveryHistory: '• Discovered in the Lossiemouth Sandstone Formation near Lossiemouth in Morayshire, northeastern Scotland.\n• Formally described in 1910 by German paleontologist Friedrich von Huene based on holotype NHMUK R.3915, a partial skeleton preserved as an impression in sandstone.\n• Re-evaluated comprehensively in 2011 by Michael Benton and Alick Walker using advanced high-resolution PVC peels of the sandstone mold, identifying it as a basal dinosauriform closely related to or nested within Silesauridae.\n• Saltopus represents one of the earliest known avemetatarsalian archosaurs in the British fossil record, shedding crucial light on the origin of dinosaur locomotion.',
  interestingFacts: JSON.stringify([
    'Saltopus measured approximately 80 to 100 cm (2.6 to 3.3 ft) in length and weighed roughly 1 kg, making it no larger than a modern domestic cat.',
    'The generic name translates to "hopping foot", given by Friedrich von Huene under the early 20th-century assumption that its elongated hindlimbs were adapted for saltatorial (jumping) locomotion.',
    'Detailed re-study of the holotype mold showed that its slender, hollow bones and elongated metatarsals were designed for high-speed cursorial running rather than hopping.',
    'Phylogenetic studies place Saltopus as a basal dinosauriform or early silesaurid, representing the immediate evolutionary prelude to true dinosaurs.'
  ]),
  sizeNotes: 'Length: ~0.8–1.0 m (2.6–3.3 ft); hip height: ~0.25 m; estimated body mass: ~1.0 kg.',
  sizeEstimate: JSON.stringify({
    length: { value: 0.9, unit: 'm', confidence: 'well-supported' },
    height: { value: 0.25, unit: 'm', confidence: 'well-supported' },
    weight: { value: 1.0, unit: 'kg', confidence: 'well-supported' }
  }),
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/054a0b43-ac08-473a-841e-725bc757cdee.png',
    sourceUrl: 'https://www.phylopic.org/images/054a0b43-ac08-473a-841e-725bc757cdee',
    license: 'Attribution 3.0 Unported',
    credit: 'Mathew Wedel',
    taxon: 'Silesauridae (Representative: Silesaurus opolensis)',
    taxonMatch: 'family approximation (Silesauridae), not species-specific'
  }),
  extinctionEvent: null,
  closestLivingRelatives: JSON.stringify({
    status: 'established',
    groups: [
      'Modern Birds (Aves - archosaur crown survivor)',
      'Crocodilians (Crocodilia - archosaur crown survivor)'
    ],
    rationale: 'Stem-archosaur / dinosauriform reptile; modern birds and crocodilians represent the two living crown lineages of Archosauria.',
    ecologicalAnalogues: [
      'Roadrunner (Geococcyx californianus - cursorial insectivorous agility)'
    ],
    sources: [
      {
        title: 'Benton, M. J., & Walker, A. D. (2011). Saltopus, a dinosauriform from the Upper Triassic of Scotland. Earth and Environmental Science Transactions of the Royal Society of Edinburgh, 101(3-4), 285-299.',
        url_or_doi: 'https://doi.org/10.1017/S175569101102011X'
      }
    ],
    verified: true
  }),
  sources: JSON.stringify([
    {
      citation: 'Paleobiology Database (PBDB) - Saltopus elginensis',
      url: 'https://paleobiodb.org'
    },
    {
      citation: 'Benton & Walker (2011) Saltopus, a dinosauriform from the Upper Triassic of Scotland',
      url: 'https://doi.org/10.1017/S175569101102011X'
    }
  ]),
  placeholder: false
};

const MAMMOTH_RECORD = {
  name: 'Columbian Mammoth',
  scientificName: 'Mammuthus columbi',
  nameMeaning: 'Mammoth of Columbus',
  timePeriod: 'Pleistocene',
  epoch: 'Late Pleistocene (~1.5 Ma–11,500 YA)',
  myaStart: 1.5,
  myaEnd: 0.0115,
  diet: 'herbivore',
  dietDetails: 'Mixed feeder and bulk grazer consuming C3 and C4 prairie grasses, sedges, acacia, sagebrush, and riparian foliage across savannas and open woodlands.',
  habitat: 'terrestrial',
  clade: 'Early_Mammal_Synapsid',
  geographicRange: JSON.stringify({
    continent: 'North America',
    region: 'Rancho La Brea, California & Hot Springs, South Dakota',
    country: 'United States and Mexico',
    fossilFormation: 'Rancho La Brea / Mammoth Site Hot Springs',
    coordinates: [34.06, -118.36]
  }),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Proboscidea',
    family: 'Elephantidae',
    genus: 'Mammuthus',
    species: 'Mammuthus columbi',
    source: 'Lister, A. M., & Sher, A. V. (2015). Evolution and taxonomy of Eurasian and North American mammoths. Quaternary Science Reviews, 113, 77-83.'
  }),
  taxonomicStatus: 'valid',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Columbian_mammoth.jpg',
      type: 'art',
      credit: 'National Park Service / Charles R. Knight (Public Domain)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Columbian_mammoth.jpg'
    }
  ]),
  discoveryHistory: '• First described in 1857 by Scottish naturalist Hugh Falconer based on fossil teeth discovered in Georgia, USA.\n• Named in honor of Christopher Columbus.\n• Thousands of remains have been recovered across North America, notably at the Hot Springs Mammoth Site in South Dakota (over 60 individuals in a sinkhole trap) and the Rancho La Brea tar pits in Los Angeles.\n• Recent ancient DNA sequencing (including 1-million-year-old Krestovka permafrost lineages) demonstrated that Columbian mammoths arose through ancient hybridization between the woolly mammoth and an archaic Eurasian mammoth lineage.',
  interestingFacts: JSON.stringify([
    'Standing up to 4.0 to 4.2 meters (13 to 14 ft) tall at the shoulder and weighing up to 10 metric tons (22,000 lbs), the Columbian mammoth was significantly larger than both the woolly mammoth and modern African elephants.',
    'Its massive spiral tusks were among the longest of any proboscidean, reaching lengths of up to 4.9 meters (16 ft) and curving dramatically inward.',
    'Unlike its cold-adapted shaggy cousin the woolly mammoth, Mammuthus columbi inhabited warmer temperate grasslands, savannas, and shrublands from southern Canada down to Costa Rica.',
    'Dental wear patterns and isotopic analyses show Columbian mammoths consumed predominantly C4 prairie grasses, playing an indispensable role as ecosystem engineers by maintaining open savanna biomes.'
  ]),
  sizeNotes: 'Shoulder height: 3.7–4.2 m (12–14 ft); total length: ~4.5–5.0 m; body mass: 8,000–10,000 kg (8–10 metric tonnes).',
  sizeEstimate: JSON.stringify({
    length: { value: 4.8, unit: 'm', confidence: 'well-supported' },
    height: { value: 4.0, unit: 'm', confidence: 'well-supported' },
    weight: { value: 9500, unit: 'kg', confidence: 'well-supported' }
  }),
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/6f0acd79-1f7d-402f-8679-dc3036b1a504.svg',
    sourceUrl: 'https://www.phylopic.org/images/6f0acd79-1f7d-402f-8679-dc3036b1a504',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    credit: 'Amy Beauvois',
    taxon: 'Mammuthus (Representative: Mammuthus primigenius)',
    taxonMatch: 'genus-level match (Mammuthus)'
  }),
  extinctionEvent: null,
  closestLivingRelatives: JSON.stringify({
    status: 'established',
    groups: [
      'Asian Elephant (Elephas maximus)',
      'African Bush & Forest Elephants (Loxodonta africana, L. cyclotis)'
    ],
    rationale: 'Mammoths belong to Elephantidae; genetic evidence proves Mammuthus is the sister genus to the living Asian elephant (Elephas maximus).',
    ecologicalAnalogues: [
      'African Bush Elephant (Loxodonta africana - megaherbivore keystone ecology)'
    ],
    sources: [
      {
        title: 'Palkopoulou, E., et al. (2018). A comprehensive genomic history of extinct and living elephants. PNAS, 115(11), E2566-E2574.',
        url_or_doi: 'https://doi.org/10.1073/pnas.1720554115'
      }
    ],
    verified: true
  }),
  sources: JSON.stringify([
    {
      citation: 'Paleobiology Database (PBDB) - Mammuthus columbi',
      url: 'https://paleobiodb.org'
    },
    {
      citation: 'Lister & Sher (2015) Evolution and taxonomy of Eurasian and North American mammoths',
      url: 'https://doi.org/10.1016/j.quascirev.2015.02.020'
    }
  ]),
  placeholder: false
};

const DIRE_WOLF_RECORD = {
  name: 'Dire Wolf',
  scientificName: 'Aenocyon dirus',
  nameMeaning: 'Fearsome dreadful wolf',
  timePeriod: 'Pleistocene',
  epoch: 'Late Pleistocene (~125,000–9,500 YA)',
  myaStart: 0.125,
  myaEnd: 0.0095,
  diet: 'carnivore',
  dietDetails: 'Hypercarnivorous apex pack hunter targeting large Pleistocene ungulates including ancient bison (Bison antiquus), wild horses, camelids, and ground sloths.',
  habitat: 'terrestrial',
  clade: 'Early_Mammal_Synapsid',
  geographicRange: JSON.stringify({
    continent: 'North America',
    region: 'Rancho La Brea Tar Pits, California',
    country: 'United States',
    fossilFormation: 'Rancho La Brea Formation',
    coordinates: [34.06, -118.36]
  }),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Carnivora',
    suborder: 'Caniformia',
    family: 'Canidae',
    genus: 'Aenocyon',
    species: 'Aenocyon dirus',
    source: 'Perri, A. R., Mitchell, K. J., Mouton, A., et al. (2021). Dire wolves were the last of an ancient New World canid lineage. Nature, 591(7848), 87-91.'
  }),
  taxonomicStatus: 'valid',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/The_American_Museum_journal_%28c1900-%281918%29%29_%28Aenocyon_dirus%29.jpg',
      type: 'art',
      credit: 'Charles R. Knight (American Museum of Natural History, 1918, Public Domain)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:The_American_Museum_journal_(c1900-(1918))_(Aenocyon_dirus).jpg'
    }
  ]),
  discoveryHistory: '• First described in 1858 by American paleontologist Joseph Leidy from a fossil jaw found along the Ohio River, initially named Canis dirus.\n• Over 4,000 individual dire wolf skeletons have been excavated from the asphalt seeps of the Rancho La Brea tar pits in California, far outnumbering any other mammalian predator.\n• A landmark 2021 ancient genomic study published in Nature sequenced five dire wolf nuclear genomes, revealing that dire wolves diverged from other canids ~5.7 million years ago and represent a distinct endemic New World genus (Aenocyon), having evolved in reproductive isolation with zero gene flow with gray wolves.',
  interestingFacts: JSON.stringify([
    'With over 4,000 individuals cataloged at Rancho La Brea, the dire wolf is the most abundant fossil carnivore in the Ice Age record of North America.',
    'Dire wolves possessed massive cranial bite forces and robust carnassial teeth capable of crushing megafauna bones to extract nutrient-rich marrow.',
    'Although superficially resembling a giant gray wolf, dire wolves possessed heavier bone density, broader heads, and shorter, stockier limbs adapted for explosive ambush tackling rather than endless cursorial pursuits.',
    'High rates of healed skeletal fractures and healed skull puncture wounds at La Brea demonstrate fierce territorial pack fights as well as social care among injured pack members.'
  ]),
  sizeNotes: 'Head-and-body length: 1.5–1.75 m (5.0–5.7 ft); shoulder height: 0.8–0.85 m; body mass: 60–68 kg (large specimens up to 80 kg).',
  sizeEstimate: JSON.stringify({
    length: { value: 1.6, unit: 'm', confidence: 'well-supported' },
    height: { value: 0.82, unit: 'm', confidence: 'well-supported' },
    weight: { value: 65, unit: 'kg', confidence: 'well-supported' }
  }),
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/5036f260-5a0d-42c5-a0bd-9eb0729e54e0.svg',
    sourceUrl: 'https://www.phylopic.org/images/5036f260-5a0d-42c5-a0bd-9eb0729e54e0',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    credit: 'Steven Traver',
    taxon: 'Canis (Representative: Canis lupus)',
    taxonMatch: 'genus-level match (Canis / Canidae)'
  }),
  extinctionEvent: null,
  closestLivingRelatives: JSON.stringify({
    status: 'established',
    groups: [
      'African Jackals (Lupulella mesomelas, L. adusta)',
      'Dhole (Cuon alpinus)',
      'African Wild Dog (Lycaon pictus)',
      'Gray Wolf & Coyote (Canis lupus, C. latrans)'
    ],
    rationale: 'Ancient nuclear genomes prove Aenocyon dirus represents an ancient, divergent New World branch of Canidae that split ~5.7 million years ago from the lineage leading to modern wolves and jackals.',
    ecologicalAnalogues: [
      'Gray Wolf (Canis lupus - cooperative pack predation)',
      'Spotted Hyena (Crocuta crocuta - bone-crushing dentition)'
    ],
    sources: [
      {
        title: 'Perri, A. R., et al. (2021). Dire wolves were the last of an ancient New World canid lineage. Nature, 591(7848), 87-91.',
        url_or_doi: 'https://doi.org/10.1038/s41586-020-03082-x'
      }
    ],
    verified: true
  }),
  sources: JSON.stringify([
    {
      citation: 'Paleobiology Database (PBDB) - Aenocyon dirus',
      url: 'https://paleobiodb.org'
    },
    {
      citation: 'Perri et al. (2021) Dire wolves were the last of an ancient New World canid lineage',
      url: 'https://doi.org/10.1038/s41586-020-03082-x'
    }
  ]),
  placeholder: false
};

const CAVE_BEAR_RECORD = {
  name: 'Cave Bear',
  scientificName: 'Ursus spelaeus',
  nameMeaning: 'Cave bear',
  timePeriod: 'Pleistocene',
  epoch: 'Late Pleistocene (~300,000–24,000 YA)',
  myaStart: 0.3,
  myaEnd: 0.024,
  diet: 'herbivore',
  dietDetails: 'Predominantly herbivorous forager consuming nutrient-dense subalpine herbs, foliage, roots, berries, and acorns to build fat reserves prior to prolonged winter cave hibernation.',
  habitat: 'terrestrial',
  clade: 'Early_Mammal_Synapsid',
  geographicRange: JSON.stringify({
    continent: 'Europe',
    region: 'Chauvet-Pont d\'Arc Cave & Peștera cu Oase',
    country: 'France, Romania, and Central Europe',
    fossilFormation: 'Karst cave deposits across Central Europe',
    coordinates: [44.38, 4.41]
  }),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Carnivora',
    suborder: 'Caniformia',
    family: 'Ursidae',
    genus: 'Ursus',
    species: 'Ursus spelaeus',
    source: 'Barlow, A., Cahill, J. A., Hartmann, S., et al. (2018). Partial genomic survival of cave bears in living brown bears. Nature Ecology & Evolution, 2(10), 1563-1570.'
  }),
  taxonomicStatus: 'valid',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Ursus_spelaeus_Sergiodlarosa.jpg',
      type: 'art',
      credit: 'Sergio de la Rosa (CC BY-SA 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ursus_spelaeus_Sergiodlarosa.jpg'
    }
  ]),
  discoveryHistory: '• First described scientifically in 1794 by German anatomist Johann Christian Rosenmüller from bones in the Zoolithenhöhle cave in Bavaria.\n• Hundreds of thousands of cave bear bones have been discovered across limestone caverns throughout Europe.\n• Ancient cave paintings at Chauvet Cave in France provide vivid firsthand depictions of cave bears created by Upper Paleolithic humans ~32,000 years ago.\n• Genome sequencing by Axel Barlow and colleagues in 2018 proved that ancient cave bears and brown bears interbred, leaving 0.9% to 2.4% cave bear ancestry surviving within modern brown bear genomes.',
  interestingFacts: JSON.stringify([
    'Large male cave bears weighed between 400 and 600 kg (with autumnal pre-hibernation males reaching up to 800–1000 kg), noticeably larger than modern European brown bears.',
    'Despite their terrifying size and imposing canine teeth, stable isotope nitrogen-15 ratios prove that cave bears were almost strict vegetarians, foraging on low-growing vegetation and roots.',
    'A distinct steep forehead dome and reinforced zygomatic arches anchored powerful masseter muscles, providing grinding chewing power for fibrous plants.',
    'Their extinction ~24,000 years ago coincided with the Last Glacial Maximum, when freezing arid conditions decimated the temperate subalpine flora they relied upon.'
  ]),
  sizeNotes: 'Total body length: 2.7–3.2 m (8.9–10.5 ft); shoulder height: 1.3–1.5 m; mass: 400–600 kg (up to 800+ kg pre-torpor).',
  sizeEstimate: JSON.stringify({
    length: { value: 3.0, unit: 'm', confidence: 'well-supported' },
    height: { value: 1.4, unit: 'm', confidence: 'well-supported' },
    weight: { value: 500, unit: 'kg', confidence: 'well-supported' }
  }),
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/369a7880-4798-41bf-851a-ec5da17fafa3.svg',
    sourceUrl: 'https://www.phylopic.org/images/369a7880-4798-41bf-851a-ec5da17fafa3',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    credit: 'Margot Michaud',
    taxon: 'Ursus (Representative: Ursus)',
    taxonMatch: 'genus-level match (Ursus)'
  }),
  extinctionEvent: null,
  closestLivingRelatives: JSON.stringify({
    status: 'established',
    groups: [
      'Brown Bear (Ursus arctos)',
      'Polar Bear (Ursus maritimus)'
    ],
    rationale: 'Cave bears are extinct members of the genus Ursus. Modern brown bears and polar bears represent their closest living sister lineage, with living brown bears retaining introgressed cave bear DNA.',
    ecologicalAnalogues: [
      'Brown Bear (Ursus arctos - seasonal hyperphagia and torpor)'
    ],
    sources: [
      {
        title: 'Barlow, A., et al. (2018). Partial genomic survival of cave bears in living brown bears. Nature Ecology & Evolution, 2(10), 1563-1570.',
        url_or_doi: 'https://doi.org/10.1038/s41559-018-0654-8'
      }
    ],
    verified: true
  }),
  sources: JSON.stringify([
    {
      citation: 'Paleobiology Database (PBDB) - Ursus spelaeus',
      url: 'https://paleobiodb.org'
    },
    {
      citation: 'Barlow et al. (2018) Partial genomic survival of cave bears in living brown bears',
      url: 'https://doi.org/10.1038/s41559-018-0654-8'
    }
  ]),
  placeholder: false
};

const CAVE_LION_RECORD = {
  name: 'Eurasian Cave Lion',
  scientificName: 'Panthera spelaea',
  nameMeaning: 'Cave panther',
  timePeriod: 'Pleistocene',
  epoch: 'Late Pleistocene (~460,000–14,000 YA)',
  myaStart: 0.46,
  myaEnd: 0.014,
  diet: 'carnivore',
  dietDetails: 'Apex hypercarnivore preying on mammoth steppe megafauna, particularly reindeer (Rangifer tarandus), giant deer (Megaloceros), steppe bison, young cave bears, and juvenile mammoths.',
  habitat: 'terrestrial',
  clade: 'Early_Mammal_Synapsid',
  geographicRange: JSON.stringify({
    continent: 'Europe and Asia',
    region: 'Siberian Permafrost (Yakutia) & Chauvet Cave',
    country: 'Russia, Germany, France, and Canada (Yukon)',
    fossilFormation: 'Siberian permafrost deposits & Karst caves',
    coordinates: [68.53, 146.42]
  }),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Carnivora',
    suborder: 'Feliformia',
    family: 'Felidae',
    subfamily: 'Pantherinae',
    genus: 'Panthera',
    species: 'Panthera spelaea',
    source: 'Stanton, D. W. G., et al. (2020). Early Pleistocene origin and extensive intra-species diversity of the extinct cave lion. Scientific Reports, 10, 12611.'
  }),
  taxonomicStatus: 'valid',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/3/34/W._Gornig_-_P._spelaea_spelaea.png',
      type: 'art',
      credit: 'W. Gornig (CC BY-SA 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:W._Gornig_-_P._spelaea_spelaea.png'
    }
  ]),
  discoveryHistory: '• First described in 1810 by German paleontologist Georg August Goldfuss from a fossil skull discovered in the Zoolithenhöhle cave in Bavaria.\n• Beautiful Paleolithic cave drawings in Chauvet and Lascaux Caves depict cave lions hunting together without male manes, showing faint facial striping and tufted tails.\n• In 2015 and 2017, exceptionally preserved frozen mummified cave lion cubs ("Uyan", "Dina", "Boris", and "Sparta") were unearthed from Siberian permafrost in Yakutia, preserving complete fur, whiskers, internal organs, and milk teeth.\n• Mitogenomic and nuclear DNA analyses confirmed that Panthera spelaea is a distinct species that diverged from modern African lions ~1.85 Ma.',
  interestingFacts: JSON.stringify([
    'Adult male Eurasian cave lions measured up to 2.5 meters (8.2 ft) in body length and stood roughly 1.2 meters at the shoulder, weighing 250 to 350 kg (some males exceeding 400 kg), making them roughly 20% larger than modern African lions.',
    'Cave art across Europe shows that unlike living male African lions, male cave lions lacked dense neck manes, likely an adaptation to navigate cold scrubby steppes and snowy drifts without ice accumulation.',
    'Stable isotope nitrogen-15 analysis demonstrates that reindeer and cave bear cubs were frequent prey items in Europe, whereas woolly rhinos and juvenile mammoths were hunted across Siberia.',
    'Frozen cubs discovered in Yakutia preserved reddish-gray woolly coats that matched historical cave paintings with uncanny accuracy.'
  ]),
  sizeNotes: 'Head-and-body length: 2.1–2.5 m; shoulder height: ~1.2 m; body mass: 250–350 kg (exceptional males up to 400 kg).',
  sizeEstimate: JSON.stringify({
    length: { value: 2.3, unit: 'm', confidence: 'well-supported' },
    height: { value: 1.2, unit: 'm', confidence: 'well-supported' },
    weight: { value: 300, unit: 'kg', confidence: 'well-supported' }
  }),
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/9f33e613-944c-483d-8275-cc59a1b470c2.svg',
    sourceUrl: 'https://www.phylopic.org/images/9f33e613-944c-483d-8275-cc59a1b470c2',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    credit: 'Margot Michaud',
    taxon: 'Panthera (Representative: Panthera leo)',
    taxonMatch: 'genus-level match (Panthera)'
  }),
  extinctionEvent: null,
  closestLivingRelatives: JSON.stringify({
    status: 'established',
    groups: [
      'African Lion (Panthera leo)',
      'Asian Lion (Panthera leo persica)',
      'Tiger (Panthera tigris)',
      'Jaguar (Panthera onca)'
    ],
    rationale: 'Cave lions belong to Panthera. Ancient genomics confirms they form the sister species to the modern lion lineage (Panthera leo).',
    ecologicalAnalogues: [
      'African Lion (Panthera leo - social group hunting)',
      'Siberian Tiger (Panthera tigris altaica - cold-climate big cat ecology)'
    ],
    sources: [
      {
        title: 'Stanton, D. W. G., et al. (2020). Early Pleistocene origin and extensive intra-species diversity of the extinct cave lion. Scientific Reports, 10, 12611.',
        url_or_doi: 'https://doi.org/10.1038/s41598-020-69474-1'
      }
    ],
    verified: true
  }),
  sources: JSON.stringify([
    {
      citation: 'Paleobiology Database (PBDB) - Panthera spelaea',
      url: 'https://paleobiodb.org'
    },
    {
      citation: 'Stanton et al. (2020) Early Pleistocene origin and extensive intra-species diversity of the extinct cave lion',
      url: 'https://doi.org/10.1038/s41598-020-69474-1'
    }
  ]),
  placeholder: false
};

const PROCOPTODON_RECORD = {
  name: 'Procoptodon',
  scientificName: 'Procoptodon goliah',
  nameMeaning: 'Forward-facing cutting tooth (giant)',
  timePeriod: 'Pleistocene',
  epoch: 'Late Pleistocene (~2.0 Ma–45,000 YA)',
  myaStart: 2.0,
  myaEnd: 0.045,
  diet: 'herbivore',
  dietDetails: 'High-browsing folivore and saltbush specialist consuming fibrous, salt-tolerant shrubs (chenopods), acacia leaves, and tough sclerophyllous arid vegetation.',
  habitat: 'terrestrial',
  clade: 'Early_Mammal_Synapsid',
  geographicRange: JSON.stringify({
    continent: 'Australia',
    region: 'Lake Menindee, New South Wales & Naracoorte Caves',
    country: 'Australia',
    fossilFormation: 'Lake Menindee / Naracoorte Caves / Cuddie Springs',
    coordinates: [-32.33, 142.42]
  }),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    infraclass: 'Marsupialia',
    order: 'Diprotodontia',
    suborder: 'Macropodiformes',
    family: 'Macropodidae',
    subfamily: 'Sthenurinae',
    genus: 'Procoptodon',
    species: 'Procoptodon goliah',
    source: 'Janis, C. M., Buttrill, K., & Figueirido, B. (2014). Locomotion in extinct giant kangaroos: Were sthenurines hop-less monsters? PLoS ONE, 9(10), e108056.'
  }),
  taxonomicStatus: 'valid',
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Procoptodon_BW.jpg',
      type: 'art',
      credit: 'Nobu Tamura (CC BY 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Procoptodon_BW.jpg'
    }
  ]),
  discoveryHistory: '• Described in 1845 by British anatomist Sir Richard Owen based on fossil fragments from eastern Australia.\n• Complete articulated skeletons have been excavated from Lake Menindee in New South Wales and Naracoorte Caves World Heritage site in South Australia.\n• Functional morphology studies by Christine Janis and colleagues in 2014 demonstrated that sthenurine giant kangaroos walked bipedally using an alternating striding gait rather than ricochetal hopping, due to fused ankle joints, rigid lumbar spines, and massive weight-bearing hips.',
  interestingFacts: JSON.stringify([
    'Procoptodon goliah was the largest kangaroo to ever walk the Earth, standing roughly 2.0 to 2.3 meters (6.6 to 7.5 ft) tall and weighing 200 to 240 kg — nearly three times the weight of a modern red kangaroo.',
    'Unlike hopping modern kangaroos, Procoptodon was a bipedal striding walker, stepping one foot at a time with reinforced, single-toed hooves (monodactyly) similar to an equine foot.',
    'Possessed a flat, shortened face with forward-facing binocular vision and massive zygomatic arches anchoring chewing muscles suited for tough, fibrous desert chenopods and saltbush.',
    'Its elongated arms featured two extended, hooked digits that could reach upward to pull down tall tree branches and acacia foliage.'
  ]),
  sizeNotes: 'Standing height: ~2.0–2.3 m (6.6–7.5 ft); total body length: ~2.0 m; body mass: 200–240 kg.',
  sizeEstimate: JSON.stringify({
    length: { value: 2.1, unit: 'm', confidence: 'well-supported' },
    height: { value: 2.0, unit: 'm', confidence: 'well-supported' },
    weight: { value: 220, unit: 'kg', confidence: 'well-supported' }
  }),
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/abd569c8-126c-4211-9304-5bb58be0666c.svg',
    sourceUrl: 'https://www.phylopic.org/images/abd569c8-126c-4211-9304-5bb58be0666c',
    license: 'Creative Commons Attribution-ShareAlike 3.0 Unported',
    credit: 'T. Michael Keesey',
    taxon: 'Macropodidae (Representative: Macropus)',
    taxonMatch: 'family approximation (Macropodidae), not species-specific'
  }),
  extinctionEvent: null,
  closestLivingRelatives: JSON.stringify({
    status: 'established',
    groups: [
      'Banded Hare-Wallaby (Lagostrophus fasciatus)',
      'Modern Kangaroos and Wallabies (Macropodinae)',
      'Koala and Wombats (Vombatiformes)'
    ],
    rationale: 'Procoptodon is a sthenurine short-faced kangaroo. The critically endangered banded hare-wallaby (Lagostrophus fasciatus) is the sole living representative of the sister subfamily Lagostrophinae, followed by true kangaroos (Macropodinae).',
    ecologicalAnalogues: [
      'Chalicothere / Ground Sloth (high-browsing hook-and-pull folivore ecology)'
    ],
    sources: [
      {
        title: 'Janis, C. M., et al. (2014). Locomotion in extinct giant kangaroos: Were sthenurines hop-less monsters? PLoS ONE, 9(10), e108056.',
        url_or_doi: 'https://doi.org/10.1371/journal.pone.0108056'
      }
    ],
    verified: true
  }),
  sources: JSON.stringify([
    {
      citation: 'Paleobiology Database (PBDB) - Procoptodon goliah',
      url: 'https://paleobiodb.org'
    },
    {
      citation: 'Janis et al. (2014) Locomotion in extinct giant kangaroos: Were sthenurines hop-less monsters?',
      url: 'https://doi.org/10.1371/journal.pone.0108056'
    }
  ]),
  placeholder: false
};

const NEW_SPECIES = [
  { id: 5426, record: SALTOPUS_RECORD },
  { id: 5427, record: MAMMOTH_RECORD },
  { id: 5428, record: DIRE_WOLF_RECORD },
  { id: 5429, record: CAVE_BEAR_RECORD },
  { id: 5430, record: CAVE_LION_RECORD },
  { id: 5431, record: PROCOPTODON_RECORD }
];

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA MIGRATION: ADD REMAINING 6 TIMEMAP SPECIES');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration snapshot
  console.log('Step 1: Capturing pre-migration snapshot...');
  const allBefore = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`  ✓ Current species count in database: ${allBefore.length}`);

  const snapshotDir = path.join(__dirname, '..', 'prisma', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const timestamp = Date.now();
  const preSnapshotPath = path.join(snapshotDir, `pre_add_timemap_six_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Verify IDs 5426..5431 are available
  console.log('Step 2: Checking ID availability...');
  for (const item of NEW_SPECIES) {
    const existing = await prisma.species.findUnique({ where: { id: item.id } });
    if (existing) {
      throw new Error(`CRITICAL: ID ${item.id} already exists for "${existing.name}"! Aborting to prevent overwrite.`);
    }
    console.log(`  ✓ ID ${item.id} is available for "${item.record.name}"`);
  }
  console.log();

  // STEP 3: Insert new species records
  console.log('Step 3: Inserting 6 new species records...');
  for (const item of NEW_SPECIES) {
    const created = await prisma.species.create({
      data: {
        id: item.id,
        ...item.record
      }
    });
    console.log(`  ✓ Successfully inserted species #${created.id}: ${created.name} (${created.scientificName})`);
  }
  console.log();

  // STEP 4: Post-migration snapshot & verification
  console.log('Step 4: Capturing post-migration snapshot and verifying anti-regression invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, `post_add_timemap_six_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  const expectedTotal = allBefore.length + 6;
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
  console.log('✅ ALL 6 TIMEMAP SPECIES ADDED & VERIFIED (0 REGRESSIONS)');
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
