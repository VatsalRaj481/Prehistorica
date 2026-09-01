import fs from 'fs';
import path from 'path';

const mdPath = path.join(__dirname, '../reports/media-audit-consolidated-summary.md');
const content = fs.readFileSync(mdPath, 'utf8');

const jsonPath = path.join(__dirname, '../reports/media-audit-full.json');
const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const safePrimary = rows.filter((r: any) => r.proposedAction === 'KEEP AS PRIMARY' || r.proposedAction === 'KEEP EXISTING PRIMARY');
const wrongTaxon = rows.filter((r: any) => r.proposedAction === 'DETACH FROM CURRENT TAXON' || r.proposedAction === 'REASSIGN TO CORRECT TAXON' || r.reason.includes('taxonomically incorrect') || r.reason.includes('different species'));
const multiSpecies = rows.filter((r: any) => r.otherAnimalTaxaVisible === 'Yes' || r.actualImageType === 'habitat_scene');
const historicalPaleoart = rows.filter((r: any) => r.actualImageType === 'historical_paleoart');
const unverifiedLicense = rows.filter((r: any) => r.license === 'Unknown' || r.evidenceLevel === 'UNVERIFIED' || r.licenseUrl === 'N/A' && !r.license.includes('Public'));
const scientificFigures = rows.filter((r: any) => r.actualImageType === 'scientific_figure' || r.actualImageType === 'skeletal_reconstruction');
const fossilMuseumMedia = rows.filter((r: any) => r.actualImageType === 'fossil_specimen' || r.actualImageType === 'museum_display');
const requiringNewArt = rows.filter((r: any) => r.proposedAction === 'MOVE TO SECONDARY MEDIA' || r.proposedAction === 'DETACH FROM CURRENT TAXON' || r.reason.includes('Primary replacement required'));
const secondaryMedia = rows.filter((r: any) => r.proposedAction === 'MOVE TO SECONDARY MEDIA');
const retainedFiles = rows.filter((r: any) => r.proposedAction === 'KEEP AS PRIMARY' || r.proposedAction === 'KEEP EXISTING PRIMARY' || r.proposedAction === 'MOVE TO SECONDARY MEDIA');

console.log(`TOTAL SPECIES AUDITED: ${rows.length}`);
console.log(`1. Safe to retain as primary: ${safePrimary.length}`);
console.log(`2. Problem breakdown:`);
console.log(`   - Wrong-taxon media: ${wrongTaxon.length}`);
console.log(`   - Multi-species/habitat-scene media: ${multiSpecies.length}`);
console.log(`   - Historical paleoart: ${historicalPaleoart.length}`);
console.log(`   - Unlicensed/unverifiable license media: ${unverifiedLicense.length}`);
console.log(`   - Scientific-figure/diagram media: ${scientificFigures.length}`);
console.log(`   - Fossil-specimen/museum-display media: ${fossilMuseumMedia.length}`);
console.log(`3. Taxa requiring new art: ${requiringNewArt.length}`);
console.log(`4. Files preservable in secondary galleries: ${secondaryMedia.length}`);
console.log(`5. Credit/license ledger retained count: ${retainedFiles.length}`);
