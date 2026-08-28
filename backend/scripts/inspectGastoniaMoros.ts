import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectGastoniaAndMoros() {
  const gastonia = await prisma.species.findFirst({
    where: { name: { contains: 'Gastonia', mode: 'insensitive' } }
  });

  const moros = await prisma.species.findFirst({
    where: { name: { contains: 'Moros', mode: 'insensitive' } }
  });

  console.log('--- Gastonia ---');
  console.log('ID:', gastonia?.id);
  console.log('Name:', gastonia?.name);
  console.log('Media:', gastonia?.media);

  console.log('\n--- Moros ---');
  console.log('ID:', moros?.id);
  console.log('Name:', moros?.name);
  console.log('Media:', moros?.media);
}

inspectGastoniaAndMoros()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
