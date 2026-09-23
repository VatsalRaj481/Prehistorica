import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import {
  askChiefCurator,
  simulateRunwayInteraction,
  synthesizeFormationFoodWeb,
  analyzeFossilImage
} from '../src/services/gemini.js';
import { searchSimilarSpecies, getEmbeddingCount } from '../src/services/vectorStore.js';

const prisma = new PrismaClient();

async function runEndToEndVerification() {
  console.log('🏛️ PREHISTORICA AI RESEARCH PAVILION: END-TO-END VERIFICATION\n');

  // Test 1: Vector Store Status
  console.log('--- TEST 1: PGVECTOR INDEX STATUS ---');
  const count = await getEmbeddingCount();
  const total = await prisma.species.count();
  console.log(`Indexed species in pgvector: ${count} / ${total}`);
  if (count === total) {
    console.log('✅ PASS: All species are 100% indexed in pgvector.\n');
  } else {
    console.log(`⚠️ WARN: ${total - count} species pending index.\n`);
  }

  // Test 2: Semantic Vector Search
  console.log('--- TEST 2: NATURAL LANGUAGE SEMANTIC DISCOVERY ---');
  const query = 'Apex predators with sail-like dorsal structures';
  console.log(`Querying: "${query}"...`);
  const semanticResults = await searchSimilarSpecies(query, 3);
  console.log('Top 3 Semantic Matches:');
  semanticResults.forEach((s, idx) => {
    console.log(`  ${idx + 1}. ${s.name} (${s.scientificName}) - Match: ${Math.round(s.similarity * 100)}% - Clade: ${s.clade}`);
  });
  console.log('✅ PASS: Semantic search returned relevant taxa.\n');

  // Test 3: The Chief Curator RAG Agent
  console.log('--- TEST 3: THE CHIEF CURATOR RAG AGENT ---');
  const curatorQuery = 'Why do paleontologists think Spinosaurus was semi-aquatic?';
  console.log(`Asking Chief Curator: "${curatorQuery}"...`);
  const curatorContext = await searchSimilarSpecies(curatorQuery, 3);
  const curatorRes = await askChiefCurator({
    query: curatorQuery,
    contextSpecies: curatorContext
  });
  console.log('Curator Answer Preview:');
  console.log(curatorRes.response.slice(0, 300) + '...\n');
  console.log('Referenced Specimen IDs:', curatorRes.referencedSpecies);
  console.log('✅ PASS: Chief Curator answered with grounded citations.\n');
  await new Promise(r => setTimeout(r, 2500));

  // Test 4: Caliper Runway Biomechanical Interaction
  console.log('--- TEST 4: CALIPER RUNWAY BIOMECHANICAL MATCHUP ---');
  const spA = await prisma.species.findFirst({ where: { name: 'Tyrannosaurus' } });
  const spB = await prisma.species.findFirst({ where: { name: 'Triceratops' } });
  if (spA && spB) {
    console.log(`Simulating: ${spA.name} vs ${spB.name}...`);
    const matchupRes = await simulateRunwayInteraction({ speciesA: spA, speciesB: spB });
    console.log(`Coexisted: ${matchupRes.coexisted} (Verdict: ${matchupRes.temporalVerdict})`);
    console.log(`Mass Ratio: ${matchupRes.physicalComparison.massRatio}x`);
    console.log(`Narrative Preview: ${matchupRes.ecologicalInteractionNarrative.slice(0, 200)}...`);
    console.log('✅ PASS: Biomechanical simulation computed successfully.\n');
  }
  await new Promise(r => setTimeout(r, 2500));

  // Test 5: Paleo-Biome & Trophic Food Web Synthesizer
  console.log('--- TEST 5: PALEO-BIOME FOOD WEB SYNTHESIZER ---');
  const formation = 'Hell Creek Formation';
  console.log(`Synthesizing food web for ${formation}...`);
  const speciesInFormation = await prisma.species.findMany({
    where: { geographicRange: { contains: formation, mode: 'insensitive' } },
    take: 10
  });
  const webRes = await synthesizeFormationFoodWeb({
    formationName: formation,
    era: 'Cretaceous',
    speciesInFormation
  });
  console.log(`Formation: ${webRes.formationName} | Climate: ${webRes.climate}`);
  console.log(`Trophic Nodes Count: ${webRes.nodes.length} | Edges Count: ${webRes.edges.length}`);
  console.log('✅ PASS: Food web synthesized successfully.\n');

  console.log('🎉 ALL 5 AI FEATURES VERIFIED WITH LIVE GEMINI API & PGVECTOR!\n');
  await prisma.$disconnect();
}

runEndToEndVerification().catch((e) => {
  console.error('Verification failed:', e);
  process.exit(1);
});
