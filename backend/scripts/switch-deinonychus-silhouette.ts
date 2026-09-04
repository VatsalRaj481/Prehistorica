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
  console.log('=== Switching Deinonychus Silhouette to Manabu Sakamoto (CC BY 3.0) ===\n');

  // Step 1: Pre-operation snapshot
  console.log('Step 1: Capturing pre-operation snapshot of all 502 records...');
  const allSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  const snapshotMap: Record<number, { media: string; paleoartUrl: string; fossilUrl: string; sources: string; silhouette: string }> = {};
  allSpecies.forEach(s => {
    snapshotMap[s.id] = {
      media: s.media || '',
      paleoartUrl: s.reconstructionImageUrl || '',
      fossilUrl: s.fossilImageUrl || '',
      sources: s.sources || '',
      silhouette: s.comparisonSilhouette || ''
    };
  });
  console.log(`Snapshot locked for ${allSpecies.length} species.\n`);

  // Step 2: Download Manabu Sakamoto's Deinonychus vector SVG (8615a4b7-52fc-4aaf-89fc-1dac69bc9f7a)
  console.log('Step 2: Downloading Manabu Sakamoto Deinonychus vector SVG (8615a4b7)...');
  const svgUrl = 'https://images.phylopic.org/images/8615a4b7-52fc-4aaf-89fc-1dac69bc9f7a/vector.svg';
  const svgRes = await fetch(svgUrl);
  if (!svgRes.ok) throw new Error(`Failed to download vector SVG from PhyloPic: ${svgRes.status}`);
  const svgBuffer = Buffer.from(await svgRes.text(), 'utf8');

  // Upload new silhouette
  const newFileName = '8615a4b7-52fc-4aaf-89fc-1dac69bc9f7a.svg';
  const selfHostedUrl = await uploadFileToSupabase(newFileName, svgBuffer, 'image/svg+xml');
  console.log('Uploaded Manabu Sakamoto Deinonychus to Supabase:', selfHostedUrl);

  // Delete previous unused silhouette from bucket
  console.log('\nStep 3: Removing previous Deinonychus silhouette from bucket...');
  await deleteFileFromSupabase('8cc46088-75b0-40c7-ae8e-8c986277a5f8.svg');

  // Step 4: Update Deinonychus record in database
  console.log('\nStep 4: Updating Deinonychus database record...');
  const deinonychus = allSpecies.find(s => s.id === 449 || s.name.toLowerCase() === 'deinonychus');
  if (!deinonychus) throw new Error('Could not find Deinonychus in database!');

  const updatedSilhouettePayload = {
    url: selfHostedUrl,
    sourceUrl: 'https://www.phylopic.org/images/8615a4b7-52fc-4aaf-89fc-1dac69bc9f7a/deinonychus-antirrhopus',
    license: 'Attribution 3.0 Unported (CC BY 3.0)',
    credit: 'Manabu Sakamoto',
    taxon: 'Deinonychus antirrhopus',
    taxonMatch: 'species-specific'
  };

  await prisma.species.update({
    where: { id: deinonychus.id },
    data: {
      comparisonSilhouette: JSON.stringify(updatedSilhouettePayload)
    }
  });
  console.log(`Updated Deinonychus (ID ${deinonychus.id}) comparisonSilhouette:`, updatedSilhouettePayload);

  // Step 5: Post-operation Integrity Verification
  console.log('\nStep 5: Verifying zero modifications to paleoart, media, or other species...');
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
    if (s.id !== deinonychus.id && (s.comparisonSilhouette || '') !== snap.silhouette) {
      console.error(`[SILHOUETTE VIOLATION] Non-target species ${s.id} (${s.name}) comparisonSilhouette was modified!`);
      violations++;
    }
  }

  if (violations > 0) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: ${violations} violations detected!`);
  }

  console.log('✅ [INTEGRITY CHECK PASSED]: 100% of all 502 species paleoart, media, and other records are identical and untouched!\n');
}

main().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error during switch:', err);
  process.exit(1);
});
