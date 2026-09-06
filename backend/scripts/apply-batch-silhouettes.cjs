const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const SILHOUETTE_ENTRIES = [
  {
    id: 5129,
    scientificName: 'Alioramus remotus',
    uuid: '499fe1d6-a3c5-4219-a60e-d5ae93031bda',
    taxon: 'Alioramus remotus',
    credit: 'Will Toosey',
    license: 'Attribution 4.0 International (CC BY 4.0)',
    taxonMatch: 'species-specific'
  },
  {
    id: 5130,
    scientificName: 'Saurornitholestes langstoni',
    uuid: '74c2f75c-2379-4a64-9694-a160ed21e61f',
    taxon: 'Saurornitholestes langstoni',
    credit: 'Scott Hartman',
    license: 'Attribution 3.0 Unported (CC BY 3.0)',
    taxonMatch: 'species-specific'
  },
  {
    id: 5131,
    scientificName: 'Deinocheirus mirificus',
    uuid: 'f73a57a3-2489-44fe-9b26-d213d20ed8d0',
    taxon: 'Deinocheirus mirificus',
    credit: 'Julio Garza',
    license: 'Attribution 3.0 Unported (CC BY 3.0)',
    taxonMatch: 'species-specific'
  },
  {
    id: 5132,
    scientificName: 'Erlikosaurus andrewsi',
    uuid: 'de0e3d2d-5f09-421b-b611-94012f435c28',
    taxon: 'Erlikosaurus andrewsi',
    credit: 'Walter Vladimir',
    license: 'Attribution 3.0 Unported (CC BY 3.0)',
    taxonMatch: 'species-specific'
  },
  {
    id: 5133,
    scientificName: 'Mastodonsaurus giganteus',
    uuid: '62aaaa50-5ebc-40b4-8cc7-358e708bc3e6',
    taxon: 'Paracyclotosaurus davidi',
    credit: 'Dmitry Bogdanov (vectorized by T. Michael Keesey)',
    license: 'Attribution 3.0 Unported (CC BY 3.0)',
    taxonMatch: 'generic approximation, not species-specific'
  },
  {
    id: 5134,
    scientificName: 'Palaeoloxodon namadicus',
    uuid: '906f0313-e292-4046-aab3-d671bb37b9dc',
    taxon: 'Palaeoloxodon falconeri',
    credit: 'Asier Larramendi',
    license: 'Attribution 4.0 International (CC BY 4.0)',
    taxonMatch: 'generic approximation, not species-specific'
  },
  {
    id: 5135,
    scientificName: 'Tyrannotitan chubutensis',
    uuid: '1f4746d0-42ed-4f85-a31f-447ca434caf5',
    taxon: 'Tyrannotitan chubutensis',
    credit: 'SauropodomorphMonarch',
    license: 'Attribution 3.0 Unported (CC BY 3.0)',
    taxonMatch: 'species-specific'
  },
  {
    id: 5136,
    scientificName: 'Thalassodromeus sethi',
    uuid: '63ddffa8-a14d-46ca-a38f-548d3254df43',
    taxon: 'Thalassodromeus sethi',
    credit: 'Dean Schnabel',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    taxonMatch: 'species-specific'
  },
  {
    id: 5137,
    scientificName: 'Infernodrakon hastacaelestis',
    uuid: '6dd3a0b6-8c58-4205-9f10-45b6686c4cd0',
    taxon: 'Azhdarcho lancicollis',
    credit: 'jack liddle',
    license: 'Attribution 4.0 International (CC BY 4.0)',
    taxonMatch: 'generic approximation, not species-specific'
  },
  {
    id: 5138,
    scientificName: 'Zhuchengtyrannus magnus',
    uuid: 'f05e56c4-83bc-4809-8c2e-fd30c0b0bba2',
    taxon: 'Tyrannosaurus magnus',
    credit: 'Conty (vectorized by T. Michael Keesey)',
    license: 'Attribution 3.0 Unported (CC BY 3.0)',
    taxonMatch: 'species-specific'
  },
  {
    id: 5139,
    scientificName: 'Quinkana fortirostrum',
    uuid: '46f7244a-386a-438b-8084-13ceccc85d4b',
    taxon: 'Quinkana fortirostrum',
    credit: 'Armin Reindl',
    license: 'Attribution 4.0 International (CC BY 4.0)',
    taxonMatch: 'species-specific'
  },
  {
    id: 5140,
    scientificName: 'Hieraaetus moorei',
    uuid: 'ca85a325-a3e4-4d65-ba6f-77be07f3fd4b',
    taxon: 'Hieraaetus pennatus',
    credit: 'Rohit N',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    taxonMatch: 'generic approximation, not species-specific'
  },
  {
    id: 5141,
    scientificName: 'Zhejiangopterus linhaiensis',
    uuid: '8dd2d5c1-1f99-4e0e-997f-81bc4f48336b',
    taxon: 'Zhejiangopterus linhaiensis',
    credit: 'jack liddle',
    license: 'Attribution 4.0 International (CC BY 4.0)',
    taxonMatch: 'species-specific'
  },
  {
    id: 5142,
    scientificName: 'Glyptodon clavipes',
    uuid: '936735ed-c08a-4315-b291-1a19ca4e4ffd',
    taxon: 'Glyptodon',
    credit: 'Celeste Luna',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    taxonMatch: 'generic approximation, not species-specific'
  },
  {
    id: 5143,
    scientificName: 'Thanatotheristes degrootorum',
    uuid: '7cb7669d-ea90-4f05-94e3-76ab823eb726',
    taxon: 'Daspletosaurus degrootorum',
    credit: 'Cy Marchant',
    license: 'Attribution 4.0 International (CC BY 4.0)',
    taxonMatch: 'species-specific'
  },
  {
    id: 5144,
    scientificName: 'Gigantspinosaurus sichuanensis',
    uuid: '9b7363d3-572a-455d-a141-43b8adacc9fa',
    taxon: 'Gigantspinosaurus sichuanensis',
    credit: 'Alejandro Rojas',
    license: 'Attribution 4.0 International (CC BY 4.0)',
    taxonMatch: 'species-specific'
  },
  {
    id: 5145,
    scientificName: 'Gigantoraptor erlianensis',
    uuid: '6ba48f04-d4b7-4f97-a0d2-17fb2bf5473e',
    taxon: 'Gigantoraptor erlianensis',
    credit: 'Cy Marchant',
    license: 'Attribution 4.0 International (CC BY 4.0)',
    taxonMatch: 'species-specific'
  },
  {
    id: 5146,
    scientificName: 'Rinchenia mongoliensis',
    uuid: '101a8c21-5211-4f7f-b083-4f3373095a03',
    taxon: 'Oviraptor philoceratops',
    credit: 'Ivan Iofrida',
    license: 'Attribution 4.0 International (CC BY 4.0)',
    taxonMatch: 'generic approximation, not species-specific'
  },
  {
    id: 5147,
    scientificName: 'Coelurosauravus elivensis',
    uuid: '04de6188-2504-45c6-9cf0-a804845f8c18',
    taxon: 'Weigeltisaurus jaekeli',
    credit: 'Scott Reid',
    license: 'Attribution 3.0 Unported (CC BY 3.0)',
    taxonMatch: 'generic approximation, not species-specific'
  },
  {
    id: 5148,
    scientificName: 'Linhenykus monodactylus',
    uuid: 'a724b06d-541b-42ac-8cea-b84f985653c6',
    taxon: 'Alvarezsaurus calvoi',
    credit: 'Jaime Headden',
    license: 'Attribution 4.0 International (CC BY 4.0)',
    taxonMatch: 'generic approximation, not species-specific'
  },
  {
    id: 5149,
    scientificName: 'Stomatosuchus inermis',
    uuid: 'f7d45c6d-e506-4826-8ffe-3f75d588d378',
    taxon: 'Stomatosuchus inermis',
    credit: 'Stanton F. Fink, vectorized by Zimices',
    license: 'Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)',
    taxonMatch: 'species-specific'
  },
  {
    id: 5150,
    scientificName: 'Kariridraco dianae',
    uuid: 'f075aa92-c901-400d-89c2-c2a9087c51da',
    taxon: 'Europejara olcadesorum',
    credit: 'Cy Marchant',
    license: 'Attribution 4.0 International (CC BY 4.0)',
    taxonMatch: 'generic approximation, not species-specific'
  },
  {
    id: 5151,
    scientificName: 'Megabalaena kitamurae',
    uuid: 'a16c832f-cace-4c9e-af46-939cad395c3a',
    taxon: 'Megabalaena sapporoensis',
    credit: 'Cy Marchant',
    license: 'Attribution 4.0 International (CC BY 4.0)',
    taxonMatch: 'generic approximation, not species-specific'
  },
  {
    id: 5152,
    scientificName: 'Scylacosaurus sclateri',
    uuid: '6ecdac12-8832-401b-b6e2-8474dbc41b6a',
    taxon: 'Scylacosaurus',
    credit: 'Dmitry Bogdanov (vectorized by T. Michael Keesey)',
    license: 'Public Domain Mark 1.0',
    taxonMatch: 'generic approximation, not species-specific'
  },
  {
    id: 5153,
    scientificName: 'Apolithabatis aquila',
    uuid: 'ebdc09b9-659e-40e7-9323-1ac53d650aa3',
    taxon: 'Aetobatus',
    credit: 'M Kolmann',
    license: 'CC0 1.0 Universal Public Domain Dedication',
    taxonMatch: 'generic approximation, not species-specific'
  },
  {
    id: 5154,
    scientificName: 'Jormungandr walhallaensis',
    uuid: '098899e9-41ac-4dde-a1a8-69d6990d20ee',
    taxon: 'Jormungandr walhallaensis',
    credit: 'Cy Marchant',
    license: 'Attribution 4.0 International (CC BY 4.0)',
    taxonMatch: 'species-specific'
  },
  {
    id: 5155,
    scientificName: 'Plotosaurus bennisoni',
    uuid: '5d6d9f55-3d55-4f9b-ad95-e07bad213d1e',
    taxon: 'Halisaurus arambourgi',
    credit: 'Dmitry Bogdanov (original drawing)',
    license: 'Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)',
    taxonMatch: 'generic approximation, not species-specific'
  }
];

