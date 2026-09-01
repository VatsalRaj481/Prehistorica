import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function verifyDatabaseReconciliation() {
  const jsonPath = path.join(__dirname, '../reports/true-media-audit-502.json');
  const auditRows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Target work list from audit (where replacement/detach/move is required)
  const targetWorkList = auditRows.filter((r: any) => 
    r.proposedAction === 'MOVE TO SECONDARY MEDIA' || 
    r.proposedAction === 'DETACH FROM CURRENT TAXON' ||
    r.proposedAction === 'REPLACE PRIMARY IMAGE REQUIRED'
  );

  console.log(`=== AUDIT TARGET WORK LIST COUNT: ${targetWorkList.length} taxa ===\n`);

  const speciesList = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`Total database species: ${speciesList.length}`);

  // Check Gastornis (#34) and Harpactognathus (#220)
  const g34 = speciesList.find(s => s.id === 34);
  const h220 = speciesList.find(s => s.id === 220);

  console.log(`\n--- 1. SPECIFIC CHECK FOR TAXA #34 AND #220 ---`);
  if (g34) {
    let m = typeof g34.media === 'string' ? JSON.parse(g34.media) : (g34.media || []);
    console.log(`Taxon #34 *Gastornis parisiensis*: media array len=${m.length}, [0].type='${m[0]?.type}', url='${m[0]?.url}'`);
  }
  if (h220) {
    let m = typeof h220.media === 'string' ? JSON.parse(h220.media) : (h220.media || []);
    console.log(`Taxon #220 *Harpactognathus gentryii*: media array len=${m.length}, [0].type='${m[0]?.type}', url='${m[0]?.url}'`);
  }

  // Find any skipped taxa from the targetWorkList
  console.log(`\n--- 2. DETAILED CHECK OF SKIPPED TAXA FROM THE ${targetWorkList.length} TARGET WORK LIST ---`);
  const skippedTaxa: any[] = [];
  targetWorkList.forEach((target: any) => {
    const s = speciesList.find(sp => sp.id === target.id);
    if (!s) {
      skippedTaxa.push({ id: target.id, targetTaxon: target.targetTaxon, reason: 'ID missing from species database' });
      return;
    }
    let m = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    if (m.length === 0) {
      skippedTaxa.push({ id: target.id, targetTaxon: target.targetTaxon, reason: 'Media array was already empty' });
    } else if (m[0]?.type === 'art' && target.id !== 2317 && target.id !== 1670) {
      skippedTaxa.push({ id: target.id, targetTaxon: target.targetTaxon, reason: `Media[0] still has type 'art' ('${m[0]?.url}')` });
    }
  });

  console.log(`Skipped / Special Taxa Count: ${skippedTaxa.length}`);
  skippedTaxa.forEach(st => console.log(`  - Taxon #${st.id} *${st.targetTaxon}*: ${st.reason}`));

  // 3. Final Verification Query across ALL species in DB
  console.log(`\n--- 3. FINAL VERIFICATION QUERY ACROSS ALL DB SPECIES ---`);
  let safePrimaryCount = 0;
  let nonArtPrimaryCount = 0;
  let emptyMediaCount = 0;

  speciesList.forEach(s => {
    let m = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    if (m.length === 0) {
      emptyMediaCount++;
    } else if (m[0]?.type === 'art') {
      safePrimaryCount++;
    } else {
      nonArtPrimaryCount++;
    }
  });

  console.log(`Species with media[0].type === 'art' (Safe Primary): ${safePrimaryCount}`);
  console.log(`Species with media[0].type !== 'art' (Demoted to Secondary): ${nonArtPrimaryCount}`);
  console.log(`Species with empty media array [] (Pending Reconstruction): ${emptyMediaCount}`);
  console.log(`Total Pending/Non-Primary Count (demoted + empty): ${nonArtPrimaryCount + emptyMediaCount}`);
  console.log(`Reconciled Total Species (Safe + Demoted + Empty): ${safePrimaryCount + nonArtPrimaryCount + emptyMediaCount}`);
}

verifyDatabaseReconciliation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
