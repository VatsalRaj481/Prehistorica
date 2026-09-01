import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function previewMediaRecategorization() {
  const jsonPath = path.join(__dirname, '../reports/true-media-audit-502.json');
  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const itemsToMove = rows.filter((r: any) => 
    r.proposedAction === 'MOVE TO SECONDARY MEDIA' || 
    r.proposedAction === 'DETACH FROM CURRENT TAXON' ||
    r.proposedAction === 'REPLACE PRIMARY IMAGE REQUIRED'
  );

  console.log(`\n=================================================================`);
  console.log(`PREVIEW OF DATABASE MEDIA RE-CATEGORIZATION SCRIPT`);
  console.log(`=================================================================`);
  console.log(`Total species records affected: ${itemsToMove.length}`);
  console.log(`Execution Mode: DRY-RUN / PREVIEW (No DB changes made yet)\n`);

  console.log(`Sample operations (First 15 affected species):`);
  itemsToMove.slice(0, 15).forEach((r: any) => {
    console.log(`\n-----------------------------------------------------------------`);
    console.log(`Taxon #${r.id} *${r.targetTaxon}*`);
    console.log(`  Current Media Array:`);
    console.log(`    [0] Primary: '${r.currentFileTitle}' (type: '${r.currentDbType}')`);
    console.log(`  Proposed Action: ${r.proposedAction}`);
    console.log(`  Target Secondary Placement: ${r.recommendedMediaPlacement}`);
    console.log(`  DB Operations to perform:`);
    console.log(`    1. Update media[0].type = '${r.actualImageType}'`);
    console.log(`    2. Shift media[0] from primary position to secondary array`);
    console.log(`    3. Set primary_life_reconstruction_id = null`);
    console.log(`    4. Set primary_image_status = 'pending_reconstruction'`);
  });

  console.log(`\n-----------------------------------------------------------------`);
  console.log(`Special Action for Taxon #2317 (Indochelys spatulata):`);
  console.log(`  - Detach wrong Proganochelys image.`);
  console.log(`  - Attach verified Commons replacement: File:GSI-20380-Indochelys-spatulata-holotype-Maharashtra-India-Kota-Formation.png (Walter Joyce & Saswati Bandyopadhyay, CC BY 4.0).`);
  console.log(`\nSpecial Action for Taxon #1670 (Lightningclaw):`);
  console.log(`  - Detach wrong Aerosteon image.`);
  console.log(`  - Set primary_image_status = 'pending_reconstruction' (0 Commons candidates found).`);
  console.log(`=================================================================\n`);
}

previewMediaRecategorization()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
