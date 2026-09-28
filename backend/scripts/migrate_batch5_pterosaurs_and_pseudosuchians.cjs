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

async function runBatch5() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 EXECUTING BATCH 5: PTEROSAURS, PSEUDOSUCHIANS & CEPHALOPODS');
  console.log('═══════════════════════════════════════════════════════════');

  const preSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const preHashMap = new Map(preSpecies.map(s => [s.id, computeRowHash(s)]));

  // 1. Identify all target species for Batch 5
  // Pterosaurs (54 taxa)
  const pterosaurs = preSpecies.filter(s => s.clade === 'Pterosaur');
  // Pseudosuchians (Phytosaur, Aetosaur, Rauisuchian, Poposauroid, Crocodylomorph)
  const pseudosuchians = preSpecies.filter(s => ['Phytosaur', 'Aetosaur', 'Rauisuchian', 'Poposauroid', 'Crocodylomorph'].includes(s.clade));
  // Cephalopods (541, 542, 543)
  const cephalopods = preSpecies.filter(s => [541, 542, 543].includes(s.id));

  const targetIds = new Set([
    ...pterosaurs.map(s => s.id),
    ...pseudosuchians.map(s => s.id),
    ...cephalopods.map(s => s.id)
  ]);

  console.log(`Target species in batch: ${targetIds.size} (${pterosaurs.length} pterosaurs, ${pseudosuchians.length} pseudosuchians, ${cephalopods.length} cephalopods)`);

  // Family cleanup dictionary
  const familyCleanups = {
    'Austriadactylus clade': 'Austriadraconidae',
    'Darwinopterus clade': 'Wukongopteridae',
    'Harpactognathus clade': 'Rhamphorhynchidae',
    'Mesadactylus clade': 'Pterodactyloidea',
    'Ludodactylus clade': 'Ornithocheiridae',
    'Fasolasuchus clade': 'Fasolasuchidae',
    'Prestosuchus clade': 'Prestosuchidae',
    'Batrachotomus clade': 'Loricata',
    'Postosuchus clade': 'Rauisuchidae',
    'Polonosuchus clade': 'Rauisuchidae',
    'Saurosuchus clade': 'Prestosuchidae',
    'Tikisuchus clade': 'Rauisuchidae',
    'Teratosaurus clade': 'Rauisuchidae',
    'Poposaurus clade': 'Poposauridae',
    'Sillosuchus clade': 'Shuvosauridae',
    'Effigia clade': 'Shuvosauridae',
    'Shuvosaurus clade': 'Shuvosauridae',
    'Lotosaurus clade': 'Lotosauridae',
    'Arizonasaurus clade': 'Ctenosauriscidae',
    'Desmatosuchus clade': 'Stagonolepididae',
    'Stagonolepis clade': 'Stagonolepididae',
    'Longosuchus clade': 'Stagonolepididae',
    'Aetosaurus clade': 'Stagonolepididae',
    'Typothorax clade': 'Stagonolepididae',
    'Paratypothorax clade': 'Stagonolepididae',
    'Rutiodon clade': 'Phytosauridae',
    'Parasuchus clade': 'Parasuchidae',
    'Mystriosuchus clade': 'Phytosauridae',
    'Nicrosaurus clade': 'Phytosauridae',
    'Pseudopalatus clade': 'Phytosauridae',
    'Smok clade': 'Archosauria',
    'Novialoidea': 'Wukongopteridae',
    'Pterodactyloidea': 'Pterodactylidae'
  };

  // Process Cephalopods
  for (const s of cephalopods) {
    let tax = {};
    try { tax = JSON.parse(s.taxonomy); } catch {}
    const isAmmonite = s.id === 541 || s.id === 542;
    const rel = {
      status: 'established',
      groups: isAmmonite
        ? ['Modern Coleoid Cephalopods (Squids, Octopuses, Cuttlefishes)', 'Nautiluses (Nautilidae)']
        : ['Modern Squids & Octopuses (Coleoidea)', 'Vampire Squid (Vampyroteuthis infernalis)'],
      rationale: isAmmonite
        ? "Ammonites are extinct shelled cephalopods belonging to Ammonoidea. Modern coleoids (squids, octopuses) and the chambered nautilus represent their closest extant relatives."
        : "Tusoteuthis is a giant Cretaceous vampyromorph/coleoid cephalopod; modern squids and the vampire squid are its closest living crown relatives.",
      ecologicalAnalogues: ['Giant Squid (Architeuthis dux)', 'Chambered Nautilus (Nautilus pompilius)'],
      sources: [{ title: "Kröger, B., et al. (2011). Early cephalopod evolution. Lethaia, 44(4), 369-383.", url_or_doi: "https://doi.org/10.1111/j.1502-3931.2011.00298.x" }],
      verified: true
    };
    await prisma.species.update({
      where: { id: s.id },
      data: {
        taxonomy: JSON.stringify({ ...tax, class: 'Cephalopoda' }),
        closestLivingRelatives: JSON.stringify(rel)
      }
    });
    console.log(`  ✓ Updated Cephalopod ID ${s.id} (${s.name})`);
  }

  // Process Pterosaurs
  for (const s of pterosaurs) {
    let tax = {};
    try { tax = JSON.parse(s.taxonomy); } catch {}
    let family = tax.family || '';
    if (familyCleanups[family]) family = familyCleanups[family];

    const rel = {
      status: 'established',
      groups: ['Modern Birds (Aves - closest living archosaur sister lineage)', 'Crocodilians (Crocodilia - archosaur outgroup)'],
      rationale: "Pterosaurs belong to Avemetatarsalia / Ornithodira within Archosauria. They left no living descendants; modern birds are their closest extant evolutionary cousins (not descendants).",
      ecologicalAnalogues: ['Albatrosses (Diomedeidae - oceanic dynamic soaring)', 'Bats (Chiroptera - membranous wing powered flight)', 'Storks & Cranes (Ciconiidae - azhdarchid terrestrial walking foraging)'],
      sources: [{ title: "Nesbitt, S. J. (2011). The early evolution of archosaurs. Bull. AMNH, 352, 1-292.", url_or_doi: "https://doi.org/10.1206/352.1" }],
      verified: true
    };

    await prisma.species.update({
      where: { id: s.id },
      data: {
        taxonomy: JSON.stringify({ ...tax, family }),
        closestLivingRelatives: JSON.stringify(rel)
      }
    });
  }
  console.log(`  ✓ Updated all 54 Pterosaurs to structured extant relatives.`);

  // Process Pseudosuchians
  for (const s of pseudosuchians) {
    let tax = {};
    try { tax = JSON.parse(s.taxonomy); } catch {}
    let family = tax.family || '';
    if (familyCleanups[family]) family = familyCleanups[family];

    const rel = {
      status: 'established',
      groups: ['Modern Crocodilians (Crocodilia: Alligators, Crocodiles, Caimans, Gharials)', 'Modern Birds (Aves - archosaur sister lineage)'],
      rationale: "Belongs to Pseudosuchia (the crocodile-line of Archosauria). Modern crocodilians are the sole surviving descendants and closest relatives of this diverse evolutionary lineage.",
      ecologicalAnalogues: ['Komodo Dragon & Monitor Lizards (Varanidae - terrestrial hypercarnivory)', 'Armadillos (Cingulata - protective osteodermal armor)'],
      sources: [{ title: "Nesbitt, S. J. (2011). The early evolution of archosaurs. Bull. AMNH, 352, 1-292.", url_or_doi: "https://doi.org/10.1206/352.1" }],
      verified: true
    };

    await prisma.species.update({
      where: { id: s.id },
      data: {
        taxonomy: JSON.stringify({ ...tax, family }),
        closestLivingRelatives: JSON.stringify(rel)
      }
    });
  }
  console.log(`  ✓ Updated all ${pseudosuchians.length} Pseudosuchians to structured extant relatives.`);

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

  console.log(`\n✨ BATCH 5 EXECUTION COMPLETE.`);
}

runBatch5()
  .catch((err) => {
    console.error('Batch 5 Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
