const fs = require('fs');
const path = require('path');
const db = require('../prisma/species_full_export.json');

function normalize(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findMatch(name) {
  const norm = normalize(name);
  return db.find(s => {
    const sNorm = normalize(s.name);
    const sciNorm = normalize(s.scientificName);
    return sNorm === norm || sciNorm === norm || sNorm.includes(norm) || sciNorm.includes(norm) || norm.includes(sNorm);
  });
}

const driftPath = path.join(__dirname, '../../frontend/src/components/PaleoDriftViewer.tsx');
const code = fs.readFileSync(driftPath, 'utf8');

// Match each era
const eraBlockRegex = /id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],[\s\S]*?notableFormations:\s*\[([\s\S]*?)\]\s*\}/g;
let eraMatch;

const allUncataloged = [];

while ((eraMatch = eraBlockRegex.exec(code)) !== null) {
  const eraId = eraMatch[1];
  const eraName = eraMatch[2];
  const formationsBlock = eraMatch[3];

  console.log(`\n========================================`);
  console.log(`ERA: ${eraName} (${eraId})`);
  console.log(`========================================`);

  const formationRegex = /name:\s*['"]([^'"]+)['"],\s*modernLocation:\s*['"]([^'"]+)['"],[\s\S]*?species:\s*\[([^\]]+)\]/g;
  let formMatch;

  while ((formMatch = formationRegex.exec(formationsBlock)) !== null) {
    const formName = formMatch[1];
    const loc = formMatch[2];
    const rawSpecies = formMatch[3].split(',').map(s => s.trim().replace(/['"`]/g, '')).filter(Boolean);

    console.log(`\n  📍 Formation: ${formName} [${loc}]`);
    for (const sp of rawSpecies) {
      const match = findMatch(sp);
      if (match) {
        console.log(`     ✓ ${sp} -> #${match.id} ${match.name} (${match.scientificName})`);
      } else {
        console.log(`     ❌ UNCATALOGED: ${sp}`);
        allUncataloged.push({
          era: eraName,
          formation: formName,
          species: sp
        });
      }
    }
  }
}

console.log(`\n========================================`);
console.log(`SUMMARY: Total uncataloged species found: ${allUncataloged.length}`);
console.log(`========================================`);
allUncataloged.forEach((u, i) => {
  console.log(`${i + 1}. ${u.species} (${u.formation} • ${u.era})`);
});
