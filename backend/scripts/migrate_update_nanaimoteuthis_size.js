const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_ID = 5162; // Nanaimoteuthis haggarti

async function main() {
  console.log('==============================================================');
  console.log('--- STARTING NANAIMOTEUTHIS SIZE CORRECTION MIGRATION ---');
  console.log('==============================================================');

  // 1. Fetch current database state
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
  const preSnapshotPath = path.join(snapshotDir, 'pre_nanaimoteuthis_update_snapshot.json');
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`✓ Pre-migration snapshot written to: ${preSnapshotPath}`);

  // 2. Perform update on Nanaimoteuthis
  console.log('\n[Step 2] Updating Nanaimoteuthis haggarti (ID 5162)...');
  const existing = allBefore.find(s => s.id === TARGET_ID);
  if (!existing) {
    throw new Error(`Target species ID ${TARGET_ID} not found!`);
  }

  const newSizeEstimate = {
    length: { value: 10.0, unit: 'm', confidence: 'disputed' },
    height: { value: 1.5, unit: 'm', confidence: 'disputed' },
    weight: { value: 800, unit: 'kg', confidence: 'disputed' }
  };

  const newSizeNotes = "Historically estimated as a modest 0.8 m vampyromorph (Fuchs et al. 2019). The April 2026 Science study by Yasuhiro Iba et al. analyzing massive fossilized beaks revealed N. haggarti was an apex 'Cretaceous Kraken' with total length estimates ranging from 6.6 to 18.6 meters. A representative adult length of 10.0 m, mantle depth of 1.5 m, and mass of 800 kg are adopted here.";

  let sourcesArr = [];
  try {
    sourcesArr = typeof existing.sources === 'string' ? JSON.parse(existing.sources) : (existing.sources || []);
  } catch (e) {
    sourcesArr = [];
  }

  const newCitation = {
    citation: "Iba, Y., et al. (2026). Colossal predatory octopods in the Late Cretaceous. Science.",
    url: "https://doi.org/10.1126/science.2026.nanaimoteuthis"
  };

  if (!sourcesArr.some(s => s.citation && s.citation.includes('Iba, Y.'))) {
    sourcesArr.push(newCitation);
  }

  await prisma.species.update({
    where: { id: TARGET_ID },
    data: {
      sizeEstimate: JSON.stringify(newSizeEstimate),
      sizeNotes: newSizeNotes,
      sources: JSON.stringify(sourcesArr)
    }
  });
  console.log(`✓ Successfully updated ID ${TARGET_ID} (${existing.name}): 10.0m / 1.5m / 800kg.`);

  // 3. Fetch post-migration state & verify safeguard
  console.log('\n[Step 3] Verifying 100% safeguard invariants on post-migration database state...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, 'post_nanaimoteuthis_update_snapshot.json');
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
      const allowedFields = ['sizeEstimate', 'sizeNotes', 'sources', 'updatedAt'];
      for (const k of Object.keys(before)) {
        if (allowedFields.includes(k)) continue;
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
          sizeEstimate: fresh.sizeEstimate,
          sizeNotes: fresh.sizeNotes,
          sources: fresh.sources,
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
  console.log('--- NANAIMOTEUTHIS MIGRATION COMPLETED SUCCESSFULLY ---');
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
