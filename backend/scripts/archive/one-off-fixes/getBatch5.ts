import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getBatch5() {
  const species = await prisma.species.findMany({
    skip: 40,
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

  for (const s of species) {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}

    console.log(`=== ID: ${s.id} | Name: ${s.name} | SciName: ${s.scientificName} ===`);
    console.log(`Media:`, JSON.stringify(mediaArr, null, 2));
  }
}

getBatch5()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
