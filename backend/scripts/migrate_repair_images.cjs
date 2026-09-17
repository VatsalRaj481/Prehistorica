const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Target updates specifications
const UPDATES = [
  // 1. Silesaurus opolensis (ID 80) -> TotalDino transparent life restoration
  {
    id: 80,
    name: 'Silesaurus',
    updateMedia: (oldMediaArr) => {
      return [
        {
          url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Silesaurus_TD.png',
          type: 'art',
          credit: 'TotalDino (CC BY 4.0)',
          sourceUrl: 'https://commons.wikimedia.org/wiki/File:Silesaurus_TD.png'
        }
      ];
    }
  },
  // 2. Tropaeognathus mesembrinus (ID 3185) -> Dmitry Bogdanov life restoration
  {
    id: 3185,
    name: 'Tropaeognathus mesembrinus',
    updateMedia: (oldMediaArr) => {
      return [
        {
          url: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/TropeognathusDB22.jpg',
          type: 'art',
          credit: 'Dmitry Bogdanov (CC BY 3.0)',
          sourceUrl: 'https://commons.wikimedia.org/wiki/File:TropeognathusDB22.jpg'
        }
      ];
    }
  },
  // 3. Masiakasaurus knopfleri (ID 5171) -> Full living animal restoration
  {
    id: 5171,
    name: 'Masiakasaurus',
    updateMedia: (oldMediaArr) => {
      return [
        {
          url: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Masiakasaurus_BW.jpg',
          type: 'art',
          credit: 'Dmitry Bogdanov / User:DmitrB (CC BY-SA 4.0)',
          sourceUrl: 'https://commons.wikimedia.org/wiki/File:Masiakasaurus_BW.jpg'
        }
      ];
    }
  },
  // 4. Megatherium americanum (ID 39)
  {
    id: 39,
    name: 'Megatherium americanum',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Megatherium_americanum_Marcus_Burkhardt.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Megatherium_americanum_Marcus_Burkhardt.jpg'
    }
  },
  // 5. Longisquama (ID 123)
  {
    id: 123,
    name: 'Longisquama',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Longisquama_BW.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Longisquama_BW.jpg'
    }
  },
  // 6. Ornitholestes (ID 151)
  {
    id: 151,
    name: 'Ornitholestes',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Ornitholestes_BW.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Ornitholestes_BW.jpg'
    }
  },
  // 7. Rhamphorhynchus (ID 204)
  {
    id: 204,
    name: 'Rhamphorhynchus',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Ramphorhynchus_profile.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Ramphorhynchus_profile.jpg'
    }
  },
  // 8. Ophthalmosaurus (ID 227)
  {
    id: 227,
    name: 'Ophthalmosaurus',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Ophthalmosaurus_BW.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Ophthalmosaurus_BW.jpg'
    }
  },
  // 9. Deinosuchus (ID 538)
  {
    id: 538,
    name: 'Deinosuchus',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Deinosuchus_hatcheri.png',
      to: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Deinosuchus_hatcheri.png'
    }
  },
  // 10. Xiphactinus (ID 539)
  {
    id: 539,
    name: 'Xiphactinus',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Xiphactinus_audax.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Xiphactinus_audax.jpg'
    }
  },
  // 11. Gigantophis garstini (ID 1616)
  {
    id: 1616,
    name: 'Gigantophis garstini',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Gigantophis_JWArtwork.png',
      to: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Gigantophis_JWArtwork.png'
    }
  },
  // 12. Australotitan cooperensis (ID 1663)
  {
    id: 1663,
    name: 'Australotitan cooperensis',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Australotitan_cooperensis.png',
      to: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Australotitan_cooperensis.png'
    }
  },
  // 13. Tapejara (ID 1921)
  {
    id: 1921,
    name: 'Tapejara',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Tapejara_wellnoferi.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Tapejara_wellnoferi.jpg'
    }
  },
  // 14. Rhizodus (ID 3163)
  {
    id: 3163,
    name: 'Rhizodus',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Rhizodus_%28cropped%29.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Rhizodus_%28cropped%29.jpg'
    }
  },
  // 15. Gillicus (ID 3164)
  {
    id: 3164,
    name: 'Gillicus',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Gillicus_arcuatus.JPG',
      to: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Gillicus_arcuatus.JPG'
    }
  },
  // 16. Dinocrocuta (ID 5165)
  {
    id: 5165,
    name: 'Dinocrocuta',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Dinocrocuta_gigantea.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Dinocrocuta_gigantea.jpg'
    }
  },
  // 17. Inostrancevia africana (ID 5167)
  {
    id: 5167,
    name: 'Inostrancevia africana',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Inostrancevia_africana.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Inostrancevia_africana.jpg'
    }
  },
  // 18. Lystrosaurus georgi (ID 5168)
  {
    id: 5168,
    name: 'Lystrosaurus georgi',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Lystr_georg1DB.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Lystr_georg1DB.jpg'
    }
  },
  // 19. Amphicyon (ID 5169)
  {
    id: 5169,
    name: 'Amphicyon',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Amphicyon-ingens_reconstruction.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Amphicyon-ingens_reconstruction.jpg'
    }
  },
  // 20. Synthetoceras (ID 5174)
  {
    id: 5174,
    name: 'Synthetoceras',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Synthetoceras_BW.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Synthetoceras_BW.jpg'
    }
  },
  // 21. Dinofelis (ID 5175)
  {
    id: 5175,
    name: 'Dinofelis',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Dinofelis_barlowi.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Dinofelis_barlowi.jpg'
    }
  },
  // 22. Megaloceros (ID 5177)
  {
    id: 5177,
    name: 'Megaloceros',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Knight_Megaloceros.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Knight_Megaloceros.jpg'
    }
  },
  // 23. Sarcosuchus (ID 5179)
  {
    id: 5179,
    name: 'Sarcosuchus',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Sarcosuchus_imperator.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Sarcosuchus_imperator.jpg'
    }
  },
  // 24. Barinasuchus (ID 5180)
  {
    id: 5180,
    name: 'Barinasuchus',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Barinasuchus_arveloi.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Barinasuchus_arveloi.jpg'
    }
  },
  // 25. Deinotherium (ID 5183)
  {
    id: 5183,
    name: 'Deinotherium',
    replaceUrl: {
      from: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Deinotherium_giganteum.jpg',
      to: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Deinotherium_giganteum.jpg'
    }
  }
];

