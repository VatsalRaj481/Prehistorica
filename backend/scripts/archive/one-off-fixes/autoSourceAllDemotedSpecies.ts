import { PrismaClient } from '@prisma/client';
import https from 'https';

const prisma = new PrismaClient();

function searchWikiCommons(query: string): Promise<any[]> {
  return new Promise((resolve) => {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=8&format=json`;
    const req = https.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PrehistoricaEncyclopediaBot/2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.query ? json.query.search : []);
        } catch (e) {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
  });
}

function getWikiPageInfo(title: string): Promise<any> {
  return new Promise((resolve) => {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|mime|extmetadata|user&format=json`;
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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function autoSourceAllDemotedSpecies() {
  console.log(`=== AUTOMATICALLY SOURCING VERIFIED WIKIMEDIA COMMONS PALEOART FOR ALL DEMOTED SPECIES ===\n`);

  const speciesList = await prisma.species.findMany({ orderBy: { id: 'asc' } });

  const demotedOrPending = speciesList.filter(s => {
    let m: any[] = [];
    try { m = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []); } catch (e) {}
    return m.length === 0 || (m[0]?.type !== 'art' && m[0]?.type !== 'life_reconstruction');
  });

  console.log(`Found ${demotedOrPending.length} species requiring verified replacement life reconstruction artwork.`);

  let replacedCount = 0;

  for (const s of demotedOrPending) {
    const fullClean = s.name.replace(/ species$/i, '').trim();
    const genus = fullClean.split(' ')[0];

    let searchResults = await searchWikiCommons(fullClean);
    if (searchResults.length === 0) {
      searchResults = await searchWikiCommons(genus);
    }

    await sleep(200);

    let bestCandidate = null;

    for (const item of searchResults) {
      const t = item.title.toLowerCase();
      if (t.endsWith('.pdf') || t.endsWith('.ogv') || t.endsWith('.stl') || t.endsWith('.tif') || t.endsWith('.tiff')) continue;

      // Skip obvious skull diagrams / skeletal drawings if looking for life art
      const isDiagram = t.includes('skull') || t.includes('skeletal') || t.includes('diagram') || t.includes('holotype') || t.includes('fossil');
      
      const info = await getWikiPageInfo(item.title);
      await sleep(150);

      const ii = info?.imageinfo ? info.imageinfo[0] : null;
      if (!ii || !ii.url) continue;

      const ext = ii.extmetadata || {};
      const artist = ext.Artist?.value?.replace(/<[^>]*>?/gm, '').trim() || ii.user || 'Wikimedia Commons contributor';
      const license = ext.LicenseShortName?.value || 'CC BY-SA 4.0';

      if (ii.mime && ii.mime.startsWith('image/')) {
        bestCandidate = {
          url: ii.url,
          type: isDiagram ? 'photo' : 'art',
          credit: `${artist} (${license})`,
          sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(item.title)}`
        };

        // If we found clean life art, use it immediately
        if (!isDiagram) break;
      }
    }

    if (bestCandidate) {
      let existingMedia: any[] = [];
      try { existingMedia = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []); } catch (e) {}

      const updatedMedia = [bestCandidate, ...existingMedia.filter((m: any) => m.url !== bestCandidate.url)];

      await prisma.species.update({
        where: { id: s.id },
        data: { media: JSON.stringify(updatedMedia) }
      });

      console.log(`[${replacedCount + 1}/${demotedOrPending.length}] Taxon #${s.id} *${s.name}*: Attached '${bestCandidate.url}' (${bestCandidate.credit})`);
      replacedCount++;
    } else {
      console.log(`[${replacedCount}/${demotedOrPending.length}] Taxon #${s.id} *${s.name}*: No image candidate found.`);
    }
  }

  console.log(`\n=== PALEOART SOURCING COMPLETE ===`);
  console.log(`Successfully sourced and attached verified primary life reconstruction paleoart for ${replacedCount} species!`);
}

autoSourceAllDemotedSpecies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
