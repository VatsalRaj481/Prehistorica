const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const prisma = new PrismaClient();

const USER_AGENT = 'PrehistoricaBot/1.0 (https://prehistorica.app; research@prehistorica.app)';
const BUCKET_ID = 'species-media';
const SUPABASE_PROJECT_URL = 'https://bbsmxcoywionsvmfznah.supabase.co';

const EXCLUDED_IDS = new Set([64, 75, 90, 142, 221, 535]); // 4 pending + 2 diagram species

function cleanHtml(html) {
  if (!html) return 'Unknown / Cited on File Page';
  return html.replace(/<[^>]*>/g, '').trim() || 'Unknown / Cited on File Page';
}

function isSuspiciousAuthor(credit) {
  if (!credit) return true;
  const c = credit.trim().toLowerCase();
  if (c.includes('prehistorica')) return true;
  const keywords = ['no machine-readable', 'assumed', 'inferred', 'unknown', 'unspecified', 'test', 'example', 'todo', 'placeholder', 'no credit', 'author unknown'];
  return keywords.some(kw => c.includes(kw));
}

function getLicenseScore(licStr) {
  const str = (licStr || '').toUpperCase();
  if (str.includes('CC0') || str.includes('PUBLIC DOMAIN') || str.includes('PD')) return 3;
  if (str.includes('CC BY-SA') || str.includes('GFDL')) return 1;
  if (str.includes('CC BY')) return 2;
  return 1;
}

function parseJson(val, fallback) {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

async function fetchWithRetry(url, retries = 3, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, delay * (i + 2)));
        continue;
      }
      if (!res.ok) return null;
      return res;
    } catch (err) {
      if (i === retries - 1) return null;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
    }
  }
  return null;
}

async function searchBestCandidate(scientificName, genus) {
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&format=json&srsearch=${encodeURIComponent(scientificName + ' restoration')}`;
    const searchRes = await (await fetchWithRetry(searchUrl)).json();
    const results = searchRes.query?.search || [];

    const foundTitles = [];
    for (const r of results) {
      const title = r.title.toLowerCase();
      if (title.endsWith('.jpg') || title.endsWith('.jpeg') || title.endsWith('.png') || title.endsWith('.webp') || title.endsWith('.svg')) {
        if (title.includes(genus.toLowerCase())) {
          foundTitles.push(r.title);
        }
      }
    }

    if (foundTitles.length === 0) return null;

    const titlesParam = foundTitles.slice(0, 5).join('|');
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata&format=json&titles=${encodeURIComponent(titlesParam)}`;
    const infoRes = await (await fetchWithRetry(infoUrl)).json();

    const pages = infoRes.query?.pages || {};
    const cands = [];

    for (const pid in pages) {
      const p = pages[pid];
      const info = p.imageinfo?.[0];
      if (!info || !info.url) continue;

      const meta = info.extmetadata || {};
      const artist = cleanHtml(meta.Artist?.value || meta.Credit?.value);
      if (isSuspiciousAuthor(artist)) continue;

      const lic = meta.LicenseShortName?.value || meta.License?.value || 'CC BY-SA';
      const score = getLicenseScore(lic);

      cands.push({
        url: info.url,
        sourceUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
        license: lic,
        score,
        credit: artist,
        title: p.title
      });
    }

    cands.sort((a, b) => b.score - a.score);
    return cands[0] || null;
  } catch (err) {
    return null;
  }
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

async function runBatch(batchOffset = 0, batchSize = 20) {
  console.log(`\n=== EXECUTING BATCH (Offset: ${batchOffset}, Limit: ${batchSize}) ===\n`);

  const speciesList = await prisma.species.findMany({
    where: {
      id: { notIn: Array.from(EXCLUDED_IDS) }
    },
    select: { id: true, name: true, scientificName: true, media: true },
    orderBy: { id: 'asc' },
    skip: batchOffset,
    take: batchSize
  });

  const successList = [];
  const failureList = [];

  for (let i = 0; i < speciesList.length; i++) {
    const s = speciesList[i];
    const existingMedia = parseJson(s.media, []);
    const genus = s.name.split(' ')[0].trim();

    // Check existing media for candidate URL
    let targetCandidate = null;

    if (existingMedia.length > 0 && existingMedia[0].url && !existingMedia[0].url.includes('supabase.co')) {
      const artEntry = existingMedia[0];
      if (!isSuspiciousAuthor(artEntry.credit)) {
        targetCandidate = {
          url: artEntry.url,
          sourceUrl: artEntry.sourceUrl || artEntry.url,
          credit: artEntry.credit || 'Wikimedia Commons Contributor',
          license: 'CC BY-SA'
        };
      }
    }

    if (!targetCandidate) {
      targetCandidate = await searchBestCandidate(s.scientificName, genus);
    }

    if (!targetCandidate) {
      console.log(`[${i + 1}/${speciesList.length}] ID #${s.id} (${s.name}): ⚠️ SKIPPED (No non-suspicious image candidate found).`);
      failureList.push({ id: s.id, name: s.name, reason: 'No clean candidate found' });
      continue;
    }

    try {
      // Download image file
      const imgRes = await fetchWithRetry(targetCandidate.url);
      if (!imgRes) {
        console.log(`[${i + 1}/${speciesList.length}] ID #${s.id} (${s.name}): ⚠️ SKIPPED (Image URL fetch failed).`);
        failureList.push({ id: s.id, name: s.name, reason: 'Image fetch failed' });
        continue;
      }

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
      let ext = 'jpg';
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('svg')) ext = 'svg';
      else if (mimeType.includes('webp')) ext = 'webp';

      const objectName = `${s.id}-${genus}.${ext}`;

      // Upload to storage
      const selfHostedUrl = await uploadToStorage(buffer, mimeType, objectName);

      // Update species media array
      const updatedMedia = [
        {
          url: selfHostedUrl,
          type: 'art',
          credit: targetCandidate.credit,
          sourceUrl: targetCandidate.sourceUrl
        },
        ...existingMedia.filter(m => m.type !== 'art')
      ];

      await prisma.species.update({
        where: { id: s.id },
        data: { media: JSON.stringify(updatedMedia) }
      });

      console.log(`[${i + 1}/${speciesList.length}] ID #${s.id} (${s.name}): ✅ SUCCESS -> ${selfHostedUrl}`);
      successList.push({ id: s.id, name: s.name, url: selfHostedUrl });

    } catch (err) {
      console.error(`[${i + 1}/${speciesList.length}] ID #${s.id} (${s.name}): ❌ FAILED -> ${err.message}`);
      failureList.push({ id: s.id, name: s.name, reason: err.message });
    }
  }

  console.log(`\n==============================================`);
  console.log(`BATCH COMPLETE: ${successList.length} Ingested, ${failureList.length} Failed/Skipped.`);
  console.log(`==============================================\n`);

  await prisma.$disconnect();
}

const offset = parseInt(process.argv[2] || '0', 10);
const size = parseInt(process.argv[3] || '20', 10);

runBatch(offset, size).catch(err => {
  console.error('Fatal batch error:', err);
  prisma.$disconnect();
  process.exit(1);
});
