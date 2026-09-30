const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const STYXOSAURUS_DEF = {
  id: 5419,
  name: 'Styxosaurus',
  scientificName: 'Styxosaurus snowii',
  nameMeaning: 'Lizard from the River Styx of Snow',
  timePeriod: 'Late Cretaceous',
  epoch: 'Late Cretaceous (Campanian)',
  myaStart: 83.5,
  myaEnd: 80.5,
  diet: 'piscivore',
  dietDetails: 'Piscivorous predator feeding on schooling actinopterygian fish, squid-like belemnites, and ammonites within the Western Interior Seaway, captured using needle-like intermeshing teeth.',
  habitat: 'marine',
  clade: 'Marine_Reptile',
  taxonomicStatus: 'valid',
  geographicRange: JSON.stringify({
    continent: 'North America',
    region: 'Western Interior Seaway (Logan County, Kansas)',
    country: 'United States',
    fossilFormation: 'Niobrara Formation (Smoky Hill Chalk Member)'
  }),
  taxonomy: JSON.stringify({
    domain: 'Eukaryota',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Reptilia',
    order: 'Plesiosauria',
    suborder: 'Plesiosauroidea',
    family: 'Elasmosauridae',
    genus: 'Styxosaurus',
    species: 'Styxosaurus snowii',
    source: 'Paleobiology Database (PBDB) + Welles (1943)'
  }),
  sizeEstimate: JSON.stringify({
    length: { value: 11.0, unit: 'm', confidence: 'well-supported' },
    height: { value: 1.6, unit: 'm', confidence: 'estimated' },
    weight: { value: 3500, unit: 'kg', confidence: 'estimated' }
  }),
  sizeNotes: 'Large elasmosaurid measuring approximately 11.0 meters (36 ft) in total length, with an elongated neck of ~5.25 meters comprising 60–66 cervical vertebrae, and an estimated body mass of 3.5 to 4 metric tons.',
  sizeComparisonToHuman: true,
  comparisonSilhouette: JSON.stringify({
    url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/5719ee67-4bd3-44e9-ba19-2d36ec7e5b30.svg',
    sourceUrl: 'https://www.phylopic.org/images/5719ee67-4bd3-44e9-ba19-2d36ec7e5b30',
    license: 'Attribution 3.0 Unported',
    credit: 'T. Michael Keesey',
    taxon: 'Elasmosauridae (Elasmosaurus platyurus silhouette)',
    taxonMatch: 'generic approximation, not species-specific'
  }),
  media: JSON.stringify([
    {
      url: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Styxosaurus_still_frame.png',
      type: 'art',
      credit: 'Johnson Mortimer (CC BY 3.0)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Styxosaurus_still_frame.png'
    }
  ]),
  discoveryHistory: 'Discovered in 1890 in Logan County, Kansas, by collector E. P. West in the Smoky Hill Chalk Member of the Niobrara Chalk Formation. The holotype specimen (KUVP 1301) was initially named Cimoliasaurus snowii by Samuel Wendell Williston in honor of Chancellor Francis H. Snow of the University of Kansas. In 1943, Samuel Paul Welles erected the distinct genus Styxosaurus, named after the mythical river Styx in Greek underworld lore.',
  interestingFacts: JSON.stringify([
    'Styxosaurus possessed an astonishingly long neck consisting of over 60 cervical vertebrae, accounting for roughly half of its entire 11-meter body length.',
    'Over 200 polished quartz and quartzite gastroliths (stomach stones) were recovered directly from the abdominal cavity of holotype specimen KUVP 1301, used for digestive mechanical processing and hydrostatic ballast control.',
    'Its slender jaws featured long, slender, sharp teeth that interlocked when the mouth closed, creating an inescapable prey trap designed to snare slippery teleost fish and soft-bodied cephalopods.',
    'Like other elasmosaurids, Styxosaurus swam via subaqueous flight using four large wing-like flippers powered by massive pectoral and pelvic musculature.',
    'Inhabited the warm, shallow waters of the Western Interior Seaway, an ancient inland sea that split North America into Laramidia and Appalachia during the Late Cretaceous.'
  ]),
  extinctionEvent: 'K-Pg extinction event (66 MYA)',
  closestLivingRelatives: JSON.stringify({
    status: 'debated',
    groups: [
      'Modern Diapsid Reptiles (Archosauria: Birds & Crocodilians; Lepidosauria: Lizards, Snakes, Tuatara)',
      'Turtles (Testudines - debated sister hypothesis)'
    ],
    rationale: 'Sauropterygians (plesiosaurs, pliosaurs, nothosaurs, and placodonts) are specialized extinct marine diapsid reptiles with no surviving crown descendants. In modern phylogenetics, they are positioned as stem-diapsids sister either to Lepidosauromorpha or Archosauromorpha.',
    ecologicalAnalogues: [
      'Sea Lions & Fur Seals (Otariidae - four-flipper subaqueous flight)',
      'Penguins (Spheniscidae - flipper-driven aquatic propulsion)'
    ],
    sources: [
      {
        title: 'Neenan, J. M., Klein, N., & Scheyer, T. M. (2013). European origin of atypical sauropterygians. Nature Communications, 4, 2421.',
        url_or_doi: 'https://doi.org/10.1038/ncomms3421'
      },
      {
        title: 'Ketchum, H. F., & Benson, R. B. (2010). Global interrelationships of Plesiosauria (Reptilia, Sauropterygia) and the pivotal role of taxon sampling in determining the lineage of plesiosaurs. Biological Reviews, 85(2), 361-392.',
        url_or_doi: 'https://doi.org/10.1111/j.1469-185X.2009.00107.x'
      }
    ],
    verified: true
  }),
  sources: JSON.stringify([
    {
      citation: 'Welles, S. P. (1943). Elasmosaurid plesiosaurs with description of new material from California and Colorado. Memoirs of the University of California, 13(3), 125-254.',
      url: 'https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=36511'
    },
    {
      citation: 'Williston, S. W. (1890). Structure of the plesiosaurian skull. Science, 16(407), 290.',
      url: 'https://doi.org/10.1126/science.ns-16.407.290'
    }
  ]),
  placeholder: false
};

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════');
  console.log('AUDITED MIGRATION: INGEST STYXOSAURUS SNOWII (#5419)');
  console.log('════════════════════════════════════════════════════════════════════════════\n');

  // STEP 1: Pre-migration database snapshot & invariant baseline check
  console.log('Step 1: Capturing pre-migration database snapshot...');
  const allBefore = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  console.log(`  ✓ Database baseline: ${allBefore.length} species.`);

  if (allBefore.length !== 788) {
    throw new Error(`Expected exactly 788 species before migration, found ${allBefore.length}!`);
  }

  const existingStyx = allBefore.find(s => s.name.toLowerCase() === 'styxosaurus' || s.scientificName.toLowerCase() === 'styxosaurus snowii');
  if (existingStyx) {
    throw new Error(`Styxosaurus already exists in database with ID ${existingStyx.id}!`);
  }

  const snapshotDir = path.join(__dirname, '..', 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const preSnapshotPath = path.join(snapshotDir, `pre_styxosaurus_${timestamp}.json`);
  fs.writeFileSync(preSnapshotPath, JSON.stringify(allBefore, null, 2), 'utf8');
  console.log(`  ✓ Pre-migration snapshot saved: ${preSnapshotPath}\n`);

  // STEP 2: Insert Styxosaurus (Insert-Only Policy)
  console.log('Step 2: Inserting Styxosaurus (ID 5419) via Insert-Only Policy...');
  const created = await prisma.species.create({
    data: STYXOSAURUS_DEF
  });
  console.log(`  ✓ Inserted ID ${created.id}: ${created.name} (${created.scientificName})`);

  // Update autoincrement sequence to max id
  try {
    await prisma.$executeRawUnsafe("SELECT setval(pg_get_serial_sequence('\"Species\"', 'id'), (SELECT MAX(id) FROM \"Species\"));");
    console.log('  ✓ PostgreSQL autoincrement sequence synced to MAX(id).');
  } catch (seqErr) {
    console.warn(`  ! Sequence sync note: ${seqErr.message}`);
  }

  // STEP 3: Post-migration database snapshot & invariant validation
  console.log('\nStep 3: Capturing post-migration database snapshot & running invariant validation...');
  const allAfter = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const postSnapshotPath = path.join(snapshotDir, `post_styxosaurus_${timestamp}.json`);
  fs.writeFileSync(postSnapshotPath, JSON.stringify(allAfter, null, 2), 'utf8');
  console.log(`  ✓ Post-migration snapshot saved: ${postSnapshotPath}`);

  if (allAfter.length !== 789) {
    throw new Error(`Expected exactly 789 species after insertion, found ${allAfter.length}!`);
  }

  const styxInDb = allAfter.find(s => s.id === 5419);
  if (!styxInDb || styxInDb.name !== 'Styxosaurus') {
    throw new Error('Styxosaurus missing or corrupted in post-migration state!');
  }

  let nonTargetUntouched = 0;
  const unexpectedDiffs = [];

  for (const before of allBefore) {
    const after = allAfter.find(s => s.id === before.id);
    if (!after) {
      unexpectedDiffs.push(`Species ID ${before.id} was deleted!`);
      continue;
    }

    const diffs = [];
    for (const key of Object.keys(before)) {
      if (key === 'updatedAt') continue;
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        diffs.push(key);
      }
    }
    if (diffs.length > 0) {
      unexpectedDiffs.push(`NON-TARGET ID ${before.id} (${before.name}) was modified! Fields: ${diffs.join(', ')}`);
    } else {
      nonTargetUntouched++;
    }
  }

  console.log(`\nVerification Summary:`);
  console.log(`  - New species inserted: 1 (ID 5419: Styxosaurus)`);
  console.log(`  - Non-target records bit-for-bit identical: ${nonTargetUntouched} / 788 (100.0%)`);

  if (unexpectedDiffs.length > 0) {
    console.error('\n❌ CRITICAL: Regressions detected:');
    unexpectedDiffs.forEach(d => console.error('    ✕ ' + d));
    throw new Error('Anti-regression safeguard invariant violated! Aborting.');
  }
  console.log('  ✅ 100% SAFEGUARD VERIFIED: Zero regressions detected across all non-target records.\n');

  // STEP 4: Synchronize Static JSON Archives
  console.log('Step 4: Synchronizing static JSON archives in backend/prisma/...');
  const prismaDir = path.join(__dirname, '..', 'prisma');

  // 1. species_full_export.json
  const fullExportPath = path.join(prismaDir, 'species_full_export.json');
  const fullExport = JSON.parse(fs.readFileSync(fullExportPath, 'utf8'));
  fullExport.push(styxInDb);
  // Sort full export by ID asc
  fullExport.sort((a, b) => a.id - b.id);
  fs.writeFileSync(fullExportPath, JSON.stringify(fullExport, null, 2), 'utf8');
  console.log(`  ✓ Updated species_full_export.json (${fullExport.length} total records)`);

  // 2. species_cretaceous.json
  const crePath = path.join(prismaDir, 'species_cretaceous.json');
  const creJson = JSON.parse(fs.readFileSync(crePath, 'utf8'));
  creJson.push(styxInDb);
  creJson.sort((a, b) => a.id - b.id);
  fs.writeFileSync(crePath, JSON.stringify(creJson, null, 2), 'utf8');
  console.log(`  ✓ Updated species_cretaceous.json (${creJson.length} total records)`);

  console.log('\n════════════════════════════════════════════════════════════════════════════');
  console.log('✅ ALL STYXOSAURUS INGESTION OPERATIONS COMPLETED WITH 100% INVARIANT VERIFICATION!');
  console.log('════════════════════════════════════════════════════════════════════════════\n');
}

main()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
