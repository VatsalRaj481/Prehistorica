import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const SPECIFIC_FIXES: Record<string, { url: string; credit: string; sourceUrl: string }> = {
  'Achelousaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Achelousaurus_horneri.jpg',
    credit: 'Nobu Tamura (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Achelousaurus_horneri.jpg'
  },
  'Anomalocaris': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/20191203_Anomalocaris_canadensis.png',
    credit: 'DBCLS (CC BY 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:20191203_Anomalocaris_canadensis.png'
  },
  'Baculites': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Baculites_restoration.jpg',
    credit: 'Wikimedia Commons Contributor (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Baculites_restoration.jpg'
  },
  'Alamosaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Alamosaurus_TD.png',
    credit: 'TotalDino (CC BY 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Alamosaurus_TD.png'
  },
  'Ankylosaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Ankylosaurus_TD.png',
    credit: 'TotalDino (CC BY 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ankylosaurus_TD.png'
  }
};

async function patchUserFive() {
  console.log('1. Patching JSON seed files for the 5 target species...');

  const jsonFiles = [
    'species_cretaceous.json',
    'species_jurassic.json',
    'species_triassic.json',
    'new_species_batch.json',
    'species.json'
  ];

  for (const file of jsonFiles) {
    const filePath = path.join(process.cwd(), 'backend', 'prisma', file);
    if (!fs.existsSync(filePath)) continue;

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let modified = false;

      data.forEach((item: any) => {
        for (const [key, val] of Object.entries(SPECIFIC_FIXES)) {
          if (item.name && (item.name.toLowerCase() === key.toLowerCase() || item.name.toLowerCase().startsWith(key.toLowerCase()))) {
            item.reconstructionImageUrl = val.url;
            item.media = [
              {
                url: val.url,
                type: 'art',
                credit: val.credit,
                sourceUrl: val.sourceUrl
              }
            ];
            modified = true;
            console.log(`  ✓ Updated ${key} in ${file}`);
          }
        }
      });

      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.error(`Error in ${file}:`, e);
    }
  }

  console.log('\n2. Updating live DB records for the 5 target species...');
  for (const [key, val] of Object.entries(SPECIFIC_FIXES)) {
    const list = await prisma.species.findMany({
      where: { name: { contains: key } }
    });

    for (const s of list) {
      const newMedia = [
        {
          url: val.url,
          type: 'art',
          credit: val.credit,
          sourceUrl: val.sourceUrl
        }
      ];

      await prisma.species.update({
        where: { id: s.id },
        data: { media: JSON.stringify(newMedia) }
      });
      console.log(`  ✓ Patched DB record for ${s.name} (ID ${s.id})`);
    }
  }

  await prisma.$disconnect();
}

patchUserFive().catch(console.error);
