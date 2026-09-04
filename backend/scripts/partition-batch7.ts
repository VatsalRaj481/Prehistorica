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
  const meta = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'scripts', 'batch7-full-metadata.json'), 'utf-8')
  );

  const sub1 = meta.slice(0, 50);
  const sub2 = meta.slice(50, 100);
  const sub3 = meta.slice(100, 150);
  const sub4 = meta.slice(150);

  console.log(`Sub-batch 7A: ${sub1.length} taxa (IDs ${sub1[0].id} to ${sub1[sub1.length - 1].id})`);
  console.log(`Sub-batch 7B: ${sub2.length} taxa (IDs ${sub2[0].id} to ${sub2[sub2.length - 1].id})`);
  console.log(`Sub-batch 7C: ${sub3.length} taxa (IDs ${sub3[0].id} to ${sub3[sub3.length - 1].id})`);
  console.log(`Sub-batch 7D: ${sub4.length} taxa (IDs ${sub4[0].id} to ${sub4[sub4.length - 1].id})`);

  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'batch7a-meta.json'), JSON.stringify(sub1, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'batch7b-meta.json'), JSON.stringify(sub2, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'batch7c-meta.json'), JSON.stringify(sub3, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'batch7d-meta.json'), JSON.stringify(sub4, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
