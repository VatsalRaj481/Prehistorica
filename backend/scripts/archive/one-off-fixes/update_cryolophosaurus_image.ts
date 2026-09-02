import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

const CRYOLOPHOSAURUS_MEDIA = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/55/CryolophosaurusDB.jpg",
    type: "art",
    credit: "Dmitry Bogdanov (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:CryolophosaurusDB.jpg"
  }
];

async function main() {
  console.log('=== TARGETED IMAGE UPDATE: CRYOLOPHOSAURUS ONLY ===');

  // 1. Fetch all species and record baseline hashes for all other species
  console.log('🔒 Step 1: Capturing baseline media hashes for all 502 species...');
  const allInitial = await prisma.species.findMany({
    select: { id: true, name: true, media: true },
    orderBy: { id: 'asc' }
  });

  const cryoRecord = allInitial.find(s => s.id === 148 || s.name.toLowerCase().includes('cryolophosaurus'));
  if (!cryoRecord) {
    throw new Error('Cryolophosaurus record not found in database!');
  }

  const cryoId = cryoRecord.id;
  console.log(`Found Cryolophosaurus at ID #${cryoId} ("${cryoRecord.name}")`);

  const otherSpeciesHashes = new Map<number, string>();
  for (const s of allInitial) {
    if (s.id !== cryoId) {
      const hash = crypto.createHash('sha256').update(s.media || '').digest('hex');
      otherSpeciesHashes.set(s.id, hash);
    }
  }
  console.log(`Baseline recorded for ${otherSpeciesHashes.size} non-target species.`);

  // 2. Update Cryolophosaurus
  console.log(`\n🎨 Step 2: Updating Cryolophosaurus (ID #${cryoId}) image...`);
  await prisma.species.update({
    where: { id: cryoId },
    data: {
      media: JSON.stringify(CRYOLOPHOSAURUS_MEDIA)
    }
  });
  console.log(`✅ Cryolophosaurus media updated -> https://upload.wikimedia.org/wikipedia/commons/5/55/CryolophosaurusDB.jpg`);

  // 3. Verify that NO OTHER species' media was touched
  console.log('\n🔍 Step 3: Verifying 0 alterations across all other 501 species...');
  const allPost = await prisma.species.findMany({
    select: { id: true, name: true, media: true },
    orderBy: { id: 'asc' }
  });

  let violations = 0;
  for (const s of allPost) {
    if (s.id !== cryoId) {
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
  console.log('\n📄 Step 4: Updating seed JSON file (species_jurassic.json)...');
  const jurassicPath = path.resolve(process.cwd(), 'prisma/species_jurassic.json');
  if (fs.existsSync(jurassicPath)) {
    const jurassicList = JSON.parse(fs.readFileSync(jurassicPath, 'utf8'));
    const item = jurassicList.find((s: any) => s.id === cryoId || (s.name && s.name.toLowerCase().includes('cryolophosaurus')));
    if (item) {
      item.media = JSON.stringify(CRYOLOPHOSAURUS_MEDIA);
      fs.writeFileSync(jurassicPath, JSON.stringify(jurassicList, null, 2), 'utf8');
      console.log('✅ species_jurassic.json updated for Cryolophosaurus.');
    }
  }

  console.log('\n🎉 COMPLETED: Cryolophosaurus image updated successfully with zero impact on any other species!');
}

main()
  .catch(err => {
    console.error('Update failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
