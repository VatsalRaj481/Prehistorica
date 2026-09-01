import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

const FOSSIL_OR_DIAGRAM_KEYWORDS = [
  'fossil', 'specimen', 'skull', 'skeleton', 'skeletal', 'bone', 'cast',
  'museum', 'exhibit', 'formation', 'mold', 'mount', 'holotype', 'paratype',
  'tibia', 'femur', 'vertebra', 'mandible', 'tooth', 'teeth', 'claw',
  'photo', 'photograph', 'amnh', 'nhmuk', 'fmnh', 'nhm', 'smf', 'bmnh',
  'diagram', 'chart', 'map', 'size', 'scale', 'outline', 'phylopic', 'silhouette_only'
];

const ART_KEYWORDS = [
  'restoration', 'reconstruction', 'life', 'paleoart', 'illustration',
  'drawing', 'render', 'artwork', 'portrait', 'scene', 'living', 'fleshed'
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchCommons(query: string): Promise<string[]> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srnamespace: '6', // File namespace
    srlimit: '20',
    format: 'json',
    origin: '*'
  });
  try {
    const res = await fetch(`${COMMONS_API}?${params}`, {
      headers: { 'User-Agent': 'PaleoBot/2.0 (prehistoric-encyclopedia-sweep)' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.query?.search || []).map((r: any) => r.title.replace(/^File:/, ''));
  } catch (e) {
    return [];
  }
}

async function getCategoryMembers(categoryName: string): Promise<string[]> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'categorymembers',
    cmtitle: `Category:${categoryName}`,
    cmnamespace: '6', // File namespace only
    cmlimit: '20',
    format: 'json',
    origin: '*'
  });
  try {
    const res = await fetch(`${COMMONS_API}?${params}`, {
      headers: { 'User-Agent': 'PaleoBot/2.0 (prehistoric-encyclopedia-sweep)' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.query?.categorymembers || []).map((r: any) => r.title.replace(/^File:/, ''));
  } catch (e) {
    return [];
  }
}

async function getCommonsImageDetails(filename: string): Promise<{ url: string; mime: string; credit: string; license: string } | null> {
  const params = new URLSearchParams({
    action: 'query',
    titles: `File:${filename}`,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime',
    format: 'json',
    origin: '*'
  });
  try {
    const res = await fetch(`${COMMONS_API}?${params}`, {
      headers: { 'User-Agent': 'PaleoBot/2.0 (prehistoric-encyclopedia-sweep)' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages || {};
    const page: any = Object.values(pages)[0];
    const info = page?.imageinfo?.[0];
    if (!info) return null;

    const mime = info.mime || '';
    if (!mime.startsWith('image/')) return null;
    if (mime === 'image/svg+xml' || mime === 'image/tiff') return null; // prefer raster photo/art renderings

    const meta = info.extmetadata || {};
    const artist = meta.Artist?.value ? meta.Artist.value.replace(/<[^>]*>?/gm, '').trim() : 'Wikimedia Commons Contributor';
    const license = meta.LicenseShortName?.value || 'CC BY-SA';

    return {
      url: info.url,
      mime,
      credit: `${artist} (${license})`,
      license
    };
  } catch (e) {
    return null;
  }
}

function isLikelyLifeRestoration(filename: string, credit: string): boolean {
  const str = (filename + ' ' + credit).toLowerCase();

  const isFossilOrDiagram = FOSSIL_OR_DIAGRAM_KEYWORDS.some(k => str.includes(k));
  const hasArtWord = ART_KEYWORDS.some(k => str.includes(k));

  if (isFossilOrDiagram && !hasArtWord) {
    return false;
  }

  // Avoid pure skeletal drawings / skulls unless explicitly life-restoration
  if ((str.includes('skeletal') || str.includes('skull') || str.includes('size_comparison') || str.includes('scale')) && !str.includes('life')) {
    return false;
  }

  return true;
}

async function findTier1Paleoart(speciesName: string, genus: string): Promise<{ url: string; credit: string; sourceUrl: string; filename: string } | null> {
  const candidateFiles: string[] = [];

  // 1. Direct Category lookups
  const categoryNames = [
    genus,
    `${genus}_(dinosaur)`,
    `${genus}_(pterosaur)`,
    `${genus}_(reptile)`,
    `${genus}_restorations`,
    `Life_restorations_of_${genus}`
  ];

  for (const cat of categoryNames) {
    const members = await getCategoryMembers(cat);
    candidateFiles.push(...members);
    if (candidateFiles.length >= 10) break;
  }

  // 2. Commons broad searches
  const searchQueries = [
    `${genus} restoration`,
    `${genus} reconstruction`,
    `${genus} life`,
    `${speciesName} restoration`,
    `${speciesName} reconstruction`,
    `${genus} BW Tamura`,
    genus
  ];

  for (const q of searchQueries) {
    if (candidateFiles.length >= 25) break;
    const searchRes = await searchCommons(q);
    candidateFiles.push(...searchRes);
    await sleep(150);
  }

  // Deduplicate
  const uniqueFiles = Array.from(new Set(candidateFiles));

  for (const filename of uniqueFiles) {
    const lower = filename.toLowerCase();
    if (!lower.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

    const details = await getCommonsImageDetails(filename);
    if (!details) continue;

    if (isLikelyLifeRestoration(filename, details.credit)) {
      return {
        url: details.url,
        credit: details.credit,
        sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`,
        filename
      };
    }
  }

  return null;
}

async function uploadToSupabaseStorage(imageUrl: string, targetFilename: string): Promise<string | null> {
  if (!SUPABASE_URL || !KEY) return null;
  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'PaleoBot/2.0' }
    });
    if (!res.ok) return null;

    const mime = res.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer());

    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/species-media/${targetFilename}`, {
      method: 'POST',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': mime,
        'x-upsert': 'true'
      },
      body: buffer
    });

    if (!uploadRes.ok) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/species-media/${targetFilename}`;
  } catch (e) {
    return null;
  }
}

async function runSweep() {
  const candidatesPath = path.join(process.cwd(), 'backend', 'reports', 'sweep_candidates.json');
  if (!fs.existsSync(candidatesPath)) {
    console.error('sweep_candidates.json not found! Run audit_media_all.ts first.');
    process.exit(1);
  }

  const candidates: any[] = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
  console.log(`Loaded ${candidates.length} candidate species requiring paleoart sweep.`);

  const BATCH_SIZE = 25;
  let batchIndex = 1;

  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE);
    console.log(`\n================ BATCH ${batchIndex} (${batch.length} species) ================`);

    let batchUpgraded = 0;
    let batchRetaggedOnly = 0;
    let batchNoArtFound = 0;

    for (const c of batch) {
      const genus = c.name.trim().split(' ')[0];
      console.log(`\n[ID ${c.id}] ${c.name} (${c.scientificName || ''}) - Current: ${c.reason}`);

      const foundArt = await findTier1Paleoart(c.name, genus);

      if (foundArt) {
        console.log(`  ✓ Found Tier 1 Paleoart: ${foundArt.filename}`);

        let finalUrl = foundArt.url;

        if (c.isSelfHosted) {
          const ext = foundArt.url.endsWith('.png') ? 'png' : 'jpg';
          const storageName = `${c.id}-upgraded-art.${ext}`;
          const cdnUrl = await uploadToSupabaseStorage(foundArt.url, storageName);
          if (cdnUrl) {
            finalUrl = cdnUrl;
            console.log(`  ✓ Self-hosted in Supabase Storage: ${storageName}`);
          }
        }

        const newMediaItem = {
          url: finalUrl,
          type: 'art',
          credit: foundArt.credit,
          sourceUrl: foundArt.sourceUrl
        };

        const existingMedia = Array.isArray(c.media) ? c.media : [];
        // Put new art as primary, keep existing as secondary
        const updatedMedia = [newMediaItem, ...existingMedia.filter((m: any) => m.url !== finalUrl)];

        await prisma.species.update({
          where: { id: c.id },
          data: { media: JSON.stringify(updatedMedia) }
        });

        console.log(`  ✓ Successfully patched species record ID ${c.id}`);
        batchUpgraded++;
      } else {
        // If current image is actually art but was just mislabeled/suspicious URL, re-tag as art
        const primaryMedia = c.media?.[0];
        if (primaryMedia && primaryMedia.type !== 'art') {
          primaryMedia.type = 'art';
          await prisma.species.update({
            where: { id: c.id },
            data: { media: JSON.stringify(c.media) }
          });
          console.log(`  ↷ Re-tagged existing media as art for ${c.name}`);
          batchRetaggedOnly++;
        } else {
          console.log(`  ↷ No Tier 1 paleoart found on Commons — leaving existing image as-is.`);
          batchNoArtFound++;
        }
      }
      await sleep(250);
    }

    console.log(`\n--- BATCH ${batchIndex} SUMMARY ---`);
    console.log(`  Upgraded to Tier 1 Paleoart: ${batchUpgraded}`);
    console.log(`  Retagged existing art only : ${batchRetaggedOnly}`);
    console.log(`  Genuinely no art available  : ${batchNoArtFound}`);
    batchIndex++;
  }

  console.log('\n================ ALL BATCHES COMPLETE ================');
  await prisma.$disconnect();
}

runSweep().catch((err) => {
  console.error(err);
  process.exit(1);
});
