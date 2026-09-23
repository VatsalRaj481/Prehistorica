import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPgVector() {
  try {
    console.log('Testing database connection and pgvector extension...');
    const result: any = await prisma.$queryRawUnsafe(`
      SELECT * FROM pg_available_extensions WHERE name = 'vector';
    `);
    console.log('Available vector extension:', result);

    // Try enabling vector extension if available
    await prisma.$queryRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log('✅ pgvector extension enabled successfully!');

    // Check if table can be created
    await prisma.$queryRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SpeciesEmbedding" (
        "id" SERIAL PRIMARY KEY,
        "speciesId" INTEGER UNIQUE NOT NULL REFERENCES "Species"("id") ON DELETE CASCADE,
        "content" TEXT NOT NULL,
        "embedding" vector(768)
      );
    `);
    console.log('✅ "SpeciesEmbedding" auxiliary table verified!');
  } catch (err: any) {
    console.error('Error with pgvector / table check:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

checkPgVector();
