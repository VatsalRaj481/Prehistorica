/**
 * ══════════════════════════════════════════════════════════════════════════════
 * PREHISTORICA OFFICIAL INGESTION CLI: add-species.ts
 * ══════════════════════════════════════════════════════════════════════════════
 * This project's core rule: scripts that add species must NEVER modify existing rows.
 * If you need to fix/update an existing species' data, that is a separate, manual,
 * reviewed operation — never part of routine seeding or adding new species.
 * ══════════════════════════════════════════════════════════════════════════════
 */

import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient, Clade, Diet, Habitat, TaxonomicStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { takeSnapshot, verifyRegression } from './verify-no-regression.js';

const prisma = new PrismaClient();

// Allowed Clade Enum Values
const CladeEnum = z.nativeEnum(Clade);
const DietEnum = z.nativeEnum(Diet);
const HabitatEnum = z.nativeEnum(Habitat);
const TaxonomicStatusEnum = z.nativeEnum(TaxonomicStatus);

// Confidence Enum
const ConfidenceEnum = z.enum(['well-supported', 'estimated']);

// Size Measurement Schema
const SizeMeasurementSchema = z.object({
  value: z.number({ required_error: 'value is required' }),
  unit: z.string({ required_error: 'unit is required' }),
  confidence: ConfidenceEnum
});

// Full Species Schema Definition
const SpeciesInputSchema = z.object({
  name: z.string().min(1, 'name is required'),
  scientificName: z.string().min(1, 'scientificName is required'),
  nameMeaning: z.string().min(1, 'nameMeaning is required'),
  timePeriod: z.string().min(1, 'timePeriod is required'),
  myaStart: z.number({ required_error: 'myaStart is required' }),
  myaEnd: z.number({ required_error: 'myaEnd is required' }),
  clade: CladeEnum,
  diet: DietEnum,
  habitat: HabitatEnum,
  dietDetails: z.string().min(1, 'dietDetails is required'),
  taxonomicStatus: TaxonomicStatusEnum,
  extinctionEvent: z.string().nullable().optional(),
  closestLivingRelatives: z.array(z.string()).min(1, 'closestLivingRelatives array is required'),
  media: z.array(
    z.object({
      url: z.string().url('media url must be valid URL'),
      type: z.enum(['art', 'photo', 'diagram', 'scale_diagram']),
      credit: z.string().min(1, 'media credit is required'),
      sourceUrl: z.string().url().optional()
    })
  ).min(1, 'media array must contain at least 1 item'),
  taxonomy: z.object({
    kingdom: z.string().optional(),
    phylum: z.string().optional(),
    clade: z.string().optional(),
    order: z.string().optional(),
    family: z.string().optional(),
    genus: z.string().min(1, 'taxonomy.genus is required'),
    species: z.string().min(1, 'taxonomy.species is required')
  }),
  geographicRange: z.object({
    continent: z.string().optional(),
    region: z.string().min(1, 'geographicRange.region is required'),
    country: z.string().min(1, 'geographicRange.country is required'),
    fossilFormation: z.string().min(1, 'geographicRange.fossilFormation is required')
  }),
  sizeEstimate: z.object({
    length: SizeMeasurementSchema,
    height: SizeMeasurementSchema,
    weight: SizeMeasurementSchema
  }),
  sizeNotes: z.string().min(1, 'sizeNotes is required'),
  discoveryHistory: z.string().min(1, 'discoveryHistory is required'),
  interestingFacts: z.array(z.string()).min(1, 'interestingFacts must contain at least 1 item'),
  sources: z.array(
    z.object({
      citation: z.string().min(1, 'source citation is required'),
      url: z.string().url('source url must be valid URL')
    })
  ).min(1, 'sources must contain at least 1 citation and url')
});

