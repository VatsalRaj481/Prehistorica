import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient, Clade } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface SpeciesCorrection {
  id: number;
  scientificName: string;
  nameMeaning: string;
  clade: Clade;
}

const CORRECTIONS: Record<number, SpeciesCorrection> = {
  50: { id: 50, scientificName: "Lisowicia bojani", nameMeaning: "From Lisowice (honoring Ludwig Heinrich Bojanus)", clade: Clade.Early_Mammal_Synapsid },
  51: { id: 51, scientificName: "Cynognathus crateronotus", nameMeaning: "Dog jaw", clade: Clade.Early_Mammal_Synapsid },
  52: { id: 52, scientificName: "Thrinaxodon liorhinus", nameMeaning: "Trident tooth", clade: Clade.Early_Mammal_Synapsid },
  53: { id: 53, scientificName: "Shonisaurus popularis", nameMeaning: "Lizard from the Shoshone Mountains", clade: Clade.Marine_Reptile },
  54: { id: 54, scientificName: "Cymbospondylus petrinus", nameMeaning: "Boat vertebra", clade: Clade.Marine_Reptile },
  55: { id: 55, scientificName: "Peteinosaurus zambellii", nameMeaning: "Winged lizard", clade: Clade.Pterosaur },
  60: { id: 60, scientificName: "Eodromaeus murphi", nameMeaning: "Dawn runner", clade: Clade.Theropod },
  61: { id: 61, scientificName: "Nyasasaurus parringtoni", nameMeaning: "Lake Nyasa lizard", clade: Clade.Archosauriform },
  62: { id: 62, scientificName: "Procompsognathus triassicus", nameMeaning: "Before elegant jaw", clade: Clade.Theropod },
  63: { id: 63, scientificName: "Liliensternus liliensterni", nameMeaning: "Hugo Rühle von Lilienstern's reptile", clade: Clade.Theropod },
  64: { id: 64, scientificName: "Halticosaurus longotarsus", nameMeaning: "Nimble lizard", clade: Clade.Theropod },
  65: { id: 65, scientificName: "Gojirasaurus quayi", nameMeaning: "Godzilla lizard", clade: Clade.Theropod },
  66: { id: 66, scientificName: "Zupaysaurus rougieri", nameMeaning: "Devil lizard", clade: Clade.Theropod },
  67: { id: 67, scientificName: "Thecodontosaurus antiquus", nameMeaning: "Socket-toothed lizard", clade: Clade.Sauropodomorph },
  68: { id: 68, scientificName: "Riojasaurus incertus", nameMeaning: "La Rioja lizard", clade: Clade.Sauropodomorph },
  70: { id: 70, scientificName: "Isanosaurus attavipachi", nameMeaning: "Isan lizard (Northeastern Thailand)", clade: Clade.Sauropodomorph },
  72: { id: 72, scientificName: "Antetonitrus ingenipes", nameMeaning: "Before the thunder", clade: Clade.Sauropodomorph },
  73: { id: 73, scientificName: "Lessemsaurus sauropoides", nameMeaning: "Don Lessem's lizard", clade: Clade.Sauropodomorph },
  74: { id: 74, scientificName: "Mussaurus patagonicus", nameMeaning: "Mouse lizard", clade: Clade.Sauropodomorph },
  75: { id: 75, scientificName: "Coloradisaurus brevis", nameMeaning: "Los Colorados lizard", clade: Clade.Sauropodomorph },
  79: { id: 79, scientificName: "Guaibasaurus candelariensis", nameMeaning: "Guaíba hydrographic basin lizard", clade: Clade.Sauropodomorph },
  80: { id: 80, scientificName: "Silesaurus opolensis", nameMeaning: "Silesian lizard", clade: Clade.Silesaurid },
  81: { id: 81, scientificName: "Asilisaurus kongwe", nameMeaning: "Ancestor lizard", clade: Clade.Silesaurid },
  82: { id: 82, scientificName: "Marasuchus lilloensis", nameMeaning: "Mara crocodile", clade: Clade.Archosauriform },
  83: { id: 83, scientificName: "Lagerpeton chanarensis", nameMeaning: "Hare reptile", clade: Clade.Archosauriform },
  84: { id: 84, scientificName: "Ixalerpeton polesinensis", nameMeaning: "Leaping reptile", clade: Clade.Archosauriform },
  85: { id: 85, scientificName: "Dromomeron romeri", nameMeaning: "Running thigh", clade: Clade.Archosauriform },
  86: { id: 86, scientificName: "Euparkeria capensis", nameMeaning: "Parker's true animal", clade: Clade.Archosauriform },
  87: { id: 87, scientificName: "Proterosuchus fergusi", nameMeaning: "Early crocodile", clade: Clade.Archosauriform },
  88: { id: 88, scientificName: "Erythrosuchus africanus", nameMeaning: "Red crocodile", clade: Clade.Archosauriform },
  89: { id: 89, scientificName: "Garjainia prima", nameMeaning: "Garjainov's reptile", clade: Clade.Archosauriform },
  90: { id: 90, scientificName: "Vjushkovia triassica", nameMeaning: "Vjushkov's reptile", clade: Clade.Archosauriform },
  91: { id: 91, scientificName: "Ticinosuchus ferox", nameMeaning: "Ticino crocodile", clade: Clade.Rauisuchian },
  93: { id: 93, scientificName: "Fasolasuchus tenax", nameMeaning: "Fasola's crocodile", clade: Clade.Rauisuchian },
  94: { id: 94, scientificName: "Prestosuchus chiniquensis", nameMeaning: "Presto's crocodile", clade: Clade.Rauisuchian },
  95: { id: 95, scientificName: "Batrachotomus kupferzellensis", nameMeaning: "Frog slayer / Frog slicer", clade: Clade.Rauisuchian },
  96: { id: 96, scientificName: "Ornithosuchus woodwardi", nameMeaning: "Bird crocodile", clade: Clade.Archosauriform },
  98: { id: 98, scientificName: "Smilosuchus gregorii", nameMeaning: "Chisel crocodile", clade: Clade.Phytosaur },
  99: { id: 99, scientificName: "Phytosaurus cylindricodon", nameMeaning: "Plant lizard", clade: Clade.Phytosaur },
  100: { id: 100, scientificName: "Machaeroprosopus buceros", nameMeaning: "Dagger face", clade: Clade.Phytosaur },
  101: { id: 101, scientificName: "Leptosuchus crosbiensis", nameMeaning: "Slender crocodile", clade: Clade.Phytosaur },
  102: { id: 102, scientificName: "Redondasaurus bermani", nameMeaning: "Redonda Formation lizard", clade: Clade.Phytosaur },
  103: { id: 103, scientificName: "Mystriosuchus planirostris", nameMeaning: "Spoon crocodile", clade: Clade.Phytosaur },
  105: { id: 105, scientificName: "Stagonolepis robertsoni", nameMeaning: "Drop scale", clade: Clade.Aetosaur },
  106: { id: 106, scientificName: "Aetosaurus ferratus", nameMeaning: "Eagle lizard", clade: Clade.Aetosaur },
  107: { id: 107, scientificName: "Neoaetosauroides engaeus", nameMeaning: "New eagle lizard form", clade: Clade.Aetosaur },
  108: { id: 108, scientificName: "Longosuchus meadei", nameMeaning: "Longo's crocodile", clade: Clade.Aetosaur },
  109: { id: 109, scientificName: "Gracilisuchus stipanicicorum", nameMeaning: "Graceful crocodile", clade: Clade.Archosauriform },
  110: { id: 110, scientificName: "Erpetosuchus granti", nameMeaning: "Creeping crocodile", clade: Clade.Archosauriform },
  111: { id: 111, scientificName: "Saltoposuchus connectens", nameMeaning: "Leaping foot crocodile", clade: Clade.Crocodylomorph },
  112: { id: 112, scientificName: "Terrestrisuchus gracilis", nameMeaning: "Land crocodile", clade: Clade.Crocodylomorph },
  113: { id: 113, scientificName: "Hesperosuchus agilis", nameMeaning: "Western crocodile", clade: Clade.Crocodylomorph },
  114: { id: 114, scientificName: "Sphenosuchus acutus", nameMeaning: "Wedge crocodile", clade: Clade.Crocodylomorph },
  115: { id: 115, scientificName: "Protosuchus richardsoni", nameMeaning: "First crocodile", clade: Clade.Crocodylomorph },
  116: { id: 116, scientificName: "Effigia okeeffeae", nameMeaning: "Ghost / Effigy", clade: Clade.Poposauroid },
  117: { id: 117, scientificName: "Shuvosaurus inexpectatus", nameMeaning: "Shuvo's lizard", clade: Clade.Poposauroid },
  119: { id: 119, scientificName: "Lotosaurus adentus", nameMeaning: "Lotus lizard", clade: Clade.Poposauroid },
  120: { id: 120, scientificName: "Arizonasaurus babbitti", nameMeaning: "Arizona lizard", clade: Clade.Poposauroid },
  121: { id: 121, scientificName: "Sillosuchus sangregorioensis", nameMeaning: "Sill's crocodile", clade: Clade.Poposauroid },
  122: { id: 122, scientificName: "Sharovipteryx mirabilis", nameMeaning: "Sharov's wing", clade: Clade.Protorosaur },
  123: { id: 123, scientificName: "Longisquama insignis", nameMeaning: "Long scale", clade: Clade.Archosauriform },
  124: { id: 124, scientificName: "Tanystropheus longobardicus", nameMeaning: "Long vertebra", clade: Clade.Protorosaur },
  125: { id: 125, scientificName: "Macrocnemus bassanii", nameMeaning: "Long shin", clade: Clade.Protorosaur },
  126: { id: 126, scientificName: "Dinocephalosaurus orientalis", nameMeaning: "Terrible-headed lizard of the Orient", clade: Clade.Protorosaur },
  127: { id: 127, scientificName: "Placodus gigas", nameMeaning: "Flat tooth", clade: Clade.Marine_Reptile },
  128: { id: 128, scientificName: "Cyamodus rostratus", nameMeaning: "Bean tooth", clade: Clade.Marine_Reptile },
  129: { id: 129, scientificName: "Henodus chelyops", nameMeaning: "Single tooth / Turtle face", clade: Clade.Marine_Reptile },
  130: { id: 130, scientificName: "Nothosaurus mirabilis", nameMeaning: "False lizard", clade: Clade.Marine_Reptile },
  131: { id: 131, scientificName: "Lariosaurus balsami", nameMeaning: "Larius (Lake Como) lizard", clade: Clade.Marine_Reptile },
  132: { id: 132, scientificName: "Ceresiosaurus calcagnii", nameMeaning: "Ceresio (Lake Lugano) lizard", clade: Clade.Marine_Reptile },
  133: { id: 133, scientificName: "Pistosaurus longaevus", nameMeaning: "Pure lizard", clade: Clade.Marine_Reptile },
  134: { id: 134, scientificName: "Simosaurus gaillardoti", nameMeaning: "Snub-nosed lizard", clade: Clade.Marine_Reptile },
  135: { id: 135, scientificName: "Mixosaurus cornalianus", nameMeaning: "Mixed lizard", clade: Clade.Marine_Reptile },
  136: { id: 136, scientificName: "Besanosaurus leptorhynchus", nameMeaning: "Besano lizard", clade: Clade.Marine_Reptile },
  137: { id: 137, scientificName: "Shastasaurus pacificus", nameMeaning: "Mount Shasta lizard", clade: Clade.Marine_Reptile },
  138: { id: 138, scientificName: "Guanlingsaurus liangae", nameMeaning: "Guanling lizard", clade: Clade.Marine_Reptile },
  139: { id: 139, scientificName: "Eudimorphodon ranzii", nameMeaning: "True dimorphic tooth", clade: Clade.Pterosaur },
  140: { id: 140, scientificName: "Preondactylus buffarinii", nameMeaning: "Preone finger", clade: Clade.Pterosaur },
  141: { id: 141, scientificName: "Austriadactylus cristatus", nameMeaning: "Austrian finger", clade: Clade.Pterosaur },
  142: { id: 142, scientificName: "Caviramus schesaplanensis", nameMeaning: "Hollow branch", clade: Clade.Pterosaur },
};

