import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function dumpBatchTaxa(batchNum: number) {
  const jsonPath = path.join(process.cwd(), 'scripts', `batch${batchNum}-taxa.json`);
  const batchJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const ids = batchJson.map((s: any) => s.id);

  const dbRows = await prisma.species.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, scientificName: true },
    orderBy: { id: 'asc' }
  });

  const lines = dbRows.map(r => `  ${r.id}: "${r.name}" (${r.scientificName})`).join('\n');
  fs.writeFileSync(path.join(process.cwd(), 'scripts', `batch${batchNum}-actual-db-taxa.txt`), lines);
  console.log(`Batch ${batchNum}: Wrote ${dbRows.length} taxa.`);
}

async function main() {
  await dumpBatchTaxa(4);
  await dumpBatchTaxa(5);
  await dumpBatchTaxa(6);
}

main().catch(console.error).finally(() => prisma.$disconnect());
