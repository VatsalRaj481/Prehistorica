const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_ID = 495;
const NEW_SILHOUETTE_PAYLOAD = JSON.stringify({
  url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/9dc23409-1e36-402d-8be5-6b939f7fb664.svg',
  sourceUrl: 'https://www.phylopic.org/images/9dc23409-1e36-402d-8be5-6b939f7fb664',
  license: 'Creative Commons Attribution-ShareAlike 3.0 Unported',
  credit: 'Emily Willoughby',
  taxon: 'Nodosauridae (Representative: Sauropelta edwardsorum)',
  taxonMatch: 'generic approximation, not species-specific'
});

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('AUDITED MIGRATION: FIX EDMONTONIA (ID 495) SCALE COMPARISON SILHOUETTE');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration snapshot
  console.log('Step 1: Capturing pre-migration database snapshot...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Current database records: ${allBefore.length}`);

  if (allBefore.length !== 589) {
    throw new Error(`Expected exactly 589 species in database, found ${allBefore.length}!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preSnapshotPath = path.join(snapshotDir, `pre_fix_edmontonia_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Update Edmontonia silhouette
  console.log('Step 2: Updating comparisonSilhouette for Edmontonia (ID 495)...');
  const targetBefore = allBefore.find(s => s.id === TARGET_ID);
  if (!targetBefore) {
    throw new Error(`Edmontonia (ID ${TARGET_ID}) not found in database!`);
  }

  await prisma.species.update({
    where: { id: TARGET_ID },
    data: {
      comparisonSilhouette: NEW_SILHOUETTE_PAYLOAD
    }
  });
  console.log('  ✓ Database row updated for Edmontonia (ID 495).\n');

  // STEP 3: Post-migration snapshot & 100% regression verification
  console.log('Step 3: Capturing post-migration snapshot and validating invariants...');
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const postSnapshotPath = path.join(snapshotDir, `post_fix_edmontonia_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== 589) {
    throw new Error(`Expected 589 species after update, found ${allAfter.length}!`);
  }

  let nonTargetIdentical = 0;
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
        if (key === 'updatedAt' || key === 'comparisonSilhouette') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          diffs.push(key);
        }
      }
      if (diffs.length > 0) {
        unexpectedDiffs.push(`Target ID ${before.id} had unexpected field changes: ${diffs.join(', ')}`);
      } else if (after.comparisonSilhouette === NEW_SILHOUETTE_PAYLOAD) {
        targetCorrectlyUpdated = true;
      }
    } else {
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
        nonTargetIdentical++;
      }
    }
  }

  console.log(`\nVerification Summary:`);
  console.log(`  - Target species correctly updated: ${targetCorrectlyUpdated ? 'YES' : 'NO'}`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetIdentical} / 588 (100.0%)`);

  if (unexpectedDiffs.length > 0 || !targetCorrectlyUpdated) {
    console.error('\n❌ CRITICAL: Invariant violation:');
    unexpectedDiffs.forEach(d => console.error('    ✕ ' + d));
    throw new Error('Anti-regression safeguard invariant violated! Aborting.');
  }
  console.log('  ✅ 100% SAFEGUARD VERIFIED: Zero regressions detected across all non-target records.\n');

  // STEP 4: Synchronize Static JSON Archives
  console.log('Step 4: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // 1. species_full_export.json
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
  const updatedFullExport = fullExport.map(item => {
    if (item.id === TARGET_ID) {
      return { ...item, comparisonSilhouette: NEW_SILHOUETTE_PAYLOAD };
    }
    return item;
  });
  fs.writeFileSync(fullExportPath, JSON.stringify(updatedFullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json (ID ${TARGET_ID} updated)`);

  // 2. species_cretaceous.json
  const cretPath = path.join(prismaDir, 'species_cretaceous.json');
  const cretJson = JSON.parse(fs.readFileSync(cretPath, 'utf8'));
  const updatedCretJson = cretJson.map(item => {
    if (item.id === TARGET_ID) {
      return { ...item, comparisonSilhouette: NEW_SILHOUETTE_PAYLOAD };
    }
    return item;
  });
  fs.writeFileSync(cretPath, JSON.stringify(updatedCretJson, null, 2), 'utf8');
  console.log(`  ✓ Updated species_cretaceous.json (ID ${TARGET_ID} updated)`);

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ EDMONTONIA SILHOUETTE MIGRATION COMPLETED SUCCESSFULLY!');
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
