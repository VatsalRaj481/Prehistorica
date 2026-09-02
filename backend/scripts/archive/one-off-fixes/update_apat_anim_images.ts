import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

const APATOSAURUS_MEDIA = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Apatosaurus_TD.png",
    type: "art",
    credit: "TotalDino (CC BY-SA 4.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Apatosaurus_TD.png"
  }
];

const ANIMANTARX_MEDIA = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/28/Animantarx_ramaljonesi.png",
    type: "art",
    credit: "Nobu Tamura (CC BY-SA 4.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Animantarx_ramaljonesi.png"
  }
];

async function main() {
  console.log('=== TARGETED IMAGE UPDATE: APATOSAURUS & ANIMANTARX ONLY ===');
  
  // 1. Fetch all species to record baseline media hashes for all other 500 species
  console.log('🔒 Step 1: Capturing baseline media hashes for all 502 species...');
  const allInitial = await prisma.species.findMany({
    select: { id: true, name: true, media: true },
    orderBy: { id: 'asc' }
  });

  const otherSpeciesHashes = new Map<number, string>();
  for (const s of allInitial) {
    if (s.id !== 166 && s.id !== 3177) {
      const hash = crypto.createHash('sha256').update(s.media || '').digest('hex');
      otherSpeciesHashes.set(s.id, hash);
    }
  }

  console.log(`Baseline recorded for ${otherSpeciesHashes.size} non-target species.`);

  // 2. Update Apatosaurus (ID 166)
  console.log('\n🎨 Step 2: Updating Apatosaurus (ID 166) image...');
  await prisma.species.update({
    where: { id: 166 },
    data: {
      media: JSON.stringify(APATOSAURUS_MEDIA)
    }
  });
  console.log('✅ Apatosaurus media updated -> https://upload.wikimedia.org/wikipedia/commons/9/9c/Apatosaurus_TD.png');

  // 3. Update Animantarx (ID 3177)
  console.log('\n🎨 Step 3: Updating Animantarx (ID 3177) image...');
  await prisma.species.update({
    where: { id: 3177 },
    data: {
      media: JSON.stringify(ANIMANTARX_MEDIA)
    }
  });
  console.log('✅ Animantarx media updated -> https://upload.wikimedia.org/wikipedia/commons/2/28/Animantarx_ramaljonesi.png');

  // 4. Verify that NO OTHER species' media was touched
  console.log('\n🔍 Step 4: Verifying 0 alterations across all other 500 species...');
  const allPost = await prisma.species.findMany({
    select: { id: true, name: true, media: true },
    orderBy: { id: 'asc' }
  });

  let violations = 0;
  for (const s of allPost) {
    if (s.id !== 166 && s.id !== 3177) {
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

  // 5. Update seed JSON files
  console.log('\n📄 Step 5: Updating seed JSON files (species_jurassic.json and species_cretaceous.json)...');
  
  const jurassicPath = path.resolve(process.cwd(), 'prisma/species_jurassic.json');
  if (fs.existsSync(jurassicPath)) {
    const jurassicList = JSON.parse(fs.readFileSync(jurassicPath, 'utf8'));
    const apatItem = jurassicList.find((s: any) => s.id === 166 || (s.name && s.name.includes('Apatosaurus')));
    if (apatItem) {
      apatItem.media = JSON.stringify(APATOSAURUS_MEDIA);
      fs.writeFileSync(jurassicPath, JSON.stringify(jurassicList, null, 2), 'utf8');
      console.log('✅ species_jurassic.json updated for Apatosaurus.');
    }
  }

  const cretaceousPath = path.resolve(process.cwd(), 'prisma/species_cretaceous.json');
  if (fs.existsSync(cretaceousPath)) {
    const cretaceousList = JSON.parse(fs.readFileSync(cretaceousPath, 'utf8'));
    const animItem = cretaceousList.find((s: any) => s.id === 3177 || (s.name && s.name.includes('Animantarx')));
    if (animItem) {
      animItem.media = JSON.stringify(ANIMANTARX_MEDIA);
      fs.writeFileSync(cretaceousPath, JSON.stringify(cretaceousList, null, 2), 'utf8');
      console.log('✅ species_cretaceous.json updated for Animantarx.');
    }
  }

  console.log('\n🎉 COMPLETED: Images for Apatosaurus and Animantarx updated successfully with zero impact on any other species!');
}

main()
  .catch(err => {
    console.error('Update failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