async function uploadToSupabase(fileName, buffer, contentType) {
  const url = `${supabaseUrl}/storage/v1/object/species-silhouettes/${fileName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      'Content-Type': contentType,
      'x-upsert': 'true'
    },
    body: buffer
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload failed for ${fileName} (${res.status}): ${errText}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/species-silhouettes/${fileName}`;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('INGESTING PHYLOPIC SILHOUETTES FOR 27 NEW SPECIES (5129..5155)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Step 1: Pre-operation safeguard snapshot of baseline species
  console.log('Step 1: Capturing safeguard snapshot of all baseline species (id < 5129)...');
  const baseline = await prisma.species.findMany({
    where: { id: { lt: 5129 } }
  });
  console.log(`Baseline locked: ${baseline.length} pre-existing species.\n`);

  // Step 2: Upload vector SVGs to Supabase Storage and update comparisonSilhouette in DB
  console.log('Step 2: Uploading SVGs to Supabase and updating records in database...');
  for (const item of SILHOUETTE_ENTRIES) {
    if (item.id < 5129) {
      throw new Error(`CRITICAL SECURITY FAILURE: Refusing to touch baseline id ${item.id}`);
    }

    const svgUrl = `https://images.phylopic.org/images/${item.uuid}/vector.svg`;
    console.log(`\n[#${item.id}] ${item.scientificName} (UUID: ${item.uuid})`);
    
    // Download SVG
    const svgRes = await fetch(svgUrl);
    if (!svgRes.ok) {
      throw new Error(`Failed to download SVG for ${item.scientificName} from ${svgUrl} (status ${svgRes.status})`);
    }
    const svgBuf = Buffer.from(await svgRes.arrayBuffer());

    // Upload to Supabase Storage
    const fileName = `${item.uuid}.svg`;
    const publicUrl = await uploadToSupabase(fileName, svgBuf, 'image/svg+xml');
    console.log(`  -> Uploaded to Supabase: ${publicUrl}`);

    // Build comparisonSilhouette JSON
    const silhouettePayload = JSON.stringify({
      url: publicUrl,
      sourceUrl: `https://www.phylopic.org/images/${item.uuid}`,
      license: item.license,
      credit: item.credit,
      taxon: item.taxon,
      taxonMatch: item.taxonMatch
    });

    // Update database row
    const updated = await prisma.species.update({
      where: { id: item.id },
      data: {
        comparisonSilhouette: silhouettePayload
      }
    });

    console.log(`  -> Database updated for #${updated.id} (${updated.name})`);
  }

  // Step 3: Verify post-operation baseline integrity
  console.log('\nStep 3: Verifying zero modification to baseline species (id < 5129)...');
  const postBaseline = await prisma.species.findMany({
    where: { id: { lt: 5129 } }
  });

  if (postBaseline.length !== baseline.length) {
    throw new Error(`Baseline count mismatch! Before: ${baseline.length}, After: ${postBaseline.length}`);
  }

  const baselineMap = new Map(baseline.map(b => [b.id, b]));
  let violations = 0;
  for (const post of postBaseline) {
    const pre = baselineMap.get(post.id);
    if (!pre) {
      console.error(`Missing baseline ID ${post.id}`);
      violations++;
      continue;
    }
    if (post.comparisonSilhouette !== pre.comparisonSilhouette) {
      console.error(`VIOLATION: comparisonSilhouette altered on baseline #${post.id} (${post.name})!`);
      violations++;
    }
    if (post.media !== pre.media) {
      console.error(`VIOLATION: media altered on baseline #${post.id} (${post.name})!`);
      violations++;
    }
  }

  if (violations > 0) {
    throw new Error(`CRITICAL SAFEGUARD FAILURE: ${violations} baseline records modified!`);
  }

  console.log('✅ Baseline verification passed: 0 modifications to pre-existing species.');
  console.log(`✅ All 27 new species updated with certified PhyloPic silhouettes!`);
}

main().finally(() => prisma.$disconnect());
