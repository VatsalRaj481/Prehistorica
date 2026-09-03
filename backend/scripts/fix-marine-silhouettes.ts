import './../src/dns-init.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMarineSilhouettes() {
  console.log('Refining Marine Reptile silhouettes to exact family approximations...');

  // 1. Guanlingsaurus -> Shastasauridae (Shastasaurus sikanniensis)
  await prisma.species.update({
    where: { id: 138 },
    data: {
      comparisonSilhouette: JSON.stringify({
        url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/83c83962-d551-42dd-a3b2-99346a89fc99.svg',
        sourceUrl: 'https://www.phylopic.org/images/83c83962-d551-42dd-a3b2-99346a89fc99',
        license: 'Attribution 3.0 Unported',
        credit: 'Gareth Monger',
        taxon: 'Shastasauridae (Representative: Shastasaurus sikanniensis)',
        taxonMatch: 'generic approximation, not species-specific'
      })
    }
  });
  console.log('Updated Guanlingsaurus (ID 138) to Shastasauridae silhouette!');

  // 2. Ceresiosaurus -> Nothosauridae (Nothosaurus mirabilis)
  await prisma.species.update({
    where: { id: 132 },
    data: {
      comparisonSilhouette: JSON.stringify({
        url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/8f252288-5164-4105-b322-e417bf39fe2d.svg',
        sourceUrl: 'https://www.phylopic.org/images/8f252288-5164-4105-b322-e417bf39fe2d',
        license: 'CC0 1.0 Universal Public Domain Dedication',
        credit: 'Dan Niel',
        taxon: 'Nothosauridae (Representative: Nothosaurus mirabilis)',
        taxonMatch: 'generic approximation, not species-specific'
      })
    }
  });
  console.log('Updated Ceresiosaurus (ID 132) to Nothosauridae silhouette!');

  // 3. Simosaurus -> Nothosauroidea (Nothosaurus mirabilis)
  await prisma.species.update({
    where: { id: 134 },
    data: {
      comparisonSilhouette: JSON.stringify({
        url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/8f252288-5164-4105-b322-e417bf39fe2d.svg',
        sourceUrl: 'https://www.phylopic.org/images/8f252288-5164-4105-b322-e417bf39fe2d',
        license: 'CC0 1.0 Universal Public Domain Dedication',
        credit: 'Dan Niel',
        taxon: 'Nothosauroidea (Representative: Nothosaurus mirabilis)',
        taxonMatch: 'generic approximation, not species-specific'
      })
    }
  });
  console.log('Updated Simosaurus (ID 134) to Nothosauroidea silhouette!');

  // 4. Indochelys -> Testudines (Santanachelys gaffneyi)
  await prisma.species.update({
    where: { id: 2317 },
    data: {
      comparisonSilhouette: JSON.stringify({
        url: 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/570767d9-cc21-4aae-9281-128d04ccf193.svg',
        sourceUrl: 'https://www.phylopic.org/images/570767d9-cc21-4aae-9281-128d04ccf193',
        license: 'Attribution-ShareAlike 3.0 Unported',
        credit: 'T. Michael Keesey',
        taxon: 'Testudines (Representative: Santanachelys gaffneyi)',
        taxonMatch: 'generic approximation, not species-specific'
      })
    }
  });
  console.log('Updated Indochelys spatulata (ID 2317) to Testudines silhouette!');

  console.log('Marine reptile silhouette refinements completed successfully!');
}

fixMarineSilhouettes().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
