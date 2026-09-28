require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();

const ALL_PROTECTED_FIELDS = [
  'name', 'scientificName', 'nameMeaning', 'timePeriod', 'epoch', 'myaStart', 'myaEnd',
  'diet', 'dietDetails', 'habitat', 'clade', 'geographicRange', 'taxonomy', 'taxonomicStatus',
  'media', 'discoveryHistory', 'interestingFacts', 'sizeNotes', 'sizeEstimate',
  'sizeComparisonToHuman', 'comparisonSilhouette', 'extinctionEvent', 'closestLivingRelatives',
  'sources', 'placeholder'
];

function sortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === 'object') {
    const sorted = {};
    for (const key of Object.keys(obj).sort()) sorted[key] = sortKeys(obj[key]);
    return sorted;
  }
  return obj;
}

function canonicalNormalize(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return JSON.stringify(sortKeys(parsed));
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof val === 'object') return JSON.stringify(sortKeys(val));
  return String(val);
}

function computeRowHash(species) {
  const norm = {};
  for (const f of ALL_PROTECTED_FIELDS) norm[f] = canonicalNormalize(species[f]);
  return crypto.createHash('sha256').update(JSON.stringify(norm)).digest('hex');
}

// BATCH 2: SYNAPSIDS & STEM-MAMMALS
const BATCH_2_UPDATES = [
  {
    id: 9,
    name: 'Dimetrodon grandis',
    order: 'Sphenacodontia',
    family: 'Sphenacodontidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia: Monotremes, Marsupials, Placentals)'],
      rationale: "Dimetrodon is a non-mammalian synapsid (stem-mammal) belonging to Sphenacodontidae. All modern living mammals are its sole extant descendants/relatives; it is entirely unrelated to modern reptiles, lizards, or archosaurs.",
      ecologicalAnalogues: ['Komodo Dragon (Varanus komodoensis - apex ectothermic terrestrial predator niche)'],
      sources: [{ title: "Benton, M. J. (2014). Vertebrate Palaeontology (4th ed.). Wiley-Blackwell.", url_or_doi: "https://www.wiley.com/en-us/Vertebrate+Palaeontology%2C+4th+Edition-p-9781118406847" }],
      verified: true
    }
  },
  {
    id: 10,
    name: 'Edaphosaurus pogonias',
    order: 'Caseasauria / Edaphosauridae',
    family: 'Edaphosauridae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia: Monotremes, Marsupials, Placentals)'],
      rationale: "Edaphosaurus is a herbivorous stem-mammal (synapsid). Living mammals represent its only surviving relatives on the synapsid branch of Amniota.",
      ecologicalAnalogues: ['Marine Iguana (Amblyrhynchus cristatus - herbivorous reptile with tooth-battery crushing)'],
      sources: [{ title: "Modesto, S. P. (1995). The skull of the herbivorous synapsid Edaphosaurus. Proceedings of the Royal Society B, 262(1365), 233-239.", url_or_doi: "https://doi.org/10.1098/rspb.1995.0201" }],
      verified: true
    }
  },
  {
    id: 13,
    name: 'Inostrancevia alexandri',
    order: 'Therapsida',
    family: 'Gorgonopsidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Gorgonopsids are predatory therapsids on the mammal-line of evolution; modern mammals are the only living synapsids.",
      ecologicalAnalogues: ['Saber-Toothed Cats (Machairodontinae - convergent saber-toothed apex predation)'],
      sources: [{ title: "Kammerer, C. F. (2016). Systematics of the Rubidgeinae (Therapsida: Gorgonopsia). PeerJ, 4, e1608.", url_or_doi: "https://doi.org/10.7717/peerj.1608" }],
      verified: true
    }
  },
  {
    id: 50,
    name: 'Lisowicia bojani',
    order: 'Therapsida / Dicynodontia',
    family: 'Stahleckeriidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Lisowicia is an elephant-sized Triassic dicynodont therapsid. All living synapsids (modern mammals) are its closest surviving kin.",
      ecologicalAnalogues: ['Rhinoceroses & Hippopotamuses (megaherbivore browsing and grazing)'],
      sources: [{ title: "Sulej, T., & Niedzwiedzki, G. (2019). An elephant-sized Late Triassic dicynodont. Science, 363(6422), 78-80.", url_or_doi: "https://doi.org/10.1126/science.aal4853" }],
      verified: true
    }
  },
  {
    id: 51,
    name: 'Cynognathus crateronotus',
    order: 'Therapsida / Cynodontia',
    family: 'Cynognathidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Eucynodont therapsid closely related to the ancestral lineage of Mammaliaformes.",
      ecologicalAnalogues: ['Badgers & Wudgeons (robust quadrupedal carnivorous burrowers)'],
      sources: [{ title: "Botha, J., et al. (2007). Cranial morphology and taxonomy of Cynognathus. Palaeontologia Africana, 42, 29-42." }],
      verified: true
    }
  },
  {
    id: 52,
    name: 'Thrinaxodon liorhinus',
    order: 'Therapsida / Cynodontia',
    family: 'Thrinaxodontidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Basal cynodont showing definitive mammalian transitional traits including secondary palate and whisker pits.",
      ecologicalAnalogues: ['Ferrets & Weasels (slender carnivorous burrowers)'],
      sources: [{ title: "Fernandez, V., et al. (2013). Synchrotron reveals early Triassic coexistence in a burrow. PLOS ONE, 8(6), e64978.", url_or_doi: "https://doi.org/10.1371/journal.pone.0064978" }],
      verified: true
    }
  },
  {
    id: 238,
    name: 'Morganucodon watsoni',
    order: 'Mammaliaformes',
    family: 'Morganucodontidae',
    relatives: {
      status: 'established',
      groups: ['Modern Monotremes, Marsupials & Placentals (Crown Mammalia)'],
      rationale: "Basal mammaliaform near the crown mammalian root; modern mammals are its extant descendants.",
      ecologicalAnalogues: ['Shrews (Soricidae - nocturnal insectivory)'],
      sources: [{ title: "Kielan-Jaworowska, Z., et al. (2004). Mammals from the Age of Dinosaurs. Columbia University Press." }],
      verified: true
    }
  },
  {
    id: 239,
    name: 'Castorocauda lutrasimilis',
    order: 'Docodonta',
    family: 'Docodontidae',
    relatives: {
      status: 'established',
      groups: ['Modern Monotremes, Marsupials & Placentals (Crown Mammalia)'],
      rationale: "Semi-aquatic docodontan mammaliaform; crown mammals form its closest living sister group.",
      ecologicalAnalogues: ['Platypus & River Otter (semi-aquatic swimming and beaver-like tail)'],
      sources: [{ title: "Ji, Q., et al. (2006). A swimming mammaliaform from the Middle Jurassic and ecomorphological diversification of early mammals. Science, 311(5764), 1123-1127.", url_or_doi: "https://doi.org/10.1126/science.1123026" }],
      verified: true
    }
  },
  {
    id: 240,
    name: 'Volaticotherium antiquum',
    order: 'Eutriconodonta',
    family: 'Triconodontidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Mesozoic gliding eutriconodont; crown mammals represent its surviving evolutionary kin.",
      ecologicalAnalogues: ['Flying Squirrels (Pteromyini) & Sugar Gliders (Petaurus breviceps - patagial gliding)'],
      sources: [{ title: "Meng, J., et al. (2006). A Mesozoic gliding mammal from northeastern China. Nature, 444(7121), 889-893.", url_or_doi: "https://doi.org/10.1038/nature05234" }],
      verified: true
    }
  },
  {
    id: 241,
    name: 'Fruitafossor windscheffeli',
    order: 'Mammalia',
    family: 'Fruitafossoridae',
    relatives: {
      status: 'debated',
      groups: ['Modern Monotremes, Marsupials & Placentals (Crown Mammalia)'],
      rationale: "Fossorial mammal from the Late Jurassic with specialized tubular, rootless teeth and digging forelimbs.",
      ecologicalAnalogues: ['Aardvark (Orycteropus afer) & Armadillos (Dasypodidae - specialized myrmecophagy / ant-eating)'],
      sources: [{ title: "Luo, Z. X., & Wible, J. R. (2005). A Late Jurassic digging mammal and early mammalian diversification. Science, 308(5718), 103-107.", url_or_doi: "https://doi.org/10.1126/science.1108875" }],
      verified: true
    }
  },
  {
    id: 242,
    name: 'Juramaia sinensis',
    order: 'Eutheria',
    family: 'Juramaiidae',
    relatives: {
      status: 'established',
      groups: ['Placental Mammals (Placentalia / Eutheria)'],
      rationale: "Oldest known stem-eutherian mammal; modern placental mammals are its direct surviving descendants.",
      ecologicalAnalogues: ['Tree Shrews (Scandentia - scansorial arboreal insectivory)'],
      sources: [{ title: "Luo, Z. X., et al. (2011). A Jurassic eutherian mammal and divergence of marsupials and placentals. Nature, 476(7361), 442-445.", url_or_doi: "https://doi.org/10.1038/nature10291" }],
      verified: true
    }
  },
  {
    id: 243,
    name: 'Agilodocodon scansorius',
    order: 'Docodonta',
    family: 'Docodontidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Tree-climbing docodontan mammaliaform with specialized incisors adapted for tree gum / sap feeding.",
      ecologicalAnalogues: ['Marmosets (Callitrichidae - arboreal sap gouging)'],
      sources: [{ title: "Meng, Q. J., et al. (2015). An arboreal docodont from the Jurassic and mammaliaform ecological diversification. Science, 347(6223), 764-768.", url_or_doi: "https://doi.org/10.1126/science.1260879" }],
      verified: true
    }
  },
  {
    id: 573,
    name: 'Estemmenosuchus uralensis',
    order: 'Therapsida / Dinocephalia',
    family: 'Estemmenosuchidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Bizarre horned dinocephalian therapsid; modern mammals are the sole surviving synapsids.",
      ecologicalAnalogues: ['Moose & Hippopotamuses (large herbivorous browse with cranial display horns)'],
      sources: [{ title: "Ivakhnenko, M. F. (2008). Cranial morphology and evolution of the Permian dinocephalians. Paleontological Journal, 42(9), 859-995." }],
      verified: true
    }
  },
  {
    id: 1620,
    name: 'Placerias hesternus',
    order: 'Therapsida / Dicynodontia',
    family: 'Kannemeyeriidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Late Triassic kannemeyeriid dicynodont; crown mammals are its closest extant sister lineage.",
      ecologicalAnalogues: ['Hippopotamuses & Wild Boars (tusked rooting and herbivorous grazing)'],
      sources: [{ title: "Kammerer, C. F., et al. (2013). Early Evolutionary History of the Synapsida. Springer." }],
      verified: true
    }
  },
  {
    id: 1628,
    name: 'Exaeretodon statterneri',
    order: 'Therapsida / Cynodontia',
    family: 'Traversodontidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Traversodontid cynodont with specialized multicuspid herbivorous teeth; closest living relatives are modern mammals.",
      ecologicalAnalogues: ['Wombats (Vombatidae - herbivorous quadrupedal burrowing)'],
      sources: [{ title: "Liu, J., & Abdala, F. (2014). Phylogeny and taxonomy of Traversodontidae. In Early Evolutionary History of the Synapsida (pp. 255-279)." }],
      verified: true
    }
  },
  {
    id: 1639,
    name: 'Exaeretodon frenguellii',
    order: 'Therapsida / Cynodontia',
    family: 'Traversodontidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Traversodontid cynodont; modern mammals are its surviving phylogenetic sister clade.",
      ecologicalAnalogues: ['Wombats (Vombatidae)'],
      sources: [{ title: "Liu, J., & Abdala, F. (2014). Phylogeny and taxonomy of Traversodontidae." }],
      verified: true
    }
  },
  {
    id: 1653,
    name: 'Lystrosaurus murrayi',
    order: 'Therapsida / Dicynodontia',
    family: 'Lystrosauridae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Permian-Triassic survivor dicynodont therapsid; crown mammals are the sole surviving synapsids.",
      ecologicalAnalogues: ['Pigs & Wombats (barrel-bodied tusked burrowing herbivore)'],
      sources: [{ title: "King, G. M. (1990). The Dicynodonts: A Study in Palaeobiology. Chapman & Hall." }],
      verified: true
    }
  },
  {
    id: 1654,
    name: 'Moschops capensis',
    order: 'Therapsida / Dinocephalia',
    family: 'Tapinocephalidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Tapinocephalid dinocephalian therapsid with thickened pachyostotic skull roof adapted for head-butting.",
      ecologicalAnalogues: ['Bighorn Sheep & Muskoxen (cranial head-butting contest behavior)'],
      sources: [{ title: "Boonstra, L. D. (1969). The fauna of the Tapinocephalus Zone. Annals of the South African Museum, 56, 1-73." }],
      verified: true
    }
  },
  {
    id: 1655,
    name: 'Diictodon feliceps',
    order: 'Therapsida / Dicynodontia',
    family: 'Diictodontidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Abundant small burrowing dicynodont therapsid; crown mammals are its closest extant relatives.",
      ecologicalAnalogues: ['Gophers & Meerkats (colonial spiraling subterranean burrowing)'],
      sources: [{ title: "Ray, S., & Chinsamy, A. (2003). Functional morphology of the postcranial skeleton of Diictodon. Palaeontology, 46(6), 1239-1255." }],
      verified: true
    }
  },
  {
    id: 1656,
    name: 'Gorgonops torvus',
    order: 'Therapsida / Gorgonopsia',
    family: 'Gorgonopsidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Apex therapsid carnivore of the Late Permian; modern mammals are its extant synapsid cousins.",
      ecologicalAnalogues: ['Large Felids & Wolves (apex cursorial hypercarnivory)'],
      sources: [{ title: "Kammerer, C. F. (2016). Systematics of the Rubidgeinae. PeerJ, 4, e1608." }],
      verified: true
    }
  },
  {
    id: 1657,
    name: 'Rubidgea atrox',
    order: 'Therapsida / Gorgonopsia',
    family: 'Gorgonopsidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Massive rubidgeine gorgonopsid macropredator; modern mammals are the sole living synapsids.",
      ecologicalAnalogues: ['Saber-Toothed Cats & Lions (hypercarnivorous saber-toothed predation)'],
      sources: [{ title: "Kammerer, C. F. (2016). Systematics of the Rubidgeinae. PeerJ, 4, e1608." }],
      verified: true
    }
  },
  {
    id: 1658,
    name: 'Procynosuchus delaharpeae',
    order: 'Therapsida / Cynodontia',
    family: 'Procynosuchidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Semi-aquatic basal cynodont; crown mammals represent its surviving crown descendants.",
      ecologicalAnalogues: ['Otters (Lutrinae - semi-aquatic undulating swimming and piscivory)'],
      sources: [{ title: "Kemp, T. S. (1979). The primitive cynodont Procynosuchus: functional anatomy of the postcranial skeleton. Phil. Trans. R. Soc. B, 285(1005), 73-122." }],
      verified: true
    }
  },
  {
    id: 1659,
    name: 'Anteosaurus magnificus',
    order: 'Therapsida / Dinocephalia',
    family: 'Anteosauridae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Giant predatory dinocephalian therapsid; modern mammals are its surviving synapsid kin.",
      ecologicalAnalogues: ['Saltwater Crocodile & Large Carnivorans (heavy-bodied apex predator)'],
      sources: [{ title: "Benoit, J., et al. (2021). Palaeoneurology and neurosensory evolution in Anteosaurus. Acta Palaeontologica Polonica, 66(1), 29-40." }],
      verified: true
    }
  },
  {
    id: 5167,
    name: 'Inostrancevia africana',
    order: 'Therapsida / Gorgonopsia',
    family: 'Gorgonopsidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Gorgonopsian therapsid predator; modern mammals are its extant synapsid sister lineage.",
      ecologicalAnalogues: ['Saber-Toothed Cats (Machairodontinae)'],
      sources: [{ title: "Kammerer, C. F., et al. (2023). Rapid turnover of top predators in African Late Permian terrestrial ecosystems. Current Biology, 33(11), 2283-2290." }],
      verified: true
    }
  },
  {
    id: 5168,
    name: 'Lystrosaurus georgi',
    order: 'Therapsida / Dicynodontia',
    family: 'Lystrosauridae',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Dicynodont therapsid; crown mammals are the sole surviving synapsids.",
      ecologicalAnalogues: ['Wild Boar & Wombat'],
      sources: [{ title: "King, G. M. (1990). The Dicynodonts: A Study in Palaeobiology." }],
      verified: true
    }
  }
];

