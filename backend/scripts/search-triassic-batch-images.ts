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
  licenseScore: number;
  credit: string;
  isSuspiciousCredit: boolean;
  title: string;
  isDiagram: boolean;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

function isValidImageFileType(urlStr: string): boolean {
  try {
    const cleanUrl = urlStr.split('?')[0].toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif'];
    return validExtensions.some(ext => cleanUrl.endsWith(ext));
  } catch {
    return false;
  }
}

function cleanHtml(html?: string): string {
  if (!html) return 'Unknown / Cited on File Page';
  return html.replace(/<[^>]*>/g, '').trim() || 'Unknown / Cited on File Page';
}

// Strict Genus Title Matching Rule (Filters out wrong-species co-occurrence matches like Saurichthys for Preondactylus)
function isMatchingTargetGenus(fileTitle: string, targetGenus: string): boolean {
  const title = fileTitle.toLowerCase();
  const genus = targetGenus.toLowerCase();
  return title.includes(genus);
}

// Enhanced Suspicious Author Detector
function isSuspiciousAuthor(credit: string): boolean {
  if (!credit) return true;
  const c = credit.trim().toLowerCase();

  // 1. Project branding references
  if (c.includes('prehistorica')) return true;

  // 2. Machine-readable / missing / assumed / inferred credit strings
  const suspiciousKeywords = [
    'no machine-readable',
    'assumed',
    'inferred',
    'unknown',
    'unspecified',
    'test',
    'example',
    'todo',
    'placeholder',
    'lorem',
    'sample',
    'dummy',
    'asdf',
    'no credit',
    'author unknown'
  ];

  return suspiciousKeywords.some(kw => c.includes(kw));
}

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

async function searchPhyloPic(scientificName: string, genus: string): Promise<ImageCandidate[]> {
  const candidates: ImageCandidate[] = [];
  try {
    const namesToTry = [scientificName, genus];
    for (const nameToTry of namesToTry) {
      if (candidates.length > 0) break;
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
    }
  } catch (err) {
    // Non-fatal
  }
  return candidates;
}

