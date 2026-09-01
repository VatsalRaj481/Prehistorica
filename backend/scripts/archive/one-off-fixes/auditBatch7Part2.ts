const pagesPart2 = [
  { id: 81, name: 'Asilisaurus kongwe', page: 'File:Asilisaurus.jpg' },
  { id: 82, name: 'Marasuchus lilloensis', page: 'File:Marasuchus.jpg' },
  { id: 83, name: 'Lagerpeton chanarensis', page: 'File:Lagerpeton_NT_small.jpg' },
  { id: 84, name: 'Ixalerpeton polesinensis', page: 'File:Brazilian_Lagerpetidae_diversity.jpg' },
  { id: 85, name: 'Dromomeron romeri', page: 'File:Dromomeron_BW.jpg' },
  { id: 86, name: 'Euparkeria capensis', page: 'File:Euparkeria.jpg' }
];

async function inspectPart2() {
  for (const item of pagesPart2) {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(item.page)}&prop=imageinfo&iiprop=url|mime|extmetadata|user|size&format=json`;
    try {
      const res = await fetch(apiUrl, { headers: { 'User-Agent': 'PrehistoricaBot/2.0' } });
      const json: any = await res.json();
      const pages = Object.values(json.query.pages) as any[];
      const p = pages[0];
      const info = p.imageinfo ? p.imageinfo[0] : {};
      const ext = info.extmetadata || {};
      
      console.log(`\n=== TAXON #${item.id}: ${item.name} ===`);
      console.log(`Page: ${item.page}`);
      console.log(`Title: ${p.title}`);
      console.log(`Artist: ${ext.Artist?.value?.replace(/<[^>]*>?/gm, '').trim() || info.user || 'Unknown'}`);
      console.log(`License: ${ext.LicenseShortName?.value || ext.UsageTerms?.value || 'Unknown'}`);
      console.log(`License URL: ${ext.LicenseUrl?.value || 'N/A'}`);
      console.log(`Description: ${ext.ImageDescription?.value?.replace(/<[^>]*>?/gm, '').trim().slice(0, 150)}...`);
      console.log(`Categories: ${ext.Categories?.value || 'N/A'}`);
      console.log(`Dimensions: ${info.width || 'N/A'}x${info.height || 'N/A'}, Size: ${info.size || 'N/A'} bytes`);
    } catch (e) {
      console.error(`Error on ${item.name}:`, e);
    }
  }
}

inspectPart2();
