import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getBatch12() {
  const species = await prisma.species.findMany({
    skip: 110,
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

  console.log(`Fetched ${species.length} species records for Batch 12 (Positions 111 to 120).\n`);

  species.forEach((s, idx) => {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}
    console.log(`[Batch 12 - #${idx + 111}] ID: ${s.id} | Name: ${s.name} | SciName: ${s.scientificName}`);
    console.log(`  Media:`, JSON.stringify(mediaArr, null, 2));
  });
}

getBatch12()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
