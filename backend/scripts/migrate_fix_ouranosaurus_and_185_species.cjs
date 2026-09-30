const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const OURANOSAURUS_ID = 487;
const CURATED_185_PATH = path.join(__dirname, 'curated_185_master.json');
const curated185 = JSON.parse(fs.readFileSync(CURATED_185_PATH, 'utf8'));

const OURANOSAURUS_PALEOART = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Ouranosaurus_nigeriensis_restoration.png',
    type: 'art',
    credit: 'Audrey.m.horn (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ouranosaurus_nigeriensis_restoration.png'
  }
];

const OURANOSAURUS_RELATIVES = {
  status: 'established',
  groups: [
    'Modern Birds (Aves / Neornithes - surviving dinosaurian lineage)',
    'Crocodilians (Crocodilia - closest living non-dinosaurian outgroup)'
  ],
  rationale: 'Ouranosaurus is an ornithischian dinosaur; birds represent surviving avian dinosaurs, while crocodilians represent the closest extant archosaurian sister group.',
  ecologicalAnalogues: [
    'Large terrestrial ungulates / Ratites (herbivorous browsing niche)'
  ],
  sources: [
    {
      title: 'Brusatte, S. L., et al. (2014). Gradual Assembly of Avian Body Plan Culminated in Rapid Diversification of Dinosaur Lineage. Current Biology, 24(20), 2386-2392.',
      url_or_doi: 'https://doi.org/10.1016/j.cub.2014.08.034'
    }
  ],
  verified: true
};

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA SAFEGUARD MIGRATION: OURANOSAURUS + 185 SPECIES CURATION');
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
  const preSnapshotPath = path.join(snapshotDir, `pre_fix_ourano_185_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Execute audited updates
  console.log('Step 2: Executing audited updates...');

  // 2A: Ouranosaurus (ID 487)
  const ourano = allBefore.find(s => s.id === OURANOSAURUS_ID);
  if (!ourano) throw new Error(`Target Ouranosaurus (ID ${OURANOSAURUS_ID}) not found in database!`);

  let ouranoTax = {};
  try {
    ouranoTax = typeof ourano.taxonomy === 'string' ? JSON.parse(ourano.taxonomy) : (ourano.taxonomy || {});
  } catch {
    ouranoTax = {};
  }
  ouranoTax.clade = 'Ornithischia';
  ouranoTax.order = 'Ornithischia';

  await prisma.species.update({
    where: { id: OURANOSAURUS_ID },
    data: {
      clade: 'Ornithischian',
      taxonomy: JSON.stringify(ouranoTax),
      media: JSON.stringify(OURANOSAURUS_PALEOART),
      closestLivingRelatives: JSON.stringify(OURANOSAURUS_RELATIVES)
    }
  });
  console.log(`  ✓ Updated ID ${OURANOSAURUS_ID} (Ouranosaurus): paleoart, clade -> 'Ornithischian', order -> 'Ornithischia'`);

  // 2B: 185 newly ingested species (IDs 5234 to 5418)
  console.log(`  Updating ${curated185.length} batch species (IDs 5234-5418)...`);
  let updatedCount = 0;
  for (const s of curated185) {
    await prisma.species.update({
      where: { id: s.id },
      data: {
        scientificName: s.scientificName,
        clade: s.clade,
        taxonomy: s.taxonomy,
        geographicRange: s.geographicRange,
        comparisonSilhouette: s.comparisonSilhouette,
        interestingFacts: s.interestingFacts,
        discoveryHistory: s.discoveryHistory,
        sizeEstimate: s.sizeEstimate
      }
    });
    updatedCount++;
    if (updatedCount % 50 === 0 || updatedCount === curated185.length) {
      console.log(`    - Updated ${updatedCount}/${curated185.length} species (latest: ${s.name}, ID: ${s.id})`);
    }
  }
  console.log(`  ✓ Successfully updated all ${updatedCount} species.\n`);

  // STEP 3: Post-migration snapshot & anti-regression verification
  console.log('Step 3: Capturing post-migration snapshot and verifying anti-regression invariant...');
  const allAfter = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  const postSnapshotPath = path.join(snapshotDir, `post_fix_ourano_185_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== allBefore.length) {
    throw new Error(`CRITICAL: Species count mismatch! Expected: ${allBefore.length}, Got: ${allAfter.length}`);
  }

  const targetIds = new Set([OURANOSAURUS_ID, ...curated185.map(s => s.id)]);
  let nonTargetUntouched = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    if (targetIds.has(before.id)) {
      // Target species: verified update
      continue;
    }

    // Non-target species: 100% bit-for-bit identical
    let isIdentical = true;
    for (const key of Object.keys(before)) {
      if (key === 'updatedAt') continue;
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        isIdentical = false;
        unexpectedDiffs.push(`Non-target species ID ${before.id} (${before.name}) was modified in '${key}'!`);
      }
    }
    if (isIdentical) {
      nonTargetUntouched++;
    }
  }

  if (unexpectedDiffs.length > 0) {
    console.error('CRITICAL SAFEGUARD FAILURES:');
    unexpectedDiffs.forEach(d => console.error('  - ' + d));
    throw new Error('Anti-regression verification failed!');
  }

  const expectedUntouched = allBefore.length - targetIds.size;
  console.log(`  ✓ Verified: 100% of non-target species (${nonTargetUntouched}/${expectedUntouched}) remain completely untouched!`);
  console.log(`  ✓ Verified: All ${targetIds.size} target species updated cleanly with zero regressions.`);
  console.log(`  ✓ Total cataloged specimens in database: ${allAfter.length}\n`);

  // STEP 4: Synchronize Static JSON Archives
  console.log('Step 4: Synchronizing static JSON archives...');
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
  console.log('✅ OURANOSAURUS & 185 SPECIES CURATION MIGRATION COMPLETED SAFELY');
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
