const { PrismaClient } = require('@prisma/client');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const prisma = new PrismaClient();

function parseJson(val, fallback) {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

async function main() {
  const targetIds = [
    58, 63, 145, 147, 155, 161, 162, 169, 170, 185, 189, 190, 200, 201, 206, 211, 212,
    447, 460, 461, 473, 474, 478, 480, 514, 517, 524, 525, 533, 534, 541, 780, 844, 845,
    882, 883, 884, 885, 922, 923, 924
  ];

  const speciesList = await prisma.species.findMany({
    where: { id: { in: targetIds } },
    select: { id: true, name: true, scientificName: true, media: true },
    orderBy: { id: 'asc' }
  });

  const auditReport = [];
  const zeroImageIdsToUpdate = [];

  for (const s of speciesList) {
    const media = parseJson(s.media, []);
    let status = 'UNKNOWN';
    let url = 'NONE';

    if (media.length === 0) {
      status = 'Zero Image (Empty)';
      zeroImageIdsToUpdate.push(s.id);
    } else {
      url = media[0].url || '';
      if (url.startsWith('/images/placeholders/')) {
        status = 'Placeholder SVG';
        zeroImageIdsToUpdate.push(s.id);
      } else if (url.startsWith('http')) {
        status = 'External Image URL (Wikimedia/PhyloPic)';
      } else {
        status = 'Other/Empty';
        zeroImageIdsToUpdate.push(s.id);
      }
    }

    auditReport.push({
      id: s.id,
      name: s.name,
      status,
      url
    });
  }

  console.log(`\n=== AUDIT OF 41 SPECIES ===`);
  console.log(JSON.stringify(auditReport, null, 2));

  // If any have zero image or placeholder SVG, move them to pending reconstruction state (media = '[]')
  if (zeroImageIdsToUpdate.length > 0) {
    console.log(`\nMoving ${zeroImageIdsToUpdate.length} species with placeholder/zero images to 'pending reconstruction' state (media = '[]')...`);
    for (const zid of zeroImageIdsToUpdate) {
      await prisma.species.update({
        where: { id: zid },
        data: { media: '[]' }
      });
    }
    console.log('Update complete!');
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
});
