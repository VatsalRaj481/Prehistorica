const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_ID = 9; // Dimetrodon grandis
const NEW_PALEOART = {
  url: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Dimetrodon_TD.png',
  type: 'art',
  credit: 'TotalDino (CC BY 4.0)',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dimetrodon_TD.png'
};

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA SAFEGUARD MIGRATION: UPDATE DIMETRODON PALEOART (TOTALDINO)');
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
  const preSnapshotPath = path.join(snapshotDir, `pre_update_dimetrodon_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Execute audited update for Dimetrodon (ID 9)
  console.log(`Step 2: Executing audited media update for Dimetrodon (ID: ${TARGET_ID})...`);
  const target = allBefore.find(s => s.id === TARGET_ID);
  if (!target) {
    throw new Error(`Target species ID ${TARGET_ID} not found in database!`);
  }

  let mediaArr = [];
  try {
    mediaArr = typeof target.media === 'string' ? JSON.parse(target.media) : (target.media || []);
  } catch {
    mediaArr = [];
  }

  const oldArt = mediaArr.filter(m => m.type === 'art').map(m => ({
    ...m,
    type: 'fossil_specimen',
    credit: m.credit ? `${m.credit} (Historical plate)` : 'Historical restoration'
  }));
  const nonArt = mediaArr.filter(m => m.type !== 'art');
  const updatedMedia = [NEW_PALEOART, ...nonArt, ...oldArt];

  await prisma.species.update({
    where: { id: TARGET_ID },
    data: { media: JSON.stringify(updatedMedia) }
  });
  console.log(`  ✓ Updated ID ${TARGET_ID} : ${target.name} -> Dimetrodon_TD.png\n`);

  // STEP 3: Post-migration snapshot & verification
  console.log('Step 3: Capturing post-migration snapshot and verifying anti-regression invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, `post_update_dimetrodon_${timestamp}.json`);
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

    if (before.id === TARGET_ID) {
      // Check that only media and updatedAt changed
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt' || key === 'media') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          unexpectedDiffs.push(`Target ID ${before.id} had unexpected modification in field '${key}'`);
        }
      }
    } else {
      // Must be 100% bit-for-bit identical
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

  const expectedUntouched = allBefore.length - 1;
  console.log(`  ✓ Verified: 100% of non-target species (${nonTargetUntouched}/${expectedUntouched}) remain completely untouched!`);
  console.log(`  ✓ Verified: Target species ID ${TARGET_ID} updated its media cleanly.`);
  console.log(`  ✓ Total cataloged specimens in database: ${allAfter.length}\n`);

  // STEP 4: Synchronize Static JSON Archives
  console.log('Step 4: Synchronizing static JSON archives...');
  const fullExportPath = path.join(__dirname, '..', 'prisma', 'species_full_export.json');
  fs.writeFileSync(fullExportPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Synced master export (${allAfter.length} species): ${fullExportPath}`);

  const othersSpecies = allAfter.filter(s => {
    const tp = (s.timePeriod || '').toLowerCase();
    return !tp.includes('jurassic') && !tp.includes('cretaceous') && !tp.includes('triassic');
  });

  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_others.json'), JSON.stringify(othersSpecies, null, 2), 'utf8');
  console.log(`  ✓ Synchronized species_others.json (${othersSpecies.length} species)\n`);

  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('✅ DIMETRODON MEDIA UPDATE COMPLETE & VERIFIED WITH ZERO REGRESSION');
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
