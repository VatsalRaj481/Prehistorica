const pagesToInspect = [
  { id: 32, name: 'Mosasaurus hoffmannii', page: 'File:Mosasaurus_ichthyosaurus.jpg' },
  { id: 33, name: 'Elasmosaurus platyurus', page: 'File:Elasmosaurus_platyurus.png' },
  { id: 34, name: 'Gastornis parisiensis', page: 'File:Gastornis_giganteus_DB.jpg' },
  { id: 35, name: 'Basilosaurus cetoides', page: 'File:Basilosaurus_cetoides_recon.png' },
  { id: 36, name: 'Otodus megalodon', page: 'File:O._megalodon_reconstruction_2025.png' },
  { id: 37, name: 'Smilodon fatalis', page: 'File:Smilodon_fatalis_Sergiodlarosa.jpg' },
  { id: 38, name: 'Mammuthus primigenius', page: 'File:Mammuthus_primigenius_DB.jpg' },
  { id: 39, name: 'Megatherium americanum', page: 'File:Megatherium_americanum_by_sphenaphinae.png' },
  { id: 40, name: 'Coelodonta antiquitatis', page: 'File:Coelodonta,_from_Osborn,_H._F._(1917)._The_origin_and_evolution_of_life,_on_the_theory_of_action,_reaction_and_interaction_of_energy.jpg' },
  { id: 41, name: 'Doedicurus clavicaudatus', page: 'File:Doedicurus_and_Glyptodon.jpg' }
];

async function inspectBatch4Wiki() {
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

inspectBatch4Wiki();
