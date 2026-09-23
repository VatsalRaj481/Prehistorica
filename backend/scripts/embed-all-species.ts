import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { generateEmbedding } from '../src/services/gemini.js';
import { buildSpeciesEmbeddingText } from '../src/services/vectorStore.js';

const prisma = new PrismaClient();

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function embedAllSpecies() {
  console.log('🦖 Resuming Prehistorica species vector indexing...');

  const allSpecies = await prisma.species.findMany({
    select: {
      id: true,
      name: true,
      scientificName: true,
      clade: true,
      diet: true,
      dietDetails: true,
      habitat: true,
      timePeriod: true,
      epoch: true,
      myaStart: true,
      myaEnd: true,
      geographicRange: true,
      discoveryHistory: true,
      interestingFacts: true,
      sizeNotes: true
    },
    orderBy: { id: 'asc' }
  });

  const existingEmbeds: any = await prisma.$queryRawUnsafe(`SELECT "speciesId" FROM "SpeciesEmbedding";`);
  const existingSet = new Set(existingEmbeds.map((r: any) => r.speciesId));

  const pending = allSpecies.filter(s => !existingSet.has(s.id));
  console.log(`Current indexed: ${existingSet.size} / ${allSpecies.length}. Remaining to index: ${pending.length}`);

  if (pending.length === 0) {
    console.log('✅ All species are already 100% indexed in pgvector!');
    await prisma.$disconnect();
    return;
  }

  let successCount = 0;

  for (let i = 0; i < pending.length; i++) {
    const s = pending[i];
    let retries = 3;
    let success = false;

    while (retries > 0 && !success) {
      try {
        const text = buildSpeciesEmbeddingText(s);
        const vector = await generateEmbedding(text, 768);

        await prisma.$executeRawUnsafe(
          `INSERT INTO "SpeciesEmbedding" ("speciesId", "content", "embedding")
           VALUES ($1, $2, $3::vector)
           ON CONFLICT ("speciesId") DO UPDATE 
           SET "content" = EXCLUDED."content", "embedding" = EXCLUDED."embedding";`,
          s.id,
          text,
          `[${vector.join(',')}]`
        );

        success = true;
        successCount++;
        process.stdout.write(`\r[INDEXING] ${existingSet.size + successCount} / ${allSpecies.length} (${Math.round(((existingSet.size + successCount) / allSpecies.length) * 100)}%) - Last: ${s.name}   `);
        
        // 750ms interval = ~80 requests per minute, comfortably under the 100 RPM quota
        await delay(750);
      } catch (err: any) {
        if (err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('429')) {
          console.log(`\n⏳ Quota pause hit. Waiting 35s before retrying ${s.name}...`);
          await delay(35000);
          retries--;
        } else {
          console.error(`\n❌ Error embedding #${s.id} ${s.name}:`, err.message || err);
          break;
        }
      }
    }
  }

  console.log(`\n✅ Completed indexing session! Total indexed: ${existingSet.size + successCount} species.`);
  await prisma.$disconnect();
}

embedAllSpecies();
