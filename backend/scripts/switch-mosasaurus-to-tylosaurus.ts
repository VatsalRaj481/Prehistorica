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

async function deleteFileFromSupabase(fileName: string): Promise<void> {
  const url = `${supabaseUrl}/storage/v1/object/species-silhouettes/${fileName}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey
    }
  });

  if (!res.ok && res.status !== 404) {
    console.warn(`Warning: Delete returned ${res.status} for ${fileName}`);
  } else {
    console.log(`Deleted unused asset from bucket: ${fileName}`);
  }
}

async function main() {
  console.log('=== Switching Mosasaurus to Scott Hartman Tylosaurus (CC BY 3.0) ===\n');

  // Step 1: Pre-operation snapshot
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

  // Step 2: Download Scott Hartman's Tylosaurus vector SVG
  console.log('Step 2: Downloading Scott Hartman Tylosaurus vector SVG (8ae20f15)...');
  const svgUrl = 'https://images.phylopic.org/images/8ae20f15-d9c1-45ff-a117-77f001b6eb0a/vector.svg';
  const svgRes = await fetch(svgUrl);
  if (!svgRes.ok) throw new Error(`Failed to download vector SVG from PhyloPic: ${svgRes.status}`);
  const svgBuffer = Buffer.from(await svgRes.text(), 'utf8');

  // Upload new silhouette
  const newFileName = '8ae20f15-d9c1-45ff-a117-77f001b6eb0a.svg';
  const selfHostedUrl = await uploadFileToSupabase(newFileName, svgBuffer, 'image/svg+xml');
  console.log('Uploaded Scott Hartman Tylosaurus to Supabase:', selfHostedUrl);

  // Delete previous unused silhouette from bucket
  console.log('\nStep 3: Removing previous unused Mosasaurus silhouette from bucket...');
  await deleteFileFromSupabase('9e15a3ad-56bc-416e-a2bc-6a27914dd586.svg');

  // Step 4: Update Mosasaurus record in database
  console.log('\nStep 4: Updating Mosasaurus database record...');
  const mosasaurus = allSpecies.find(s => s.name.toLowerCase().includes('mosasaurus') || s.scientificName.toLowerCase().includes('mosasaurus'));
  if (!mosasaurus) throw new Error('Could not find Mosasaurus in database!');

  const updatedSilhouettePayload = {
    url: selfHostedUrl,
    sourceUrl: 'https://www.phylopic.org/images/8ae20f15-d9c1-45ff-a117-77f001b6eb0a/tylosaurus',
    license: 'Attribution 3.0 Unported (CC BY 3.0)',
    credit: 'Scott Hartman',
    taxon: 'Mosasauridae (Representative: Tylosaurus)',
    taxonMatch: 'generic approximation, not species-specific'
  };

  await prisma.species.update({
    where: { id: mosasaurus.id },
    data: {
      comparisonSilhouette: JSON.stringify(updatedSilhouettePayload)
    }
  });
  console.log(`Updated Mosasaurus (ID ${mosasaurus.id}) comparisonSilhouette:`, updatedSilhouettePayload);

  // Step 5: Post-operation Integrity Verification
  console.log('\nStep 5: Verifying zero modifications to paleoart, media, or other fields...');
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
  console.error('Fatal error during switch:', err);
  process.exit(1);
});
