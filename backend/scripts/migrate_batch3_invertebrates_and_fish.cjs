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

// BATCH 3: INVERTEBRATES, FISHES, STEM-CHORDATES & EARLY TETRAPODS
const BATCH_3_UPDATES = [
  {
    id: 1,
    name: 'Anomalocaris canadensis',
    class: 'Dinocaridida',
    order: 'Radiodonta',
    family: 'Anomalocarididae',
    relatives: {
      status: 'established',
      groups: ['Crown Arthropods (Euarthropoda: Chelicerates, Myriapods, Crustaceans & Hexapods)'],
      rationale: "Radiodonts are stem-group arthropods possessing frontmost appendages homologous to arthropod labrum/chelicerae. Modern euarthropods represent their sole extant relatives.",
      ecologicalAnalogues: ['Cuttlefish (Sepiida - undulating lateral swimming and raptorial appendage grasping)'],
      sources: [{ title: "Daley, A. C., et al. (2009). The Burgess Shale Anomalocaridid Hurdia. Science, 323, 1597-1600.", url_or_doi: "https://doi.org/10.1126/science.1169514" }],
      verified: true
    }
  },
  {
    id: 2,
    name: 'Hallucigenia sparsa',
    class: 'Xenusia',
    order: 'Archonychophora',
    family: 'Hallucigeniidae',
    relatives: {
      status: 'established',
      groups: ['Velvet Worms (Onychophora)', 'Tardigrades (Tardigrada)'],
      rationale: "Ultrastructural examination of claws and head morphology places Hallucigenia within stem-group Onychophora (Panarthropoda).",
      ecologicalAnalogues: ['Velvet Worms & Spiny Caterpillars'],
      sources: [{ title: "Smith, M. R., & Ortega-Hernandez, J. (2014). Hallucigenia's onychophoran-like claws resolve the nature of the lobopodian claw. Nature, 514, 363-366.", url_or_doi: "https://doi.org/10.1038/nature13576" }],
      verified: true
    }
  },
  {
    id: 3,
    name: 'Opabinia regalis',
    class: 'Dinocaridida',
    order: 'Opabiniida',
    family: 'Opabiniidae',
    relatives: {
      status: 'established',
      groups: ['Crown Arthropods (Euarthropoda)'],
      rationale: "Stem-group panarthropod closely allied to Radiodonta and ancestral to crown Euarthropoda.",
      ecologicalAnalogues: ['Ghost Shrimp & Dragonfly Nymphs (flexible prehensile proboscis foraging)'],
      sources: [{ title: "Whittington, H. B. (1975). The enigmatic animal Opabinia regalis. Phil. Trans. R. Soc. B, 271, 1-43.", url_or_doi: "https://doi.org/10.1098/rstb.1975.0033" }],
      verified: true
    }
  },
  {
    id: 4,
    name: 'Dunkleosteus terrelli',
    class: 'Placodermi',
    order: 'Arthrodira',
    family: 'Dunkleosteidae',
    relatives: {
      status: 'established',
      groups: ['All Crown Jawed Vertebrates (Gnathostomata: Chondrichthyes & Osteichthyes)'],
      rationale: "Placoderms are an armored stem-gnathostome lineage with zero surviving crown descendants; all living sharks, rays, bony fishes, and tetrapods are equally distant living relatives.",
      ecologicalAnalogues: ['Great White Shark (Carcharodon carcharias - apex predatory macropredator)', 'Orca (Orcinus orca)'],
      sources: [{ title: "Zhu, M., et al. (2013). A Silurian placoderm with osteichthyan-like marginal jaw bones. Nature, 502, 188-193.", url_or_doi: "https://doi.org/10.1038/nature12617" }],
      verified: true
    }
  },
  {
    id: 5,
    name: 'Tiktaalik roseae',
    class: 'Sarcopterygii',
    order: 'Elpistostegalia',
    family: 'Elpistostegidae',
    relatives: {
      status: 'established',
      groups: ['All Living Tetrapods (Tetrapoda: Amphibians, Mammals, Reptiles, Birds)', 'Lungfishes (Dipnoi - sister fish outgroup)'],
      rationale: "Transitional stem-tetrapod sarcopterygian fish illustrating the fin-to-limb transition; all terrestrial vertebrates are its living crown descendants.",
      ecologicalAnalogues: ['Mudskippers (Oxudercidae - pectoral limb-based locomotion on mudflats)', 'Alligator Gar (Atractosteus spatula)'],
      sources: [{ title: "Daeschler, E. B., et al. (2006). A Devonian tetrapod-like fish. Nature, 440, 757-763.", url_or_doi: "https://doi.org/10.1038/nature04639" }],
      verified: true
    }
  },
  {
    id: 6,
    name: 'Ichthyostega stensioei',
    class: 'Amphibia',
    order: 'Ichthyostegalia',
    family: 'Ichthyostegidae',
    relatives: {
      status: 'established',
      groups: ['Modern Amphibians (Lissamphibia: Frogs, Salamanders, Caecilians)', 'All Living Amniotes (Mammals, Reptiles, Birds)'],
      rationale: "Pioneering Devonian stem-tetrapod; ancestral to crown Tetrapoda.",
      ecologicalAnalogues: ['Giant Salamanders (Cryptobranchidae)', 'Mudpuppies (Necturus)'],
      sources: [{ title: "Clack, J. A. (2012). Gaining Ground: The Origin and Evolution of Tetrapods (2nd ed.). Indiana University Press." }],
      verified: true
    }
  },
  {
    id: 7,
    name: 'Arthropleura armata',
    class: 'Diplopoda',
    order: 'Arthropleurida',
    family: 'Arthropleuridae',
    relatives: {
      status: 'established',
      groups: ['Modern Millipedes (Diplopoda)'],
      rationale: "Giant Carboniferous myriapod; modern millipedes are its closest living crown relatives.",
      ecologicalAnalogues: ['Giant African Millipede (Archispirostreptus gigas - forest-floor detritivory)'],
      sources: [{ title: "Davies, N. S., et al. (2021). The largest specimen of Arthropleura. Journal of the Geological Society, 179(3).", url_or_doi: "https://doi.org/10.1144/jgs2021-115" }],
      verified: true
    }
  },
  {
    id: 8,
    name: 'Meganeura monyi',
    class: 'Insecta',
    order: 'Meganisoptera',
    family: 'Meganeuridae',
    relatives: {
      status: 'established',
      groups: ['Dragonflies and Damselflies (Odonata)'],
      rationale: "Stem-odonatan griffenfly; modern dragonflies and damselflies form its extant crown clade.",
      ecologicalAnalogues: ['Dragonflies (Anisoptera - high-speed aerial predatory hawking)'],
      sources: [{ title: "Nel, A., et al. (2009). The true origins of the dragonflies and damselflies. Nature, 461, 998-999." }],
      verified: true
    }
  },
  {
    id: 11,
    name: 'Helicoprion bessonowi',
    class: 'Chondrichthyes',
    order: 'Eugeneodontiformes',
    family: 'Helicoprionidae',
    relatives: {
      status: 'established',
      groups: ['Chimaeras / Ratfishes (Holocephali)'],
      rationale: "Eugeneodont holocephalan cartilaginous fish; closest extant relatives are modern chimaeras (Holocephali), not true sharks (Elasmobranchii).",
      ecologicalAnalogues: ['Whale Shark & Basking Shark (pelagic cephalopod predation)', 'Sawsharks (Pristiophoridae)'],
      sources: [{ title: "Tapanila, L., et al. (2013). Jaws for a spiral-tooth whorl: CT images resolve mystery of Helicoprion. Biology Letters, 9(2), 20130057.", url_or_doi: "https://doi.org/10.1098/rsbl.2013.0057" }],
      verified: true
    }
  },
  {
    id: 12,
    name: 'Scutosaurus karpinskii',
    class: 'Reptilia',
    order: 'Procolophonomorpha',
    family: 'Pareiasauridae',
    relatives: {
      status: 'established',
      groups: ['Crown Amniota / Modern Reptiles (Sauria: Archosaurs & Lepidosaurs)'],
      rationale: "Pareiasaurs are armored parareptiles of the Permian. No living crown descendants survive; modern diapsids form their sister clade within Amniota.",
      ecologicalAnalogues: ['Tortoises & Armadillos (heavily armored osteodermal protection and terrestrial herbivory)'],
      sources: [{ title: "Benton, M. J. (2014). Vertebrate Palaeontology (4th ed.). Wiley-Blackwell." }],
      verified: true
    }
  },
  {
    id: 36,
    name: 'Megalodon',
    class: 'Chondrichthyes',
    order: 'Lamniformes',
    family: 'Otodontidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mackerel Sharks (Lamniformes: Great White Shark, Mako Sharks, Sand Tigers)'],
      rationale: "Belongs to the extinct lamniform shark family Otodontidae; closest extant relatives are living lamniform sharks (Lamnidae).",
      ecologicalAnalogues: ['Great White Shark (Carcharodon carcharias - marine apex predation)', 'Orca (Orcinus orca)'],
      sources: [{ title: "Shimada, K., et al. (2020). The size of the megatooth shark, Otodus megalodon. Historical Biology, 33(11), 2543-2559.", url_or_doi: "https://doi.org/10.1080/08912963.2020.1812598" }],
      verified: true
    }
  },
  {
    id: 539,
    name: 'Xiphactinus',
    class: 'Actinopterygii',
    order: 'Ichthyodectiformes',
    family: 'Ichthyodectidae',
    relatives: {
      status: 'established',
      groups: ['Modern Bony Fishes (Crown Teleostei: Arowanas, Tarpons, Bonefishes)'],
      rationale: "Basal stem-teleost belonging to Ichthyodectiformes; closest living relatives are primitive teleost lineages (Osteoglossomorpha / Elopomorpha).",
      ecologicalAnalogues: ['Tarpon (Megalops atlanticus)', 'Barracuda (Sphyraena - fast pelagic ram-feeding predator)'],
      sources: [{ title: "Cavin, L., et al. (2013). Evolutionary history of bony fishes. Geological Society, London, Special Publications, 382." }],
      verified: true
    }
  },
  {
    id: 540,
    name: 'Cretoxyrhina',
    class: 'Chondrichthyes',
    order: 'Lamniformes',
    family: 'Cretoxyrhinidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mackerel Sharks (Lamniformes: Great White, Shortfin Mako, Porbeagle)'],
      rationale: "Cretaceous lamniform shark closely related to modern lamnids.",
      ecologicalAnalogues: ['Shortfin Mako Shark (Isurus oxyrinchus - high-speed pelagic pursuit)'],
      sources: [{ title: "Shimada, K. (1997). Skeletal anatomy of the Late Cretaceous lamniform shark, Cretoxyrhina mantelli. Journal of Paleontology, 71(4), 642-652." }],
      verified: true
    }
  },
  {
    id: 567,
    name: 'Pikaia gracilens',
    class: 'Cephalochordata',
    order: 'Pikaiida',
    family: 'Pikaiidae',
    relatives: {
      status: 'established',
      groups: ['Lancelets (Cephalochordata: Branchiostoma / Amphioxus)', 'Tunicates (Urochordata)', 'Craniates / Vertebrates'],
      rationale: "Stem-chordate from the Cambrian Burgess Shale displaying definitive notochord and myomeres; modern lancelets (amphioxus) represent its closest extant morphological and phylogenetic relatives.",
      ecologicalAnalogues: ['Lancelets (Branchiostoma - undulating benthic marine filter-feeding)'],
      sources: [{ title: "Morris, S. C., & Caron, J. B. (2012). Pikaia gracilens Walcott, a stem-group chordate from the Middle Cambrian of British Columbia. Biological Reviews, 87(2), 480-512.", url_or_doi: "https://doi.org/10.1111/j.1469-185X.2012.00220.x" }],
      verified: true
    }
  },
  {
    id: 568,
    name: 'Wiwaxia corrugata',
    class: 'Halwaxiida',
    order: 'Sachitida',
    family: 'Wiwaxiidae',
    relatives: {
      status: 'debated',
      groups: ['Molluscs (Mollusca: Chitons & Solenogastres)', 'Annelid Worms (Annelida)'],
      rationale: "Stem-group lophotrochozoan with sclerites resembling mollusc radula and annelid chaetae; placement between Mollusca and Annelida is debated.",
      ecologicalAnalogues: ['Chitons (Polyplacophora - armored benthic marine scraping)'],
      sources: [{ title: "Smith, M. R. (2012). Mouthparts of the Burgess Shale fossils Odontogriphus and Wiwaxia. Nature, 484, 381-384.", url_or_doi: "https://doi.org/10.1038/nature11037" }],
      verified: true
    }
  },
  {
    id: 569,
    name: 'Bothriolepis canadensis',
    class: 'Placodermi',
    order: 'Antiarcha',
    family: 'Bothriolepididae',
    relatives: {
      status: 'established',
      groups: ['Crown Gnathostomata (All Living Jawed Fishes & Tetrapods)'],
      rationale: "Antiarch placoderm; placoderms are stem-gnathostomes with zero surviving crown descendants.",
      ecologicalAnalogues: ['Armored Catfishes (Loricariidae - benthic substrate browsing)'],
      sources: [{ title: "Long, J. A. (2011). The Rise of Fishes: 500 Million Years of Evolution. Johns Hopkins University Press." }],
      verified: true
    }
  },
  {
    id: 571,
    name: 'Hylonomus lyelli',
    class: 'Reptilia',
    order: 'Eureptilia',
    family: 'Protorothyrididae',
    relatives: {
      status: 'established',
      groups: ['Modern Diapsids (Sauria: Lizards, Snakes, Crocodilians, Birds)', 'Turtles (Testudines)'],
      rationale: "Oldest confirmed basal eureptile; ancestral to all living reptilian crown groups (diapsids).",
      ecologicalAnalogues: ['Small Skinks & Anoles (agile terrestrial insectivory)'],
      sources: [{ title: "Carroll, R. L. (1964). The earliest reptiles. Zoological Journal of the Linnean Society, 45(304), 61-83." }],
      verified: true
    }
  },
  {
    id: 578,
    name: 'Titanoboa cerrejonensis',
    class: 'Reptilia',
    order: 'Squamata',
    family: 'Boidae',
    relatives: {
      status: 'established',
      groups: ['Green Anaconda (Eunectes murinus)', 'Boa Constrictor (Boa constrictor)', 'Pythons (Pythonidae)'],
      rationale: "Belongs to Boidae (subfamily Boinae); the green anaconda and South American boas are its closest extant relatives.",
      ecologicalAnalogues: ['Green Anaconda (Eunectes murinus - apex semi-aquatic constricting predator)'],
      sources: [{ title: "Head, J. J., et al. (2009). Giant boid snake from the Palaeocene neotropics. Nature, 457, 715-717.", url_or_doi: "https://doi.org/10.1038/nature07671" }],
      verified: true
    }
  },
  {
    id: 922,
    name: 'Vasuki',
    class: 'Reptilia',
    order: 'Squamata',
    family: 'Madtsoiidae',
    relatives: {
      status: 'established',
      groups: ['Modern Snakes (Serpentes: Alethinophidia / Boas & Pythons)'],
      rationale: "Extinct madtsoiid snake; modern snakes (Alethinophidia) represent its closest extant crown sister clade.",
      ecologicalAnalogues: ['Reticulated Python & Anaconda (giant slow-moving terrestrial ambush constrictor)'],
      sources: [{ title: "Datta, D., & Bajpai, S. (2024). Largest known madtsoiid snake from the warm Eocene of India. Scientific Reports, 14, 8058.", url_or_doi: "https://doi.org/10.1038/s41598-024-58377-0" }],
      verified: true
    }
  },
  {
    id: 1616,
    name: 'Gigantophis garstini',
    class: 'Reptilia',
    order: 'Squamata',
    family: 'Madtsoiidae',
    relatives: {
      status: 'established',
      groups: ['Modern Snakes (Serpentes: Alethinophidia)'],
      rationale: "Madtsoiid snake from the Eocene of North Africa; modern snakes are its surviving relatives.",
      ecologicalAnalogues: ['African Rock Python (Python sebae)'],
      sources: [{ title: "Rio, J. P., & Mannion, P. D. (2017). The osteology of the giant snake Gigantophis garstini. Advanced Paleobiology, 18, 1-28." }],
      verified: true
    }
  },
  {
    id: 1649,
    name: 'Onchopristis numidus',
    class: 'Chondrichthyes',
    order: 'Sclerorhynchiformes',
    family: 'Sclerorhynchidae',
    relatives: {
      status: 'established',
      groups: ['Modern Sawfishes (Pristidae)', 'Rays & Skates (Batoidea)', 'Modern Sharks (Selachii)'],
      rationale: "Sclerorhynchid ray; closely related to modern rays (Batoidea), with modern sawfishes (Pristidae) being convergent batoid relatives.",
      ecologicalAnalogues: ['Largetooth Sawfish (Pristis pristis - denticulated rostral hunting)'],
      sources: [{ title: "Kriwet, J. (2004). The systematic position of the Cretaceous sawfish Onchopristis. Fossil Record, 7(1), 89-100." }],
      verified: true
    }
  },
  {
    id: 3152,
    name: 'Squalicorax falcatus',
    class: 'Chondrichthyes',
    order: 'Lamniformes',
    family: 'Anacoracidae',
    relatives: {
      status: 'established',
      groups: ['Modern Mackerel Sharks (Lamniformes: Great White, Mako, Sand Tigers)'],
      rationale: "Extinct lamniform shark of the family Anacoracidae.",
      ecologicalAnalogues: ['Tiger Shark (Galeocerdo cuvier - opportunistic scavenger and macropredator with serrated curved teeth)'],
      sources: [{ title: "Shimada, K., & Cicimurri, D. J. (2005). Skeletal anatomy of the Cretaceous shark Squalicorax. PalArch, 3(3), 1-12." }],
      verified: true
    }
  },
  {
    id: 3163,
    name: 'Rhizodus',
    class: 'Sarcopterygii',
    order: 'Rhizodontida',
    family: 'Rhizodontidae',
    relatives: {
      status: 'established',
      groups: ['Modern Tetrapods (Tetrapoda: Amphibians, Mammals, Reptiles)', 'Lungfishes (Dipnoi)'],
      rationale: "Lobe-finned fish (sarcopterygian) within the tetrapod stem-group; modern tetrapods are its closest living crown relatives.",
      ecologicalAnalogues: ['Crocodiles (Crocodylidae - ambush aquatic apex predation)'],
      sources: [{ title: "Johanson, Z., & Ahlberg, P. E. (2001). Devonian rhizodontids and the evolution of tetrapodomorphs. Transactions of the Royal Society of Edinburgh, 92, 43-74." }],
      verified: true
    }
  },
  {
    id: 3164,
    name: 'Gillicus',
    class: 'Actinopterygii',
    order: 'Ichthyodectiformes',
    family: 'Ichthyodectidae',
    relatives: {
      status: 'established',
      groups: ['Crown Bony Fishes (Teleostei)'],
      rationale: "Ichthyodectid stem-teleost bony fish.",
      ecologicalAnalogues: ['Herring & Tarpon (pelagic planktivory / microcarnivory)'],
      sources: [{ title: "Cavin, L., et al. (2013). Evolutionary history of bony fishes." }],
      verified: true
    }
  },
  {
    id: 3172,
    name: 'Edestus heinrichi',
    class: 'Chondrichthyes',
    order: 'Eugeneodontiformes',
    family: 'Edestidae',
    relatives: {
      status: 'established',
      groups: ['Chimaeras / Ratfishes (Holocephali)'],
      rationale: "Eugeneodont holocephalan with vertical scissor-like tooth brackets; related to modern chimaeras.",
      ecologicalAnalogues: ['Pelagic Macropredatory Sharks'],
      sources: [{ title: "Itano, W. M. (2014). Edestus, the scissor-toothed shark: mode of life based on histology. Historical Biology, 27(6), 786-802." }],
      verified: true
    }
  },
  {
    id: 3182,
    name: 'Leedsichthys problematicus',
    class: 'Actinopterygii',
    order: 'Pachycormiformes',
    family: 'Pachycormidae',
    relatives: {
      status: 'established',
      groups: ['Crown Bony Fishes (Teleostei)', 'Bowfins (Amiidae)', 'Gars (Lepisosteidae)'],
      rationale: "Giant filter-feeding pachycormiform fish; pachycormids represent the stem-group to crown Teleostei.",
      ecologicalAnalogues: ['Whale Shark & Basking Shark (giant suspension filter-feeding)'],
      sources: [{ title: "Friedman, M., et al. (2010). 100-million-year dynasty of giant suspension-feeding bony fish. Science, 327(5968), 990-993.", url_or_doi: "https://doi.org/10.1126/science.1184708" }],
      verified: true
    }
  }
];

async function runBatch3() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 EXECUTING BATCH 3: INVERTEBRATES, FISHES & EARLY TETRAPODS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Target species in batch: ${BATCH_3_UPDATES.length}`);

  const preSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const preHashMap = new Map(preSpecies.map(s => [s.id, computeRowHash(s)]));
  const targetIds = new Set(BATCH_3_UPDATES.map(u => u.id));

  for (const update of BATCH_3_UPDATES) {
    const existing = preSpecies.find(s => s.id === update.id);
    if (!existing) throw new Error(`Target species ID ${update.id} not found in database!`);

    let currentTax = {};
    try { currentTax = JSON.parse(existing.taxonomy); } catch {}

    const updatedTax = {
      ...currentTax,
      class: update.class || currentTax.class,
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

    console.log(`  ✓ Updated ID ${update.id} (${existing.name}) -> Class: ${updatedTax.class}, Order: ${update.order}, Family: ${update.family}`);
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

  console.log(`\n✨ BATCH 3 EXECUTION COMPLETE.`);
}

runBatch3()
  .catch((err) => {
    console.error('Batch 3 Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
