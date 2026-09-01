import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const FOSSIL_KEYWORDS = [
  'fossil', 'specimen', 'skull', 'skeleton', 'skeletal', 'bone', 'cast',
  'museum', 'exhibit', 'formation', 'mold', 'mount', 'holotype', 'paratype',
  'tibia', 'femur', 'vertebra', 'mandible', 'tooth', 'teeth', 'claw',
  'photograph', 'amnh', 'nhmuk', 'fmnh', 'nhm', 'smf', 'bmnh',
  'diagram', 'chart', 'map', 'outline', '1893', '1899', '1911', '1900', '1888'
];

const ART_KEYWORDS = [
  'restoration', 'reconstruction', 'life', 'paleoart', 'illustration',
  'drawing', 'render', 'artwork', 'portrait', 'scene', 'living', 'fleshed',
  'tamura', 'nobu', 'durbed', 'lanzas', 'ntamura'
];

async function audit() {
  const all = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true, media: true }
  });

  const flagged: { id: number; name: string; url: string; reason: string }[] = [];

  for (const s of all) {
    let media: any[] = [];
    try {
      media = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}

    const primary = media[0];
    const url = (primary?.url || '').toLowerCase();
    const credit = (primary?.credit || '').toLowerCase();
    const type = (primary?.type || '').toLowerCase();

    const isFossilKw = FOSSIL_KEYWORDS.some(k => url.includes(k) || credit.includes(k));
    const isArtKw = ART_KEYWORDS.some(k => url.includes(k) || credit.includes(k));

    if (isFossilKw && (!isArtKw || url.includes('skeleton') || url.includes('skeletal') || url.includes('skull') || url.includes('museum') || url.includes('fossil'))) {
      flagged.push({
        id: s.id,
        name: s.name,
        url: primary?.url || '',
        reason: 'Fossil/Skeletal keyword in URL or credit'
      });
    }
  }

  console.log(`TOTAL SPECIES AUDITED: ${all.length}`);
  console.log(`TOTAL FLAGGED AS FOSSIL/SKELETAL PRIMARY: ${flagged.length}\n`);

  flagged.forEach(f => {
    console.log(`[ID ${f.id}] ${f.name} => ${f.url}`);
  });

  await prisma.$disconnect();
}

audit().catch(console.error);
