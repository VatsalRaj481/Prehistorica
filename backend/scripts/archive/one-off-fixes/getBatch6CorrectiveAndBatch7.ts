import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectAuditData() {
  console.log('=== BATCH 6 RECONCILIATION (Offset 50 to 60) ===');
  const batch6 = await prisma.species.findMany({
    skip: 50,
    take: 10,
    orderBy: { id: 'asc' },
    select: { id: true, name: true, scientificName: true, media: true }
  });

  batch6.forEach((s, idx) => {
    console.log(`[Batch 6 - #${idx + 51}] ID: ${s.id} | Name: ${s.name} | SciName: ${s.scientificName}`);
  });

  console.log('\n=== BATCH 7 TAXA (Offset 60 to 70) ===');
  const batch7 = await prisma.species.findMany({
    skip: 60,
    take: 10,
    orderBy: { id: 'asc' },
    select: { id: true, name: true, scientificName: true, media: true }
  });

  batch7.forEach((s, idx) => {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}
    console.log(`\n[Batch 7 - #${idx + 61}] ID: ${s.id} | Name: ${s.name} | SciName: ${s.scientificName}`);
    console.log(`  Media:`, JSON.stringify(mediaArr, null, 2));
  });
}

inspectAuditData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
