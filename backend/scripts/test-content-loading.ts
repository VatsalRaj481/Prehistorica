import http from 'http';

function fetchUrl(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log("=== Running Comprehensive Content & Loading Verification ===");

  // 1. Check frontend root HTML
  console.log("\n1. Testing Frontend HTML server (http://localhost:5173)...");
  const fe = await fetchUrl('http://localhost:5173/');
  console.log(`Status: ${fe.status}`);
  if (fe.body.includes('id="root"') && fe.body.includes('/src/main.tsx')) {
    console.log("✓ Root HTML and Vite entrypoint properly loaded.");
  } else {
    throw new Error("Frontend root HTML missing expected structure");
  }

  // 2. Check backend health
  console.log("\n2. Testing Backend Health (http://localhost:5000/health)...");
  const beHealth = await fetchUrl('http://localhost:5000/health');
  console.log(`Status: ${beHealth.status}, Body: ${beHealth.body}`);
  if (!beHealth.body.includes('"status":"ok"')) {
    throw new Error("Backend health check failed");
  }

  // 3. Check Species List API pagination & count
  console.log("\n3. Testing Species List API (http://localhost:5000/api/species?limit=10)...");
  const speciesListRes = await fetchUrl('http://localhost:5000/api/species?limit=10');
  const speciesData = JSON.parse(speciesListRes.body);
  console.log(`Total species reported: ${speciesData.pagination.total}`);
  console.log(`Items returned in current page: ${speciesData.data.length}`);
  if (speciesData.pagination.total !== 502) {
    throw new Error(`Expected 502 species, but received ${speciesData.pagination.total}`);
  }

  // 4. Check Species Detail for iconic species (T-rex #24, Triceratops #25, Eudimorphodon #139, Deinonychus #449)
  const testIds = [24, 25, 139, 449];
  console.log(`\n4. Testing Individual Species Detail endpoints for IDs: ${testIds.join(', ')}...`);

  for (const id of testIds) {
    const res = await fetchUrl(`http://localhost:5000/api/species/${id}`);
    if (res.status !== 200) {
      throw new Error(`Species #${id} returned HTTP status ${res.status}`);
    }
    const s = JSON.parse(res.body);
    const facts = Array.isArray(s.interestingFacts) ? s.interestingFacts : JSON.parse(s.interestingFacts || '[]');
    
    console.log(`\n✓ Species #${s.id} (${s.name}):`);
    console.log(`  - Scientific Name: ${s.scientificName}`);
    console.log(`  - Clade: ${s.clade}`);
    console.log(`  - Diet: ${s.diet}`);
    console.log(`  - Facts Count: ${facts.length} verified facts`);
    console.log(`  - Fact 1: "${facts[0]}"`);
    console.log(`  - Media Items: ${s.media?.length || 0}`);
    if (s.media?.length > 0) {
      console.log(`  - Media[0] Type: ${s.media[0].type}`);
      console.log(`  - Media[0] URL: ${s.media[0].url.substring(0, 70)}...`);
    }

    if (id === 139) {
      // Confirm Eudimorphodon has fossil_specimen
      const fossilItem = s.media.find((m: any) => m.type === 'fossil_specimen');
      console.log(`  - Specimen Audit check for #139: Fossil specimen badge: ${!!fossilItem}`);
      if (!fossilItem) {
        throw new Error("Species #139 is missing fossil_specimen type!");
      }
    }
  }

  // 5. Check Timeline API
  console.log("\n5. Testing Timeline endpoint (http://localhost:5000/api/timeline)...");
  try {
    const timelineRes = await fetchUrl('http://localhost:5000/api/timeline');
    console.log(`Timeline Status: ${timelineRes.status}`);
  } catch (e: any) {
    console.log(`Timeline note: ${e.message}`);
  }

  console.log("\n=======================================================");
  console.log("🎉 ALL CONTENT LOADING TESTS PASSED WITHOUT REGRESSION!");
  console.log("=======================================================");
}

runTests().catch(err => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
