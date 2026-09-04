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

  const parsedLengths: Record<number, number> = {};
  let totalWithGenericFacts = 0;

  for (const s of speciesList) {
    const facts = parseFacts(s.interestingFacts);
    const len = facts.length;
    parsedLengths[len] = (parsedLengths[len] || 0) + 1;

    // Check for generic placeholder facts
    const hasGeneric = facts.some(f => 
      f.includes("One of the apex organisms") || 
      f.includes("Displays unique morphological adaptations") ||
      f.includes("Fossils have contributed significantly")
    );
    if (hasGeneric) {
      totalWithGenericFacts++;
    }
  }

  console.log("Parsed fact length distribution across all 502 species:");
  console.log(JSON.stringify(parsedLengths, null, 2));
  console.log(`\nSpecies with generic placeholder template facts: ${totalWithGenericFacts}`);

  const batch1Sample = speciesList.slice(0, 5);
  console.log("\nSample Batch 1 (IDs 1-5):");
  for (const s of batch1Sample) {
    const facts = parseFacts(s.interestingFacts);
    console.log(`ID ${s.id} (${s.name}): ${facts.length} facts`);
    console.log(`  Facts:`, facts.slice(0, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
