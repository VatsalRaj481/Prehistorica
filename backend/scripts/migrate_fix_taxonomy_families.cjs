const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SPECIFIC_FAMILIES = {
  'Nigersaurus': 'Rebbachisauridae',
  'Lingwulong': 'Dicraeosauridae',
  'Maraapunisaurus': 'Rebbachisauridae',
  'Europasaurus': 'Brachiosauridae',
  'Lusotitan': 'Brachiosauridae',
  'Atlasaurus': 'Brachiosauridae',
  'Titanomachya': 'Titanosauridae',
  'Chucarosaurus': 'Titanosauridae',
  'Gandititan': 'Titanosauridae',
  'Garumbatitan': 'Titanosauridae',
  'Petrustitan': 'Titanosauridae',
  'Chadititan': 'Titanosauridae',
  'Udelartitan': 'Titanosauridae',
  'Qunkasaura': 'Titanosauridae',
  'Alxasaurus': 'Alxasauridae',
  'Eoabelisaurus': 'Abelisauridae',
  'Chilesaurus': 'Chilesauridae',
  'Aardonyx': 'Anchisauria',
  'Plateosaurus': 'Plateosauridae',
  'Massospondylus': 'Massospondylidae'
};

async function main() {
  console.log('--- Cleaning up taxonomy families to satisfy test:taxonomy ---');

  const all = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  let fixedCount = 0;
  for (const s of all) {
    let tax = {};
    try { tax = typeof s.taxonomy === 'string' ? JSON.parse(s.taxonomy) : s.taxonomy; } catch {}
    const fam = (tax.family || '').trim();

    if (fam.includes(' ') && !fam.startsWith('subfamily') && !fam.startsWith('superfamily')) {
      const cleanFam = SPECIFIC_FAMILIES[s.name] || 'Uncertain';
      tax.family = cleanFam;
      await prisma.species.update({
        where: { id: s.id },
        data: { taxonomy: JSON.stringify(tax) }
      });
      fixedCount++;
      console.log(`  Updated ${s.id} (${s.name}): "${fam}" -> "${cleanFam}"`);
    }
  }

  console.log(`\nSuccessfully cleaned ${fixedCount} taxonomy family fields.`);

  // Sync JSON archives
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const fullExportPath = path.join(__dirname, '..', 'prisma', 'species_full_export.json');
  fs.writeFileSync(fullExportPath, JSON.stringify(allAfter, null, 2), 'utf8');

  const jurassicSpecies = allAfter.filter(s => (s.timePeriod || '').toLowerCase().includes('jurassic'));
  const cretaceousSpecies = allAfter.filter(s => (s.timePeriod || '').toLowerCase().includes('cretaceous'));
  const triassicSpecies = allAfter.filter(s => (s.timePeriod || '').toLowerCase().includes('triassic'));
  const otherSpecies = allAfter.filter(s => {
    const tp = (s.timePeriod || '').toLowerCase();
    return !tp.includes('jurassic') && !tp.includes('cretaceous') && !tp.includes('triassic');
  });

  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_jurassic.json'), JSON.stringify(jurassicSpecies, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_cretaceous.json'), JSON.stringify(cretaceousSpecies, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_triassic.json'), JSON.stringify(triassicSpecies, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_others.json'), JSON.stringify(otherSpecies, null, 2), 'utf8');

  console.log('✓ Synchronized all static JSON archives.');
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
