import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const all = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const exportPath = path.join(__dirname, '../prisma/species_full_export.json');
  fs.writeFileSync(exportPath, JSON.stringify(all, null, 2), 'utf8');
  console.log(`✅ Exported ${all.length} species records to ${exportPath}`);
}

main().finally(() => prisma.$disconnect());
