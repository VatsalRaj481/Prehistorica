import { PrismaClient } from '@prisma/client';
import https from 'https';

const prisma = new PrismaClient();

function searchWikiCommons(query: string): Promise<any[]> {
  return new Promise((resolve) => {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`;
    const req = https.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PrehistoricaEncyclopediaBot/2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.query ? json.query.search : []);
        } catch (e) {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
  });
}

function getWikiPageInfo(title: string): Promise<any> {
  return new Promise((resolve) => {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|extmetadata|user&format=json`;
    const req = https.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PrehistoricaEncyclopediaBot/2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = Object.values(json.query.pages) as any[];
          resolve(pages[0] || null);
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
  });
}

async function inspectReportedSpecies() {
  const names = ['Achelousaurus', 'Acrocanthosaurus', 'Gastonia', 'Animantarx', 'Alamosaurus', 'Camarasaurus'];

  console.log(`=== INSPECTING REPORTED SPECIES IN DB ===\n`);

  for (const name of names) {
    const sp = await prisma.species.findFirst({
      where: { name: { contains: name, mode: 'insensitive' } }
    });

    if (!sp) {
      console.log(`Species '${name}' not found in DB.`);
      continue;
    }

    let media = [];
    try {
      media = typeof sp.media === 'string' ? JSON.parse(sp.media) : (sp.media || []);
    } catch (e) {}

    console.log(`-----------------------------------------------------------------`);
    console.log(`ID #${sp.id} *${sp.name}*:`);
    console.log(`Current Media Array (${media.length} items):`);
    media.forEach((m: any, idx: number) => {
      console.log(`  [${idx}] type: '${m.type}' | url: ${m.url} | credit: ${m.credit}`);
    });

    // Search Commons for replacement life reconstruction candidates
    console.log(`Searching Commons for replacement artwork for '${name}'...`);
    const searchRes = await searchWikiCommons(`${name} life restoration`);
    const candidates = [];
    for (const item of searchRes.slice(0, 3)) {
      const info = await getWikiPageInfo(item.title);
      const ii = info?.imageinfo ? info.imageinfo[0] : {};
      const ext = ii.extmetadata || {};
      candidates.push({
        title: item.title,
        url: ii.url,
        artist: ext.Artist?.value?.replace(/<[^>]*>?/gm, '').trim() || ii.user || 'Unknown',
        license: ext.LicenseShortName?.value || 'CC BY-SA'
      });
    }

    console.log(`Found ${candidates.length} Commons candidates:`);
    candidates.forEach((c, idx) => console.log(`  Candidate [${idx}]: ${c.title} -> ${c.url} (${c.artist}, ${c.license})`));
  }
}

inspectReportedSpecies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
