import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env') });
import { PrismaClient } from '@prisma/client';
import { validateSilhouetteMetadata } from './validate-silhouettes';

const prisma = new PrismaClient();

const TARGET_ID = 5403;
const TARGET_NAME = 'Torosaurus';

// Verified Itai Fein CC0 species-specific silhouette for Torosaurus latus (Marsh, 1891)
const PHYLO_IMAGE_UUID = '1b73aa50-2b39-4d04-96db-e1a0e61b868a';
const PHYLO_VECTOR_URL = `https://images.phylopic.org/images/${PHYLO_IMAGE_UUID}/vector.svg`;
const PHYLO_PAGE_URL = `https://www.phylopic.org/images/${PHYLO_IMAGE_UUID}`;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const SELF_HOSTED_FILE_NAME = `${PHYLO_IMAGE_UUID}.svg`;
const SELF_HOSTED_PUBLIC_URL = `${SUPABASE_URL}/storage/v1/object/public/species-silhouettes/${SELF_HOSTED_FILE_NAME}`;

const NEW_SILHOUETTE_PAYLOAD = JSON.stringify({
  url: SELF_HOSTED_PUBLIC_URL,
  sourceUrl: PHYLO_PAGE_URL,
  license: 'Creative Commons CC0 1.0 Universal Public Domain Dedication',
  credit: 'Itai Fein',
  taxon: 'Torosaurus latus',
  taxonMatch: 'species-specific'
});

const UPDATED_FIELDS = {
  scientificName: 'Torosaurus latus',
  nameMeaning: 'Perforated lizard (referring to the large openings in its frill)',
  timePeriod: 'Late Cretaceous',
  epoch: 'Late Cretaceous Epoch (Maastrichtian, ~68–66 Ma)',
  myaStart: 68,
  myaEnd: 66,
  geographicRange: JSON.stringify({
    continent: 'North America',
    region: 'Western North America',
    country: 'United States & Canada',
    fossilFormation: 'Hell Creek, Lance, Ferris, Denver, Frenchman, and Javelina Formations'
  }),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Reptilia',
    clade: 'Dinosauria',
    order: 'Ornithischia',
    suborder: 'Ceratopsia',
    family: 'Ceratopsidae',
    subfamily: 'Chasmosaurinae',
    genus: 'Torosaurus',
    species: 'Torosaurus latus',
    source: 'Paleobiology Database (PBDB #63773)'
  }),
  sizeNotes: 'Estimated at 7.5 to 9.0 m (25 to 30 ft) in total length and 6 to 8 metric tonnes in adult body mass. Boasted one of the largest skulls of any terrestrial animal, with the frilled skull reaching up to 2.77 m (9.1 ft) in length.',
  sizeEstimate: JSON.stringify({
    length: { value: 8.0, unit: 'm', confidence: 'well-supported' },
    height: { value: 2.8, unit: 'm', confidence: 'well-supported' },
    weight: { value: 6500, unit: 'kg', confidence: 'well-supported' }
  }),
  comparisonSilhouette: NEW_SILHOUETTE_PAYLOAD,
  sources: JSON.stringify([
    {
      citation: 'Paleobiology Database (PBDB) - Torosaurus latus (Taxon #63773)',
      url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_name=Torosaurus'
    },
    {
      citation: 'Marsh, O. C. (1891). Notice of new vertebrate fossils. The American Journal of Science, 42(249), 265-269.',
      url: 'https://doi.org/10.2475/ajs.s3-42.249.265'
    },
    {
      citation: 'Torosaurus description in paleontological literature',
      url: 'https://en.wikipedia.org/wiki/Torosaurus'
    }
  ])
};

