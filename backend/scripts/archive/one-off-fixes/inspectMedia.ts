import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditMedia() {
  const all = await prisma.species.findMany({
    select: {
      id: true,
      name: true,
      scientificName: true,
      media: true
    }
  });

  const domainCounts: Record<string, number> = {};
  const fossilLike: any[] = [];
  const unsplashLike: any[] = [];
  const noArtType: any[] = [];
  const validWikimedia: any[] = [];

  for (const s of all) {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}

    const artItem = mediaArr.find((m: any) => m.type === 'art');
    const photoItem = mediaArr.find((m: any) => m.type === 'photo');
    const mainItem = artItem || mediaArr[0];
    const url = mainItem?.url || '';

    if (!url) {
      noArtType.push(s);
      continue;
    }

    try {
      const domain = new URL(url).hostname;
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    } catch {
      domainCounts['invalid_url'] = (domainCounts['invalid_url'] || 0) + 1;
    }

    // Check if image URL or description looks like a fossil/skeleton photo instead of life restoration paleoart
    const urlLower = url.toLowerCase();
    const isFossilKeywords = ['fossil', 'skeleton', 'skull', 'bone', 'holotype', 'specimen', 'museum', 'tooth', 'jaw', 'claw', 'mount'];
    const isFossilPhoto = isFossilKeywords.some(k => urlLower.includes(k)) || (!artItem && photoItem);

    if (isFossilPhoto) {
      fossilLike.push({ id: s.id, name: s.name, scientificName: s.scientificName, url });
    }

    if (urlLower.includes('unsplash')) {
      unsplashLike.push({ id: s.id, name: s.name, url });
    }

    if (urlLower.includes('wikimedia') || urlLower.includes('wikipedia')) {
      validWikimedia.push({ id: s.id, name: s.name, url, credit: mainItem?.credit, sourceUrl: mainItem?.sourceUrl });
    }
  }

  console.log('=== DOMAIN BREAKDOWN ===');
  console.log(domainCounts);

  console.log('\n=== MEDIA STATUS SUMMARY ===');
  console.log(`Total species: ${all.length}`);
  console.log(`Fossil/Skeleton photo instead of Paleoart: ${fossilLike.length}`);
  console.log(`Unsplash stock image: ${unsplashLike.length}`);
  console.log(`Wikimedia/Wikipedia Paleoart: ${validWikimedia.length}`);

  console.log('\n=== SAMPLE FOSSIL/SKELETON INSTEAD OF PALEOART (First 20) ===');
  fossilLike.slice(0, 20).forEach(item => console.log(`[#${item.id}] ${item.name} (${item.scientificName}) -> ${item.url}`));
}

auditMedia()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