async function searchWikimedia(scientificName: string, genus: string): Promise<ImageCandidate[]> {
  const candidates: ImageCandidate[] = [];
  try {
    const searchQueries = [
      `${scientificName} restoration`,
      `${scientificName} reconstruction`,
      scientificName,
      `${genus} restoration`
    ];

    const foundTitles = new Set<string>();

    for (const query of searchQueries) {
      if (foundTitles.size >= 6) break;
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&format=json&srsearch=${encodeURIComponent(query)}`;
      await sleep(250);
      const searchRes = await fetchWithRetry(searchUrl);
      const searchResults = searchRes.query?.search || [];

      for (const res of searchResults) {
        if (foundTitles.size >= 8) break;

        // 1. Strict File Extension check (.jpg/.png/.svg/.gif only)
        if (!isValidImageFileType(res.title)) continue;

        // 2. Strict Genus Name check (must contain genus name in file title to prevent co-occurrence mismatches like Saurichthys)
        if (!isMatchingTargetGenus(res.title, genus)) continue;

        foundTitles.add(res.title);
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

      if (!isValidImageFileType(info.url)) continue;

      const metadata = info.extmetadata || {};
      const rawLicense = metadata.LicenseShortName?.value || metadata.License?.value || '';
      const licUrl = metadata.LicenseUrl?.value || '';
      const parsedLic = parseLicense(rawLicense, licUrl);

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
    // Non-fatal
  }
  return candidates;
}

async function main() {
  console.log('Fetching the 96 corrected Triassic species from database...');
  const speciesList = await prisma.species.findMany({
    where: {
      id: { gte: 44, lte: 142 }
    },
    select: {
      id: true,
      name: true,
      scientificName: true,
      clade: true
    },
    orderBy: { id: 'asc' }
  });

  console.log(`Loaded ${speciesList.length} species for Triassic batch image re-search with strict genus filtering & enhanced author detection.\n`);

  const results: Array<{
    speciesIndex: number;
    species: typeof speciesList[0];
    reconstructions: ImageCandidate[];
    diagrams: ImageCandidate[];
  }> = [];

  let countWithReconstructions = 0;
  let countWithDiagramsOnlyOrZero = 0;
  let totalSuspiciousAuthors = 0;
  const licenseStats: Record<string, number> = {};

  for (let i = 0; i < speciesList.length; i++) {
    const s = speciesList[i];
    const genus = s.name.trim();

    const [phyloCandidates, wikiCandidates] = await Promise.all([
      searchPhyloPic(s.scientificName, genus),
      searchWikimedia(s.scientificName, genus)
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

    const reconstructions = uniqueCandidates.filter(c => !c.isDiagram);
    const diagrams = uniqueCandidates.filter(c => c.isDiagram);

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

    results.push({
      speciesIndex: i + 1,
      species: s,
      reconstructions: topReconstructions,
      diagrams: topDiagrams
    });

    if ((i + 1) % 10 === 0 || i === speciesList.length - 1) {
      console.log(`[${i + 1}/${speciesList.length}] Processed ${s.name} (*${s.scientificName}*)... Reconstructions found: ${topReconstructions.length}, Diagrams: ${topDiagrams.length}.`);
    }
  }

  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, 'triassic-batch-image-candidates.md');
  let md = `# Prehistorica — Triassic Batch Image Candidate Research Report\n\n`;
  md += `**Generated At**: ${new Date().toISOString()}\n`;
  md += `**Target Batch**: 96 Corrected Triassic Species (DB IDs #44–#142)\n\n`;

  md += `---

## 📊 Executive Summary & Before / After Comparison

| Metric | Before Taxonomy Correction | After Real Binomial Search (With Strict Genus Filter) | Net Recovery |
|:---|:---|:---|:---|
| **Total Triassic Batch Species Searched** | **96** | **96** | 0 |
| **Species with ZERO Life Reconstructions** | **96 (100%)** *(due to broken "spp." search)* | **${countWithDiagramsOnlyOrZero} (${((countWithDiagramsOnlyOrZero / 96) * 100).toFixed(1)}%)** | **-${countWithReconstructions} species solved** |
| **Species with ≥1 Valid Life Reconstruction Artwork Candidate** | **0 (0%)** | **${countWithReconstructions} (${((countWithReconstructions / 96) * 100).toFixed(1)}%)** | **+${countWithReconstructions} species recovered!** |
| **Candidates Flagged for Suspicious / Inferred Author Credit** | N/A | **${totalSuspiciousAuthors}** | *Requires manual verification* |

\n### Breakdown by License Type Found\n\n`;
  md += `| License Type | Reconstruction Candidate Count |\n|:---|:---|\n`;
  for (const lic in licenseStats) {
    md += `| **${lic}** | ${licenseStats[lic]} |\n`;
  }

  md += `\n---\n\n## 🔍 Species Image Candidate Results (96 Species)\n\n`;

  for (const item of results) {
    const s = item.species;
    md += `### [Species ${item.speciesIndex} of ${speciesList.length}] (DB ID: #${s.id}) — ${s.name} (*${s.scientificName}*)\n`;
    md += `- **Clade**: \`${s.clade}\`\n\n`;

    // 1. Life Reconstruction Section
    md += `#### 🎨 Life Reconstruction Artwork Candidates (${item.reconstructions.length})\n`;
    if (item.reconstructions.length === 0) {
      md += `> [!WARNING]\n> **NO LIFE RECONSTRUCTION CANDIDATES FOUND** — Zero open-licensed reconstruction artwork found on Wikimedia Commons matching genus name \`${s.name}\`.\n\n`;
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
  console.log(`\nTriassic Batch Report successfully written to: ${reportPath}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal error in Triassic image search:', err);
  prisma.$disconnect();
  process.exit(1);
});
