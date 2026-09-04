import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const speciesList = await prisma.species.findMany({
    select: {
      id: true,
      name: true,
      interestingFacts: true,
    },
    orderBy: { id: 'asc' }
  });

  const factCounts: Record<number, number> = {};
  for (const s of speciesList) {
    const len = s.interestingFacts.length;
    factCounts[len] = (factCounts[len] || 0) + 1;
  }

  console.log("Fact count distribution across all 502 species:");
  console.log(JSON.stringify(factCounts, null, 2));

  console.log("\nSample of species 46-55:");
  for (const s of speciesList.slice(45, 55)) {
    console.log(`ID ${s.id} (${s.name}): ${s.interestingFacts.length} facts`);
    console.log("  Sample fact:", s.interestingFacts[0]);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
