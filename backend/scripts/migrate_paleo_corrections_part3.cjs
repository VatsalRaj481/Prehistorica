require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient, Clade, Diet, Habitat } = require('@prisma/client');
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

// Target diet updates (14 confirmed herbivore species)
const DIET_HERBIVORES = [
  15, // Plateosaurus trossingensis
  18, // Stegosaurus stenops
  19, // Brachiosaurus altithorax
  25, // Triceratops horridus
  27, // Parasaurolophus walkeri
  28, // Ankylosaurus magniventris
  70, // Isanosaurus
  73, // Lessemsaurus
  75, // Coloradisaurus
  79, // Guaibasaurus
  80, // Silesaurus
  108, // Longosuchus
  116, // Effigia
  117  // Shuvosaurus
];

// Target marine reptiles currently in clade Other
const MARINE_REPTILES_IN_OTHER = [
  { id: 224, name: 'Liopleurodon', order: 'Plesiosauria', family: 'Pliosauridae' },
  { id: 225, name: 'Plesiosaurus', order: 'Plesiosauria', family: 'Plesiosauridae' },
  { id: 226, name: 'Ichthyosaurus', order: 'Ichthyosauria', family: 'Ichthyosauridae' },
  { id: 227, name: 'Ophthalmosaurus', order: 'Ichthyosauria', family: 'Ichthyosauridae' },
  { id: 228, name: 'Cryptoclidus', order: 'Plesiosauria', family: 'Plesiosauridae' },
  { id: 230, name: 'Macroplata', order: 'Plesiosauria', family: 'Pliosauridae' },
  { id: 231, name: 'Peloneustes', order: 'Plesiosauria', family: 'Pliosauridae' },
  { id: 232, name: 'Pliosaurus', order: 'Plesiosauria', family: 'Pliosauridae' },
  { id: 233, name: 'Simolestes', order: 'Plesiosauria', family: 'Rhomaleosauridae' },
  { id: 234, name: 'Temnodontosaurus', order: 'Ichthyosauria', family: 'Leptopterygiidae' },
  { id: 237, name: 'Excalibosaurus', order: 'Ichthyosauria', family: 'Leptopterygiidae' },
  { id: 531, name: 'Kronosaurus', order: 'Plesiosauria', family: 'Pliosauridae' }
];

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🏛️  PREHISTORICA: PALEONTOLOGICAL CORRECTIONS (PART 3) WITH SAFEGUARD');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: CAPTURE PRE-OPERATION SNAPSHOT OF ALL DATABASE ROWS
  console.log('Step 1: Capturing pre-operation snapshot of all existing species in database...');
  const beforeSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`✅ Snapshot locked for all ${beforeSpecies.length} species records.\n`);

  const snapshotMap = new Map();
  beforeSpecies.forEach(s => {
    const fields = {};
    for (const f of ALL_PROTECTED_FIELDS) {
      fields[f] = s[f];
    }
    snapshotMap.set(s.id, { id: s.id, name: s.name, fields });
  });

  // Track target IDs to verify only approved records and fields change
  const targetIds = new Set();

  // STEP 2: APPLY TARGETED UPDATES
  console.log('Step 2: Applying targeted paleontological corrections...');

  // 1. DIET FIXES (Herbivores labeled as carnivores)
  console.log('\n--- 1. Applying Diet Fixes (Herbivore-to-Carnivore Default Bug) ---');
  for (const id of DIET_HERBIVORES) {
    targetIds.add(id);
    await prisma.species.update({
      where: { id },
      data: { diet: 'herbivore' }
    });
    const s = beforeSpecies.find(x => x.id === id);
    console.log(`  ✅ [#${id}] ${s?.name}: diet updated from '${s?.diet}' to 'herbivore'`);
  }

  // 2. LINNAEAN TAXONOMY CONFLATIONS & ORDER FIXES
  console.log('\n--- 2. Applying Linnaean Taxonomy & Family/Order Corrections ---');

  // #17 Dilophosaurus: Order Saurischia, Family Dilophosauridae (was Troodontidae)
  targetIds.add(17);
  const diloRecord = beforeSpecies.find(x => x.id === 17);
  let diloTax = JSON.parse(diloRecord.taxonomy || '{}');
  diloTax.order = 'Saurischia';
  diloTax.family = 'Dilophosauridae';
  await prisma.species.update({
    where: { id: 17 },
    data: { taxonomy: JSON.stringify(diloTax) }
  });
  console.log(`  ✅ [#17] Dilophosaurus wetherilli: taxonomy updated -> Order: Saurischia, Family: Dilophosauridae`);

  // #19 Brachiosaurus: Clade Sauropod, Order Saurischia, Family Brachiosauridae (was Clade: Other, Order: Other)
  targetIds.add(19);
  const brachioRecord = beforeSpecies.find(x => x.id === 19);
  let brachioTax = JSON.parse(brachioRecord.taxonomy || '{}');
  brachioTax.order = 'Saurischia';
  brachioTax.family = 'Brachiosauridae';
  await prisma.species.update({
    where: { id: 19 },
    data: {
      clade: 'Sauropod',
      taxonomy: JSON.stringify(brachioTax)
    }
  });
  console.log(`  ✅ [#19] Brachiosaurus altithorax: clade updated to 'Sauropod', taxonomy -> Order: Saurischia, Family: Brachiosauridae`);

  // #243 Agilodocodon: Order Docodonta, Family Docodontidae (was Cynodontia / Cynodontia)
  targetIds.add(243);
  const agiloRecord = beforeSpecies.find(x => x.id === 243);
  let agiloTax = JSON.parse(agiloRecord.taxonomy || '{}');
  agiloTax.order = 'Docodonta';
  agiloTax.family = 'Docodontidae';
  await prisma.species.update({
    where: { id: 243 },
    data: { taxonomy: JSON.stringify(agiloTax) }
  });
  console.log(`  ✅ [#243] Agilodocodon scansorius: taxonomy updated -> Order: Docodonta, Family: Docodontidae`);

  // #5192 Nundasuchus: Order Pseudosuchia, Family Nundasuchidae
  targetIds.add(5192);
  const nundaRecord = beforeSpecies.find(x => x.id === 5192);
  let nundaTax = JSON.parse(nundaRecord.taxonomy || '{}');
  nundaTax.order = 'Pseudosuchia';
  nundaTax.family = 'Nundasuchidae';
  await prisma.species.update({
    where: { id: 5192 },
    data: { taxonomy: JSON.stringify(nundaTax) }
  });
  console.log(`  ✅ [#5192] Nundasuchus songeaensis: taxonomy updated -> Order: Pseudosuchia, Family: Nundasuchidae`);

  // #5209 Tullimonstrum: Class Bilateria incertae sedis, Order Tullimonstrida, Family Tullimonstridae
  targetIds.add(5209);
  const tulliRecord = beforeSpecies.find(x => x.id === 5209);
  let tulliTax = JSON.parse(tulliRecord.taxonomy || '{}');
  tulliTax.class = 'Bilateria incertae sedis';
  tulliTax.order = 'Tullimonstrida';
  tulliTax.family = 'Tullimonstridae';
  await prisma.species.update({
    where: { id: 5209 },
    data: { taxonomy: JSON.stringify(tulliTax) }
  });
  console.log(`  ✅ [#5209] Tullimonstrum gregarium: taxonomy updated -> Order: Tullimonstrida, Family: Tullimonstridae`);

  // #5213 Asteriornis: Order Pangalloanserae, Family Asteriornithidae
  targetIds.add(5213);
  const astRecord = beforeSpecies.find(x => x.id === 5213);
  let astTax = JSON.parse(astRecord.taxonomy || '{}');
  astTax.order = 'Pangalloanserae';
  astTax.family = 'Asteriornithidae';
  await prisma.species.update({
    where: { id: 5213 },
    data: { taxonomy: JSON.stringify(astTax) }
  });
  console.log(`  ✅ [#5213] Asteriornis maastrichtensis: taxonomy updated -> Order: Pangalloanserae, Family: Asteriornithidae`);

  // 3. CLADE HIERARCHY OVERLAPS & MARINE REPTILES REASSIGNMENT
  console.log('\n--- 3. Applying Clade Hierarchy & Marine Reptiles Corrections ---');

  // #15 Plateosaurus: Move from Sauropod to Sauropodomorph (basal sauropodomorph)
  targetIds.add(15);
  await prisma.species.update({
    where: { id: 15 },
    data: { clade: 'Sauropodomorph' }
  });
  console.log(`  ✅ [#15] Plateosaurus trossingensis: clade updated from 'Sauropod' to 'Sauropodomorph'`);

  // Marine reptiles in Other -> Marine_Reptile and habitat: marine
  for (const m of MARINE_REPTILES_IN_OTHER) {
    targetIds.add(m.id);
    const currRecord = beforeSpecies.find(x => x.id === m.id);
    let tax = JSON.parse(currRecord.taxonomy || '{}');
    tax.order = m.order;
    tax.family = m.family;

    await prisma.species.update({
      where: { id: m.id },
      data: {
        clade: 'Marine_Reptile',
        habitat: 'marine',
        taxonomy: JSON.stringify(tax)
      }
    });
    console.log(`  ✅ [#${m.id}] ${m.name}: clade -> 'Marine_Reptile', habitat -> 'marine', order -> '${m.order}', family -> '${m.family}'`);
  }

  // 4. CLADISTIC ACCURACY: DINOSAURS & BIRDS (closestLivingRelatives)
  console.log('\n--- 4. Updating Cladistic Lineage (Dinosaurs & Birds) ---');
  // Update closestLivingRelatives for dinosaurian taxa and pterosaurs
  const THEROPOD_RELATIVES = JSON.stringify([
    'Crocodilians (closest living non-dinosaurian outgroup)',
    'Modern Birds / Aves (direct surviving avian theropod lineage)'
  ]);

  const NON_AVIAN_DINO_RELATIVES = JSON.stringify([
    'Modern Birds / Aves (surviving dinosaurian lineage)',
    'Crocodilians (closest living non-dinosaurian outgroup)'
  ]);

  const PTEROSAUR_RELATIVES = JSON.stringify([
    'Crocodilians & Modern Birds (extant archosaur outgroups)'
  ]);

  let cladisticsCount = 0;
  for (const s of beforeSpecies) {
    let newRelatives = null;

    if (s.clade === 'Theropod') {
      newRelatives = THEROPOD_RELATIVES;
    } else if (['Sauropod', 'Sauropodomorph', 'Ornithischian'].includes(s.clade) || s.id === 19 || s.id === 15) {
      newRelatives = NON_AVIAN_DINO_RELATIVES;
    } else if (s.clade === 'Pterosaur') {
      newRelatives = PTEROSAUR_RELATIVES;
    }

    if (newRelatives) {
      targetIds.add(s.id);
      await prisma.species.update({
        where: { id: s.id },
        data: { closestLivingRelatives: newRelatives }
      });
      cladisticsCount++;
    }
  }
  console.log(`  ✅ Updated closestLivingRelatives across ${cladisticsCount} archosaurian species (Theropods, Sauropodomorphs, Ornithischians, Pterosaurs)`);

  // STEP 3: STRICT POST-OPERATION SAFEGUARD VERIFICATION
  console.log('\nStep 3: Executing post-operation safeguard verification across all 596 species...');
  const afterSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });

  if (afterSpecies.length !== beforeSpecies.length) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: Species count changed! Expected ${beforeSpecies.length}, got ${afterSpecies.length}`);
  }

  const nonTargetViolations = [];
  const targetProtectedViolations = [];

  for (const before of beforeSpecies) {
    const after = afterSpecies.find(x => x.id === before.id);
    if (!after) {
      nonTargetViolations.push(`DELETED ROW: Species #${before.id} (${before.name}) was removed!`);
      continue;
    }

    // Check if it's a non-target species: MUST BE 100% UNTOUCHED
    if (!targetIds.has(before.id)) {
      for (const field of ALL_PROTECTED_FIELDS) {
        if (canonicalNormalize(before[field]) !== canonicalNormalize(after[field])) {
          nonTargetViolations.push(`Species #${after.id} (${after.name}) field '${field}' was modified without authorization!`);
        }
      }
    } else {
      // For target species: ONLY diet, clade, habitat, taxonomy, or closestLivingRelatives may change
      // Media, size estimates, silhouettes, interesting facts, discovery history MUST REMAIN 100% PRISTINE
      const invariantFields = [
        'name',
        'scientificName',
        'nameMeaning',
        'timePeriod',
        'epoch',
        'myaStart',
        'myaEnd',
        'media',
        'sizeNotes',
        'sizeEstimate',
        'sizeComparisonToHuman',
        'comparisonSilhouette',
        'interestingFacts',
        'discoveryHistory',
        'sources'
      ];

      for (const field of invariantFields) {
        if (canonicalNormalize(before[field]) !== canonicalNormalize(after[field])) {
          targetProtectedViolations.push(`Target Species #${after.id} (${after.name}) protected invariant field '${field}' was corrupted!`);
        }
      }
    }
  }

  if (nonTargetViolations.length > 0 || targetProtectedViolations.length > 0) {
    console.error('\n❌ SAFEGUARD AUDIT FAILED!');
    nonTargetViolations.forEach(v => console.error('  [NON-TARGET VIOLATION]', v));
    targetProtectedViolations.forEach(v => console.error('  [TARGET INVARIANT VIOLATION]', v));
    throw new Error('Safeguard check encountered violations! Halting static JSON synchronization.');
  }

  console.log(`✅ [SAFEGUARD AUDIT PASSED 100%]:`);
  console.log(`  - Exactly ${targetIds.size} target species records updated in approved fields.`);
  console.log(`  - 100% of all other records and all media/silhouettes/measurements remain pristine and untouched.\n`);

  // STEP 4: SYNCHRONIZE STATIC JSON FILES
  console.log('Step 4: Synchronizing all 5 static JSON archive files...');

  const dbMap = new Map();
  afterSpecies.forEach(s => dbMap.set(s.id, s));

  function syncJsonFile(filePath, label) {
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️ File not found: ${filePath}`);
      return;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let synced = 0;

    for (const item of data) {
      const dbRow = dbMap.get(item.id);
      if (dbRow) {
        let changed = false;

        // Sync diet
        if (item.diet !== dbRow.diet) {
          item.diet = dbRow.diet;
          changed = true;
        }
        // Sync clade
        if (item.clade !== dbRow.clade) {
          item.clade = dbRow.clade;
          changed = true;
        }
        // Sync habitat
        if (item.habitat !== dbRow.habitat) {
          item.habitat = dbRow.habitat;
          changed = true;
        }
        // Sync taxonomy
        if (canonicalNormalize(item.taxonomy) !== canonicalNormalize(dbRow.taxonomy)) {
          item.taxonomy = dbRow.taxonomy;
          changed = true;
        }
        // Sync closestLivingRelatives
        if (canonicalNormalize(item.closestLivingRelatives) !== canonicalNormalize(dbRow.closestLivingRelatives)) {
          item.closestLivingRelatives = dbRow.closestLivingRelatives;
          changed = true;
        }

        // Special check for T. rex and Triceratops in species_cretaceous.json if order had family name
        if (item.id === 24) { // T. rex
          let t = typeof item.taxonomy === 'string' ? JSON.parse(item.taxonomy) : item.taxonomy;
          if (t && t.order === 'Tyrannosauridae') {
            t.order = 'Saurischia';
            t.family = 'Tyrannosauridae';
            item.taxonomy = JSON.stringify(t);
            changed = true;
          }
        }
        if (item.id === 25) { // Triceratops
          let t = typeof item.taxonomy === 'string' ? JSON.parse(item.taxonomy) : item.taxonomy;
          if (t && t.order === 'Ceratopsidae') {
            t.order = 'Ornithischia';
            t.family = 'Ceratopsidae';
            item.taxonomy = JSON.stringify(t);
            changed = true;
          }
        }
        if (item.id === 17) { // Dilophosaurus
          let t = typeof item.taxonomy === 'string' ? JSON.parse(item.taxonomy) : item.taxonomy;
          if (t && (t.order === 'Dilophosauridae' || t.family === 'Troodontidae')) {
            t.order = 'Saurischia';
            t.family = 'Dilophosauridae';
            item.taxonomy = JSON.stringify(t);
            changed = true;
          }
        }

        if (changed) synced++;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`  ✅ Synced ${synced} updated records in ${label} (${data.length} total entries)`);
  }

  // 1. species_jurassic.json
  syncJsonFile(path.resolve(__dirname, '../prisma/species_jurassic.json'), 'species_jurassic.json');
  // 2. species_cretaceous.json
  syncJsonFile(path.resolve(__dirname, '../prisma/species_cretaceous.json'), 'species_cretaceous.json');
  // 3. species_triassic.json
  syncJsonFile(path.resolve(__dirname, '../prisma/species_triassic.json'), 'species_triassic.json');
  // 4. species_others.json
  syncJsonFile(path.resolve(__dirname, '../prisma/species_others.json'), 'species_others.json');
  // 5. species_full_export.json
  syncJsonFile(path.resolve(__dirname, '../prisma/species_full_export.json'), 'species_full_export.json');

  console.log('\n🎉 ALL PALEONTOLOGICAL CORRECTIONS AND SAFEGUARD SYNCS COMPLETED SUCCESSFULLY!');
}

main()
  .catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
