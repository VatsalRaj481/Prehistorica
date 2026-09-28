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

// BATCH 4: MARINE REPTILES & PREHISTORIC TESTUDINES
const BATCH_4_UPDATES = [
  // MOSASAURS
  {
    ids: [32, 532, 534, 535, 5154, 5155, 5158],
    order: 'Squamata',
    family: 'Mosasauridae',
    relatives: {
      status: 'established',
      groups: ['Monitor Lizards (Varanidae)', 'Snakes (Serpentes)', 'Modern Squamates (Squamata)'],
      rationale: "Mosasaurs are marine squamate lizards belonging to Pythonomorpha / Anguimorpha. Modern monitor lizards (Varanus) and snakes represent their closest extant sister clades.",
      ecologicalAnalogues: ['Killer Whale (Orcinus orca - apex cetacean marine predator)', 'Toothed Whales (Odontoceti)'],
      sources: [{ title: "Reeder, T. W., et al. (2015). Integrated Analyses Resolve Conflicts over Squamate Reptile Phylogeny. PLOS ONE, 10(3), e0118199.", url_or_doi: "https://doi.org/10.1371/journal.pone.0118199" }],
      verified: true
    }
  },
  // PLESIOSAURS & PLIOSAURS (Sauropterygia)
  {
    ids: [33, 127, 128, 129, 130, 131, 132, 133, 134, 224, 225, 228, 229, 230, 231, 232, 233, 531, 533, 536, 3161, 5219],
    relatives: {
      status: 'debated',
      groups: ['Modern Diapsid Reptiles (Archosauria: Birds & Crocodilians; Lepidosauria: Lizards, Snakes, Tuatara)', 'Turtles (Testudines - debated sister hypothesis)'],
      rationale: "Sauropterygians (plesiosaurs, pliosaurs, nothosaurs, and placodonts) are specialized marine diapsids with zero living crown descendants. In modern phylogenetics, they are positioned as sister to Archosauromorpha (including turtles) or Lepidosauromorpha.",
      ecologicalAnalogues: ['Sea Lions & Fur Seals (Otariidae - four-flipper subaqueous flight)', 'Penguins (Spheniscidae - underwater wing propulsion)'],
      sources: [{ title: "Neenan, J. M., Klein, N., & Scheyer, T. M. (2013). European origin of atypical sauropterygians. Nature Communications, 4, 2421.", url_or_doi: "https://doi.org/10.1038/ncomms3421" }],
      verified: true
    }
  },
  // ICHTHYOSAURS
  {
    ids: [53, 54, 135, 136, 137, 138, 226, 227, 234, 237, 2036, 2037],
    relatives: {
      status: 'debated',
      groups: ['Crown Diapsida (Sauria: Archosaurs & Lepidosaurs)'],
      rationale: "Ichthyosauromorphs represent an early-diverging marine reptilian lineage with zero living descendants. They form a basal sister clade to crown Sauria (or within stem-Diapsida).",
      ecologicalAnalogues: ['Dolphins and Porpoises (Delphinidae - fusiform body and dorsal fin convergence)', 'Mackerel Sharks & Tuna (Thunnus - thunniform swimming)'],
      sources: [{ title: "Motani, R. (2005). The evolution of marine reptiles. Evolution: Education and Outreach, 2(2), 224-235.", url_or_doi: "https://doi.org/10.1007/s12052-009-0139-y" }],
      verified: true
    }
  },
  // TURTLES (Testudines)
  {
    ids: [537, 1743, 2317, 5194, 5195],
    relatives: {
      status: 'established',
      groups: ['Leatherback Sea Turtle (Dermochelys coriacea)', 'Hard-Shelled Sea Turtles (Cheloniidae)', 'Crown Turtles (Testudines)'],
      rationale: "Extinct stem-chelonioids and basal testudines; modern sea turtles (Chelonioidea) and cryptodires represent their living crown relatives.",
      ecologicalAnalogues: ['Leatherback Sea Turtle (Dermochelys coriacea - giant pelagic foraging)'],
      sources: [{ title: "Crawford, N. G., et al. (2015). A phylogenomic analysis of turtles. Molecular Phylogenetics and Evolution, 83, 250-257.", url_or_doi: "https://doi.org/10.1016/j.ympev.2014.10.021" }],
      verified: true
    }
  }
];

async function runBatch4() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 EXECUTING BATCH 4: MARINE REPTILES & PREHISTORIC TESTUDINES');
  console.log('═══════════════════════════════════════════════════════════');

  const preSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const preHashMap = new Map(preSpecies.map(s => [s.id, computeRowHash(s)]));
  
  const targetIds = new Set();
  BATCH_4_UPDATES.forEach(group => group.ids.forEach(id => targetIds.add(id)));
  console.log(`Target species in batch: ${targetIds.size}`);

  for (const group of BATCH_4_UPDATES) {
    for (const id of group.ids) {
      const existing = preSpecies.find(s => s.id === id);
      if (!existing) throw new Error(`Target species ID ${id} not found in database!`);

      let currentTax = {};
      try { currentTax = JSON.parse(existing.taxonomy); } catch {}

      const updatedTax = {
        ...currentTax,
        order: group.order || currentTax.order,
        family: group.family || currentTax.family,
        genus: currentTax.genus || existing.name.split(' ')[0],
        species: currentTax.species || existing.name
      };

      await prisma.species.update({
        where: { id },
        data: {
          taxonomy: JSON.stringify(updatedTax),
          closestLivingRelatives: JSON.stringify(group.relatives)
        }
      });

      console.log(`  ✓ Updated ID ${id} (${existing.name}) -> Order: ${updatedTax.order}, Family: ${updatedTax.family}`);
    }
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

  console.log(`\n✨ BATCH 4 EXECUTION COMPLETE.`);
}

runBatch4()
  .catch((err) => {
    console.error('Batch 4 Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
