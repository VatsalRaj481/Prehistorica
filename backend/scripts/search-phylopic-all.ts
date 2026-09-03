import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ParsedPage {
  license: string | null;
  licenseHref: string | null;
  uploadedBy: string | null;
  taxon: string | null;
  sourceUrl: string;
}

const pageCache = new Map<string, ParsedPage | null>();
const nodeCache = new Map<string, any>();
const nodeImagesCache = new Map<string, any[]>();

function parsePhyloPicPage(html: string, pageUrl: string): ParsedPage {
  let license: string | null = null;
  let licenseHref: string | null = null;
  const licMatch = html.match(/<tr><th>License<\/th><td>(.*?)<\/td><\/tr>/s);
  if (licMatch) {
    const aMatch = licMatch[1].match(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/s);
    if (aMatch) {
      licenseHref = aMatch[1];
      license = aMatch[2].replace(/<[^>]+>/g, '').trim();
    } else {
      license = licMatch[1].replace(/<[^>]+>/g, '').trim();
    }
  }

  let uploadedBy: string | null = null;
  const uplMatch = html.match(/<tr><th>Uploaded<\/th><td>(.*?)<\/td><\/tr>/s);
  if (uplMatch) {
    const rawUpl = uplMatch[1];
    const authorMatch = rawUpl.match(/<a rel="author"[^>]*>(.*?)<\/a>/);
    if (authorMatch) {
      uploadedBy = authorMatch[1].replace(/<[^>]+>/g, '').trim();
    } else {
      uploadedBy = rawUpl.replace(/<[^>]+>/g, '').replace(/.*by/i, '').trim();
    }
  }

  let taxon: string | null = null;
  const taxonMatch = html.match(/<tr><th>Taxon<\/th><td>(.*?)<\/td><\/tr>/s);
  if (taxonMatch) {
    const rawTaxon = taxonMatch[1];
    const sciMatch = rawTaxon.match(/<span[^>]*class="[^"]*scientific[^"]*"[^>]*>(.*?)<\/span>/);
    if (sciMatch) {
      taxon = sciMatch[1].replace(/<[^>]+>/g, '').trim();
    } else {
      const subjectMatch = rawTaxon.match(/<a rel="subject"[^>]*>(.*?)<\/a>/);
      if (subjectMatch) {
        taxon = subjectMatch[1].replace(/<[^>]+>/g, '').trim();
      } else {
        taxon = rawTaxon.replace(/<[^>]+>/g, '').trim();
      }
    }
  }

  return { license, licenseHref, uploadedBy, taxon, sourceUrl: pageUrl };
}

function evaluateLicense(licenseStr: string | null, licenseHref?: string | null): { accepted: boolean; licenseName: string; reason?: string } {
  if (!licenseStr && !licenseHref) return { accepted: false, licenseName: '', reason: 'License missing or unreadable' };
  
  const text = (licenseStr || '').toLowerCase();
  const href = (licenseHref || '').toLowerCase();

  // Explicit rejections
  if (text.includes('noncommercial') || text.includes('non-commercial') || href.includes('/by-nc') || text.includes('-nc') || text.includes(' nc')) {
    return { accepted: false, licenseName: licenseStr || '', reason: 'REJECT: Non-commercial (NC)' };
  }
  if (text.includes('noderivatives') || text.includes('no derivatives') || href.includes('/by-nd') || href.includes('-nd')) {
    return { accepted: false, licenseName: licenseStr || '', reason: 'REJECT: No Derivatives (ND)' };
  }
  if (text.includes('all rights reserved') || text.includes('unlicensed')) {
    return { accepted: false, licenseName: licenseStr || '', reason: 'REJECT: All rights reserved / unlicensed' };
  }

  // CC0 / Public Domain
  if (href.includes('publicdomain/zero') || text.includes('cc0') || text.includes('public domain')) {
    return { accepted: true, licenseName: licenseStr || 'CC0 1.0 Universal Public Domain Dedication' };
  }

  // CC BY-SA
  if (href.includes('/by-sa/') || text.startsWith('attribution-sharealike') || text.includes('by-sa')) {
    return { accepted: true, licenseName: licenseStr || 'CC BY-SA' };
  }

  // CC BY
  if (href.includes('/by/') || text.startsWith('attribution ') || text.includes('cc by')) {
    return { accepted: true, licenseName: licenseStr || 'CC BY' };
  }

  return { accepted: false, licenseName: licenseStr || '', reason: `REJECT: Unrecognized license "${licenseStr}"` };
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Prehistorica-Scale-Project/1.0 (Educational Paleo Encyclopedia)' } });
      if (res.ok) return res;
      if (res.status === 404) return null;
      await new Promise(r => setTimeout(r, 600 * (i + 1)));
    } catch (e) {
      if (i === retries - 1) return null;
      await new Promise(r => setTimeout(r, 600 * (i + 1)));
    }
  }
  return null;
}

