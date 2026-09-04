import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const fileContent = fs.readFileSync(path.join(process.cwd(), 'scripts', 'enrich-batch2.ts'), 'utf-8');
  // Match all numbers followed by colon in BATCH2_FACTS
  const matches = [...fileContent.matchAll(/^\s*(\d+):\s*\[/gm)].map(m => Number(m[1]));
  console.log(`Found ${matches.length} keys in BATCH2_FACTS:`, matches);

  const batch2Json = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'batch2-taxa.json'), 'utf-8'));
  const batch2Ids = batch2Json.map((s: any) => s.id);

  const missingFromFacts = batch2Ids.filter((id: number) => !matches.includes(id));
  console.log("Missing from BATCH2_FACTS:", missingFromFacts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
