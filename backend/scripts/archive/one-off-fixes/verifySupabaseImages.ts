import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSupabaseMedia() {
  const all = await prisma.species.findMany({
    select: {
      id: true,
      name: true,
      scientificName: true,
      media: true
    }
  });

  let fossilPhotosInArt: any[] = [];
  let aiArtInSupabase: any[] = [];
  let totalArtChecked = 0;

  for (const s of all) {
    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}

    for (const m of mediaArr) {
      if (m.type === 'art') {
        totalArtChecked++;
        const url = (m.url || '').toLowerCase();
        const credit = (m.credit || '').toLowerCase();
        const source = (m.sourceUrl || '').toLowerCase();

        const isFossil = ['fossil', 'skeleton', 'skull', 'bone', 'holotype', 'museum photo', 'specimen photo'].some(k =>
          url.includes(k) || credit.includes(k)
        );

        const isAI = ['midjourney', 'stable diffusion', 'dall-e', 'dalle', 'ai generated', 'ai art'].some(k =>
          url.includes(k) || credit.includes(k) || source.includes(k)
        );

        if (isFossil) {
          fossilPhotosInArt.push({ id: s.id, name: s.name, credit: m.credit, url: m.url });
        }
        if (isAI) {
          aiArtInSupabase.push({ id: s.id, name: s.name, credit: m.credit, url: m.url });
        }
      }
    }
  }

  console.log(`Total Art Items Checked: ${totalArtChecked}`);
  console.log(`Fossil photos categorized as Art: ${fossilPhotosInArt.length}`);
  console.log(`AI-generated images detected: ${aiArtInSupabase.length}`);

  if (fossilPhotosInArt.length > 0) {
    console.log('\n--- Fossil Photos Categorized as Art ---');
    fossilPhotosInArt.forEach(item => console.log(`[#${item.id}] ${item.name}: ${item.credit} -> ${item.url}`));
  }

  if (aiArtInSupabase.length > 0) {
    console.log('\n--- AI Art Detected ---');
    aiArtInSupabase.forEach(item => console.log(`[#${item.id}] ${item.name}: ${item.credit} -> ${item.url}`));
  }
}

checkSupabaseMedia()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
