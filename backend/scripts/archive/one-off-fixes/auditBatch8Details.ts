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

async function runBatch8Audit() {
  const pagesToInspect = [
    { id: 87, name: 'Proterosuchus fergusi', file: 'File:Lystrosaurus_murrayi_and_Proterosuchus_fergusi.jpg' },
    { id: 88, name: 'Erythrosuchus africanus', file: 'File:Erythrosuchus.jpg' },
    { id: 89, name: 'Garjainia madiba', file: 'File:Garjainia_madiba.png' },
    { id: 90, name: 'Vjushkovia triplicostata', file: 'File:Youngosuchus_restoration.jpg' },
    { id: 91, name: 'Ticinosuchus ferox', file: 'File:Ticinosuchus.jpg' },
    { id: 93, name: 'Fasolasuchus tenax', file: 'File:Fasolasuchus.png' },
    { id: 94, name: 'Prestosuchus chiniquensis', file: 'File:Prestosuchus.jpg' },
    { id: 95, name: 'Batrachotomus kupferzellensis', file: 'File:Batrachotomus1DB.jpg' },
    { id: 96, name: 'Ornithosuchus woodwardi', file: 'File:Ornithosuchus.jpg' },
    { id: 98, name: 'Smilosuchus adamanensis', file: 'File:Smilosuchus-reconstructions-Jeff-Martz-600-px-tiny-Oct-2014-Tetrapod-Zoology_adamanensis.png' }
  ];

  for (const item of pagesToInspect) {
    try {
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
    } catch (e) {
      console.error(`Error on ${item.name}:`, e);
    }
  }
}

runBatch8Audit().catch(console.error);
