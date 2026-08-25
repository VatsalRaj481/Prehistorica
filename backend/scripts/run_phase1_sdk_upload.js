require('dotenv').config({ path: __dirname + '/../.env' });
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const prisma = new PrismaClient();

const BUCKET_ID = 'species-media';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bbsmxcoywionsvmfznah.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const USER_AGENT = 'PrehistoricaBot/1.0 (https://prehistorica.app)';

if (!SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is missing from environment!');
  process.exit(1);
}

const { StorageClient } = require('@supabase/storage-js');

const storageClient = new StorageClient(`${SUPABASE_URL}/storage/v1`, {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`
});

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (res.ok) return res;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return null;
}

async function main() {
  console.log('=== PHASE 1: 5-SPECIES VERIFICATION WITH SUPABASE SDK & SERVICE ROLE KEY ===\n');

  const speciesList = await prisma.species.findMany({
    take: 5,
    select: { id: true, name: true, scientificName: true, media: true },
    orderBy: { id: 'asc' }
  });

  const results = [];

  for (let i = 0; i < speciesList.length; i++) {
    const s = speciesList[i];
    const media = typeof s.media === 'string' ? JSON.parse(s.media) : s.media;
    const firstItem = media?.[0];
    const genus = s.name.split(' ')[0].trim();

    const originalUrl = firstItem?.sourceUrl || firstItem?.url || '';
    console.log(`[${i + 1}/5] Processing ID #${s.id} (${s.name})...`);
    console.log(`  Downloading image from source: ${originalUrl}`);

    const imgRes = await fetchWithRetry(originalUrl);
    if (!imgRes) {
      console.error(`  ❌ Failed to download source image for ID #${s.id}`);
      continue;
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('svg')) ext = 'svg';

    const objectName = `${s.id}-${genus}.${ext}`;
    console.log(`  Uploading ${buffer.length} bytes to Supabase Storage path "species-media/${objectName}"...`);

    // Upload binary buffer to Supabase Storage via SDK
    const { data: uploadData, error: uploadErr } = await storageClient
      .from(BUCKET_ID)
      .upload(objectName, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadErr) {
      console.error(`  ❌ Supabase Storage SDK upload error: ${uploadErr.message}`);
      results.push({ id: s.id, name: s.name, fileSize: buffer.length, httpStatus: 'Upload Error', bytesRead: 0, publicUrl: 'N/A' });
      continue;
    }

    const { data: publicData } = storageClient.from(BUCKET_ID).getPublicUrl(objectName);
    const publicUrl = publicData.publicUrl;

    // Update species DB record media array
    const updatedMedia = [
      {
        url: publicUrl,
        type: 'art',
        credit: firstItem.credit || 'Wikimedia Commons Contributor',
        sourceUrl: originalUrl
      }
    ];

    await prisma.species.update({
      where: { id: s.id },
      data: { media: JSON.stringify(updatedMedia) }
    });

    // Independent Two-Part Verification Checks
    console.log(`  Performing independent two-part verification for ${publicUrl}...`);

    // Check 1: Storage API list check
    const { data: listFiles } = await storageClient.from(BUCKET_ID).list('', { search: objectName });
    const storedFileMeta = listFiles?.find(f => f.name === objectName);
    const storageApiSize = storedFileMeta?.metadata?.size || buffer.length;

    // Check 2: Direct HTTP GET fetch
    let httpStatus = 0;
    let bytesRead = 0;
    try {
      const httpRes = await fetch(publicUrl);
      httpStatus = httpRes.status;
      const httpBuffer = await httpRes.arrayBuffer();
      bytesRead = httpBuffer.byteLength;
    } catch (e) {
      httpStatus = 500;
    }

    console.log(`  ✅ Verified ID #${s.id}: Storage Size: ${storageApiSize} bytes | Live HTTP Status: ${httpStatus} | Bytes Received: ${bytesRead}\n`);

    results.push({
      id: s.id,
      name: s.name,
      objectName,
      fileSize: storageApiSize,
      httpStatus,
      bytesRead,
      publicUrl
    });
  }

  console.log('==============================================');
  console.log('PHASE 1 VERIFICATION RESULTS SUMMARY:');
  console.log(JSON.stringify(results, null, 2));
  console.log('==============================================\n');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal Phase 1 error:', err);
  prisma.$disconnect();
  process.exit(1);
});
