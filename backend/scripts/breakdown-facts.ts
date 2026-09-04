import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseFacts(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [raw];
    }
  }
  return [];
}

async function main() {
  const speciesList = await prisma.species.findMany({
    select: {
      id: true,
      name: true,
      interestingFacts: true,
    },
    orderBy: { id: 'asc' }
  });

  const genericSpecies: any[] = [];
  const validSpecies: any[] = [];

  for (const s of speciesList) {
    const facts = parseFacts(s.interestingFacts);
    const hasGeneric = facts.some(f => 
      f.includes("One of the apex organisms") || 
      f.includes("Displays unique morphological adaptations") ||
      f.includes("Fossils have contributed significantly") ||
      f.includes("Known for its distinct physical features")
    );

    if (hasGeneric) {
      genericSpecies.push({ id: s.id, name: s.name, facts });
    } else {
      validSpecies.push({ id: s.id, name: s.name, factCount: facts.length });
    }
  }

  console.log(`Species with generic filler: ${genericSpecies.length}`);
  console.log(`Species with genuine scientific facts: ${validSpecies.length}`);
  console.log(`Generic species IDs:`, genericSpecies.map(s => `${s.id}: ${s.name}`).join(', '));

  const validFactCounts: Record<number, number> = {};
  for (const s of validSpecies) {
    validFactCounts[s.factCount] = (validFactCounts[s.factCount] || 0) + 1;
  }
  console.log(`\nFact counts among genuine species:`, JSON.stringify(validFactCounts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
