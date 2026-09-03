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
const nodeCache = new Map<string, any[]>();
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
      const res = await fetch(url, { headers: { 'User-Agent': 'Prehistorica-Deep-Search/1.0' } });
      if (res.ok) return res;
      if (res.status === 404) return null;
      await new Promise(r => setTimeout(r, 400 * (i + 1)));
    } catch (e) {
      if (i === retries - 1) return null;
      await new Promise(r => setTimeout(r, 400 * (i + 1)));
    }
  }
  return null;
}

async function getPhyloPicPage(uuid: string): Promise<ParsedPage | null> {
  if (pageCache.has(uuid)) return pageCache.get(uuid)!;
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
  if (nodeCache.has(norm)) return nodeCache.get(norm)!;
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
  if (nodeImagesCache.has(nodeUuid)) return nodeImagesCache.get(nodeUuid)!;
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

// Check candidate list against license policy
async function pickBestCandidate(candidateUuids: string[], targetSci: string): Promise<any | null> {
  const normSci = targetSci.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();
  const speciesEpithet = normSci.split(' ').slice(1).join(' ');
  const genusName = normSci.split(' ')[0];

  let bestExact: any = null;
  let bestGeneric: any = null;

  for (const uuid of candidateUuids) {
    const page = await getPhyloPicPage(uuid);
    if (!page) continue;

    const licenseEval = evaluateLicense(page.license, page.licenseHref);
    if (!licenseEval.accepted) continue;

    // Mandatory attribution check
    if (page.licenseHref && (page.licenseHref.includes('/by/') || page.licenseHref.includes('/by-sa/')) && !page.uploadedBy) {
      continue;
    }

    const pageTaxon = (page.taxon || '').trim();
    const cleanTaxon = pageTaxon.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();

    // Check exact match (including common Latin spelling variants e.g. -ii vs -i)
    const isStrictExact = cleanTaxon === normSci;
    const isVariantExact =
      cleanTaxon.startsWith(genusName) &&
      speciesEpithet.length > 2 &&
      (cleanTaxon.includes(speciesEpithet) ||
       cleanTaxon.replace(/ii$/, 'i') === normSci.replace(/ii$/, 'i') ||
       cleanTaxon.replace(/i$/, 'ii') === normSci.replace(/i$/, 'ii'));

    const isExact = isStrictExact || isVariantExact;

    const resObj = {
      uuid,
      pageUrl: page.sourceUrl,
      downloadUrl: `https://images.phylopic.org/images/${uuid}/source.svg`,
      taxon: pageTaxon,
      license: page.license || licenseEval.licenseName,
      uploadedBy: page.uploadedBy || 'Anonymous/Uncredited',
      taxonMatch: isExact ? 'species-specific' : 'generic approximation, not species-specific'
    };

    if (isExact) {
      bestExact = resObj;
      break; // Found exact match
    } else if (!bestGeneric) {
      bestGeneric = resObj;
    }
  }

  return bestExact || bestGeneric || null;
}

async function runDeepAudit() {
  console.log('Loading previous report...');
  const reportPath = path.join(__dirname, '../reports/phylopic_coverage_report.json');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  const species = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true, clade: true, taxonomy: true },
    orderBy: { id: 'asc' }
  });

  const speciesMap = new Map(species.map(s => [s.id, s]));

  console.log(`Checking ${report.genericMatches.length} generic matches for possible exact upgrades...`);
  let upgradedToExact = 0;

  for (const item of report.genericMatches) {
    const s = speciesMap.get(item.speciesId);
    if (!s) continue;
    const normSci = s.scientificName.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();
    const genus = normSci.split(' ')[0];

    // Check autocomplete for the genus to see all species nodes in PhyloPic
    const acRes = await fetchWithRetry(`https://api.phylopic.org/autocomplete?build=552&query=${encodeURIComponent(genus)}`);
    if (!acRes) continue;
    const acData = await acRes.json();
    const matches: string[] = acData.matches || [];

    // Find any match that matches our species epithet
    const speciesEpithet = normSci.split(' ').slice(1).join(' ');
    const exactMatchesInPhyloPic = matches.filter(m => {
      const cleanM = m.replace(/[^a-z0-9 -]/g, '').trim();
      return cleanM === normSci ||
        (cleanM.startsWith(genus) && speciesEpithet.length > 3 && (
          cleanM.includes(speciesEpithet) ||
          cleanM.replace(/ii$/, 'i') === normSci.replace(/ii$/, 'i')
        ));
    });

    if (exactMatchesInPhyloPic.length > 0) {
      for (const exactName of exactMatchesInPhyloPic) {
        const nodes = await getNodesForName(exactName);
        const candUuids: string[] = [];
        for (const n of nodes) {
          const nHref = n._links?.self?.href;
          const nUuid = nHref?.match(/\/nodes\/([a-f0-9-]+)/)?.[1];
          if (nUuid) {
            const imgs = await getImagesForNode(nUuid);
            imgs.forEach(i => {
              const u = i._links?.self?.href?.match(/\/images\/([a-f0-9-]+)/)?.[1];
              if (u) candUuids.push(u);
            });
            if (n._links?.primaryImage) {
              const u = n._links.primaryImage.href?.match(/\/images\/([a-f0-9-]+)/)?.[1];
              if (u) candUuids.push(u);
            }
          }
        }

        const candidate = await pickBestCandidate(candUuids, s.scientificName);
        if (candidate && candidate.taxonMatch === 'species-specific') {
          console.log(`[UPGRADE] [${s.id}] ${s.name} (${s.scientificName}) upgraded from generic to exact: "${candidate.taxon}" (${candidate.license} by ${candidate.uploadedBy})`);
          item.status = 'exact';
          item.match = candidate;
          upgradedToExact++;
          break;
        }
      }
    }
  }

  console.log(`Upgraded ${upgradedToExact} generic matches to exact species-specific!`);

  console.log(`\nNow checking ${report.noCoverage.length} un-covered species for valid higher taxonomy silhouettes...`);
  let rescuedFromNone = 0;
  const newlyCovered: any[] = [];
  const stillNone: any[] = [];

  for (const item of report.noCoverage) {
    const s = speciesMap.get(item.speciesId);
    if (!s) {
      stillNone.push(item);
      continue;
    }

    let tax: any = {};
    try { tax = typeof s.taxonomy === 'string' ? JSON.parse(s.taxonomy) : (s.taxonomy || {}); } catch (e) {}

    const normSci = s.scientificName.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();
    const genus = (tax.genus || normSci.split(' ')[0] || '').toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();
    const family = (tax.family || '').toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();
    const order = (tax.order || '').toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();

    // Specific clade mappings
    let cladeQuery = '';
    if (s.clade === 'Pterosaur') cladeQuery = 'pterosauria';
    else if (s.clade === 'Sauropod') cladeQuery = 'sauropoda';
    else if (s.clade === 'Theropod') cladeQuery = 'theropoda';
    else if (s.clade === 'Ornithischian') cladeQuery = 'ornithischia';
    else if (s.clade === 'Marine_Reptile') cladeQuery = 'plesiosauria';
    else if (s.clade === 'Aetosaur') cladeQuery = 'aetosauria';
    else if (s.clade === 'Phytosaur') cladeQuery = 'phytosauria';
    else if (s.clade === 'Poposauroid') cladeQuery = 'poposauroidea';
    else if (s.clade === 'Rauisuchian') cladeQuery = 'rauisuchia';
    else if (s.clade === 'Crocodylomorph') cladeQuery = 'crocodylomorpha';
    else if (s.clade === 'Sauropodomorph') cladeQuery = 'sauropodomorpha';

    // Search queries in priority order
    const queries = [
      genus,
      family,
      order,
      cladeQuery
    ].filter(Boolean);

    let foundCandidate: any = null;

    for (const q of queries) {
      // Check autocomplete or direct nodes
      const acRes = await fetchWithRetry(`https://api.phylopic.org/autocomplete?build=552&query=${encodeURIComponent(q)}`);
      let searchNames = [q];
      if (acRes) {
        const acData = await acRes.json();
        if (acData.matches && acData.matches.length > 0) {
          searchNames = [q, ...acData.matches.slice(0, 3)];
        }
      }

      const candUuids: string[] = [];
      for (const name of searchNames) {
        const nodes = await getNodesForName(name);
        for (const n of nodes) {
          const nHref = n._links?.self?.href;
          const nUuid = nHref?.match(/\/nodes\/([a-f0-9-]+)/)?.[1];
          if (nUuid) {
            const imgs = await getImagesForNode(nUuid);
            imgs.forEach(i => {
              const u = i._links?.self?.href?.match(/\/images\/([a-f0-9-]+)/)?.[1];
              if (u) candUuids.push(u);
            });
            if (n._links?.primaryImage) {
              const u = n._links.primaryImage.href?.match(/\/images\/([a-f0-9-]+)/)?.[1];
              if (u) candUuids.push(u);
            }
          }
        }
      }

      if (candUuids.length > 0) {
        const cand = await pickBestCandidate(candUuids, s.scientificName);
        if (cand) {
          foundCandidate = cand;
          break;
        }
      }
    }

    if (foundCandidate) {
      console.log(`[RESCUED] [${s.id}] ${s.name} (${s.scientificName}) matched "${foundCandidate.taxon}" (${foundCandidate.license} by ${foundCandidate.uploadedBy})`);
      rescuedFromNone++;
      newlyCovered.push({
        speciesId: s.id,
        name: s.name,
        scientificName: s.scientificName,
        clade: s.clade,
        status: foundCandidate.taxonMatch === 'species-specific' ? 'exact' : 'generic',
        match: foundCandidate
      });
    } else {
      stillNone.push(item);
    }
  }

  console.log(`\nRescued ${rescuedFromNone} species from "none"!`);
  console.log(`Remaining with zero coverage: ${stillNone.length}`);

  // Rebuild final sets
  const allExact = [
    ...report.exactMatches,
    ...report.genericMatches.filter((m: any) => m.status === 'exact'),
    ...newlyCovered.filter((m: any) => m.status === 'exact')
  ];
  // Deduplicate by speciesId
  const exactMap = new Map();
  allExact.forEach(e => exactMap.set(e.speciesId, e));
  const finalExact = Array.from(exactMap.values()).sort((a, b) => a.speciesId - b.speciesId);

  const exactIdSet = new Set(finalExact.map(e => e.speciesId));

  const allGeneric = [
    ...report.genericMatches.filter((m: any) => m.status === 'generic' && !exactIdSet.has(m.speciesId)),
    ...newlyCovered.filter((m: any) => m.status === 'generic' && !exactIdSet.has(m.speciesId))
  ];
  const genericMap = new Map();
  allGeneric.forEach(g => genericMap.set(g.speciesId, g));
  const finalGeneric = Array.from(genericMap.values()).sort((a, b) => a.speciesId - b.speciesId);

  const coveredIdSet = new Set([...finalExact.map(e => e.speciesId), ...finalGeneric.map(g => g.speciesId)]);
  const finalNone = stillNone.filter(n => !coveredIdSet.has(n.speciesId)).sort((a, b) => a.speciesId - b.speciesId);

  console.log('\n================ NEW FINAL AUDIT TOTALS ================');
  console.log(`Total species: ${species.length}`);
  console.log(`(a) Exact species-specific match: ${finalExact.length} (${((finalExact.length / species.length) * 100).toFixed(1)}%)`);
  console.log(`(b) Generic approximation match:  ${finalGeneric.length} (${((finalGeneric.length / species.length) * 100).toFixed(1)}%)`);
  console.log(`(c) No acceptable silhouette:     ${finalNone.length} (${((finalNone.length / species.length) * 100).toFixed(1)}%)`);
  console.log(`Combined coverage: ${finalExact.length + finalGeneric.length} / ${species.length} (${(((finalExact.length + finalGeneric.length) / species.length) * 100).toFixed(1)}%)`);
  console.log('========================================================\n');

  // Save updated JSON report
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totalSpecies: species.length,
        summary: {
          exactMatchesCount: finalExact.length,
          genericMatchesCount: finalGeneric.length,
          noCoverageCount: finalNone.length
        },
        exactMatches: finalExact,
        genericMatches: finalGeneric,
        noCoverage: finalNone
      },
      null,
      2
    )
  );
  console.log(`Updated JSON report saved to: ${reportPath}`);

  // Save updated summary markdown
  const mdReportPath = path.join(__dirname, '../reports/phylopic_coverage_summary.md');
  let md = `# PhyloPic 2D Silhouette Coverage & License Verification Report\n\n`;
  md += `**Date:** ${new Date().toISOString()}\n`;
  md += `**Total Species Evaluated:** ${species.length}\n\n`;
  md += `## Executive Summary\n\n`;
  md += `| Category | Count | Percentage | Description |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  md += `| **(a) Exact Species-Match** | **${finalExact.length}** | **${((finalExact.length / species.length) * 100).toFixed(1)}%** | Exact binomial match on PhyloPic with verified CC0 / CC BY / CC BY-SA license |\n`;
  md += `| **(b) Generic Approximation** | **${finalGeneric.length}** | **${((finalGeneric.length / species.length) * 100).toFixed(1)}%** | Genus, family, or clade match with verified CC0 / CC BY / CC BY-SA license |\n`;
  md += `| **(c) No Acceptable Result** | **${finalNone.length}** | **${((finalNone.length / species.length) * 100).toFixed(1)}%** | Genuine zero coverage on PhyloPic |\n\n`;

  md += `## Section (a): Exact Species-Match (${finalExact.length} species)\n\n`;
  md += `| ID | Species Name | Scientific Name | Taxon on PhyloPic | License | Uploaded By | Source Page |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  for (const r of finalExact) {
    md += `| ${r.speciesId} | ${r.name} | *${r.scientificName}* | *${r.match?.taxon}* | ${r.match?.license} | ${r.match?.uploadedBy} | [PhyloPic Page](${r.match?.pageUrl}) |\n`;
  }

  md += `\n## Section (b): Generic Approximation Matches (${finalGeneric.length} species)\n\n`;
  md += `> [!NOTE]\n> These silhouettes depict a related genus, family, or clade and will be visually labeled in the UI as **"Generic [Clade/Taxon] approximation, not species-specific"**.\n\n`;
  md += `| ID | Species Name | Scientific Name | Clade | Silh. Taxon | License | Uploaded By | Source Page |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  for (const r of finalGeneric) {
    md += `| ${r.speciesId} | ${r.name} | *${r.scientificName}* | ${r.clade} | *${r.match?.taxon}* | ${r.match?.license} | ${r.match?.uploadedBy} | [PhyloPic Page](${r.match?.pageUrl}) |\n`;
  }

  md += `\n## Section (c): No Acceptable Result (${finalNone.length} species)\n\n`;
  md += `| ID | Species Name | Scientific Name | Clade | Reason |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  for (const r of finalNone) {
    md += `| ${r.speciesId} | ${r.name} | *${r.scientificName}* | ${r.clade} | No acceptable silhouette in lineage |\n`;
  }

  fs.writeFileSync(mdReportPath, md);
  console.log(`Updated Markdown summary saved to: ${mdReportPath}`);
}

runDeepAudit().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error in runDeepAudit:', err);
  process.exit(1);
});
