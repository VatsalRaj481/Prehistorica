import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInitial() {
  const species = await prisma.species.findMany({
    take: 30,
    orderBy: { id: 'asc' }
  });

  species.forEach(s => {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}
    console.log(`ID ${s.id} | Name: ${s.name} | Media:`, JSON.stringify(mediaArr));
  });
}

checkInitial()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
