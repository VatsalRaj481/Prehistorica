const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CORYTHOSAURUS_ID = 482;
const EDESTUS_ID = 3172;

const EDESTUS_PALEOART = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Edestus_recon.png',
    type: 'art',
    credit: 'Entelognathus (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Edestus_recon.png'
  }
];

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA SAFEGUARD MIGRATION: CORYTHOSAURUS CLADE FIX & EDESTUS PALEOART');
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
  const preSnapshotPath = path.join(snapshotDir, `pre_fix_cory_edestus_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Execute audited updates
  console.log(`Step 2: Executing audited updates for target species...`);
  
  // 2A: Corythosaurus (ID 482) - Clade & Order correction
  const cory = allBefore.find(s => s.id === CORYTHOSAURUS_ID);
  if (!cory) throw new Error(`Target Corythosaurus (ID ${CORYTHOSAURUS_ID}) not found in database!`);

  let coryTaxonomy = {};
  try {
    coryTaxonomy = typeof cory.taxonomy === 'string' ? JSON.parse(cory.taxonomy) : (cory.taxonomy || {});
  } catch {
    coryTaxonomy = {};
  }
  coryTaxonomy.order = 'Ornithischia';

  await prisma.species.update({
    where: { id: CORYTHOSAURUS_ID },
    data: {
      clade: 'Ornithischian',
      taxonomy: JSON.stringify(coryTaxonomy)
    }
  });
  console.log(`  ✓ Updated ID ${CORYTHOSAURUS_ID} : ${cory.name} -> clade: 'Ornithischian', order: 'Ornithischia'`);

  // 2B: Edestus (ID 3172) - Paleoart update
  const edestus = allBefore.find(s => s.id === EDESTUS_ID);
  if (!edestus) throw new Error(`Target Edestus (ID ${EDESTUS_ID}) not found in database!`);

  await prisma.species.update({
    where: { id: EDESTUS_ID },
    data: {
      media: JSON.stringify(EDESTUS_PALEOART)
    }
  });
  console.log(`  ✓ Updated ID ${EDESTUS_ID} : ${edestus.name} -> Edestus_recon.png (Entelognathus, CC BY-SA 4.0)\n`);

  // STEP 3: Post-migration snapshot & anti-regression verification
  console.log('Step 3: Capturing post-migration snapshot and verifying anti-regression invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, `post_fix_cory_edestus_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== allBefore.length) {
    throw new Error(`CRITICAL: Species count mismatch! Expected: ${allBefore.length}, Got: ${allAfter.length}`);
  }

  let nonTargetUntouched = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    if (before.id === CORYTHOSAURUS_ID) {
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt' || key === 'clade' || key === 'taxonomy') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          unexpectedDiffs.push(`Corythosaurus (ID ${before.id}) had unexpected modification in field '${key}'`);
        }
      }
    } else if (before.id === EDESTUS_ID) {
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt' || key === 'media') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          unexpectedDiffs.push(`Edestus (ID ${before.id}) had unexpected modification in field '${key}'`);
        }
      }
    } else {
      // Non-target species: 100% bit-for-bit identical
      let isIdentical = true;
      for (const key of Object.keys(before)) {
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          isIdentical = false;
          unexpectedDiffs.push(`Non-target species ID ${before.id} (${before.name}) was modified in '${key}'!`);
        }
      }
      if (isIdentical) {
        nonTargetUntouched++;
      }
    }
  }

  if (unexpectedDiffs.length > 0) {
    console.error('CRITICAL SAFEGUARD FAILURES:');
    unexpectedDiffs.forEach(d => console.error('  - ' + d));
    throw new Error('Anti-regression verification failed!');
  }

  const expectedUntouched = allBefore.length - 2;
  console.log(`  ✓ Verified: 100% of non-target species (${nonTargetUntouched}/${expectedUntouched}) remain completely untouched!`);
  console.log(`  ✓ Verified: Both target species updated cleanly with zero regressions.`);
  console.log(`  ✓ Total cataloged specimens in database: ${allAfter.length}\n`);

  // STEP 4: Synchronize Static JSON Archives
  console.log('Step 4: Synchronizing static JSON archives...');
  const fullExportPath = path.join(__dirname, '..', 'prisma', 'species_full_export.json');
  fs.writeFileSync(fullExportPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Synced master export (${allAfter.length} species): ${fullExportPath}`);

  // Cretaceous sync (Corythosaurus is Cretaceous)
  const cretaceousSpecies = allAfter.filter(s => {
    const tp = (s.timePeriod || '').toLowerCase();
    return tp.includes('cretaceous');
  });
  const cretaceousPath = path.join(__dirname, '..', 'prisma', 'species_cretaceous.json');
  fs.writeFileSync(cretaceousPath, JSON.stringify(cretaceousSpecies, null, 2), 'utf8');
  console.log(`  ✓ Synchronized species_cretaceous.json (${cretaceousSpecies.length} species)`);

  // Others sync (Edestus is Carboniferous / Paleozoic)
  const othersSpecies = allAfter.filter(s => {
    const tp = (s.timePeriod || '').toLowerCase();
    return !tp.includes('jurassic') && !tp.includes('cretaceous') && !tp.includes('triassic');
  });
  const othersPath = path.join(__dirname, '..', 'prisma', 'species_others.json');
  fs.writeFileSync(othersPath, JSON.stringify(othersSpecies, null, 2), 'utf8');
  console.log(`  ✓ Synchronized species_others.json (${othersSpecies.length} species)\n`);

  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('✅ CORYTHOSAURUS CLADE FIX & EDESTUS PALEOART UPDATE COMPLETED SAFELY');
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
