const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_ID = 31;
const TARGET_NAME = 'Pteranodon longiceps';
const NEW_PALEOART = {
  url: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Pteranodon_TD.png',
  type: 'art',
  credit: 'TotalDino (CC BY 4.0)',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pteranodon_TD.png'
};

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA SAFEGUARD MIGRATION: UPDATE PTERANODON PALEOART MEDIA');
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

  const preSnapshotPath = path.join(snapshotDir, 'pre_update_pteranodon_snapshot.json');
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Update target species
  console.log(`Step 2: Updating media for target species ID ${TARGET_ID} (${TARGET_NAME})...`);
  const existing = allBefore.find(s => s.id === TARGET_ID);
  if (!existing) {
    throw new Error(`Target species ID ${TARGET_ID} (${TARGET_NAME}) not found in database!`);
  }

  let mediaArr = [];
  try {
    mediaArr = typeof existing.media === 'string' ? JSON.parse(existing.media) : (existing.media || []);
  } catch (e) {
    mediaArr = [];
  }

  // Preserve any non-art media (skeletal, diagram, fossil photos), replace primary art with the requested Priority 1 colored life restoration
  const nonArt = mediaArr.filter(m => m.type !== 'art');
  const updatedMedia = [NEW_PALEOART, ...nonArt];
  const newMediaStr = JSON.stringify(updatedMedia);

  await prisma.species.update({
    where: { id: TARGET_ID },
    data: { media: newMediaStr }
  });
  console.log(`  ✓ Successfully updated media for ID ${TARGET_ID} in database.\n`);

  // STEP 3: Post-migration snapshot & verification
  console.log('Step 3: Capturing post-migration snapshot and verifying anti-regression invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, 'post_update_pteranodon_snapshot.json');
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== allBefore.length) {
    throw new Error(`CRITICAL: Species count changed! Before: ${allBefore.length}, After: ${allAfter.length}`);
  }

  let nonTargetUntouched = 0;
  let targetCorrectlyUpdated = false;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    if (before.id === TARGET_ID) {
      const diffs = [];
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt' || key === 'media') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          diffs.push(key);
        }
      }
      if (diffs.length > 0) {
        unexpectedDiffs.push(`Target ID ${before.id} had unexpected field changes: ${diffs.join(', ')}`);
      } else {
        targetCorrectlyUpdated = true;
      }
    } else {
      // Non-target must be 100% bit-for-bit identical
      const diffs = [];
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          diffs.push(key);
        }
      }
      if (diffs.length > 0) {
        unexpectedDiffs.push(`NON-TARGET ID ${before.id} (${before.name}) was modified! Fields: ${diffs.join(', ')}`);
      } else {
        nonTargetUntouched++;
      }
    }
  }

  const expectedNonTargets = allBefore.length - 1;
  console.log(`\nVerification Summary:`);
  console.log(`  - Target species updated: ${targetCorrectlyUpdated ? 'YES' : 'NO'} (ID: ${TARGET_ID})`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetUntouched} / ${expectedNonTargets} (${((nonTargetUntouched / expectedNonTargets) * 100).toFixed(1)}%)`);

  if (unexpectedDiffs.length > 0 || !targetCorrectlyUpdated || nonTargetUntouched !== expectedNonTargets) {
    console.error('\n❌ CRITICAL: Regressions detected:');
    unexpectedDiffs.forEach(d => console.error('    ✕ ' + d));
    throw new Error('Anti-regression safeguard invariant violated! Aborting.');
  }
  console.log(`  ✅ 100% SAFEGUARD VERIFIED: Zero regressions across all ${expectedNonTargets} non-target records.\n`);

  // STEP 4: Synchronize static JSON archives
  console.log('Step 4: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // 1. species_cretaceous.json
  const cretPath = path.join(prismaDir, 'species_cretaceous.json');
  if (fs.existsSync(cretPath)) {
    const cretJson = JSON.parse(fs.readFileSync(cretPath, 'utf8'));
    const updatedCret = cretJson.map(item => {
      if (item.id === TARGET_ID) {
        return { ...item, media: newMediaStr, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    fs.writeFileSync(cretPath, JSON.stringify(updatedCret, null, 2), 'utf8');
    console.log(`  ✓ Updated species_cretaceous.json (${updatedCret.length} total records)`);
  }

  // 2. species_full_export.json
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  if (fs.existsSync(fullExportPath)) {
    const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
    const updatedFull = fullExport.map(item => {
      if (item.id === TARGET_ID) {
        return { ...item, media: newMediaStr, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    fs.writeFileSync(fullExportPath, JSON.stringify(updatedFull, null, 2), 'utf8');
    console.log(`  ✓ Updated species_full_export.json (${updatedFull.length} total records)`);
  }

  // 3. species.json (if present)
  const masterPath = path.join(prismaDir, 'species.json');
  if (fs.existsSync(masterPath)) {
    const masterJson = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
    const updatedMaster = masterJson.map(item => {
      if (item.id === TARGET_ID) {
        return { ...item, media: newMediaStr, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    fs.writeFileSync(masterPath, JSON.stringify(updatedMaster, null, 2), 'utf8');
    console.log(`  ✓ Updated species.json (${updatedMaster.length} total records)`);
  }

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ PTERANODON PALEOART MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('════════════════════════════════════════════════════════════════════════════\n');
}

main()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
