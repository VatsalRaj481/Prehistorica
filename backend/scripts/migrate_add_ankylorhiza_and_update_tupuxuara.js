const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const NEW_SPECIES = {
  id: 5189,
  name: 'Ankylorhiza tiedemani',
  scientificName: 'Ankylorhiza tiedemani',
  nameMeaning: 'Fused roots (referencing the morphology of its tooth roots)',
  timePeriod: 'Oligocene',
  epoch: 'Late Oligocene (Chattian)',
  myaStart: 24.7,
  myaEnd: 23.5,
  diet: 'carnivore',
  dietDetails: 'Macroraptorial apex predator feeding on large marine vertebrates including seals, penguins, sea turtles, squids, and other cetaceans.',
  habitat: 'marine',
  clade: 'Early_Mammal_Synapsid',
  taxonomicStatus: 'valid',
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Artiodactyla',
    infraorder: 'Cetacea',
    suborder: 'Odontoceti',
    genus: 'Ankylorhiza',
    species: 'Ankylorhiza tiedemani',
    source: 'Paleobiology Database (PBDB) + Zoological Journal of the Linnean Society'
  }),
  geographicRange: JSON.stringify({
    continent: 'North America',
    region: 'Atlantic Coastal Plain',
    country: 'United States',
    fossilFormation: 'Ashley Formation (Chandler Bridge)',
    coordinates: [32.8, -80.0]
  }),
  sizeEstimate: JSON.stringify({
    length: { value: 4.8, unit: 'm', confidence: 'well-supported' },
    height: { value: 1.2, unit: 'm', confidence: 'well-supported' },
    weight: { value: 1000, unit: 'kg', confidence: 'estimated' }
  }),
  sizeNotes: 'Apex predatory stem toothed whale measuring approximately 4.8 meters (15.7 ft) in length and weighing an estimated 1,000 kg.',
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/078d9085-8d61-4dcf-95c8-58ec145ae9ab.svg',
    sourceUrl: 'https://www.phylopic.org/images/078d9085-8d61-4dcf-95c8-58ec145ae9ab',
    license: 'Creative Commons Attribution 4.0 International',
    credit: 'Srosr2002',
    taxon: 'Odontoceti (Representative: Rhaphicetus valenciae)',
    taxonMatch: 'generic approximation, not species-specific'
  }),
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Ankylorhiza_tiedemani_life_reconstruction_by_PaleoGeek.png',
      type: 'art',
      credit: 'PaleoGeekSquared (CC BY-SA 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ankylorhiza_tiedemani_life_reconstruction_by_PaleoGeek.png'
    }
  ]),
  discoveryHistory: '• First described in the 1880s by American paleontologist Edward Drinker Cope from fragmentary rostral remains discovered in South Carolina.\n• In the 1990s, an exceptionally preserved, nearly complete skeleton comprising the skull, axial column, ribs, and flipper elements was excavated in Dorchester County, South Carolina.\n• Formally described and erected as the distinct genus Ankylorhiza in 2020 by Robert W. Boessenecker and colleagues in Current Biology.\n• Revealed as the earliest known apex predatory toothed whale in the fossil record.',
  interestingFacts: JSON.stringify([
    'Ankylorhiza tiedemani was the very first apex predatory toothed whale discovered in the fossil record, evolving into a macroraptorial niche 15 million years before modern killer whales (Orcinus orca).',
    'Its skeletal anatomy demonstrates surprising postcranial convergent evolution between modern baleen whales (Mysticeti) and toothed whales (Odontoceti), including specialized swimming adaptations.',
    'Equipped with heavy, interlocking, forward-projecting incisors and tusk-like canines anchored by fused, robust roots, specialized for ramming and dismembering large marine vertebrates.',
    'Discovered in the Ashley Formation of South Carolina, proving that North American Atlantic coastal waters harbored complex marine mammal food webs during the Late Oligocene.'
  ]),
  extinctionEvent: null,
  closestLivingRelatives: JSON.stringify([
    'Toothed Whales (Odontoceti)',
    'Hippopotamuses'
  ]),
  sources: JSON.stringify([
    {
      citation: 'Boessenecker, R. W., Churchill, M., Buchholtz, E. A., Beatty, B. L., & Geisler, J. H. (2020). Convergent evolution of swimming adaptations in modern whales. Current Biology, 30(14), 2767-2773.',
      url: 'https://doi.org/10.1016/j.cub.2020.06.012'
    },
    {
      citation: 'Paleobiology Database (PBDB) species record',
      url: 'https://paleobiodb.org'
    },
    {
      citation: 'Ankylorhiza tiedemani description in paleontological literature',
      url: 'https://en.wikipedia.org/wiki/Ankylorhiza'
    }
  ]),
  placeholder: false
};

