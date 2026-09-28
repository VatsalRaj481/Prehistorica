const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const fs = require('fs');
const path = require('path');

const species = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'prisma', 'species_full_export.json'), 'utf8'));

async function run() {
  console.log('Auditing unique silhouettes across', species.length, 'species...');
  
  // Collect all unique URLs
  const urlMap = new Map();
  for (const s of species) {
    if (!s.comparisonSilhouette) continue;
    let payload;
    try {
      payload = typeof s.comparisonSilhouette === 'string' ? JSON.parse(s.comparisonSilhouette) : s.comparisonSilhouette;
    } catch {
      continue;
    }
    if (!payload.url) continue;
    if (!urlMap.has(payload.url)) {
      urlMap.set(payload.url, { payload, speciesList: [] });
    }
    urlMap.get(payload.url).speciesList.push(s);
  }

  console.log(`Found ${urlMap.size} unique silhouette URLs.`);
  const urls = Array.from(urlMap.keys());
  const results = new Map();

  // Fetch in parallel chunks of 25
  const chunkSize = 25;
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async (url) => {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Prehistorica-Curator/2.0' } });
        if (!res.ok) {
          results.set(url, { aspect: null, error: `HTTP ${res.status}` });
          return;
        }
        const svg = await res.text();
        const vb = svg.match(/viewBox=["']([^"']+)["']/i);
        if (vb) {
          const parts = vb[1].trim().split(/\s+/).map(Number);
          const aspect = parts[2] / parts[3];
          results.set(url, { aspect, vb: vb[1] });
        } else {
          results.set(url, { aspect: 2.0, vb: 'none' });
        }
      } catch (err) {
        results.set(url, { aspect: null, error: err.message });
      }
    }));
  }

  const suspicious = [];
  for (const [url, data] of urlMap.entries()) {
    const res = results.get(url);
    if (!res || res.aspect === null) continue;
    
    // In nature, horizontal lateral profiles of tetrapods, reptiles, and fish are elongated (aspect >= 1.8).
    // Head busts, skulls, and rearing poses have aspect ratios < 1.7!
    if (res.aspect < 1.7) {
      suspicious.push({
        url,
        aspect: res.aspect.toFixed(2),
        viewBox: res.vb,
        credit: data.payload.credit,
        taxon: data.payload.taxon,
        species: data.speciesList.map(s => `${s.name} (#${s.id})`)
      });
    }
  }

  console.log(`\n🚨 FOUND ${suspicious.length} SUSPICIOUS NON-FULL-BODY / HEAD BUST SILHOUETTES:`);
  suspicious.forEach((item, idx) => {
    console.log(`\n[${idx + 1}] Aspect: ${item.aspect}:1 (viewBox: ${item.viewBox})`);
    console.log(`    Credit: ${item.credit}`);
    console.log(`    Taxon: ${item.taxon}`);
    console.log(`    URL: ${item.url}`);
    console.log(`    Affects ${item.species.length} species: ${item.species.join(', ')}`);
  });
}

run().catch(console.error);
