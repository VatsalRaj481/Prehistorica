

const sourceUrls = [
  { id: 1, name: 'Anomalocaris canadensis', page: 'File:Anomalocaris_canadensis.jpg', url: 'https://commons.wikimedia.org/wiki/File:Anomalocaris_canadensis.jpg' },
  { id: 2, name: 'Hallucigenia sparsa', page: 'File:Hallucigenia_sparsa_2025.jpg', url: 'https://commons.wikimedia.org/wiki/File:Hallucigenia_sparsa_2025.jpg' },
  { id: 3, name: 'Opabinia regalis', page: 'File:20191108_Opabinia_regalis_with_lobopods.png', url: 'https://commons.wikimedia.org/wiki/File:20191108_Opabinia_regalis_with_lobopods.png' },
  { id: 4, name: 'Dunkleosteus terrelli', page: 'File:Dunkleosteus_terrelli_life_restoration.png', url: 'https://commons.wikimedia.org/wiki/File:Dunkleosteus_terrelli_life_restoration.png' },
  { id: 5, name: 'Tiktaalik roseae', page: 'File:Reconstruction_of_Tiktaalik_roseae.jpg', url: 'https://commons.wikimedia.org/wiki/File:Reconstruction_of_Tiktaalik_roseae.jpg' },
  { id: 6, name: 'Ichthyostega stensioei', page: 'File:Ichthyostega_BW.jpg', url: 'https://commons.wikimedia.org/wiki/File:Ichthyostega_BW.jpg' },
  { id: 7, name: 'Arthropleura armata', page: 'File:Arthropleura_NT_small.jpg', url: 'https://commons.wikimedia.org/wiki/File:Arthropleura_NT_small.jpg' },
  { id: 8, name: 'Meganeura monyi', page: 'File:Meganeura_monyi_wings_Brongniart_1893.png', url: 'https://commons.wikimedia.org/wiki/File:Meganeura_monyi_wings_Brongniart_1893.png' },
  { id: 9, name: 'Dimetrodon grandis', page: 'File:Dimetrodon_grandis_in_%22high_walk%22_pose.png', url: 'https://commons.wikimedia.org/wiki/File:Dimetrodon_grandis_in_%22high_walk%22_pose.png' },
  { id: 10, name: 'Edaphosaurus pogonias', page: 'File:Edaphosaurus_pogonias.jpg', url: 'https://commons.wikimedia.org/wiki/File:Edaphosaurus_pogonias.jpg' },
];

async function auditBatch1() {
  for (const item of sourceUrls) {
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
    } catch (e) {
      console.error(`Error on ${item.name}:`, e);
    }
  }
}

auditBatch1();
