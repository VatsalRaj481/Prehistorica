const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const TARGETS = [
  {
    id: 5215,
    name: 'Sahaliyania',
    era: 'cretaceous',
    sourceUuid: '3df190f3-72ef-4cc9-9321-973e63e9825f',
    credit: 'Will Toosey',
    license: 'Creative Commons Attribution 4.0 International',
    taxon: 'Lambeosaurinae (Representative: Lambeosaurus lambei)',
    taxonMatch: 'generic approximation, not species-specific',
    alreadyUploaded: true
  },
  {
    id: 461,
    name: 'Troodon',
    era: 'cretaceous',
    sourceUuid: 'b50c893f-8a76-4cd2-9e03-4514fc1cbc80',
    vectorUrl: 'https://images.phylopic.org/images/b50c893f-8a76-4cd2-9e03-4514fc1cbc80/vector.svg',
    credit: 'Raven Amos',
    license: 'Public Domain Mark 1.0',
    taxon: 'Troodon formosus',
    taxonMatch: 'species-specific',
    alreadyUploaded: false
  },
  {
    id: 152,
    name: 'Compsognathus',
    era: 'jurassic',
    sourceUuid: '44fdc1c0-7028-4c45-a890-6a31cd94c8e5',
    vectorUrl: 'https://images.phylopic.org/images/44fdc1c0-7028-4c45-a890-6a31cd94c8e5/vector.svg',
    credit: 'Jagged Fang Designs',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    taxon: 'Compsognathus longipes',
    taxonMatch: 'species-specific',
    alreadyUploaded: false
  },
  {
    id: 169,
    name: 'Giraffatitan',
    era: 'jurassic',
    sourceUuid: 'e4129f4f-942e-4c5e-9b81-07542c7b3deb',
    vectorUrl: 'https://images.phylopic.org/images/e4129f4f-942e-4c5e-9b81-07542c7b3deb/vector.svg',
    credit: 'Mathew Wedel',
    license: 'Creative Commons Attribution 3.0 Unported',
    taxon: 'Giraffatitan brancai',
    taxonMatch: 'species-specific',
    alreadyUploaded: false
  },
  {
    id: 1729,
    name: 'Mapusaurus roseae',
    era: 'cretaceous',
    sourceUuid: 'cf75413c-6985-400e-9389-81d7007e5d91',
    credit: 'Tasman Dixon',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    taxon: 'Carcharodontosauridae (Representative: Giganotosaurus carolinii)',
    taxonMatch: 'generic approximation, not species-specific',
    alreadyUploaded: true
  },
  {
    id: 5200,
    name: 'Meraxes',
    era: 'cretaceous',
    sourceUuid: 'cf75413c-6985-400e-9389-81d7007e5d91',
    credit: 'Tasman Dixon',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    taxon: 'Carcharodontosauridae (Representative: Giganotosaurus carolinii)',
    taxonMatch: 'generic approximation, not species-specific',
    alreadyUploaded: true
  },
  {
    id: 3171,
    name: 'Suchodus durobrivensis',
    era: 'jurassic',
    sourceUuid: 'bb59dc20-fb59-422c-b0df-610a48a20f14',
    vectorUrl: 'https://images.phylopic.org/images/bb59dc20-fb59-422c-b0df-610a48a20f14/vector.svg',
    credit: 'Dmitry Bogdanov (vectorized by T. Michael Keesey)',
    license: 'Creative Commons Attribution 3.0 Unported',
    taxon: 'Metriorhynchidae (Representative: Plesiosuchus manselii)',
    taxonMatch: 'generic approximation, not species-specific',
    alreadyUploaded: false
  }
];

