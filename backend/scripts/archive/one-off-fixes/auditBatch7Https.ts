import https from 'https';

function getWikiPageInfo(title: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|mime|extmetadata|user|size&format=json`;
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PrehistoricaEncyclopediaBot/2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = Object.values(json.query.pages) as any[];
          resolve(pages[0]);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

async function run() {
  const pages = [
    { name: 'Ixalerpeton polesinensis', file: 'File:Brazilian_Lagerpetidae_diversity.jpg' },
    { name: 'Dromomeron romeri', file: 'File:Dromomeron_BW.jpg' },
    { name: 'Euparkeria capensis', file: 'File:Euparkeria.jpg' }
  ];

  for (const item of pages) {
    const p = await getWikiPageInfo(item.file);
    const info = p.imageinfo ? p.imageinfo[0] : {};
    const ext = info.extmetadata || {};
    console.log(`\n=== TAXON: ${item.name} ===`);
    console.log(`Title: ${p.title}`);
    console.log(`Artist: ${ext.Artist?.value?.replace(/<[^>]*>?/gm, '').trim() || info.user || 'Unknown'}`);
    console.log(`License: ${ext.LicenseShortName?.value || ext.UsageTerms?.value || 'Unknown'}`);
    console.log(`License URL: ${ext.LicenseUrl?.value || 'N/A'}`);
    console.log(`Description: ${ext.ImageDescription?.value?.replace(/<[^>]*>?/gm, '').trim().slice(0, 150)}...`);
    console.log(`Categories: ${ext.Categories?.value || 'N/A'}`);
  }
}

run().catch(console.error);