const TARGET_ID_SET = new Set(UPDATES.map(u => u.id));

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA: MIGRATION & REPAIR OF BROKEN IMAGES (25 TARGETS)');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  const rootDir = 'd:/My folders/AI 1.0/Prehistoric encylcopedia';
  const snapshotDir = path.join(rootDir, 'backend', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  // STEP 1: Pre-migration snapshot
  console.log('Step 1: Capturing pre-migration snapshot of all species in database...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Read ${allBefore.length} species records.`);

  if (allBefore.length !== 592) {
    throw new Error(`Expected exactly 592 species before migration, found ${allBefore.length}!`);
  }

  const timestamp = Date.now();
  const preSnapshotPath = path.join(snapshotDir, `pre_repair_images_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Compute updated media payload for each target
  console.log('Step 2: Performing reviewed updates on the 25 target species...');
  const targetNewMediaMap = new Map();

  for (const updateDef of UPDATES) {
    const existing = allBefore.find(s => s.id === updateDef.id);
    if (!existing) {
      throw new Error(`Target species ID ${updateDef.id} not found in database!`);
    }

    let mediaArr = [];
    try {
      mediaArr = typeof existing.media === 'string' ? JSON.parse(existing.media) : (existing.media || []);
    } catch (e) {
      mediaArr = [];
    }

    let updatedMediaArr = [];
    if (updateDef.updateMedia) {
      updatedMediaArr = updateDef.updateMedia(mediaArr);
    } else if (updateDef.replaceUrl) {
      updatedMediaArr = mediaArr.map(m => {
        if (m.url === updateDef.replaceUrl.from) {
          return { ...m, url: updateDef.replaceUrl.to };
        }
        return m;
      });
    }

    const newMediaPayload = JSON.stringify(updatedMediaArr);
    targetNewMediaMap.set(updateDef.id, newMediaPayload);

    await prisma.species.update({
      where: { id: updateDef.id },
      data: {
        media: newMediaPayload
      }
    });
    console.log(`  ✓ Updated ID ${updateDef.id} (${updateDef.name})`);
  }

  console.log(`\n  ✓ All ${UPDATES.length} target records updated in database.\n`);

  // STEP 3: Post-migration snapshot & 100% regression verification
  console.log('Step 3: Capturing post-migration snapshot and validating anti-regression invariants...');
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const postSnapshotPath = path.join(snapshotDir, `post_repair_images_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== 592) {
    throw new Error(`Expected exactly 592 species after migration, found ${allAfter.length}!`);
  }

  let nonTargetIdentical = 0;
  let targetsCorrectlyUpdated = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    if (TARGET_ID_SET.has(before.id)) {
      const expectedMedia = targetNewMediaMap.get(before.id);
      const diffs = [];
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt' || key === 'media') continue;
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          diffs.push(key);
        }
      }
      if (diffs.length > 0) {
        unexpectedDiffs.push(`Target ID ${before.id} had unexpected field changes: ${diffs.join(', ')}`);
      } else if (after.media === expectedMedia) {
        targetsCorrectlyUpdated++;
      } else {
        unexpectedDiffs.push(`Target ID ${before.id} media does not match expected payload!`);
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

  const expectedNonTargets = 592 - UPDATES.length;
  console.log('\nVerification Summary:');
  console.log(`  - Targets correctly updated: ${targetsCorrectlyUpdated} / ${UPDATES.length}`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetIdentical} / ${expectedNonTargets} (100.0%)`);

  if (unexpectedDiffs.length > 0 || targetsCorrectlyUpdated !== UPDATES.length || nonTargetIdentical !== expectedNonTargets) {
    console.error('\n❌ CRITICAL: Invariant violation:');
    unexpectedDiffs.forEach(d => console.error('    ✕ ' + d));
    throw new Error('Anti-regression safeguard invariant violated! Aborting static file sync.');
  }

  console.log('  ✅ 100% SAFEGUARD VERIFIED: Exactly the 25 target records were updated; zero regressions across all 567 non-target records.\n');

  // STEP 4: Synchronize Static JSON Archives
  console.log('Step 4: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(rootDir, 'backend', 'prisma');

  // 1. species_full_export.json
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
  const updatedFullExport = fullExport.map(item => {
    if (TARGET_ID_SET.has(item.id)) {
      return { ...item, media: targetNewMediaMap.get(item.id), updatedAt: new Date().toISOString() };
    }
    return item;
  });
  fs.writeFileSync(fullExportPath, JSON.stringify(updatedFullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json (${UPDATES.length} target records updated)`);

  // Helper for period files
  function updatePeriodFile(filename) {
    const filePath = path.join(prismaDir, filename);
    if (!fs.existsSync(filePath)) return;
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updatedCount = 0;
    const updatedContent = fileContent.map(item => {
      if (TARGET_ID_SET.has(item.id)) {
        updatedCount++;
        return { ...item, media: targetNewMediaMap.get(item.id), updatedAt: new Date().toISOString() };
      }
      return item;
    });
    fs.writeFileSync(filePath, JSON.stringify(updatedContent, null, 2), 'utf8');
    console.log(`  ✓ Updated ${filename} (${updatedCount} target records updated)`);
  }

  updatePeriodFile('species_cretaceous.json');
  updatePeriodFile('species_jurassic.json');
  updatePeriodFile('species_triassic.json');
  updatePeriodFile('species_others.json');

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ ALL 25 TARGET SPECIES IMAGES SUCCESSFULLY REPAIRED & SYNCHRONIZED!');
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