async function uploadSvg(fileName, buffer) {
  if (!SUPABASE_KEY) {
    throw new Error('Supabase key missing in backend/.env');
  }
  const endpoint = `${SUPABASE_URL}/storage/v1/object/species-silhouettes/${fileName}`;
  const res = await fetch(endpoint, {
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
    const txt = await res.text();
    throw new Error(`Upload failed for ${fileName} (${res.status}): ${txt}`);
  }

  const pubUrl = `${SUPABASE_URL}/storage/v1/object/public/species-silhouettes/${fileName}`;
  const head = await fetch(pubUrl, { method: 'HEAD' });
  if (!head.ok) {
    throw new Error(`Head check failed for ${pubUrl}: ${head.status}`);
  }
  return pubUrl;
}

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('AUDITED MIGRATION: UPGRADE 7 NON-FULL-BODY SILHOUETTES TO FULL LATERAL PROFILES');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration snapshot
  console.log('Step 1: Capturing pre-migration database snapshot...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Current database records: ${allBefore.length}`);
  if (allBefore.length !== 601) {
    throw new Error(`Expected exactly 601 species in database, found ${allBefore.length}!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  if (!fs.existsSync(snapshotDir)) fs.mkdirSync(snapshotDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preSnapshotPath = path.join(snapshotDir, `pre_fix_fullbody_silhouettes_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Process & verify SVGs
  console.log('Step 2: Processing and mirroring vector silhouettes...');
  const newPayloads = new Map();

  for (const t of TARGETS) {
    const fileName = `${t.sourceUuid}.svg`;
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/species-silhouettes/${fileName}`;
    const sourcePage = `https://www.phylopic.org/images/${t.sourceUuid}`;

    if (!t.alreadyUploaded) {
      console.log(`  Downloading ${t.name} vector: ${t.vectorUrl}...`);
      const fetchRes = await fetch(t.vectorUrl, { headers: { 'User-Agent': 'Prehistorica-Curator/2.0' } });
      if (!fetchRes.ok) throw new Error(`Download failed: ${fetchRes.status}`);
      const svgText = await fetchRes.text();
      const buffer = Buffer.from(svgText, 'utf8');

      // Check aspect ratio
      const vb = svgText.match(/viewBox=["']([^"']+)["']/i);
      if (vb) {
        const parts = vb[1].trim().split(/\s+/).map(Number);
        const aspect = parts[2] / parts[3];
        console.log(`    Aspect ratio: ${aspect.toFixed(2)}:1 (viewBox: ${vb[1]})`);
        if (aspect < 1.7) {
          throw new Error(`Silhouette aspect ratio ${aspect} is suspiciously low!`);
        }
      }

      await uploadSvg(fileName, buffer);
    } else {
      console.log(`  Verifying existing Supabase asset for ${t.name}: ${publicUrl}...`);
      const head = await fetch(publicUrl, { method: 'HEAD' });
      if (!head.ok) throw new Error(`Existing asset not found: ${publicUrl} (${head.status})`);
      console.log(`    ✓ Verified public asset exists.`);
    }

    const payload = JSON.stringify({
      url: publicUrl,
      sourceUrl: sourcePage,
      license: t.license,
      credit: t.credit,
      taxon: t.taxon,
      taxonMatch: t.taxonMatch
    });
    newPayloads.set(t.id, payload);
  }

  // STEP 3: Update database records
  console.log('\nStep 3: Updating database records for target species...');
  for (const t of TARGETS) {
    const payload = newPayloads.get(t.id);
    await prisma.species.update({
      where: { id: t.id },
      data: { comparisonSilhouette: payload }
    });
    console.log(`  ✓ Updated #${t.id} (${t.name})`);
  }

  // STEP 4: Post-migration verification
  console.log('\nStep 4: Capturing post-migration snapshot and validating invariants...');
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const postSnapshotPath = path.join(snapshotDir, `post_fix_fullbody_silhouettes_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== 601) {
    throw new Error(`Expected exactly 601 species after update, found ${allAfter.length}!`);
  }

  const targetIds = new Set(TARGETS.map(t => t.id));
  let nonTargetIdentical = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    if (targetIds.has(before.id)) {
      const diffs = [];
      for (const k of Object.keys(before)) {
        if (k === 'updatedAt' || k === 'comparisonSilhouette') continue;
        if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) diffs.push(k);
      }
      if (diffs.length > 0) {
        unexpectedDiffs.push(`Target ID ${before.id} unexpected field changes: ${diffs.join(', ')}`);
      }
    } else {
      const diffs = [];
      for (const k of Object.keys(before)) {
        if (k === 'updatedAt') continue;
        if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) diffs.push(k);
      }
      if (diffs.length > 0) {
        unexpectedDiffs.push(`NON-TARGET ID ${before.id} (${before.name}) modified: ${diffs.join(', ')}`);
      } else {
        nonTargetIdentical++;
      }
    }
  }

  console.log(`\nVerification Results:`);
  console.log(`  - Target records updated: ${TARGETS.length} / ${TARGETS.length}`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetIdentical} / 594 (100.0%)`);

  if (unexpectedDiffs.length > 0) {
    console.error('\n❌ CRITICAL: Regression detected:');
    unexpectedDiffs.forEach(d => console.error('    ✕ ' + d));
    throw new Error('Safeguard violated! Aborting.');
  }
  console.log('  ✅ 100% SAFEGUARD VERIFIED: Zero regressions detected across all non-target records.\n');

  // STEP 5: Synchronize static JSON archives
  console.log('Step 5: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // 1. species_full_export.json
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  if (fs.existsSync(fullExportPath)) {
    const full = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
    let count = 0;
    const updatedFull = full.map(item => {
      if (targetIds.has(item.id)) {
        count++;
        return { ...item, comparisonSilhouette: newPayloads.get(item.id) };
      }
      return item;
    });
    fs.writeFileSync(fullExportPath, JSON.stringify(updatedFull, null, 2), 'utf8');
    console.log(`  ✓ Updated species_full_export.json (${count} records updated)`);
  }

  // 2. Era files
  const eraFiles = ['species_jurassic.json', 'species_cretaceous.json', 'species_triassic.json', 'species_others.json'];
  for (const ef of eraFiles) {
    const efPath = path.join(prismaDir, ef);
    if (!fs.existsSync(efPath)) continue;
    const eraJson = JSON.parse(fs.readFileSync(efPath, 'utf8'));
    let eCount = 0;
    const updatedEra = eraJson.map(item => {
      if (targetIds.has(item.id)) {
        eCount++;
        return { ...item, comparisonSilhouette: newPayloads.get(item.id) };
      }
      return item;
    });
    fs.writeFileSync(efPath, JSON.stringify(updatedEra, null, 2), 'utf8');
    if (eCount > 0) {
      console.log(`  ✓ Updated ${ef} (${eCount} records updated)`);
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ ALL 7 SILHOUETTES MIGRATED TO FULL-BODY LATERAL VECTORS SUCCESSFULLY!');
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
