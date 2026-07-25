import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// Handle ES module __dirname in Node.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Seeding species data...');
  const files = ['species_triassic.json', 'species_jurassic.json', 'species_cretaceous.json', 'species_others.json'];
  let speciesList: any[] = [];

  for (const file of files) {
    const jsonPath = path.join(__dirname, file);
    if (fs.existsSync(jsonPath)) {
      const rawData = fs.readFileSync(jsonPath, 'utf8');
      const content = JSON.parse(rawData);
      speciesList = speciesList.concat(content);
    } else {
      console.warn(`Warning: File not found: ${file}`);
    }
  }

  console.log(`Merged ${speciesList.length} species from split files. Sanitizing and upserting into DB...`);

  for (const s of speciesList) {
    // Sanitize string arrays
    const interestingFactsArray = typeof s.interestingFacts === 'string'
      ? [s.interestingFacts]
      : Array.isArray(s.interestingFacts)
        ? s.interestingFacts.map(x => String(x))
        : [];

    const locationsArray = typeof s.locations === 'string'
      ? [s.locations]
      : Array.isArray(s.locations)
        ? s.locations.map(x => String(x))
        : [];

    // Sanitize floats
    const myaStart = typeof s.myaStart === 'string' ? parseFloat(s.myaStart) : (typeof s.myaStart === 'number' ? s.myaStart : 0);
    const myaEnd = typeof s.myaEnd === 'string' ? parseFloat(s.myaEnd) : (typeof s.myaEnd === 'number' ? s.myaEnd : 0);
    const lengthM = typeof s.lengthM === 'string' ? parseFloat(s.lengthM) : (typeof s.lengthM === 'number' ? s.lengthM : null);
    const heightM = typeof s.heightM === 'string' ? parseFloat(s.heightM) : (typeof s.heightM === 'number' ? s.heightM : null);
    const weightKg = typeof s.weightKg === 'string' ? parseFloat(s.weightKg) : (typeof s.weightKg === 'number' ? s.weightKg : null);

    // Sanitize description/strings
    const dietDetails = s.dietDetails || "No diet details available.";
    const discoveryHistory = s.discoveryHistory || "No discovery history available.";
    const sizeNotes = s.sizeNotes || "No size details available.";

    await prisma.species.upsert({
      where: { name: s.name },
      update: {
        scientificName: s.scientificName,
        nameMeaning: s.nameMeaning,
        timePeriod: s.timePeriod,
        myaStart: myaStart,
        myaEnd: myaEnd,
        dietType: s.dietType,
        dietDetails: dietDetails,
        locations: locationsArray,
        taxonomicClassification: s.taxonomicClassification,
        genus: s.genus,
        family: s.family,
        fossilFormation: s.fossilFormation,
        country: s.country,
        creatureType: s.creatureType,
        reconstructionImageUrl: s.reconstructionImageUrl,
        fossilImageUrl: s.fossilImageUrl,
        discoveryHistory: discoveryHistory,
        interestingFacts: interestingFactsArray,
        lengthM: lengthM,
        heightM: heightM,
        weightKg: weightKg,
        sizeNotes: sizeNotes,
      },
      create: {
        name: s.name,
        scientificName: s.scientificName,
        nameMeaning: s.nameMeaning,
        timePeriod: s.timePeriod,
        myaStart: myaStart,
        myaEnd: myaEnd,
        dietType: s.dietType,
        dietDetails: dietDetails,
        locations: locationsArray,
        taxonomicClassification: s.taxonomicClassification,
        genus: s.genus,
        family: s.family,
        fossilFormation: s.fossilFormation,
        country: s.country,
        creatureType: s.creatureType,
        reconstructionImageUrl: s.reconstructionImageUrl,
        fossilImageUrl: s.fossilImageUrl,
        discoveryHistory: discoveryHistory,
        interestingFacts: interestingFactsArray,
        lengthM: lengthM,
        heightM: heightM,
        weightKg: weightKg,
        sizeNotes: sizeNotes,
      }
    });
  }

  console.log('Species entries upserted. Backfilling related species relations (genus/family-based)...');

  // Delete all existing relations first to start fresh
  await prisma.speciesRelation.deleteMany({});

  const allDbSpecies = await prisma.species.findMany({});
  
  for (const species of allDbSpecies) {
    if (!species.genus && !species.family) continue;

    // Find other species sharing same genus or family
    const related = allDbSpecies.filter(other => {
      if (other.id === species.id) return false;
      
      const sameGenus = species.genus && other.genus && other.genus.toLowerCase() === species.genus.toLowerCase();
      const sameFamily = species.family && other.family && other.family.toLowerCase() === species.family.toLowerCase();
      
      return sameGenus || sameFamily;
    });

    // Sort: genus matches first
    related.sort((a, b) => {
      const aIsGenus = a.genus && species.genus && a.genus.toLowerCase() === species.genus.toLowerCase();
      const bIsGenus = b.genus && species.genus && b.genus.toLowerCase() === species.genus.toLowerCase();
      if (aIsGenus && !bIsGenus) return -1;
      if (!aIsGenus && bIsGenus) return 1;
      return 0;
    });

    // Take top 6 related species
    const topRelated = related.slice(0, 6);

    for (const rel of topRelated) {
      await prisma.speciesRelation.upsert({
        where: {
          speciesId_relatedSpeciesId: {
            speciesId: species.id,
            relatedSpeciesId: rel.id
          }
        },
        update: {},
        create: {
          speciesId: species.id,
          relatedSpeciesId: rel.id
        }
      });
    }
  }

  console.log('Seeding and backfill complete successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
