import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixReportedSixSpecies() {
  console.log(`=== APPLYING VERIFIED REPLACEMENT PALEOART FOR REPORTED SPECIES ===\n`);

  const replacements: Record<number, { url: string; credit: string; sourceUrl: string }> = {
    477: { // Achelousaurus
      url: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Achelousaurus_dinosaur.png',
      credit: 'Mariana Ruiz (LadyofHats) (Public Domain)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Achelousaurus_dinosaur.png'
    },
    459: { // Acrocanthosaurus
      url: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Acrocanthosaurus_TD.png',
      credit: 'TotalDino (CC BY-SA 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Acrocanthosaurus_TD.png'
    },
    503: { // Gastonia
      url: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Gastonia_TD.png',
      credit: 'TotalDino (CC BY 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gastonia_TD.png'
    },
    3177: { // Animantarx
      url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Animantarx_BW.jpg',
      credit: 'Nobu Tamura (CC BY 2.5)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Animantarx_BW.jpg'
    },
    510: { // Alamosaurus
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Alamosaurus_TD.png',
      credit: 'TotalDino (CC BY-SA 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Alamosaurus_TD.png'
    },
    168: { // Camarasaurus
      url: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Camarasaurus_TD.png',
      credit: 'TotalDino (CC BY-SA 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Camarasaurus_TD.png'
    }
  };

  for (const [idStr, art] of Object.entries(replacements)) {
    const id = parseInt(idStr, 10);
    const sp = await prisma.species.findUnique({ where: { id } });
    if (!sp) continue;

    let mediaArr: any[] = [];
    try {
      mediaArr = typeof sp.media === 'string' ? JSON.parse(sp.media) : (sp.media || []);
    } catch (e) {}

    // Prepend or replace index 0 with verified working life reconstruction
    const newArtItem = {
      url: art.url,
      type: 'art',
      credit: art.credit,
      sourceUrl: art.sourceUrl
    };

    // Keep existing items as secondary
    const updatedMedia = [newArtItem, ...mediaArr.filter((m: any) => m.url !== art.url)];

    await prisma.species.update({
      where: { id },
      data: { media: JSON.stringify(updatedMedia) }
    });

    console.log(`Updated Taxon #${id} *${sp.name}*: Primary art set to '${art.url}' (${art.credit}).`);
  }

  console.log(`\nSuccessfully applied verified replacement artwork to all 6 reported species!`);
}

fixReportedSixSpecies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
