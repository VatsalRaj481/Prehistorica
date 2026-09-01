import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.join(__dirname, 'orphan_audit_results.json');
  const auditData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const speciesList = await prisma.species.findMany();
  
  // Collect every string in media arrays and full DB
  const allUrls: string[] = [];
  for (const s of speciesList) {
    if (s.media) {
      try {
        const arr = typeof s.media === 'string' ? JSON.parse(s.media) : s.media;
        if (Array.isArray(arr)) {
          for (const m of arr) {
            if (m && m.url) allUrls.push(String(m.url).toLowerCase());
          }
        }
      } catch (e) {}
    }
  }

  console.log(`Total URLs collected from all media arrays: ${allUrls.length}`);

  let falsePositivesCount = 0;
  for (const orphan of auditData.confirmedOrphans) {
    const fn = orphan.filename.toLowerCase();
    const fnNoExt = fn.replace(/\.[^/.]+$/, "");
    
    // Check if filename or base filename appears in any media URL
    const match = allUrls.find(u => u.includes(fn));
    if (match) {
      console.log(`ALERT! Possible false positive for ${orphan.filename}: matches DB URL ${match}`);
      falsePositivesCount++;
    }
  }

  console.log(`Verification complete. Found ${falsePositivesCount} potential false positives.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
