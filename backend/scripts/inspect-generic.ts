import fs from 'fs';
import path from 'path';

const report = JSON.parse(fs.readFileSync(path.join(__dirname, '../reports/phylopic_coverage_report.json'), 'utf8'));

console.log('Total generic matches:', report.genericMatches.length);
report.genericMatches.slice(0, 20).forEach((s: any) => {
  console.log(`[${s.speciesId}] ${s.name} | sci: "${s.scientificName}" | match taxon: "${s.match.taxon}" | lic: "${s.match.license}" | author: "${s.match.uploadedBy}"`);
});
