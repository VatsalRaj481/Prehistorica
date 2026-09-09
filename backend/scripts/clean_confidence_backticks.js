const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('--- CLEANING BACKTICKS FROM SIZEESTIMATE IN DATABASE & ARCHIVES ---');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`Fetched ${allBefore.length} species.`);

  let updatedCount = 0;
  for (const s of allBefore) {
    if (s.sizeEstimate && s.sizeEstimate.includes('`')) {
      const cleaned = s.sizeEstimate.split('`').join('');
      await prisma.species.update({
        where: { id: s.id },
        data: { sizeEstimate: cleaned }
      });
      updatedCount++;
    }
  }
  console.log(`✓ Cleaned ${updatedCount} species in PostgreSQL.`);

  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });

  // Sync archives
  const prismaDir = path.join(__dirname, '..', 'prisma');
  function syncArchive(fileName) {
    const filePath = path.join(prismaDir, fileName);
    if (!fs.existsSync(filePath)) return;
    const archiveJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const updated = archiveJson.map(item => {
      const fresh = allAfter.find(s => s.id === item.id);
      if (fresh) {
        return { ...item, sizeEstimate: fresh.sizeEstimate, updatedAt: fresh.updatedAt };
      }
      return item;
    });
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
    console.log(`  ✓ Cleaned & synchronized ${fileName}`);
  }

  syncArchive('species_full_export.json');
  syncArchive('species_jurassic.json');
  syncArchive('species_cretaceous.json');
  syncArchive('species_triassic.json');
  syncArchive('species_others.json');

  console.log('--- CLEANUP COMPLETE ---');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma['$disconnect'](); });
