import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix220() {
  const s = await prisma.species.findUnique({ where: { id: 220 } });
  if (!s) return;

  const result = {
    id: s.id,
    taxonPageSlug: 'harpactognathus-gentryii',
    targetTaxon: 'Harpactognathus gentryii',
    rank: 'Species',
    currentFileTitle: 'Rhamphorhynchus_muensteri_restoration.png',
    originalSourcePage: 'https://commons.wikimedia.org/wiki/File:Rhamphorhynchus_muensteri_restoration.png',
    actualDepictedTaxon: 'Rhamphorhynchus muensteri',
    currentDbType: 'art',
    actualImageType: 'life_reconstruction',
    recommendedMediaPlacement: 'secondary_media_ids',
    exactTaxonEvidence: 'Source explicitly depicts Rhamphorhynchus muensteri rather than Harpactognathus gentryii',
    evidenceLevel: 'DIRECT SPECIES EVIDENCE',
    taxonomicAssignmentStatus: 'WRONG TAXON',
    otherAnimalTaxaVisible: 'No',
    artist: 'Nobu Tamura',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    attributionRequired: 'Nobu Tamura (CC BY-SA 3.0)',
    accuracyStatus: 'TAXONOMICALLY INCORRECT',
    proposedAction: 'DETACH FROM CURRENT TAXON',
    reason: 'Stored image explicitly depicts Rhamphorhynchus muensteri, which is taxonomically incorrect for Harpactognathus gentryii. Detached and reassignable to Rhamphorhynchus page. Primary replacement required.',
    confidence: 'High',
    verifiedOn: '2026-08-29'
  };

  console.log('\n=== STANDALONE FIX ACTION FOR TAXON #220 (Harpactognathus gentryii) ===');
  console.log(JSON.stringify(result, null, 2));
}

fix220()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
