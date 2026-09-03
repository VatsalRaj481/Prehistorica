import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const marine = await prisma.species.findMany({
    where: { clade: 'Marine_Reptile' },
    select: { id: true, name: true, scientificName: true, taxonomy: true, comparisonSilhouette: true }
  });
  console.log('Total Marine_Reptile species:', marine.length);
  for (const s of marine) {
    const sil = s.comparisonSilhouette ? JSON.parse(s.comparisonSilhouette) : null;
    const tax = s.taxonomy ? JSON.parse(s.taxonomy) : {};
    console.log(`[${s.id}] ${s.name} (${s.scientificName}) | Order: ${tax.order || 'N/A'} | Family: ${tax.family || 'N/A'} | Taxon in Sil: ${sil?.taxon} | UUID: ${sil?.url?.match(/species-silhouettes\/([a-f0-9-]+)\./)?.[1]}`);
  }
}

run().then(() => process.exit(0)).catch(console.error);
