const { PrismaClient } = require('@prisma/client');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const prisma = new PrismaClient();

async function main() {
  console.log('--- PHASE 1: SUPABASE STORAGE BUCKET SETUP ---');

  try {
    // 1. Ensure storage.buckets table has 'species-media' public bucket
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('species-media', 'species-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'])
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
    console.log('SUCCESS: Public Supabase Storage bucket "species-media" created/verified in database!');

    // 2. Query storage.buckets to confirm bucket settings
    const buckets = await prisma.$queryRawUnsafe(`
      SELECT id, name, public, created_at FROM storage.buckets WHERE id = 'species-media';
    `);
    console.log('\n--- BUCKET CONFIRMATION ---');
    console.log(JSON.stringify(buckets, null, 2));

  } catch (err) {
    console.error('Bucket setup error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
