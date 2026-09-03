import fs from 'fs';
import path from 'path';

const report = JSON.parse(fs.readFileSync(path.join(__dirname, '../reports/phylopic_coverage_report.json'), 'utf8'));

console.log('Total none:', report.noCoverage.length);

const rejectedByLicense: any[] = [];
const noCoverageAtAll: any[] = [];

report.noCoverage.forEach((s: any) => {
  if (s.rejectedCandidates && s.rejectedCandidates.length > 0) {
    rejectedByLicense.push(s);
  } else {
    noCoverageAtAll.push(s);
  }
});

console.log(`\nRejected solely due to license policy: ${rejectedByLicense.length}`);
rejectedByLicense.forEach(s => {
  console.log(`[${s.speciesId}] ${s.name} (${s.scientificName}) | Clade: ${s.clade}`);
  s.rejectedCandidates.forEach((rc: any) => {
    console.log(`   UUID: ${rc.uuid} | lic: "${rc.license}" | reason: ${rc.reason}`);
  });
});

console.log(`\nNo coverage found on PhyloPic (0 candidates found): ${noCoverageAtAll.length}`);
noCoverageAtAll.forEach(s => {
  console.log(`[${s.speciesId}] ${s.name} (${s.scientificName}) | Clade: ${s.clade}`);
});
