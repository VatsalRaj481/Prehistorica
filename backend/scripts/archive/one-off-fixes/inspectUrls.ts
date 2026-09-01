import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function inspectUrls() {
  const all = await prisma.species.findMany({
    select: {
      id: true,
      name: true,
      scientificName: true,
      media: true
    }
  });

  console.log("=== DB MEDIA SAMPLES (First 30) ===");
  for (const s of all.slice(0, 30)) {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}
    console.log(`[#${s.id}] ${s.name}:`, JSON.stringify(mediaArr));
  }

  // Also check local JSON files in prisma directory
  const jsonFiles = ['species_triassic.json', 'species_jurassic.json', 'species_cretaceous.json', 'species_others.json', 'species.json', 'new_species_batch.json'];
  let jsonCount = 0;
  for (const file of jsonFiles) {
    const filePath = path.join(__dirname, '..', 'prisma', file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      jsonCount += data.length;
      console.log(`JSON File ${file}: ${data.length} species`);
      const sample = data.find((item: any) => item.media || item.reconstructionImageUrl || item.fossilImageUrl);
      if (sample) {
        console.log(`  Sample from ${file} [${sample.name}]:`, sample.media || sample.reconstructionImageUrl || 'NO_IMAGE');
      }
    }
  }
}

inspectUrls()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
