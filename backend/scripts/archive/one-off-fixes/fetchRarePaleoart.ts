import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixRare() {
  // 1. Lightningclaw (Megaraptora / Theropod from Lightning Ridge, Australia)
  // Wikimedia / Public domain / CC BY illustration of Megaraptorid / Lightningclaw
  const lightningclawMedia = [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Lightningclaw_reconstruction.jpg",
      type: "art" as const,
      credit: "Paleoart restoration of Australian Megaraptorid (Wikimedia Commons CC BY-SA 4.0)",
      sourceUrl: "https://commons.wikimedia.org/wiki/Category:Megaraptora"
    }
  ];

  // Try fallback to Megaraptoran paleoart if exact file name differs
  const resLightning = await fetch('https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=Megaraptora%20restoration&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|extmetadata&format=json', {
    headers: { 'User-Agent': 'PrehistoricaBot/2.0' }
  });
  const jsonLightning: any = await resLightning.json();
  let lightningUrl = 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Australovenator_BW.jpg';
  let lightningCredit = 'Nobu Tamura (CC BY 3.0)';
  let lightningSource = 'https://commons.wikimedia.org/wiki/File:Australovenator_BW.jpg';

  if (jsonLightning.query && jsonLightning.query.pages) {
    const p: any = Object.values(jsonLightning.query.pages)[0];
    if (p && p.imageinfo && p.imageinfo[0]) {
      lightningUrl = p.imageinfo[0].url.split('?')[0];
      const artist = (p.imageinfo[0].extmetadata?.Artist?.value || 'Wikimedia Contributor').replace(/<[^>]*>?/gm, '');
      const lic = p.imageinfo[0].extmetadata?.LicenseShortName?.value || 'CC BY-SA';
      lightningCredit = `${artist} (${lic})`;
      lightningSource = `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`;
    }
  }

  // 2. Mesadactylus (Morrison Formation Anurognathid / Pterosaur)
  const resMesa = await fetch('https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=Anurognathidae%20restoration&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|extmetadata&format=json', {
    headers: { 'User-Agent': 'PrehistoricaBot/2.0' }
  });
  const jsonMesa: any = await resMesa.json();
  let mesaUrl = 'https://upload.wikimedia.org/wikipedia/commons/8/87/Anurognathus_BW.jpg';
  let mesaCredit = 'Nobu Tamura (CC BY 2.5)';
  let mesaSource = 'https://commons.wikimedia.org/wiki/File:Anurognathus_BW.jpg';

  if (jsonMesa.query && jsonMesa.query.pages) {
    const p: any = Object.values(jsonMesa.query.pages)[0];
    if (p && p.imageinfo && p.imageinfo[0]) {
      mesaUrl = p.imageinfo[0].url.split('?')[0];
      const artist = (p.imageinfo[0].extmetadata?.Artist?.value || 'Wikimedia Contributor').replace(/<[^>]*>?/gm, '');
      const lic = p.imageinfo[0].extmetadata?.LicenseShortName?.value || 'CC BY-SA';
      mesaCredit = `${artist} (${lic})`;
      mesaSource = `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`;
    }
  }

  console.log('Lightningclaw Paleoart:', { lightningUrl, lightningCredit, lightningSource });
  console.log('Mesadactylus Paleoart:', { mesaUrl, mesaCredit, mesaSource });

  // Update Supabase DB for Lightningclaw (#1670)
  await prisma.species.update({
    where: { id: 1670 },
    data: {
      media: JSON.stringify([{
        url: lightningUrl,
        type: 'art',
        credit: lightningCredit,
        sourceUrl: lightningSource
      }])
    }
  });
  console.log('✓ Updated Supabase DB for Lightningclaw (#1670)');

  // Update Supabase DB for Mesadactylus (#221)
  await prisma.species.update({
    where: { id: 221 },
    data: {
      media: JSON.stringify([{
        url: mesaUrl,
        type: 'art',
        credit: mesaCredit,
        sourceUrl: mesaSource
      }])
    }
  });
  console.log('✓ Updated Supabase DB for Mesadactylus (#221)');
}

fixRare()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
