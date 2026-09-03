import './../src/dns-init.js';

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

async function findCladeSilhouette(cladeName: string) {
  console.log(`\n=== Finding verified silhouette for clade: "${cladeName}" ===`);
  const nodeRes = await fetch(`https://api.phylopic.org/nodes?build=552&filter_name=${encodeURIComponent(cladeName.toLowerCase())}&page=0&embed_items=true`);
  const nodeData = await nodeRes.json();
  const nodes = nodeData._embedded?.items || [];
  if (nodes.length === 0) {
    console.log(`No node found for ${cladeName}`);
    return null;
  }

  for (const node of nodes) {
    const nodeHref = node._links?.self?.href;
    const nodeUuid = nodeHref?.match(/\/nodes\/([a-f0-9-]+)/)?.[1];
    if (!nodeUuid) continue;

    const imgRes = await fetch(`https://api.phylopic.org/images?build=552&filter_node=${nodeUuid}&page=0&embed_items=true`);
    const imgData = await imgRes.json();
    const items = imgData._embedded?.items || [];

    for (const item of items) {
      const imgUuid = item._links?.self?.href?.match(/\/images\/([a-f0-9-]+)/)?.[1];
      if (!imgUuid) continue;
      const pageRes = await fetch(`https://www.phylopic.org/images/${imgUuid}`);
      const pageHtml = await pageRes.text();
      const parsed = parsePhyloPicPage(pageHtml, `https://www.phylopic.org/images/${imgUuid}`);
      const evalResult = evaluateLicense(parsed.license, parsed.licenseHref);
      if (evalResult.accepted && parsed.uploadedBy) {
        console.log(`FOUND VERIFIED CLADE SILHOUETTE for "${cladeName}":`);
        console.log(`  Taxon: "${parsed.taxon}"`);
        console.log(`  License: "${parsed.license}"`);
        console.log(`  Uploaded by: "${parsed.uploadedBy}"`);
        console.log(`  UUID: ${imgUuid}`);
        return {
          clade: cladeName,
          uuid: imgUuid,
          taxon: parsed.taxon,
          license: parsed.license,
          uploadedBy: parsed.uploadedBy,
          pageUrl: `https://www.phylopic.org/images/${imgUuid}`
        };
      }
    }
  }

  console.log(`No verified license image found directly for ${cladeName}`);
  return null;
}

async function run() {
  await findCladeSilhouette('Theropoda');
  await findCladeSilhouette('Sauropoda');
  await findCladeSilhouette('Ornithischia');
  await findCladeSilhouette('Pterosauria');
  await findCladeSilhouette('Plesiosauria');
  await findCladeSilhouette('Ichthyosauria');
  await findCladeSilhouette('Crocodylomorpha');
  await findCladeSilhouette('Aetosauria');
  await findCladeSilhouette('Phytosauria');
  await findCladeSilhouette('Synapsida');
}

run().then(() => process.exit(0)).catch(console.error);
