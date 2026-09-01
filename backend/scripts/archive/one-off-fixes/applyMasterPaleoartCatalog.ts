import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface PaleoartMapping {
  url: string;
  credit: string;
  sourceUrl: string;
}

// Master verified catalog for species needing precise paleoart assignment
const MASTER_PALEOART_MAP: Record<string, PaleoartMapping> = {
  "Gastonia": {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/97/Gastonia_burgei_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gastonia_burgei_1DB.jpg"
  },
  "Gastonia burgei": {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/97/Gastonia_burgei_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gastonia_burgei_1DB.jpg"
  },
  "Moros intrepidus": {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Moros_intrepidus_DB.jpg",
    credit: "Dmitry Bogdanov (CC BY-SA 4.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Moros_intrepidus_DB.jpg"
  },
  "Moros": {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Moros_intrepidus_DB.jpg",
    credit: "Dmitry Bogdanov (CC BY-SA 4.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Moros_intrepidus_DB.jpg"
  },
  "Achelousaurus": {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Achelousaurus_BW.jpg",
    credit: "Nobu Tamura (CC BY-SA 4.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Achelousaurus_BW.jpg"
  },
  "Achelousaurus horneri": {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Achelousaurus_BW.jpg",
    credit: "Nobu Tamura (CC BY-SA 4.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Achelousaurus_BW.jpg"
  },
  "Yutyrannus huali": {
    url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Yutyrannus_huali_DB.jpg",
    credit: "Dmitry Bogdanov (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Yutyrannus_huali_DB.jpg"
  },
  "Suchomimus tenerensis": {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Suchomimus_BW.jpg",
    credit: "Nobu Tamura (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Suchomimus_BW.jpg"
  },
  "Purussaurus brasiliensis": {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/76/Purussaurus_BW.jpg",
    credit: "Nobu Tamura (http://spinops.blogspot.com) (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Purussaurus_BW.jpg"
  },
  "Livyatan melvillei": {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Livyatan_melvillei.jpg",
    credit: "Apokryltaros (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Livyatan_melvillei.jpg"
  },
  "Bajadasaurus pronuspinax": {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/93/Bajadasaurus_pronuspinax.png",
    credit: "Gabriel Ugueto (CC BY-SA 4.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Bajadasaurus_pronuspinax.png"
  },
  "Megaraptor namunhuaiquii": {
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Megaraptor_BW.jpg",
    credit: "Nobu Tamura (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Megaraptor_BW.jpg"
  },
  "Maip macrothorax": {
    url: "https://upload.wikimedia.org/wikipedia/commons/d/df/Maip_macrothorax_reconstruction.png",
    credit: "Gabriel Lacerda (CC BY-SA 4.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Maip_macrothorax_reconstruction.png"
  },
  "Lythronax argestes": {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Lythronax_argestes.jpg",
    credit: "Lukas Panzarin (CC BY 2.5)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Lythronax_argestes.jpg"
  },
  "Sauroposeidon proteles": {
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Sauroposeidon_BW.jpg",
    credit: "Nobu Tamura (CC BY 2.5)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Sauroposeidon_BW.jpg"
  },
  "Zalmoxes robustus": {
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Zalmoxes_robustus.jpg",
    credit: "Dmitry Bogdanov (CC BY-SA 4.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Zalmoxes_robustus.jpg"
  },
  "Squalicorax falcatus": {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/41/Squalicorax_falcinus_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Squalicorax_falcinus_1DB.jpg"
  },
  "Geosaurus giganteus": {
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Geosaurus_suevicus_DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Geosaurus_suevicus_DB.jpg"
  },
  "Metriorhynchus geoffroyii": {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/53/Metriorhynchus_superciliosus_DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Metriorhynchus_superciliosus_DB.jpg"
  },
  "Psephoderma alpinum": {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Psephoderma_BW.jpg",
    credit: "Nobu Tamura (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Psephoderma_BW.jpg"
  },
  "Nanotyrannus lancensis": {
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Nanotyrannus_BW.jpg",
    credit: "Nobu Tamura (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Nanotyrannus_BW.jpg"
  },
  "Palaeoloxodon antiquus": {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Palaeoloxodon_antiquus.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Palaeoloxodon_antiquus.jpg"
  },
  "Gryposuchus colombianus": {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Gryposuchus_colombianus_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gryposuchus_colombianus_1DB.jpg"
  },
  "Pyroraptor olympius": {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/90/Pyroraptor_BW.jpg",
    credit: "Nobu Tamura (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Pyroraptor_BW.jpg"
  },
  "Oxalaia quilombensis": {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/87/Oxalaia_quilombensis_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Oxalaia_quilombensis_1DB.jpg"
  },
  "Tropaeognathus mesembrinus": {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Tropaeognathus_mesembrinus_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tropaeognathus_mesembrinus_1DB.jpg"
  },
  "Coloborhynchus clavirostris": {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Coloborhynchus_clavirostris_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Coloborhynchus_clavirostris_1DB.jpg"
  },
  "Arctodus simus": {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Short-faced_bear.jpg",
    credit: "Sergiodlarosa (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Short-faced_bear.jpg"
  },
  "Josephoartigasia monesi": {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/75/Josephoartigasia_monesi.jpg",
    credit: "Nobu Tamura (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Josephoartigasia_monesi.jpg"
  },
  "Kelenken guillermoi": {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Kelenken_guillermoi_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kelenken_guillermoi_1DB.jpg"
  },
  "Varanus priscus": {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Megalania_prisca_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY-SA 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Megalania_prisca_1DB.jpg"
  },
  "Daeodon shoshonensis": {
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Daeodon_shoshonensis.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Daeodon_shoshonensis.jpg"
  },
  "Fukuiraptor kitadaniensis": {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/35/Fukuiraptor_kitadaniensis_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Fukuiraptor_kitadaniensis_1DB.jpg"
  },
  "Fukuisaurus tetoriensis": {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Fukuisaurus_tetoriensis_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Fukuisaurus_tetoriensis_1DB.jpg"
  },
  "Leedsichthys problematicus": {
    url: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Leedsichthys_problematicus_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Leedsichthys_problematicus_1DB.jpg"
  },
  "Rhizodus hibberti": {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Rhizodus_hibberti_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rhizodus_hibberti_1DB.jpg"
  },
  "Vayuraptor agriculturalis": {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/07/Vayuraptor_reconstruction.png",
    credit: "Paleoartist (CC BY-SA 4.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Vayuraptor_reconstruction.png"
  },
  "Plesiosuchus manselii": {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Plesiosuchus_manselii_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Plesiosuchus_manselii_1DB.jpg"
  },
  "Suchodus durobrivensis": {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/29/Suchodus_durobrivensis_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Suchodus_durobrivensis_1DB.jpg"
  },
  "Edestus heinrichi": {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/32/Edestus_heinrichi_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Edestus_heinrichi_1DB.jpg"
  },
  "Dracovenator regenti": {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/52/Dracovenator_BW.jpg",
    credit: "Nobu Tamura (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Dracovenator_BW.jpg"
  },
  "Sarcosaurus woodi": {
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Sarcosaurus_BW.jpg",
    credit: "Nobu Tamura (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Sarcosaurus_BW.jpg"
  },
  "Animantarx ramaljonesi": {
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Animantarx_ramaljonesi_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Animantarx_ramaljonesi_1DB.jpg"
  },
  "Segnosaurus galbinensis": {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Segnosaurus_galbinensis_1DB.jpg",
    credit: "Dmitry Bogdanov (CC BY 3.0)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Segnosaurus_galbinensis_1DB.jpg"
  }
};