async function uploadSvgToSupabase(fileName: string, buffer: Buffer): Promise<string> {
  try {
    const checkRes = await fetch(SELF_HOSTED_PUBLIC_URL, { method: 'HEAD' });
    if (checkRes.ok) {
      console.log(`  ✓ Asset already exists and verified public in Supabase: ${SELF_HOSTED_PUBLIC_URL}`);
      return SELF_HOSTED_PUBLIC_URL;
    }
  } catch {
    // continue to upload
  }

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
  console.log('AUDITED MIGRATION: TOROSAURUS (ID 5403) TAXONOMY, METRICS & SILHOUETTE FIX');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration snapshot
  console.log('Step 1: Capturing pre-migration database snapshot...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Current database records: ${allBefore.length}`);

  if (allBefore.length === 0) {
    throw new Error('Database contains no species records!');
  }

  const targetBefore = allBefore.find(s => s.id === TARGET_ID);
  if (!targetBefore || !targetBefore.name.toLowerCase().includes('torosaurus')) {
    throw new Error(`Target species ${TARGET_NAME} (ID ${TARGET_ID}) not found in database!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const preSnapshotPath = path.join(snapshotDir, `pre_torosaurus_fix_snapshot_${Date.now()}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf-8');
  console.log(`  ✓ Pre-migration snapshot written to: ${preSnapshotPath}\n`);

  // STEP 2: Fetch and upload species-specific silhouette
  console.log('Step 2: Sourcing and self-hosting species-specific silhouette...');
  console.log(`  Downloading PhyloPic vector: ${PHYLO_VECTOR_URL}`);
  const svgRes = await fetch(PHYLO_VECTOR_URL, {
    headers: { 'User-Agent': 'Prehistorica-Curatorial-Sync/1.0' }
  });
  if (!svgRes.ok) {
    throw new Error(`Failed to download vector from PhyloPic (${svgRes.status}): ${PHYLO_VECTOR_URL}`);
  }
  const svgBuffer = Buffer.from(await svgRes.arrayBuffer());
  console.log(`  Downloaded SVG size: ${svgBuffer.length} bytes`);

  await uploadSvgToSupabase(SELF_HOSTED_FILE_NAME, svgBuffer);
  console.log();

  // STEP 3: Curatorial validation of silhouette metadata
  console.log('Step 3: Auditing new silhouette metadata against Invariant #3...');
  const silAudit = validateSilhouetteMetadata(
    JSON.parse(NEW_SILHOUETTE_PAYLOAD),
    TARGET_NAME,
    targetBefore.clade
  );
  if (!silAudit.valid) {
    throw new Error(`Silhouette validation failed: ${silAudit.errors.join(', ')}`);
  }
  console.log('  ✓ Silhouette metadata passed all curatorial invariants.\n');

  // STEP 4: Apply database update (reviewed operation strictly targeting ID 5403)
  console.log(`Step 4: Updating Species #${TARGET_ID} (${TARGET_NAME}) in PostgreSQL database...`);
  const updatedRecord = await prisma.species.update({
    where: { id: TARGET_ID },
    data: UPDATED_FIELDS
  });
  console.log(`  ✓ Updated record scientificName: "${updatedRecord.scientificName}"`);
  console.log(`  ✓ Updated record sizeNotes: "${updatedRecord.sizeNotes}"`);
  console.log(`  ✓ Updated record sizeEstimate: "${updatedRecord.sizeEstimate}"\n`);

  // STEP 5: Post-migration verification (100% non-target safeguard)
  console.log('Step 5: Verifying zero regressions across all non-target database records...');
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });

  if (allAfter.length !== allBefore.length) {
    throw new Error(`CRITICAL INVARIANT VIOLATION: Species count changed! Before: ${allBefore.length}, After: ${allAfter.length}`);
  }

  let nonTargetMismatches = 0;
  for (let i = 0; i < allBefore.length; i++) {
    const b = allBefore[i];
    const a = allAfter[i];

    if (b.id === TARGET_ID) {
      if (a.scientificName !== 'Torosaurus latus') {
        throw new Error(`Target species #${TARGET_ID} was not updated properly!`);
      }
      continue;
    }

    // Every non-target species must remain 100% identical (excluding updatedAt)
    const bObj = { ...b, updatedAt: null };
    const aObj = { ...a, updatedAt: null };

    if (JSON.stringify(bObj) !== JSON.stringify(aObj)) {
      console.error(`  ✕ Mismatch detected on non-target species #${b.id} (${b.name})!`);
      nonTargetMismatches++;
    }
  }

  if (nonTargetMismatches > 0) {
    throw new Error(`CRITICAL INVARIANT VIOLATION: ${nonTargetMismatches} non-target records were altered!`);
  }

  console.log(`  ✓ 100% OF NON-TARGET SPECIES (${allAfter.length - 1} / ${allAfter.length - 1}) REMAIN UNTOUCHED.`);

  const postSnapshotPath = path.join(snapshotDir, `post_torosaurus_fix_snapshot_${Date.now()}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf-8');
  console.log(`  ✓ Post-migration snapshot written to: ${postSnapshotPath}\n`);

  // STEP 6: Synchronize Static JSON Archives
  console.log('Step 6: Synchronizing static JSON archives...');
  const prismaDir = path.join(__dirname, '..', 'prisma');
  const cretaceousPath = path.join(prismaDir, 'species_cretaceous.json');
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');

  if (fs.existsSync(cretaceousPath)) {
    const cretaceousData = JSON.parse(fs.readFileSync(cretaceousPath, 'utf-8'));
    const idx = cretaceousData.findIndex((s: any) => s.id === TARGET_ID);
    if (idx !== -1) {
      cretaceousData[idx] = {
        ...cretaceousData[idx],
        ...UPDATED_FIELDS,
        updatedAt: updatedRecord.updatedAt.toISOString()
      };
      fs.writeFileSync(cretaceousPath, JSON.stringify(cretaceousData, null, 2), 'utf-8');
      console.log(`  ✓ Synchronized ${cretaceousPath} (Species #${TARGET_ID})`);
    }
  }

  if (fs.existsSync(fullExportPath)) {
    const fullData = JSON.parse(fs.readFileSync(fullExportPath, 'utf-8'));
    const idx = fullData.findIndex((s: any) => s.id === TARGET_ID);
    if (idx !== -1) {
      fullData[idx] = {
        ...fullData[idx],
        ...UPDATED_FIELDS,
        updatedAt: updatedRecord.updatedAt.toISOString()
      };
      fs.writeFileSync(fullExportPath, JSON.stringify(fullData, null, 2), 'utf-8');
      console.log(`  ✓ Synchronized ${fullExportPath} (Species #${TARGET_ID})`);
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('🎉 AUDITED MIGRATION COMPLETE: TOROSAURUS FULLY RESTORED & VERIFIED');
  console.log('════════════════════════════════════════════════════════════════════════════\n');
}

main()
  .catch((err) => {
    console.error('\n❌ MIGRATION FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
