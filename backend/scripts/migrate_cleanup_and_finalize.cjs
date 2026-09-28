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

const CLEANUP_UPDATES = [
  // 1. Invertebrates & Bony Fishes
  {
    id: 1744,
    name: 'Cladocyclus gardneri',
    relatives: {
      status: 'established',
      groups: ['Crown Teleost Fishes (Arowanas, Tarpons, Bonefishes)'],
      rationale: "Ichthyodectiform stem-teleost fish; related to primitive crown teleosts.",
      ecologicalAnalogues: ['Tarpon & Barracuda'],
      sources: [{ title: "Cavin, L., et al. (2013). Evolutionary history of bony fishes." }],
      verified: true
    }
  },
  {
    id: 1745,
    name: 'Calamopleurus cylindrical',
    relatives: {
      status: 'established',
      groups: ['Bowfin (Amia calva)', 'Crown Holostei'],
      rationale: "Amiid holostean fish; the living bowfin (Amia calva) is its closest extant relative.",
      ecologicalAnalogues: ['Bowfin (Amia calva)'],
      sources: [{ title: "Grande, L., & Bemis, W. E. (1998). A comprehensive phylogenetic study of amiid fishes." }],
      verified: true
    }
  },
  {
    id: 2040,
    name: 'Seirocrinus subangularis',
    relatives: {
      status: 'established',
      groups: ['Modern Sea Lilies & Feather Stars (Crinoidea: Comatulida, Isocrinida)'],
      rationale: "Pseudoplanktonic pentacrinitid crinoid echinoderm; modern sea lilies and feather stars represent crown Crinoidea.",
      ecologicalAnalogues: ['Modern Stalked Crinoids (Isocrinida)'],
      sources: [{ title: "Hess, H., et al. (1999). Fossil Crinoids. Cambridge University Press." }],
      verified: true
    }
  },
  {
    id: 2161,
    name: 'Lepidotes elvensis',
    relatives: {
      status: 'established',
      groups: ['Gars (Lepisosteidae)', 'Bowfin (Amia calva)'],
      rationale: "Lepidotid ginglymodian fish related to modern gars.",
      ecologicalAnalogues: ['Alligator Gar (Atractosteus spatula)'],
      sources: [{ title: "Lopez-Arbarello, A. (2012). Phylogenetic interrelationships of ginglymodian fishes. PLoS ONE, 7(7), e39370." }],
      verified: true
    }
  },
  {
    id: 2327,
    name: 'Stromerichthys lacustris',
    relatives: {
      status: 'established',
      groups: ['Bichirs & Reedfish (Polypteridae)', 'Crown Actinopterygii'],
      rationale: "Cretaceous freshwater actinopterygian fish related to cladistians.",
      ecologicalAnalogues: ['Bichirs (Polypterus)'],
      sources: [{ title: "Stromer, E. (1936). Baharije-Stufe." }],
      verified: true
    }
  },
  {
    id: 2480,
    name: 'Kotaichthys kartikeyai',
    family: 'Archaeomaenidae',
    relatives: {
      status: 'established',
      groups: ['Modern Teleosts (Teleostei)'],
      rationale: "Basal stem-teleost pholidophoriform fish.",
      ecologicalAnalogues: ['Herrings & Minnows'],
      sources: [{ title: "Yabumoto, Y. (2002). A new pholidophorid fish from the Kota Formation of India." }],
      verified: true
    }
  },
  {
    id: 5162,
    name: 'Nanaimoteuthis',
    relatives: {
      status: 'established',
      groups: ['Vampire Squid (Vampyroteuthis infernalis)', 'Modern Octopuses & Squids (Coleoidea)'],
      rationale: "Vampyromorph coleoid cephalopod; the deep-sea vampire squid is its closest extant relative.",
      ecologicalAnalogues: ['Vampire Squid (Vampyroteuthis infernalis)'],
      sources: [{ title: "Fuchs, D., et al. (2010). Vampyromorph cephalopods from the Late Cretaceous." }],
      verified: true
    }
  },
  {
    id: 5184,
    name: 'Jaekelopterus',
    relatives: {
      status: 'established',
      groups: ['Horseshoe Crabs (Xiphosura)', 'Arachnids (Arachnida: Scorpions & Spiders)'],
      rationale: "Pterygotid eurypterid (sea scorpion); chelicerates (horseshoe crabs and arachnids) represent crown relatives.",
      ecologicalAnalogues: ['Giant Japanese Spider Crab & Blue Crab (apex aquatic raptorial chelicerate hunting)'],
      sources: [{ title: "Braddy, S. J., et al. (2008). Giant fossil arthropods. Biology Letters, 4(1), 106-109." }],
      verified: true
    }
  },
  {
    id: 5209,
    name: 'Tullimonstrum',
    relatives: {
      status: 'uncertain',
      groups: ['Lampreys (Petromyzontiformes - debated vertebrate)', 'Molluscs / Annelids (debated non-vertebrate)'],
      rationale: "The phylogenetic affinity of the 'Tully Monster' is intensely debated, with competing hypotheses placing it as a stem-lamprey vertebrate or a lophotrochozoan invertebrate.",
      ecologicalAnalogues: ['Arrow Worms & Cuttlefish'],
      sources: [
        { title: "McCoy, V. E., et al. (2016). The 'Tully monster' is a vertebrate. Nature, 532, 496-499.", url_or_doi: "https://doi.org/10.1038/nature16992" },
        { title: "Sallan, L., et al. (2017). The 'Tully Monster' is not a vertebrate: arguments from nature. Palaeontology, 60(2), 149-157.", url_or_doi: "https://doi.org/10.1111/pala.12282" }
      ],
      verified: true
    }
  },
  {
    id: 5226,
    name: 'Pulmonoscorpius kirktonensis',
    relatives: {
      status: 'established',
      groups: ['Modern Scorpions (Scorpiones)', 'Arachnids (Arachnida)'],
      rationale: "Giant Carboniferous scorpion; modern true scorpions are its direct surviving descendants.",
      ecologicalAnalogues: ['Emperor Scorpion (Pandinus imperator - terrestrial predatory venomous forager)'],
      sources: [{ title: "Jeram, A. J. (1994). Carboniferous Orthosterni and their relationships to living scorpions. Proceedings of the 17th European Colloquium of Arachnology." }],
      verified: true
    }
  },

  // 2. Mammals & Synapsids restored to accurate structured mammalian relatives
  {
    id: 3168,
    name: 'Palaeoloxodon antiquus',
    relatives: {
      status: 'established',
      groups: ['African Forest Elephant (Loxodonta cyclotis)', 'African Bush Elephant (Loxodonta africana)', 'Asian Elephant (Elephas maximus)'],
      rationale: "Ancient genomic sequencing demonstrates that Palaeoloxodon is sister to the living African forest elephant (Loxodonta cyclotis).",
      ecologicalAnalogues: ['African Bush Elephant (Loxodonta africana)'],
      sources: [{ title: "Meyer, M., et al. (2017). Palaeogenomes of Eurasian straight-tusked elephants challenge the current view of elephant evolution. eLife, 6, e25413.", url_or_doi: "https://doi.org/10.7554/eLife.25413" }],
      verified: true
    }
  },
  {
    id: 3187,
    name: 'Arctodus simus',
    relatives: {
      status: 'established',
      groups: ['South American Spectacled Bear (Tremarctos ornatus)'],
      rationale: "Short-faced bears belong to the tremarctine bear subfamily (Tremarctinae); the spectacled bear of the Andes is their sole living survivor.",
      ecologicalAnalogues: ['Brown Bear & Polar Bear (apex opportunistic hypercarnivory)'],
      sources: [{ title: "Mitchell, K. J., et al. (2016). Ancient mitogenomics reveals the phylogenetic history of the extinct short-faced bears. Biology Letters, 12(4), 20160062.", url_or_doi: "https://doi.org/10.1098/rsbl.2016.0062" }],
      verified: true
    }
  },
  {
    id: 3189,
    name: 'Josephoartigasia monesi',
    relatives: {
      status: 'established',
      groups: ['Pacarana (Dinomys branickii)'],
      rationale: "Belongs to Dinomyidae within Caviomorpha; the pacarana of South America is the sole living species of this family.",
      ecologicalAnalogues: ['Capybara (Hydrochoerus hydrochaeris - giant semi-aquatic rodent)', 'Hippopotamus (megaherbivore niche)'],
      sources: [{ title: "Rinderknecht, A., & Blanco, R. E. (2008). The largest fossil rodent. Proceedings of the Royal Society B, 275(1637), 923-928.", url_or_doi: "https://doi.org/10.1098/rspb.2007.1645" }],
      verified: true
    }
  },
  {
    id: 3190,
    name: 'Livyatan melvillei',
    relatives: {
      status: 'established',
      groups: ['Sperm Whale (Physeter macrocephalus)', 'Pygmy & Dwarf Sperm Whales (Kogiidae)'],
      rationale: "Macroraptorial stem-physeteroid; modern sperm whales represent crown Physeteroidea.",
      ecologicalAnalogues: ['Killer Whale (Orcinus orca - apex marine predatory hunting)'],
      sources: [{ title: "Lambert, O., et al. (2010). The giant bite of a new raptorial sperm whale from the Miocene epoch of Peru. Nature, 466, 105-108.", url_or_doi: "https://doi.org/10.1038/nature09067" }],
      verified: true
    }
  },
  {
    id: 3193,
    name: 'Daeodon shoshonensis',
    relatives: {
      status: 'established',
      groups: ['Hippopotamuses (Hippopotamidae)', 'Cetaceans (Whales, Dolphins & Porpoises)'],
      rationale: "Entelodonts ('hell pigs') are nested within Cetancodontamorpha as stem-whippomorphs sister to hippos and cetaceans.",
      ecologicalAnalogues: ['Hyenas & Wild Boars (omnivorous bone-crushing scavenger)'],
      sources: [{ title: "Spaulding, M., et al. (2009). Relationships of Cetacea (Artiodactyla) Among Mammals. PLoS ONE, 4(9), e7062." }],
      verified: true
    }
  },
  {
    id: 5134,
    name: 'Palaeoloxodon namadicus',
    relatives: {
      status: 'established',
      groups: ['African Forest Elephant (Loxodonta cyclotis)', 'Asian Elephant (Elephas maximus)'],
      rationale: "Belongs to the genus Palaeoloxodon, closely related to Loxodonta cyclotis.",
      ecologicalAnalogues: ['African Bush Elephant'],
      sources: [{ title: "Meyer, M., et al. (2017). Palaeogenomes of straight-tusked elephants. eLife, 6, e25413." }],
      verified: true
    }
  },
  {
    id: 5142,
    name: 'Glyptodon',
    relatives: {
      status: 'established',
      groups: ['Modern Armadillos (Chlamyphoridae: Pink Fairy Armadillo, Giant Armadillo)'],
      rationale: "Genomic analyses demonstrate that glyptodonts represent a specialized subfamily (Glyptodontinae) within Chlamyphoridae.",
      ecologicalAnalogues: ['Giant Tortoises (domed osteodermal carapace)'],
      sources: [{ title: "Delsuc, F., et al. (2016). The Phylogenetic Affinities of the Extinct Glyptodonts. Current Biology, 26(4), R155-R156." }],
      verified: true
    }
  },
  {
    id: 5151,
    name: 'Megabalaena',
    relatives: {
      status: 'established',
      groups: ['North Atlantic Right Whale (Eubalaena glacialis)', 'Bowhead Whale (Balaena mysticetus)'],
      rationale: "Belongs to Balaenidae; modern right whales and the bowhead whale are living congeners.",
      ecologicalAnalogues: ['Right Whales (Balaenidae - continuous skim filter feeding)'],
      sources: [{ title: "Marx, F. G., et al. (2016). Cetacean Paleobiology. Wiley-Blackwell." }],
      verified: true
    }
  },
  {
    id: 5152,
    name: 'Scylacosaurus',
    relatives: {
      status: 'established',
      groups: ['Modern Mammals (Crown Mammalia)'],
      rationale: "Therocephalian therapsid; modern mammals are its surviving synapsid relatives.",
      ecologicalAnalogues: ['Viverrids & Small Canids'],
      sources: [{ title: "Huttenlocker, A. K. (2014). Body size evolution and cranial osteology of Therocephalia." }],
      verified: true
    }
  },
  {
    id: 5161,
    name: 'Elasmotherium',
    relatives: {
      status: 'established',
      groups: ['Modern Rhinoceroses (Rhinocerotidae: White, Black, Indian, Javan, Sumatran Rhinos)'],
      rationale: "Elasmotheriine rhinoceros; sister group to modern crown Rhinocerotinae.",
      ecologicalAnalogues: ['White Rhinoceros (Ceratotherium simum - specialized wide-lipped grazing)'],
      sources: [{ title: "Kosintsev, P., et al. (2019). Evolution and extinction of the giant rhinoceros Elasmotherium sibiricum. Nature Ecology & Evolution, 3, 31-38." }],
      verified: true
    }
  },
  {
    id: 5165,
    name: 'Dinocrocuta',
    relatives: {
      status: 'established',
      groups: ['Hyenas (Hyaenidae)', 'Feliform Carnivorans (Cats, Viverrids, Mongooses)'],
      rationale: "Percrocutid feliform carnivoran closely related to modern hyenas.",
      ecologicalAnalogues: ['Spotted Hyena (Crocuta crocuta - hypercarnivorous bone-cracking scavengery)'],
      sources: [{ title: "Deng, T., & Tseng, Z. J. (2010). Osteological evidence for predatory behavior in Dinocrocuta gigantea. Chinese Science Bulletin, 55(17), 1790-1794." }],
      verified: true
    }
  },
  {
    id: 5166,
    name: 'Hyaenodon',
    relatives: {
      status: 'established',
      groups: ['Crown Placental Mammals (Laurasiatheria / Ferae: Carnivorans & Pangolins)'],
      rationale: "Extinct hyaenodontan placental mammal belonging to Ferae.",
      ecologicalAnalogues: ['Wolves & Spotted Hyenas (pack-hunting cursorial carnivory)'],
      sources: [{ title: "Borths, M. R., & Stevens, N. J. (2017). The first hyaenodont from the late Eocene of Afro-Arabia. PLOS ONE, 12(10), e0185350." }],
      verified: true
    }
  },
  {
    id: 5169,
    name: 'Amphicyon',
    relatives: {
      status: 'established',
      groups: ['Caniform Carnivorans (Bears, Canids, Seals, Mustelids)'],
      rationale: "Amphicyonid ('bear-dog') belonging to Caniformia; sister to Arctoidea (bears, seals, mustelids) and Canidae.",
      ecologicalAnalogues: ['Grizzly Bear & Wolf (massive opportunistic apex predator)'],
      sources: [{ title: "Hunt, R. M. (1998). Amphicyonidae. In Evolution of Tertiary Mammals of North America (pp. 196-227)." }],
      verified: true
    }
  },
  {
    id: 5170,
    name: 'Thylacosmilus',
    relatives: {
      status: 'established',
      groups: ['Modern Marsupials (Metatheria: Didelphimorphia, Dasyuromorphia)'],
      rationale: "Sparassodont metatherian related to living marsupials, demonstrating extraordinary saber-toothed convergence with placental cats.",
      ecologicalAnalogues: ['Saber-Toothed Cats (Smilodon - saber-toothed cervical stabbing)'],
      sources: [{ title: "Janis, C. M., et al. (2020). An eye for a tooth: analysis, osteology and functional anatomy of Thylacosmilus atrox. PeerJ, 8, e9346." }],
      verified: true
    }
  },
  {
    id: 5172,
    name: 'Megacerops',
    relatives: {
      status: 'established',
      groups: ['Horses (Equidae)', 'Tapirs (Tapiridae)', 'Rhinoceroses (Rhinocerotidae)'],
      rationale: "Brontothere perissodactyl closely related to modern equids, tapirs, and rhinos.",
      ecologicalAnalogues: ['White Rhinoceros (massive horned herbivorous grazer)'],
      sources: [{ title: "Mihlbachler, M. C. (2008). Species taxonomy, phylogeny, and biogeography of the Brontotheriidae. Bulletin of the AMNH, 311, 1-475." }],
      verified: true
    }
  },
  {
    id: 5173,
    name: 'Cervalces',
    relatives: {
      status: 'established',
      groups: ['Moose (Alces alces)', 'Elk / Wapiti (Cervus canadensis)', 'Deer (Cervidae)'],
      rationale: "Stag-moose belonging to Capreolinae within Cervidae; living moose (Alces alces) are its closest extant relatives.",
      ecologicalAnalogues: ['Moose (Alces alces - wetland and taiga browsing)'],
      sources: [{ title: "Breda, M. (2005). The genus Cervalces in the Pleistocene of Europe. Courier Forschungsinstitut Senckenberg, 256, 99-116." }],
      verified: true
    }
  },
  {
    id: 5174,
    name: 'Synthetoceras',
    relatives: {
      status: 'established',
      groups: ['Camels and Llamas (Camelidae)', 'Ruminants (Ruminantia: Deer, Antelopes, Bovids)'],
      rationale: "Protoceratid artiodactyl belonging to Tylopoda (camel-line of artiodactyls).",
      ecologicalAnalogues: ['Pronghorn (Antilocapra americana - bifurcated cranial horns)'],
      sources: [{ title: "Prothero, D. R. (1998). Protoceratidae. In Evolution of Tertiary Mammals of North America (pp. 431-438)." }],
      verified: true
    }
  },
  {
    id: 5175,
    name: 'Dinofelis',
    relatives: {
      status: 'established',
      groups: ['Modern Felids (Felidae: Pantherinae & Felinae)'],
      rationale: "Metailurine machairodont felid closely related to modern big cats.",
      ecologicalAnalogues: ['Leopard & Jaguar (Panthera onca - ambush woodland carnivory)'],
      sources: [{ title: "Werdelin, L., & Lewis, M. E. (2001). A revision of the genus Dinofelis. Zoological Journal of the Linnean Society, 132(2), 147-258." }],
      verified: true
    }
  },
  {
    id: 5177,
    name: 'Megaloceros',
    relatives: {
      status: 'established',
      groups: ['Fallow Deer (Dama dama)', 'Red Deer (Cervus elaphus)'],
      rationale: "Giant 'Irish Elk' belonging to Cervinae; ancient DNA confirms sister relationship to living fallow deer.",
      ecologicalAnalogues: ['Moose & Fallow Deer (megaloceros palmate antler displays)'],
      sources: [{ title: "Lister, A. M., et al. (2005). The phylogenetic position of the 'giant deer' Megaloceros. Nature, 438, 850-853." }],
      verified: true
    }
  },
  {
    id: 5181,
    name: 'Entelodon',
    relatives: {
      status: 'established',
      groups: ['Hippopotamuses (Hippopotamidae)', 'Cetaceans (Whales and Dolphins)'],
      rationale: "Stem-whippomorph cetancodontamorph artiodactyl.",
      ecologicalAnalogues: ['Wild Boar & Hyenas'],
      sources: [{ title: "Spaulding, M., et al. (2009). Relationships of Cetacea (Artiodactyla) Among Mammals. PLoS ONE, 4(9), e7062." }],
      verified: true
    }
  },
  {
    id: 5182,
    name: 'Sarkastodon',
    relatives: {
      status: 'established',
      groups: ['Crown Placental Mammals (Laurasiatheria / Ferae)'],
      rationale: "Oxyaenid placental carnivore; sister to modern Carnivora within Ferae.",
      ecologicalAnalogues: ['Grizzly Bear & Lion (heavy-bodied apex bone-cracking predator)'],
      sources: [{ title: "Rose, K. D. (2006). The Beginning of the Age of Mammals." }],
      verified: true
    }
  },
  {
    id: 5183,
    name: 'Deinotherium',
    relatives: {
      status: 'established',
      groups: ['Modern Elephants (Elephantidae: Asian & African Elephants)'],
      rationale: "Basal proboscidean with downward-curving mandibular tusks; modern elephants are its sole living relatives.",
      ecologicalAnalogues: ['African Bush Elephant (Loxodonta africana - high-browsing forest ecology)'],
      sources: [{ title: "Markov, G. N. (2008). Fossil proboscideans from Bulgaria. Historia Naturalis Bulgarica, 19, 137-144." }],
      verified: true
    }
  },
  {
    id: 5202,
    name: 'Crash bandicoot',
    relatives: {
      status: 'established',
      groups: ['Modern Bandicoots (Peramelidae)', 'Bilbies (Thylacomyidae)'],
      rationale: "Miocene peramelemorphian marsupial; living bandicoots and bilbies represent its crown family.",
      ecologicalAnalogues: ['Long-Nosed Bandicoot (Perameles nasuta - digging insectivore)'],
      sources: [{ title: "Travouillon, K. J., et al. (2014). Earliest modern bandicoot from the Miocene of Australia. Journal of Vertebrate Paleontology, 34(2), 375-382." }],
      verified: true
    }
  },
  {
    id: 5205,
    name: 'Miracinonyx',
    relatives: {
      status: 'established',
      groups: ['Cougar (Puma concolor)', 'Jaguarundi (Herpailurus yagouaroundi)', 'Cheetah (Acinonyx jubatus)'],
      rationale: "American cheetah-like cat; ancient DNA proves it is sister to the modern cougar (Puma concolor), displaying convergent cursorial evolution with the African cheetah.",
      ecologicalAnalogues: ['Cheetah (Acinonyx jubatus - high-speed pursuit predation)', 'Snow Leopard (Panthera uncia - montane cursorial hunting)'],
      sources: [{ title: "Barnett, R., et al. (2005). Evolution of the extinct American cheetah-like cat. Biology Letters, 1(4), 389-392.", url_or_doi: "https://doi.org/10.1098/rsbl.2005.0388" }],
      verified: true
    }
  },

  // 3. Dinosaur & Archosaur Family Strings Cleanups
  { id: 114, name: 'Sphenosuchus', family: 'Sphenosuchidae' },
  { id: 1664, name: 'Isisfordia duncani', family: 'Isisfordiidae' },
  { id: 2319, name: 'Treposuchus indicus', family: 'Dyrosauridae' },
  { id: 5186, name: 'Aquilops', family: 'Protoceratopsidae' },
  { id: 5188, name: 'Yuxisaurus', family: 'Scelidosauridae' },
  { id: 5203, name: 'Hippodraco', family: 'Camptosauridae' },
  { id: 5220, name: 'Antarctopelta', family: 'Parankylosauria' }
];

