const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_IDS = [11, 18, 212, 491, 5176];

async function main() {
  console.log('==============================================================');
  console.log('--- STARTING PALEOART & STEGOSAURUS SILHOUETTE MIGRATION ---');
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
  const preSnapshotPath = path.join(snapshotDir, 'pre_paleoart_and_stego_snapshot.json');
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`✓ Pre-migration snapshot written to: ${preSnapshotPath}`);

  // 2. Perform updates on targets
  console.log('\n[Step 2] Applying audited updates to 5 target species...');

  // Target 1: Helicoprion bessonowi (ID 11) - Paleoart upgrade to Dmitry Bogdanov
  console.log('Updating Helicoprion bessonowi (ID 11)...');
  const helicoprionMedia = [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Helicoprion_bessonovi1DB.jpg',
      type: 'art',
      credit: 'Dmitry Bogdanov (CC BY 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Helicoprion_bessonovi1DB.jpg'
    },
    {
      url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/11-Helicoprion.png',
      type: 'scientific_figure',
      credit: 'Alexander Karpinsky (1899, Public Domain)',
      sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Karpinsky_1899_Helicoprion_bessonowi_Fig._73.png'
    }
  ];
  await prisma.species.update({
    where: { id: 11 },
    data: {
      media: JSON.stringify(helicoprionMedia),
      placeholder: false
    }
  });
  console.log('  ✓ Helicoprion paleoart updated');

  // Target 2: Stegosaurus stenops (ID 18) - Calibrated silhouette ground alignment
  console.log('Updating Stegosaurus stenops (ID 18) silhouette...');
  const stegoSilhouette = {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/429d71d8-2940-449b-838b-a5b7f1733eba-calibrated.svg',
    sourceUrl: 'https://www.phylopic.org/images/429d71d8-2940-449b-838b-a5b7f1733eba',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    credit: 'Olivia Binfield',
    taxon: 'Stegosaurus stenops',
    taxonMatch: 'species-specific'
  };
  await prisma.species.update({
    where: { id: 18 },
    data: {
      comparisonSilhouette: JSON.stringify(stegoSilhouette)
    }
  });
  console.log('  ✓ Stegosaurus silhouette calibrated');

  // Target 3: Darwinopterus modularis (ID 212) - Paleoart upgrade to Nobu Tamura
  console.log('Updating Darwinopterus modularis (ID 212)...');
  const darwinopterusMedia = [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Darwinopterus_NT.jpg',
      type: 'art',
      credit: 'Nobu Tamura (CC BY 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Darwinopterus_NT.jpg'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Darwinopterus.jpg',
      type: 'fossil_specimen',
      credit: 'Didier Descouens (CC BY-SA 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Darwinopterus.jpg'
    }
  ];
  await prisma.species.update({
    where: { id: 212 },
    data: {
      media: JSON.stringify(darwinopterusMedia),
      placeholder: false
    }
  });
  console.log('  ✓ Darwinopterus paleoart updated');

  // Target 4: Tenontosaurus tilletti (ID 491) - Paleoart upgrade to TotalDino
  console.log('Updating Tenontosaurus tilletti (ID 491)...');
  const tenontosaurusMedia = [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Tenontosaurus_TD.png',
      type: 'art',
      credit: 'TotalDino (CC BY 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tenontosaurus_TD.png'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Ornithopods_jconway.jpg',
      type: 'art',
      credit: 'John Conway (CC BY-SA 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ornithopods_jconway.jpg'
    },
    {
      url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/491-Tenontosaurus.jpg',
      type: 'museum_display',
      credit: 'Life reconstruction illustration',
      sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Tenontosaurus.jpg'
    }
  ];
  await prisma.species.update({
    where: { id: 491 },
    data: {
      media: JSON.stringify(tenontosaurusMedia),
      placeholder: false
    }
  });
  console.log('  ✓ Tenontosaurus paleoart updated');

  // Target 5: Geosternbergia maysei (ID 5176) - Paleoart upgrade to Jfstudiospaleoart
  console.log('Updating Geosternbergia maysei (ID 5176)...');
  const geosternbergiaMedia = [
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/7/74/GeosternbergiaJF.png',
      type: 'art',
      credit: 'Jfstudiospaleoart (CC BY-SA 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:GeosternbergiaJF.png'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Pterosaur_Flight_Adaptations_-_Pteranodon_sternbergi_-_Hugo_Salais_L%C3%B3pez.jpg',
      type: 'comparative_anatomy',
      credit: 'Hugo Salais López (CC BY-SA 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pterosaur_Flight_Adaptations_-_Pteranodon_sternbergi_-_Hugo_Salais_L%C3%B3pez.jpg'
    }
  ];
  await prisma.species.update({
    where: { id: 5176 },
    data: {
      media: JSON.stringify(geosternbergiaMedia),
      placeholder: false
    }
  });
  console.log('  ✓ Geosternbergia paleoart updated');

  // 3. Fetch post-migration state & verify safeguard
  console.log('\n[Step 3] Verifying 100% safeguard invariants on post-migration database state...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, 'post_paleoart_and_stego_snapshot.json');
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`✓ Post-migration snapshot written to: ${postSnapshotPath}`);

  if (allAfter.length !== 559) {
    throw new Error(`CRITICAL: Post-migration record count mismatch: ${allAfter.length} vs 559!`);
  }

  let untouchedCount = 0;
  let targetUpdatedCount = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted from database!`);
      continue;
    }

    if (TARGET_IDS.includes(before.id)) {
      const allowed = ['media', 'comparisonSilhouette', 'placeholder', 'updatedAt'];
      for (const k of Object.keys(before)) {
        if (allowed.includes(k)) continue;
        if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
          unexpectedDiffs.push(`Target ID ${before.id} had unexpected change in field '${k}'!`);
        }
      }
      targetUpdatedCount++;
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
  console.log(`  - Exactly 5 target species updated safely (${targetUpdatedCount}/5).`);
  console.log(`  - 554 non-target species bit-for-bit identical: ${untouchedCount} / 554 (100.0%).`);

  // 4. Synchronize static JSON archives
  console.log('\n[Step 4] Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  function syncArchive(fileName) {
    const filePath = path.join(prismaDir, fileName);
    if (!fs.existsSync(filePath)) return;
    const archiveJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const updatedArchive = archiveJson.map(item => {
      if (TARGET_IDS.includes(item.id)) {
        const fresh = allAfter.find(s => s.id === item.id);
        return {
          ...item,
          media: fresh.media,
          comparisonSilhouette: fresh.comparisonSilhouette,
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
  console.log('--- PALEOART & SILHOUETTE MIGRATION COMPLETED SUCCESSFULLY ---');
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
