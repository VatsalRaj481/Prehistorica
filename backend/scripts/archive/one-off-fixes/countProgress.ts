import fs from 'fs';
import path from 'path';

const jsonPath = path.join(__dirname, '../reports/media-audit-full.json');
if (fs.existsSync(jsonPath)) {
  const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const replacementCount = rows.filter((r: any) => r.proposedAction === 'MOVE TO SECONDARY MEDIA' || r.proposedAction === 'DETACH FROM CURRENT TAXON' || r.proposedAction === 'REPLACE PRIMARY IMAGE REQUIRED').length;
  console.log(`Audited ${rows.length} of 502 total taxa, ${replacementCount} flagged for replacement so far`);
}
