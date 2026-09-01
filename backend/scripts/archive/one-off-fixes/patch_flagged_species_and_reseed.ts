import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const REPLACEMENTS: Record<string, { url: string; credit: string; sourceUrl: string }> = {
  'Apatosaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Apatosaurus_louisae.png',
    credit: 'Connor Ashbridge (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Apatosaurus_louisae.png'
  },
  'Anurognathus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/16/AnurognathusDB_white_background.jpg',
    credit: 'Dmitry Bogdanov (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:AnurognathusDB_white_background.jpg'
  },
  'Archaeopteryx': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/00/202010_Archaeopteryx_lithographica.png',
    credit: 'DBCLS (CC BY 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:202010_Archaeopteryx_lithographica.png'
  },
  'Batrachotomus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Batrachotomus1DB.jpg',
    credit: 'Dmitry Bogdanov (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Batrachotomus1DB.jpg'
  },
  'Bellusaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Bellusaurus-v1.jpg',
    credit: 'Debivort (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bellusaurus-v1.jpg'
  },
  'Besanosaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Besanosaurus_Environment.png',
    credit: 'Alessio Ciaffi (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Besanosaurus_Environment.png'
  }
};

async function patchAll() {
  console.log('1. Patching JSON Seed Files...');
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
        for (const [genus, rep] of Object.entries(REPLACEMENTS)) {
          if (item.name && (item.name.toLowerCase() === genus.toLowerCase() || item.name.toLowerCase().startsWith(genus.toLowerCase()))) {
            item.reconstructionImageUrl = rep.url;
            item.media = [
              {
                url: rep.url,
                type: 'art',
                credit: rep.credit,
                sourceUrl: rep.sourceUrl
              }
            ];
            modified = true;
            console.log(`  ✓ Updated ${genus} in ${file}`);
          }
        }
      });

      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  }

  console.log('\n2. Direct Patching Live Supabase DB...');
  for (const [genus, rep] of Object.entries(REPLACEMENTS)) {
    const speciesList = await prisma.species.findMany({
      where: { name: { contains: genus } }
    });

    for (const s of speciesList) {
      const newMedia = [
        {
          url: rep.url,
          type: 'art',
          credit: rep.credit,
          sourceUrl: rep.sourceUrl
        }
      ];

      await prisma.species.update({
        where: { id: s.id },
        data: { media: JSON.stringify(newMedia) }
      });
      console.log(`  ✓ Patched DB record for ${s.name} (ID ${s.id})`);
    }
  }

  console.log('\nAll 6 target species patched cleanly!');
  await prisma.$disconnect();
}

patchAll().catch(err => {
  console.error(err);
  process.exit(1);
});
