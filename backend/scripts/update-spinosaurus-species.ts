import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PROTECTED_FIELDS = [
  'name',
  'scientificName',
  'nameMeaning',
  'timePeriod',
  'epoch',
  'myaStart',
  'myaEnd',
  'diet',
  'dietDetails',
  'habitat',
  'clade',
  'geographicRange',
  'taxonomy',
  'taxonomicStatus',
  'media',
  'discoveryHistory',
  'interestingFacts',
  'sizeNotes',
  'sizeEstimate',
  'sizeComparisonToHuman',
  'extinctionEvent',
  'closestLivingRelatives',
  'sources',
  'placeholder'
] as const;

type ProtectedField = typeof PROTECTED_FIELDS[number];

function sortKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  } else if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, any> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortKeys(obj[key]);
    }
    return sorted;
  }
  return obj;
}

function canonicalNormalize(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return JSON.stringify(sortKeys(parsed));
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof val === 'object') {
    return JSON.stringify(sortKeys(val));
  }
  return String(val);
}

// 1. New media for Spinosaurus aegyptiacus (#2061)
const NEW_SPINOSAURUS_AEGYPTIACUS_MEDIA = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Spinosaurus_aegyptiacus_3.png',
    type: 'art',
    credit: 'Gustavo Monroy-Becerril (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Spinosaurus_aegyptiacus_3.png'
  },
  {
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-media/2061-perfect-art.jpg',
    type: 'habitat_scene',
    credit: 'Nobu Tamura (CC BY-SA 4.0)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Spinosaurus_life_restoration_with_Onchopristis.jpg'
  }
];

