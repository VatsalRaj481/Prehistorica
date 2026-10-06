const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetId = 447;
  const species = await prisma.species.findUnique({ where: { id: targetId } });

  if (!species) {
    console.error('Target species not found!');
    process.exit(1);
  }

  console.log('Pre-migration state:', {
    id: species.id,
    name: species.name,
    silhouette: species.comparisonSilhouette
  });

  const currentSil = JSON.parse(species.comparisonSilhouette);
  currentSil.url = 'https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/cf75413c-6985-400e-9389-81d7007e5d91-calibrated.svg';

  const updated = await prisma.species.update({
    where: { id: targetId },
    data: {
      comparisonSilhouette: JSON.stringify(currentSil)
    }
  });

  console.log('Post-migration state:', {
    id: updated.id,
    name: updated.name,
    silhouette: updated.comparisonSilhouette
  });

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