async function main() {
  console.log('--- STARTING ANKYLORHIZA INGESTION & TUPUXUARA MEDIA UPDATE ---');

  // 1. Fetch current database state
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
  const preSnapshotPath = path.join(snapshotDir, 'pre_ankylorhiza_snapshot.json');
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`Pre-migration snapshot written to: ${preSnapshotPath}`);

  // 2. Insert Ankylorhiza tiedemani (ID 5189)
  console.log('\nStep 2: Ingesting Ankylorhiza tiedemani (ID 5189)...');
  await prisma.species.create({
    data: NEW_SPECIES
  });
  console.log('  ✓ Inserted Ankylorhiza tiedemani successfully');

  // 3. Update Tupuxuara longicristatus (ID 1741)
  console.log('\nStep 3: Updating Tupuxuara longicristatus (ID 1741) paleoart...');
  const tupuxExisting = allBefore.find(s => s.id === 1741);
  if (!tupuxExisting) {
    throw new Error('Tupuxuara longicristatus (ID 1741) not found in database!');
  }

  let tupuxMedia = [];
  try {
    tupuxMedia = typeof tupuxExisting.media === 'string' ? JSON.parse(tupuxExisting.media) : (tupuxExisting.media || []);
  } catch (e) {
    tupuxMedia = [];
  }

  const newTupuxPrimary = {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Tupux_longDB2_2.jpg',
    type: 'art',
    credit: 'Dmitry Bogdanov (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tupux_longDB2_2.jpg'
  };

  const otherTupuxMedia = tupuxMedia.filter(m => !m.url.includes('Tupux_longDB2_2.jpg') && !m.url.includes('Panaves_diversity.jpg'));
  const updatedTupuxMedia = [newTupuxPrimary, ...otherTupuxMedia];

  await prisma.species.update({
    where: { id: 1741 },
    data: {
      media: JSON.stringify(updatedTupuxMedia)
    }
  });
  console.log('  ✓ Updated Tupuxuara longicristatus media');

  // 4. Fetch post-migration state & verify 100% safeguard
  console.log('\nStep 4: Fetching post-migration state and verifying safeguards...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, 'post_ankylorhiza_snapshot.json');
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`Post-migration snapshot written to: ${postSnapshotPath}`);

  if (allAfter.length !== 559) {
    throw new Error(`Expected exactly 559 records after addition, found ${allAfter.length}!`);
  }

  // Verify Ankylorhiza exists
  const newlyCreated = allAfter.find(s => s.id === 5189);
  if (!newlyCreated || newlyCreated.name !== 'Ankylorhiza tiedemani') {
    throw new Error('Ankylorhiza tiedemani not found in post-state!');
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

    if (before.id === 1741) {
      // Check that only media changed on Tupuxuara
      const diffFields = [];
      for (const k of Object.keys(before)) {
        if (k === 'updatedAt' || k === 'media') continue;
        if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
          diffFields.push(k);
        }
      }
      if (diffFields.length > 0) {
        unexpectedDiffs.push(`Tupuxuara (ID 1741) had unexpected diffs in: ${diffFields.join(', ')}`);
      } else {
        targetUpdateCount++;
      }
    } else {
      // Non-targets must be 100% bit-for-bit identical
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
  console.log(`- New species inserted: 1 (ID 5189, Ankylorhiza tiedemani)`);
  console.log(`- Target species updated: ${targetUpdateCount} / 1 (ID 1741, Tupuxuara)`);
  console.log(`- Non-target pre-existing species bit-for-bit identical: ${untouchedCount} / 557 (100.0%)`);

  if (unexpectedDiffs.length > 0) {
    console.error('CRITICAL ERROR: Regressions detected:');
    unexpectedDiffs.forEach(d => console.error('  ✕ ' + d));
    throw new Error('Safeguard check failed!');
  }

  // 5. Synchronize static JSON archives
  console.log('\nStep 5: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // Full export: append new species and update Tupuxuara
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
  const updatedFullExport = fullExport.map(item => {
    if (item.id === 1741) {
      const fresh = allAfter.find(s => s.id === 1741);
      return { ...item, media: fresh.media };
    }
    return item;
  });
  // Add new species at end
  updatedFullExport.push(newlyCreated);
  fs.writeFileSync(fullExportPath, JSON.stringify(updatedFullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json (${updatedFullExport.length} records)`);

  // Cretaceous archive: update Tupuxuara (ID 1741)
  const cretPath = path.join(prismaDir, 'species_cretaceous.json');
  const cretJson = JSON.parse(fs.readFileSync(cretPath, 'utf8'));
  const updatedCret = cretJson.map(item => {
    if (item.id === 1741) {
      const fresh = allAfter.find(s => s.id === 1741);
      return { ...item, media: fresh.media };
    }
    return item;
  });
  fs.writeFileSync(cretPath, JSON.stringify(updatedCret, null, 2), 'utf8');
  console.log(`  ✓ Updated species_cretaceous.json (${updatedCret.length} records)`);

  // Others archive: add Ankylorhiza (Oligocene / Cenozoic)
  const othersPath = path.join(prismaDir, 'species_others.json');
  const othersJson = JSON.parse(fs.readFileSync(othersPath, 'utf8'));
  othersJson.push(newlyCreated);
  fs.writeFileSync(othersPath, JSON.stringify(othersJson, null, 2), 'utf8');
  console.log(`  ✓ Updated species_others.json (${othersJson.length} records)`);

  console.log('\n--- ANKYLORHIZA ADDITION & TUPUXUARA UPDATE COMPLETE SUCCESSFULLY ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma['$disconnect']();
  });
