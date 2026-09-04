import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const speciesList = await prisma.species.findMany({
    select: {
      id: true,
      name: true,
      scientificName: true,
      interestingFacts: true,
      timePeriod: true,
      diet: true,
      clade: true,
    },
    orderBy: { id: 'asc' }
  });

  const needing = speciesList.filter(s => s.interestingFacts.length < 4);
  const good = speciesList.filter(s => s.interestingFacts.length >= 4);

  console.log(`Total species: ${speciesList.length}`);
  console.log(`Already good (>= 4 facts): ${good.length}`);
  console.log(`Needing facts (< 4 facts): ${needing.length}`);

  const outPath = path.join(process.cwd(), 'scripts', 'all-needing-facts.json');
  fs.writeFileSync(outPath, JSON.stringify(needing, null, 2), 'utf-8');
  console.log(`Wrote needing species list to ${outPath}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
