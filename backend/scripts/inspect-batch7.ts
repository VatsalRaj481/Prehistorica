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
      interestingFacts: true,
    },
    orderBy: { id: 'asc' }
  });

  console.log(`Total taxa in Batch 7: ${dbRows.length}`);
  
  const sample = dbRows.slice(0, 15);
  for (const s of sample) {
    const f = parseFacts(s.interestingFacts);
    console.log(`ID ${s.id} (${s.name}, ${s.scientificName}, clade: ${s.clade}): ${f.length} facts`);
    console.log(`   Sample: "${f[0]}"`);
  }

  // Count fact lengths
  const lenDist: Record<number, number> = {};
  for (const s of dbRows) {
    const f = parseFacts(s.interestingFacts);
    lenDist[f.length] = (lenDist[f.length] || 0) + 1;
  }
  console.log("Batch 7 fact length distribution:", JSON.stringify(lenDist, null, 2));

  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'batch7-db-details.json'), JSON.stringify(dbRows, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
