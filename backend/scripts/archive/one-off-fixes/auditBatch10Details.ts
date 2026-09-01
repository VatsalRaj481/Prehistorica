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

async function runBatch10Audit() {
  const pagesToInspect = [
    { id: 110, name: 'Erpetosuchus granti', file: 'File:Erpetosuchus_granti.png' },
    { id: 111, name: 'Saltoposuchus connectens', file: 'File:Saltoposuchus_connectens.png' },
    { id: 112, name: 'Terrestrisuchus gracilis', file: 'File:Terrestrisuchus.jpg' },
    { id: 113, name: 'Hesperosuchus agilis', file: 'File:Hesperosuchus.jpg' },
    { id: 114, name: 'Sphenosuchus acutus', file: 'File:Sphenosuchus_acutus.png' },
    { id: 115, name: 'Protosuchus richardsoni', file: 'File:Protosuchus_BW.jpg' },
    { id: 116, name: 'Effigia okeeffeae', file: 'File:Effigia_okeeffeae.png' },
    { id: 117, name: 'Shuvosaurus inexpectatus', file: 'File:Shuvosaurus_inexpectatus.jpg' },
    { id: 119, name: 'Lotosaurus adentus', file: 'File:Lotosaurus_BW.jpg' },
    { id: 120, name: 'Arizonasaurus babbitti', file: 'File:Arizonasaurus_babbitti.png' }
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

runBatch10Audit().catch(console.error);
