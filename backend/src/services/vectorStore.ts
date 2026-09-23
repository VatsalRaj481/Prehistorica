import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';
import { generateEmbedding } from './gemini.js';

const prisma = new PrismaClient();

export function buildSpeciesEmbeddingText(s: any): string {
  let factsStr = '';
  try {
    const facts = JSON.parse(s.interestingFacts || '[]');
    if (Array.isArray(facts)) factsStr = facts.join(' ');
  } catch {
    factsStr = s.interestingFacts || '';
  }

  let geoStr = '';
  try {
    const geo = JSON.parse(s.geographicRange || '{}');
    geoStr = [geo.region, geo.country, geo.fossilFormation].filter(Boolean).join(', ');
  } catch {
    geoStr = s.geographicRange || '';
  }

  return `Species: ${s.name} (${s.scientificName}). Clade: ${s.clade}. Diet: ${s.diet} - ${s.dietDetails}. Habitat: ${s.habitat}. Time Period: ${s.timePeriod} (${s.epoch || ''}), living approximately ${s.myaStart} to ${s.myaEnd} million years ago. Geographic Range / Formations: ${geoStr}. Discovery & Paleobiology: ${s.discoveryHistory}. Key Facts: ${factsStr}. Size: ${s.sizeNotes}.`.slice(0, 1800);
}

/**
 * Searches the Species database using pgvector cosine distance (<=>).
 */
export async function searchSimilarSpecies(query: string, limit = 6): Promise<any[]> {
  try {
    const queryVector = await generateEmbedding(query, 768);
    const vectorStr = `[${queryVector.join(',')}]`;

    const results: any = await prisma.$queryRawUnsafe(
      `SELECT 
        s.id, 
        s.name, 
        s."scientificName", 
        s.clade, 
        s.diet, 
        s.habitat, 
        s."timePeriod", 
        s."myaStart", 
        s."myaEnd", 
        s."geographicRange", 
        s."sizeNotes", 
        s."sizeEstimate", 
        s."interestingFacts", 
        s.media, 
        s."comparisonSilhouette",
        (1 - (e.embedding <=> $1::vector)) as similarity
       FROM "SpeciesEmbedding" e
       JOIN "Species" s ON s.id = e."speciesId"
       ORDER BY e.embedding <=> $1::vector
       LIMIT $2;`,
      vectorStr,
      limit
    );

    return results;
  } catch (error: any) {
    console.error('Vector search failed, falling back to ILIKE search:', error.message || error);
    // Fallback: simple text query on Species table if vector search is unavailable
    const fallbackResults = await prisma.species.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { scientificName: { contains: query, mode: 'insensitive' } },
          { interestingFacts: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit
    });
    return fallbackResults.map(s => ({ ...s, similarity: 0.5 }));
  }
}

/**
 * Embeds a single species and saves it to the SpeciesEmbedding auxiliary table.
 */
export async function embedSpecies(speciesId: number): Promise<void> {
  const species = await prisma.species.findUnique({ where: { id: speciesId } });
  if (!species) return;

  const text = buildSpeciesEmbeddingText(species);
  const vector = await generateEmbedding(text, 768);

  await prisma.$executeRawUnsafe(
    `INSERT INTO "SpeciesEmbedding" ("speciesId", "content", "embedding")
     VALUES ($1, $2, $3::vector)
     ON CONFLICT ("speciesId") DO UPDATE 
     SET "content" = EXCLUDED."content", "embedding" = EXCLUDED."embedding";`,
    species.id,
    text,
    `[${vector.join(',')}]`
  );
}

/**
 * Returns count of indexed species embeddings.
 */
export async function getEmbeddingCount(): Promise<number> {
  const res: any = await prisma.$queryRawUnsafe(`SELECT count(*) as count FROM "SpeciesEmbedding";`);
  return Number(res[0]?.count || 0);
}
