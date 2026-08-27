import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const prisma = new PrismaClient();
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function searchCommonsArt(genus: string): Promise<{ url: string; credit: string; sourceUrl: string } | null> {
  const searchQueries = [
    `${genus} life restoration`,
    `${genus} restoration`,
    `${genus} reconstruction`,
    `${genus} life`,
    `${genus} Nobu Tamura`,
    genus
  ];

  for (const q of searchQueries) {
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: q,
      srnamespace: '6',
      srlimit: '10',
      format: 'json'
    });

    try {
      const res = await fetch(`${COMMONS_API}?${params}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PaleoBot/3.0' }
      });
      if (!res.ok) continue;
      const data = await res.json();
      const results = data.query?.search || [];

      for (const r of results) {
        const title = r.title.replace(/^File:/, '');
        const lower = title.toLowerCase();

        // Must be an image
        if (!lower.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

        // Skip fossil/skeletal/skull/diagram files
        if ((lower.includes('skull') || lower.includes('skeletal') || lower.includes('fossil') || lower.includes('diagram') || lower.includes('scale') || lower.includes('mount') || lower.includes('map')) && !lower.includes('life')) {
          continue;
        }

        // Fetch image info
        const infoParams = new URLSearchParams({
          action: 'query',
          titles: `File:${title}`,
          prop: 'imageinfo',
          iiprop: 'url|extmetadata',
          format: 'json'
        });

        const infoRes = await fetch(`${COMMONS_API}?${infoParams}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PaleoBot/3.0' }
        });
        if (!infoRes.ok) continue;
        const infoData = await infoRes.json();
        const page: any = Object.values(infoData.query?.pages || {})[0];
        const info = page?.imageinfo?.[0];

        if (info?.url) {
          const meta = info.extmetadata || {};
          const artist = meta.Artist?.value ? meta.Artist.value.replace(/<[^>]*>?/gm, '').trim() : 'Wikimedia Commons Contributor';
          const license = meta.LicenseShortName?.value || 'CC BY-SA';

          return {
            url: info.url,
            credit: `${artist} (${license})`,
            sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title)}`
          };
        }
      }
    } catch (e) {
      // ignore
    }
    await sleep(400);
  }

  return null;
}

function updateLocalJson(speciesName: string, genus: string, artUrl: string, credit: string, sourceUrl: string) {
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
        if (item.name && (item.name.toLowerCase() === speciesName.toLowerCase() || item.name.toLowerCase().startsWith(genus.toLowerCase()))) {
          item.reconstructionImageUrl = artUrl;
          item.media = [
            {
              url: artUrl,
              type: 'art',
              credit,
              sourceUrl
            }
          ];
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {}
  });
}

async function runDeepPaleoartSweep() {
  console.log('Fetching all species from live DB...');
  const all = await prisma.species.findMany({ select: { id: true, name: true, media: true } });
  console.log(`Total species: ${all.length}`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const s of all) {
    let media: any[] = [];
    try {
      media = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}

    const primary = media[0];
    const url = (primary?.url || '').toLowerCase();
    const isExplicitArt = url.includes('restoration') || url.includes('reconstruction') || url.includes('life') || url.includes('paleoart') || url.includes('tamura') || url.includes('durbed') || url.includes('bogdanov') || url.includes('sphenaphinae');

    if (isExplicitArt) {
      skippedCount++;
      continue;
    }

    const genus = s.name.trim().split(' ')[0];
    console.log(`\n[ID ${s.id}] Checking ${s.name} (Current: ${primary?.url})`);

    const art = await searchCommonsArt(genus);

    if (art) {
      console.log(`  ✓ Found Paleoart for ${s.name}: ${art.url}`);

      const newMedia = [
        {
          url: art.url,
          type: 'art',
          credit: art.credit,
          sourceUrl: art.sourceUrl
        }
      ];

      await prisma.species.update({
        where: { id: s.id },
        data: { media: JSON.stringify(newMedia) }
      });

      updateLocalJson(s.name, genus, art.url, art.credit, art.sourceUrl);
      updatedCount++;
    } else {
      console.log(`  ↷ Kept current image for ${s.name}`);
    }

    await sleep(500);
  }

  console.log('\n================ SWEEP COMPLETE ================');
  console.log(`Total Upgraded to Confirmed Paleoart: ${updatedCount}`);
  console.log(`Already Had Paleoart or Kept: ${skippedCount}`);
  await prisma.$disconnect();
}

runDeepPaleoartSweep().catch(console.error);
