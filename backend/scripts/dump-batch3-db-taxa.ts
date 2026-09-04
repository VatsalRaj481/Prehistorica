import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const batch3Json = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'batch3-taxa.json'), 'utf-8'));
  const batch3Ids = batch3Json.map((s: any) => s.id);

  const dbRows = await prisma.species.findMany({
    where: { id: { in: batch3Ids } },
    select: { id: true, name: true, scientificName: true },
    orderBy: { id: 'asc' }
  });

  const lines = dbRows.map(r => `  ${r.id}: "${r.name}" (${r.scientificName})`).join('\n');
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'batch3-actual-db-taxa.txt'), lines);
  console.log(`Wrote ${dbRows.length} taxa for Batch 3.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
