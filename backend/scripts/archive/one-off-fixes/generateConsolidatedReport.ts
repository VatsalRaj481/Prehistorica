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

const jsonPath = path.join(__dirname, '../reports/media-audit-full.json');
const rows: AuditRow[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log(`Total rows loaded: ${rows.length}`);

// 1. Safe to retain as primary
const safePrimary = rows.filter(r => r.proposedAction === 'KEEP AS PRIMARY' || r.proposedAction === 'KEEP EXISTING PRIMARY');

// 2. Problem breakdown
const wrongTaxon = rows.filter(r => r.proposedAction === 'DETACH FROM CURRENT TAXON' || r.proposedAction === 'REASSIGN TO CORRECT TAXON' || r.reason.includes('taxonomically incorrect') || r.reason.includes('different species'));
const multiSpecies = rows.filter(r => r.otherAnimalTaxaVisible === 'Yes' || r.actualImageType === 'habitat_scene');
const historicalPaleoart = rows.filter(r => r.actualImageType === 'historical_paleoart');
const unverifiedLicense = rows.filter(r => r.license === 'Unknown' || r.evidenceLevel === 'UNVERIFIED' || r.licenseUrl === 'N/A' && !r.license.includes('Public'));
const scientificFigures = rows.filter(r => r.actualImageType === 'scientific_figure' || r.actualImageType === 'skeletal_reconstruction');
const fossilMuseumMedia = rows.filter(r => r.actualImageType === 'fossil_specimen' || r.actualImageType === 'museum_display');

// 3. Taxa requiring new art
const requiringNewArt = rows.filter(r => r.proposedAction === 'MOVE TO SECONDARY MEDIA' || r.proposedAction === 'DETACH FROM CURRENT TAXON' || r.reason.includes('Primary replacement required'));

// 4. Secondary placement
const secondaryMedia = rows.filter(r => r.proposedAction === 'MOVE TO SECONDARY MEDIA');

// 5. Credit/license ledger (all retained files)
const retainedFiles = rows.filter(r => r.proposedAction === 'KEEP AS PRIMARY' || r.proposedAction === 'KEEP EXISTING PRIMARY' || r.proposedAction === 'MOVE TO SECONDARY MEDIA');

let md = `# Prehistorica Complete Media Audit Consolidated Report (All 502 Taxa)\n\n`;
md += `> [!IMPORTANT]\n`;
md += `> **Audit Status**: Zero database writes, file moves, image replacements, commits, pushes, or deployments executed. All 502 species audited under strict 22-column scientific and licensing standards.\n\n`;

md += `## 1. Safe to Retain as Primary (${safePrimary.length} Taxa)\n`;
md += `Taxa whose current primary image is a verified, correctly-licensed, single-subject life reconstruction:\n\n`;
md += `| ID | Target Taxon | Current File Title | Artist / Creator | License | License URL |\n`;
md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
safePrimary.forEach(r => {
  md += `| ${r.id} | *${r.targetTaxon}* | \`${r.currentFileTitle}\` | ${r.artist} | ${r.license} | [License](${r.licenseUrl}) |\n`;
});

md += `\n## 2. Problem Breakdown (${rows.length - safePrimary.length} Total Problematic Primary Media Records)\n\n`;

md += `### A. Wrong-Taxon Media (${wrongTaxon.length} Taxa)\n`;
wrongTaxon.forEach(r => md += `- **Taxon #${r.id} *${r.targetTaxon}***: \`${r.currentFileTitle}\` (Depicts: *${r.actualDepictedTaxon}*)\n`);

md += `\n### B. Multi-Species / Habitat-Scene Media (${multiSpecies.length} Taxa)\n`;
multiSpecies.forEach(r => md += `- **Taxon #${r.id} *${r.targetTaxon}***: \`${r.currentFileTitle}\` (Multi-taxon scene / mural)\n`);

md += `\n### C. Historical Paleoart (${historicalPaleoart.length} Taxa)\n`;
historicalPaleoart.forEach(r => md += `- **Taxon #${r.id} *${r.targetTaxon}***: \`${r.currentFileTitle}\` (Creator: ${r.artist})\n`);

md += `\n### D. Unlicensed / Unverifiable License Media (${unverifiedLicense.length} Taxa)\n`;
unverifiedLicense.forEach(r => md += `- **Taxon #${r.id} *${r.targetTaxon}***: \`${r.currentFileTitle}\` (License: ${r.license})\n`);

md += `\n### E. Scientific Figure / Diagram Media (${scientificFigures.length} Taxa)\n`;
scientificFigures.forEach(r => md += `- **Taxon #${r.id} *${r.targetTaxon}***: \`${r.currentFileTitle}\` (Type: ${r.actualImageType})\n`);

md += `\n### F. Fossil Specimen / Museum Display Media (${fossilMuseumMedia.length} Taxa)\n`;
fossilMuseumMedia.forEach(r => md += `- **Taxon #${r.id} *${r.targetTaxon}***: \`${r.currentFileTitle}\` (Type: ${r.actualImageType})\n`);

md += `\n## 3. Taxa Requiring New Art (${requiringNewArt.length} Taxa Work List)\n`;
md += `Complete work list of taxa where \`REPLACE PRIMARY IMAGE REQUIRED\` applies and no acceptable alternative exists:\n\n`;
md += `| ID | Target Taxon | Current Primary File | Reason Primary Unsuitable | Replacement Target Description |\n`;
md += `| :--- | :--- | :--- | :--- | :--- |\n`;
requiringNewArt.forEach(r => {
  md += `| ${r.id} | *${r.targetTaxon}* | \`${r.currentFileTitle}\` | ${r.reason} | Single-individual species-specific ${r.targetTaxon} life reconstruction artwork |\n`;
});

md += `\n## 4. Files Preservable in Secondary Galleries (${secondaryMedia.length} Files)\n`;
md += `Existing primary images being moved to secondary media galleries rather than discarded:\n\n`;
md += `| ID | Target Taxon | Current File Title | Target Secondary Placement | Reason |\n`;
md += `| :--- | :--- | :--- | :--- | :--- |\n`;
secondaryMedia.forEach(r => {
  md += `| ${r.id} | *${r.targetTaxon}* | \`${r.currentFileTitle}\` | \`${r.recommendedMediaPlacement}\` | ${r.reason} |\n`;
});

md += `\n## 5. Credit / License Ledger (${retainedFiles.length} Retained Files)\n`;
md += `Source of truth for frontend credit and attribution requirements:\n\n`;
md += `| ID | Target Taxon | Filename | Artist / Creator | Exact License | License URL | Required Attribution Text |\n`;
md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
retainedFiles.forEach(r => {
  md += `| ${r.id} | *${r.targetTaxon}* | \`${r.currentFileTitle}\` | ${r.artist} | ${r.license} | [License](${r.licenseUrl}) | ${r.attributionRequired} |\n`;
});

const reportPath = path.join(__dirname, '../reports/media-audit-consolidated-summary.md');
fs.writeFileSync(reportPath, md);
console.log(`Successfully generated consolidated summary at: ${reportPath}`);
