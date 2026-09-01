import https from 'https';

function getWikiPageInfo(title: string): Promise<any> {
  return new Promise((resolve) => {
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

async function runBatch11Audit() {
  const pagesToInspect = [
    { id: 121, name: 'Sillosuchus longicervix', file: 'File:Sillosuchus.jpg' },
    { id: 122, name: 'Sharovipteryx mirabilis', file: 'File:Sharovipteryx.jpg' },
    { id: 123, name: 'Longisquama insignis', file: 'File:Longisquama.png' },
    { id: 124, name: 'Tanystropheus longobardicus', file: 'File:Tanystropheus.jpg' },
    { id: 125, name: 'Macrocnemus bassanii', file: 'File:Nothosaur_and_Macrocnemus_B._Scheffold.jpg' },
    { id: 126, name: 'Dinocephalosaurus orientalis', file: 'File:Dinocephalosaurus_orientalis.png' },
    { id: 127, name: 'Placodus gigas', file: 'File:Placodus_gigas_reconstruction_2.jpg' },
    { id: 128, name: 'Cyamodus hildegardis', file: 'File:Cyamodus_3.jpg' },
    { id: 129, name: 'Henodus chelyops', file: 'File:Henodus_chelyops.jpg' },
    { id: 130, name: 'Nothosaurus mirabilis', file: 'File:Nothosaurus.jpg' }
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

runBatch11Audit().catch(console.error);
