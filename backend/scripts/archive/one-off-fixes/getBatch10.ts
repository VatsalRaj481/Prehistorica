import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getBatch10() {
  const species = await prisma.species.findMany({
    skip: 90,
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

  console.log(`Fetched ${species.length} species records for Batch 10 (Positions 91 to 100).\n`);

  species.forEach((s, idx) => {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}
    console.log(`[Batch 10 - #${idx + 91}] ID: ${s.id} | Name: ${s.name} | SciName: ${s.scientificName}`);
    console.log(`  Media:`, JSON.stringify(mediaArr, null, 2));
  });
}

getBatch10()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
