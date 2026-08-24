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
        : ['Global'];

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

    // Normalize Diet & Habitat
    const rawDiet = (s.dietType || '').toLowerCase();
    const diet = rawDiet.includes('carnivore') ? 'carnivore'
      : rawDiet.includes('herbivore') ? 'herbivore'
      : rawDiet.includes('omnivore') ? 'omnivore'
      : rawDiet.includes('piscivore') ? 'piscivore'
      : rawDiet.includes('filter') ? 'filter_feeder' : 'carnivore';

    const rawType = (s.creatureType || '').toLowerCase();
    const habitat = rawType.includes('marine') || rawType.includes('plesiosaur') || rawType.includes('ichthyosaur') || rawType.includes('mosasaur') ? 'marine'
      : rawType.includes('pterosaur') || rawType.includes('flying') ? 'aerial'
      : rawType.includes('amphibian') ? 'semi_aquatic' : 'terrestrial';

    // Controlled Clade Vocabulary
    const clade = rawType.includes('theropod') ? 'Theropod'
      : rawType.includes('sauropod') ? 'Sauropod'
      : rawType.includes('ornithischian') || rawType.includes('ceratopsian') || rawType.includes('hadrosaur') ? 'Ornithischian'
      : rawType.includes('pterosaur') ? 'Pterosaur'
      : rawType.includes('marine') || rawType.includes('plesiosaur') || rawType.includes('mosasaur') ? 'Marine Reptile'
      : rawType.includes('ichthyosaur') ? 'Ichthyosaur'
      : rawType.includes('ankylosaur') || rawType.includes('stegosaur') ? 'Ankylosaur'
      : rawType.includes('synapsid') || rawType.includes('mammal') ? 'Early Mammal/Synapsid'
      : rawType.includes('invertebrate') ? 'Invertebrate' : 'Other';

    // Media Array JSON
    const mediaArray: any[] = [];
    if (s.reconstructionImageUrl) {
      mediaArray.push({
        url: s.reconstructionImageUrl,
        type: 'art',
        credit: 'Life reconstruction illustration',
        sourceUrl: s.reconstructionImageUrl
      });
    }
    if (s.fossilImageUrl) {
      mediaArray.push({
        url: s.fossilImageUrl,
        type: 'photo',
        credit: 'Fossil skeletal specimen photo',
        sourceUrl: s.fossilImageUrl
      });
    }

    // Taxonomy Tree JSON
    const taxParts = (s.taxonomicClassification || '').split('->').map((t: string) => t.trim());
    const taxonomyObj = {
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: taxParts[0] || 'Chordata',
      class: taxParts[1] || (s.creatureType ? s.creatureType : 'Reptilia'),
      order: taxParts[2] || 'Archosauria',
      family: s.family || taxParts[3] || 'Unclassified',
      genus: s.genus || s.name.split(' ')[0],
      species: s.scientificName || s.name
    };

    // Size Estimate JSON
    const sizeEstimateObj = {
      length: { value: lengthM, unit: 'm', confidence: lengthM ? 'well-supported' : 'estimated' },
      height: { value: heightM, unit: 'm', confidence: heightM ? 'well-supported' : 'estimated' },
      weight: { value: weightKg, unit: 'kg', confidence: weightKg ? 'estimated' : 'disputed' }
    };

    // Sources Citation JSON
    const sourcesArray = s.sources || [
      { citation: 'Paleobiology Database (PBDB) species record', url: 'https://paleobiodb.org' },
      { citation: `${s.scientificName || s.name} description in paleontological literature`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(s.name)}` }
    ];

    const extinctionEvent = s.extinctionEvent || (s.timePeriod.includes('Cretaceous') ? 'K-Pg extinction event (66 MYA)' : null);
    const closestRelatives = s.closestLivingRelatives || ['Modern Birds (Aves)', 'Crocodilians'];

    const upsertData = {
      name: s.name,
      scientificName: s.scientificName || s.name,
      nameMeaning: s.nameMeaning || 'Prehistoric species',
      timePeriod: s.timePeriod,
      epoch: s.epoch || `${s.timePeriod} Epoch`,
      myaStart: myaStart,
      myaEnd: myaEnd,
      dietType: s.dietType || 'Carnivore',
      diet: diet,
      dietDetails: dietDetails,
      habitat: habitat,
      clade: clade,
      locations: JSON.stringify(locationsArray),
      country: s.country || null,
      fossilFormation: s.fossilFormation || null,
      geographicRange: JSON.stringify({
        region: locationsArray[0] || 'Global',
        country: s.country || 'Unknown',
        fossilFormation: s.fossilFormation || 'Unspecified formation'
      }),
      taxonomicClassification: s.taxonomicClassification || 'Animalia',
      taxonomy: JSON.stringify(taxonomyObj),
      taxonomicStatus: s.taxonomicStatus || 'valid',
      genus: s.genus || null,
      family: s.family || null,
      creatureType: s.creatureType || null,
      reconstructionImageUrl: s.reconstructionImageUrl || null,
      fossilImageUrl: s.fossilImageUrl || null,
      media: JSON.stringify(mediaArray),
      discoveryHistory: discoveryHistory,
      interestingFacts: JSON.stringify(interestingFactsArray),
      lengthM: lengthM,
      heightM: heightM,
      weightKg: weightKg,
      sizeNotes: sizeNotes,
      sizeEstimate: JSON.stringify(sizeEstimateObj),
      sizeComparisonToHuman: true,
      extinctionEvent: extinctionEvent,
      closestLivingRelatives: JSON.stringify(closestRelatives),
      sources: JSON.stringify(sourcesArray),
      placeholder: false
    };

    await prisma.species.upsert({
      where: { name: s.name },
      update: upsertData,
      create: upsertData
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
