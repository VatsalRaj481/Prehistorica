import fs from 'fs';
import path from 'path';

const reportsDir = path.join(__dirname, '../reports');
const jsonPath = path.join(reportsDir, 'true-media-audit-502.json');
const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 1. Inspect Wrong Taxon cases
const wrongTaxonRows = rows.filter((r: any) => r.proposedAction === 'DETACH FROM CURRENT TAXON' || r.proposedAction === 'REASSIGN TO CORRECT TAXON' || r.taxonomicAssignmentStatus === 'WRONG TAXON' || r.reason.includes('wrong species') || r.reason.includes('depicts'));

console.log(`=== QUESTION 1: WRONG TAXON CASES (${wrongTaxonRows.length} total) ===`);
wrongTaxonRows.forEach((r: any) => {
  console.log(`ID ${r.id} *${r.targetTaxon}*: \`${r.currentFileTitle}\` | Depicts: *${r.actualDepictedTaxon}* | Reason: ${r.reason}`);
});

// 2. Inspect 49 Unverified cases
const unverifiedRows = rows.filter((r: any) => r.proposedAction === 'NEEDS MANUAL SCIENTIFIC REVIEW' || r.evidenceLevel === 'UNVERIFIED' || r.license === 'UNVERIFIED' || r.artist === 'UNVERIFIED');

console.log(`\n=== QUESTION 2: UNVERIFIED CASES (${unverifiedRows.length} total) ===`);

const groupA_Supabase: any[] = [];
const groupB_Questionable: any[] = [];

unverifiedRows.forEach((r: any) => {
  if (r.originalSourcePage.includes('supabase.co') || r.currentFileTitle.match(/^\d+-/)) {
    groupA_Supabase.push(r);
  } else {
    groupB_Questionable.push(r);
  }
});

console.log(`\nGroup A: Self-hosted Supabase seed files (${groupA_Supabase.length} taxa):`);
groupA_Supabase.forEach((r: any) => {
  console.log(`  - ID #${r.id} *${r.targetTaxon}*: \`${r.currentFileTitle}\` (${r.originalSourcePage})`);
});

console.log(`\nGroup B: Genuinely questionable / unknown-origin images (${groupB_Questionable.length} taxa):`);
groupB_Questionable.forEach((r: any) => {
  console.log(`  - ID #${r.id} *${r.targetTaxon}*: \`${r.currentFileTitle}\` (Reason: ${r.reason})`);
});
