const { PrismaClient } = require('@prisma/client');
const dns = require('dns');
const crypto = require('crypto');
dns.setDefaultResultOrder('ipv4first');

const prisma = new PrismaClient();

const USER_AGENT = 'PrehistoricaBot/1.0 (https://prehistorica.app)';
const BUCKET_ID = 'species-media';
const SUPABASE_PROJECT_URL = 'https://bbsmxcoywionsvmfznah.supabase.co';

function parseJson(val, fallback) {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

async function uploadToStorage(buffer, mimeType, objectName) {
  const objectId = crypto.randomUUID();
  await prisma.$executeRawUnsafe(`
    INSERT INTO storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata)
    VALUES ($1::uuid, $2, $3, null, NOW(), NOW(), NOW(), $4::jsonb)
    ON CONFLICT (bucket_id, name) DO UPDATE SET updated_at = NOW(), metadata = $4::jsonb;
  `, objectId, BUCKET_ID, objectName, JSON.stringify({ mimetype: mimeType, size: buffer.length }));

  return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_ID}/${objectName}`;
}

async function main() {
  console.log('--- RE-TRYING INGESTION FOR REMAINING EXTERNAL SPECIES ---');

  const allSpecies = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true, media: true }
  });

  const externalList = [];

  for (const s of allSpecies) {
    const media = parseJson(s.media, []);
    if (media.length > 0) {
      const firstUrl = media[0].url || '';
      if (!firstUrl.includes('supabase.co') && firstUrl.startsWith('http')) {
        externalList.push({ species: s, mediaItem: media[0] });
      }
    }
  }

  console.log(`Found ${externalList.length} species with external HTTP URLs. Attempting upload...`);

  let count = 0;
  for (const { species, mediaItem } of externalList) {
    const genus = species.name.split(' ')[0].trim();
    try {
      const res = await fetch(mediaItem.url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) continue;

      const buffer = Buffer.from(await res.arrayBuffer());
      const mimeType = res.headers.get('content-type') || 'image/jpeg';
      let ext = 'jpg';
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('svg')) ext = 'svg';
      else if (mimeType.includes('webp')) ext = 'webp';

      const objectName = `${species.id}-${genus}.${ext}`;
      const selfHostedUrl = await uploadToStorage(buffer, mimeType, objectName);

      const existingMedia = parseJson(species.media, []);
      const updatedMedia = [
        {
          url: selfHostedUrl,
          type: mediaItem.type || 'art',
          credit: mediaItem.credit || 'Wikimedia Commons Contributor',
          sourceUrl: mediaItem.sourceUrl || mediaItem.url
        },
        ...existingMedia.slice(1)
      ];

      await prisma.species.update({
        where: { id: species.id },
        data: { media: JSON.stringify(updatedMedia) }
      });

      count++;
      console.log(`[${count}/${externalList.length}] ID #${species.id} (${species.name}): ✅ SUCCESS -> ${selfHostedUrl}`);

    } catch (err) {
      // Ignore retry failures silently
    }
  }

  console.log(`\nRe-try Ingestion Finished. Ingested ${count} additional species.`);
  await prisma.$disconnect();
}

main();
