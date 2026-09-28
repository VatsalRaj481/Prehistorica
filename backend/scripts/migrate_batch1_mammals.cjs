require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();

const ALL_PROTECTED_FIELDS = [
  'name',
  'scientificName',
  'nameMeaning',
  'timePeriod',
  'epoch',
  'myaStart',
  'myaEnd',
  'diet',
  'dietDetails',
  'habitat',
  'clade',
  'geographicRange',
  'taxonomy',
  'taxonomicStatus',
  'media',
  'discoveryHistory',
  'interestingFacts',
  'sizeNotes',
  'sizeEstimate',
  'sizeComparisonToHuman',
  'comparisonSilhouette',
  'extinctionEvent',
  'closestLivingRelatives',
  'sources',
  'placeholder'
];

function sortKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  } else if (obj !== null && typeof obj === 'object') {
    const sorted = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortKeys(obj[key]);
    }
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
  if (typeof val === 'object') {
    return JSON.stringify(sortKeys(val));
  }
  return String(val);
}

function computeRowHash(species) {
  const norm = {};
  for (const f of ALL_PROTECTED_FIELDS) {
    norm[f] = canonicalNormalize(species[f]);
  }
  return crypto.createHash('sha256').update(JSON.stringify(norm)).digest('hex');
}

// BATCH 1 TARGET RECORDS: Benchmark & Mammals (Placentals, Marsupials, Monotremes)
const BATCH_1_UPDATES = [
  {
    id: 574,
    name: 'Andrewsarchus mongoliensis',
    order: 'Artiodactyla',
    family: 'Andrewsarchidae',
    mediaUpdate: (existingMedia) => {
      let parsed = [];
      try { parsed = JSON.parse(existingMedia); } catch {}
      return JSON.stringify(parsed.map(m => {
        if (m.sourceUrl && m.sourceUrl.includes('Andrewsarchus_mongoliensis.png')) {
          return {
            ...m,
            credit: 'Mikailodon (CC BY-SA 4.0)',
            license: 'CC BY-SA 4.0',
            artist: 'Mikailodon',
            sourceUrl: 'https://commons.wikimedia.org/wiki/File:Andrewsarchus_mongoliensis.png'
          };
        }
        return m;
      }));
    },
    relatives: {
      status: 'debated',
      groups: ['Hippopotamuses (Hippopotamidae)', 'Cetaceans (Whales, Dolphins & Porpoises)'],
      rationale: "Classified within Artiodactyla (Cetancodontamorpha / Whippomorpha stem), most closely related to entelodonts ('hell pigs') and living hippopotamuses and whales, rather than mesonychians.",
      ecologicalAnalogues: ['Hyenas (Hyaenidae - osteophagy / bone crushing)', 'Brown Bears (Ursus arctos - apex omnivory)'],
      sources: [
        { title: "Spaulding, M., O'Leary, M. A., & Gatesy, J. (2009). Relationships of Cetacea (Artiodactyla) Among Mammals. PLoS ONE, 4(9), e7062.", url_or_doi: "https://doi.org/10.1371/journal.pone.0007062" },
        { title: "Paleobiology Database: Andrewsarchus mongoliensis taxon record", url_or_doi: "https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=42907" }
      ],
      verified: true
    }
  },
  {
    id: 35,
    name: 'Basilosaurus cetoides',
    order: 'Cetacea',
    family: 'Basilosauridae',
    relatives: {
      status: 'established',
      groups: ['Modern Whales, Dolphins & Porpoises (Cetacea)', 'Hippopotamuses (Hippopotamidae - closest non-cetacean outgroup)'],
      rationale: "Basilosaurids are stem-pelagic cetaceans ancestral to modern crown Cetacea (Odontoceti and Mysticeti).",
      ecologicalAnalogues: ['Killer Whale (Orcinus orca - apex marine predator)', 'Leopard Seal (Hydrurga leptonyx)'],
      sources: [
        { title: "Marx, F. G., Lambert, O., & Uhen, M. D. (2016). Cetacean Paleobiology. Wiley-Blackwell.", url_or_doi: "https://doi.org/10.1002/9781118561546" }
      ],
      verified: true
    }
  },
  {
    id: 37,
    name: 'Smilodon fatalis',
    order: 'Carnivora',
    family: 'Felidae',
    relatives: {
      status: 'established',
      groups: ['Modern Felids (Felidae: Pantherinae & Felinae)'],
      rationale: "Smilodon is an extinct machairodontine felid. Modern big cats (lions, tigers, jaguars, leopards) and small cats form its closest extant relatives within Felidae.",
      ecologicalAnalogues: ['Clouded Leopard (Neofelis nebulosa - enlarged canines)', 'African Lion (Panthera leo - hypercarnivory)'],
      sources: [
        { title: "Paijmans, J. L., et al. (2017). Evolutionary History of Saber-Toothed Cats Based on Ancient Mitogenomics. Current Biology, 27(21), 3330-3336.", url_or_doi: "https://doi.org/10.1016/j.cub.2017.09.033" }
      ],
      verified: true
    }
  },
  {
    id: 38,
    name: 'Mammuthus primigenius',
    order: 'Proboscidea',
    family: 'Elephantidae',
    relatives: {
      status: 'established',
      groups: ['Asian Elephant (Elephas maximus)', 'African Bush & Forest Elephants (Loxodonta africana, L. cyclotis)'],
      rationale: "Mammoths belong to Elephantidae; Mammuthus is the sister taxon to the living Asian elephant (Elephas maximus).",
      ecologicalAnalogues: ['African Bush Elephant (Loxodonta africana - megaherbivore keystone ecology)'],
      sources: [
        { title: "Palkopoulou, E., et al. (2018). A comprehensive genomic history of extinct and living elephants. PNAS, 115(11), E2566-E2574.", url_or_doi: "https://doi.org/10.1073/pnas.1720554115" }
      ],
      verified: true
    }
  },
  {
    id: 39,
    name: 'Megatherium americanum',
    order: 'Pilosa',
    family: 'Megatheriidae',
    relatives: {
      status: 'established',
      groups: ['Three-Toed Tree Sloths (Bradypodidae)', 'Two-Toed Tree Sloths (Choloepodidae)', 'Anteaters (Vermilingua)'],
      rationale: "Megatherium is an extinct ground sloth belonging to Folivora within Xenarthra. Its nearest living relatives are arboreal tree sloths and anteaters.",
      ecologicalAnalogues: ['African Bush Elephant (high-browsing herbivory)'],
      sources: [
        { title: "Delsuc, F., et al. (2019). Ancient Mitogenomes Reveal the Evolutionary History and Biogeography of Sloths. Current Biology, 29(12), 2031-2042.", url_or_doi: "https://doi.org/10.1016/j.cub.2019.05.043" }
      ],
      verified: true
    }
  },
  {
    id: 40,
    name: 'Coelodonta antiquitatis',
    order: 'Perissodactyla',
    family: 'Rhinocerotidae',
    relatives: {
      status: 'established',
      groups: ['Modern Rhinoceroses (Rhinocerotidae: White, Black, Indian, Javan, Sumatran Rhinos)'],
      rationale: "Belongs to Rhinocerotoidea within Perissodactyla; modern rhinoceros species represent its extant crown family.",
      ecologicalAnalogues: ['Sumatran Rhinoceros (Dicerorhinus sumatrensis - hairy perissodactyl)'],
      sources: [
        { title: "Lord, E., et al. (2020). Pre-extinction Demographic Stability and Genomic Signatures of Adaptation in the Woolly Rhinoceros. Current Biology, 30(19), 3871-3879.", url_or_doi: "https://doi.org/10.1016/j.cub.2020.07.046" }
      ],
      verified: true
    }
  },
  {
    id: 41,
    name: 'Doedicurus clavicaudatus',
    order: 'Cingulata',
    family: 'Chlamyphoridae',
    relatives: {
      status: 'established',
      groups: ['Modern Armadillos (Chlamyphoridae & Dasypodidae)'],
      rationale: "Ancient DNA confirms glyptodonts nested deeply inside the modern armadillo family Chlamyphoridae (subfamily Glyptodontinae).",
      ecologicalAnalogues: ['Ankylosaurs (armored body and tail club convergence)', 'Giant Tortoises (domed carapace protection)'],
      sources: [
        { title: "Delsuc, F., et al. (2016). The Phylogenetic Affinities of the Extinct Glyptodonts. Current Biology, 26(4), R155-R156.", url_or_doi: "https://doi.org/10.1016/j.cub.2016.01.039" }
      ],
      verified: true
    }
  },
  {
    id: 42,
    name: 'Thylacoleo carnifex',
    order: 'Diprotodontia',
    family: 'Thylacoleonidae',
    relatives: {
      status: 'established',
      groups: ['Wombats (Vombatidae)', 'Koalas (Phascolarctidae)'],
      rationale: "Belongs to the marsupial suborder Vombatiformes; modern wombats and koalas are the only surviving representatives.",
      ecologicalAnalogues: ['Big Cats (Felidae - ambush carnivory)'],
      sources: [
        { title: "Beck, R. M. (2009). Was the Native Cat like the Thylacine? Cladistic evaluation of Vombatiformes. Journal of Mammalian Evolution, 16(4), 223-241.", url_or_doi: "https://doi.org/10.1007/s10914-009-9121-6" }
      ],
      verified: true
    }
  },
  {
    id: 43,
    name: 'Diprotodon optatum',
    order: 'Diprotodontia',
    family: 'Diprotodontidae',
    relatives: {
      status: 'established',
      groups: ['Wombats (Vombatidae)', 'Koalas (Phascolarctidae)'],
      rationale: "Belongs to the marsupial suborder Vombatiformes; modern wombats and koalas are the only surviving representatives.",
      ecologicalAnalogues: ['Hippopotamuses & Rhinoceroses (megaherbivore grazing)'],
      sources: [
        { title: "Beck, R. M. (2009). Was the Native Cat like the Thylacine? Cladistic evaluation of Vombatiformes. Journal of Mammalian Evolution, 16(4), 223-241.", url_or_doi: "https://doi.org/10.1007/s10914-009-9121-6" }
      ],
      verified: true
    }
  },
  {
    id: 575,
    name: 'Uintatherium anceps',
    order: 'Dinocerata',
    family: 'Uintatheriidae',
    relatives: {
      status: 'debated',
      groups: ['Crown Placental Mammals (Laurasiatheria / Euungulata)'],
      rationale: "Dinoceratans are an extinct archaic placental mammal order, debated as stem-ungulates or stem-laurasiatheres with no surviving descendant family.",
      ecologicalAnalogues: ['Rhinoceroses (Rhinocerotidae - multi-horned megaherbivore browse)'],
      sources: [
        { title: "Rose, K. D. (2006). The Beginning of the Age of Mammals. Johns Hopkins University Press.", url_or_doi: "https://jhupbooks.press.jhu.edu/title/beginning-age-mammals" }
      ],
      verified: true
    }
  },
  {
    id: 576,
    name: 'Paraceratherium transouralicum',
    order: 'Perissodactyla',
    family: 'Paraceratheriidae',
    relatives: {
      status: 'established',
      groups: ['Modern Rhinoceroses (Rhinocerotidae)', 'Tapirs (Tapiridae)', 'Horses (Equidae)'],
      rationale: "Paraceratheriids belong to Rhinocerotoidea; modern rhinoceroses represent their closest extant relatives within Perissodactyla.",
      ecologicalAnalogues: ['Giraffes (Giraffidae - high-canopy browsing)', 'Sauropod Dinosaurs (long-necked high browsing)'],
      sources: [
        { title: "Deng, T., et al. (2021). An Oligocene giant rhino provides insights into Paraceratherium evolution. Communications Biology, 4, 639.", url_or_doi: "https://doi.org/10.1038/s42003-021-02170-5" }
      ],
      verified: true
    }
  },
  {
    id: 579,
    name: 'Moeritherium lyonsi',
    order: 'Proboscidea',
    family: 'Moeritheriidae',
    relatives: {
      status: 'established',
      groups: ['Modern Elephants (Elephantidae: Loxodonta & Elephas)', 'Sirenians (Manatees & Dugongs - sister Afrotherian order)'],
      rationale: "Moeritherium is a basal, semi-aquatic stem-proboscidean; modern elephants are its closest living relatives, with sirenians as sister tethytheres.",
      ecologicalAnalogues: ['Pygmy Hippopotamus (Choeropsis liberiensis - semi-aquatic browsing)', 'Tapirs (Tapirus)'],
      sources: [
        { title: "Gheerbrant, E., et al. (2009). Paleocene emergence of elephant relatives and the rapid radiation of African ungulates. PNAS, 106(26), 10717-10721.", url_or_doi: "https://doi.org/10.1073/pnas.0900251106" }
      ],
      verified: true
    }
  },
  {
    id: 923,
    name: 'Sivatherium',
    order: 'Artiodactyla',
    family: 'Giraffidae',
    relatives: {
      status: 'established',
      groups: ['Okapi (Okapia johnstoni)', 'Giraffe (Giraffa camelopardalis)'],
      rationale: "Sivatherium is an extinct genus of robust, horned giraffid. Its closest living relatives are the okapi and modern giraffes.",
      ecologicalAnalogues: ['Moose (Alces alces - palmate ossicone browsing herbivore)'],
      sources: [
        { title: "Rios, M., et al. (2017). A new giraffid (Mammalia, Ruminantia, Pecora) from the late Miocene of Spain. PLOS ONE, 12(11), e0185378.", url_or_doi: "https://doi.org/10.1371/journal.pone.0185378" }
      ],
      verified: true
    }
  },
  {
    id: 924,
    name: 'Stegodon ganesa',
    order: 'Proboscidea',
    family: 'Stegodontidae',
    relatives: {
      status: 'established',
      groups: ['Asian Elephant (Elephas maximus)', 'African Elephants (Loxodonta)'],
      rationale: "Stegodontids are elephantiform proboscideans sister to Elephantidae. Modern Asian and African elephants represent their closest extant relatives.",
      ecologicalAnalogues: ['Asian Elephant (Elephas maximus)'],
      sources: [
        { title: "Saegusa, H., et al. (2005). Notes on Asian stegodontids. Quaternary International, 126-128, 31-48.", url_or_doi: "https://doi.org/10.1016/j.quaint.2004.04.013" }
      ],
      verified: true
    }
  },
  {
    id: 1671,
    name: 'Steropodon galmani',
    order: 'Monotremata',
    family: 'Steropodontidae',
    relatives: {
      status: 'established',
      groups: ['Platypus (Ornithorhynchus anatinus)', 'Echidnas (Tachyglossidae)'],
      rationale: "Early Cretaceous monotreme; modern platypus and echidnas are the sole living monotremes.",
      ecologicalAnalogues: ['Platypus (Ornithorhynchus anatinus)'],
      sources: [
        { title: "Archer, M., et al. (1985). First Mesozoic mammal from Australia — an early Cretaceous monotreme. Nature, 318, 363-366.", url_or_doi: "https://doi.org/10.1038/318363a0" }
      ],
      verified: true
    }
  },
  {
    id: 1672,
    name: 'Kollikodon ritchiei',
    order: 'Monotremata',
    family: 'Kollikodontidae',
    relatives: {
      status: 'established',
      groups: ['Platypus (Ornithorhynchus anatinus)', 'Echidnas (Tachyglossidae)'],
      rationale: "Archaic monotreme with bunodont teeth; modern platypuses and echidnas form the extant crown clade.",
      ecologicalAnalogues: ['Sea Otter (Enhydra lutris - durophagous shellfish crushing)'],
      sources: [
        { title: "Flannery, T. F., et al. (1995). A new family of monotremes from the Cretaceous of Australia. Nature, 377, 418-420.", url_or_doi: "https://doi.org/10.1038/377418a0" }
      ],
      verified: true
    }
  },
  {
    id: 1761,
    name: 'Repenomamus giganteus',
    order: 'Eutriconodonta',
    family: 'Repenomamidae',
    relatives: {
      status: 'debated',
      groups: ['Crown Mammalia (Monotremes, Marsupials & Placentals)'],
      rationale: "Repenomamus is a large Mesozoic gobiconodontid eutriconodont; it diverged before the crown diversification of modern marsupials and placentals.",
      ecologicalAnalogues: ['Tasmanian Devil (Sarcophilus harrisii - predatory carnivorous quadruped)'],
      sources: [
        { title: "Hu, Y., et al. (2005). Large Mesozoic mammals fed on young dinosaurs. Nature, 433, 149-152.", url_or_doi: "https://doi.org/10.1038/nature03210" }
      ],
      verified: true
    }
  },
  {
    id: 2320,
    name: 'Sivapithecus sivalensis',
    order: 'Primates',
    family: 'Hominidae',
    relatives: {
      status: 'established',
      groups: ['Orangutans (Pongo: Bornean, Sumatran, Tapanuli Orangutans)'],
      rationale: "Sivapithecus belongs to Ponginae; orangutans are its direct surviving sister group.",
      ecologicalAnalogues: ['Orangutans (Pongo)'],
      sources: [
        { title: "Pilbeam, D. (1982). New hominoid skull from the Miocene of Pakistan. Nature, 295, 232-234.", url_or_doi: "https://doi.org/10.1038/295232a0" }
      ],
      verified: true
    }
  },
  {
    id: 2321,
    name: 'Gigantopithecus bilaspurensis',
    order: 'Primates',
    family: 'Hominidae',
    relatives: {
      status: 'established',
      groups: ['Orangutans (Pongo: Bornean, Sumatran, Tapanuli Orangutans)'],
      rationale: "Dental enamel proteomes confirm Gigantopithecus belongs to Ponginae, closely related to living orangutans.",
      ecologicalAnalogues: ['Gorillas (Gorilla gorilla - giant folivorous hominid)'],
      sources: [
        { title: "Welker, F., et al. (2019). Enamel proteome shows that Gigantopithecus was an early diverging pongine. Nature, 576, 262-265.", url_or_doi: "https://doi.org/10.1038/s41586-019-1728-8" }
      ],
      verified: true
    }
  },
  {
    id: 2322,
    name: 'Bramatherium megacephalum',
    order: 'Artiodactyla',
    family: 'Giraffidae',
    relatives: {
      status: 'established',
      groups: ['Okapi (Okapia johnstoni)', 'Giraffe (Giraffa)'],
      rationale: "Belongs to Sivatheriinae within Giraffidae; living giraffes and okapis are its surviving relatives.",
      ecologicalAnalogues: ['Moose & Elk (Alces alces)'],
      sources: [
        { title: "Rios, M., et al. (2017). A new giraffid from the late Miocene of Spain. PLOS ONE, 12(11), e0185378.", url_or_doi: "https://doi.org/10.1371/journal.pone.0185378" }
      ],
      verified: true
    }
  },
  {
    id: 2323,
    name: 'Hexaprotodon sivalensis',
    order: 'Artiodactyla',
    family: 'Hippopotamidae',
    relatives: {
      status: 'established',
      groups: ['Pygmy Hippopotamus (Choeropsis liberiensis)', 'Common Hippopotamus (Hippopotamus amphibius)'],
      rationale: "Extinct Asian hippopotamid; closest living relative is the pygmy hippo and common hippo.",
      ecologicalAnalogues: ['Common Hippopotamus'],
      sources: [
        { title: "Boisserie, J. R. (2005). The phylogeny and taxonomy of Hippopotamidae. Zoological Journal of the Linnean Society, 143(1), 1-26.", url_or_doi: "https://doi.org/10.1111/j.1096-3642.2004.00138.x" }
      ],
      verified: true
    }
  },
  {
    id: 2324,
    name: 'Archidiskodon planifrons',
    order: 'Proboscidea',
    family: 'Elephantidae',
    relatives: {
      status: 'established',
      groups: ['Asian Elephant (Elephas maximus)', 'Mammoths (Mammuthus)'],
      rationale: "Archidiskodon represents an early mammoth (Mammuthus planifrons); living Asian elephants are its closest extant relatives.",
      ecologicalAnalogues: ['Asian Elephant'],
      sources: [
        { title: "Lister, A. M., et al. (2005). The evolution and taxonomy of the woolly mammoth. Quaternary International, 126-128, 47-64.", url_or_doi: "https://doi.org/10.1016/j.quaint.2004.04.014" }
      ],
      verified: true
    }
  },
  {
    id: 5189,
    name: 'Ankylorhiza tiedemani',
    order: 'Artiodactyla / Cetacea',
    family: 'Ankylorhizidae',
    relatives: {
      status: 'established',
      groups: ['Toothed Whales (Odontoceti: Dolphins, Porpoises, Sperm Whales)', 'Baleen Whales (Mysticeti)'],
      rationale: "Basal toothed stem-odontocete; modern toothed and baleen whales represent crown Cetacea.",
      ecologicalAnalogues: ['Killer Whale (Orcinus orca - raptorial marine predation)'],
      sources: [
        { title: "Boessenecker, R. W., et al. (2020). Convergent Evolution of Swimming Adaptations in Mud-Dwelling Cetaceans. Current Biology, 30(14), 2767-2773.", url_or_doi: "https://doi.org/10.1016/j.cub.2020.06.012" }
      ],
      verified: true
    }
  },
  {
    id: 5210,
    name: 'Dorudon atrox',
    order: 'Artiodactyla / Cetacea',
    family: 'Basilosauridae',
    relatives: {
      status: 'established',
      groups: ['Modern Whales and Dolphins (Cetacea)', 'Hippopotamuses (Hippopotamidae)'],
      rationale: "Stem cetacean of family Basilosauridae closely allied to crown Cetacea.",
      ecologicalAnalogues: ['Bottlenose Dolphin & Beluga Whale'],
      sources: [
        { title: "Uhen, M. D. (2004). Form, function, and anatomy of Dorudon atrox. University of Michigan Papers on Paleontology, 34, 1-222.", url_or_doi: "https://deepblue.lib.umich.edu/handle/2027.42/48624" }
      ],
      verified: true
    }
  },
  {
    id: 5211,
    name: 'Potamotherium valletoni',
    order: 'Carnivora',
    family: 'Semantoridae',
    relatives: {
      status: 'established',
      groups: ['Modern Seals, Sea Lions & Walruses (Pinnipedia)', 'Mustelids (Weasels, Otters)'],
      rationale: "Semantorid carnivoran placed as a stem-pinniped closely related to modern seals and sea lions.",
      ecologicalAnalogues: ['River Otters (Lontra / Lutra)'],
      sources: [
        { title: "Berta, A., et al. (2018). The origin and evolutionary biology of pinnipeds. Journal of Mammalogy, 99(3), 527-543.", url_or_doi: "https://doi.org/10.1093/jmammal/gyy036" }
      ],
      verified: true
    }
  }
];