async function getPhyloPicPage(uuid: string): Promise<ParsedPage | null> {
  if (pageCache.has(uuid)) {
    return pageCache.get(uuid)!;
  }
  const pageUrl = `https://www.phylopic.org/images/${uuid}`;
  const res = await fetchWithRetry(pageUrl);
  if (!res) {
    pageCache.set(uuid, null);
    return null;
  }
  const html = await res.text();
  const parsed = parsePhyloPicPage(html, pageUrl);
  pageCache.set(uuid, parsed);
  return parsed;
}

async function getNodesForName(query: string): Promise<any[]> {
  const norm = query.toLowerCase().replace(/[^a-z0-9 -]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!norm) return [];
  if (nodeCache.has(norm)) {
    return nodeCache.get(norm)!;
  }
  const res = await fetchWithRetry(`https://api.phylopic.org/nodes?build=552&filter_name=${encodeURIComponent(norm)}&page=0&embed_items=true`);
  if (!res) {
    nodeCache.set(norm, []);
    return [];
  }
  const data = await res.json();
  const items = data._embedded?.items || [];
  nodeCache.set(norm, items);
  return items;
}

async function getImagesForNode(nodeUuid: string): Promise<any[]> {
  if (nodeImagesCache.has(nodeUuid)) {
    return nodeImagesCache.get(nodeUuid)!;
  }
  const res = await fetchWithRetry(`https://api.phylopic.org/images?build=552&filter_node=${nodeUuid}&page=0&embed_items=true`);
  if (!res) {
    nodeImagesCache.set(nodeUuid, []);
    return [];
  }
  const data = await res.json();
  const items = data._embedded?.items || [];
  nodeImagesCache.set(nodeUuid, items);
  return items;
}

export interface SilhouetteCandidateResult {
  speciesId: number;
  name: string;
  scientificName: string;
  clade: string;
  status: 'exact' | 'generic' | 'none';
  match?: {
    uuid: string;
    pageUrl: string;
    downloadUrl?: string;
    taxon: string;
    license: string;
    uploadedBy: string;
    taxonMatch: 'species-specific' | 'generic approximation, not species-specific';
  };
  reason?: string;
  rejectedCandidates?: any[];
}

