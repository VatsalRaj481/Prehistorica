import https from 'https';

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

async function test() {
  const species = ['Arthropleura', 'Mosasaurus', 'Coelodonta', 'Doedicurus', 'Eodromaeus', 'Proterosuchus'];
  for (const s of species) {
    const res = await searchCommonsImages(s);
    console.log(`\nResults for '${s}': ${res.length} images found`);
    res.slice(0, 2).forEach(r => console.log(`  - Title: ${r.title} -> ${r.url}`));
  }
}

test().catch(console.error);
