const pagesToInspect = [
  { id: 62, name: 'Procompsognathus triassicus', page: 'File:Procompsognathus.jpg' },
  { id: 63, name: 'Liliensternus liliensterni', page: 'File:Liliensternus.jpg' },
  { id: 64, name: 'Halticosaurus longicotylus', page: 'File:Liliensternus_liliensterni.JPG' },
  { id: 65, name: 'Gojirasaurus quayi', page: 'File:Gojirasaurus_BW.jpg' },
  { id: 66, name: 'Zupaysaurus rougieri', page: 'File:Zupaysaurus.jpg' },
  { id: 67, name: 'Thecodontosaurus antiquus', page: 'File:Thecodontosaurus.jpg' },
  { id: 68, name: 'Riojasaurus incertus', page: 'File:Riojasaurus.jpg' },
  { id: 70, name: 'Isanosaurus attavipachi', page: 'File:Isanosaurus_attavipachi_NT.jpg' },
  { id: 72, name: 'Antetonitrus ingenipes', page: 'File:Antetonitrus_reconstruction.jpg' },
  { id: 73, name: 'Lessemsaurus sauropoides', page: 'File:Lessemsaurus.jpg' }
];

async function inspectBatch6Wiki() {
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

inspectBatch6Wiki();
