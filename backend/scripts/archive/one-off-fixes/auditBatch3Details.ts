const pagesToInspect = [
  { id: 21, name: 'Archaeopteryx lithographica', page: 'File:202010_Archaeopteryx_lithographica.png' },
  { id: 22, name: 'Yi qi', page: 'File:Speculative_mating_display_of_Yi_qi.png' },
  { id: 24, name: 'Tyrannosaurus rex', page: 'File:Tyrannosaurus_BW.jpg' },
  { id: 25, name: 'Triceratops horridus', page: 'File:Triceratops_horridus.png' },
  { id: 26, name: 'Velociraptor mongoliensis', page: 'File:Velociraptor_TD.png' },
  { id: 27, name: 'Parasaurolophus walkeri', page: 'File:Life_reconstruction_of_Parasaurolophus_walkeri.png' },
  { id: 28, name: 'Ankylosaurus magniventris', page: 'File:Ankylosaurus_TD.png' },
  { id: 29, name: 'Carnotaurus sastrei', page: 'File:Carnotaurus_life_restoration_(mirrored).jpg' },
  { id: 30, name: 'Quetzalcoatlus northropi', page: 'File:Quetzalcoatlus_northropi.png' },
  { id: 31, name: 'Pteranodon longiceps', page: 'File:Pteranodon_longiceps_-_1.jpg' }
];

async function inspectBatch3Wiki() {
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

inspectBatch3Wiki();
