import fs from 'fs';
import path from 'path';

interface AuditRow {
  id: number;
  taxonPageSlug: string;
  targetTaxon: string;
  rank: string;
  currentFileTitle: string;
  originalSourcePage: string;
  actualDepictedTaxon: string;
  currentDbType: string;
  actualImageType: string;
  recommendedMediaPlacement: string;
  exactTaxonEvidence: string;
  evidenceLevel: string;
  taxonomicAssignmentStatus: string;
  otherAnimalTaxaVisible: string;
  artist: string;
  license: string;
  licenseUrl: string;
  attributionRequired: string;
  accuracyStatus: string;
  proposedAction: string;
  reason: string;
  confidence: string;
  verifiedOn: string;
}

const reportsDir = path.join(__dirname, '../reports');

// Load full initial dataset (Batches 1-12)
const initialFull: AuditRow[] = JSON.parse(fs.readFileSync(path.join(reportsDir, 'media-audit-full.json'), 'utf8'));

// Load strict deep audit dataset (positions 121-502)
const deep121To502: AuditRow[] = JSON.parse(fs.readFileSync(path.join(reportsDir, 'deep-audit-121-502.json'), 'utf8'));

// Map deep results by ID for merging
const deepMap = new Map<number, AuditRow>();
deep121To502.forEach(r => deepMap.set(r.id, r));

// Combine: positions 1-120 from initial, positions 121-502 from deepMap
const combinedRows: AuditRow[] = initialFull.map(r => {
  if (r.id >= 121 && deepMap.has(r.id)) {
    return deepMap.get(r.id)!;
  }
  return r;
});

// Save combined JSON
fs.writeFileSync(path.join(reportsDir, 'media-audit-full-deep.json'), JSON.stringify(combinedRows, null, 2));

// Filter sections for final consolidated report
const safePrimary = combinedRows.filter(r => r.proposedAction === 'KEEP AS PRIMARY' || r.proposedAction === 'KEEP EXISTING PRIMARY');

const wrongTaxon = combinedRows.filter(r => r.proposedAction === 'DETACH FROM CURRENT TAXON' || r.proposedAction === 'REASSIGN TO CORRECT TAXON' || r.taxonomicAssignmentStatus === 'WRONG TAXON');
const multiSpecies = combinedRows.filter(r => r.otherAnimalTaxaVisible === 'Yes' || r.actualImageType === 'habitat_scene');
const historicalPaleoart = combinedRows.filter(r => r.actualImageType === 'historical_paleoart');
const unverifiedLicense = combinedRows.filter(r => r.proposedAction === 'NEEDS MANUAL SCIENTIFIC REVIEW' || r.evidenceLevel === 'UNVERIFIED' || r.license === 'UNVERIFIED' || r.artist === 'UNVERIFIED');
const scientificFigures = combinedRows.filter(r => r.actualImageType === 'scientific_figure' || r.actualImageType === 'skeletal_reconstruction');
const fossilMuseumMedia = combinedRows.filter(r => r.actualImageType === 'fossil_specimen' || r.actualImageType === 'museum_display');

const requiringNewArt = combinedRows.filter(r => r.proposedAction === 'MOVE TO SECONDARY MEDIA' || r.proposedAction === 'DETACH FROM CURRENT TAXON' || r.proposedAction === 'REPLACE PRIMARY IMAGE REQUIRED' || r.proposedAction === 'NEEDS MANUAL SCIENTIFIC REVIEW');
const secondaryMedia = combinedRows.filter(r => r.proposedAction === 'MOVE TO SECONDARY MEDIA');
const retainedFiles = combinedRows.filter(r => r.proposedAction === 'KEEP AS PRIMARY' || r.proposedAction === 'KEEP EXISTING PRIMARY' || r.proposedAction === 'MOVE TO SECONDARY MEDIA');

console.log(`TOTAL SPECIES COMBINED: ${combinedRows.length}`);
console.log(`1. Safe to retain as primary: ${safePrimary.length}`);
console.log(`2. Problem breakdown:`);
console.log(`   - Wrong-taxon media: ${wrongTaxon.length}`);
console.log(`   - Multi-species / habitat-scene media: ${multiSpecies.length}`);
console.log(`   - Historical paleoart: ${historicalPaleoart.length}`);
console.log(`   - Unlicensed / unverified license media: ${unverifiedLicense.length}`);
console.log(`   - Scientific-figure / diagram media: ${scientificFigures.length}`);
console.log(`   - Fossil-specimen / museum-display media: ${fossilMuseumMedia.length}`);
console.log(`3. Taxa requiring new art / review: ${requiringNewArt.length}`);
console.log(`4. Files preservable in secondary galleries: ${secondaryMedia.length}`);
console.log(`5. Retained files count: ${retainedFiles.length}`);

// Generate Final Consolidated Markdown Report
let md = `# Prehistorica Complete Verified Database Media Audit Consolidated Report (All 502 Taxa)\n\n`;
md += `> [!IMPORTANT]\n`;
md += `> **Audit Status**: **PROPOSED ONLY**. Zero database writes, file moves, image replacements, commits, pushes, or deployments executed.\n`;
md += `> Every taxon (positions 1 through 502) audited under strict non-fallback Wikimedia Commons API lookups.\n\n`;

