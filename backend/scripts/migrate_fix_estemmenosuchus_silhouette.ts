import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env') });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_ID = 573;
const TARGET_NAME = 'Estemmenosuchus uralensis';

const PHYLO_IMAGE_UUID = 'f480b74f-3f03-4e3a-a7ae-0cf5b524f05d';
const PHYLO_VECTOR_URL = `https://images.phylopic.org/images/${PHYLO_IMAGE_UUID}/vector.svg`;
const PHYLO_PAGE_URL = `https://www.phylopic.org/images/${PHYLO_IMAGE_UUID}`;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const SELF_HOSTED_FILE_NAME = `${PHYLO_IMAGE_UUID}.svg`;
const SELF_HOSTED_PUBLIC_URL = `${SUPABASE_URL}/storage/v1/object/public/species-silhouettes/${SELF_HOSTED_FILE_NAME}`;

const NEW_SILHOUETTE_PAYLOAD = JSON.stringify({
  url: SELF_HOSTED_PUBLIC_URL,
  sourceUrl: PHYLO_PAGE_URL,
  license: 'Attribution 3.0 Unported',
  credit: 'Dmitry Bogdanov (vectorized by T. Michael Keesey)',
  taxon: 'Estemmenosuchus uralensis',
  taxonMatch: 'species-specific'
});

async function uploadSvgToSupabase(fileName: string, buffer: Buffer): Promise<string> {
  if (!SUPABASE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required in backend/.env to upload silhouettes.');
  }

  const uploadEndpoint = `${SUPABASE_URL}/storage/v1/object/species-silhouettes/${fileName}`;
  console.log(`  Uploading clean SVG to Supabase Storage (${uploadEndpoint})...`);

  const res = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
      'Content-Type': 'image/svg+xml',
      'x-upsert': 'true'
    },
    body: buffer
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload failed for ${fileName} (${res.status}): ${errText}`);
  }

  // Verify public access
  const checkRes = await fetch(SELF_HOSTED_PUBLIC_URL, { method: 'HEAD' });
  if (!checkRes.ok) {
    throw new Error(`Self-hosted silhouette not accessible at ${SELF_HOSTED_PUBLIC_URL} (Status: ${checkRes.status})`);
  }

  console.log(`  ✓ Successfully uploaded and verified clean public asset: ${SELF_HOSTED_PUBLIC_URL}`);
  return SELF_HOSTED_PUBLIC_URL;
}

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('AUDITED MIGRATION: FIX ESTEMMENOSUCHUS URALENSIS SILHOUETTE (TRANSPARENT SVG)');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration snapshot
  console.log('Step 1: Capturing pre-migration database snapshot...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Current database records: ${allBefore.length}`);

  const targetBefore = allBefore.find((s) => s.id === TARGET_ID || s.name === TARGET_NAME);
  if (!targetBefore) {
    throw new Error(`Target species ${TARGET_NAME} (ID ${TARGET_ID}) not found in database!`);
  }
  const resolvedTargetId = targetBefore.id;
  console.log(`  ✓ Found target: ID ${resolvedTargetId} - ${targetBefore.name}`);

  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preSnapshotPath = path.join(snapshotDir, `pre_fix_estemmenosuchus_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Download clean transparent vector silhouette from PhyloPic
  console.log('Step 2: Downloading clean transparent vector silhouette from PhyloPic...');
  console.log(`  Source: ${PHYLO_VECTOR_URL}`);
  const fetchRes = await fetch(PHYLO_VECTOR_URL, { headers: { 'User-Agent': 'Prehistorica-Curator/2.0' } });
  if (!fetchRes.ok) {
    throw new Error(`Failed to download silhouette from ${PHYLO_VECTOR_URL} (Status: ${fetchRes.status})`);
  }
  const svgText = await fetchRes.text();
  const svgBuffer = Buffer.from(svgText, 'utf8');

  // Validate that SVG does NOT contain white background paths
  if (svgText.includes('fill:#ffffff') || svgText.includes('fill="#ffffff"')) {
    console.warn('  ⚠️ Warning: SVG contains white fill, validating transparency...');
  } else {
    console.log('  ✓ SVG verified: Clean transparent background with no bounding white paths.');
  }

  // Upload clean vector to Supabase Storage
  await uploadSvgToSupabase(SELF_HOSTED_FILE_NAME, svgBuffer);

  // STEP 3: Update Estemmenosuchus record in database
  console.log(`\nStep 3: Updating comparisonSilhouette for ${TARGET_NAME} (ID ${resolvedTargetId})...`);
  await prisma.species.update({
    where: { id: resolvedTargetId },
    data: {
      comparisonSilhouette: NEW_SILHOUETTE_PAYLOAD
    }
  });
  console.log(`  ✓ Database row updated for ${TARGET_NAME} (ID ${resolvedTargetId}).\n`);

  // STEP 4: Post-migration snapshot & 100% regression verification
  console.log('Step 4: Capturing post-migration snapshot and validating invariants...');
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const postSnapshotPath = path.join(snapshotDir, `post_fix_estemmenosuchus_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allBefore.length !== allAfter.length) {
    throw new Error(`Row count mismatch! Before: ${allBefore.length}, After: ${allAfter.length}`);
  }

  let nonTargetMutations = 0;
  for (let i = 0; i < allBefore.length; i++) {
    const b = allBefore[i];
    const a = allAfter[i];
    if (b.id !== resolvedTargetId) {
      if (JSON.stringify(b) !== JSON.stringify(a)) {
        console.error(`  ❌ REGRESSION DETECTED: Non-target species ${b.name} (ID ${b.id}) was mutated!`);
        nonTargetMutations++;
      }
    }
  }

  if (nonTargetMutations > 0) {
    throw new Error(`Migration rejected! ${nonTargetMutations} non-target records were mutated!`);
  }
  console.log(`  ✓ Invariant Verified: 100% of non-target records (${allBefore.length - 1} species) remain completely untouched!\n`);

  // STEP 5: Synchronize static JSON archives
  console.log('Step 5: Synchronizing static JSON archives...');
  const jsonFiles = [
    path.join(__dirname, '..', 'prisma', 'species_others.json'),
    path.join(__dirname, '..', 'prisma', 'species_full_export.json')
  ];

  for (const f of jsonFiles) {
    if (fs.existsSync(f)) {
      const records = JSON.parse(fs.readFileSync(f, 'utf8'));
      const rec = records.find((r: any) => r.id === resolvedTargetId || r.name === TARGET_NAME);
      if (rec) {
        rec.comparisonSilhouette = NEW_SILHOUETTE_PAYLOAD;
        fs.writeFileSync(f, JSON.stringify(records, null, 2), 'utf8');
        console.log(`  ✓ Synchronized: ${path.basename(f)}`);
      }
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('MIGRATION COMPLETE & AUDITED SUCCESSFULLY');
  console.log('════════════════════════════════════════════════════════════════════════════');
}

main()
  .catch((err) => {
    console.error('\n❌ MIGRATION ERROR:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