async function run() {
  console.log('=== STARTING CONTROLLED MIGRATION FOR 80 TRIASSIC SPECIES ===');
  console.log('🔒 Step 1: Capturing pre-migration media snapshot across all 502 species...');
  
  const allInitial = await prisma.species.findMany({
    select: { id: true, name: true, media: true },
    orderBy: { id: 'asc' }
  });

  const mediaSnapshot = new Map<number, string>();
  for (const s of allInitial) {
    const hash = crypto.createHash('sha256').update(s.media || '').digest('hex');
    mediaSnapshot.set(s.id, hash);
  }
  console.log(`✅ Media snapshot recorded for ${allInitial.length} species.`);

  console.log('\n📝 Step 2: Applying scientificName, nameMeaning, clade, and taxonomy updates...');
  let updatedCount = 0;

  for (const [idStr, corr] of Object.entries(CORRECTIONS)) {
    const id = Number(idStr);
    const existing = await prisma.species.findUnique({ where: { id } });
    if (!existing) {
      console.warn(`⚠️ Warning: Species #${id} not found in DB!`);
      continue;
    }

    let updatedTaxonomy = existing.taxonomy;
    if (existing.taxonomy) {
      try {
        const taxObj = JSON.parse(existing.taxonomy);
        taxObj.species = corr.scientificName;
        taxObj.genus = corr.scientificName.split(' ')[0] || taxObj.genus;
        taxObj.clade = corr.clade;
        updatedTaxonomy = JSON.stringify(taxObj);
      } catch {}
    }

    // UPDATE ONLY targeted fields — NEVER touch media
    await prisma.species.update({
      where: { id },
      data: {
        scientificName: corr.scientificName,
        nameMeaning: corr.nameMeaning,
        clade: corr.clade,
        taxonomy: updatedTaxonomy
      }
    });

    updatedCount++;
    console.log(`[${updatedCount}/80] Updated #${id} ${existing.name} -> ${corr.scientificName} | "${corr.nameMeaning}" | Clade: ${corr.clade}`);
  }

  console.log(`\n🔍 Step 3: Verifying media integrity across all 502 species...`);
  const allPost = await prisma.species.findMany({
    select: { id: true, name: true, media: true },
    orderBy: { id: 'asc' }
  });

  let mediaViolations = 0;
  for (const s of allPost) {
    const preHash = mediaSnapshot.get(s.id);
    const postHash = crypto.createHash('sha256').update(s.media || '').digest('hex');
    if (preHash !== postHash) {
      console.error(`❌ MEDIA INTEGRITY VIOLATION on #${s.id} ${s.name}!`);
      mediaViolations++;
    }
  }

  if (mediaViolations > 0) {
    throw new Error(`CRITICAL: ${mediaViolations} species suffered media corruption during migration!`);
  }

  console.log(`✅ 100% MEDIA INTEGRITY VERIFIED: All 502 species' media records are completely unchanged.`);

  console.log('\n📄 Step 4: Synchronizing species_triassic.json seed file...');
  const jsonPath = path.resolve(process.cwd(), 'prisma/species_triassic.json');
  if (fs.existsSync(jsonPath)) {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const jsonList = JSON.parse(rawData);

    for (const item of jsonList) {
      if (CORRECTIONS[item.id]) {
        const c = CORRECTIONS[item.id];
        item.scientificName = c.scientificName;
        item.nameMeaning = c.nameMeaning;
        item.clade = c.clade;
        if (item.taxonomy) {
          try {
            const t = typeof item.taxonomy === 'string' ? JSON.parse(item.taxonomy) : item.taxonomy;
            t.species = c.scientificName;
            t.genus = c.scientificName.split(' ')[0] || t.genus;
            t.clade = c.clade;
            item.taxonomy = typeof item.taxonomy === 'string' ? JSON.stringify(t) : t;
          } catch {}
        }
      }
    }

    fs.writeFileSync(jsonPath, JSON.stringify(jsonList, null, 2), 'utf8');
    console.log(`✅ species_triassic.json synchronized successfully!`);
  }

  console.log('\n🎉 ALL 80 SPECIES SUCCESSFULLY UPDATED WITH ZERO MEDIA IMPACT!');
}

run()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
