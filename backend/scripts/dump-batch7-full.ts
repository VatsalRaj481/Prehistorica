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
  const jsonPath = path.join(process.cwd(), 'scripts', 'batch7-taxa.json');
  const batch7Json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const ids = batch7Json.map((s: any) => s.id);

  const dbRows = await prisma.species.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      scientificName: true,
      clade: true,
      timePeriod: true,
      diet: true,
      habitat: true,
      geographicRange: true,
      discoveryHistory: true,
      sizeNotes: true,
      interestingFacts: true,
    },
    orderBy: { id: 'asc' }
  });

  console.log(`Analyzing ${dbRows.length} taxa in Batch 7...`);

  // We will build a verified 4-fact array for every single taxon in Batch 7.
  // Each existing fact will be expanded into a complete, rigorous, peer-reviewed scientific statement,
  // and a 4th (and where appropriate 5th) specific scientific fact will be added covering:
  // biomechanics, histology, dentition, osteology, or taphonomy.

  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'batch7-full-metadata.json'), JSON.stringify(dbRows, null, 2));
  console.log("Wrote full metadata for Batch 7.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
