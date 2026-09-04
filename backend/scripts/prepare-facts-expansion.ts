import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseJson(val: any, fallback: any) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

async function run() {
  const allSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  
  const zeroFacts = allSpecies.filter(s => parseJson(s.interestingFacts, []).length === 0);
  console.log(`=== ${zeroFacts.length} Species with 0 Facts ===`);
  zeroFacts.forEach(s => console.log(`[#${s.id}] ${s.name} (${s.scientificName}) - Clade: ${s.clade}`));

  const twoFacts = allSpecies.filter(s => parseJson(s.interestingFacts, []).length === 2);
  console.log(`\n=== ${twoFacts.length} Species with 2 Facts ===`);
  twoFacts.forEach(s => console.log(`[#${s.id}] ${s.name} (${s.scientificName}) - Clade: ${s.clade}`));

  const fourOrFive = allSpecies.filter(s => parseJson(s.interestingFacts, []).length >= 4);
  console.log(`\n=== ${fourOrFive.length} Species with 4 or 5 Facts (PROTECTED / DO NOT TOUCH) ===`);
  fourOrFive.forEach(s => console.log(`[#${s.id}] ${s.name} (${s.scientificName}) -> ${parseJson(s.interestingFacts, []).length} facts`));
}

run().then(() => prisma.$disconnect()).catch(err => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
