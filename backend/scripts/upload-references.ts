import './../src/dns-init.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

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

async function uploadReferenceSilhouettes() {
  console.log('Uploading clean PhyloPic reference figures to species-silhouettes bucket...');

  // 1. Human (Homo sapiens sapiens by Guillaume Dera, CC0 1.0)
  const humanSvgUrl = 'https://images.phylopic.org/images/b8c16fc6-d16b-4fac-8a04-67182448157e/source.svg';
  const humanRes = await fetch(humanSvgUrl);
  const humanBuf = Buffer.from(await humanRes.text(), 'utf8');
  const humanPublicUrl = await uploadFileToSupabase('reference-human.svg', humanBuf, 'image/svg+xml');
  console.log('Uploaded Human reference silhouette:', humanPublicUrl);

  // 2. African Bush Elephant (Loxodonta africana by Guillaume Dera, CC0 1.0)
  const elephantSvgUrl = 'https://images.phylopic.org/images/51c89c19-6ef1-4d8e-8de6-2a4b6e8f66c8/source.svg';
  const elephantRes = await fetch(elephantSvgUrl);
  const elephantBuf = Buffer.from(await elephantRes.text(), 'utf8');
  const elephantPublicUrl = await uploadFileToSupabase('reference-african-bush-elephant.svg', elephantBuf, 'image/svg+xml');
  console.log('Uploaded African Bush Elephant reference silhouette:', elephantPublicUrl);

  console.log('Reference figures self-hosted successfully!');
}

uploadReferenceSilhouettes().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
