/**
 * Automated Taxonomic & Extant Relatives CI Validation Suite
 * 
 * Enforces architectural, phylogenetic, and rank invariants across the Prehistorica catalog:
 * 1. Class Sanity: Class Mammalia / Synapsida must NEVER list Aves/Crocodilia as relatives.
 * 2. Invertebrate Sanity: Invertebrates must NEVER list Archosaurs/Vertebrates as relatives.
 * 3. Source Verification: Records marked `verified: true` must have non-empty sources.
 * 4. Rank Syntax: The Family field must not contain species binomials, 'clade', or 'group'.
 * 5. Obsolete Taxonomy: Prohibits obsolete wastebasket orders (e.g. Acreodi, Pelycosauria, Thecodontia).
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TaxonomicViolation {
  id: number;
  name: string;
  category: 'IMPOSSIBLE_COMBINATION' | 'INVALID_FAMILY' | 'OBSOLETE_ORDER' | 'MISSING_SOURCES_ON_VERIFIED' | 'CLASS_MISMATCH';
  message: string;
  currentValue: any;
}

export function validateSpecimen(s: any): TaxonomicViolation[] {
  const violations: TaxonomicViolation[] = [];

  let tax: any = {};
  try {
    tax = typeof s.taxonomy === 'string' ? JSON.parse(s.taxonomy) : (s.taxonomy || {});
  } catch {
    violations.push({
      id: s.id,
      name: s.name,
      category: 'CLASS_MISMATCH',
      message: 'Failed to parse taxonomy JSON',
      currentValue: s.taxonomy
    });
  }

  let rel: any = null;
  try {
    rel = typeof s.closestLivingRelatives === 'string' ? JSON.parse(s.closestLivingRelatives) : s.closestLivingRelatives;
  } catch {
    rel = s.closestLivingRelatives;
  }

  const relString = Array.isArray(rel)
    ? rel.join(' • ')
    : typeof rel === 'object' && rel !== null
      ? (rel.groups ? rel.groups.join(' • ') : '') + ' ' + (rel.rationale || '')
      : String(rel || '');

  const className = (tax.class || '').trim();
  const orderName = (tax.order || '').trim();
  const familyName = (tax.family || '').trim();
  const genusName = (tax.genus || '').trim();
  const speciesName = (tax.species || '').trim();
  const cladeName = (s.clade || '').trim();

  // 1. Class Sanity Check: Mammals and Synapsids must NEVER list Birds or Crocodilians
  const isMammalOrSynapsid =
    className.toLowerCase() === 'mammalia' ||
    className.toLowerCase() === 'synapsida' ||
    cladeName === 'Early_Mammal_Synapsid';

  if (isMammalOrSynapsid) {
    const hasArchosaurs =
      relString.includes('Bird') ||
      relString.includes('Aves') ||
      relString.includes('Crocodil') ||
      relString.includes('Alligator') ||
      relString.includes('Gharial');

    if (hasArchosaurs) {
      violations.push({
        id: s.id,
        name: s.name,
        category: 'IMPOSSIBLE_COMBINATION',
        message: 'Mammalian or Synapsid taxon cannot list Archosaurian (Aves/Crocodilia) relatives.',
        currentValue: relString
      });
    }
  }

  // 2. Invertebrate Sanity: Invertebrates must never list Archosaurs
  if (cladeName === 'Invertebrate' || className.toLowerCase() === 'insecta' || className.toLowerCase() === 'arthropoda') {
    if (relString.includes('Bird') || relString.includes('Crocodil') || relString.includes('Aves')) {
      violations.push({
        id: s.id,
        name: s.name,
        category: 'IMPOSSIBLE_COMBINATION',
        message: 'Invertebrate taxon cannot list vertebrate Archosaurian (Aves/Crocodilia) relatives.',
        currentValue: relString
      });
    }
  }

  // 3. Obsolete Orders
  const obsoleteOrders = ['acreodi', 'thecodontia', 'pelycosauria', 'condylarthra', 'creodonta'];
  if (obsoleteOrders.includes(orderName.toLowerCase())) {
    violations.push({
      id: s.id,
      name: s.name,
      category: 'OBSOLETE_ORDER',
      message: `Order "${orderName}" is an obsolete or paraphyletic taxon and must be revised.`,
      currentValue: orderName
    });
  }

  // 4. Family Syntax: Family must not contain species names, "clade", or spaces representing binomials
  if (familyName) {
    const famLower = familyName.toLowerCase();
    if (famLower.includes(' clade') || famLower.includes(' group')) {
      violations.push({
        id: s.id,
        name: s.name,
        category: 'INVALID_FAMILY',
        message: `Family field contains informal clade string ("${familyName}"). Must be a formally published family ending in -idae or marked Uncertain.`,
        currentValue: familyName
      });
    } else if (
      (familyName.includes(' ') && !familyName.startsWith('subfamily') && !familyName.startsWith('superfamily')) ||
      famLower === genusName.toLowerCase() ||
      famLower === speciesName.toLowerCase()
    ) {
      violations.push({
        id: s.id,
        name: s.name,
        category: 'INVALID_FAMILY',
        message: `Family field contains species string or improper format ("${familyName}").`,
        currentValue: familyName
      });
    }
  }

  // 5. Structured Extant Relatives Verification
  if (typeof rel === 'object' && rel !== null && !Array.isArray(rel)) {
    if (rel.verified === true) {
      if (!rel.sources || !Array.isArray(rel.sources) || rel.sources.length === 0) {
        violations.push({
          id: s.id,
          name: s.name,
          category: 'MISSING_SOURCES_ON_VERIFIED',
          message: 'Extant relatives record marked verified: true but contains zero academic sources.',
          currentValue: rel
        });
      }
    }
  }

  return violations;
}

export function validateCatalog(catalogPath: string, isCI: boolean = false): { violations: TaxonomicViolation[]; totalSpecies: number } {
  const fullPath = path.resolve(catalogPath);
  const data: any[] = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

  const allViolations: TaxonomicViolation[] = [];

  for (const s of data) {
    const v = validateSpecimen(s);
    if (v.length > 0) {
      allViolations.push(...v);
    }
  }

  console.log(`\n=======================================================`);
  console.log(`🧬 TAXONOMY & EXTANT RELATIVES VALIDATION REPORT`);
  console.log(`=======================================================`);
  console.log(`Catalog file: ${path.basename(catalogPath)}`);
  console.log(`Total specimens evaluated: ${data.length}`);
  console.log(`Total violations detected: ${allViolations.length}`);

  const byCat: Record<string, number> = {};
  allViolations.forEach(v => {
    byCat[v.category] = (byCat[v.category] || 0) + 1;
  });

  console.log(`Violations breakdown by category:`, byCat);

  if (allViolations.length > 0) {
    console.log(`\n⚠️  Sample of Detected Violations (First 10):`);
    allViolations.slice(0, 10).forEach((v, idx) => {
      console.log(`  [${idx + 1}] ID ${v.id} (${v.name}) [${v.category}]: ${v.message} (Current: "${v.currentValue}")`);
    });
  } else {
    console.log(`\n✅ 100% of specimens passed all taxonomic and phylogenetic validation checks.`);
  }

  if (isCI && allViolations.length > 0) {
    console.error(`\n❌ CI FAILURE: Found ${allViolations.length} phylogenetic/taxonomic violations in catalog.`);
    process.exit(1);
  }

  return { violations: allViolations, totalSpecies: data.length };
}

// Direct CLI Execution
if (process.argv[1] && (process.argv[1].endsWith('validate-taxonomy-and-relatives.ts') || process.argv[1].endsWith('validate-taxonomy-and-relatives.js'))) {
  const isCI = process.argv.includes('--ci');
  let catalogFile = process.argv.find(arg => arg.endsWith('.json'));
  if (!catalogFile) {
    if (fs.existsSync('./prisma/species_full_export.json')) {
      catalogFile = './prisma/species_full_export.json';
    } else if (fs.existsSync('./backend/prisma/species_full_export.json')) {
      catalogFile = './backend/prisma/species_full_export.json';
    } else {
      catalogFile = path.resolve(__dirname, '../prisma/species_full_export.json');
    }
  }
  validateCatalog(catalogFile, isCI);
}