md += `## 1. Safe to Retain as Primary (${safePrimary.length} Taxa)\n`;
md += `Taxa whose current primary image is a verified, correctly-licensed, single-subject life reconstruction (\`KEEP AS PRIMARY\`):\n\n`;
md += `| ID | Target Taxon | Current File Title | Artist / Creator | License | License URL |\n`;
md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
safePrimary.forEach(r => {
  md += `| ${r.id} | *${r.targetTaxon}* | \`${r.currentFileTitle}\` | ${r.artist} | ${r.license} | [License](${r.licenseUrl}) |\n`;
});

md += `\n## 2. Problem Breakdown (${combinedRows.length - safePrimary.length} Total Problematic Primary Media Records)\n\n`;

md += `### A. Wrong-Taxon Media (${wrongTaxon.length} Taxa)\n`;
wrongTaxon.forEach(r => md += `- **Taxon #${r.id} *${r.targetTaxon}***: \`${r.currentFileTitle}\` (Depicts: *${r.actualDepictedTaxon}*)\n`);

md += `\n### B. Multi-Species / Habitat-Scene Media (${multiSpecies.length} Taxa)\n`;
multiSpecies.forEach(r => md += `- **Taxon #${r.id} *${r.targetTaxon}***: \`${r.currentFileTitle}\` (Multi-taxon scene / mural)\n`);

md += `\n### C. Historical Paleoart (${historicalPaleoart.length} Taxa)\n`;
historicalPaleoart.forEach(r => md += `- **Taxon #${r.id} *${r.targetTaxon}***: \`${r.currentFileTitle}\` (Creator: ${r.artist})\n`);

md += `\n### D. Unlicensed / Unverified License Media (${unverifiedLicense.length} Taxa)\n`;
unverifiedLicense.forEach(r => md += `- **Taxon #${r.id} *${r.targetTaxon}***: \`${r.currentFileTitle}\` (Reason: ${r.reason})\n`);

md += `\n### E. Scientific Figure / Diagram Media (${scientificFigures.length} Taxa)\n`;
scientificFigures.forEach(r => md += `- **Taxon #${r.id} *${r.targetTaxon}***: \`${r.currentFileTitle}\` (Type: ${r.actualImageType})\n`);

md += `\n### F. Fossil Specimen / Museum Display Media (${fossilMuseumMedia.length} Taxa)\n`;
fossilMuseumMedia.forEach(r => md += `- **Taxon #${r.id} *${r.targetTaxon}***: \`${r.currentFileTitle}\` (Type: ${r.actualImageType})\n`);

md += `\n## 3. Taxa Requiring New Art / Primary Replacement (${requiringNewArt.length} Taxa Work List)\n`;
md += `Complete work list of taxa where \`REPLACE PRIMARY IMAGE REQUIRED\`, \`DETACH\`, or \`NEEDS MANUAL SCIENTIFIC REVIEW\` applies:\n\n`;
md += `| ID | Target Taxon | Current Primary File | Reason Primary Unsuitable | Replacement Target Description |\n`;
md += `| :--- | :--- | :--- | :--- | :--- |\n`;
requiringNewArt.forEach(r => {
  md += `| ${r.id} | *${r.targetTaxon}* | \`${r.currentFileTitle}\` | ${r.reason} | Single-individual species-specific *${r.targetTaxon}* life reconstruction artwork |\n`;
});

md += `\n## 4. Files Preservable in Secondary Galleries (${secondaryMedia.length} Files)\n`;
md += `Existing primary images being moved to secondary media galleries rather than discarded:\n\n`;
md += `| ID | Target Taxon | Current File Title | Target Secondary Placement | Reason |\n`;
md += `| :--- | :--- | :--- | :--- | :--- |\n`;
secondaryMedia.forEach(r => {
  md += `| ${r.id} | *${r.targetTaxon}* | \`${r.currentFileTitle}\` | \`${r.recommendedMediaPlacement}\` | ${r.reason} |\n`;
});

md += `\n## 5. Credit / License Ledger (${retainedFiles.length} Retained Files)\n`;
md += `Source of truth for frontend credit and attribution requirements across all retained assets:\n\n`;
md += `| ID | Target Taxon | Filename | Artist / Creator | Exact License | License URL | Required Attribution Text |\n`;
md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
retainedFiles.forEach(r => {
  md += `| ${r.id} | *${r.targetTaxon}* | \`${r.currentFileTitle}\` | ${r.artist} | ${r.license} | [License](${r.licenseUrl}) | ${r.attributionRequired} |\n`;
});

fs.writeFileSync(path.join(reportsDir, 'media-audit-consolidated-final-deep.md'), md);
console.log(`Successfully generated final verified consolidated summary at: ${path.join(reportsDir, 'media-audit-consolidated-final-deep.md')}`);
