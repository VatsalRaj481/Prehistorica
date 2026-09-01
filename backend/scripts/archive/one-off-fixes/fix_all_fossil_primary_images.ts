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
  'diagram', 'chart', 'map', 'size', 'scale', 'outline', 'phylopic', 'silhouette_only',
  '1893', '1899', '1911', '1900', '1888' // old lithograph bone diagrams
];

const ART_KEYWORDS = [
  'restoration', 'reconstruction', 'life', 'paleoart', 'illustration',
  'drawing', 'render', 'artwork', 'portrait', 'scene', 'living', 'fleshed',
  'tamura', 'nobu', 'durbed', 'lanzas', 'ntamura'
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchCommons(query: string): Promise<string[]> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srnamespace: '6',
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
    cmnamespace: '6',
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
    if (mime === 'image/svg+xml' || mime === 'image/tiff') return null;

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

  if ((str.includes('skeletal') || str.includes('skull') || str.includes('size_comparison') || str.includes('scale')) && !str.includes('life')) {
    return false;
  }

  return true;
}

async function findTier1Paleoart(speciesName: string, genus: string): Promise<{ url: string; credit: string; sourceUrl: string; filename: string } | null> {
  const candidateFiles: string[] = [];

  const categoryNames = [
    `${genus}_life_restorations`,
    `Life_restorations_of_${genus}`,
    `${genus}_restorations`,
    genus,
    `${genus}_(dinosaur)`,
    `${genus}_(pterosaur)`,
    `${genus}_(reptile)`,
    `${genus}_(synapsid)`,
    `${genus}_(mammal)`
  ];

  for (const cat of categoryNames) {
    const members = await getCategoryMembers(cat);
    candidateFiles.push(...members);
    if (candidateFiles.length >= 10) break;
  }

  const searchQueries = [
    `${genus} restoration`,
    `${genus} life restoration`,
    `${genus} reconstruction`,
    `${genus} life`,
    `${genus} BW Tamura`,
    `${genus} Nobu Tamura`,
    `${speciesName} restoration`,
    `${speciesName} reconstruction`,
    genus
  ];

  for (const q of searchQueries) {
    if (candidateFiles.length >= 25) break;
    const searchRes = await searchCommons(q);
    candidateFiles.push(...searchRes);
    await sleep(150);
  }

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

function updateLocalJsonFiles(speciesName: string, genus: string, newArtUrl: string) {
  const jsonFiles = [
    'species_cretaceous.json',
    'species_jurassic.json',
    'species_triassic.json',
    'new_species_batch.json',
    'species.json'
  ];

  jsonFiles.forEach(file => {
    const p = path.join(process.cwd(), 'backend', 'prisma', file);
    if (!fs.existsSync(p)) return;

    try {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      let modified = false;

      data.forEach((item: any) => {
        const nameMatch = item.name && (item.name.toLowerCase() === speciesName.toLowerCase() || item.name.toLowerCase().startsWith(genus.toLowerCase()));
        if (nameMatch) {
          item.reconstructionImageUrl = newArtUrl;
          if (Array.isArray(item.media) && item.media.length > 0) {
            item.media[0].url = newArtUrl;
            item.media[0].type = 'art';
          }
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
        console.log(`  ✓ Updated ${file} for ${speciesName}`);
      }
    } catch (e) {
      // ignore
    }
  });
}

async function runGlobalFossilToPaleoartRepair() {
  console.log('Fetching all species from live DB...');
  const allSpecies = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true, media: true }
  });

  console.log(`Total species in DB: ${allSpecies.length}`);

  let upgradedCount = 0;
  let skippedCount = 0;

  for (const s of allSpecies) {
    let mediaArray: any[] = [];
    try {
      mediaArray = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}

    const primary = mediaArray[0];
    const urlLower = (primary?.url || '').toLowerCase();
    const creditLower = (primary?.credit || '').toLowerCase();
    const titleStr = s.name.toLowerCase();

    // Check if primary image is a fossil photo, skeletal diagram, museum mount, or skull drawing
    const isFossilOrSkeleton = FOSSIL_OR_DIAGRAM_KEYWORDS.some(k => urlLower.includes(k) || creditLower.includes(k));
    const isArtWord = ART_KEYWORDS.some(k => urlLower.includes(k) || creditLower.includes(k));

    const needsFix = isFossilOrSkeleton && (!isArtWord || urlLower.includes('skeleton') || urlLower.includes('skeletal') || urlLower.includes('skull') || urlLower.includes('museum') || urlLower.includes('fossil'));

    if (!needsFix) {
      continue;
    }

    const genus = s.name.trim().split(' ')[0];
    console.log(`\n[ID ${s.id}] ${s.name} (${s.scientificName}) - Primary is Fossil/Skeletal: ${primary?.url}`);

    // Check if mediaArray already contains a secondary item that is genuine Paleoart
    const secondaryArt = mediaArray.find((m: any, idx: number) => {
      if (idx === 0) return false;
      const u = (m.url || '').toLowerCase();
      const c = (m.credit || '').toLowerCase();
      return !FOSSIL_OR_DIAGRAM_KEYWORDS.some(k => u.includes(k) || c.includes(k));
    });

    if (secondaryArt) {
      console.log(`  ✓ Re-ordering mediaArray: moving existing paleoart ${secondaryArt.url} to primary position!`);
      const newMedia = [secondaryArt, ...mediaArray.filter((m: any) => m.url !== secondaryArt.url)];
      await prisma.species.update({
        where: { id: s.id },
        data: { media: JSON.stringify(newMedia) }
      });
      updateLocalJsonFiles(s.name, genus, secondaryArt.url);
      upgradedCount++;
      continue;
    }

    // Search Commons/PhyloPic for Tier 1 Paleoart
    const foundArt = await findTier1Paleoart(s.name, genus);

    if (foundArt) {
      console.log(`  ✓ Found Tier 1 Paleoart on Commons: ${foundArt.filename}`);

      let finalUrl = foundArt.url;
      const isSelfHosted = primary?.url && (primary.url.includes('supabase.co') || primary.url.includes('species-media'));

      if (isSelfHosted) {
        const ext = foundArt.url.endsWith('.png') ? 'png' : 'jpg';
        const storageName = `${s.id}-repaired-art.${ext}`;
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

      const updatedMedia = [newMediaItem, ...mediaArray.filter((m: any) => m.url !== finalUrl)];

      await prisma.species.update({
        where: { id: s.id },
        data: { media: JSON.stringify(updatedMedia) }
      });

      updateLocalJsonFiles(s.name, genus, finalUrl);
      console.log(`  ✓ Successfully patched DB record and JSON seed files for ID ${s.id}`);
      upgradedCount++;
    } else {
      console.log(`  ↷ No Commons paleoart found for ${s.name} — leaving as-is.`);
      skippedCount++;
    }
    await sleep(250);
  }

  console.log('\n================ REPAIR COMPLETE ================');
  console.log(`Total upgraded to genuine Paleoart: ${upgradedCount}`);
  console.log(`Total left as-is (no Commons art): ${skippedCount}`);
  await prisma.$disconnect();
}

runGlobalFossilToPaleoartRepair().catch(err => {
  console.error(err);
  process.exit(1);
});
