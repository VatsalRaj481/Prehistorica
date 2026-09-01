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

async function runBatch12Audit() {
  const pagesToInspect = [
    { id: 131, name: 'Lariosaurus', file: 'File:Lariosaurus,_from_Osborn,_H._F._(1917)._The_origin_and_evolution_of_life,_on_the_theory_of_action,_reaction_and_interaction_of_energy.jpg' },
    { id: 132, name: 'Ceresiosaurus', file: 'File:Meride_Limestone_paleofauna.png' },
    { id: 133, name: 'Pistosaurus longaevus', file: 'File:Pistosaurus_BW.jpg' },
    { id: 134, name: 'Simosaurus gaillardoti', file: 'File:Simosaurus.jpg' },
    { id: 135, name: 'Mixosaurus cornalianus', file: 'File:Mixosaurus_Life_Restoration.jpg' },
    { id: 136, name: 'Besanosaurus leptorhynchus', file: 'File:Besanosaurus_Environment.png' },
    { id: 137, name: 'Shastasaurus pacificus', file: 'File:Species_of_Shastasaurus.jpg' },
    { id: 138, name: 'Guanlingsaurus liangae', file: 'File:Guanlingsaurus_restoration.jpg' },
    { id: 139, name: 'Eudimorphodon ranzii', file: 'File:Eudimorphodon.jpg' },
    { id: 140, name: 'Preondactylus buffarinii', file: 'File:Preondactylus.jpg' }
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

runBatch12Audit().catch(console.error);
