import fs from 'fs';
import path from 'path';

const jsonPath = path.join(__dirname, '../reports/media-audit-full.json');
const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const plRows = rows.filter((r: any) => r.artist.includes('Prehistorica Library') || r.attributionRequired.includes('Prehistorica Library'));

console.log(`Found ${plRows.length} rows in media-audit-full.json with 'Prehistorica Library':`);
plRows.forEach((r: any) => {
  console.log(`ID ${r.id}: ${r.targetTaxon} | CurrentFile: ${r.currentFileTitle} | SourcePage: ${r.originalSourcePage}`);
});
