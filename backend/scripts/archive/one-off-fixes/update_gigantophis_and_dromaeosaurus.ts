import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

const GIGANTOPHIS_MEDIA = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Gigantophis_JWArtwork.png",
    type: "art",
    credit: "Joerim (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gigantophis_JWArtwork.png"
  }
];

const DROMAEOSAURUS_MEDIA = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/02/Dromaeosaurus_TD.png",
    type: "art",
    credit: "TotalDino (CC BY-SA 4.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Dromaeosaurus_TD.png"
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Dromaeosaurus_in_Canadian_Museum_of_Nature.jpg",
    type: "photo",
    credit: "Fossil skeletal specimen photo",
    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Dromaeosaurus_in_Canadian_Museum_of_Nature.jpg"
  }
];

async function main() {
  console.log('=== TARGETED UPDATE: GIGANTOPHIS & DROMAEOSAURUS IMAGES ONLY ===');

  // 1. Fetch all species and record baseline hashes for all other species
  console.log('🔒 Step 1: Capturing baseline media hashes for all 502 species...');
  const allInitial = await prisma.species.findMany({
    select: { id: true, name: true, media: true },
    orderBy: { id: 'asc' }
  });

  const gigRecord = allInitial.find(s => s.id === 1616 || (s.name && s.name.toLowerCase().includes('gigantophis')));
  const droRecord = allInitial.find(s => s.id === 460 || (s.name && s.name.toLowerCase() === 'dromaeosaurus'));

  if (!gigRecord) throw new Error('Gigantophis not found in database!');
  if (!droRecord) throw new Error('Dromaeosaurus not found in database!');

  console.log(`Found Gigantophis at ID #${gigRecord.id} ("${gigRecord.name}")`);
  console.log(`Found Dromaeosaurus at ID #${droRecord.id} ("${droRecord.name}")`);

  const otherSpeciesHashes = new Map<number, string>();
  for (const s of allInitial) {
    if (s.id !== gigRecord.id && s.id !== droRecord.id) {
      const hash = crypto.createHash('sha256').update(s.media || '').digest('hex');
      otherSpeciesHashes.set(s.id, hash);
    }
  }
  console.log(`Baseline recorded for ${otherSpeciesHashes.size} non-target species.`);

  // 2. Update Gigantophis
  console.log(`\n🎨 Step 2: Updating Gigantophis (ID #${gigRecord.id}) image...`);
  await prisma.species.update({
    where: { id: gigRecord.id },
    data: {
      media: JSON.stringify(GIGANTOPHIS_MEDIA)
    }
  });
  console.log('✅ Gigantophis media updated -> https://upload.wikimedia.org/wikipedia/commons/4/4b/Gigantophis_JWArtwork.png');

  // 3. Update Dromaeosaurus
  console.log(`\n🎨 Step 3: Updating Dromaeosaurus (ID #${droRecord.id}) image...`);
  await prisma.species.update({
    where: { id: droRecord.id },
    data: {
      media: JSON.stringify(DROMAEOSAURUS_MEDIA)
    }
  });
  console.log('✅ Dromaeosaurus media updated -> https://upload.wikimedia.org/wikipedia/commons/0/02/Dromaeosaurus_TD.png');

  // 4. Verify that NO OTHER species' media was touched
  console.log('\n🔍 Step 4: Verifying 0 alterations across all other 500 species...');
  const allPost = await prisma.species.findMany({
    select: { id: true, name: true, media: true },
    orderBy: { id: 'asc' }
  });

  let violations = 0;
  for (const s of allPost) {
    if (s.id !== gigRecord.id && s.id !== droRecord.id) {
      const preHash = otherSpeciesHashes.get(s.id);
      const postHash = crypto.createHash('sha256').update(s.media || '').digest('hex');
      if (preHash !== postHash) {
        console.error(`❌ UNEXPECTED MEDIA CHANGE on species #${s.id} "${s.name}"!`);
        violations++;
      }
    }
  }

  if (violations > 0) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: ${violations} non-target species had modified media!`);
  }

  console.log(`✅ 100% INTEGRITY VERIFIED: All other ${otherSpeciesHashes.size} species remain completely untouched.`);

  // 5. Update seed JSON files
  console.log('\n📄 Step 5: Updating seed JSON files...');
  const othersPath = path.resolve(process.cwd(), 'prisma/species_others.json');
  if (fs.existsSync(othersPath)) {
    const othersList = JSON.parse(fs.readFileSync(othersPath, 'utf8'));
    const item = othersList.find((s: any) => s.id === gigRecord.id || (s.name && s.name.toLowerCase().includes('gigantophis')));
    if (item) {
      item.media = JSON.stringify(GIGANTOPHIS_MEDIA);
      fs.writeFileSync(othersPath, JSON.stringify(othersList, null, 2), 'utf8');
      console.log('✅ species_others.json synchronized for Gigantophis.');
    }
  }

  const cretaceousPath = path.resolve(process.cwd(), 'prisma/species_cretaceous.json');
  if (fs.existsSync(cretaceousPath)) {
    const cretaceousList = JSON.parse(fs.readFileSync(cretaceousPath, 'utf8'));
    const item = cretaceousList.find((s: any) => s.id === droRecord.id || (s.name && s.name.toLowerCase() === 'dromaeosaurus'));
    if (item) {
      item.media = JSON.stringify(DROMAEOSAURUS_MEDIA);
      fs.writeFileSync(cretaceousPath, JSON.stringify(cretaceousList, null, 2), 'utf8');
      console.log('✅ species_cretaceous.json synchronized for Dromaeosaurus.');
    }
  }

  console.log('\n🎉 ALL COMPLETED SUCCESSFULLY!');
}

main()
  .catch(err => {
    console.error('Update failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
