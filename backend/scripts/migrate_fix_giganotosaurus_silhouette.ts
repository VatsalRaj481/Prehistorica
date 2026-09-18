import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env') });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_ID = 447;
const TARGET_NAME = 'Giganotosaurus';

const PHYLO_IMAGE_UUID = 'cf75413c-6985-400e-9389-81d7007e5d91';
const PHYLO_VECTOR_URL = `https://images.phylopic.org/images/${PHYLO_IMAGE_UUID}/vector.svg`;
const PHYLO_PAGE_URL = `https://www.phylopic.org/images/${PHYLO_IMAGE_UUID}`;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const SELF_HOSTED_FILE_NAME = `${PHYLO_IMAGE_UUID}.svg`;
const SELF_HOSTED_PUBLIC_URL = `${SUPABASE_URL}/storage/v1/object/public/species-silhouettes/${SELF_HOSTED_FILE_NAME}`;

const NEW_SILHOUETTE_PAYLOAD = JSON.stringify({
  url: SELF_HOSTED_PUBLIC_URL,
  sourceUrl: PHYLO_PAGE_URL,
  license: 'CC0 1.0 Universal Public Domain Dedication',
  credit: 'Tasman Dixon',
  taxon: 'Giganotosaurus carolinii',
  taxonMatch: 'species-specific'
});

