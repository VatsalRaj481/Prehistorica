import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enableRLS() {
  try {
    console.log('--- Step 1: Pre-migration Safeguard & Anti-Regression Verification ---');
    const preSpeciesCount = await prisma.species.count();
    const preExtinctionCount = await prisma.extinctionEvent.count();
    const preClimateCount = await prisma.paleoclimatePoint.count();

    console.log(`Initial Counts -> Species: ${preSpeciesCount}, ExtinctionEvents: ${preExtinctionCount}, PaleoclimatePoints: ${preClimateCount}`);

    console.log('\n--- Step 2: Enabling Row Level Security (RLS) ---');
    await prisma.$queryRawUnsafe(`ALTER TABLE "ExtinctionEvent" ENABLE ROW LEVEL SECURITY;`);
    console.log('✅ RLS enabled on "ExtinctionEvent".');

    await prisma.$queryRawUnsafe(`ALTER TABLE "PaleoclimatePoint" ENABLE ROW LEVEL SECURITY;`);
    console.log('✅ RLS enabled on "PaleoclimatePoint".');

    console.log('\n--- Step 3: Configuring Public Read-Only Policies ---');
    await prisma.$queryRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'ExtinctionEvent' AND policyname = 'Allow public read-only access'
        ) THEN
          CREATE POLICY "Allow public read-only access" ON "ExtinctionEvent" FOR SELECT TO public USING (true);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'PaleoclimatePoint' AND policyname = 'Allow public read-only access'
        ) THEN
          CREATE POLICY "Allow public read-only access" ON "PaleoclimatePoint" FOR SELECT TO public USING (true);
        END IF;
      END $$;
    `);
    console.log('✅ Read-only public policies applied.');

    console.log('\n--- Step 4: Verification of RLS status & policies in Postgres ---');
    const tables: any[] = await prisma.$queryRawUnsafe(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename IN ('ExtinctionEvent', 'PaleoclimatePoint')
      ORDER BY tablename;
    `);
    console.table(tables);

    const policies: any[] = await prisma.$queryRawUnsafe(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
      FROM pg_policies 
      WHERE schemaname = 'public' AND tablename IN ('ExtinctionEvent', 'PaleoclimatePoint')
      ORDER BY tablename, policyname;
    `);
    console.table(policies);

    console.log('\n--- Step 5: Post-migration Integrity & Anti-Regression Check ---');
    const postSpeciesCount = await prisma.species.count();
    const postExtinctionCount = await prisma.extinctionEvent.count();
    const postClimateCount = await prisma.paleoclimatePoint.count();

    console.log(`Final Counts -> Species: ${postSpeciesCount}, ExtinctionEvents: ${postExtinctionCount}, PaleoclimatePoints: ${postClimateCount}`);

    if (postSpeciesCount !== preSpeciesCount) {
      throw new Error(`CRITICAL: Species count mismatch! Pre: ${preSpeciesCount}, Post: ${postSpeciesCount}`);
    }
    if (postExtinctionCount !== preExtinctionCount) {
      throw new Error(`CRITICAL: ExtinctionEvent count mismatch! Pre: ${preExtinctionCount}, Post: ${postExtinctionCount}`);
    }
    if (postClimateCount !== preClimateCount) {
      throw new Error(`CRITICAL: PaleoclimatePoint count mismatch! Pre: ${preClimateCount}, Post: ${postClimateCount}`);
    }

    const allRlsEnabled = tables.every((t) => t.rowsecurity === true);
    if (!allRlsEnabled) {
      throw new Error('CRITICAL: Not all target tables have rowsecurity = true!');
    }

    console.log('\n🎉 ALL CHECKS PASSED: RLS successfully enabled with public read-only access!');
  } catch (err: any) {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

enableRLS();
