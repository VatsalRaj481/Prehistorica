const pagesToInspect = [
  { id: 42, name: 'Thylacoleo carnifex', page: 'File:Thylacoleo_carnifex.jpg' },
  { id: 43, name: 'Diprotodon optatum', page: 'File:Dirpotodon_optatum.jpg' },
  { id: 50, name: 'Lisowicia bojani', page: 'File:Lisowicia_bojani_Wikipedia_Juandertal.jpg' },
  { id: 51, name: 'Cynognathus crateronotus', page: 'File:Cynognathus_NT_small.jpg' },
  { id: 52, name: 'Thrinaxodon liorhinus', page: 'File:Thrinaxodon.jpg' },
  { id: 53, name: 'Shonisaurus popularis', page: 'File:Life_restoration_of_Shonisaurus_popularis.png' },
  { id: 54, name: 'Cymbospondylus youngorum', page: 'File:Cymbospondylus_youngorum_reconstruction_2023.jpg' },
  { id: 55, name: 'Peteinosaurus zambellii', page: 'File:Peteinosaurus.jpg' },
  { id: 60, name: 'Eodromaeus zaiaki', page: 'File:Eodromaeus.jpg' },
  { id: 61, name: 'Nyasasaurus parringtoni', page: 'File:Nyasasaurus.jpg' }
];

async function inspectBatch5Wiki() {
  for (const item of pagesToInspect) {
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

inspectBatch5Wiki();
