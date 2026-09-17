const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_UPDATES = [
  {
    id: 229,
    name: 'Rhomaleosaurus',
    scientificName: 'Rhomaleosaurus cramptoni',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = typeof currentMediaStr === 'string' ? JSON.parse(currentMediaStr) : (currentMediaStr || []); } catch(e){}
      const nonArt = mediaArr.filter(m => m.type !== 'art');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Rhomaleosaurus_NT.jpg',
        type: 'art',
        credit: 'Nobu Tamura (CC BY-SA 3.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rhomaleosaurus_NT.jpg'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  },
  {
    id: 135,
    name: 'Mixosaurus',
    scientificName: 'Mixosaurus cornalianus',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = typeof currentMediaStr === 'string' ? JSON.parse(currentMediaStr) : (currentMediaStr || []); } catch(e){}
      const nonArt = mediaArr.filter(m => m.type !== 'art');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Mixosaurus_cornalianus_SW_1.png',
        type: 'art',
        credit: 'Slate Weasel (CC BY 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mixosaurus_cornalianus_SW_1.png'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  },
  {
    id: 130,
    name: 'Nothosaurus',
    scientificName: 'Nothosaurus mirabilis',
    getNewMedia: (currentMediaStr) => {
      let mediaArr = [];
      try { mediaArr = typeof currentMediaStr === 'string' ? JSON.parse(currentMediaStr) : (currentMediaStr || []); } catch(e){}
      // Replace both 'art' and 'life_reconstruction' types to ensure clean single primary restoration
      const nonArt = mediaArr.filter(m => m.type !== 'art' && m.type !== 'life_reconstruction');
      const newArt = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Nothosaurus_BW.jpg',
        type: 'art',
        credit: 'Nobu Tamura (CC BY 3.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Nothosaurus_BW.jpg'
      };
      return JSON.stringify([newArt, ...nonArt]);
    }
  }
];

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA SAFEGUARD MIGRATION: UPDATE 3 MARINE REPTILES PALEOART MEDIA');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration snapshot
  console.log('Step 1: Capturing pre-migration snapshot of all species in database...');
  const allBefore = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`  Retrieved ${allBefore.length} species records.`);

  if (allBefore.length !== 562) {
    throw new Error(`Expected exactly 562 species in database, found ${allBefore.length}. Aborting!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'prisma', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const preSnapshotPath = path.join(snapshotDir, 'pre_update_3_marine_reptiles_snapshot.json');
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Update media on 3 target species
  console.log('Step 2: Updating media for 3 target marine reptile species...');
  for (const upd of TARGET_UPDATES) {
    const existing = allBefore.find(s => s.id === upd.id);
    if (!existing) {
      throw new Error(`Target species ID ${upd.id} (${upd.name}) not found in database!`);
    }
    const newMedia = upd.getNewMedia(existing.media);
    await prisma.species.update({
      where: { id: upd.id },
      data: { media: newMedia }
    });
    console.log(`  ✓ [UPDATED ID ${upd.id}] ${upd.name} (${upd.scientificName})`);
  }
  console.log('  ✓ All 3 target species media updated.\n');

  // STEP 3: Post-migration snapshot & verification
  console.log('Step 3: Verifying post-migration state and anti-regression invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, 'post_update_3_marine_reptiles_snapshot.json');
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== 562) {
    throw new Error(`Expected exactly 562 species in database after updates, found ${allAfter.length}!`);
  }

  const targetIds = new Set(TARGET_UPDATES.map(u => u.id));
  let nonTargetUntouched = 0;
  let targetCorrectlyUpdated = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    if (targetIds.has(before.id)) {
      // Only media and updatedAt allowed to change
      const diffs = [];
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt' || key === 'media') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          diffs.push(key);
        }
      }
      if (diffs.length > 0) {
        unexpectedDiffs.push(`Target ID ${before.id} (${before.name}) had unexpected field changes: ${diffs.join(', ')}`);
      } else {
        targetCorrectlyUpdated++;
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

  console.log(`\nVerification Summary:`);
  console.log(`  - Target species updated: ${targetCorrectlyUpdated} / 3 (IDs: 229, 135, 130)`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetUntouched} / 559 (100.0%)`);

  if (unexpectedDiffs.length > 0) {
    console.error('\n❌ CRITICAL: Regressions detected:');
    unexpectedDiffs.forEach(d => console.error('    ✕ ' + d));
    throw new Error('Anti-regression safeguard invariant violated! Aborting.');
  }
  console.log('  ✅ 100% SAFEGUARD VERIFIED: Zero regressions across all 559 non-target records.\n');

  // STEP 4: Synchronize static JSON archives
  console.log('Step 4: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // 1. species_full_export.json
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
  const updatedFullExport = fullExport.map(item => {
    if (targetIds.has(item.id)) {
      const fresh = allAfter.find(s => s.id === item.id);
      return { ...item, media: fresh.media };
    }
    return item;
  });
  fs.writeFileSync(fullExportPath, JSON.stringify(updatedFullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json (${updatedFullExport.length} total records)`);

  // 2. species_jurassic.json (Rhomaleosaurus - ID 229)
  const jurPath = path.join(prismaDir, 'species_jurassic.json');
  const jurJson = JSON.parse(fs.readFileSync(jurPath, 'utf8'));
  const updatedJur = jurJson.map(item => {
    if (item.id === 229) {
      const fresh = allAfter.find(s => s.id === 229);
      return { ...item, media: fresh.media };
    }
    return item;
  });
  fs.writeFileSync(jurPath, JSON.stringify(updatedJur, null, 2), 'utf8');
  console.log(`  ✓ Updated species_jurassic.json (${updatedJur.length} total records)`);

  // 3. species_triassic.json (Mixosaurus - ID 135, Nothosaurus - ID 130)
  const triPath = path.join(prismaDir, 'species_triassic.json');
  const triJson = JSON.parse(fs.readFileSync(triPath, 'utf8'));
  const updatedTri = triJson.map(item => {
    if (item.id === 135 || item.id === 130) {
      const fresh = allAfter.find(s => s.id === item.id);
      return { ...item, media: fresh.media };
    }
    return item;
  });
  fs.writeFileSync(triPath, JSON.stringify(updatedTri, null, 2), 'utf8');
  console.log(`  ✓ Updated species_triassic.json (${updatedTri.length} total records)`);

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ ALL PALEOART UPDATES COMPLETED SUCCESSFULLY WITH ZERO REGRESSIONS!');
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
