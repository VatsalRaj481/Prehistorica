import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const USER_AGENT = 'PrehistoricaBot/1.0 (https://prehistorica.app; research@prehistorica.app)';

interface ImageCandidate {
  source: 'Wikimedia Commons' | 'PhyloPic';
  url: string;
  sourcePageUrl: string;
  license: string;
  licenseScore: number; // 3 = CC0/PD, 2 = CC-BY, 1 = CC BY-SA/GFDL
  credit: string;
  isSuspiciousCredit: boolean;
  title: string;
  isDiagram: boolean;
}

// Helper to delay execution
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for fetch with retries and exponential backoff
async function fetchWithRetry(url: string, retries = 3, delay = 500): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT }
      });
      if (response.status === 429) {
        await sleep(delay * (i + 2));
        continue;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(delay * Math.pow(2, i));
    }
  }
}

// Strict Image File Extension Validator (Excludes PDFs and non-image media)
function isValidImageFileType(urlStr: string): boolean {
  try {
    const cleanUrl = urlStr.split('?')[0].toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif'];
    return validExtensions.some(ext => cleanUrl.endsWith(ext));
  } catch {
    return false;
  }
}

// Strip HTML tags from attribution strings
function cleanHtml(html?: string): string {
  if (!html) return 'Unknown / Cited on File Page';
  return html.replace(/<[^>]*>/g, '').trim() || 'Unknown / Cited on File Page';
}

// Suspicious Author Detector
function isSuspiciousAuthor(credit: string): boolean {
  if (!credit) return false;
  const c = credit.trim().toLowerCase();

  // 1. Project branding references
  if (c.includes('prehistorica')) return true;

  // 2. Placeholder / dummy text
  const placeholders = ['test', 'example', 'todo', 'placeholder', 'lorem', 'sample', 'dummy', 'asdf'];
  if (placeholders.some(p => c.includes(p))) return true;

  // 3. Generic missing author strings
  const genericMissing = ['unknown author', 'unknown artist', 'unspecified author', 'unspecified artist', 'no credit', 'author unknown'];
  if (genericMissing.some(m => c.includes(m))) return true;

  return false;
}

// Skeletal / Diagram Classifier
function checkIsDiagram(title: string, url: string, source: string): boolean {
  if (source === 'PhyloPic') return true;
  const str = (title + ' ' + url).toLowerCase();
  const diagramKeywords = [
    'skeletal', 'skeleton', 'diagram', 'figure', 'fig1', 'fig2', 'fig3', 'fig4', 'fig.',
    'plate', 'scan', 'chart', 'scale_comparison', 'size_comparison', 'drawing',
    'anatomical', 'skull', 'bone'
  ];
  return diagramKeywords.some(kw => str.includes(kw));
}

// License classification helper
function parseLicense(licenseStr?: string, licenseUrl?: string): { name: string; isClear: boolean; score: number } {
  if (!licenseStr && !licenseUrl) return { name: 'Unknown / Unspecified', isClear: false, score: 0 };

  const str = (licenseStr || '').toUpperCase();
  const url = (licenseUrl || '').toUpperCase();

  if (str.includes('FAIR USE') || str.includes('ALL RIGHTS RESERVED') || str.includes('ARR')) {
    return { name: licenseStr || 'Restricted', isClear: false, score: 0 };
  }

  if (str.includes('CC0') || str.includes('PUBLIC DOMAIN') || str.includes('PD-') || str.startsWith('PD') || url.includes('PUBLICDOMAIN/ZERO') || url.includes('PUBLICDOMAIN/MARK')) {
    return { name: licenseStr || 'Public Domain / CC0', isClear: true, score: 3 };
  }

  if (str.includes('CC BY-SA') || url.includes('BY-SA')) {
    return { name: licenseStr || 'CC BY-SA', isClear: true, score: 1 };
  }

  if (str.includes('CC BY') || url.includes('LICENSES/BY/')) {
    return { name: licenseStr || 'CC BY', isClear: true, score: 2 };
  }

  if (str.includes('GFDL')) {
    return { name: licenseStr || 'GFDL', isClear: true, score: 1 };
  }

  if (str.startsWith('CC')) {
    return { name: licenseStr || 'Creative Commons', isClear: true, score: 1 };
  }

  return { name: licenseStr || 'Ambiguous', isClear: false, score: 0 };
}