async function runBatch2() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 EXECUTING BATCH 2: SYNAPSIDS & STEM-MAMMALS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Target species in batch: ${BATCH_2_UPDATES.length}`);

  const preSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const preHashMap = new Map(preSpecies.map(s => [s.id, computeRowHash(s)]));
  const targetIds = new Set(BATCH_2_UPDATES.map(u => u.id));

  for (const update of BATCH_2_UPDATES) {
    const existing = preSpecies.find(s => s.id === update.id);
    if (!existing) throw new Error(`Target species ID ${update.id} not found in database!`);

    let currentTax = {};
    try { currentTax = JSON.parse(existing.taxonomy); } catch {}

    const updatedTax = {
      ...currentTax,
      order: update.order,
      family: update.family,
      genus: currentTax.genus || existing.name.split(' ')[0],
      species: currentTax.species || existing.name
    };

    await prisma.species.update({
      where: { id: update.id },
      data: {
        taxonomy: JSON.stringify(updatedTax),
        closestLivingRelatives: JSON.stringify(update.relatives)
      }
    });

    console.log(`  ✓ Updated ID ${update.id} (${existing.name}) -> Order: ${update.order}, Family: ${update.family}`);
  }

  // Verification
  const postSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  if (postSpecies.length !== preSpecies.length) throw new Error(`CRITICAL: Species count mismatch!`);

  let nonTargetMutations = 0;
  for (const s of postSpecies) {
    if (!targetIds.has(s.id)) {
      if (computeRowHash(s) !== preHashMap.get(s.id)) {
        console.error(`❌ REGRESSION DETECTED on non-target species ID ${s.id} (${s.name})!`);
        nonTargetMutations++;
      }
    }
  }

  if (nonTargetMutations > 0) throw new Error(`SAFEGUARD BREACH: ${nonTargetMutations} non-target species modified!`);
  console.log(`\n🛡️ [SAFEGUARD VERIFIED] 100% of non-target species (${postSpecies.length - targetIds.size} rows) remain completely untouched.`);

  // Sync JSON archives
  console.log(`\n🗄️ Synchronizing static JSON archives...`);
  const exportAll = postSpecies.map(s => {
    const copy = { ...s };
    delete copy.embedding;
    return copy;
  });

  const archives = [
    { file: 'species_full_export.json', filter: () => true },
    { file: 'species_jurassic.json', filter: (s) => (s.timePeriod || '').toLowerCase().includes('jurassic') },
    { file: 'species_cretaceous.json', filter: (s) => (s.timePeriod || '').toLowerCase().includes('cretaceous') },
    { file: 'species_triassic.json', filter: (s) => (s.timePeriod || '').toLowerCase().includes('triassic') },
    { file: 'species_others.json', filter: (s) => {
        const tp = (s.timePeriod || '').toLowerCase();
        return !tp.includes('jurassic') && !tp.includes('cretaceous') && !tp.includes('triassic');
      }
    }
  ];

  for (const arc of archives) {
    const filePath = path.resolve(__dirname, '../prisma', arc.file);
    const filtered = exportAll.filter(arc.filter);
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf8');
    console.log(`  ✓ Synced ${arc.file} (${filtered.length} records)`);
  }

  console.log(`\n✨ BATCH 2 EXECUTION COMPLETE.`);
}

runBatch2()
  .catch((err) => {
    console.error('Batch 2 Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
