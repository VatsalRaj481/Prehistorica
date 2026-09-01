import fs from 'fs';
import path from 'path';

const jsonPath = path.join(__dirname, 'orphan_audit_results.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log("=== METRICS ===");
console.log(JSON.stringify(data.summary, null, 2));

console.log("\n=== POSSIBLE MATCHES (Needs Manual Check) ===");
console.log(JSON.stringify(data.possibleMatches, null, 2));

console.log("\n=== CONFIRMED ORPHANS (First 20) ===");
console.log(JSON.stringify(data.confirmedOrphans.slice(0, 20), null, 2));
