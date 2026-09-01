import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function detailedReconciliationCheck() {
  const speciesList = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const safeList: any[] = [];
  const demotedList: any[] = [];
  const emptyList: any[] = [];

  speciesList.forEach(s => {
    let m = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    if (m.length === 0) {
      emptyList.push(s);
    } else {
      const t = m[0]?.type;
      if (t === 'art' || t === 'life_reconstruction') {
        safeList.push({ id: s.id, name: s.name, type: t, url: m[0].url });
      } else {
        demotedList.push({ id: s.id, name: s.name, type: t, url: m[0].url });
      }
    }
  });

  console.log(`\n=================================================================`);
  console.log(`EXACT EMPIRICAL RECONCILIATION SUMMARY`);
  console.log(`=================================================================`);
  console.log(`Total Database Species: ${speciesList.length}`);
  console.log(`1. Safe Primary Reconstructions (type === 'art' | 'life_reconstruction'): ${safeList.length} species`);
  console.log(`2. Demoted / Secondary Media (type !== 'art' & !== 'life_reconstruction'): ${demotedList.length} species`);
}

detailedReconciliationCheck()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
