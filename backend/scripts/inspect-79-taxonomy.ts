import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function inspect79() {
  const reportPath = path.join(__dirname, '../reports/phylopic_coverage_report.json');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const noneIds = report.noCoverage.map((s: any) => s.speciesId);

  const species = await prisma.species.findMany({
    where: { id: { in: noneIds } },
    select: {
      id: true,
      name: true,
      scientificName: true,
      clade: true,
      taxonomy: true
    },
    orderBy: { id: 'asc' }
  });

  console.log(`Found ${species.length} species in DB.`);
  species.forEach(s => {
    let tax: any = {};
    try { tax = typeof s.taxonomy === 'string' ? JSON.parse(s.taxonomy) : (s.taxonomy || {}); } catch (e) {}
    console.log(`[${s.id}] "${s.name}" | sci: "${s.scientificName}" | clade: ${s.clade} | order: "${tax.order || ''}" | suborder: "${tax.suborder || ''}" | family: "${tax.family || ''}" | genus: "${tax.genus || ''}"`);
  });
}

inspect79().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
