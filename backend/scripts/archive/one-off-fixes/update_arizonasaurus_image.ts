import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

const ARIZONASAURUS_MEDIA = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Arizonasaurus_babbiti.png",
    type: "art",
    credit: "Smokeybjb / Nobu Tamura (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Arizonasaurus_babbiti.png"
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Arizonasaurus_skeletal.png",
    type: "photo",
    credit: "Skeletal reconstruction diagram (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Arizonasaurus_skeletal.png"
  }
];

async function main() {
  console.log('=== TARGETED IMAGE UPDATE: ARIZONASAURUS (ID 120) ONLY ===');

  // 1. Fetch all species and record baseline hashes for all other species
  console.log('🔒 Step 1: Capturing baseline media hashes for all 502 species...');
  const allInitial = await prisma.species.findMany({
    select: { id: true, name: true, media: true },
    orderBy: { id: 'asc' }
  });

  const ariRecord = allInitial.find(s => s.id === 120);
  if (!ariRecord) {
    throw new Error('Arizonasaurus (ID 120) not found in database!');
  }

  const otherSpeciesHashes = new Map<number, string>();
  for (const s of allInitial) {
    if (s.id !== 120) {
      const hash = crypto.createHash('sha256').update(s.media || '').digest('hex');
      otherSpeciesHashes.set(s.id, hash);
    }
  }
  console.log(`Baseline recorded for ${otherSpeciesHashes.size} non-target species.`);

  // 2. Update Arizonasaurus
  console.log('\n🎨 Step 2: Updating Arizonasaurus (ID 120) image...');
  await prisma.species.update({
    where: { id: 120 },
    data: {
      media: JSON.stringify(ARIZONASAURUS_MEDIA)
    }
  });
  console.log('✅ Arizonasaurus media updated -> Primary: https://upload.wikimedia.org/wikipedia/commons/b/b8/Arizonasaurus_babbiti.png');

  // 3. Verify that NO OTHER species' media was touched
  console.log('\n🔍 Step 3: Verifying 0 alterations across all other 501 species...');
  const allPost = await prisma.species.findMany({
    select: { id: true, name: true, media: true },
    orderBy: { id: 'asc' }
  });

  let violations = 0;
  for (const s of allPost) {
    if (s.id !== 120) {
      const preHash = otherSpeciesHashes.get(s.id);
      const postHash = crypto.createHash('sha256').update(s.media || '').digest('hex');
      if (preHash !== postHash) {
        console.error(`❌ UNEXPECTED MEDIA CHANGE on species #${s.id} "${s.name}"!`);
        violations++;
      }
    }
  }

  if (violations > 0) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: ${violations} non-target species were modified!`);
  }

  console.log(`✅ 100% INTEGRITY VERIFIED: All other ${otherSpeciesHashes.size} species remain completely untouched.`);

  // 4. Update seed JSON file
  console.log('\n📄 Step 4: Updating seed JSON file (species_triassic.json)...');
  const triassicPath = path.resolve(process.cwd(), 'prisma/species_triassic.json');
  if (fs.existsSync(triassicPath)) {
    const triassicList = JSON.parse(fs.readFileSync(triassicPath, 'utf8'));
    const item = triassicList.find((s: any) => s.id === 120);
    if (item) {
      item.media = JSON.stringify(ARIZONASAURUS_MEDIA);
      fs.writeFileSync(triassicPath, JSON.stringify(triassicList, null, 2), 'utf8');
      console.log('✅ species_triassic.json updated for Arizonasaurus.');
    }
  }

  console.log('\n🎉 COMPLETED: Arizonasaurus image updated successfully with zero impact on any other species!');
}

main()
  .catch(err => {
    console.error('Update failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
