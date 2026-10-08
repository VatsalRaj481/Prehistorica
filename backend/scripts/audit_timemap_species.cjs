const fs = require('fs');
const path = require('path');
const db = require('../prisma/species_full_export.json');

function normalize(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findMatch(name) {
  const norm = normalize(name);
  if (norm.includes('canisdirus') || norm.includes('direwolf') || norm.includes('aenocyon')) {
    const d = db.find(s => normalize(s.scientificName).includes('dirus') || normalize(s.name).includes('direwolf'));
    if (d) return d;
  }
  return db.find(s => {
    const sNorm = normalize(s.name);
    const sciNorm = normalize(s.scientificName);
    return sNorm === norm || sciNorm === norm || sNorm.includes(norm) || sciNorm.includes(norm) || norm.includes(sNorm) || norm.includes(sciNorm);
  });
}

// 1. Audit PaleoDriftViewer.tsx
const driftPath = path.join(__dirname, '../../frontend/src/components/PaleoDriftViewer.tsx');
const driftCode = fs.readFileSync(driftPath, 'utf8');

// Match species arrays
const speciesMatches = driftCode.match(/species:\s*\[([^\]]+)\]/g) || [];
const allDriftSpecies = new Set();

for (const m of speciesMatches) {
  const content = m.replace(/species:\s*\[/, '').replace(/\]/, '');
  const items = content.split(',').map(s => s.trim().replace(/['"`]/g, '')).filter(Boolean);
  items.forEach(item => allDriftSpecies.add(item));
}

console.log('--- PALEO DRIFT VIEWER AUDIT ---');
console.log(`Total species mentioned in PaleoDrift: ${allDriftSpecies.size}`);
const uncatalogedDrift = [];
for (const sp of allDriftSpecies) {
  const match = findMatch(sp);
  if (!match) {
    uncatalogedDrift.push(sp);
  } else {
    // console.log(`✓ ${sp} -> #${match.id} ${match.name}`);
  }
}
console.log('Uncataloged in PaleoDriftViewer:', uncatalogedDrift);

// 2. Audit FormationEcosystemDiorama.tsx
const dioramaPath = path.join(__dirname, '../../frontend/src/components/FormationEcosystemDiorama.tsx');
const dioramaCode = fs.readFileSync(dioramaPath, 'utf8');
// Diorama uses dynamically fetched roster or species? Let's check how diorama handles species!
console.log('\n--- ECOSYSTEM DIORAMA AUDIT ---');
// Let's check if there are hardcoded species names in diorama
const dioramaSpeciesRegex = /name:\s*['"`]([^'"`]+)['"`]/g;
let dMatch;
const dioramaNames = new Set();
while ((dMatch = dioramaSpeciesRegex.exec(dioramaCode)) !== null) {
  dioramaNames.add(dMatch[1]);
}
console.log('Sample names in Diorama code (formations or species):', Array.from(dioramaNames).slice(0, 15));

// 3. Audit ChronoTimelineSlider.tsx
const chronoPath = path.join(__dirname, '../../frontend/src/components/ChronoTimelineSlider.tsx');
const chronoCode = fs.readFileSync(chronoPath, 'utf8');
console.log('\n--- CHRONO TIMELINE SLIDER AUDIT ---');
// Chrono uses db/roster directly, but let's check extinction events or hardcoded lists
const extinctRegex = /name:\s*['"`]([^'"`]+)['"`]/g;
let cMatch;
const chronoNames = new Set();
while ((cMatch = extinctRegex.exec(chronoCode)) !== null) {
  chronoNames.add(cMatch[1]);
}
console.log('Sample names in Chrono code:', Array.from(chronoNames).slice(0, 10));

// 4. Audit TimeMap.tsx
const timeMapPath = path.join(__dirname, '../../frontend/src/pages/TimeMap.tsx');
const timeMapCode = fs.readFileSync(timeMapPath, 'utf8');
console.log('\n--- TIME MAP AUDIT ---');
// TimeMap discovers fossil formations and queries backend /species
