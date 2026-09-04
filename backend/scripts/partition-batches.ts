import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const allNeeding = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'scripts', 'all-needing-facts.json'), 'utf-8')
  );

  // Split into 6 sequential batches
  // Batch 2: IDs 46 - 150
  // Batch 3: IDs 151 - 250
  // Batch 4: IDs 251 - 475
  // Batch 5: IDs 476 - 550
  // Batch 6: IDs 551 - 950
  // Batch 7: IDs 951 - 3200

  const batch2 = allNeeding.filter((s: any) => s.id >= 46 && s.id <= 150);
  const batch3 = allNeeding.filter((s: any) => s.id >= 151 && s.id <= 250);
  const batch4 = allNeeding.filter((s: any) => s.id >= 251 && s.id <= 475);
  const batch5 = allNeeding.filter((s: any) => s.id >= 476 && s.id <= 550);
  const batch6 = allNeeding.filter((s: any) => s.id >= 551 && s.id <= 950);
  const batch7 = allNeeding.filter((s: any) => s.id >= 951);

  console.log(`Batch 2 (46-150): ${batch2.length} taxa`);
  console.log(`Batch 3 (151-250): ${batch3.length} taxa`);
  console.log(`Batch 4 (251-475): ${batch4.length} taxa`);
  console.log(`Batch 5 (476-550): ${batch5.length} taxa`);
  console.log(`Batch 6 (551-950): ${batch6.length} taxa`);
  console.log(`Batch 7 (951+): ${batch7.length} taxa`);
  console.log(`Total across batches: ${batch2.length + batch3.length + batch4.length + batch5.length + batch6.length + batch7.length}`);

  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'batch2-taxa.json'), JSON.stringify(batch2, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'batch3-taxa.json'), JSON.stringify(batch3, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'batch4-taxa.json'), JSON.stringify(batch4, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'batch5-taxa.json'), JSON.stringify(batch5, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'batch6-taxa.json'), JSON.stringify(batch6, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'batch7-taxa.json'), JSON.stringify(batch7, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
