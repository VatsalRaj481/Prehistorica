const { PrismaClient } = require('@prisma/client');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const prisma = new PrismaClient();

async function main() {
  console.log('--- SETTING UP STORAGE RLS POLICIES ---');

  try {
    // Enable RLS on storage.objects
    await prisma.$executeRawUnsafe(`ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`);

    // Drop existing policies if any
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Public Read Access species-media" ON storage.objects;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Public Insert Access species-media" ON storage.objects;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Public Update Access species-media" ON storage.objects;`);

    // Create RLS policies for species-media bucket
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Read Access species-media"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'species-media');
    `);

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Insert Access species-media"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'species-media');
    `);

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Update Access species-media"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'species-media');
    `);

    console.log('SUCCESS: RLS policies for "species-media" created successfully!');
  } catch (err) {
    console.error('Error setting RLS policies:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
