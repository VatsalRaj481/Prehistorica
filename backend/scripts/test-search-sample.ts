import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ParsedPage {
  license: string | null;
  licenseHref: string | null;
  uploadedBy: string | null;
  taxon: string | null;
  sourceUrl: string;
}

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
      const res = await fetch(url, { headers: { 'User-Agent': 'Prehistorica/1.0 (Educational Paleo Encyclopedia)' } });
      if (res.ok) return res;
      if (res.status === 404) return null;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

async function searchPhyloPicForSpecies(targetSciName: string, genus?: string, family?: string) {
  const normSci = targetSciName.toLowerCase().replace(/[^a-z0-9 -]/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanGenus = (genus || targetSciName.split(' ')[0]).toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();
  const cleanFamily = family ? family.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim() : '';

  const checkedUuids = new Set<string>();
  const candidates: { uuid: string; title: string; directNodeMatch?: string; downloadUrl?: string }[] = [];

  const searchQueries = [
    { query: normSci, level: 'exact' },
    { query: cleanGenus, level: 'genus' },
    ...(cleanFamily ? [{ query: cleanFamily, level: 'family' }] : [])
  ];

  for (const { query, level } of searchQueries) {
    if (!query) continue;
    try {
      const nodeRes = await fetchWithRetry(`https://api.phylopic.org/nodes?build=552&filter_name=${encodeURIComponent(query)}&page=0&embed_items=true`);
      if (!nodeRes) continue;
      const nodeData = await nodeRes.json();
      const nodeItems = nodeData._embedded?.items || [];

      for (const node of nodeItems) {
        const nodeHref = node._links?.self?.href;
        const nodeUuid = nodeHref?.match(/\/nodes\/([a-f0-9-]+)/)?.[1];
        if (!nodeUuid) continue;

        const imgRes = await fetchWithRetry(`https://api.phylopic.org/images?build=552&filter_node=${nodeUuid}&page=0&embed_items=true`);
        if (!imgRes) continue;
        const imgData = await imgRes.json();
        const imgItems = imgData._embedded?.items || [];

        for (const item of imgItems) {
          const imgHref = item._links?.self?.href;
          const imgUuid = imgHref?.match(/\/images\/([a-f0-9-]+)/)?.[1];
          if (imgUuid && !checkedUuids.has(imgUuid)) {
            checkedUuids.add(imgUuid);
            const sourceFile = item._links?.sourceFile?.href || item._links?.rasterFiles?.[0]?.href;
            candidates.push({
              uuid: imgUuid,
              title: item._links?.self?.title || '',
              directNodeMatch: level,
              downloadUrl: sourceFile
            });
          }
        }
      }

      if (candidates.length >= 6 && level !== 'family') break;
    } catch (e) {
      console.error(`Error searching query ${query}:`, e);
    }
  }

  let bestExactMatch: any = null;
  let bestGenericMatch: any = null;
  const rejectedMatches: any[] = [];

  for (const cand of candidates) {
    const pageUrl = `https://www.phylopic.org/images/${cand.uuid}`;
    try {
      const pageRes = await fetchWithRetry(pageUrl);
      if (!pageRes) continue;
      const html = await pageRes.text();
      const parsed = parsePhyloPicPage(html, pageUrl);

      const licenseEval = evaluateLicense(parsed.license, parsed.licenseHref);
      if (!licenseEval.accepted) {
        rejectedMatches.push({
          uuid: cand.uuid,
          pageUrl,
          taxon: parsed.taxon,
          license: parsed.license,
          uploadedBy: parsed.uploadedBy,
          reason: licenseEval.reason
        });
        continue;
      }

      if (parsed.licenseHref && (parsed.licenseHref.includes('/by/') || parsed.licenseHref.includes('/by-sa/')) && !parsed.uploadedBy) {
        rejectedMatches.push({
          uuid: cand.uuid,
          pageUrl,
          taxon: parsed.taxon,
          license: parsed.license,
          uploadedBy: null,
          reason: 'REJECT: Attribution mandatory for CC BY/CC BY-SA but uploaded-by name missing'
        });
        continue;
      }

      const pageTaxon = (parsed.taxon || cand.title || '').trim();
      const cleanPageTaxon = pageTaxon.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();

      const isExact = cleanPageTaxon === normSci;

      const result = {
        uuid: cand.uuid,
        pageUrl,
        downloadUrl: cand.downloadUrl,
        taxon: pageTaxon,
        license: parsed.license,
        uploadedBy: parsed.uploadedBy,
        taxonMatch: isExact ? 'species-specific' : 'generic approximation, not species-specific'
      };

      if (isExact) {
        bestExactMatch = result;
        break;
      } else if (!bestGenericMatch) {
        bestGenericMatch = result;
      }
    } catch (e) {
      console.error(`Error visiting page for ${cand.uuid}:`, e);
    }
  }

  if (bestExactMatch) {
    return { status: 'exact', match: bestExactMatch, rejectedCount: rejectedMatches.length };
  }
  if (bestGenericMatch) {
    return { status: 'generic', match: bestGenericMatch, rejectedCount: rejectedMatches.length };
  }
  return { status: 'none', candidatesFound: candidates.length, rejected: rejectedMatches };
}

async function testSample() {
  const speciesList = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true, clade: true, taxonomy: true },
    take: 10
  });

  for (const s of speciesList) {
    let tax: any = {};
    try { tax = typeof s.taxonomy === 'string' ? JSON.parse(s.taxonomy) : (s.taxonomy || {}); } catch (e) {}
    console.log(`\n========================================`);
    console.log(`Checking [${s.id}] ${s.name} (${s.scientificName})`);
    const res = await searchPhyloPicForSpecies(s.scientificName, tax.genus, tax.family);
    console.log(`Result Status: ${res.status}`);
    if (res.match) {
      console.log(`  Match Taxon: "${res.match.taxon}" | Type: ${res.match.taxonMatch}`);
      console.log(`  License: "${res.match.license}" | Uploaded by: "${res.match.uploadedBy}"`);
      console.log(`  Page URL: ${res.match.pageUrl}`);
    } else {
      console.log(`  No acceptable silhouette found. Candidates: ${res.candidatesFound}, Rejected: ${res.rejected?.length}`);
      if (res.rejected && res.rejected.length > 0) {
        console.log(`  First rejected reason: ${res.rejected[0].reason} (${res.rejected[0].license})`);
      }
    }
  }
}

testSample().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
