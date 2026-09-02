import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

const CAMARASAURUS_MEDIA = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Camarasaurs1.jpg",
    type: "art",
    credit: "Dmitry Bogdanov (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Camarasaurs1.jpg"
  }
];

const BRACHIOSAURUS_FACTS = [
  "Front limbs were disproportionately longer than hind limbs, resulting in a steeply sloping giraffe-like thoracic posture unique among sauropods.",
  "Possessed a massive, robust humerus measuring over 2.04 meters (6.7 feet), which inspired its genus name 'Arm Lizard'.",
  "Nasal openings were positioned high on a distinct cranial crest above the eyes, originally thought to be a snorkel for aquatic living before terrestrial habits were proven.",
  "Chisel-like spatulate teeth with thick enamel allowed it to strip tough, high-canopy conifer branches, ginkgoes, and cycads unreachable by other Morrison Formation sauropods.",
  "Calculated neck posture was held at an upright ~60 to 70-degree angle, requiring an immense multi-chambered avian-style respiratory system with air sacs to lighten its cervical vertebrae."
];

async function main() {
  console.log('=== TARGETED UPDATE: CAMARASAURUS IMAGE & BRACHIOSAURUS FACTS ===');

  // 1. Fetch all species and record baseline hashes for all other species
  console.log('🔒 Step 1: Capturing baseline media hashes for all 502 species...');
  const allInitial = await prisma.species.findMany({
    select: { id: true, name: true, media: true },
    orderBy: { id: 'asc' }
  });

  const camRecord = allInitial.find(s => s.id === 168 || (s.name && s.name.toLowerCase() === 'camarasaurus'));
  const braRecord = allInitial.find(s => s.id === 19 || (s.name && s.name.toLowerCase().includes('brachiosaurus')));

  if (!camRecord) throw new Error('Camarasaurus (ID 168) not found in database!');
  if (!braRecord) throw new Error('Brachiosaurus (ID 19) not found in database!');

  const otherSpeciesHashes = new Map<number, string>();
  for (const s of allInitial) {
    if (s.id !== camRecord.id) {
      const hash = crypto.createHash('sha256').update(s.media || '').digest('hex');
      otherSpeciesHashes.set(s.id, hash);
    }
  }
  console.log(`Baseline recorded for ${otherSpeciesHashes.size} non-target species.`);

  // 2. Update Camarasaurus Image
  console.log(`\n🎨 Step 2: Updating Camarasaurus (ID #${camRecord.id}) image...`);
  await prisma.species.update({
    where: { id: camRecord.id },
    data: {
      media: JSON.stringify(CAMARASAURUS_MEDIA)
    }
  });
  console.log('✅ Camarasaurus media updated -> https://upload.wikimedia.org/wikipedia/commons/f/f6/Camarasaurs1.jpg');

  // 3. Update Brachiosaurus Scientific Facts
  console.log(`\n🔬 Step 3: Updating Brachiosaurus (ID #${braRecord.id}) scientific facts...`);
  await prisma.species.update({
    where: { id: braRecord.id },
    data: {
      interestingFacts: JSON.stringify(BRACHIOSAURUS_FACTS)
    }
  });
  console.log('✅ Brachiosaurus scientific key diagnostic facts updated.');

  // 4. Verify that NO OTHER species' media was touched
  console.log('\n🔍 Step 4: Verifying 0 alterations across all other 501 species...');
  const allPost = await prisma.species.findMany({
    select: { id: true, name: true, media: true },
    orderBy: { id: 'asc' }
  });

  let violations = 0;
  for (const s of allPost) {
    if (s.id !== camRecord.id) {
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

  // 5. Update seed JSON file
  console.log('\n📄 Step 5: Updating seed JSON file (species_jurassic.json)...');
  const jurassicPath = path.resolve(process.cwd(), 'prisma/species_jurassic.json');
  if (fs.existsSync(jurassicPath)) {
    const jurassicList = JSON.parse(fs.readFileSync(jurassicPath, 'utf8'));

    const camItem = jurassicList.find((s: any) => s.id === camRecord.id);
    if (camItem) {
      camItem.media = JSON.stringify(CAMARASAURUS_MEDIA);
    }

    const braItem = jurassicList.find((s: any) => s.id === braRecord.id);
    if (braItem) {
      braItem.interestingFacts = JSON.stringify(BRACHIOSAURUS_FACTS);
    }

    fs.writeFileSync(jurassicPath, JSON.stringify(jurassicList, null, 2), 'utf8');
    console.log('✅ species_jurassic.json synchronized for Camarasaurus & Brachiosaurus.');
  }

  console.log('\n🎉 ALL COMPLETED SUCCESSFULLY!');
}

main()
  .catch(err => {
    console.error('Update failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
