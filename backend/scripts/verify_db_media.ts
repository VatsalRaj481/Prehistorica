import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const names = ['Apatosaurus', 'Anurognathus', 'Archaeopteryx', 'Batrachotomus', 'Bellusaurus', 'Besanosaurus'];
  for (const n of names) {
    const list = await prisma.species.findMany({ where: { name: { contains: n } } });
    for (const s of list) {
      const media = typeof s.media === 'string' ? JSON.parse(s.media) : s.media;
      console.log(`${s.name} => ${media[0]?.url}`);
    }
  }
  await prisma.$disconnect();
}

check();