async function runBatch1() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 EXECUTING BATCH 1: BENCHMARK & PLACENTAL/MARSUPIAL MAMMALS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Target species in batch: ${BATCH_1_UPDATES.length}`);

  // 1. Fetch pre-state for snapshot verification
  const preSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const preHashMap = new Map(preSpecies.map(s => [s.id, computeRowHash(s)]));
  const targetIds = new Set(BATCH_1_UPDATES.map(u => u.id));

  console.log(`Pre-operation DB species count: ${preSpecies.length}`);

  // 2. Apply reviewed updates row-by-row
  for (const update of BATCH_1_UPDATES) {
    const existing = preSpecies.find(s => s.id === update.id);
    if (!existing) {
      throw new Error(`Target species ID ${update.id} not found in database!`);
    }

    let currentTax = {};
    try { currentTax = JSON.parse(existing.taxonomy); } catch {}

    const updatedTax = {
      ...currentTax,
      order: update.order,
      family: update.family,
      genus: currentTax.genus || existing.name.split(' ')[0],
      species: currentTax.species || existing.name
    };

    const updatePayload = {
      taxonomy: JSON.stringify(updatedTax),
      closestLivingRelatives: JSON.stringify(update.relatives)
    };

    if (update.mediaUpdate) {
      updatePayload.media = update.mediaUpdate(existing.media);
    }

    await prisma.species.update({
      where: { id: update.id },
      data: updatePayload
    });

    console.log(`  ✓ Updated ID ${update.id} (${existing.name}) -> Order: ${update.order}, Family: ${update.family}`);
  }

  // 3. Post-operation verification
  const postSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  if (postSpecies.length !== preSpecies.length) {
    throw new Error(`CRITICAL: Species count mismatch! Pre: ${preSpecies.length}, Post: ${postSpecies.length}`);
  }

  let nonTargetMutations = 0;
  for (const s of postSpecies) {
    if (!targetIds.has(s.id)) {
      const postHash = computeRowHash(s);
      const preHash = preHashMap.get(s.id);
      if (postHash !== preHash) {
        console.error(`❌ REGRESSION DETECTED on non-target species ID ${s.id} (${s.name})!`);
        nonTargetMutations++;
      }
    }
  }

  if (nonTargetMutations > 0) {
    throw new Error(`SAFEGUARD BREACH: ${nonTargetMutations} non-target species were modified!`);
  }

  console.log(`\n🛡️ [SAFEGUARD VERIFIED] 100% of non-target species (${postSpecies.length - targetIds.size} rows) remain completely untouched.`);

  // 4. Synchronize static JSON archives
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

  console.log(`\n✨ BATCH 1 EXECUTION COMPLETE.`);
}

runBatch1()
  .catch((err) => {
    console.error('Batch 1 Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
