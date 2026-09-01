import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const s = await prisma.species.findFirst({
    where: { name: { contains: 'Achelousaurus', mode: 'insensitive' } }
  });

  console.log('Species Name:', s?.name);
  console.log('Media JSON:', s?.media);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
