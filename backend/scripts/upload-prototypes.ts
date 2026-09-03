import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

async function uploadFileToSupabase(fileName: string, buffer: Buffer, contentType: string): Promise<string> {
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

async function processPrototypes() {
  const targets = [
    {
      speciesId: 458, // Baryonyx
      expectedName: 'Baryonyx',
      uuid: '7c6775fb-5df6-431c-9fcb-4e58a833bc29',
      pageUrl: 'https://www.phylopic.org/images/7c6775fb-5df6-431c-9fcb-4e58a833bc29/baryonyx-walkeri',
      svgUrl: 'https://images.phylopic.org/images/7c6775fb-5df6-431c-9fcb-4e58a833bc29/source.svg',
      taxon: 'Baryonyx walkeri',
      license: 'Attribution 3.0 Unported',
      credit: 'Gareth Monger',
      taxonMatch: 'species-specific'
    },
    {
      speciesId: 467, // Pachyrhinosaurus
      expectedName: 'Pachyrhinosaurus',
      uuid: 'da8f7c54-89aa-4c97-87eb-e6ea778ebd6e',
      pageUrl: 'https://www.phylopic.org/images/da8f7c54-89aa-4c97-87eb-e6ea778ebd6e/pachyrhinosaurus',
      svgUrl: 'https://images.phylopic.org/images/da8f7c54-89aa-4c97-87eb-e6ea778ebd6e/source.svg',
      taxon: 'Pachyrhinosaurus',
      license: 'CC0 1.0 Universal Public Domain Dedication',
      credit: 'Amy Beauvois',
      taxonMatch: 'generic approximation, not species-specific'
    }
  ];

  for (const t of targets) {
    console.log(`Processing prototype: ${t.expectedName} (ID: ${t.speciesId})...`);
    // 1. Download SVG from PhyloPic
    const svgRes = await fetch(t.svgUrl, { headers: { 'User-Agent': 'Prehistorica/1.0' } });
    if (!svgRes.ok) throw new Error(`Failed to download SVG from ${t.svgUrl}`);
    const svgText = await svgRes.text();
    const svgBuffer = Buffer.from(svgText, 'utf8');

    // 2. Upload to species-silhouettes
    const fileName = `${t.uuid}.svg`;
    const publicUrl = await uploadFileToSupabase(fileName, svgBuffer, 'image/svg+xml');
    console.log(`  Uploaded to Supabase: ${publicUrl}`);

    // 3. Update comparisonSilhouette field in DB ONLY (touching no other field)
    const silData = {
      url: publicUrl,
      sourceUrl: t.pageUrl,
      license: t.license,
      credit: t.credit,
      taxon: t.taxon,
      taxonMatch: t.taxonMatch
    };

    await prisma.species.update({
      where: { id: t.speciesId },
      data: {
        comparisonSilhouette: JSON.stringify(silData)
      }
    });

    console.log(`  Updated comparisonSilhouette for species ID ${t.speciesId}`);
  }

  console.log('Prototypes processed successfully!');
}

processPrototypes().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
