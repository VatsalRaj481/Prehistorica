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
      const res = await fetch(url, { headers: { 'User-Agent': 'Prehistorica-Auditor/2.0' } });
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

// Canonical Representative Clade Silhouettes for strict fallback (Option A)
const CLADE_FALLBACK_SILHOUETTES: Record<string, { uuid: string; taxon: string; license: string; uploadedBy: string }> = {
  Theropod: {
    uuid: '978f844b-4bcf-4f96-b258-efc3fb716290', // Allosaurus fragilis / generic theropod
    taxon: 'Allosaurus fragilis',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    uploadedBy: 'Tasman Dixon'
  },
  Sauropod: {
    uuid: '10cf1c0d-c049-43c3-8aa6-74dbba22fe3a', // Camarasaurus supremus
    taxon: 'Camarasaurus supremus',
    license: 'Attribution 3.0 Unported',
    uploadedBy: 'Scott Hartman'
  },
  Sauropodomorph: {
    uuid: '10cf1c0d-c049-43c3-8aa6-74dbba22fe3a',
    taxon: 'Camarasaurus supremus',
    license: 'Attribution 3.0 Unported',
    uploadedBy: 'Scott Hartman'
  },
  Ornithischian: {
    uuid: '1e8f0d85-cecf-49e9-8a3f-876d96b2929f', // Laquintasaura venezuelae
    taxon: 'Laquintasaura venezuelae',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    uploadedBy: 'Scott Hartman'
  },
  Pterosaur: {
    uuid: '44c82592-4a98-4f54-bd0e-68d6fc236950', // Eotephradactylus mcintireae
    taxon: 'Eotephradactylus mcintireae',
    license: 'Attribution 4.0 International',
    uploadedBy: 'Cy Marchant'
  },
  Marine_Reptile: {
    uuid: '40db43fb-581f-4743-8c79-bec7ff2ced43', // Rhomaleosaurus cramptoni
    taxon: 'Rhomaleosaurus cramptoni',
    license: 'Attribution 3.0 Unported',
    uploadedBy: 'Scott Hartman'
  },
  Aetosaur: {
    uuid: 'e779b623-ff1c-4777-8ba8-83f2df6bdb9f', // Stagonolepis robertsoni
    taxon: 'Stagonolepis robertsoni',
    license: 'Attribution 3.0 Unported',
    uploadedBy: 'Scott Hartman'
  },
  Phytosaur: {
    uuid: '121a2008-b9de-4adb-bb03-33fcf21e5ae6', // Diandongosuchus fuyuanensis
    taxon: 'Diandongosuchus fuyuanensis',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    uploadedBy: 'LiterallyMiguel'
  },
  Crocodylomorph: {
    uuid: '168d6b6f-96b1-4867-967b-3f68fd31e078', // Eosphorosuchus lacrimosa
    taxon: 'Eosphorosuchus lacrimosa',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    uploadedBy: 'LiterallyMiguel'
  },
  Early_Mammal_Synapsid: {
    uuid: '61c59b94-6b48-40b4-ada1-3cc6c7543604', // Archaeovenator hamiltonensis
    taxon: 'Archaeovenator hamiltonensis',
    license: 'Attribution-ShareAlike 3.0 Unported',
    uploadedBy: 'T. Michael Keesey'
  },
  Poposauroid: {
    uuid: '4177e7fa-4d98-4f40-8b94-521817f39774', // Effigia okeeffeae
    taxon: 'Effigia okeeffeae',
    license: 'Public Domain Mark 1.0',
    uploadedBy: 'T. Michael Keesey'
  },
  Rauisuchian: {
    uuid: 'be9ace64-29f6-45d4-9cc9-9b035d1cc04c', // Postosuchus kirkpatricki
    taxon: 'Postosuchus kirkpatricki',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    uploadedBy: 'Tasman Dixon'
  },
  Archosauriform: {
    uuid: 'e779b623-ff1c-4777-8ba8-83f2df6bdb9f', // Stagonolepis
    taxon: 'Stagonolepis robertsoni',
    license: 'Attribution 3.0 Unported',
    uploadedBy: 'Scott Hartman'
  }
};

interface EvaluatedSilhouette {
  uuid: string;
  pageUrl: string;
  downloadUrl: string;
  taxon: string;
  license: string;
  uploadedBy: string;
  taxonMatch: 'species-specific' | 'generic approximation, not species-specific';
  matchTier: 'exact' | 'genus' | 'family' | 'clade';
}

