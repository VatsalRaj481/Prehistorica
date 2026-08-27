import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function run() {
  const url = 'https://upload.wikimedia.org/wikipedia/commons/5/5c/20191203_Anomalocaris_canadensis.png';
  const credit = 'DBCLS (CC BY 4.0)';
  const sourceUrl = 'https://commons.wikimedia.org/wiki/File:20191203_Anomalocaris_canadensis.png';

  const newMedia = [{ url, type: 'art', credit, sourceUrl }];

  await prisma.species.updateMany({
    where: { name: { contains: 'Anomalocaris' } },
    data: { media: JSON.stringify(newMedia) }
  });

  const filePath = path.join(process.cwd(), 'backend', 'prisma', 'species.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.forEach((s: any) => {
      if (s.name && s.name.includes('Anomalocaris')) {
        s.reconstructionImageUrl = url;
        s.media = newMedia;
      }
    });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  console.log('Anomalocaris patched cleanly in DB and species.json!');
  await prisma.$disconnect();
}

run().catch(console.error);
