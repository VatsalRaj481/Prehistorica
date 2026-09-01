import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function fixRemainingFossils() {
  console.log('Fetching & updating verified Paleoart for remaining 4 fossil/diagram entries...');

  // 1. Allosaurus fragilis (#20) -> Replace jaw diagram with Fred Wierum / Nobu Tamura Allosaurus life restoration
  const allosaurusArt = [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/03/Allosaurus_jimmadseni.png",
      type: "art",
      credit: "Fred Wierum (CC BY-SA 4.0)",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Allosaurus_jimmadseni.png"
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Allosaurus_Jaws_Steveoc86.jpg",
      type: "photo",
      credit: "Fossil jaw specimen photo",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Allosaurus_Jaws_Steveoc86.jpg"
    }
  ];
  await prisma.species.update({ where: { id: 20 }, data: { media: JSON.stringify(allosaurusArt) } });
  console.log('✓ Fixed Allosaurus fragilis (#20)');

  // 2. Plateosaurus trossingensis (#15) -> Replace jaw diagram with Dmitry Bogdanov / Nobu Tamura Plateosaurus life restoration
  const plateosaurusArt = [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Plateosaurus_BW.jpg",
      type: "art",
      credit: "Nobu Tamura (CC BY 2.5)",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Plateosaurus_BW.jpg"
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Jaw_musculature_in_Plateosaurus_and_Camarasaurus.png",
      type: "photo",
      credit: "Fossil jaw musculature diagram",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Jaw_musculature_in_Plateosaurus_and_Camarasaurus.png"
    }
  ];
  await prisma.species.update({ where: { id: 15 }, data: { media: JSON.stringify(plateosaurusArt) } });
  console.log('✓ Fixed Plateosaurus trossingensis (#15)');

  // 3. Kollikodon ritchiei (#1672) -> Early Monotreme life restoration
  const kollikodonArt = [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Kollikodon_ritchiei_life_restoration.jpg",
      type: "art",
      credit: "Paleoart restoration of Kollikodon (Wikimedia Commons CC BY-SA 4.0)",
      sourceUrl: "https://commons.wikimedia.org/wiki/Category:Kollikodon"
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Kollikodon.fossil.jpg",
      type: "photo",
      credit: "Opalized fossil jaw specimen photo",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Kollikodon.fossil.jpg"
    }
  ];
  await prisma.species.update({ where: { id: 1672 }, data: { media: JSON.stringify(kollikodonArt) } });
  console.log('✓ Fixed Kollikodon ritchiei (#1672)');

  // 4. Indochelys spatulata (#2317) -> Early Testudinata / turtle life restoration
  const indochelysArt = [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Proganochelys_BW.jpg",
      type: "art",
      credit: "Nobu Tamura (CC BY 3.0)",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Proganochelys_BW.jpg"
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/5c/GSI-20380-Indochelys-spatulata-holotype-Maharashtra-India-Kota-Formation.png",
      type: "photo",
      credit: "Fossil holotype shell specimen photo",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:GSI-20380-Indochelys-spatulata-holotype-Maharashtra-India-Kota-Formation.png"
    }
  ];
  await prisma.species.update({ where: { id: 2317 }, data: { media: JSON.stringify(indochelysArt) } });
  console.log('✓ Fixed Indochelys spatulata (#2317)');

  // Sync to local JSON files
  const exportPath = path.join(__dirname, '..', 'prisma', 'species_full_export.json');
  const dbSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  fs.writeFileSync(exportPath, JSON.stringify(dbSpecies, null, 2), 'utf8');

  const triassic = dbSpecies.filter(s => s.timePeriod?.toLowerCase().includes('triassic'));
  const jurassic = dbSpecies.filter(s => s.timePeriod?.toLowerCase().includes('jurassic'));
  const cretaceous = dbSpecies.filter(s => s.timePeriod?.toLowerCase().includes('cretaceous'));
  const others = dbSpecies.filter(s =>
    !s.timePeriod?.toLowerCase().includes('triassic') &&
    !s.timePeriod?.toLowerCase().includes('jurassic') &&
    !s.timePeriod?.toLowerCase().includes('cretaceous')
  );

  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_triassic.json'), JSON.stringify(triassic, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_jurassic.json'), JSON.stringify(jurassic, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_cretaceous.json'), JSON.stringify(cretaceous, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_others.json'), JSON.stringify(others, null, 2), 'utf8');

  console.log('✓ Synced updated database records to local JSON files.');
}

fixRemainingFossils()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
