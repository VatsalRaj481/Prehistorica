import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const batch2 = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'scripts', 'batch2-taxa.json'), 'utf-8')
  );
  const jsonIds = batch2.map((s: any) => s.id);
  console.log(`batch2-taxa.json has ${jsonIds.length} ids:`, jsonIds.join(', '));

  const dbRows = await prisma.species.findMany({
    where: { id: { in: jsonIds } },
    select: { id: true, name: true }
  });
  const dbIds = new Set(dbRows.map(r => r.id));

  const missingInDb = jsonIds.filter((id: number) => !dbIds.has(id));
  console.log("Missing in DB:", missingInDb);
}

main().catch(console.error).finally(() => prisma.$disconnect());
