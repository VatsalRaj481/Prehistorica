import { PrismaClient } from '@prisma/client';
import { auditSingleTaxon } from './runStrictDeepAudit';

const prisma = new PrismaClient();

async function fixTaxon220() {
  const species220 = await prisma.species.findUnique({
    where: { id: 220 }
  });

  if (!species220) {
    console.error('Taxon #220 not found in DB!');
    return;
  }

  const result = await auditSingleTaxon(species220);
  console.log('\n=== STANDALONE FIX ACTION FOR TAXON #220 (Harpactognathus gentryii) ===');
  console.log(JSON.stringify(result, null, 2));
}

fixTaxon220()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