async function runCleanup() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 EXECUTING FINAL CATALOG CLEANUP & CI PASS');
  console.log('═══════════════════════════════════════════════════════════');

  const preSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const preHashMap = new Map(preSpecies.map(s => [s.id, computeRowHash(s)]));
  const targetIds = new Set(CLEANUP_UPDATES.map(u => u.id));

  for (const update of CLEANUP_UPDATES) {
    const existing = preSpecies.find(s => s.id === update.id);
    if (!existing) throw new Error(`Target species ID ${update.id} not found in database!`);

    let currentTax = {};
    try { currentTax = JSON.parse(existing.taxonomy); } catch {}

    const updatedTax = {
      ...currentTax,
      family: update.family || currentTax.family,
      genus: currentTax.genus || existing.name.split(' ')[0],
      species: currentTax.species || existing.name
    };

    const updateData = { taxonomy: JSON.stringify(updatedTax) };
    if (update.relatives) {
      updateData.closestLivingRelatives = JSON.stringify(update.relatives);
    }

    await prisma.species.update({
      where: { id: update.id },
      data: updateData
    });

    console.log(`  ✓ Cleaned ID ${update.id} (${existing.name})`);
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

  // Synchronize static JSON archives
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

  console.log(`\n✨ FINAL CLEANUP COMPLETE.`);
}

runCleanup()
  .catch((err) => {
    console.error('Cleanup Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
