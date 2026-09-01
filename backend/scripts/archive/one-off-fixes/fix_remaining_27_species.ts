import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const TARGET_IDS = [
  37, 114, 75, 125, 111, 99, 116, 120, 126, 220, 224, 229, 1624, 100, 109,
  3016, 571, 222, 223, 3008, 466, 3045, 6, 4, 34, 38, 473
];

const KNOWN_PALEOWARE: Record<string, { url: string; credit: string; sourceUrl: string }> = {
  'Smilodon fatalis': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Smilodon_fatalis_Sergiodlarosa.jpg',
    credit: 'Sergio de la Rosa (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Smilodon_fatalis_Sergiodlarosa.jpg'
  },
  'Carcharodontosaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Carcharodontosaurus.png',
    credit: 'Nobu Tamura (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Carcharodontosaurus.png'
  },
  'Styracosaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Styracosaurus_01_%28update%29.png',
    credit: 'Nobu Tamura (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Styracosaurus_01_(update).png'
  },
  'Iguanodon': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Iguanodon_bernissartensis_%28Davide_Bonadonna%29.png',
    credit: 'Davide Bonadonna (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Iguanodon_bernissartensis_(Davide_Bonadonna).png'
  },
  'Dunkleosteus terrelli': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/68/202010_Dunkleosteus_telleri.png',
    credit: 'DBCLS (CC BY 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:202010_Dunkleosteus_telleri.png'
  },
  'Mammuthus primigenius': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Mammuthus_primigenius.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mammuthus_primigenius.png'
  },
  'Kosmoceratops': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Kosmoceratops_richardsoni.png',
    credit: 'Lukas Panzarin (CC BY 2.5)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kosmoceratops_richardsoni.png'
  },
  'Liopleurodon': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Liopleurodon_ferox.png',
    credit: 'Dmitry Bogdanov (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Liopleurodon_ferox.png'
  },
  'Rhomaleosaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Rhomaleosaurus_cramptoni.jpg',
    credit: 'Dmitry Bogdanov (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rhomaleosaurus_cramptoni.jpg'
  },
  'Ichthyostega stensioei': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Ichthyostega_BW.jpg',
    credit: 'Dmitry Bogdanov (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ichthyostega_BW.jpg'
  },
  'Gastornis parisiensis': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Gastornis_giganteus.png',
    credit: 'Dmitry Bogdanov (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gastornis_giganteus.png'
  },
  'Effigia': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Effigia_okeeffeae.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Effigia_okeeffeae.png'
  },
  'Arizonasaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Arizonasaurus_babbitti.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Arizonasaurus_babbitti.png'
  },
  'Dinocephalosaurus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Dinocephalosaurus_orientalis.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dinocephalosaurus_orientalis.png'
  },
  'Macrocnemus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Macrocnemus_bassanii.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Macrocnemus_bassanii.png'
  },
  'Saltoposuchus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Saltoposuchus_connectens.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Saltoposuchus_connectens.png'
  },
  'Sphenosuchus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Sphenosuchus_acutus.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sphenosuchus_acutus.png'
  },
  'Gracilisuchus': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Gracilisuchus_stipanicicorum.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gracilisuchus_stipanicicorum.png'
  },
  'Hylonomus lyelli': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Hylonomus_lyelli.png',
    credit: 'Nobu Tamura (CC BY-SA 3.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hylonomus_lyelli.png'
  }
};

async function fixAll() {
  console.log('Patching 27 species across JSON seed files & DB...');

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
        for (const [key, val] of Object.entries(KNOWN_PALEOWARE)) {
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

  for (const [key, val] of Object.entries(KNOWN_PALEOWARE)) {
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

fixAll().catch(console.error);
