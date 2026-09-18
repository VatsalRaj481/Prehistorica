import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env') });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_ID = 24;
const TARGET_NAME = 'Tyrannosaurus rex';

// Richard Rich's verified CC0 species-specific silhouette for Tyrannosaurus rex (Osborn, 1905)
const PHYLO_IMAGE_UUID = 'ccb9b896-20b5-4e0b-8979-001742a884c5';
const PHYLO_PAGE_URL = `https://www.phylopic.org/images/${PHYLO_IMAGE_UUID}`;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const SELF_HOSTED_FILE_NAME = `${PHYLO_IMAGE_UUID}.svg`;
const SELF_HOSTED_PUBLIC_URL = `${SUPABASE_URL}/storage/v1/object/public/species-silhouettes/${SELF_HOSTED_FILE_NAME}`;

const NEW_SILHOUETTE_PAYLOAD = JSON.stringify({
  url: SELF_HOSTED_PUBLIC_URL,
  sourceUrl: PHYLO_PAGE_URL,
  license: 'Creative Commons CC0 1.0 Universal Public Domain Dedication',
  credit: 'Richard Rich',
  taxon: 'Tyrannosaurus rex',
  taxonMatch: 'species-specific'
});

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('AUDITED MIGRATION: SET TYRANNOSAURUS REX (ID 24) TO RICHARD RICH CC0 SILHOUETTE');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Verify self-hosted Supabase asset is publicly accessible
  console.log('Step 1: Verifying Supabase self-hosted asset...');
  console.log(`  URL: ${SELF_HOSTED_PUBLIC_URL}`);
  const headRes = await fetch(SELF_HOSTED_PUBLIC_URL, { method: 'HEAD' });
  if (!headRes.ok) {
    throw new Error(`Self-hosted asset not accessible at ${SELF_HOSTED_PUBLIC_URL} (Status: ${headRes.status})`);
  }
  console.log(`  ✓ Asset verified accessible (Status ${headRes.status})\n`);

  // STEP 2: Pre-migration snapshot
  console.log('Step 2: Capturing pre-migration database snapshot...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Current database records: ${allBefore.length}`);

  if (allBefore.length !== 592) {
    throw new Error(`Expected exactly 592 species in database, found ${allBefore.length}!`);
  }

  const targetBefore = allBefore.find(s => s.id === TARGET_ID);
  if (!targetBefore || !targetBefore.name.toLowerCase().includes('tyrannosaurus')) {
    throw new Error(`Target species ${TARGET_NAME} (ID ${TARGET_ID}) not found in database!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preSnapshotPath = path.join(snapshotDir, `pre_richard_rich_trex_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 3: Execute single-row update
  console.log(`Step 3: Updating Species #${TARGET_ID} (${targetBefore.name})...`);
  const updatedRecord = await prisma.species.update({
    where: { id: TARGET_ID },
    data: {
      comparisonSilhouette: NEW_SILHOUETTE_PAYLOAD,
      updatedAt: new Date()
    }
  });
  console.log(`  ✓ Successfully updated Species #${TARGET_ID}`);
  console.log(`  New silhouette metadata:`, updatedRecord.comparisonSilhouette, '\n');

  // STEP 4: Post-migration verification
  console.log('Step 4: Verifying database integrity against pre-operation snapshot...');
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });

  if (allAfter.length !== 592) {
    throw new Error(`Regression! Database count changed from 592 to ${allAfter.length}`);
  }

  let nonTargetIdentical = 0;
  let regressionsDetected = 0;

  for (const beforeRow of allBefore) {
    if (beforeRow.id === TARGET_ID) continue; // Target record expected to change

    const afterRow = allAfter.find(s => s.id === beforeRow.id);
    if (!afterRow) {
      console.error(`  ❌ REGRESSION: Species #${beforeRow.id} (${beforeRow.name}) missing after migration!`);
      regressionsDetected++;
      continue;
    }

    const beforeStr = JSON.stringify({ ...beforeRow, updatedAt: null });
    const afterStr = JSON.stringify({ ...afterRow, updatedAt: null });

    if (beforeStr !== afterStr) {
      console.error(`  ❌ REGRESSION: Species #${beforeRow.id} (${beforeRow.name}) was unintentionally modified!`);
      regressionsDetected++;
    } else {
      nonTargetIdentical++;
    }
  }

  console.log(`  Non-target species verified identical: ${nonTargetIdentical} / 591`);
  console.log(`  Regressions detected: ${regressionsDetected}`);

  if (regressionsDetected > 0 || nonTargetIdentical !== 591) {
    throw new Error(`CRITICAL: Safeguard violation! ${regressionsDetected} non-target species were modified.`);
  }

  console.log('  ✅ SAFEGUARD VERIFIED: 100% of non-target species records remain completely untouched.\n');

  // Save post-migration snapshot
  const postSnapshotPath = path.join(snapshotDir, `post_richard_rich_trex_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}\n`);

  // STEP 5: Synchronize static JSON archives
  console.log('Step 5: Synchronizing static JSON archives...');
  const cretaceousPath = path.join(__dirname, '..', 'prisma', 'species_cretaceous.json');
  const fullExportPath = path.join(__dirname, '..', 'prisma', 'species_full_export.json');

  if (fs.existsSync(cretaceousPath)) {
    const cretaceous = JSON.parse(fs.readFileSync(cretaceousPath, 'utf8'));
    const idx = cretaceous.findIndex((s: any) => s.id === TARGET_ID);
    if (idx !== -1) {
      cretaceous[idx].comparisonSilhouette = NEW_SILHOUETTE_PAYLOAD;
      fs.writeFileSync(cretaceousPath, JSON.stringify(cretaceous, null, 2), 'utf8');
      console.log(`  ✓ Updated ${cretaceousPath} (Species #${TARGET_ID})`);
    }
  }

  if (fs.existsSync(fullExportPath)) {
    const full = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
    const idx = full.findIndex((s: any) => s.id === TARGET_ID);
    if (idx !== -1) {
      full[idx].comparisonSilhouette = NEW_SILHOUETTE_PAYLOAD;
      fs.writeFileSync(fullExportPath, JSON.stringify(full, null, 2), 'utf8');
      console.log(`  ✓ Updated ${fullExportPath} (Species #${TARGET_ID})`);
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('MIGRATION COMPLETE: TYRANNOSAURUS REX IS NOW LINKED TO RICHARD RICH CC0');
  console.log('════════════════════════════════════════════════════════════════════════════');
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