// 1. Query PhyloPic API
async function searchPhyloPic(scientificName: string, genus: string): Promise<ImageCandidate[]> {
  const candidates: ImageCandidate[] = [];
  try {
    const nameToTry = scientificName || genus;
    const url = `https://api.phylopic.org/images?filter_name=${encodeURIComponent(nameToTry)}&build=549&page=0&embed_items=true`;
    await sleep(200);
    const data = await fetchWithRetry(url);
    const items = data._embedded?.items || [];

    for (const item of items.slice(0, 2)) {
      const imgUrl = item._links?.rasterFiles?.[0]?.href || item._links?.pngFiles?.[0]?.href || item._links?.['http://ogp.me/ns#image']?.href;
      if (!imgUrl || !isValidImageFileType(imgUrl)) continue;

      const licUrl = item._links?.license?.href || '';
      const licParsed = parseLicense(licUrl.includes('zero') ? 'CC0 1.0' : 'CC BY 4.0', licUrl);
      const credit = cleanHtml(item._links?.contributor?.title || 'PhyloPic Contributor');
      const selfHref = item._links?.self?.href || '';
      const uuidMatch = selfHref.match(/images\/([a-f0-9-]+)/);
      const uuid = uuidMatch ? uuidMatch[1] : '';
      const sourcePage = uuid ? `https://www.phylopic.org/images/${uuid}` : 'https://www.phylopic.org';

      candidates.push({
        source: 'PhyloPic',
        url: imgUrl,
        sourcePageUrl: sourcePage,
        license: licParsed.name,
        licenseScore: licParsed.score,
        credit,
        isSuspiciousCredit: isSuspiciousAuthor(credit),
        title: `${scientificName} Silhouette`,
        isDiagram: true
      });
    }
  } catch (err) {
    // Non-fatal search fallback
  }

  return candidates;
}

