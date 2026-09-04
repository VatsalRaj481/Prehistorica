import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const s53 = await prisma.species.findUnique({
    where: { id: 53 },
    select: { id: true, name: true, interestingFacts: true }
  });

  console.log(`Species 53 (${s53?.name}):`);
  console.log(`Type of interestingFacts:`, typeof s53?.interestingFacts);
  console.log(`Array.isArray:`, Array.isArray(s53?.interestingFacts));
  console.log(`Raw value:`, JSON.stringify(s53?.interestingFacts));
}

main().catch(console.error).finally(() => prisma.$disconnect());
