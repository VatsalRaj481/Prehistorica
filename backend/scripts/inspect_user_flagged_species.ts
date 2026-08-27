import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FLAGGED_NAMES = [
  'Achelousaurus', 'Anomalocaris', 'Baculites', 'Alamosaurus', 'Ankylosaurus'
];

async function check() {
  console.log('Inspecting user flagged species in DB:');
  for (const name of FLAGGED_NAMES) {
    const list = await prisma.species.findMany({
      where: { name: { contains: name } }
    });
    for (const s of list) {
      const media = typeof s.media === 'string' ? JSON.parse(s.media) : s.media;
      console.log(`\n[ID ${s.id}] ${s.name}:`);
      console.log(`  Primary URL: ${media?.[0]?.url}`);
      console.log(`  Type: ${media?.[0]?.type}`);
      console.log(`  Credit: ${media?.[0]?.credit}`);
    }
  }

  console.log('\n--- Checking total species breakdown ---');
  const all = await prisma.species.findMany({ select: { id: true, name: true, media: true } });
  
  let artCount = 0;
  let nonArtCount = 0;

  all.forEach(s => {
    let media: any[] = [];
    try {
      media = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}
    const primary = media[0];
    const url = (primary?.url || '').toLowerCase();

    // Check if image is an explicit life restoration or paleoart
    const isArt = url.includes('restoration') || url.includes('reconstruction') || url.includes('life') || url.includes('paleoart') || url.includes('tamura') || url.includes('durbed') || url.includes('bogdanov') || url.includes('art') || url.includes('illustration') || url.includes('render');

    if (isArt) artCount++;
    else nonArtCount++;
  });

  console.log(`Total DB Species: ${all.length}`);
  console.log(`Confirmed Life Restoration/Paleoart: ${artCount}`);
  console.log(`Others (Diagrams/Photos/Skeletals/Generic): ${nonArtCount}`);

  await prisma.$disconnect();
}

check().catch(console.error);
