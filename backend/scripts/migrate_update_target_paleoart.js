const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_UPDATES = [
  {
    id: 884,
    name: 'Indosuchus',
    updateData: (existing) => {
      let media = [];
      try {
        media = typeof existing.media === 'string' ? JSON.parse(existing.media) : (existing.media || []);
      } catch (e) {
        media = [];
      }

      const newPrimary = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Indosuchus_raptorius.jpg',
        type: 'art',
        credit: 'FunkMonk (CC BY 3.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Indosuchus_raptorius.jpg'
      };

      // Keep secondary if any, but replace or prepend primary
      const otherMedia = media.filter(m => !m.url.includes('Indosuchus_raptorius.jpg'));
      const updatedMedia = [newPrimary, ...otherMedia];

      const updatedSilhouette = JSON.stringify({
        url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/30807118-9c7a-49e0-b6f0-5fad1100ff57.svg',
        sourceUrl: 'https://www.phylopic.org/images/30807118-9c7a-49e0-b6f0-5fad1100ff57',
        license: 'Creative Commons Attribution 4.0 International',
        credit: 'Tasman Dixon',
        taxon: 'Abelisauroidea (Representative: Eoabelisaurus mefi)',
        taxonMatch: 'generic approximation, not species-specific'
      });

      return {
        media: JSON.stringify(updatedMedia),
        comparisonSilhouette: updatedSilhouette
      };
    }
  },
  {
    id: 923,
    name: 'Sivatherium',
    updateData: (existing) => {
      let media = [];
      try {
        media = typeof existing.media === 'string' ? JSON.parse(existing.media) : (existing.media || []);
      } catch (e) {
        media = [];
      }

      const newPrimary = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Sivatherium_giganteum.jpg',
        type: 'art',
        credit: 'Stanton F. Fink (CC BY-SA 2.5)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sivatherium_giganteum.jpg'
      };

      const otherMedia = media.filter(m => !m.url.includes('Sivatherium_giganteum.jpg'));
      return {
        media: JSON.stringify([newPrimary, ...otherMedia])
      };
    }
  },
  {
    id: 924,
    name: 'Stegodon ganesa',
    updateData: (existing) => {
      let media = [];
      try {
        media = typeof existing.media === 'string' ? JSON.parse(existing.media) : (existing.media || []);
      } catch (e) {
        media = [];
      }

      const newPrimary = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Stegodon_ganesaDB.jpg',
        type: 'art',
        credit: 'DiBgd (CC BY-SA 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Stegodon_ganesaDB.jpg'
      };

      const otherMedia = media.filter(m => !m.url.includes('Stegodon_ganesaDB.jpg'));
      return {
        media: JSON.stringify([newPrimary, ...otherMedia])
      };
    }
  },
  {
    id: 497,
    name: 'Euoplocephalus',
    updateData: (existing) => {
      let media = [];
      try {
        media = typeof existing.media === 'string' ? JSON.parse(existing.media) : (existing.media || []);
      } catch (e) {
        media = [];
      }

      const newPrimary = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Euoplocephalus_TD.png',
        type: 'art',
        credit: 'TotalDino (CC BY 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Euoplocephalus_TD.png'
      };

      // Remove the old low quality photo or broken link if present and keep secondary display
      const otherMedia = media.filter(m => !m.url.includes('Euoplocephalus_TD.png') && !m.url.includes('Pla%C5%BCa_w_Or%C5%82owie'));
      return {
        media: JSON.stringify([newPrimary, ...otherMedia])
      };
    }
  },
  {
    id: 462,
    name: 'Gorgosaurus',
    updateData: (existing) => {
      let media = [];
      try {
        media = typeof existing.media === 'string' ? JSON.parse(existing.media) : (existing.media || []);
      } catch (e) {
        media = [];
      }

      const newPrimary = {
        url: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Gorgosaurus_flipped.png',
        type: 'art',
        credit: 'Levi bernardo (CC BY-SA 3.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gorgosaurus_flipped.png'
      };

      const otherMedia = media.filter(m => !m.url.includes('Gorgosaurus_flipped.png'));
      return {
        media: JSON.stringify([newPrimary, ...otherMedia])
      };
    }
  }
];

