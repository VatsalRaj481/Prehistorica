import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const EUDIMORPHODON_MEDIA = [
  {
    url: "https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/139-Eudimorphodon.jpg",
    type: "art",
    credit: "Life reconstruction illustration",
    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Eudimorphodon.jpg"
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Triassic_fossils.png",
    type: "photo",
    credit: "Fossil skeletal specimen photo",
    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/3/30/Triassic_fossils.png"
  }
];

const DIMORPHODON_MEDIA = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/36/Dimorphodon2DB.jpg",
    type: "art",
    credit: "Dmitry Bogdanov (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Dimorphodon2DB.jpg"
  }
];

async function main() {
  console.log('=== FIXING DIMORPHODON (ID 205) AND RESTORING EUDIMORPHODON (ID 139) ===');

  // 1. Restore Eudimorphodon (ID 139)
  await prisma.species.update({
    where: { id: 139 },
    data: {
      media: JSON.stringify(EUDIMORPHODON_MEDIA)
    }
  });
  console.log('✅ Eudimorphodon (ID 139) media restored.');

  // 2. Set Dimorphodon (ID 205)
  await prisma.species.update({
    where: { id: 205 },
    data: {
      media: JSON.stringify(DIMORPHODON_MEDIA)
    }
  });
  console.log('✅ Dimorphodon (ID 205) media updated to https://upload.wikimedia.org/wikipedia/commons/3/36/Dimorphodon2DB.jpg');

  // 3. Update seed files
  const jurassicPath = path.resolve(process.cwd(), 'prisma/species_jurassic.json');
  if (fs.existsSync(jurassicPath)) {
    const jurassicList = JSON.parse(fs.readFileSync(jurassicPath, 'utf8'));
    const item = jurassicList.find((s: any) => s.id === 205);
    if (item) {
      item.media = JSON.stringify(DIMORPHODON_MEDIA);
      fs.writeFileSync(jurassicPath, JSON.stringify(jurassicList, null, 2), 'utf8');
      console.log('✅ species_jurassic.json updated for Dimorphodon (ID 205).');
    }
  }

  const triassicPath = path.resolve(process.cwd(), 'prisma/species_triassic.json');
  if (fs.existsSync(triassicPath)) {
    const triassicList = JSON.parse(fs.readFileSync(triassicPath, 'utf8'));
    const item = triassicList.find((s: any) => s.id === 139);
    if (item) {
      item.media = JSON.stringify(EUDIMORPHODON_MEDIA);
      fs.writeFileSync(triassicPath, JSON.stringify(triassicList, null, 2), 'utf8');
      console.log('✅ species_triassic.json verified for Eudimorphodon (ID 139).');
    }
  }

  console.log('\n🎉 ALL DONE!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