async function auditSpecies(s: any): Promise<SilhouetteCandidateResult> {
  const normSci = s.scientificName.toLowerCase().replace(/[^a-z0-9 -]/g, ' ').replace(/\s+/g, ' ').trim();
  let tax: any = {};
  try { tax = typeof s.taxonomy === 'string' ? JSON.parse(s.taxonomy) : (s.taxonomy || {}); } catch (e) {}
  const genus = (tax.genus || s.scientificName.split(' ')[0] || '').toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();
  const family = (tax.family || '').toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();

  const checkedUuids = new Set<string>();
  const candidateItems: { uuid: string; title: string; downloadUrl?: string; level: 'exact' | 'genus' | 'family' }[] = [];

  const searchTiers: { query: string; level: 'exact' | 'genus' | 'family' }[] = [
    { query: normSci, level: 'exact' },
    { query: genus, level: 'genus' },
    ...(family ? [{ query: family, level: 'family' as const }] : [])
  ];

  for (const tier of searchTiers) {
    if (!tier.query) continue;
    const nodes = await getNodesForName(tier.query);
    for (const node of nodes) {
      const nodeHref = node._links?.self?.href;
      const nodeUuid = nodeHref?.match(/\/nodes\/([a-f0-9-]+)/)?.[1];
      if (!nodeUuid) continue;

      const images = await getImagesForNode(nodeUuid);
      for (const img of images) {
        const imgHref = img._links?.self?.href;
        const imgUuid = imgHref?.match(/\/images\/([a-f0-9-]+)/)?.[1];
        if (imgUuid && !checkedUuids.has(imgUuid)) {
          checkedUuids.add(imgUuid);
          const downloadUrl = img._links?.sourceFile?.href || img._links?.rasterFiles?.[0]?.href;
          candidateItems.push({
            uuid: imgUuid,
            title: img._links?.self?.title || '',
            downloadUrl,
            level: tier.level
          });
        }
      }
    }
    // If we have candidates from exact or genus, stop searching broader tiers
    if (candidateItems.length >= 6 && tier.level !== 'family') break;
  }

  if (candidateItems.length === 0) {
    return {
      speciesId: s.id,
      name: s.name,
      scientificName: s.scientificName,
      clade: s.clade,
      status: 'none',
      reason: 'No coverage found on PhyloPic for binomial, genus, or family'
    };
  }

  let bestExactMatch: any = null;
  let bestGenericMatch: any = null;
  const rejectedMatches: any[] = [];

  for (const cand of candidateItems) {
    const page = await getPhyloPicPage(cand.uuid);
    if (!page) {
      rejectedMatches.push({ uuid: cand.uuid, reason: 'PhyloPic image page could not be loaded' });
      continue;
    }

    const licenseEval = evaluateLicense(page.license, page.licenseHref);
    if (!licenseEval.accepted) {
      rejectedMatches.push({
        uuid: cand.uuid,
        pageUrl: page.sourceUrl,
        taxon: page.taxon,
        license: page.license,
        uploadedBy: page.uploadedBy,
        reason: licenseEval.reason
      });
      continue;
    }

    // Mandatory attribution check
    if (page.licenseHref && (page.licenseHref.includes('/by/') || page.licenseHref.includes('/by-sa/')) && !page.uploadedBy) {
      rejectedMatches.push({
        uuid: cand.uuid,
        pageUrl: page.sourceUrl,
        taxon: page.taxon,
        license: page.license,
        uploadedBy: null,
        reason: 'REJECT: Attribution mandatory for CC BY/CC BY-SA but uploaded-by name missing'
      });
      continue;
    }

    const pageTaxon = (page.taxon || cand.title || '').trim();
    const cleanPageTaxon = pageTaxon.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();
    const isExact = cleanPageTaxon === normSci;

    const resObj = {
      uuid: cand.uuid,
      pageUrl: page.sourceUrl,
      downloadUrl: cand.downloadUrl,
      taxon: pageTaxon,
      license: page.license || licenseEval.licenseName,
      uploadedBy: page.uploadedBy || 'Anonymous/Uncredited',
      taxonMatch: isExact ? ('species-specific' as const) : ('generic approximation, not species-specific' as const)
    };

    if (isExact) {
      bestExactMatch = resObj;
      break; // Ideal exact match found!
    } else if (!bestGenericMatch) {
      bestGenericMatch = resObj;
    }
  }

  if (bestExactMatch) {
    return {
      speciesId: s.id,
      name: s.name,
      scientificName: s.scientificName,
      clade: s.clade,
      status: 'exact',
      match: bestExactMatch
    };
  }

  if (bestGenericMatch) {
    return {
      speciesId: s.id,
      name: s.name,
      scientificName: s.scientificName,
      clade: s.clade,
      status: 'generic',
      match: bestGenericMatch,
      rejectedCandidates: rejectedMatches
    };
  }

  return {
    speciesId: s.id,
    name: s.name,
    scientificName: s.scientificName,
    clade: s.clade,
    status: 'none',
    reason: rejectedMatches.length > 0
      ? `All ${rejectedMatches.length} candidate(s) rejected by license policy`
      : 'No acceptable candidate found',
    rejectedCandidates: rejectedMatches
  };
}

