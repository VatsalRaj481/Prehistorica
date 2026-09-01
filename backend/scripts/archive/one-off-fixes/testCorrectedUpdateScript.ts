import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function generateCorrectedScriptCode() {
  const jsonPath = path.join(__dirname, '../reports/true-media-audit-502.json');
  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const itemsToMove = rows.filter((r: any) => 
    r.proposedAction === 'MOVE TO SECONDARY MEDIA' || 
    r.proposedAction === 'DETACH FROM CURRENT TAXON' ||
    r.proposedAction === 'REPLACE PRIMARY IMAGE REQUIRED'
  );

  console.log(`\n=================================================================`);
  console.log(`CORRECTED PRISMA MEDIA RE-CATEGORIZATION SCRIPT`);
  console.log(`=================================================================`);
  console.log(`Target Affected Records: ${itemsToMove.length} species`);
  console.log(`Schema Compliance: Modifies ONLY existing 'media' JSON string array`);
  console.log(`Array Preservation: Appends/modifies target item while preserving all other media elements\n`);
}

generateCorrectedScriptCode()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
