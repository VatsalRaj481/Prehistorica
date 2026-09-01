import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBatch5Media() {
  const ids = [52, 55, 60, 61]; // Thrinaxodon, Peteinosaurus, Eodromaeus, Nyasasaurus
  for (const id of ids) {
    const s = await prisma.species.findUnique({
      where: { id },
      select: { id: true, name: true, media: true }
    });
    console.log(`=== ID: ${id} | Name: ${s?.name} ===`);
    console.log(s?.media);
  }
}

checkBatch5Media()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
