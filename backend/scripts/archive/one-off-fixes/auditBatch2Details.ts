const pagesToInspect = [
  { id: 4, name: 'Dunkleosteus terrelli', page: 'File:Dunkleosteus_terrelli_life_restoration.png' },
  { id: 9, name: 'Dimetrodon grandis', page: 'File:Dimetrodon_grandis_in_%22high_walk%22_pose.png' },
  { id: 11, name: 'Helicoprion bessonowi', page: 'File:Karpinsky_1899_Helicoprion_bessonowi_Fig._73.png' },
  { id: 12, name: 'Scutosaurus karpinskii', page: 'File:Scutosaurus_restoration.jpg' },
  { id: 13, name: 'Inostrancevia alexandri', page: 'File:Inostrancevia_A6_digital.jpg' },
  { id: 14, name: 'Coelophysis bauri', page: 'File:Coelophysis_TD.png' },
  { id: 15, name: 'Plateosaurus trossingensis', page: 'File:Plateosaurus_picture4.png' },
  { id: 16, name: 'Postosuchus kirkpatricki', page: 'File:Postosuchus_kirkpatricki.jpg' },
  { id: 17, name: 'Dilophosaurus wetherilli', page: 'File:Life_reconstruction_of_Dilophosaurus_wetherilli.png' },
  { id: 18, name: 'Stegosaurus stenops', page: 'File:Stegosaurus_stenops_Life_Reconstruction_%28flipped%29.png' },
  { id: 19, name: 'Brachiosaurus altithorax', page: 'File:Brachiosaurus_DB.jpg' },
  { id: 20, name: 'Allosaurus fragilis', page: 'File:Allosaurus_BW_mirrored.jpg' },
];

async function inspectBatch2Wiki() {
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

inspectBatch2Wiki();