// 2. Query Wikimedia Commons API
async function searchWikimedia(scientificName: string): Promise<ImageCandidate[]> {
  const candidates: ImageCandidate[] = [];
  try {
    const searchQueries = [
      `${scientificName} restoration`,
      `${scientificName} reconstruction`,
      scientificName
    ];

    const foundTitles = new Set<string>();

    for (const query of searchQueries) {
      if (foundTitles.size >= 5) break;
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&format=json&srsearch=${encodeURIComponent(query)}`;
      await sleep(250);
      const searchRes = await fetchWithRetry(searchUrl);
      const searchResults = searchRes.query?.search || [];

      for (const res of searchResults) {
        if (foundTitles.size >= 8) break;
        // Filter search result titles to image extensions only (exclude .pdf)
        if (isValidImageFileType(res.title)) {
          foundTitles.add(res.title);
        }
      }
    }

    if (foundTitles.size === 0) return candidates;

    const titlesParam = Array.from(foundTitles).slice(0, 8).join('|');
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata&format=json&titles=${encodeURIComponent(titlesParam)}`;
    await sleep(250);
    const infoRes = await fetchWithRetry(infoUrl);

    const pages = infoRes.query?.pages || {};
    for (const pid in pages) {
      const page = pages[pid];
      const info = page.imageinfo?.[0];
      if (!info || !info.url) continue;

      // Strict Filetype Check: Accept ONLY .jpg, .png, .svg, .gif, .webp (exclude .pdf)
      if (!isValidImageFileType(info.url)) continue;

      const metadata = info.extmetadata || {};
      const rawLicense = metadata.LicenseShortName?.value || metadata.License?.value || '';
      const licUrl = metadata.LicenseUrl?.value || '';
      const parsedLic = parseLicense(rawLicense, licUrl);

      // Strict open license filter
      if (!parsedLic.isClear) continue;

      const artist = cleanHtml(metadata.Artist?.value || metadata.Credit?.value);
      const isDiagram = checkIsDiagram(page.title || '', info.url, 'Wikimedia Commons');

      candidates.push({
        source: 'Wikimedia Commons',
        url: info.url,
        sourcePageUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        license: parsedLic.name,
        licenseScore: parsedLic.score,
        credit: artist,
        isSuspiciousCredit: isSuspiciousAuthor(artist),
        title: page.title.replace(/^File:/, ''),
        isDiagram
      });
    }
  } catch (err) {
    // Non-fatal search fallback
  }

  return candidates;
}

async function main() {
  console.log('Fetching species roster from database...');
  const speciesList = await prisma.species.findMany({
    select: {
      id: true,
      name: true,
      scientificName: true,
      clade: true,
      media: true
    },
    orderBy: { id: 'asc' }
  });

  console.log(`Total species loaded: ${speciesList.length}`);

  // Load prior audit report if exists
  let flaggedBadIds = new Set<number>();
  try {
    const auditPath = path.join(process.cwd(), 'media_audit_report.json');
    if (fs.existsSync(auditPath)) {
      const auditData = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
      flaggedBadIds = new Set(auditData.map((item: any) => item.id));
    }
  } catch (e) {
    // Ignore if not present
  }

  const results: Array<{
    speciesIndex: number;
    species: typeof speciesList[0];
    auditStatus: string;
    reconstructions: ImageCandidate[];
    diagrams: ImageCandidate[];
  }> = [];

  let countWithReconstructions = 0;
  let countWithDiagramsOnlyOrZero = 0;
  let totalSuspiciousAuthors = 0;
  const licenseStats: Record<string, number> = {};

  console.log('\nBeginning species image sourcing search across PhyloPic & Wikimedia Commons...\n');

  for (let i = 0; i < speciesList.length; i++) {
    const s = speciesList[i];
    const genus = s.scientificName.split(' ')[0] || s.name;

    // Fetch from both sources
    const [phyloCandidates, wikiCandidates] = await Promise.all([
      searchPhyloPic(s.scientificName, genus),
      searchWikimedia(s.scientificName)
    ]);

    const allCandidates = [...wikiCandidates, ...phyloCandidates];

    // Deduplicate candidates by URL
    const uniqueCandidatesMap = new Map<string, ImageCandidate>();
    for (const cand of allCandidates) {
      if (!uniqueCandidatesMap.has(cand.url)) {
        uniqueCandidatesMap.set(cand.url, cand);
      }
    }
    const uniqueCandidates = Array.from(uniqueCandidatesMap.values());

    // Separate Reconstructions vs Diagrams
    const reconstructions = uniqueCandidates.filter(c => !c.isDiagram);
    const diagrams = uniqueCandidates.filter(c => c.isDiagram);

    // Sort candidates by license score (CC0/PD > CC-BY > CC-BY-SA)
    reconstructions.sort((a, b) => b.licenseScore - a.licenseScore);
    diagrams.sort((a, b) => b.licenseScore - a.licenseScore);

    const topReconstructions = reconstructions.slice(0, 3);
    const topDiagrams = diagrams.slice(0, 3);

    if (topReconstructions.length > 0) {
      countWithReconstructions++;
      topReconstructions.forEach((c) => {
        licenseStats[c.license] = (licenseStats[c.license] || 0) + 1;
        if (c.isSuspiciousCredit) totalSuspiciousAuthors++;
      });
    } else {
      countWithDiagramsOnlyOrZero++;
    }

    let auditStatus = 'Standard OK';
    if (flaggedBadIds.has(s.id)) {
      auditStatus = 'Flagged Non-Compliant (Skeletal/Paper Scan)';
    } else if (!s.media || s.media === '[]') {
      auditStatus = 'Missing Media';
    }

    results.push({
      speciesIndex: i + 1,
      species: s,
      auditStatus,
      reconstructions: topReconstructions,
      diagrams: topDiagrams
    });

    if ((i + 1) % 10 === 0 || i === speciesList.length - 1) {
      console.log(`[${i + 1}/${speciesList.length}] Processed ${s.name}... Reconstructions: ${topReconstructions.length}, Diagrams: ${topDiagrams.length}.`);
    }
  }

  // Ensure output directory exists
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Generate markdown report
  const reportPath = path.join(reportsDir, 'image-candidates.md');
  let md = `# Prehistorica — Species Image Candidate Research Report\n\n`;
  md += `**Generated At**: ${new Date().toISOString()}\n`;
  md += `**Total Database Species Processed**: ${speciesList.length} unique species\n\n`;

  md += `> [!NOTE]\n`;
  md += `> **Database ID vs Sequential Index Note**: Database primary keys (\`id\`) range non-sequentially up to 900+ due to historical batch insertions. All **${speciesList.length} unique species** in the database have been systematically processed from Index 1 through ${speciesList.length}.\n\n`;

  md += `---

## 📊 Executive Summary Statistics

| Metric | Count | Percentage |
|:---|:---|:---|
| **Total Unique Species Searched** | **${speciesList.length}** | 100% |
| **Species with ≥1 Valid Life Reconstruction Candidate** | **${countWithReconstructions}** | **${((countWithReconstructions / speciesList.length) * 100).toFixed(1)}%** |
| **Species with 0 Life Reconstructions (Diagram-Only or No Candidates)** | **${countWithDiagramsOnlyOrZero}** | **${((countWithDiagramsOnlyOrZero / speciesList.length) * 100).toFixed(1)}%** |
| **Candidates Flagged for Suspicious / Non-Standard Author Credit** | **${totalSuspiciousAuthors}** | *Requires manual verification* |

\n### Breakdown by License Type Found\n\n`;
  md += `| License Type | Reconstruction Candidate Count |\n|:---|:---|\n`;
  for (const lic in licenseStats) {
    md += `| **${lic}** | ${licenseStats[lic]} |\n`;
  }

  md += `\n---\n\n## 🔍 Species Image Candidate Results\n\n`;

  for (const item of results) {
    const s = item.species;
    md += `### [Species ${item.speciesIndex} of ${speciesList.length}] (DB ID: #${s.id}) — ${s.name} (*${s.scientificName}*)\n`;
    md += `- **Clade**: \`${s.clade}\` | **Current Media Status**: **${item.auditStatus}**\n\n`;

    // 1. Life Reconstruction Section
    md += `#### 🎨 Life Reconstruction Artwork Candidates (${item.reconstructions.length})\n`;
    if (item.reconstructions.length === 0) {
      md += `> [!WARNING]\n> **NO LIFE RECONSTRUCTION CANDIDATES FOUND** — Zero open-licensed reconstruction artwork found on Wikimedia Commons.\n\n`;
    } else {
      md += `| # | Source | Image File URL | License | Credit / Attribution | Source Page |\n`;
      md += `|:---|:---|:---|:---|:---|:---|\n`;
      item.reconstructions.forEach((c, idx) => {
        const creditDisplay = c.isSuspiciousCredit
          ? `⚠️ **[SUSPICIOUS CREDIT: "${c.credit}" - Verify Author]**`
          : c.credit;
        md += `| ${idx + 1} | ${c.source} | [Image Link (${c.title.split('.').pop()?.toUpperCase() || 'IMG'})](${c.url}) | \`${c.license}\` | ${creditDisplay} | [Source Page](${c.sourcePageUrl}) |\n`;
      });
      md += `\n`;
    }

    // 2. Skeletal & Diagram Section
    md += `#### 🦴 Skeletal & Diagram Matches (${item.diagrams.length})\n`;
    if (item.diagrams.length === 0) {
      md += `*No skeletal/diagram candidates recorded for this species.*\n\n`;
    } else {
      md += `| # | Source | File URL | License | Credit / Attribution | Source Page |\n`;
      md += `|:---|:---|:---|:---|:---|:---|\n`;
      item.diagrams.forEach((c, idx) => {
        const creditDisplay = c.isSuspiciousCredit
          ? `⚠️ **[SUSPICIOUS CREDIT: "${c.credit}" - Verify Author]**`
          : c.credit;
        md += `| ${idx + 1} | ${c.source} | [Diagram Link](${c.url}) | \`${c.license}\` | ${creditDisplay} | [Source Page](${c.sourcePageUrl}) |\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
  }

  fs.writeFileSync(reportPath, md, 'utf8');
  console.log(`\nUpdated Report successfully written to: ${reportPath}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal error in image candidate search:', err);
  prisma.$disconnect();
  process.exit(1);
});
