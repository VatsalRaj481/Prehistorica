import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function audit() {
  const species = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true, media: true }
  });

  console.log(`Total DB Species: ${species.length}`);

  let artCount = 0;
  let photoCount = 0;
  let diagramCount = 0;
  let missingCount = 0;
  let selfHostedCount = 0;

  const candidates: any[] = [];
  const allSpeciesMediaSummary: any[] = [];

  for (const s of species) {
    let media: any[] = [];
    try {
      media = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}

    const primary = media[0];
    if (!primary) {
      missingCount++;
      candidates.push({
        id: s.id,
        name: s.name,
        scientificName: s.scientificName,
        reason: 'missing_media',
        primaryUrl: null,
        type: null,
        isSelfHosted: false
      });
      continue;
    }

    const isSelfHosted = Boolean(primary.url && (primary.url.includes('supabase.co') || primary.url.includes('species-media')));
    if (isSelfHosted) selfHostedCount++;

    const urlLower = (primary.url || '').toLowerCase();
    const creditLower = (primary.credit || '').toLowerCase();
    const typeLower = (primary.type || '').toLowerCase();

    const FOSSIL_OR_DIAGRAM_KEYWORDS = [
      'fossil', 'specimen', 'skull', 'skeleton', 'skeletal', 'bone', 'cast',
      'museum', 'exhibit', 'formation', 'mold', 'mount', 'holotype', 'paratype',
      'tibia', 'femur', 'vertebra', 'mandible', 'tooth', 'teeth', 'claw',
      'photo', 'photograph', 'amnh', 'nhmuk', 'fmnh', 'nhm', 'smf', 'bmnh',
      'diagram', 'chart', 'map', 'size', 'scale', 'outline', 'phylopic', 'silhouette'
    ];

    const isFossilOrDiagram = FOSSIL_OR_DIAGRAM_KEYWORDS.some(k => urlLower.includes(k) || creditLower.includes(k));

    if (typeLower === 'photo') {
      photoCount++;
      candidates.push({
        id: s.id,
        name: s.name,
        scientificName: s.scientificName,
        reason: 'tagged_photo',
        primaryUrl: primary.url,
        credit: primary.credit,
        type: 'photo',
        isSelfHosted,
        media
      });
    } else if (typeLower === 'diagram' || typeLower === 'scale_diagram') {
      diagramCount++;
      candidates.push({
        id: s.id,
        name: s.name,
        scientificName: s.scientificName,
        reason: 'tagged_diagram',
        primaryUrl: primary.url,
        credit: primary.credit,
        type: typeLower,
        isSelfHosted,
        media
      });
    } else if (typeLower === 'art') {
      artCount++;
      if (isFossilOrDiagram) {
        candidates.push({
          id: s.id,
          name: s.name,
          scientificName: s.scientificName,
          reason: 'art_but_fossil_or_diagram_keywords',
          primaryUrl: primary.url,
          credit: primary.credit,
          type: 'art',
          isSelfHosted,
          media
        });
      }
    } else {
      candidates.push({
        id: s.id,
        name: s.name,
        scientificName: s.scientificName,
        reason: 'unknown_type_' + typeLower,
        primaryUrl: primary.url,
        credit: primary.credit,
        type: typeLower,
        isSelfHosted,
        media
      });
    }

    allSpeciesMediaSummary.push({
      id: s.id,
      name: s.name,
      primaryType: typeLower,
      primaryUrl: primary.url,
      primaryCredit: primary.credit,
      isSelfHosted,
      isFossilOrDiagram,
      mediaCount: media.length
    });
  }

  console.log('\n--- LIVE DB MEDIA BREAKDOWN ---');
  console.log(`Art tagged: ${artCount}`);
  console.log(`Photo tagged: ${photoCount}`);
  console.log(`Diagram tagged: ${diagramCount}`);
  console.log(`Missing media: ${missingCount}`);
  console.log(`Self-hosted primary URLs: ${selfHostedCount}`);
  console.log(`Candidates needing verification/sweep: ${candidates.length}`);

  const outDir = path.join(process.cwd(), 'backend', 'reports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'media_audit_all_species.json'), JSON.stringify(allSpeciesMediaSummary, null, 2));
  fs.writeFileSync(path.join(outDir, 'sweep_candidates.json'), JSON.stringify(candidates, null, 2));

  await prisma.$disconnect();
}

audit().catch((err) => {
  console.error(err);
  process.exit(1);
});
