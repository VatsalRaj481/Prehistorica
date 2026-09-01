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
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
  });
}

async function runBatch9Audit() {
  const pagesToInspect = [
    { id: 99, name: 'Phytosaurus / Parasuchus', file: 'File:Parasuchus_DB.jpg' },
    { id: 100, name: 'Machaeroprosopus / Redondasaurus', file: 'File:Redondasaurus_gregorii.png' },
    { id: 101, name: 'Leptosuchus crosbiensis', file: 'File:Leptosuchus.jpg' },
    { id: 102, name: 'Redondasaurus gregorii', file: 'File:Redondasaurus.jpg' },
    { id: 103, name: 'Mystriosuchus planirostris', file: 'File:Mystriosuchus.jpg' },
    { id: 105, name: 'Stagonolepis robertsoni', file: 'File:Stagonolepis.jpg' },
    { id: 106, name: 'Aetosaurus ferratus', file: 'File:Aetosaurus.jpg' },
    { id: 107, name: 'Neoaetosauroides engaeus', file: 'File:Neoaetosauroides.jpg' },
    { id: 108, name: 'Longosuchus meadei', file: 'File:Longosuchus_BW_cropped.png' },
    { id: 109, name: 'Gracilisuchus stipanicicorum', file: 'File:Gracilisuchus_stipanicicorum.png' }
  ];

  for (const item of pagesToInspect) {
    const p = await getWikiPageInfo(item.file);
    const info = p ? (p.imageinfo ? p.imageinfo[0] : {}) : {};
    const ext = info.extmetadata || {};
    console.log(`\n=== TAXON #${item.id}: ${item.name} ===`);
    console.log(`Page: ${item.file}`);
    console.log(`Title: ${p?.title || 'N/A'}`);
    console.log(`Artist: ${ext.Artist?.value?.replace(/<[^>]*>?/gm, '').trim() || info.user || 'Unknown'}`);
    console.log(`License: ${ext.LicenseShortName?.value || ext.UsageTerms?.value || 'Unknown'}`);
    console.log(`License URL: ${ext.LicenseUrl?.value || 'N/A'}`);
    console.log(`Description: ${ext.ImageDescription?.value?.replace(/<[^>]*>?/gm, '').trim().slice(0, 150) || 'N/A'}...`);
    console.log(`Categories: ${ext.Categories?.value || 'N/A'}`);
  }
}

runBatch9Audit().catch(console.error);