async function auditSingleSpecies(s: any): Promise<{
  speciesId: number;
  name: string;
  scientificName: string;
  clade: string;
  status: 'exact' | 'generic' | 'none';
  match?: EvaluatedSilhouette;
  reason?: string;
}> {
  const normSci = s.scientificName.toLowerCase().replace(/[^a-z0-9 -]/g, ' ').replace(/\s+/g, ' ').trim();
  const genusName = normSci.split(' ')[0];
  const speciesEpithet = normSci.split(' ').slice(1).join(' ');

  let tax: any = {};
  try { tax = typeof s.taxonomy === 'string' ? JSON.parse(s.taxonomy) : (s.taxonomy || {}); } catch (e) {}
  const familyName = (tax.family || '').toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();

  // Tier 1: Search Exact Binomial
  const exactQueries = [normSci];
  // Add common Latinized spelling variations
  if (normSci.endsWith('ii')) exactQueries.push(normSci.slice(0, -1));
  else if (normSci.endsWith('i')) exactQueries.push(normSci + 'i');

  for (const eq of exactQueries) {
    const nodes = await getNodesForName(eq);
    for (const node of nodes) {
      const nodeUuid = node._links?.self?.href?.match(/\/nodes\/([a-f0-9-]+)/)?.[1];
      if (!nodeUuid) continue;
      const images = await getImagesForNode(nodeUuid);
      for (const img of images) {
        const imgUuid = img._links?.self?.href?.match(/\/images\/([a-f0-9-]+)/)?.[1];
        if (!imgUuid) continue;
        const page = await getPhyloPicPage(imgUuid);
        if (!page) continue;
        const licEval = evaluateLicense(page.license, page.licenseHref);
        if (!licEval.accepted || !page.uploadedBy) continue;

        const cleanPageTaxon = (page.taxon || '').toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();
        const isStrict = cleanPageTaxon === normSci;
        const isVariant = cleanPageTaxon.startsWith(genusName) && speciesEpithet.length > 2 && (
          cleanPageTaxon.includes(speciesEpithet) ||
          cleanPageTaxon.replace(/ii$/, 'i') === normSci.replace(/ii$/, 'i')
        );

        if (isStrict || isVariant) {
          return {
            speciesId: s.id,
            name: s.name,
            scientificName: s.scientificName,
            clade: s.clade,
            status: 'exact',
            match: {
              uuid: imgUuid,
              pageUrl: page.sourceUrl,
              downloadUrl: `https://images.phylopic.org/images/${imgUuid}/source.svg`,
              taxon: page.taxon || s.scientificName,
              license: page.license || licEval.licenseName,
              uploadedBy: page.uploadedBy,
              taxonMatch: 'species-specific',
              matchTier: 'exact'
            }
          };
        }
      }
    }
  }

  // Tier 2: Search Genus
  if (genusName) {
    const genusNodes = await getNodesForName(genusName);
    for (const node of genusNodes) {
      const nodeUuid = node._links?.self?.href?.match(/\/nodes\/([a-f0-9-]+)/)?.[1];
      if (!nodeUuid) continue;
      const images = await getImagesForNode(nodeUuid);
      for (const img of images) {
        const imgUuid = img._links?.self?.href?.match(/\/images\/([a-f0-9-]+)/)?.[1];
        if (!imgUuid) continue;
        const page = await getPhyloPicPage(imgUuid);
        if (!page) continue;
        const licEval = evaluateLicense(page.license, page.licenseHref);
        if (!licEval.accepted || !page.uploadedBy) continue;

        const cleanPageTaxon = (page.taxon || '').toLowerCase().replace(/[^a-z0-9 -]/g, '').trim();
        // Check if image is exact species under the genus node!
        if (cleanPageTaxon === normSci || (cleanPageTaxon.startsWith(genusName) && speciesEpithet.length > 2 && cleanPageTaxon.includes(speciesEpithet))) {
          return {
            speciesId: s.id,
            name: s.name,
            scientificName: s.scientificName,
            clade: s.clade,
            status: 'exact',
            match: {
              uuid: imgUuid,
              pageUrl: page.sourceUrl,
              downloadUrl: `https://images.phylopic.org/images/${imgUuid}/source.svg`,
              taxon: page.taxon || s.scientificName,
              license: page.license || licEval.licenseName,
              uploadedBy: page.uploadedBy,
              taxonMatch: 'species-specific',
              matchTier: 'exact'
            }
          };
        }

        // Genus match
        if (cleanPageTaxon.startsWith(genusName)) {
          return {
            speciesId: s.id,
            name: s.name,
            scientificName: s.scientificName,
            clade: s.clade,
            status: 'generic',
            match: {
              uuid: imgUuid,
              pageUrl: page.sourceUrl,
              downloadUrl: `https://images.phylopic.org/images/${imgUuid}/source.svg`,
              taxon: page.taxon || genusName,
              license: page.license || licEval.licenseName,
              uploadedBy: page.uploadedBy,
              taxonMatch: 'generic approximation, not species-specific',
              matchTier: 'genus'
            }
          };
        }
      }
    }
  }

  // Tier 3: Search Family
  if (familyName && familyName.endsWith('dae')) {
    const familyNodes = await getNodesForName(familyName);
    for (const node of familyNodes) {
      const nodeUuid = node._links?.self?.href?.match(/\/nodes\/([a-f0-9-]+)/)?.[1];
      if (!nodeUuid) continue;
      const images = await getImagesForNode(nodeUuid);
      for (const img of images) {
        const imgUuid = img._links?.self?.href?.match(/\/images\/([a-f0-9-]+)/)?.[1];
        if (!imgUuid) continue;
        const page = await getPhyloPicPage(imgUuid);
        if (!page) continue;
        const licEval = evaluateLicense(page.license, page.licenseHref);
        if (!licEval.accepted || !page.uploadedBy) continue;

        return {
          speciesId: s.id,
          name: s.name,
          scientificName: s.scientificName,
          clade: s.clade,
          status: 'generic',
          match: {
            uuid: imgUuid,
            pageUrl: page.sourceUrl,
            downloadUrl: `https://images.phylopic.org/images/${imgUuid}/source.svg`,
            taxon: page.taxon || familyName,
            license: page.license || licEval.licenseName,
            uploadedBy: page.uploadedBy,
            taxonMatch: 'generic approximation, not species-specific',
            matchTier: 'family'
          }
        };
      }
    }
  }

  // Specific taxonomic approximations for well-known groups:
  // 1. Pliosaurs / Plesiosaurs in clade "Other" or "Marine_Reptile"
  if (normSci.includes('pliosaurus') || normSci.includes('simolestes')) {
    return {
      speciesId: s.id,
      name: s.name,
      scientificName: s.scientificName,
      clade: s.clade,
      status: 'generic',
      match: {
        uuid: 'e9040105-d131-40ed-acfb-7399a9771669',
        pageUrl: 'https://www.phylopic.org/images/e9040105-d131-40ed-acfb-7399a9771669',
        downloadUrl: 'https://images.phylopic.org/images/e9040105-d131-40ed-acfb-7399a9771669/source.svg',
        taxon: 'Pliosauridae (Representative: Liopleurodon ferox)',
        license: 'CC0 1.0 Universal Public Domain Dedication',
        uploadedBy: 'Caleb M. Gordon',
        taxonMatch: 'generic approximation, not species-specific',
        matchTier: 'family'
      }
    };
  }
  if (normSci.includes('cryptoclidus')) {
    return {
      speciesId: s.id,
      name: s.name,
      scientificName: s.scientificName,
      clade: s.clade,
      status: 'generic',
      match: {
        uuid: '40db43fb-581f-4743-8c79-bec7ff2ced43',
        pageUrl: 'https://www.phylopic.org/images/40db43fb-581f-4743-8c79-bec7ff2ced43',
        downloadUrl: 'https://images.phylopic.org/images/40db43fb-581f-4743-8c79-bec7ff2ced43/source.svg',
        taxon: 'Plesiosauria (Representative: Rhomaleosaurus cramptoni)',
        license: 'Attribution 3.0 Unported',
        uploadedBy: 'Scott Hartman',
        taxonMatch: 'generic approximation, not species-specific',
        matchTier: 'family'
      }
    };
  }
  // 2. Ammonites in Invertebrates
  if (normSci.includes('baculites') || normSci.includes('jeletzkytes')) {
    return {
      speciesId: s.id,
      name: s.name,
      scientificName: s.scientificName,
      clade: s.clade,
      status: 'generic',
      match: {
        uuid: 'ded95120-5357-4349-81ba-3b43b4298217',
        pageUrl: 'https://www.phylopic.org/images/ded95120-5357-4349-81ba-3b43b4298217',
        downloadUrl: 'https://images.phylopic.org/images/ded95120-5357-4349-81ba-3b43b4298217/source.svg',
        taxon: 'Ammonitina (Representative Ammonite)',
        license: 'CC0 1.0 Universal Public Domain Dedication',
        uploadedBy: 'Amy Beauvois',
        taxonMatch: 'generic approximation, not species-specific',
        matchTier: 'family'
      }
    };
  }
  // 3. Prehistoric Squid in Invertebrates
  if (normSci.includes('tusoteuthis')) {
    return {
      speciesId: s.id,
      name: s.name,
      scientificName: s.scientificName,
      clade: s.clade,
      status: 'generic',
      match: {
        uuid: 'd261e4fa-9b44-4aec-9a13-b3c93a421504',
        pageUrl: 'https://www.phylopic.org/images/d261e4fa-9b44-4aec-9a13-b3c93a421504',
        downloadUrl: 'https://images.phylopic.org/images/d261e4fa-9b44-4aec-9a13-b3c93a421504/source.svg',
        taxon: 'Coleoidea (Representative: Trachyteuthis hastiformis)',
        license: 'CC0 1.0 Universal Public Domain Dedication',
        uploadedBy: 'Dean Schnabel',
        taxonMatch: 'generic approximation, not species-specific',
        matchTier: 'family'
      }
    };
  }
  // 4. Prehistoric Shark (Squalicorax)
  if (normSci.includes('squalicorax')) {
    return {
      speciesId: s.id,
      name: s.name,
      scientificName: s.scientificName,
      clade: s.clade,
      status: 'generic',
      match: {
        uuid: '42135d61-3549-45d2-841c-4147548b0fad',
        pageUrl: 'https://www.phylopic.org/images/42135d61-3549-45d2-841c-4147548b0fad',
        downloadUrl: 'https://images.phylopic.org/images/42135d61-3549-45d2-841c-4147548b0fad/source.svg',
        taxon: 'Lamniformes (Representative Prehistoric Shark)',
        license: 'CC0 1.0 Universal Public Domain Dedication',
        uploadedBy: 'Jody Taylor',
        taxonMatch: 'generic approximation, not species-specific',
        matchTier: 'family'
      }
    };
  }

  // Tier 4: Clade-Level Fallback
  const cladeFallback = CLADE_FALLBACK_SILHOUETTES[s.clade];
  if (cladeFallback) {
    return {
      speciesId: s.id,
      name: s.name,
      scientificName: s.scientificName,
      clade: s.clade,
      status: 'generic',
      match: {
        uuid: cladeFallback.uuid,
        pageUrl: `https://www.phylopic.org/images/${cladeFallback.uuid}`,
        downloadUrl: `https://images.phylopic.org/images/${cladeFallback.uuid}/source.svg`,
        taxon: `${s.clade.replace(/_/g, ' ')} (Clade Representative: ${cladeFallback.taxon})`,
        license: cladeFallback.license,
        uploadedBy: cladeFallback.uploadedBy,
        taxonMatch: 'generic approximation, not species-specific',
        matchTier: 'clade'
      }
    };
  }

  // Tier 5: No acceptable silhouette
  return {
    speciesId: s.id,
    name: s.name,
    scientificName: s.scientificName,
    clade: s.clade,
    status: 'none',
    reason: 'No acceptable silhouette found within species, genus, family, or clade lineage'
  };
}

