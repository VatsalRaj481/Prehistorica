import './src/dns-init.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const speciesList = await prisma.species.findMany({
    where: {
      id: { gte: 46, lte: 150 }
    },
    select: {
      id: true,
      name: true,
      commonName: true,
      interestingFacts: true,
    },
    orderBy: { id: 'asc' }
  });

  console.log(`Found ${speciesList.length} species in range 46-150:`);
  const needing = speciesList.filter(s => s.interestingFacts.length < 4);
  const good = speciesList.filter(s => s.interestingFacts.length >= 4);

  console.log(`Needing facts (<4): ${needing.length}`);
  console.log(`Already good (>=4): ${good.length}`);
  for (const s of needing) {
    console.log(`ID ${s.id}: ${s.name} (${s.interestingFacts.length} facts)`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
