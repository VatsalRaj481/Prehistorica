import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getBatch8() {
  const species = await prisma.species.findMany({
    skip: 70,
    take: 10,
    orderBy: { id: 'asc' },
    select: {
      id: true,
      name: true,
      scientificName: true,
      taxonomicStatus: true,
      media: true
    }
  });

  console.log(`Fetched ${species.length} species records for Batch 8.\n`);

  species.forEach((s, idx) => {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}
    console.log(`[Batch 8 - #${idx + 71}] ID: ${s.id} | Name: ${s.name} | SciName: ${s.scientificName}`);
    console.log(`  Media:`, JSON.stringify(mediaArr, null, 2));
  });
}

getBatch8()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