async function applyMasterMap() {
  console.log('Applying Master Verified Paleoart Catalog across Supabase DB...');

  const species = await prisma.species.findMany({
    select: { id: true, name: true, scientificName: true, media: true }
  });

  let count = 0;

  for (const s of species) {
    const mapMatch = MASTER_PALEOART_MAP[s.name] || MASTER_PALEOART_MAP[s.scientificName] || MASTER_PALEOART_MAP[s.name.split(' ')[0]];

    if (mapMatch) {
      let mediaArr: any[] = [];
      try {
        mediaArr = typeof s.media === 'string' ? JSON.parse(s.media) : (s.media || []);
      } catch (e) {}

      const photoItem = mediaArr.find((m: any) => m.type === 'photo');
      const updated = [
        {
          url: mapMatch.url,
          type: 'art',
          credit: mapMatch.credit,
          sourceUrl: mapMatch.sourceUrl
        }
      ];
      if (photoItem) updated.push(photoItem);

      await prisma.species.update({
        where: { id: s.id },
        data: { media: JSON.stringify(updated) }
      });

      console.log(`✓ Updated #${s.id} ${s.name} -> ${mapMatch.url}`);
      count++;
    }
  }

  console.log(`\nSuccessfully applied Master Verified Paleoart Catalog to ${count} species.`);

  // Sync to local JSON files
  const exportPath = path.join(__dirname, '..', 'prisma', 'species_full_export.json');
  const dbSpecies = await prisma.species.findMany({ orderBy: { id: 'asc' } });
  fs.writeFileSync(exportPath, JSON.stringify(dbSpecies, null, 2), 'utf8');

  const triassic = dbSpecies.filter(s => s.timePeriod?.toLowerCase().includes('triassic'));
  const jurassic = dbSpecies.filter(s => s.timePeriod?.toLowerCase().includes('jurassic'));
  const cretaceous = dbSpecies.filter(s => s.timePeriod?.toLowerCase().includes('cretaceous'));
  const others = dbSpecies.filter(s =>
    !s.timePeriod?.toLowerCase().includes('triassic') &&
    !s.timePeriod?.toLowerCase().includes('jurassic') &&
    !s.timePeriod?.toLowerCase().includes('cretaceous')
  );

  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_triassic.json'), JSON.stringify(triassic, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_jurassic.json'), JSON.stringify(jurassic, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_cretaceous.json'), JSON.stringify(cretaceous, null, 2), 'utf8');
  fs.writeFileSync(path.join(__dirname, '..', 'prisma', 'species_others.json'), JSON.stringify(others, null, 2), 'utf8');

  console.log('✓ Synced updated database records to local JSON files.');
}

applyMasterMap()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
