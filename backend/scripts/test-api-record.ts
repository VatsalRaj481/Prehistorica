import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseJson(val: any, fallback: any) {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val.trim()); } catch { return fallback; }
}

async function verifyPrototypes() {
  const ids = [449, 458, 467, 1745];
  for (const id of ids) {
    const s = await prisma.species.findUnique({ where: { id } });
    if (!s) {
      console.log(`Species ${id} not found`);
      continue;
    }
    const sil = parseJson(s.comparisonSilhouette, null);
    console.log(`\n=== Species [${s.id}] ${s.name} (${s.scientificName}) ===`);
    console.log('Clade:', s.clade);
    console.log('Comparison Silhouette in DB:');
    console.log(JSON.stringify(sil, null, 2));
  }
}

verifyPrototypes().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
