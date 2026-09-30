const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const GORGONOPS_ID = 1656;
const LYSTROSAURUS_ID = 1653;

const GORGONOPS_PALEOART = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Gorgonops_torvus.jpg',
    type: 'art',
    credit: 'Dmitry Bogdanov (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gorgonops_torvus.jpg'
  }
];

const LYSTROSAURUS_PALEOART = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Lystrosaurus_BW.jpg',
    type: 'art',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lystrosaurus_BW.jpg'
  }
];

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA SAFEGUARD MIGRATION: GORGONOPS & LYSTROSAURUS MURRAYI PALEOART');
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
  const preSnapshotPath = path.join(snapshotDir, `pre_fix_gorgonops_lystro_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Execute audited updates
  console.log('Step 2: Executing audited updates...');

  // 2A: Gorgonops torvus (ID 1656)
  const gorgonops = allBefore.find(s => s.id === GORGONOPS_ID);
  if (!gorgonops) throw new Error(`Target Gorgonops (ID ${GORGONOPS_ID}) not found in database!`);

  await prisma.species.update({
    where: { id: GORGONOPS_ID },
    data: {
      media: JSON.stringify(GORGONOPS_PALEOART)
    }
  });
  console.log(`  ✓ Updated ID ${GORGONOPS_ID} (${gorgonops.name}): replaced black silhouette with Dmitry Bogdanov full life restoration (Gorgonops_torvus.jpg)`);

  // 2B: Lystrosaurus murrayi (ID 1653)
  const lystrosaurus = allBefore.find(s => s.id === LYSTROSAURUS_ID);
  if (!lystrosaurus) throw new Error(`Target Lystrosaurus (ID ${LYSTROSAURUS_ID}) not found in database!`);

  await prisma.species.update({
    where: { id: LYSTROSAURUS_ID },
    data: {
      media: JSON.stringify(LYSTROSAURUS_PALEOART)
    }
  });
  console.log(`  ✓ Updated ID ${LYSTROSAURUS_ID} (${lystrosaurus.name}): replaced relationship diagram with Nobu Tamura life reconstruction (Lystrosaurus_BW.jpg)\n`);

  // STEP 3: Post-migration snapshot & anti-regression verification
  console.log('Step 3: Capturing post-migration snapshot and verifying anti-regression invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, `post_fix_gorgonops_lystro_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== allBefore.length) {
    throw new Error(`CRITICAL: Species count mismatch! Expected: ${allBefore.length}, Got: ${allAfter.length}`);
  }

  const targetIds = new Set([GORGONOPS_ID, LYSTROSAURUS_ID]);
  let nonTargetUntouched = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    if (targetIds.has(before.id)) {
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt' || key === 'media') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          unexpectedDiffs.push(`Target species ID ${before.id} had unexpected modification in '${key}'!`);
        }
      }
      continue;
    }

    let isIdentical = true;
    for (const key of Object.keys(before)) {
      if (key === 'updatedAt') continue;
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        isIdentical = false;
        unexpectedDiffs.push(`Non-target species ID ${before.id} (${before.name}) was modified in '${key}'!`);
      }
    }
    if (isIdentical) {
      nonTargetUntouched++;
    }
  }

  if (unexpectedDiffs.length > 0) {
    console.error('CRITICAL SAFEGUARD FAILURES:');
    unexpectedDiffs.forEach(d => console.error('  - ' + d));
    throw new Error('Anti-regression verification failed!');
  }

  const expectedUntouched = allBefore.length - targetIds.size;
  console.log(`  ✓ Verified: 100% of non-target species (${nonTargetUntouched}/${expectedUntouched}) remain completely untouched!`);
  console.log(`  ✓ Verified: Both target species updated cleanly with zero regressions.`);
  console.log(`  ✓ Total cataloged specimens in database: ${allAfter.length}\n`);

  // STEP 4: Synchronize Static JSON Archives
  console.log('Step 4: Synchronizing static JSON archives...');
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
  console.log('✅ GORGONOPS & LYSTROSAURUS MURRAYI PALEOART MIGRATION COMPLETED SAFELY');
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
