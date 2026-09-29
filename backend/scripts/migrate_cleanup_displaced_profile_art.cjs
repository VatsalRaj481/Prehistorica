const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA SAFEGUARD MIGRATION: CLEANUP DISPLACED PROFILE ART & DUPLICATES');
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
  const preSnapshotPath = path.join(snapshotDir, `pre_cleanup_displaced_art_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Identify target species with displaced historical art or duplicate URLs
  console.log('Step 2: Identifying species with displaced historical plates or duplicate URLs...');
  const targetIds = new Set();
  const updates = [];

  for (const s of allBefore) {
    let mediaArr = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch {
      continue;
    }

    const hasHistorical = mediaArr.some(m => (m.credit || '').includes('(Historical plate)'));
    const urls = mediaArr.map(m => (m.url || '').toLowerCase());
    const hasDuplicates = new Set(urls).size !== urls.length;

    if (hasHistorical || hasDuplicates) {
      targetIds.add(s.id);

      // Remove displaced older profile images that were converted to historical plates
      let cleaned = mediaArr.filter(m => !(m.credit || '').includes('(Historical plate)'));

      // Deduplicate remaining items by URL
      const seenUrls = new Set();
      cleaned = cleaned.filter(m => {
        const u = (m.url || '').toLowerCase();
        if (seenUrls.has(u)) return false;
        seenUrls.add(u);
        return true;
      });

      if (cleaned.length === 0) {
        throw new Error(`CRITICAL: Cleanup resulted in empty media for species ID ${s.id} (${s.name})!`);
      }

      updates.push({
        id: s.id,
        name: s.name,
        oldMediaCount: mediaArr.length,
        newMediaCount: cleaned.length,
        newMedia: cleaned
      });
    }
  }

  console.log(`  Found ${updates.length} species requiring media cleanup.\n`);

  // STEP 3: Execute audited updates
  console.log(`Step 3: Executing audited media cleanup across ${updates.length} target species...`);
  for (const u of updates) {
    await prisma.species.update({
      where: { id: u.id },
      data: { media: JSON.stringify(u.newMedia) }
    });
    console.log(`  ✓ Cleaned ID ${u.id.toString().padStart(4, ' ')} : ${u.name.padEnd(30, ' ')} (${u.oldMediaCount} -> ${u.newMediaCount} media items)`);
  }
  console.log('\n  ✓ All target species media cleaned successfully.\n');

  // STEP 4: Post-migration snapshot & verification
  console.log('Step 4: Capturing post-migration snapshot and verifying anti-regression invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, `post_cleanup_displaced_art_${timestamp}.json`);
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

    if (targetIds.has(before.id)) {
      // Check that only media and updatedAt changed
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt' || key === 'media') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          unexpectedDiffs.push(`Target ID ${before.id} had unexpected modification in field '${key}'`);
        }
      }
    } else {
      // Non-target species must be 100% bit-for-bit identical
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

  const expectedUntouched = allBefore.length - targetIds.size;
  console.log(`  ✓ Verified: 100% of non-target species (${nonTargetUntouched}/${expectedUntouched}) remain completely untouched!`);
  console.log(`  ✓ Verified: All ${targetIds.size} target species cleaned cleanly.`);
  console.log(`  ✓ Total cataloged specimens in database: ${allAfter.length}\n`);

  // STEP 5: Synchronize Static JSON Archives
  console.log('Step 5: Synchronizing static JSON archives...');
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
  console.log('✅ MEDIA CLEANUP COMPLETE & VERIFIED WITH ZERO REGRESSION');
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
