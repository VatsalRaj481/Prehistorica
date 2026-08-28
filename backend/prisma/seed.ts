import { PrismaClient, Clade, Diet, Habitat } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // ══════════════════════════════════════════════════════════════════════════════
  // SAFETY GUARD — INSERT-ONLY MODE
  // seed.ts will NEVER update or overwrite any existing row.
  // All manually-corrected fields (media, taxonomy, interestingFacts, sources,
  // closestLivingRelatives, habitat) are permanently safe from seed runs.
  // To force a full re-seed from scratch, manually truncate the Species table.
  // ══════════════════════════════════════════════════════════════════════════════
  console.log('Seeding species data (INSERT-ONLY — existing rows will be skipped)...');
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

  // Helper to normalize strings (lowercase, trimmed, collapsed inner whitespace)
  function normalizeStr(str?: string): string {
    if (!str) return '';
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // Pre-load ALL existing normalized names, scientificNames, and genus keys
  const existingRows = await prisma.species.findMany({
    select: { name: true, scientificName: true }
  });

  // existingNormalizedKeys stores ONLY full normalized names and full normalized scientificNames
  const existingNormalizedKeys = new Set<string>();
  const existingGenera = new Set<string>();

  for (const r of existingRows) {
    const normName = normalizeStr(r.name);
    const normSciName = normalizeStr(r.scientificName || r.name);
    if (normName) existingNormalizedKeys.add(normName);
    if (normSciName) existingNormalizedKeys.add(normSciName);

    const genus = normSciName.split(' ')[0] || normName.split(' ')[0];
    if (genus) existingGenera.add(genus);
  }

  console.log(`DB has ${existingRows.length} species records. Only genuinely NEW species will be inserted.`);

  const cladeMap: Record<string, Clade> = {
    'marine reptile': Clade.Marine_Reptile,
    'marine_reptile': Clade.Marine_Reptile,
    'early mammal/synapsid': Clade.Early_Mammal_Synapsid,
    'early_mammal_synapsid': Clade.Early_Mammal_Synapsid,
    'synapsid/early mammal': Clade.Early_Mammal_Synapsid,
    'synapsid': Clade.Early_Mammal_Synapsid,
    'early tetrapod/amphibian': Clade.Early_Tetrapod_Amphibian,
    'early_tetrapod_amphibian': Clade.Early_Tetrapod_Amphibian,
    'theropod': Clade.Theropod,
    'sauropod': Clade.Sauropod,
    'ornithischian': Clade.Ornithischian,
    'pterosaur': Clade.Pterosaur,
    'invertebrate': Clade.Invertebrate,
    'sauropodomorph': Clade.Sauropodomorph,
    'aetosaur': Clade.Aetosaur,
    'phytosaur': Clade.Phytosaur,
    'rauisuchian': Clade.Rauisuchian,
    'poposauroid': Clade.Poposauroid,
    'crocodylomorph': Clade.Crocodylomorph,
    'silesaurid': Clade.Silesaurid,
    'archosauriform': Clade.Archosauriform,
    'protorosaur': Clade.Protorosaur,
    'ankylosaur': Clade.Ornithischian,
    'stegosaur': Clade.Ornithischian,
    'hadrosaur': Clade.Ornithischian,
    'ceratopsian': Clade.Ornithischian,
    'ichthyosaur': Clade.Marine_Reptile,
    'other': Clade.Other
  };

  let inserted = 0;
  let skipped = 0;

  for (const s of speciesList) {
    const normName = normalizeStr(s.name);
    const normSciName = normalizeStr(s.scientificName || s.name);

    // Check 1: Full exact match against existing names / scientificNames
    let isDuplicate = existingNormalizedKeys.has(normName) || existingNormalizedKeys.has(normSciName);

    // Check 2: Single-word candidate name handling (e.g. candidate name "Ankylosaurus" when "Ankylosaurus magniventris" exists)
    // ONLY trigger if candidate itself is a single-word genus name without species epithet
    const isCandidateSingleWord = !normName.includes(' ') || !normSciName.includes(' ');
    if (!isDuplicate && isCandidateSingleWord) {
      const candGenus = normSciName.split(' ')[0] || normName.split(' ')[0];
      if (candGenus && existingGenera.has(candGenus)) {
        isDuplicate = true;
      }
    }

    // ── SKIP if this species already exists — never overwrite live data ──
    if (isDuplicate) {
      skipped++;
      continue;
    }

    const interestingFactsArray = typeof s.interestingFacts === 'string'
      ? [s.interestingFacts]
      : Array.isArray(s.interestingFacts)
        ? s.interestingFacts.map((x: any) => String(x))
        : [];

    const locationsArray = typeof s.locations === 'string'
      ? [s.locations]
      : Array.isArray(s.locations)
        ? s.locations.map((x: any) => String(x))
        : ['Global'];

    const myaStart = typeof s.myaStart === 'string' ? parseFloat(s.myaStart) : (typeof s.myaStart === 'number' ? s.myaStart : 0);
    const myaEnd = typeof s.myaEnd === 'string' ? parseFloat(s.myaEnd) : (typeof s.myaEnd === 'number' ? s.myaEnd : 0);
    const lengthM = typeof s.lengthM === 'string' ? parseFloat(s.lengthM) : (typeof s.lengthM === 'number' ? s.lengthM : null);
    const heightM = typeof s.heightM === 'string' ? parseFloat(s.heightM) : (typeof s.heightM === 'number' ? s.heightM : null);
    const weightKg = typeof s.weightKg === 'string' ? parseFloat(s.weightKg) : (typeof s.weightKg === 'number' ? s.weightKg : null);

    const dietDetails = s.dietDetails || "No diet details available.";
    const discoveryHistory = s.discoveryHistory || "No discovery history available.";
    const sizeNotes = s.sizeNotes || "No size details available.";

    const rawDiet = (s.dietType || s.diet || '').toLowerCase();
    const diet: Diet = rawDiet.includes('carnivore') ? Diet.carnivore
      : rawDiet.includes('herbivore') ? Diet.herbivore
      : rawDiet.includes('omnivore') ? Diet.omnivore
      : rawDiet.includes('piscivore') ? Diet.piscivore
      : rawDiet.includes('filter') || rawDiet.includes('plankton') ? Diet.filter_feeder : Diet.carnivore;

    const rawType = (s.creatureType || s.clade || s.habitat || '').toLowerCase();
    const habitat: Habitat = rawType.includes('marine') || rawType.includes('plesiosaur') || rawType.includes('ichthyosaur') || rawType.includes('mosasaur') ? Habitat.marine
      : rawType.includes('pterosaur') || rawType.includes('flying') || rawType.includes('aerial') ? Habitat.aerial
      : rawType.includes('amphibian') || rawType.includes('semi_aquatic') || rawType.includes('semi-aquatic') ? Habitat.semi_aquatic
      : rawType.includes('freshwater') ? Habitat.freshwater : Habitat.terrestrial;

    const rawCladeStr = (s.clade || s.creatureType || '').toLowerCase();
    let finalClade: Clade = Clade.Other;
    for (const [key, val] of Object.entries(cladeMap)) {
      if (rawCladeStr.includes(key)) {
        finalClade = val;
        break;
      }
    }

    const mediaArray: any[] = Array.isArray(s.media) ? s.media : [];
    if (mediaArray.length === 0) {
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
    }

    const taxParts = (s.taxonomicClassification || '').split('->').map((t: string) => t.trim());
    const taxonomyObj = s.taxonomy || {
      domain: 'Eukaryota',
      kingdom: 'Animalia',
      phylum: taxParts[0] || 'Chordata',
      class: taxParts[1] || (s.creatureType ? s.creatureType : 'Reptilia'),
      order: taxParts[2] || 'Archosauria',
      family: s.family || taxParts[3] || 'Unclassified',
      genus: s.genus || s.name.split(' ')[0],
      species: s.scientificName || s.name
    };

    const sizeEstimateObj = s.sizeEstimate || {
      length: { value: lengthM, unit: 'm', confidence: lengthM ? 'well-supported' : 'estimated' },
      height: { value: heightM, unit: 'm', confidence: heightM ? 'well-supported' : 'estimated' },
      weight: { value: weightKg, unit: 'kg', confidence: weightKg ? 'estimated' : 'disputed' }
    };

    const sourcesArray = s.sources || [
      { citation: 'Paleobiology Database (PBDB) species record', url: 'https://paleobiodb.org' },
      { citation: `${s.scientificName || s.name} description in paleontological literature`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(s.name)}` }
    ];

    const extinctionEvent = s.extinctionEvent || (s.timePeriod.includes('Cretaceous') ? 'K-Pg extinction event (66 MYA)' : null);
    const closestRelatives = s.closestLivingRelatives || ['Modern Birds (Aves)', 'Crocodilians'];

    const upsertData: any = {
      name: s.name,
      scientificName: s.scientificName || s.name,
      nameMeaning: s.nameMeaning || 'Prehistoric species',
      timePeriod: s.timePeriod,
      epoch: s.epoch || `${s.timePeriod} Epoch`,
      myaStart: myaStart,
      myaEnd: myaEnd,
      diet: diet,
      dietDetails: dietDetails,
      habitat: habitat,
      clade: finalClade,
      geographicRange: typeof s.geographicRange === 'object' ? JSON.stringify(s.geographicRange) : (s.geographicRange || JSON.stringify({
        region: locationsArray[0] || 'Global',
        country: s.country || 'Unknown',
        fossilFormation: s.fossilFormation || 'Unspecified formation'
      })),
      taxonomy: typeof taxonomyObj === 'object' ? JSON.stringify(taxonomyObj) : String(taxonomyObj),
      taxonomicStatus: s.taxonomicStatus || 'valid',
      media: typeof mediaArray === 'object' ? JSON.stringify(mediaArray) : String(mediaArray),
      discoveryHistory: discoveryHistory,
      interestingFacts: typeof s.interestingFacts === 'string' ? JSON.stringify([s.interestingFacts]) : JSON.stringify(interestingFactsArray),
      sizeNotes: sizeNotes,
      sizeEstimate: typeof sizeEstimateObj === 'object' ? JSON.stringify(sizeEstimateObj) : String(sizeEstimateObj),
      sizeComparisonToHuman: true,
      extinctionEvent: extinctionEvent,
      closestLivingRelatives: Array.isArray(closestRelatives) ? JSON.stringify(closestRelatives) : String(closestRelatives),
      sources: typeof sourcesArray === 'object' ? JSON.stringify(sourcesArray) : String(sourcesArray),
      placeholder: false
    };

    // INSERT ONLY — never update an existing row
    await prisma.species.create({ data: upsertData });
    inserted++;
  }

  console.log(`Seed complete: ${inserted} new species inserted, ${skipped} existing species skipped (untouched).`);
  console.log('Backfilling related species relations (genus/family-based)...');

  await prisma.speciesRelation.deleteMany({});

  const allDbSpecies = await prisma.species.findMany({});
  
  for (const species of allDbSpecies) {
    let genus: string | null = null;
    let family: string | null = null;
    if (species.taxonomy) {
      try {
        const tax = JSON.parse(species.taxonomy);
        genus = tax.genus || null;
        family = tax.family || null;
      } catch (e) {}
    }
    if (!genus && !family) continue;

    const related = allDbSpecies.filter(other => {
      if (other.id === species.id) return false;
      let otherGenus: string | null = null;
      let otherFamily: string | null = null;
      if (other.taxonomy) {
        try {
          const tax = JSON.parse(other.taxonomy);
          otherGenus = tax.genus || null;
          otherFamily = tax.family || null;
        } catch (e) {}
      }
      const sameGenus = genus && otherGenus && otherGenus.toLowerCase() === genus.toLowerCase();
      const sameFamily = family && otherFamily && otherFamily.toLowerCase() === family.toLowerCase();
      
      return sameGenus || sameFamily;
    });

    related.sort((a, b) => {
      let aGenus: string | null = null;
      let bGenus: string | null = null;
      try { aGenus = JSON.parse(a.taxonomy || '{}').genus; } catch(e){}
      try { bGenus = JSON.parse(b.taxonomy || '{}').genus; } catch(e){}
      const aIsGenus = aGenus && genus && aGenus.toLowerCase() === genus.toLowerCase();
      const bIsGenus = bGenus && genus && bGenus.toLowerCase() === genus.toLowerCase();
      if (aIsGenus && !bIsGenus) return -1;
      if (!aIsGenus && bIsGenus) return 1;
      return 0;
    });

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

  console.log('Seeding and backfill completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