async function runAll() {
  console.log('Fetching all species from database...');
  const species = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true, clade: true, taxonomy: true },
    orderBy: { id: 'asc' }
  });

  console.log(`Auditing ${species.length} species against PhyloPic...`);
  const startTime = Date.now();

  const results: SilhouetteCandidateResult[] = [];
  const CONCURRENCY = 6;

  for (let i = 0; i < species.length; i += CONCURRENCY) {
    const chunk = species.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(chunk.map(s => auditSpecies(s)));
    results.push(...chunkResults);

    const progress = Math.min(i + CONCURRENCY, species.length);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const exactCount = results.filter(r => r.status === 'exact').length;
    const genericCount = results.filter(r => r.status === 'generic').length;
    const noneCount = results.filter(r => r.status === 'none').length;

    console.log(
      `[${progress}/${species.length}] (${elapsed}s) | Exact: ${exactCount} | Generic: ${genericCount} | None: ${noneCount}`
    );

    // Minor delay between batches
    await new Promise(r => setTimeout(r, 120));
  }

  // Generate Reports
  const exactMatches = results.filter(r => r.status === 'exact');
  const genericMatches = results.filter(r => r.status === 'generic');
  const noCoverage = results.filter(r => r.status === 'none');

  console.log('\n================ AUDIT SUMMARY ================');
  console.log(`Total species audited: ${results.length}`);
  console.log(`(a) Exact species-specific match: ${exactMatches.length} (${((exactMatches.length / results.length) * 100).toFixed(1)}%)`);
  console.log(`(b) Generic approximation match:  ${genericMatches.length} (${((genericMatches.length / results.length) * 100).toFixed(1)}%)`);
  console.log(`(c) No acceptable silhouette:     ${noCoverage.length} (${((noCoverage.length / results.length) * 100).toFixed(1)}%)`);
  console.log('================================================\n');

  // Write JSON report
  const reportsDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const jsonReportPath = path.join(reportsDir, 'phylopic_coverage_report.json');
  fs.writeFileSync(
    jsonReportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totalSpecies: results.length,
        summary: {
          exactMatchesCount: exactMatches.length,
          genericMatchesCount: genericMatches.length,
          noCoverageCount: noCoverage.length
        },
        exactMatches,
        genericMatches,
        noCoverage
      },
      null,
      2
    )
  );
  console.log(`Detailed JSON report saved to: ${jsonReportPath}`);

  // Write Markdown summary report
  const mdReportPath = path.join(reportsDir, 'phylopic_coverage_summary.md');
  let md = `# PhyloPic 2D Silhouette Coverage & License Verification Report\n\n`;
  md += `**Date:** ${new Date().toISOString()}\n`;
  md += `**Total Species Evaluated:** ${results.length}\n\n`;
  md += `## Executive Summary\n\n`;
  md += `| Category | Count | Percentage | Description |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  md += `| **(a) Exact Species-Match** | **${exactMatches.length}** | **${((exactMatches.length / results.length) * 100).toFixed(1)}%** | Exact binomial match on PhyloPic with verified CC0 / CC BY / CC BY-SA license |\n`;
  md += `| **(b) Generic Approximation** | **${genericMatches.length}** | **${((genericMatches.length / results.length) * 100).toFixed(1)}%** | Genus/family-level match with verified CC0 / CC BY / CC BY-SA license |\n`;
  md += `| **(c) No Acceptable Result** | **${noCoverage.length}** | **${((noCoverage.length / results.length) * 100).toFixed(1)}%** | No acceptable license (NC/ND rejected) or no coverage on PhyloPic |\n\n`;

  md += `## Section (a): Exact Species-Match (${exactMatches.length} species)\n\n`;
  md += `| ID | Species Name | Scientific Name | Taxon on PhyloPic | License | Uploaded By | Source Page |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  for (const r of exactMatches) {
    md += `| ${r.speciesId} | ${r.name} | *${r.scientificName}* | *${r.match?.taxon}* | ${r.match?.license} | ${r.match?.uploadedBy} | [PhyloPic Page](${r.match?.pageUrl}) |\n`;
  }

  md += `\n## Section (b): Generic Approximation Matches (${genericMatches.length} species)\n\n`;
  md += `> [!NOTE]\n> These silhouettes depict a related genus or family and will be visually labeled in the UI as **"Generic approximation, not species-specific"**.\n\n`;
  md += `| ID | Species Name | Scientific Name | Clade | Silh. Taxon | License | Uploaded By | Source Page |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  for (const r of genericMatches) {
    md += `| ${r.speciesId} | ${r.name} | *${r.scientificName}* | ${r.clade} | *${r.match?.taxon}* | ${r.match?.license} | ${r.match?.uploadedBy} | [PhyloPic Page](${r.match?.pageUrl}) |\n`;
  }

  md += `\n## Section (c): No Acceptable Result (${noCoverage.length} species)\n\n`;
  md += `| ID | Species Name | Scientific Name | Clade | Reason |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  for (const r of noCoverage) {
    const detail = r.rejectedCandidates && r.rejectedCandidates.length > 0
      ? `${r.reason} (${r.rejectedCandidates.map(c => c.reason).join('; ')})`
      : r.reason;
    md += `| ${r.speciesId} | ${r.name} | *${r.scientificName}* | ${r.clade} | ${detail} |\n`;
  }

  fs.writeFileSync(mdReportPath, md);
  console.log(`Summary Markdown report saved to: ${mdReportPath}`);
}

runAll().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error in runAll:', err);
  process.exit(1);
});
