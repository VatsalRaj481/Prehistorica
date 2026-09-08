const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_ID = 5189;

const NEW_SILHOUETTE = JSON.stringify({
  url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/95a73c63-e7c7-4e81-8e6d-592f647b07bc.svg',
  sourceUrl: 'https://www.phylopic.org/images/95a73c63-e7c7-4e81-8e6d-592f647b07bc',
  license: 'CC0 1.0 Universal Public Domain Dedication',
  credit: 'Craig Dylke',
  taxon: 'Squalodontidae (Representative: Squalodon)',
  taxonMatch: 'generic approximation, not species-specific'
});

async function main() {
  console.log('--- STARTING ANKYLORHIZA SILHOUETTE CALIBRATION MIGRATION ---');

  // 1. Fetch current database records
  console.log('Step 1: Fetching all species from database...');
  const allBefore = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`Retrieved ${allBefore.length} species records.`);

  if (allBefore.length !== 559) {
    throw new Error(`Expected 559 records, found ${allBefore.length}. Aborting!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'prisma', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const preSnapshotPath = path.join(snapshotDir, 'pre_ankylorhiza_silhouette_snapshot.json');
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`Pre-migration snapshot written to: ${preSnapshotPath}`);

  // 2. Update Ankylorhiza silhouette
  console.log('\nStep 2: Updating Ankylorhiza tiedemani (ID 5189) silhouette...');
  const existing = allBefore.find(s => s.id === TARGET_ID);
  if (!existing) {
    throw new Error(`Ankylorhiza tiedemani (ID ${TARGET_ID}) not found in database!`);
  }

  await prisma.species.update({
    where: { id: TARGET_ID },
    data: {
      comparisonSilhouette: NEW_SILHOUETTE
    }
  });
  console.log('  ✓ Updated comparisonSilhouette in database');

  // 3. Fetch post-migration state & verify 100% safeguard
  console.log('\nStep 3: Verifying 100% non-target safeguard invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, 'post_ankylorhiza_silhouette_snapshot.json');
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`Post-migration snapshot written to: ${postSnapshotPath}`);

  if (allAfter.length !== 559) {
    throw new Error(`Expected 559 records, found ${allAfter.length}!`);
  }

  let untouchedCount = 0;
  let targetUpdateCount = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    if (before.id === TARGET_ID) {
      const diffFields = [];
      for (const k of Object.keys(before)) {
        if (k === 'updatedAt' || k === 'comparisonSilhouette') continue;
        if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
          diffFields.push(k);
        }
      }
      if (diffFields.length > 0) {
        unexpectedDiffs.push(`Target ID ${before.id} had unexpected diffs in: ${diffFields.join(', ')}`);
      } else {
        targetUpdateCount++;
      }
    } else {
      const diffFields = [];
      for (const k of Object.keys(before)) {
        if (k === 'updatedAt') continue;
        if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
          diffFields.push(k);
        }
      }
      if (diffFields.length > 0) {
        unexpectedDiffs.push(`NON-TARGET ID ${before.id} (${before.name}) was modified! Fields: ${diffFields.join(', ')}`);
      } else {
        untouchedCount++;
      }
    }
  }

  console.log(`\nVerification Results:`);
  console.log(`- Target species safely updated: ${targetUpdateCount} / 1 (ID 5189, Ankylorhiza)`);
  console.log(`- Non-target species bit-for-bit identical: ${untouchedCount} / 558 (100.0%)`);

  if (unexpectedDiffs.length > 0) {
    console.error('CRITICAL ERROR: Regressions detected:');
    unexpectedDiffs.forEach(d => console.error('  ✕ ' + d));
    throw new Error('Safeguard check failed!');
  }

  // 4. Synchronize static JSON archives
  console.log('\nStep 4: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // Full export
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
  const updatedFullExport = fullExport.map(item => {
    if (item.id === TARGET_ID) {
      return { ...item, comparisonSilhouette: NEW_SILHOUETTE };
    }
    return item;
  });
  fs.writeFileSync(fullExportPath, JSON.stringify(updatedFullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json`);

  // Others archive (Cenozoic / Oligocene)
  const othersPath = path.join(prismaDir, 'species_others.json');
  const othersJson = JSON.parse(fs.readFileSync(othersPath, 'utf8'));
  const updatedOthers = othersJson.map(item => {
    if (item.id === TARGET_ID) {
      return { ...item, comparisonSilhouette: NEW_SILHOUETTE };
    }
    return item;
  });
  fs.writeFileSync(othersPath, JSON.stringify(updatedOthers, null, 2), 'utf8');
  console.log(`  ✓ Updated species_others.json`);

  console.log('\n--- ANKYLORHIZA SILHOUETTE CALIBRATION COMPLETE SUCCESSFULLY ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma['$disconnect']();
  });
