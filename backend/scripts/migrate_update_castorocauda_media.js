const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_ID = 239; // Castorocauda lutrasimilis

async function main() {
  console.log('==============================================================');
  console.log('--- STARTING CASTOROCAUDA MEDIA MIGRATION ---');
  console.log('==============================================================');

  // 1. Fetch current database records
  console.log('\n[Step 1] Fetching all species from database...');
  const allBefore = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`Retrieved ${allBefore.length} species records.`);

  if (allBefore.length !== 559) {
    throw new Error(`Expected 559 records in database, found ${allBefore.length}. Aborting!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'prisma', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const preSnapshotPath = path.join(snapshotDir, 'pre_castorocauda_media_snapshot.json');
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`✓ Pre-migration snapshot written to: ${preSnapshotPath}`);

  // 2. Update Castorocauda media
  console.log('\n[Step 2] Updating Castorocauda (ID 239) media...');
  const existing = allBefore.find(s => s.id === TARGET_ID);
  if (!existing) {
    throw new Error(`Target species ID ${TARGET_ID} not found!`);
  }

  const newMedia = [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Castorocauda_lutrasimilis.jpg',
      type: 'art',
      credit: 'Nobu Tamura (CC BY 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Castorocauda_lutrasimilis.jpg'
    }
  ];

  await prisma.species.update({
    where: { id: TARGET_ID },
    data: {
      media: JSON.stringify(newMedia),
      placeholder: false
    }
  });
  console.log(`✓ Successfully updated Castorocauda media (single image set, count: 1).`);

  // 3. Fetch post-migration state & verify safeguard
  console.log('\n[Step 3] Verifying 100% safeguard invariants on post-migration database state...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, 'post_castorocauda_media_snapshot.json');
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`✓ Post-migration snapshot written to: ${postSnapshotPath}`);

  if (allAfter.length !== 559) {
    throw new Error(`CRITICAL: Post-migration record count mismatch: ${allAfter.length} vs 559!`);
  }

  let untouchedCount = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted from database!`);
      continue;
    }

    if (before.id === TARGET_ID) {
      const allowed = ['media', 'placeholder', 'updatedAt'];
      for (const k of Object.keys(before)) {
        if (allowed.includes(k)) continue;
        if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
          unexpectedDiffs.push(`Target ID ${before.id} had unexpected change in field '${k}'!`);
        }
      }
    } else {
      for (const k of Object.keys(before)) {
        if (k === 'updatedAt') continue;
        if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
          unexpectedDiffs.push(`NON-TARGET ID ${before.id} (${before.name}) was modified in field '${k}'!`);
        }
      }
      untouchedCount++;
    }
  }

  if (unexpectedDiffs.length > 0) {
    console.error('\nCRITICAL ERROR: Safeguard check detected regressions:');
    unexpectedDiffs.forEach(d => console.error('  ✕ ' + d));
    throw new Error(`Safeguard verification failed with ${unexpectedDiffs.length} issues!`);
  }

  console.log('✓ Safeguard Verification Passed:');
  console.log(`  - Target species (ID ${TARGET_ID}) updated safely with 0 unwanted mutations.`);
  console.log(`  - Non-target species bit-for-bit identical: ${untouchedCount} / 558 (100.0%).`);

  // 4. Synchronize static JSON archives
  console.log('\n[Step 4] Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  function syncArchive(fileName) {
    const filePath = path.join(prismaDir, fileName);
    if (!fs.existsSync(filePath)) return;
    const archiveJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const updatedArchive = archiveJson.map(item => {
      if (item.id === TARGET_ID) {
        const fresh = allAfter.find(s => s.id === TARGET_ID);
        return {
          ...item,
          media: fresh.media,
          placeholder: fresh.placeholder,
          updatedAt: fresh.updatedAt
        };
      }
      return item;
    });
    fs.writeFileSync(filePath, JSON.stringify(updatedArchive, null, 2), 'utf8');
    console.log(`  ✓ Synchronized ${fileName} (${updatedArchive.length} records)`);
  }

  syncArchive('species_full_export.json');
  syncArchive('species_jurassic.json');
  syncArchive('species_cretaceous.json');
  syncArchive('species_triassic.json');
  syncArchive('species_others.json');

  console.log('\n==============================================================');
  console.log('--- CASTOROCAUDA MEDIA MIGRATION COMPLETED SUCCESSFULLY ---');
  console.log('==============================================================');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma['$disconnect']();
  });
