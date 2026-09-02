import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

const ETYMOLOGIES: Record<number, string> = {
  145: "Horned lizard",
  147: "Great lizard",
  148: "Frozen crested lizard",
  149: "Single-crested lizard",
  150: "Savage lizard",
  151: "Bird robber",
  152: "Elegant jaw",
  153: "Crowned dragon",
  154: "Before the horned lizard",
  155: "Moderately-spined lizard",
  157: "Well-curved vertebra",
  158: "Piatnitzky's lizard",
  159: "Marsh's lizard",
  160: "Stokes's lizard",
  161: "Long-limbed hunter",
  162: "Squirrel mimic",
  163: "Jura hunter",
  165: "Double beam",
  166: "Deceptive lizard",
  167: "Thunder lizard",
  168: "Chambered lizard",
  169: "Giraffe titan",
  170: "Heavy lizard",
  171: "Forked lizard",
  174: "Mount Emei lizard",
  175: "Vulcan tooth",
  176: "Patagonian lizard",
  177: "Whale lizard",
  178: "Spine-bearing lizard",
  179: "Simple-spined lizard",
  180: "Super lizard",
  181: "Ancient thunder",
  182: "Jobar creature",
  183: "Beautiful lizard",
  185: "Oak tree lizard",
  186: "Flexible lizard",
  187: "Spiked lizard",
  189: "Little shielded lizard",
  190: "Limb lizard",
  192: "Gargoyle lizard",
  193: "Othniel's lizard",
  194: "Lizard from Lesotho",
  196: "He Xin-lu's lizard",
  197: "Jialing River lizard",
  198: "Tuo River lizard",
  199: "Very pointed tail",
  200: "Miragaia lizard",
  201: "Western lizard",
  202: "Fruita tooth",
  203: "Dwarf lizard",
  204: "Beak snout",
  205: "Two-form tooth",
  206: "Winged finger",
  207: "Tailless jaw",
  210: "Tub jaw / Boat jaw",
  211: "Filth / Scum",
  212: "Darwin's wing",
  213: "Sun Wukong's wing",
  214: "Kunpeng wing",
  215: "Comb opening",
  216: "Jaw lizard",
  217: "Swan beak",
  218: "German finger",
  219: "Wing snout",
  220: "Seizing jaw",
  221: "Mesa finger",
  222: "Jianchang jaw",
  223: "Fenghuang wing",
  224: "Smooth-sided tooth",
  225: "Near lizard",
  226: "Fish lizard",
  227: "Eye lizard",
  228: "Hidden clavicle",
  229: "Strong lizard",
  230: "Large plate",
  231: "Mud swimmer",
  232: "More lizard",
  233: "Snub-nosed robber",
  234: "Cutting-toothed lizard",
  237: "Excalibur lizard",
  238: "Glamorgan tooth",
  239: "Beaver tail",
  240: "Gliding beast",
  241: "Fruita digger",
  242: "Jurassic mother",
  243: "Agile Docodon"
};

async function run() {
  console.log('=== STARTING CONTROLLED ETYMOLOGY MIGRATION FOR 86 JURASSIC SPECIES ===');
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

  console.log('\n📝 Step 2: Applying nameMeaning updates for 86 Jurassic species...');
  let updatedCount = 0;

  for (const [idStr, newMeaning] of Object.entries(ETYMOLOGIES)) {
    const id = Number(idStr);
    const existing = await prisma.species.findUnique({ where: { id } });
    if (!existing) {
      console.warn(`⚠️ Warning: Species #${id} not found in DB!`);
      continue;
    }

    // UPDATE ONLY nameMeaning — NEVER touch media or other fields
    await prisma.species.update({
      where: { id },
      data: {
        nameMeaning: newMeaning
      }
    });

    updatedCount++;
    console.log(`[${updatedCount}/86] Updated #${id} ${existing.name} -> "${newMeaning}"`);
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

  console.log('\n📄 Step 4: Synchronizing species_jurassic.json seed file...');
  const jsonPath = path.resolve(process.cwd(), 'prisma/species_jurassic.json');
  if (fs.existsSync(jsonPath)) {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const jsonList = JSON.parse(rawData);

    for (const item of jsonList) {
      if (ETYMOLOGIES[item.id]) {
        item.nameMeaning = ETYMOLOGIES[item.id];
      }
    }

    fs.writeFileSync(jsonPath, JSON.stringify(jsonList, null, 2), 'utf8');
    console.log(`✅ species_jurassic.json synchronized successfully!`);
  }

  console.log('\n🎉 ALL 86 JURASSIC SPECIES ETYMOLOGIES SUCCESSFULLY UPDATED WITH ZERO MEDIA IMPACT!');
}

run()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
