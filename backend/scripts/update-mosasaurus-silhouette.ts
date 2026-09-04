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

async function main() {
  console.log('=== Updating Mosasaurus hoffmannii Silhouette Under Strict Safeguard ===\n');

  // Step 1: Pre-operation snapshot of all 502 records
  console.log('Step 1: Capturing pre-operation snapshot of all 502 records...');
  const allSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap: Record<number, { media: string; paleoartUrl: string; fossilUrl: string; sources: string }> = {};
  allSpecies.forEach(s => {
    snapshotMap[s.id] = {
      media: s.media || '',
      paleoartUrl: s.reconstructionImageUrl || '',
      fossilUrl: s.fossilImageUrl || '',
      sources: s.sources || ''
    };
  });
  console.log(`Snapshot locked for ${allSpecies.length} species.\n`);

  // Step 2: Download and upload Mosasaurus vector SVG (9e15a3ad-56bc-416e-a2bc-6a27914dd586)
  console.log('Step 2: Downloading and self-hosting Mosasaurus hoffmannii vector SVG...');
  const svgUrl = 'https://images.phylopic.org/images/9e15a3ad-56bc-416e-a2bc-6a27914dd586/vector.svg';
  const svgRes = await fetch(svgUrl);
  if (!svgRes.ok) throw new Error(`Failed to download vector SVG from PhyloPic: ${svgRes.status}`);
  const svgBuffer = Buffer.from(await svgRes.text(), 'utf8');

  const selfHostedUrl = await uploadFileToSupabase('9e15a3ad-56bc-416e-a2bc-6a27914dd586.svg', svgBuffer, 'image/svg+xml');
  console.log('Uploaded to Supabase:', selfHostedUrl);

  // Step 3: Update ONLY comparisonSilhouette for Mosasaurus hoffmannii
  console.log('\nStep 3: Updating database record for Mosasaurus hoffmannii...');
  const mosasaurus = allSpecies.find(s => s.name.toLowerCase().includes('mosasaurus') || s.scientificName.toLowerCase().includes('mosasaurus'));
  if (!mosasaurus) throw new Error('Could not locate Mosasaurus in database!');

  const newSilhouetteData = {
    url: selfHostedUrl,
    sourceUrl: 'https://www.phylopic.org/images/9e15a3ad-56bc-416e-a2bc-6a27914dd586/mosasaurus-hoffmannii',
    license: 'Attribution-NonCommercial 3.0 Unported (CC BY-NC 3.0)',
    credit: 'T. K. Robinson',
    taxon: 'Mosasaurus hoffmannii',
    taxonMatch: 'species-specific'
  };

  await prisma.species.update({
    where: { id: mosasaurus.id },
    data: {
      comparisonSilhouette: JSON.stringify(newSilhouetteData)
    }
  });
  console.log(`Updated Mosasaurus (ID ${mosasaurus.id}) comparisonSilhouette:`, newSilhouetteData);

  // Step 4: Post-operation Integrity Verification
  console.log('\nStep 4: Verifying zero modifications to paleoart, media, or other fields...');
  const postSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  let violations = 0;
  for (const s of postSpecies) {
    const snap = snapshotMap[s.id];
    if ((s.media || '') !== snap.media) {
      console.error(`[MEDIA VIOLATION] Species ${s.id} (${s.name}) media array modified!`);
      violations++;
    }
    if ((s.reconstructionImageUrl || '') !== snap.paleoartUrl) {
      console.error(`[PALEOART VIOLATION] Species ${s.id} (${s.name}) reconstructionImageUrl modified!`);
      violations++;
    }
    if ((s.fossilImageUrl || '') !== snap.fossilUrl) {
      console.error(`[FOSSIL VIOLATION] Species ${s.id} (${s.name}) fossilImageUrl modified!`);
      violations++;
    }
    if ((s.sources || '') !== snap.sources) {
      console.error(`[SOURCES VIOLATION] Species ${s.id} (${s.name}) sources modified!`);
      violations++;
    }
  }

  if (violations > 0) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: ${violations} paleoart/media violations detected!`);
  }

  console.log('✅ [INTEGRITY CHECK PASSED]: 100% of all 502 species paleoart, media, and sources are identical and untouched!\n');
}

main().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error updating Mosasaurus silhouette:', err);
  process.exit(1);
});
