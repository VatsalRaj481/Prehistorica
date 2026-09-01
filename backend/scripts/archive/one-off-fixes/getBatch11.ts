import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getBatch11() {
  const species = await prisma.species.findMany({
    skip: 100,
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

  console.log(`Fetched ${species.length} species records for Batch 11 (Positions 101 to 110).\n`);

  species.forEach((s, idx) => {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}
    console.log(`[Batch 11 - #${idx + 101}] ID: ${s.id} | Name: ${s.name} | SciName: ${s.scientificName}`);
    console.log(`  Media:`, JSON.stringify(mediaArr, null, 2));
  });
}

getBatch11()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
