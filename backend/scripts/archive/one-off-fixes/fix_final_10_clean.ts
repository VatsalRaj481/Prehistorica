import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const REPLACEMENTS: Record<string, { url: string; credit: string; sourceUrl: string }> = {
  'Tyrannosaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Tyrannosaurus_BW.jpg',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tyrannosaurus_BW.jpg'
  },
  'Smilodon': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Smilodon_fatalis_Sergiodlarosa.jpg',
    credit: 'Sergio de la Rosa (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Smilodon_fatalis_Sergiodlarosa.jpg'
  },
  'Isanosaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Isanosaurus_attavipachi_NT.jpg',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Isanosaurus_attavipachi_NT.jpg'
  },
  'Pterodactylus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Pterodactylus_antiquus_DB.jpg',
    credit: 'Dmitry Bogdanov (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pterodactylus_antiquus_DB.jpg'
  },
  'Gastornis': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Gastornis_giganteus_DB.jpg',
    credit: 'Dmitry Bogdanov (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gastornis_giganteus_DB.jpg'
  },
  'Mammuthus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Mammuthus_primigenius_DB.jpg',
    credit: 'Dmitry Bogdanov (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mammuthus_primigenius_DB.jpg'
  },
  'Hylonomus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Hylonomus_lyelli_DB.jpg',
    credit: 'Dmitry Bogdanov (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hylonomus_lyelli_DB.jpg'
  },
  'Ichthyostega': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Ichthyostega_BW.jpg',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ichthyostega_BW.jpg'
  },
  'Dunkleosteus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Dunkleosteus_terrelli_life_restoration.png',
    credit: 'Wikimedia Commons Contributor (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dunkleosteus_terrelli_life_restoration.png'
  }
};

async function run() {
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

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let modified = false;

    data.forEach((item: any) => {
      for (const [key, val] of Object.entries(REPLACEMENTS)) {
        if (item.name && item.name.toLowerCase().includes(key.toLowerCase())) {
          item.reconstructionImageUrl = val.url;
          item.media = [{ url: val.url, type: 'art', credit: val.credit, sourceUrl: val.sourceUrl }];
          modified = true;
          console.log(`Updated ${item.name} in ${file}`);
        }
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
  }

  for (const [key, val] of Object.entries(REPLACEMENTS)) {
    const list = await prisma.species.findMany({ where: { name: { contains: key } } });
    for (const s of list) {
      await prisma.species.update({
        where: { id: s.id },
        data: {
          media: JSON.stringify([{ url: val.url, type: 'art', credit: val.credit, sourceUrl: val.sourceUrl }])
        }
      });
      console.log(`Updated DB record for ${s.name} (ID ${s.id})`);
    }
  }

  await prisma.$disconnect();
}

run().catch(console.error);
