import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSample() {
  const species = await prisma.species.findMany({
    select: {
      id: true,
      name: true,
      scientificName: true,
      clade: true,
      taxonomy: true
    },
    take: 20
  });

  console.log('Sample species count:', species.length);
  species.forEach(s => {
    let tax: any = {};
    try { tax = typeof s.taxonomy === 'string' ? JSON.parse(s.taxonomy) : (s.taxonomy || {}); } catch (e) {}
    console.log(`[${s.id}] ${s.name} | sci: "${s.scientificName}" | clade: ${s.clade} | genus: "${tax.genus || ''}" | family: "${tax.family || ''}"`);
  });
}

checkSample().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
