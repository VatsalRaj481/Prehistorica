import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function spotCheckMediaArrays() {
  const checkIds = [7, 32, 41, 125]; // Spot-check Arthropleura (#7), Mosasaurus (#32), Doedicurus (#41), Macrocnemus (#125)

  console.log(`=== SPOT-CHECKING MEDIA ARRAY POSITIONS FOR SPECIES IDs: ${checkIds.join(', ')} ===\n`);

  for (const id of checkIds) {
    const s = await prisma.species.findUnique({ where: { id } });
    if (!s) continue;

    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}

    console.log(`Taxon #${s.id} *${s.name}*:`);
    console.log(`  Total Media Items: ${mediaArr.length}`);
    mediaArr.forEach((item: any, idx: number) => {
      console.log(`  [Index ${idx}] type: '${item.type}' | url: ${item.url} | sourceUrl: ${item.sourceUrl || 'N/A'}`);
    });
    console.log('');
  }
}

spotCheckMediaArrays()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
