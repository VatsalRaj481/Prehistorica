import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

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
      scientificName: true,
      clade: true,
      timePeriod: true,
      diet: true,
      habitat: true,
      geographicRange: true,
      interestingFacts: true,
    },
    orderBy: { id: 'asc' }
  });

  const needing: any[] = [];
  const protectedSpecies: any[] = [];

  for (const s of speciesList) {
    const facts = parseFacts(s.interestingFacts);
    const hasGeneric = facts.some(f => 
      f.includes("One of the apex organisms") || 
      f.includes("Displays unique morphological adaptations") ||
      f.includes("Fossils have contributed significantly") ||
      f.includes("Known for its distinct physical features")
    );

    if (facts.length < 4 || hasGeneric) {
      needing.push({
        id: s.id,
        name: s.name,
        scientificName: s.scientificName,
        clade: s.clade,
        timePeriod: s.timePeriod,
        diet: s.diet,
        habitat: s.habitat,
        geographicRange: s.geographicRange,
        currentFactCount: facts.length,
        hasGeneric,
        currentFacts: facts
      });
    } else {
      protectedSpecies.push({
        id: s.id,
        name: s.name,
        factCount: facts.length
      });
    }
  }

  console.log(`Total species: ${speciesList.length}`);
  console.log(`Needing facts: ${needing.length}`);
  console.log(`Protected (already 4-5 verified facts): ${protectedSpecies.length}`);

  const outPath = path.join(process.cwd(), 'scripts', 'all-needing-facts.json');
  fs.writeFileSync(outPath, JSON.stringify(needing, null, 2), 'utf-8');
  console.log(`Saved needing species to ${outPath}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