async function uploadSvgToSupabase(fileName: string, buffer: Buffer): Promise<string> {
  if (!SUPABASE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in backend/.env to upload silhouettes.');
  }

  const uploadEndpoint = `${SUPABASE_URL}/storage/v1/object/species-silhouettes/${fileName}`;
  console.log(`  Uploading ${fileName} to Supabase Storage (${uploadEndpoint})...`);

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

  console.log(`  ✓ Successfully uploaded and verified public asset: ${SELF_HOSTED_PUBLIC_URL}`);
  return SELF_HOSTED_PUBLIC_URL;
}

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('AUDITED MIGRATION: REPLACE GIGANOTOSAURUS (ID 447) SKULL WITH FULL BODY SILHOUETTE');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration snapshot
  console.log('Step 1: Capturing pre-migration database snapshot...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Current database records: ${allBefore.length}`);

  if (allBefore.length !== 592) {
    throw new Error(`Expected exactly 592 species in database, found ${allBefore.length}!`);
  }

  const targetBefore = allBefore.find(s => s.id === TARGET_ID);
  if (!targetBefore || !targetBefore.name.includes(TARGET_NAME)) {
    throw new Error(`Target species ${TARGET_NAME} (ID ${TARGET_ID}) not found in database!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preSnapshotPath = path.join(snapshotDir, `pre_fix_giganotosaurus_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Fetch Tasman Dixon SVG from PhyloPic and upload to Supabase Storage
  console.log('Step 2: Downloading Tasman Dixon full-body lateral silhouette from PhyloPic...');
  console.log(`  Source: ${PHYLO_VECTOR_URL}`);
  const fetchRes = await fetch(PHYLO_VECTOR_URL, { headers: { 'User-Agent': 'Prehistorica-Curator/2.0' } });
  if (!fetchRes.ok) {
    throw new Error(`Failed to download silhouette from ${PHYLO_VECTOR_URL} (Status: ${fetchRes.status})`);
  }
  const svgText = await fetchRes.text();
  const svgBuffer = Buffer.from(svgText, 'utf8');

  // Morphological validation: verify aspect ratio >= 2.0 (horizontal full body lateral profile)
  const vbMatch = svgText.match(/viewBox=["']([^"']+)["']/i);
  if (!vbMatch) {
    throw new Error('Downloaded SVG lacks a viewBox attribute!');
  }
  const vbParts = vbMatch[1].trim().split(/\s+/).map(Number);
  if (vbParts.length !== 4) {
    throw new Error(`Invalid viewBox format: "${vbMatch[1]}"`);
  }
  const aspectRatio = vbParts[2] / vbParts[3];
  console.log(`  Morphology check: ViewBox = ${vbMatch[1]}, Aspect Ratio = ${aspectRatio.toFixed(2)}:1`);
  if (aspectRatio < 2.0) {
    throw new Error(`Morphological invariant rejected: Theropod silhouette aspect ratio ${aspectRatio.toFixed(2)}:1 is below the full-body threshold (>= 2.0)!`);
  }

  // Upload to Supabase Storage
  await uploadSvgToSupabase(SELF_HOSTED_FILE_NAME, svgBuffer);

  // STEP 3: Update Giganotosaurus record in database
  console.log(`\nStep 3: Updating comparisonSilhouette for ${TARGET_NAME} (ID ${TARGET_ID})...`);
  await prisma.species.update({
    where: { id: TARGET_ID },
    data: {
      comparisonSilhouette: NEW_SILHOUETTE_PAYLOAD
    }
  });
  console.log(`  ✓ Database row updated for ${TARGET_NAME} (ID ${TARGET_ID}).\n`);

  // STEP 4: Post-migration snapshot & 100% regression verification
  console.log('Step 4: Capturing post-migration snapshot and validating invariants...');
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const postSnapshotPath = path.join(snapshotDir, `post_fix_giganotosaurus_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== 592) {
    throw new Error(`Expected exactly 592 species after update, found ${allAfter.length}!`);
  }

  let nonTargetIdentical = 0;
  let targetCorrectlyUpdated = false;
  const unexpectedDiffs: string[] = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    if (before.id === TARGET_ID) {
      const diffs: string[] = [];
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt' || key === 'comparisonSilhouette') continue;
        if (JSON.stringify((before as any)[key]) !== JSON.stringify((after as any)[key])) {
          diffs.push(key);
        }
      }
      if (diffs.length > 0) {
        unexpectedDiffs.push(`Target ID ${before.id} had unexpected field changes: ${diffs.join(', ')}`);
      } else if (after.comparisonSilhouette === NEW_SILHOUETTE_PAYLOAD) {
        targetCorrectlyUpdated = true;
      }
    } else {
      const diffs: string[] = [];
      for (const key of Object.keys(before)) {
        if (key === 'updatedAt') continue;
        if (JSON.stringify((before as any)[key]) !== JSON.stringify((after as any)[key])) {
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

  console.log(`\nVerification Summary:`);
  console.log(`  - Target species (${TARGET_NAME} #${TARGET_ID}) correctly updated: ${targetCorrectlyUpdated ? 'YES' : 'NO'}`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetIdentical} / 591 (100.0%)`);

  if (unexpectedDiffs.length > 0 || !targetCorrectlyUpdated) {
    console.error('\n❌ CRITICAL: Invariant violation:');
    unexpectedDiffs.forEach(d => console.error('    ✕ ' + d));
    throw new Error('Anti-regression safeguard invariant violated! Aborting.');
  }
  console.log('  ✅ 100% SAFEGUARD VERIFIED: Zero regressions detected across all non-target records.\n');

  // STEP 5: Synchronize Static JSON Archives
  console.log('Step 5: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // 1. species_full_export.json
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  if (fs.existsSync(fullExportPath)) {
    const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
    let fCount = 0;
    const updatedFullExport = fullExport.map((item: any) => {
      if (item.id === TARGET_ID) {
        fCount++;
        return { ...item, comparisonSilhouette: NEW_SILHOUETTE_PAYLOAD };
      }
      return item;
    });
    fs.writeFileSync(fullExportPath, JSON.stringify(updatedFullExport, null, 2), 'utf8');
    console.log(`  ✓ Updated species_full_export.json (${fCount} record updated)`);
  }

  // 2. species_cretaceous.json
  const cretPath = path.join(prismaDir, 'species_cretaceous.json');
  if (fs.existsSync(cretPath)) {
    const cretJson = JSON.parse(fs.readFileSync(cretPath, 'utf8'));
    let cCount = 0;
    const updatedCretJson = cretJson.map((item: any) => {
      if (item.id === TARGET_ID) {
        cCount++;
        return { ...item, comparisonSilhouette: NEW_SILHOUETTE_PAYLOAD };
      }
      return item;
    });
    fs.writeFileSync(cretPath, JSON.stringify(updatedCretJson, null, 2), 'utf8');
    console.log(`  ✓ Updated species_cretaceous.json (${cCount} record updated)`);
  }

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ GIGANOTOSAURUS SILHOUETTE MIGRATION COMPLETED SUCCESSFULLY!');
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
