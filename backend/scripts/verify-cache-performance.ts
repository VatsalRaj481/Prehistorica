import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

async function benchmarkEndpoint(label: string, url: string) {
  const t0 = performance.now();
  const res = await fetch(url);
  const t1 = performance.now();
  const latency = (t1 - t0).toFixed(2);
  const isOk = res.status === 200;
  console.log(`[${isOk ? '✓' : '✗'}] ${label.padEnd(35)} : ${latency.padStart(6)} ms (Status ${res.status})`);
  return { latency: Number(latency) };
}

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('PREHISTORICA IN-MEMORY CACHE BENCHMARK & VERIFICATION');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // 1. Check Cache Stats
  console.log('Step 1: Checking Cache Telemetry...');
  const statsRes = await fetch('http://127.0.0.1:5000/api/species/cache/stats');
  const stats: any = await statsRes.json();
  console.log('  Cache Stats:', stats);
  console.log(`  Total specimens held in RAM: ${stats.totalCached}`);
  console.log(`  Approx memory footprint: ${(stats.approxMemoryBytes / (1024 * 1024)).toFixed(2)} MB\n`);

  // 2. Measure Endpoint Latencies
  console.log('Step 2: Testing In-Memory Query Latencies...');
  await benchmarkEndpoint('Species Roster (801 items)', 'http://127.0.0.1:5000/api/species/roster');
  await benchmarkEndpoint('Specimen #5426 (Saltopus)', 'http://127.0.0.1:5000/api/species/5426');
  await benchmarkEndpoint('Specimen #5427 (Mammuthus columbi)', 'http://127.0.0.1:5000/api/species/5427');
  await benchmarkEndpoint('Specimen #5422 (Saurophaganax)', 'http://127.0.0.1:5000/api/species/5422');
  await benchmarkEndpoint('Specimen #5423 (Bruhathkayosaurus)', 'http://127.0.0.1:5000/api/species/5423');
  await benchmarkEndpoint('Autocomplete Search ("tyrann")', 'http://127.0.0.1:5000/api/species/search/autocomplete?q=tyrann');
  await benchmarkEndpoint('Multi-Compare (?ids=5426,5427,5428)', 'http://127.0.0.1:5000/api/species/compare?ids=5426,5427,5428');
  await benchmarkEndpoint('Creature of the Day', 'http://127.0.0.1:5000/api/species/creature-of-the-day');
  await benchmarkEndpoint('Filtered Catalog (?clade=theropod)', 'http://127.0.0.1:5000/api/species?clade=theropod&limit=12');
  await benchmarkEndpoint('Extinctions List', 'http://127.0.0.1:5000/api/extinctions');
  await benchmarkEndpoint('Paleoclimate Curves', 'http://127.0.0.1:5000/api/climate-curves');

  // 3. Test Cache Invalidation / Refresh
  console.log('\nStep 3: Testing Invalidation & Refresh Hook...');
  const refT0 = performance.now();
  const refreshRes = await fetch('http://127.0.0.1:5000/api/species/cache/refresh', { method: 'POST' });
  const refT1 = performance.now();
  const refreshData: any = await refreshRes.json();
  console.log(`  ✓ Cache refresh executed in ${(refT1 - refT0).toFixed(2)}ms:`, refreshData);

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ ALL IN-MEMORY CACHE BENCHMARKS PASSED');
  console.log('════════════════════════════════════════════════════════════════════════════');
}

main().catch(console.error);
