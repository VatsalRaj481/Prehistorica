const { PrismaClient } = require('@prisma/client');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const prisma = new PrismaClient();

function parseJson(val, fallback) {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

async function main() {
  const allSpecies = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true, clade: true, media: true },
    orderBy: { id: 'asc' }
  });

  let selfHostedCount = 0;
  let diagramCount = 0;
  let pendingCount = 0;
  let skippedExternalCount = 0;

  const skippedList = [];
  const selfHostedList = [];

  for (const s of allSpecies) {
    const media = parseJson(s.media, []);
    
    if (media.length === 0) {
      pendingCount++;
      continue;
    }

    const firstItem = media[0];
    if (firstItem.type === 'diagram') {
      diagramCount++;
    } else if (firstItem.url && firstItem.url.includes('supabase.co')) {
      selfHostedCount++;
      selfHostedList.push({ id: s.id, name: s.name, url: firstItem.url });
    } else {
      skippedExternalCount++;
      skippedList.push({ id: s.id, name: s.name, scientificName: s.scientificName, url: firstItem.url });
    }
  }

  console.log(`\n=== FINAL SUPABASE STORAGE INGESTION AUDIT ===`);
  console.log(`Total Database Roster: ${allSpecies.length} species`);
  console.log(`✅ Self-Hosted Supabase Images: ${selfHostedCount} (${((selfHostedCount / allSpecies.length) * 100).toFixed(1)}%)`);
  console.log(`📐 Diagram Fallback Species: ${diagramCount}`);
  console.log(`🎨 Pending Reconstruction State: ${pendingCount}`);
  console.log(`⚠️ External / Skipped Candidates: ${skippedExternalCount}`);

  if (skippedList.length > 0) {
    console.log(`\nSkipped / External Species List (${skippedList.length}):`);
    console.log(JSON.stringify(skippedList, null, 2));
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
});