function normalizeStr(str?: string): string {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const fileArgIndex = args.findIndex(a => a === '--file' || a === '--json');

  let filePath = '';
  if (fileArgIndex !== -1 && args[fileArgIndex + 1]) {
    filePath = args[fileArgIndex + 1];
  } else {
    // Find first non-flag argument
    filePath = args.find(a => !a.startsWith('--')) || '';
  }

  if (!filePath) {
    console.error('ERROR: Missing required species JSON input file argument.');
    console.error('Usage: npm run add-species -- <json-file-path> [--dry-run]');
    process.exit(1);
  }

  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`ERROR: Input file not found at path "${absolutePath}"`);
    process.exit(1);
  }

  const rawJson = fs.readFileSync(absolutePath, 'utf8');
  let parsedInput: any;
  try {
    parsedInput = JSON.parse(rawJson);
  } catch (err: any) {
    console.error(`ERROR: Failed to parse JSON file: ${err.message}`);
    process.exit(1);
  }

  console.log(`=== ADD SPECIES CLI WORKFLOW ===`);
  console.log(`Input File: ${absolutePath}`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Validation Only)' : 'LIVE INGESTION (Database Write)'}\n`);

  // Validate with Zod
  const validationResult = SpeciesInputSchema.safeParse(parsedInput);

  if (!validationResult.success) {
    console.error(`❌ VALIDATION REJECTED! Entry failed schema validation:\n`);
    validationResult.error.issues.forEach((e) => {
      const fieldPath = e.path.join('.');
      console.error(`  - Field "${fieldPath}": ${e.message}`);
    });

    console.error(`\nNo database changes were made.`);
    process.exit(1);
  }

  const data = validationResult.data;
  console.log(`✅ SCHEMA VALIDATED SUCCESSFULLY!`);
  console.log(`Species: ${data.name} (${data.scientificName}) - Clade: ${data.clade}\n`);

  // ══════════════════════════════════════════════════════════════════════════════
  // DUPLICATE REJECTION CHECK (AGAINST LIVE DATABASE)
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('🔍 Checking database for existing records with matching name or scientific name...');
  const existingRows = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true }
  });

  const normCandidateName = normalizeStr(data.name);
  const normCandidateSciName = normalizeStr(data.scientificName);
  const candGenus = normCandidateSciName.split(' ')[0] || normCandidateName.split(' ')[0];
  const isCandidateSingleWord = !normCandidateName.includes(' ') || !normCandidateSciName.includes(' ');

  let duplicateMatch: { id: number; name: string; scientificName: string; reason: string } | null = null;

  for (const r of existingRows) {
    const normRowName = normalizeStr(r.name);
    const normRowSciName = normalizeStr(r.scientificName || r.name);
    const rowGenus = normRowSciName.split(' ')[0] || normRowName.split(' ')[0];

    if (normRowName === normCandidateName) {
      duplicateMatch = { id: r.id, name: r.name, scientificName: r.scientificName, reason: `Exact common name match with #${r.id}` };
      break;
    }
    if (normRowSciName === normCandidateSciName) {
      duplicateMatch = { id: r.id, name: r.name, scientificName: r.scientificName, reason: `Exact scientific name match with #${r.id}` };
      break;
    }
    if (normRowName === normCandidateSciName || normRowSciName === normCandidateName) {
      duplicateMatch = { id: r.id, name: r.name, scientificName: r.scientificName, reason: `Cross-match between name and scientificName with #${r.id}` };
      break;
    }
    if (isCandidateSingleWord && candGenus && rowGenus === candGenus) {
      duplicateMatch = { id: r.id, name: r.name, scientificName: r.scientificName, reason: `Single-word candidate matches genus of existing species #${r.id}` };
      break;
    }
  }

  if (duplicateMatch) {
    console.error('\n' + '█'.repeat(80));
    console.error('❌ REJECTED: SPECIES ALREADY EXISTS IN DATABASE!');
    console.error('█'.repeat(80));
    console.error(`Candidate Species: "${data.name}" (${data.scientificName})`);
    console.error(`Conflicting Row:   #${duplicateMatch.id} "${duplicateMatch.name}" (${duplicateMatch.scientificName})`);
    console.error(`Conflict Reason:   ${duplicateMatch.reason}`);
    console.error('\nThis project enforces an INSERT-ONLY policy. Adding a species that already');
    console.error('exists is strictly prohibited to prevent data regression.');
    console.error('If you intended to update an existing record, perform a manual, reviewed operation.');
    console.error('█'.repeat(80) + '\n');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`✅ NO DUPLICATES FOUND: "${data.name}" is genuinely new (checked against ${existingRows.length} existing records).\n`);

  if (isDryRun) {
    console.log(`[DRY-RUN COMPLETE]: Entry is 100% valid and verified unique. Database write skipped.`);
    await prisma.$disconnect();
    return;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PRE-OPERATION SNAPSHOT CAPTURE (AUTOMATED REGRESSION PROTECTION)
  // ══════════════════════════════════════════════════════════════════════════════
  await takeSnapshot();

  // ══════════════════════════════════════════════════════════════════════════════
  // DATABASE WRITE (INSERT ONLY - NEVER UPDATE OR UPSERT)
  // ══════════════════════════════════════════════════════════════════════════════
  try {
    const createdSpecies = await prisma.species.create({
      data: {
        name: data.name,
        scientificName: data.scientificName,
        nameMeaning: data.nameMeaning,
        timePeriod: data.timePeriod,
        myaStart: data.myaStart,
        myaEnd: data.myaEnd,
        clade: data.clade,
        diet: data.diet,
        habitat: data.habitat,
        dietDetails: data.dietDetails,
        taxonomicStatus: data.taxonomicStatus,
        extinctionEvent: data.extinctionEvent || null,
        closestLivingRelatives: JSON.stringify(data.closestLivingRelatives),
        media: JSON.stringify(data.media),
        taxonomy: JSON.stringify(data.taxonomy),
        geographicRange: JSON.stringify(data.geographicRange),
        sizeEstimate: JSON.stringify(data.sizeEstimate),
        sizeNotes: data.sizeNotes,
        discoveryHistory: data.discoveryHistory,
        interestingFacts: JSON.stringify(data.interestingFacts),
        sources: JSON.stringify(data.sources),
        placeholder: false
      }
    });

    console.log(`\n🎉 SUCCESS: Species inserted into database!`);
    console.log(`Created Species ID: #${createdSpecies.id}`);

    // Sanity Check on Newly Created Row
    console.log(`\n--- SANITY CHECK ON NEWLY INGESTED RECORD (#${createdSpecies.id}) ---`);
    const fetched = await prisma.species.findUnique({ where: { id: createdSpecies.id } });

    if (!fetched) {
      throw new Error(`Sanity check failed: Row #${createdSpecies.id} could not be read back!`);
    }

    const missingFields: string[] = [];
    if (!fetched.name) missingFields.push('name');
    if (!fetched.scientificName) missingFields.push('scientificName');
    if (!fetched.sources || fetched.sources === '[]') missingFields.push('sources');
    if (!fetched.sizeEstimate) missingFields.push('sizeEstimate');

    if (missingFields.length > 0) {
      console.error(`⚠️ SANITY CHECK FAILED: Incomplete fields found: ${missingFields.join(', ')}`);
    } else {
      console.log(`✅ SANITY CHECK PASSED: Record is 100% complete with no missing required fields.`);
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // POST-OPERATION VERIFICATION (AUTOMATED REGRESSION CHECK)
    // ══════════════════════════════════════════════════════════════════════════════
    const verification = await verifyRegression();
    if (!verification.success) {
      console.error('❌ POST-OPERATION REGRESSION CHECK FAILED!');
      process.exit(1);
    }

    // Final Database Count
    const finalCount = await prisma.species.count();
    console.log(`\n==============================================`);
    console.log(`FINAL DATABASE ROSTER COUNT: ${finalCount} unique species`);
    console.log(`==============================================\n`);

  } catch (err: any) {
    console.error(`❌ DATABASE WRITE ERROR: ${err.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
