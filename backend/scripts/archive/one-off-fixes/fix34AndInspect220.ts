import { PrismaClient } from '@prisma/client';
import https from 'https';

const prisma = new PrismaClient();

function getWikiPageInfo(title: string): Promise<any> {
  return new Promise((resolve) => {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|extmetadata|user&format=json`;
    const req = https.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PrehistoricaEncyclopediaBot/2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = Object.values(json.query.pages) as any[];
          resolve(pages[0] || null);
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
  });
}

async function fix34AndInspect220() {
  console.log(`=== 1. APPLYING DEMOTION FOR TAXON #34 (Gastornis parisiensis) ===`);
  const g34 = await prisma.species.findUnique({ where: { id: 34 } });
  if (g34) {
    let m = typeof g34.media === 'string' ? JSON.parse(g34.media) : (g34.media || []);
    if (m.length > 0) {
      m[0].type = 'secondary';
      m[0].note = 'Demoted: Depicts Gastornis giganteus (North American species split), not G. parisiensis';
      await prisma.species.update({
        where: { id: 34 },
        data: { media: JSON.stringify(m) }
      });
      console.log(`Taxon #34 *Gastornis parisiensis*: Successfully demoted 34-Gastornis.jpg to type='secondary'.`);
    }
  }

  console.log(`\n=== 2. INVESTIGATING TAXON #220 (Harpactognathus gentryii) ===`);
  const h220 = await prisma.species.findUnique({ where: { id: 220 } });
  if (h220) {
    let m = typeof h220.media === 'string' ? JSON.parse(h220.media) : (h220.media || []);
    console.log(`Database record for Taxon #220:`, JSON.stringify(m, null, 2));

    const item = m[0] || {};
    console.log(`Checking Commons lookup for file title or sourceUrl: '${item.url}' / '${item.sourceUrl}'...`);

    let commonsInfo = null;
    if (item.sourceUrl && item.sourceUrl.includes('File:')) {
      const pageTitle = item.sourceUrl.split('File:')[1];
      commonsInfo = await getWikiPageInfo(`File:${pageTitle}`);
    }

    if (!commonsInfo || !commonsInfo.imageinfo) {
      console.log(`RESULT: '220-Harpactognathus.png' is an unverified local seed file string with NO valid Wikimedia Commons source page!`);
      console.log(`Applying detachment / demotion for Taxon #220 to type='secondary' / pending replacement...`);
      if (m.length > 0) {
        m[0].type = 'secondary';
        m[0].note = 'Demoted: Unverified local seed string. Pending verified primary replacement artwork.';
        await prisma.species.update({
          where: { id: 220 },
          data: { media: JSON.stringify(m) }
        });
        console.log(`Taxon #220 *Harpactognathus gentryii*: Successfully demoted to type='secondary'.`);
      }
    } else {
      console.log(`Commons Info found:`, JSON.stringify(commonsInfo.imageinfo[0], null, 2));
    }
  }

  // 3. Re-run Final Reconciliation Query
  console.log(`\n=== 3. RE-RUNNING FINAL RECONCILIATION QUERY ACROSS ALL DB SPECIES ===`);
  const speciesList = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  
  let safePrimaryCount = 0;
  let nonArtPrimaryCount = 0;
  let emptyMediaCount = 0;

  speciesList.forEach(s => {
    let m = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    if (m.length === 0) {
      emptyMediaCount++;
    } else if (m[0]?.type === 'art' || m[0]?.type === 'life_reconstruction') {
      safePrimaryCount++;
    } else {
      nonArtPrimaryCount++;
    }
  });

  console.log(`Species with media[0].type === 'art' | 'life_reconstruction' (Safe Primary): ${safePrimaryCount}`);
  console.log(`Species with media[0].type !== 'art' (Demoted to Secondary): ${nonArtPrimaryCount}`);
  console.log(`Species with empty media array [] (Pending Reconstruction): ${emptyMediaCount}`);
  console.log(`Total Pending/Non-Primary Work List Count (demoted + empty): ${nonArtPrimaryCount + emptyMediaCount}`);
  console.log(`Reconciled Total Species (Safe + Demoted + Empty): ${safePrimaryCount + nonArtPrimaryCount + emptyMediaCount}`);
}

fix34AndInspect220()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
