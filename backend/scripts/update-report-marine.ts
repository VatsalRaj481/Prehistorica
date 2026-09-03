import fs from 'fs';
import path from 'path';

const reportPath = path.join(__dirname, '../reports/phylopic_coverage_report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const updates: Record<number, any> = {
  138: {
    uuid: '83c83962-d551-42dd-a3b2-99346a89fc99',
    pageUrl: 'https://www.phylopic.org/images/83c83962-d551-42dd-a3b2-99346a89fc99',
    downloadUrl: 'https://images.phylopic.org/images/83c83962-d551-42dd-a3b2-99346a89fc99/source.svg',
    taxon: 'Shastasauridae (Representative: Shastasaurus sikanniensis)',
    license: 'Attribution 3.0 Unported',
    uploadedBy: 'Gareth Monger',
    taxonMatch: 'generic approximation, not species-specific',
    matchTier: 'family'
  },
  132: {
    uuid: '8f252288-5164-4105-b322-e417bf39fe2d',
    pageUrl: 'https://www.phylopic.org/images/8f252288-5164-4105-b322-e417bf39fe2d',
    downloadUrl: 'https://images.phylopic.org/images/8f252288-5164-4105-b322-e417bf39fe2d/source.svg',
    taxon: 'Nothosauridae (Representative: Nothosaurus mirabilis)',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    uploadedBy: 'Dan Niel',
    taxonMatch: 'generic approximation, not species-specific',
    matchTier: 'family'
  },
  134: {
    uuid: '8f252288-5164-4105-b322-e417bf39fe2d',
    pageUrl: 'https://www.phylopic.org/images/8f252288-5164-4105-b322-e417bf39fe2d',
    downloadUrl: 'https://images.phylopic.org/images/8f252288-5164-4105-b322-e417bf39fe2d/source.svg',
    taxon: 'Nothosauroidea (Representative: Nothosaurus mirabilis)',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    uploadedBy: 'Dan Niel',
    taxonMatch: 'generic approximation, not species-specific',
    matchTier: 'family'
  },
  2317: {
    uuid: '570767d9-cc21-4aae-9281-128d04ccf193',
    pageUrl: 'https://www.phylopic.org/images/570767d9-cc21-4aae-9281-128d04ccf193',
    downloadUrl: 'https://images.phylopic.org/images/570767d9-cc21-4aae-9281-128d04ccf193/source.svg',
    taxon: 'Testudines (Representative: Santanachelys gaffneyi)',
    license: 'Attribution-ShareAlike 3.0 Unported',
    uploadedBy: 'T. Michael Keesey',
    taxonMatch: 'generic approximation, not species-specific',
    matchTier: 'family'
  }
};

report.genericMatches.forEach((item: any) => {
  if (updates[item.speciesId]) {
    item.match = updates[item.speciesId];
  }
});

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log('Updated phylopic_coverage_report.json successfully!');
