import { PrismaClient, Clade, Diet, Habitat, TaxonomicStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

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

  if (isDryRun) {
    console.log(`[DRY-RUN COMPLETE]: Entry is 100% valid. Database write skipped.`);
    await prisma.$disconnect();
    return;
  }

  // Database Write
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

    console.log(`🎉 SUCCESS: Species inserted into database!`);
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