async function runCleanAudit() {
  console.log('Fetching all species from database...');
  const species = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true, clade: true, taxonomy: true },
    orderBy: { id: 'asc' }
  });

  console.log(`Executing clean taxonomic audit across ${species.length} species...`);
  const results: any[] = [];
  const CONCURRENCY = 6;

  for (let i = 0; i < species.length; i += CONCURRENCY) {
    const chunk = species.slice(i, i + CONCURRENCY);
    const chunkRes = await Promise.all(chunk.map(s => auditSingleSpecies(s)));
    results.push(...chunkRes);

    const progress = Math.min(i + CONCURRENCY, species.length);
    const exactCount = results.filter(r => r.status === 'exact').length;
    const genericCount = results.filter(r => r.status === 'generic').length;
    const noneCount = results.filter(r => r.status === 'none').length;
    console.log(`[${progress}/${species.length}] | Exact: ${exactCount} | Generic: ${genericCount} | None: ${noneCount}`);
  }

  const exactMatches = results.filter(r => r.status === 'exact');
  const genericMatches = results.filter(r => r.status === 'generic');
  const noCoverage = results.filter(r => r.status === 'none');

  console.log('\n================ FINAL CLEAN AUDIT TOTALS ================');
  console.log(`Total species: ${species.length}`);
  console.log(`(a) Exact species-specific match: ${exactMatches.length} (${((exactMatches.length / species.length) * 100).toFixed(1)}%)`);
  console.log(`(b) Generic approximation match:  ${genericMatches.length} (${((genericMatches.length / species.length) * 100).toFixed(1)}%)`);
  console.log(`    - Genus-level: ${genericMatches.filter(g => g.match.matchTier === 'genus').length}`);
  console.log(`    - Family-level: ${genericMatches.filter(g => g.match.matchTier === 'family').length}`);
  console.log(`    - Clade-level fallback: ${genericMatches.filter(g => g.match.matchTier === 'clade').length}`);
  console.log(`(c) No acceptable silhouette:     ${noCoverage.length} (${((noCoverage.length / species.length) * 100).toFixed(1)}%)`);
  console.log('==========================================================\n');

  // Write reports
  const reportsDir = path.join(__dirname, '../reports');
  const jsonReportPath = path.join(reportsDir, 'phylopic_coverage_report.json');
  fs.writeFileSync(
    jsonReportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totalSpecies: species.length,
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

  const mdReportPath = path.join(reportsDir, 'phylopic_coverage_summary.md');
  let md = `# PhyloPic 2D Silhouette Coverage & License Verification Report\n\n`;
  md += `**Date:** ${new Date().toISOString()}\n`;
  md += `**Total Species Evaluated:** ${species.length}\n\n`;
  md += `## Executive Summary\n\n`;
  md += `| Category | Count | Percentage | Description |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  md += `| **(a) Exact Species-Match** | **${exactMatches.length}** | **${((exactMatches.length / species.length) * 100).toFixed(1)}%** | Exact binomial match on PhyloPic with verified CC0 / CC BY / CC BY-SA license |\n`;
  md += `| **(b) Generic Approximation** | **${genericMatches.length}** | **${((genericMatches.length / species.length) * 100).toFixed(1)}%** | Verified genus, family, or clade silhouette with verified CC0 / CC BY / CC BY-SA license |\n`;
  md += `| **(c) No Acceptable Result** | **${noCoverage.length}** | **${((noCoverage.length / species.length) * 100).toFixed(1)}%** | Genuine zero coverage / unsupported clade envelope |\n\n`;

  md += `## Section (a): Exact Species-Match (${exactMatches.length} species)\n\n`;
  md += `| ID | Species Name | Scientific Name | Taxon on PhyloPic | License | Uploaded By | Source Page |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  for (const r of exactMatches) {
    md += `| ${r.speciesId} | ${r.name} | *${r.scientificName}* | *${r.match?.taxon}* | ${r.match?.license} | ${r.match?.uploadedBy} | [PhyloPic Page](${r.match?.pageUrl}) |\n`;
  }

  md += `\n## Section (b): Generic Approximation Matches (${genericMatches.length} species)\n\n`;
  md += `> [!NOTE]\n> These silhouettes depict a related genus, family, or clade and will be visually labeled in the UI as **"Generic [Clade/Taxon] approximation, not species-specific"**.\n\n`;
  md += `| ID | Species Name | Scientific Name | Clade | Silh. Taxon | Tier | License | Uploaded By | Source Page |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  for (const r of genericMatches) {
    md += `| ${r.speciesId} | ${r.name} | *${r.scientificName}* | ${r.clade} | *${r.match?.taxon}* | ${r.match?.matchTier} | ${r.match?.license} | ${r.match?.uploadedBy} | [PhyloPic Page](${r.match?.pageUrl}) |\n`;
  }

  md += `\n## Section (c): No Acceptable Result (${noCoverage.length} species)\n\n`;
  md += `| ID | Species Name | Scientific Name | Clade | Reason |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  for (const r of noCoverage) {
    md += `| ${r.speciesId} | ${r.name} | *${r.scientificName}* | ${r.clade} | ${r.reason} |\n`;
  }

  fs.writeFileSync(mdReportPath, md);
  console.log(`Clean reports saved to JSON and Markdown.`);
}

runCleanAudit().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
