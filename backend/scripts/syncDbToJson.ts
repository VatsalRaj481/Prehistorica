import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function syncToJson() {
  console.log('Syncing all 502 species from Supabase database to local JSON files...');

  const dbSpecies = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  console.log(`Fetched ${dbSpecies.length} species from Supabase DB.`);

  // Write full species export backup
  const exportPath = path.join(__dirname, '..', 'prisma', 'species_full_export.json');
  fs.writeFileSync(exportPath, JSON.stringify(dbSpecies, null, 2), 'utf8');
  console.log(`✓ Saved complete export to ${exportPath}`);

  // Sync to individual era files if needed
  const triassic = dbSpecies.filter(s => s.timePeriod?.toLowerCase().includes('triassic'));
  const jurassic = dbSpecies.filter(s => s.timePeriod?.toLowerCase().includes('jurassic'));
  const cretaceous = dbSpecies.filter(s => s.timePeriod?.toLowerCase().includes('cretaceous'));
  const others = dbSpecies.filter(s =>
    !s.timePeriod?.toLowerCase().includes('triassic') &&
    !s.timePeriod?.toLowerCase().includes('jurassic') &&
    !s.timePeriod?.toLowerCase().includes('cretaceous')
  );

  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_triassic.json'), JSON.stringify(triassic, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_jurassic.json'), JSON.stringify(jurassic, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_cretaceous.json'), JSON.stringify(cretaceous, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_others.json'), JSON.stringify(others, null, 2), 'utf8');

  console.log(`✓ Synced species_triassic.json (${triassic.length} species)`);
  console.log(`✓ Synced species_jurassic.json (${jurassic.length} species)`);
  console.log(`✓ Synced species_cretaceous.json (${cretaceous.length} species)`);
  console.log(`✓ Synced species_others.json (${others.length} species)`);
}

syncToJson()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
