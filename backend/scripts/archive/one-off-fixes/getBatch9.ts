import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getBatch9() {
  const species = await prisma.species.findMany({
    skip: 80,
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

  console.log(`Fetched ${species.length} species records for Batch 9 (Positions 81 to 90).\n`);

  species.forEach((s, idx) => {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}
    console.log(`[Batch 9 - #${idx + 81}] ID: ${s.id} | Name: ${s.name} | SciName: ${s.scientificName}`);
    console.log(`  Media:`, JSON.stringify(mediaArr, null, 2));
  });
}

getBatch9()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
