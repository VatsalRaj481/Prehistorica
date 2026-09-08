const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_IDS = [884, 923, 924];

async function main() {
  console.log('--- STARTING PLACEHOLDER REMOVAL MIGRATION ---');

  // 1. Fetch current database state
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
  const preSnapshotPath = path.join(snapshotDir, 'pre_remove_placeholders_snapshot.json');
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`Pre-migration snapshot written to: ${preSnapshotPath}`);

  // 2. Perform updates on the 3 targets
  console.log('\nStep 2: Removing placeholders from 3 target species...');
  for (const id of TARGET_IDS) {
    const existing = allBefore.find(s => s.id === id);
    if (!existing) {
      throw new Error(`Target species ID ${id} not found in database!`);
    }

    let media = [];
    try {
      media = typeof existing.media === 'string' ? JSON.parse(existing.media) : (existing.media || []);
    } catch (e) {
      media = [];
    }

    // Filter out old placeholder images
    const updatedMedia = media.filter(m => {
      const url = m.url || '';
      return !url.includes('884-Indosuchus.png') &&
             !url.includes('923-Sivatherium.jpg') &&
             !url.includes('924-Stegodon_ganesa.jpg') &&
             !url.includes('/images/placeholders/');
    });

    await prisma.species.update({
      where: { id },
      data: {
        media: JSON.stringify(updatedMedia),
        placeholder: false
      }
    });

    console.log(`  ✓ Pruned placeholder for ID ${id} (${existing.name}), new media count: ${updatedMedia.length}`);
  }

  // 3. Fetch post-migration state & verify 100% safeguard
  console.log('\nStep 3: Verifying 100% non-target safeguard invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, 'post_remove_placeholders_snapshot.json');
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

    if (TARGET_IDS.includes(before.id)) {
      const diffFields = [];
      for (const k of Object.keys(before)) {
        if (k === 'updatedAt' || k === 'media' || k === 'placeholder') continue;
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
  console.log(`- Target species safely updated: ${targetUpdateCount} / 3`);
  console.log(`- Non-target species bit-for-bit identical: ${untouchedCount} / 556 (100.0%)`);

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
    if (TARGET_IDS.includes(item.id)) {
      const fresh = allAfter.find(s => s.id === item.id);
      return { ...item, media: fresh.media, placeholder: false };
    }
    return item;
  });
  fs.writeFileSync(fullExportPath, JSON.stringify(updatedFullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json (${updatedFullExport.length} records)`);

  // Cretaceous archive (Indosuchus ID 884)
  const cretPath = path.join(prismaDir, 'species_cretaceous.json');
  const cretJson = JSON.parse(fs.readFileSync(cretPath, 'utf8'));
  const updatedCret = cretJson.map(item => {
    if (item.id === 884) {
      const fresh = allAfter.find(s => s.id === 884);
      return { ...item, media: fresh.media, placeholder: false };
    }
    return item;
  });
  fs.writeFileSync(cretPath, JSON.stringify(updatedCret, null, 2), 'utf8');
  console.log(`  ✓ Updated species_cretaceous.json (${updatedCret.length} records)`);

  // Others archive (Sivatherium ID 923, Stegodon ID 924)
  const othersPath = path.join(prismaDir, 'species_others.json');
  const othersJson = JSON.parse(fs.readFileSync(othersPath, 'utf8'));
  const updatedOthers = othersJson.map(item => {
    if (item.id === 923 || item.id === 924) {
      const fresh = allAfter.find(s => s.id === item.id);
      return { ...item, media: fresh.media, placeholder: false };
    }
    return item;
  });
  fs.writeFileSync(othersPath, JSON.stringify(updatedOthers, null, 2), 'utf8');
  console.log(`  ✓ Updated species_others.json (${othersJson.length} records)`);

  console.log('\n--- PLACEHOLDER REMOVAL COMPLETE SUCCESSFULLY ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma['$disconnect']();
  });
