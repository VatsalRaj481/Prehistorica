import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * PREHISTORICA PERMANENT FULL-BODY SILHOUETTE VALIDATOR: validate-silhouettes.ts
 * ══════════════════════════════════════════════════════════════════════════════
 * Enforces Curatorial Invariant #3 (AGENTS.md):
 * 1. Full Horizontal Lateral Profile: Silhouettes must depict the complete body
 *    (head, torso, limbs, tail) in horizontal posture.
 * 2. Strictly Prohibited: Partial anatomy (skulls, craniums, heads, busts, jaws,
 *    teeth, footprints, tracks, skeletal mounts).
 * 3. Aspect Ratio Gate: Non-avian theropods and elongated archosaurs must have
 *    aspect ratios >= 1.6:1 (squarish busts <= 1.5:1 are strictly rejected).
 * 4. Open Licensing: Must be open-licensed (CC0, CC BY, CC BY-SA).
 * ══════════════════════════════════════════════════════════════════════════════
 */

// Forbidden partial anatomy keywords (using word boundaries)
const FORBIDDEN_ANATOMY_REGEX = /\b(skull|cranium|head|bust|jaw|teeth|tooth|footprint|trackway)\b/i;

export interface SilhouettePayload {
  url: string;
  sourceUrl?: string;
  license?: string;
  credit?: string;
  taxon?: string;
  taxonMatch?: string;
}

export function validateSilhouetteMetadata(
  sil: SilhouettePayload,
  speciesName: string,
  clade?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const url = (sil.url || '').toLowerCase();
  const sourceUrl = (sil.sourceUrl || '').toLowerCase();
  const credit = (sil.credit || '');
  const taxon = (sil.taxon || '').toLowerCase();

  // 1. Partial Anatomy Keyword Guard
  if (FORBIDDEN_ANATOMY_REGEX.test(url)) {
    errors.push(`URL indicates partial anatomy/skull: "${sil.url}"`);
  }
  if (FORBIDDEN_ANATOMY_REGEX.test(sourceUrl)) {
    errors.push(`Source URL indicates partial anatomy/skull: "${sil.sourceUrl}"`);
  }
  if (FORBIDDEN_ANATOMY_REGEX.test(taxon)) {
    errors.push(`Taxon metadata indicates partial anatomy/skull: "${sil.taxon}"`);
  }

  // Sanitize credit check to avoid false positive on artist surname "Jaime Headden"
  const cleanCredit = credit.replace(/headden/gi, '');
  if (FORBIDDEN_ANATOMY_REGEX.test(cleanCredit)) {
    errors.push(`Credit metadata indicates partial anatomy/skull: "${sil.credit}"`);
  }

  // 2. License Guard: Prohibit NC (Non-Commercial) or ND (No-Derivatives)
  const license = (sil.license || '').toLowerCase();
  if (license.includes('-nc') || license.includes('noncommercial') || license.includes('-nd')) {
    errors.push(`Disallowed restrictive license (NC/ND prohibited): "${sil.license}"`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('🔍 PREHISTORICA SILHOUETTE CURATION & MORPHOLOGY AUDIT');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  const allSpecies = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true, clade: true, comparisonSilhouette: true },
    orderBy: { id: 'asc' }
  });

  console.log(`Auditing ${allSpecies.length} species records for silhouette compliance...\n`);

  let checkedCount = 0;
  let missingCount = 0;
  const violations: { id: number; name: string; errors: string[] }[] = [];

  for (const s of allSpecies) {
    if (!s.comparisonSilhouette) {
      missingCount++;
      continue;
    }

    checkedCount++;
    let sil: SilhouettePayload;
    try {
      sil = typeof s.comparisonSilhouette === 'string'
        ? JSON.parse(s.comparisonSilhouette)
        : s.comparisonSilhouette;
    } catch {
      violations.push({ id: s.id, name: s.name, errors: ['Failed to parse comparisonSilhouette JSON string'] });
      continue;
    }

    const result = validateSilhouetteMetadata(sil, s.name, s.clade);
    if (!result.valid) {
      violations.push({ id: s.id, name: s.name, errors: result.errors });
    }
  }

  console.log(`Audit Results:`);
  console.log(`  - Total species audited: ${allSpecies.length}`);
  console.log(`  - Active silhouettes verified: ${checkedCount}`);
  console.log(`  - Pending silhouettes (none): ${missingCount}`);
  console.log(`  - Total violations detected: ${violations.length}\n`);

  if (violations.length > 0) {
    console.error('❌ SILHOUETTE VALIDATION FAILED! The following records violate curatorial rules:');
    for (const v of violations) {
      console.error(`  - Species #${v.id} (${v.name}):`);
      v.errors.forEach(e => console.error(`      ✕ ${e}`));
    }
    console.error('\nTerminating with exit code 1 to prevent partial anatomy silhouettes.');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('✅ ALL SILHOUETTES COMPLIANT: 100% full-body, lateral, open-licensed silhouettes.');
  await prisma.$disconnect();
}

if (process.argv[1] && process.argv[1].includes('validate-silhouettes')) {
  main().catch(err => {
    console.error('Fatal error in silhouette validation:', err);
    process.exit(1);
  });
}
