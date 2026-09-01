import https from 'https';

function searchWikiCommons(query: string): Promise<any[]> {
  return new Promise((resolve) => {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`;
    const req = https.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PrehistoricaEncyclopediaBot/2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.query ? json.query.search : []);
        } catch (e) {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
  });
}

function getWikiPageInfo(title: string): Promise<any> {
  return new Promise((resolve) => {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|extmetadata|user&format=json`;
    const req = https.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PrehistoricaEncyclopediaBot/2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = Object.values(json.query.pages) as any[];
          resolve(pages[0] || null);
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
  });
}

async function searchCandidates() {
  console.log(`=== SEARCHING COMMONS CANDIDATES FOR TAXON #1670 (Lightningclaw) ===`);
  const lightningSearch = await searchWikiCommons('Lightningclaw');
  console.log(`Found ${lightningSearch.length} results for 'Lightningclaw':`);
  for (const item of lightningSearch) {
    const info = await getWikiPageInfo(item.title);
    const ii = info?.imageinfo ? info.imageinfo[0] : {};
    const ext = ii.extmetadata || {};
    console.log(`- Title: ${item.title}`);
    console.log(`  Url: ${ii.url}`);
    console.log(`  Artist: ${ext.Artist?.value?.replace(/<[^>]*>?/gm, '').trim() || ii.user || 'Unknown'}`);
    console.log(`  License: ${ext.LicenseShortName?.value || ext.UsageTerms?.value || 'Unknown'}`);
  }

  console.log(`\n=== SEARCHING COMMONS CANDIDATES FOR TAXON #2317 (Indochelys spatulata) ===`);
  const indochelysSearch = await searchWikiCommons('Indochelys');
  console.log(`Found ${indochelysSearch.length} results for 'Indochelys':`);
  for (const item of indochelysSearch) {
    const info = await getWikiPageInfo(item.title);
    const ii = info?.imageinfo ? info.imageinfo[0] : {};
    const ext = ii.extmetadata || {};
    console.log(`- Title: ${item.title}`);
    console.log(`  Url: ${ii.url}`);
    console.log(`  Artist: ${ext.Artist?.value?.replace(/<[^>]*>?/gm, '').trim() || ii.user || 'Unknown'}`);
    console.log(`  License: ${ext.LicenseShortName?.value || ext.UsageTerms?.value || 'Unknown'}`);
  }
}

searchCandidates().catch(console.error);
