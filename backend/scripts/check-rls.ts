import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRLS() {
  try {
    const tables: any[] = await prisma.$queryRawUnsafe(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log('Tables and their RLS status in public schema:');
    console.table(tables);

    const policies: any[] = await prisma.$queryRawUnsafe(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);

    console.log('Existing RLS policies:');
    console.table(policies);
  } catch (err: any) {
    console.error('Error checking RLS:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkRLS();
