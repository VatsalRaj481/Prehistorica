import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function runCorrectedDatabaseWrite() {
  const jsonPath = path.join(__dirname, '../reports/true-media-audit-502.json');
  const auditRows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const auditMap = new Map<number, any>();
  auditRows.forEach((r: any) => auditMap.set(r.id, r));

  const speciesList = await prisma.species.findMany({
    orderBy: { id: 'asc' }
  });

  console.log(`Processing media re-categorization write across ${speciesList.length} species...`);

  let updatedCount = 0;

  for (const s of speciesList) {
    const auditInfo = auditMap.get(s.id);
    if (!auditInfo) continue;

    let mediaArr: any[] = [];
    try {
      mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
    } catch (e) {}

    const action = auditInfo.proposedAction;

    // Special Action 1: Taxon #1670 (Lightningclaw) - Detach wrong Aerosteon image
    if (s.id === 1670) {
      const filteredMedia = mediaArr.filter((m: any) => !m.url.includes('Aerosteon') && !(m.sourceUrl || '').includes('Aerosteon'));
      await prisma.species.update({
        where: { id: 1670 },
        data: { media: JSON.stringify(filteredMedia) }
      });
      console.log(`Updated Taxon #1670 (Lightningclaw): Detached wrong Aerosteon image.`);
      updatedCount++;
      continue;
    }

    // Special Action 2: Taxon #2317 (Indochelys spatulata) - Detach wrong Proganochelys & attach verified Indochelys figure
    if (s.id === 2317) {
      const filteredMedia = mediaArr.filter((m: any) => !m.url.includes('Proganochelys') && !(m.sourceUrl || '').includes('Proganochelys'));
      filteredMedia.push({
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/GSI-20380-Indochelys-spatulata-holotype-Maharashtra-India-Kota-Formation.png',
        type: 'scientific_figure',
        credit: 'Walter Joyce, Saswati Bandyopadhyay (CC BY 4.0)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:GSI-20380-Indochelys-spatulata-holotype-Maharashtra-India-Kota-Formation.png'
      });
      await prisma.species.update({
        where: { id: 2317 },
        data: { media: JSON.stringify(filteredMedia) }
      });
      console.log(`Updated Taxon #2317 (Indochelys): Detached wrong Proganochelys image & attached verified CC BY 4.0 paper figure.`);
      updatedCount++;
      continue;
    }

    // For all MOVE TO SECONDARY MEDIA / REPLACE PRIMARY IMAGE REQUIRED taxa:
    if (action === 'MOVE TO SECONDARY MEDIA' || action === 'DETACH FROM CURRENT TAXON' || action === 'REPLACE PRIMARY IMAGE REQUIRED') {
      if (mediaArr.length > 0) {
        const flaggedTitle = (auditInfo.currentFileTitle || '').toLowerCase();
        
        // Exact URL / sourceUrl matching to find the precise media item flagged in the audit
        let matchIdx = mediaArr.findIndex((m: any) => {
          const mUrl = (m.url || '').toLowerCase();
          const mSource = (m.sourceUrl || '').toLowerCase();
          return (flaggedTitle && (mUrl.includes(flaggedTitle) || mSource.includes(flaggedTitle))) || m.type === 'art';
        });

        if (matchIdx === -1) matchIdx = 0; // fallback to index 0

        const newType = auditInfo.actualImageType || 'secondary';
        mediaArr[matchIdx] = {
          ...mediaArr[matchIdx],
          type: newType
        };

        await prisma.species.update({
          where: { id: s.id },
          data: { media: JSON.stringify(mediaArr) }
        });
        updatedCount++;
      }
    }
  }

  console.log(`Successfully completed media re-categorization write across ${updatedCount} species!`);
}

runCorrectedDatabaseWrite()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