async function main() {
  console.log('--- STARTING TARGET PALEOART & SILHOUETTE UPDATE ---');

  // 1. Fetch all current species from database
  console.log('Step 1: Fetching all species from database...');
  const allBefore = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`Retrieved ${allBefore.length} species records.`);

  if (allBefore.length !== 558) {
    throw new Error(`Expected 558 records, found ${allBefore.length}. Aborting!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'prisma', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const preSnapshotPath = path.join(snapshotDir, 'pre_update_target_paleoart_snapshot.json');
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`Pre-migration snapshot written to: ${preSnapshotPath}`);

  // 2. Perform reviewed updates on 5 target records
  console.log('\nStep 2: Updating 5 target species in database...');
  const targetIds = TARGET_UPDATES.map(t => t.id);

  for (const t of TARGET_UPDATES) {
    const existing = allBefore.find(s => s.id === t.id);
    if (!existing) {
      throw new Error(`Target ID ${t.id} (${t.name}) not found!`);
    }

    const dataToUpdate = t.updateData(existing);
    await prisma.species.update({
      where: { id: t.id },
      data: dataToUpdate
    });
    console.log(`  ✓ Updated ID ${t.id} (${t.name})`);
  }

  // 3. Post-migration fetch & verify 100% safeguard
  console.log('\nStep 3: Verifying 100% non-target safeguard invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, 'post_update_target_paleoart_snapshot.json');
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`Post-migration snapshot written to: ${postSnapshotPath}`);

  let untouchedCount = 0;
  let touchedTargetCount = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    if (targetIds.includes(before.id)) {
      // Check target changes
      const diffFields = [];
      for (const k of Object.keys(before)) {
        if (k === 'updatedAt' || k === 'media' || (before.id === 884 && k === 'comparisonSilhouette')) continue;
        if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
          diffFields.push(k);
        }
      }
      if (diffFields.length > 0) {
        unexpectedDiffs.push(`Target ID ${before.id} had unintended diffs in fields: ${diffFields.join(', ')}`);
      } else {
        touchedTargetCount++;
      }
    } else {
      // Non-target: bit-for-bit identical
      const diffFields = [];
      for (const k of Object.keys(before)) {
        if (k === 'updatedAt') continue;
        if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
          diffFields.push(k);
        }
      }
      if (diffFields.length > 0) {
        unexpectedDiffs.push(`NON-TARGET ID ${before.id} was modified! Fields: ${diffFields.join(', ')}`);
      } else {
        untouchedCount++;
      }
    }
  }

  console.log(`\nVerification Results:`);
  console.log(`- Targets safely updated: ${touchedTargetCount} / 5`);
  console.log(`- Non-target species bit-for-bit identical: ${untouchedCount} / 553 (100.0%)`);

  if (unexpectedDiffs.length > 0) {
    console.error('CRITICAL SAFEGUARD REGRESSION DETECTED:');
    unexpectedDiffs.forEach(d => console.error('  ✕ ' + d));
    throw new Error('Safeguard check failed!');
  }

  // 4. Synchronize static JSON archives
  console.log('\nStep 4: Synchronizing static JSON archives...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // Sync full export preserving exact formatting/omission of non-targets
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
  const updatedFullExport = fullExport.map(item => {
    if (targetIds.includes(item.id)) {
      const fresh = allAfter.find(s => s.id === item.id);
      return {
        ...item,
        media: fresh.media,
        ...(item.id === 884 ? { comparisonSilhouette: fresh.comparisonSilhouette } : {})
      };
    }
    return item;
  });
  fs.writeFileSync(fullExportPath, JSON.stringify(updatedFullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json`);

  // Sync Cretaceous (Gorgosaurus 462, Euoplocephalus 497, Indosuchus 884)
  const cretPath = path.join(prismaDir, 'species_cretaceous.json');
  const cretJson = JSON.parse(fs.readFileSync(cretPath, 'utf8'));
  const updatedCret = cretJson.map(item => {
    if (targetIds.includes(item.id)) {
      const fresh = allAfter.find(s => s.id === item.id);
      return {
        ...item,
        media: fresh.media,
        ...(item.id === 884 ? { comparisonSilhouette: fresh.comparisonSilhouette } : {})
      };
    }
    return item;
  });
  fs.writeFileSync(cretPath, JSON.stringify(updatedCret, null, 2), 'utf8');
  console.log(`  ✓ Updated species_cretaceous.json`);

  // Sync Others (Sivatherium 923, Stegodon 924)
  const othersPath = path.join(prismaDir, 'species_others.json');
  const othersJson = JSON.parse(fs.readFileSync(othersPath, 'utf8'));
  const updatedOthers = othersJson.map(item => {
    if (targetIds.includes(item.id)) {
      const fresh = allAfter.find(s => s.id === item.id);
      return {
        ...item,
        media: fresh.media
      };
    }
    return item;
  });
  fs.writeFileSync(othersPath, JSON.stringify(updatedOthers, null, 2), 'utf8');
  console.log(`  ✓ Updated species_others.json`);

  console.log('\n--- MIGRATION AND ARCHIVE SYNC COMPLETED SUCCESSFULLY ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma['$disconnect']();
  });
