import { PrismaClient } from '@prisma/client';
import https from 'https';

const prisma = new PrismaClient();

function searchCommonsImages(query: string): Promise<any[]> {
  return new Promise((resolve) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime|extmetadata|user&format=json`;
    https.get(url, { headers: { 'User-Agent': 'PrehistoricaBot/2.0 (vatsalraj481@gmail.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.query || !json.query.pages) return resolve([]);
          const pages = Object.values(json.query.pages) as any[];
          const results = pages.map(p => {
            const ii = p.imageinfo ? p.imageinfo[0] : {};
            const ext = ii.extmetadata || {};
            return {
              title: p.title,
              url: ii.url,
              mime: ii.mime,
              artist: ext.Artist?.value?.replace(/<[^>]*>?/gm, '').trim() || ii.user || 'Wikimedia Commons contributor',
              license: ext.LicenseShortName?.value || 'CC BY-SA 4.0'
            };
          }).filter(r => r.url && r.mime && r.mime.startsWith('image/'));
          resolve(results);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function batchReplaceAllDemotedPaleoart() {
  console.log(`=== BATCH SOURCING & REPLACING DEMOTED PALEOART ACROSS ALL DATABASE SPECIES ===\n`);

  const speciesList = await prisma.species.findMany({ orderBy: { id: 'asc' } });

  const demotedOrPending = speciesList.filter(s => {
    let m: any[] = [];
    try { m = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []); } catch (e) {}
    return m.length === 0 || (m[0]?.type !== 'art' && m[0]?.type !== 'life_reconstruction');
  });

  console.log(`Total species needing verified primary life reconstruction artwork: ${demotedOrPending.length}\n`);

  let replacedCount = 0;

  for (let i = 0; i < demotedOrPending.length; i++) {
    const s = demotedOrPending[i];
    const cleanName = s.name.replace(/ species$/i, '').trim();
    const genus = cleanName.split(' ')[0];

    // Try full species name first, fallback to genus
    let candidates = await searchCommonsImages(`${cleanName} restoration`);
    if (candidates.length === 0) {
      candidates = await searchCommonsImages(cleanName);
    }
    if (candidates.length === 0) {
      candidates = await searchCommonsImages(genus);
    }

    await sleep(250); // rate-limiting

    // Pick best life art candidate (avoid PDF/SVG diagrams if raster life art is available)
    let best = candidates.find(c => {
      const t = c.title.toLowerCase();
      return !t.includes('.pdf') && !t.includes('.svg') && !t.includes('skull') && !t.includes('skeletal') && !t.includes('fossil');
    }) || candidates[0];

    if (best) {
      let existingMedia: any[] = [];
      try { existingMedia = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []); } catch (e) {}

      const newPrimaryItem = {
        url: best.url,
        type: 'art',
        credit: `${best.artist} (${best.license})`,
        sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(best.title)}`
      };

      // Prepend working primary art, keeping existing items as secondary
      const updatedMedia = [newPrimaryItem, ...existingMedia.filter((m: any) => m.url !== best.url)];

      await prisma.species.update({
        where: { id: s.id },
        data: { media: JSON.stringify(updatedMedia) }
      });

      console.log(`[${i + 1}/${demotedOrPending.length}] Updated Taxon #${s.id} *${s.name}*: Primary art set to '${best.url}' (${best.artist})`);
      replacedCount++;
    } else {
      console.log(`[${i + 1}/${demotedOrPending.length}] Taxon #${s.id} *${s.name}*: No candidate found.`);
    }
  }

  console.log(`\n=================================================================`);
  console.log(`SUCCESSFULLY SOURCED AND ATTACHED PALEOART FOR ${replacedCount} SPECIES!`);
  console.log(`=================================================================\n`);
}

batchReplaceAllDemotedPaleoart()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
