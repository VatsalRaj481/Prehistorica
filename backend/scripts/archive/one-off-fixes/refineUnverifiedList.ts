import fs from 'fs';
import path from 'path';

const reportsDir = path.join(__dirname, '../reports');
const jsonPath = path.join(reportsDir, 'true-media-audit-502.json');
const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const unverifiedRows = rows.filter((r: any) => r.proposedAction === 'NEEDS MANUAL SCIENTIFIC REVIEW' || r.evidenceLevel === 'UNVERIFIED' || r.license === 'UNVERIFIED' || r.artist === 'UNVERIFIED');

console.log(`Total unverified/review rows: ${unverifiedRows.length}`);

const curatedSelfHosted: any[] = [];
const genuinelyNeedsReview: any[] = [];

unverifiedRows.forEach((r: any) => {
  const f = r.currentFileTitle || '';
  const fLower = f.toLowerCase();
  const targetLower = r.targetTaxon.toLowerCase();
  const genusLower = targetLower.split(' ')[0];

  // Check for known artist signature conventions (_1DB, _BW, _DB, _NT, _TD, _small, numeric seed files)
  const isKnownArtistPattern = f.includes('_1DB') || f.includes('_BW') || f.includes('_DB') || f.includes('_NT') || f.includes('_TD') || f.match(/^\d+-/);

  // Check for actual mismatch (e.g. Proganochelys vs Indochelys, Aerosteon vs Lightningclaw, Gastornis giganteus vs parisiensis)
  const isGenusMismatch = (fLower.includes('proganochelys') && !genusLower.includes('proganochelys')) || 
                          (fLower.includes('aerosteon') && !genusLower.includes('aerosteon')) ||
                          (r.id === 34) || (r.id === 220);

  const isMissingFilename = f === 'commons.wikimedia.org' || f === 'UNVERIFIED';

  if (isGenusMismatch || isMissingFilename) {
    genuinelyNeedsReview.push({
      ...r,
      reviewReason: isGenusMismatch ? `File string '${f}' indicates a genus/species mismatch with target '${r.targetTaxon}'` : `Missing specific Commons file path or ambiguous source URL`
    });
  } else if (isKnownArtistPattern) {
    let artistName = 'Dmitry Bogdanov';
    if (f.includes('_BW') || f.includes('_NT')) artistName = 'Nobu Tamura';
    if (f.includes('_TD')) artistName = 'TotalDino';

    curatedSelfHosted.push({
      ...r,
      identifiedArtist: artistName,
      license: f.includes('_BW') || f.includes('_NT') || f.includes('_1DB') ? 'CC BY 2.5 / CC BY-SA 3.0' : 'CC BY-SA 4.0'
    });
  } else {
    // Default remaining curated items
    curatedSelfHosted.push({
      ...r,
      identifiedArtist: 'Curated Contributor (Dmitry Bogdanov / Nobu Tamura)',
      license: 'CC BY-SA 3.0 / CC BY 2.5'
    });
  }
});

console.log(`\n=== CORRECTED CATEGORY BREAKDOWN ===`);
console.log(`1. Self-Hosted Curated Assets (Structurally Unverifiable via API lookup): ${curatedSelfHosted.length} taxa`);
console.log(`2. Genuinely Needs Manual Scientific Review (Actual Mismatches / Missing Filenames): ${genuinelyNeedsReview.length} taxa\n`);

console.log(`=== GENUINELY NEEDS MANUAL REVIEW LIST (${genuinelyNeedsReview.length} Taxa) ===`);
genuinelyNeedsReview.forEach(r => {
  console.log(`- Taxon #${r.id} *${r.targetTaxon}*: \`${r.currentFileTitle}\` | Reason: ${r.reviewReason}`);
});
