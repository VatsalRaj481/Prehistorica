import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initAuxiliaryTables() {
  try {
    console.log('Initializing auxiliary tables for AI features...');

    await prisma.$queryRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RunwayMatchupCache" (
        "id" SERIAL PRIMARY KEY,
        "speciesKey" TEXT UNIQUE NOT NULL,
        "analysis" JSONB NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await prisma.$queryRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BiomeFoodWebCache" (
        "id" SERIAL PRIMARY KEY,
        "formationKey" TEXT UNIQUE NOT NULL,
        "data" JSONB NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create an HNSW index on SpeciesEmbedding for fast vector cosine similarity search
    await prisma.$queryRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "SpeciesEmbedding_embedding_idx" 
      ON "SpeciesEmbedding" 
      USING hnsw ("embedding" vector_cosine_ops);
    `);

    console.log('✅ Auxiliary AI tables and HNSW vector index created successfully!');
  } catch (err: any) {
    console.error('Error creating auxiliary tables:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

initAuxiliaryTables();
