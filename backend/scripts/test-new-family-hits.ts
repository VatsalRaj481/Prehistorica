import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFamilyMatches() {
  const all = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true, clade: true, taxonomy: true, comparisonSilhouette: true }
  });
  const cladeFallbackSpecies = all.filter(s => {
    const sil = s.comparisonSilhouette ? JSON.parse(s.comparisonSilhouette) : null;
    return sil && sil.taxon?.includes('Clade Representative');
  });
  console.log(`Clade fallback species count: ${cladeFallbackSpecies.length}`);

  let newFamilyHits = 0;
  for (const s of cladeFallbackSpecies.slice(0, 30)) {
    const tax = s.taxonomy ? JSON.parse(s.taxonomy) : {};
    const family = tax.family;
    if (!family || family.endsWith('clade')) continue;

    try {
      const nodeRes = await fetch(`https://api.phylopic.org/nodes?build=552&filter_name=${encodeURIComponent(family.toLowerCase())}&page=0&embed_items=true`);
      const nodeData = nodeRes.ok ? await nodeRes.json() : null;
      const nodeUuid = nodeData?._embedded?.items?.[0]?._links?.self?.href?.match(/\/nodes\/([a-f0-9-]+)/)?.[1];
      if (nodeUuid) {
        const imgRes = await fetch(`https://api.phylopic.org/images?build=552&filter_clade=${nodeUuid}&page=0&embed_items=true`);
        const imgData = imgRes.ok ? await imgRes.json() : null;
        const validImg = imgData?._embedded?.items?.find((i: any) => {
          const lic = i._links?.license?.href || '';
          return lic.includes('publicdomain/zero') || lic.includes('/by/') || lic.includes('/by-sa/');
        });
        if (validImg) {
          newFamilyHits++;
          console.log(`[HIT] ${s.name} (${s.scientificName}) -> Certified Family '${family}' matches PhyloPic: ${validImg._links?.self?.title} (${validImg._links?.contributor?.title})`);
        }
      }
    } catch {}
  }
  console.log(`\nSample tested 30, new family hits: ${newFamilyHits}`);
}

testFamilyMatches().then(() => process.exit(0)).catch(console.error);