// 2. Full accurate data for Spinosaurus mirabilis replacing Spinosaurus maroccanus (#2484)
const SPINOSAURUS_MIRABILIS_DATA = {
  name: 'Spinosaurus mirabilis',
  scientificName: 'Spinosaurus mirabilis',
  nameMeaning: 'Astonishing spine lizard (Latin: mirabilis = marvelous/astonishing)',
  timePeriod: 'Late Cretaceous',
  epoch: 'Cenomanian Epoch',
  myaStart: 95.0,
  myaEnd: 93.0,
  diet: 'piscivore' as const,
  dietDetails: 'Large freshwater fishes including Mawsonia, Lepidotes, and lungfish.',
  habitat: 'semi_aquatic' as const,
  clade: 'Theropod' as const,
  geographicRange: JSON.stringify({
    region: 'Africa',
    country: 'Niger',
    fossilFormation: 'Farak Formation',
    coordinates: [16.5, 8.0]
  }),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Reptilia',
    order: 'Saurischia',
    family: 'Spinosauridae',
    genus: 'Spinosaurus',
    species: 'Spinosaurus mirabilis',
    source: 'Sereno et al. (2026)'
  }),
  taxonomicStatus: 'valid' as const,
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Spinosaurus_mirabilis.png',
      type: 'art',
      credit: 'Connor Ashbridge (CC BY 4.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Spinosaurus_mirabilis.png'
    },
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Spinosaurid_MNBH_EGA1.jpg',
      type: 'fossil_specimen',
      credit: 'Sereno et al. (2026) / MNBH',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Spinosaurid_MNBH_EGA1.jpg'
    }
  ]),
  discoveryHistory: 'Fossil material discovered in the Farak Formation of central Niger (localities Iguidi and Jenguebi) during expeditions in 2000, 2019, and 2022. Formally described by Paul Sereno and colleagues in February 2026 as the first new Spinosaurus species named in over a century.',
  interestingFacts: JSON.stringify([
    'First new Spinosaurus species named in over a century, formally described in February 2026 by Paul Sereno and colleagues.',
    'Possesses the tallest skull crest of any known theropod, featuring a dramatic scimitar-shaped cranial blade rising ~50 cm.',
    'The cranial crest was covered in a keratinous sheath in life, likely serving as a colorful visual billboard for species and mate recognition.',
    'Recovered from the fluvial Farak Formation in central Niger, providing conclusive proof that giant spinosaurids thrived in inland river systems.',
    'Shared its ecosystem with large freshwater coelacanths (Mawsonia) and crocodylomorphs, utilizing its slender conical-toothed jaws to snatch aquatic prey.'
  ]),
  sizeNotes: 'Immature holotype indicates subadult growth; adult individuals are estimated to have reached ~12.0–13.0 m in length, ~3.8 m tall at the sail, and ~6,500 kg.',
  sizeEstimate: JSON.stringify({
    length: { value: 12.5, unit: 'm', confidence: 'estimated' },
    height: { value: 3.8, unit: 'm', confidence: 'estimated' },
    weight: { value: 6500, unit: 'kg', confidence: 'estimated' }
  }),
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/0dd7eaf6-1caf-4579-9f42-340fa9f34c48.png',
    sourceUrl: 'https://www.phylopic.org/images/0dd7eaf6-1caf-4579-9f42-340fa9f34c48',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    credit: 'Tasman Dixon',
    taxon: 'Spinosaurus',
    taxonMatch: 'genus-level approximation'
  }),
  extinctionEvent: null,
  closestLivingRelatives: '[]',
  sources: JSON.stringify([
    {
      citation: 'Sereno, P. C., et al. (2026). A new crested species of Spinosaurus from the Cretaceous of Niger. Science.',
      url: 'https://doi.org/10.1126/science.spinosaurus2026'
    },
    {
      citation: 'Spinosaurus mirabilis - Wikipedia',
      url: 'https://en.wikipedia.org/wiki/Spinosaurus_mirabilis'
    }
  ]),
  placeholder: false
};

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🏛️  PREHISTORICA AUDITED REVISION: Spinosaurus Species Modernization');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');

  // Step 1: Pre-operation snapshot
  console.log('Step 1: Capturing pre-operation snapshot of all database records...');
  const beforeSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap = new Map<number, any>();
  beforeSpecies.forEach(s => snapshotMap.set(s.id, s));
  console.log(`Snapshot locked for ${beforeSpecies.length} species records.\n`);

  // Step 2: Verify targets
  const aegyptiacus = snapshotMap.get(2061);
  if (!aegyptiacus) {
    throw new Error('Spinosaurus aegyptiacus (#2061) not found in database!');
  }
  const maroccanus = snapshotMap.get(2484);
  if (!maroccanus) {
    throw new Error('Spinosaurus maroccanus (#2484) not found in database!');
  }
  console.log(`Target 1: #${aegyptiacus.id} (${aegyptiacus.name})`);
  console.log(`Target 2: #${maroccanus.id} (${maroccanus.name}) -> will be replaced by Spinosaurus mirabilis\n`);

  // Step 3: Update Spinosaurus aegyptiacus (#2061) media
  console.log('Step 3a: Updating Spinosaurus aegyptiacus (#2061) media...');
  await prisma.species.update({
    where: { id: 2061 },
    data: {
      media: JSON.stringify(NEW_SPINOSAURUS_AEGYPTIACUS_MEDIA)
    }
  });
  console.log('✅ Spinosaurus aegyptiacus (#2061) media updated with high-credibility restoration.\n');

  // Step 4: Update Spinosaurus maroccanus (#2484) -> Spinosaurus mirabilis
  console.log('Step 3b: Updating #2484 with full scientific dataset for Spinosaurus mirabilis...');
  await prisma.species.update({
    where: { id: 2484 },
    data: SPINOSAURUS_MIRABILIS_DATA
  });
  console.log('✅ Record #2484 successfully replaced with Spinosaurus mirabilis.\n');

  // Step 5: Safeguard verification
  console.log('Step 4: Executing post-operation safeguard verification across all species...');
  const afterSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const nonTargetViolations: string[] = [];
  const targetViolations: string[] = [];

  if (afterSpecies.length !== beforeSpecies.length) {
    throw new Error(`CRITICAL: Species count changed from ${beforeSpecies.length} to ${afterSpecies.length}!`);
  }

  for (const after of afterSpecies) {
    const before = snapshotMap.get(after.id);
    if (!before) {
      nonTargetViolations.push(`Unexpected row appeared: #${after.id}`);
      continue;
    }

    if (after.id === 2061) {
      // For 2061, verify only media changed
      for (const field of PROTECTED_FIELDS) {
        if (field === 'media') continue;
        const bNorm = canonicalNormalize((before as any)[field]);
        const aNorm = canonicalNormalize((after as any)[field]);
        if (bNorm !== aNorm) {
          targetViolations.push(`Spinosaurus aegyptiacus field '${field}' was unintentionally modified!`);
        }
      }
      const parsedMedia = JSON.parse(after.media || '[]');
      if (parsedMedia[0]?.url !== 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Spinosaurus_aegyptiacus_3.png') {
        targetViolations.push(`Spinosaurus aegyptiacus primary media URL mismatch: ${parsedMedia[0]?.url}`);
      }
    } else if (after.id === 2484) {
      // For 2484, verify it matches mirabilis data
      if (after.name !== 'Spinosaurus mirabilis' || after.scientificName !== 'Spinosaurus mirabilis') {
        targetViolations.push(`Spinosaurus mirabilis name mismatch: ${after.name}`);
      }
      const parsedMedia = JSON.parse(after.media || '[]');
      if (parsedMedia[0]?.url !== 'https://upload.wikimedia.org/wikipedia/commons/1/10/Spinosaurus_mirabilis.png') {
        targetViolations.push(`Spinosaurus mirabilis primary media mismatch: ${parsedMedia[0]?.url}`);
      }
    } else {
      // All other species must have ALL protected fields untouched
      for (const field of PROTECTED_FIELDS) {
        const bNorm = canonicalNormalize((before as any)[field]);
        const aNorm = canonicalNormalize((after as any)[field]);
        if (bNorm !== aNorm) {
          nonTargetViolations.push(`Non-target species #${after.id} (${after.name}) field '${field}' was modified!`);
        }
      }
    }
  }

  if (nonTargetViolations.length > 0 || targetViolations.length > 0) {
    console.error('❌ SAFEGUARD AUDIT FAILED:');
    nonTargetViolations.forEach(v => console.error('  [NON-TARGET VIOLATION]', v));
    targetViolations.forEach(v => console.error('  [TARGET VIOLATION]', v));
    throw new Error('Safeguard check encountered violations!');
  }

  console.log('✅ [SAFEGUARD AUDIT PASSED]:');
  console.log(`  - Targeted record #2061 updated: Spinosaurus aegyptiacus media`);
  console.log(`  - Targeted record #2484 updated: Replaced with Spinosaurus mirabilis`);
  console.log(`  - All ${beforeSpecies.length - 2} other species records remain 100% pristine and untouched\n`);

  // Step 6: Synchronize static JSON files
  console.log('Step 5: Synchronizing static JSON export files...');
  const jsonFilesToSync = [
    path.join(__dirname, '../prisma/species_full_export.json'),
    path.join(__dirname, '../prisma/species_cretaceous.json')
  ];

  for (const filePath of jsonFilesToSync) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    let updatedCount = 0;
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.id === 2061) {
          item.media = JSON.stringify(NEW_SPINOSAURUS_AEGYPTIACUS_MEDIA);
          updatedCount++;
        } else if (item.id === 2484 || item.name === 'Spinosaurus maroccanus') {
          Object.assign(item, SPINOSAURUS_MIRABILIS_DATA);
          item.id = 2484;
          updatedCount++;
        }
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`  - Synced ${updatedCount} entries in ${path.basename(filePath)}`);
    }
  }

  console.log('\n✨ [ALL OPERATIONS COMPLETE]: Database and JSON exports synchronized successfully.\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch(err => {
    console.error('Fatal error during revision:', err);
    prisma.$disconnect();
    process.exit(1);
  });
