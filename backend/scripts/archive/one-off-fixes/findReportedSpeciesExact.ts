import { PrismaClient } from '@prisma/client';
import https from 'https';

const prisma = new PrismaClient();

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

async function findReportedSpecies() {
  const all = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  
  const targetNames = ['achelousaurus', 'acrocanthosaurus', 'gastonia', 'animantarx', 'alamosaurus', 'camarasaurus'];

  const matched = all.filter(s => targetNames.some(t => s.name.toLowerCase().includes(t)));

  console.log(`Found ${matched.length} matching species in DB:\n`);

  for (const s of matched) {
    let media = [];
    try {
      media = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}

    console.log(`-----------------------------------------------------------------`);
    console.log(`ID #${s.id} *${s.name}*:`);
    console.log(`Current DB Media Array (${media.length} items):`);
    media.forEach((m: any, idx: number) => {
      console.log(`  [${idx}] type: '${m.type}' | url: ${m.url} | credit: ${m.credit}`);
    });
  }
}

findReportedSpecies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
