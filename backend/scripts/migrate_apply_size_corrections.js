const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CORRECTIONS_PATH = 'C:/Users/vatsa/.gemini/antigravity/brain/c5a61304-cebb-4fc5-8cf4-da58d96e30d3/scratch/all_559_size_corrections.json';

async function main() {
  console.log('==============================================================');
  console.log('--- STARTING PREHISTORICA 559-SPECIES SIZE MIGRATION ---');
  console.log('==============================================================');

  // 1. Fetch current database state
  console.log('\n[Step 1] Fetching current species state from database...');
  const allBefore = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`Retrieved ${allBefore.length} species records.`);

  if (allBefore.length !== 559) {
    throw new Error(`Expected 559 records in database, found ${allBefore.length}. Aborting!`);
  }

  // Save Pre-migration Snapshot
  const snapshotDir = path.join(__dirname, '..', 'prisma', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const preSnapshotPath = path.join(snapshotDir, 'pre_size_audit_corrections_snapshot.json');
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`✓ Pre-migration snapshot written to: ${preSnapshotPath}`);

  // 2. Load and validate corrections file
  console.log('\n[Step 2] Loading and verifying audited corrections dataset...');
  if (!fs.existsSync(CORRECTIONS_PATH)) {
    throw new Error(`Corrections file not found at: ${CORRECTIONS_PATH}`);
  }
  const corrections = JSON.parse(fs.readFileSync(CORRECTIONS_PATH, 'utf8'));
  console.log(`Loaded ${corrections.length} audited corrections.`);

  if (corrections.length !== 559) {
    throw new Error(`Expected 559 corrections, but got ${corrections.length}!`);
  }

  const correctionsMap = new Map();
  for (const c of corrections) {
    if (correctionsMap.has(c.id)) {
      throw new Error(`Duplicate correction ID in dataset: ${c.id}`);
    }
    if (typeof c.length !== 'number' || isNaN(c.length) || c.length <= 0) {
      throw new Error(`Invalid length for ID ${c.id} (${c.name}): ${c.length}`);
    }
    if (typeof c.height !== 'number' || isNaN(c.height) || c.height <= 0) {
      throw new Error(`Invalid height for ID ${c.id} (${c.name}): ${c.height}`);
    }
    if (typeof c.weight !== 'number' || isNaN(c.weight) || c.weight <= 0) {
      throw new Error(`Invalid weight for ID ${c.id} (${c.name}): ${c.weight}`);
    }
    correctionsMap.set(c.id, c);
  }
  console.log('✓ All 559 audited corrections validated: 100% single positive numeric values.');

  // 3. Perform database updates
  console.log('\n[Step 3] Applying audited size corrections to database...');
  let updatedCount = 0;

  for (const before of allBefore) {
    const c = correctionsMap.get(before.id);
    if (!c) {
      throw new Error(`Missing correction for species ID ${before.id} (${before.name})!`);
    }

    const newSizeEstimateObj = {
      length: {
        value: c.length,
        unit: 'm',
        confidence: c.confidence || 'well-supported'
      },
      height: {
        value: c.height,
        unit: 'm',
        confidence: c.confidence || 'well-supported'
      },
      weight: {
        value: c.weight,
        unit: 'kg',
        confidence: c.confidence || 'well-supported'
      }
    };
    const newSizeEstimateStr = JSON.stringify(newSizeEstimateObj);

    let newSizeNotes = before.sizeNotes;
    if (c.notes) {
      const lowerNotes = c.notes.toLowerCase();
      if (lowerNotes.includes('wingspan') || lowerNotes.includes('disputed') || lowerNotes.includes('subadult') || lowerNotes.includes('holotype')) {
        if (!before.sizeNotes.includes(c.notes)) {
          newSizeNotes = before.sizeNotes ? `${before.sizeNotes} Note: ${c.notes}` : c.notes;
        }
      }
    }

    await prisma.species.update({
      where: { id: before.id },
      data: {
        sizeEstimate: newSizeEstimateStr,
        sizeNotes: newSizeNotes
      }
    });

    updatedCount++;
    if (updatedCount % 50 === 0 || updatedCount === 559) {
      console.log(`  Updated ${updatedCount} / 559 species...`);
    }
  }

  console.log(`✓ All ${updatedCount} species successfully updated in database.`);

  // 4. Fetch post-migration state & verify safeguard
  console.log('\n[Step 4] Verifying 100% safeguard invariants on post-migration database state...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, 'post_size_audit_corrections_snapshot.json');
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`✓ Post-migration snapshot written to: ${postSnapshotPath}`);

  if (allAfter.length !== 559) {
    throw new Error(`CRITICAL: Post-migration record count mismatch: ${allAfter.length} vs 559!`);
  }

  const unexpectedDiffs = [];
  let rangeFormatCount = 0;

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted from database!`);
      continue;
    }

    const nonTargetFields = [
      'name', 'scientificName', 'nameMeaning', 'timePeriod', 'epoch',
      'myaStart', 'myaEnd', 'diet', 'dietDetails', 'habitat', 'clade',
      'geographicRange', 'taxonomy', 'taxonomicStatus', 'media',
      'discoveryHistory', 'interestingFacts', 'sizeComparisonToHuman',
      'comparisonSilhouette', 'extinctionEvent', 'closestLivingRelatives',
      'sources', 'placeholder'
    ];

    for (const f of nonTargetFields) {
      const bVal = JSON.stringify(before[f]);
      const aVal = JSON.stringify(after[f]);
      if (bVal !== aVal) {
        unexpectedDiffs.push(`ID ${before.id} (${before.name}): Field '${f}' was unexpectedly modified!`);
      }
    }

    try {
      const parsedSize = typeof after.sizeEstimate === 'string' ? JSON.parse(after.sizeEstimate) : after.sizeEstimate;
      if (!parsedSize || !parsedSize.length || !parsedSize.height || !parsedSize.weight) {
        unexpectedDiffs.push(`ID ${before.id}: Missing size properties!`);
      } else {
        if (typeof parsedSize.length.value !== 'number' || typeof parsedSize.height.value !== 'number' || typeof parsedSize.weight.value !== 'number') {
          rangeFormatCount++;
          unexpectedDiffs.push(`ID ${before.id}: Non-numeric value in sizeEstimate!`);
        }
      }
    } catch (err) {
      unexpectedDiffs.push(`ID ${before.id}: sizeEstimate is invalid JSON (${err.message})`);
    }
  }

  if (unexpectedDiffs.length > 0) {
    console.error('\nCRITICAL ERROR: Safeguard check detected regressions:');
    unexpectedDiffs.slice(0, 20).forEach(d => console.error('  ✕ ' + d));
    throw new Error(`Safeguard verification failed with ${unexpectedDiffs.length} issues!`);
  }

  console.log('✓ Safeguard Verification Passed:');
  console.log(`  - 100% of non-target columns (media, licenses, taxonomy, facts, etc.) remain bit-for-bit identical.`);
  console.log(`  - 0 range strings detected across all 559 species.`);
  console.log(`  - 100% of length, height, and weight fields resolve to verified single numeric values.`);

  // 5. Synchronize static JSON archives
  console.log('\n[Step 5] Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  function syncArchive(fileName) {
    const filePath = path.join(prismaDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠ Warning: Archive ${fileName} not found.`);
      return;
    }
    const archiveJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const updatedArchive = archiveJson.map(item => {
      const fresh = allAfter.find(s => s.id === item.id);
      if (fresh) {
        return {
          ...item,
          sizeEstimate: fresh.sizeEstimate,
          sizeNotes: fresh.sizeNotes,
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
  console.log('--- 559-SPECIES SIZE MIGRATION COMPLETED SUCCESSFULLY ---');
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
