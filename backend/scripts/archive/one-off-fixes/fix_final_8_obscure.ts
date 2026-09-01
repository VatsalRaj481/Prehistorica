import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const REMAINING_8: Record<string, { url: string; credit: string; sourceUrl: string }> = {
  'Coloradisaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Plateosaurus_Scale.svg',
    credit: 'Conty (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Plateosaurus_Scale.svg'
  },
  'Phytosaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Parasuchus_DB.jpg',
    credit: 'Dmitry Bogdanov (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Parasuchus_DB.jpg'
  },
  'Harpactognathus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Rhamphorhynchus_muensteri_restoration.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rhamphorhynchus_muensteri_restoration.png'
  },
  'Jaklapallisaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Unaysaurus_tolentinoi.png',
    credit: 'Nobu Tamura (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Unaysaurus_tolentinoi.png'
  },
  'Machaeroprosopus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Redondasaurus_gregorii.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Redondasaurus_gregorii.png'
  },
  'Jianchangnathus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Scaphognathus_crassirostris.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Scaphognathus_crassirostris.png'
  },
  'Fenghuangopterus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Wukongopterus_linglongtaensis.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wukongopterus_linglongtaensis.png'
  },
  'Kotasaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Barapasaurus_tagorei.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Barapasaurus_tagorei.png'
  }
};

async function fixFinal8() {
  console.log('Fixing final 8 obscure species...');

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
        for (const [key, val] of Object.entries(REMAINING_8)) {
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

  for (const [key, val] of Object.entries(REMAINING_8)) {
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

fixFinal8().catch(console.error);
