import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function fixAchelousaurusAndAudit() {
  console.log('Fixing Achelousaurus and auditing fossil vs life restoration images...');

  // 1. Specific fix for Achelousaurus horneri (#477)
  // Replaces the fossil frill photo with Nobu Tamura's actual Achelousaurus life restoration painting
  const achelousaurusLifeArt = [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Achelousaurus_BW.jpg",
      type: "art",
      credit: "Nobu Tamura (CC BY-SA 4.0)",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Achelousaurus_BW.jpg"
    },
    {
      url: "https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/477-Achelousaurus.jpg",
      type: "photo",
      credit: "Fossil skull frill specimen photo",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Achelousaurus_horneri.jpg"
    }
  ];

  await prisma.species.update({
    where: { id: 477 },
    data: { media: JSON.stringify(achelousaurusLifeArt) }
  });
  console.log('✓ Fixed Achelousaurus (#477) -> Replaced fossil frill photo with Nobu Tamura life restoration artwork!');

  // Now audit all 502 species to find any other species where sourceUrl or image content points to fossil/skull/skeletal diagrams
  const allSpecies = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true, media: true }
  });

  const fossilMisclassified: any[] = [];

  for (const s of allSpecies) {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}

    const artItem = mediaArr.find((m: any) => m.type === 'art');
    if (!artItem) continue;

    const sourceUrl = (artItem.sourceUrl || '').toLowerCase();
    const credit = (artItem.credit || '').toLowerCase();

    // Check if sourceUrl or credit contains fossil/frill/skull/element keywords
    const fossilKeywords = ['frill', 'elements', 'skull', 'skeletal', 'fossil', 'holotype', 'paratype', 'specimen', 'bones', 'jaw', 'teeth'];
    const isFossilSource = fossilKeywords.some(k => sourceUrl.includes(k) || credit.includes(k));

    if (isFossilSource && !sourceUrl.includes('life_restoration') && !sourceUrl.includes('bw.jpg')) {
      fossilMisclassified.push({ id: s.id, name: s.name, scientificName: s.scientificName, sourceUrl });
    }
  }

  console.log(`\nFound ${fossilMisclassified.length} potential misclassified fossil images.`);
  fossilMisclassified.forEach(item => {
    console.log(`  [#${item.id}] ${item.name} (${item.scientificName}) -> ${item.sourceUrl}`);
  });

  // Let's also sync to local JSON files
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

fixAchelousaurusAndAudit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
