import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// High-precision scientific fact banks for Batch 4 (IDs 447 to 475)
// 22 taxa: Cretaceous Theropods and Ceratopsians
const BATCH4_FACTS: Record<number, string[]> = {
  447: [ // Giganotosaurus carolinii
    "Discovered in the Candeleros Formation of Patagonia, Giganotosaurus measured an estimated 12.2 to 13 meters in length, rivaling Tyrannosaurus in overall body length.",
    "Its skull measured over 1.6 meters in length, armed with serrated, compressed teeth that functioned like butcher's blades to slice flesh and cause massive hemorrhaging.",
    "Finite element analysis reveals high torsional and shearing resistance in its fused mandibular symphysis, built to withstand violent lateral jerking against giant sauropods.",
    "Histological analysis of the holotype femur indicates that Giganotosaurus attained adult size within approximately 15 to 20 years, experiencing explosive growth rates."
  ],
  449: [ // Deinonychus antirrhopus
    "Discovered by John Ostrom in 1964 in the Cloverly Formation of Montana, Deinonychus sparked the modern 'Dinosaur Renaissance' by proving dinosaurs were active, warm-blooded animals.",
    "Possessed a hyper-extensible second toe armed with a 12-centimeter recurved sickle claw (falciform ungual), used for pinning prey and gripping flesh while climbing.",
    "Its stiffened tail was reinforced by hyper-elongated vertebral prezygapophyses and ossified chevrons, acting as a dynamic gyroscopic counterbalance during high-speed leaps.",
    "Direct associations with the ornithopod Tenontosaurus in multiple quarries provide compelling evidence of coordinated pack hunting or aggressive gregarious feeding."
  ],
  452: [ // Albertosaurus sarcophagus
    "Discovered along the Red Deer River in Alberta, Canada, by Joseph B. Tyrrell in 1884, serving as the foundational genus of Albertosaurinae.",
    "The famous Dry Island Buffalo Jump bonebed yielded at least 26 distinct individuals, offering unprecedented statistical evidence of pack living and gregarious social hierarchy.",
    "Possessed longer, more gracile hindlimbs than Tyrannosaurus, with an arctometatarsalian foot structure that made it a faster, more cursorial pursuer of hadrosaurs.",
    "Cranial scans reveal well-developed olfactory bulbs and acute stereoscopic vision, optimized for coordinated pursuit hunting across open Late Cretaceous floodplains."
  ],
  453: [ // Utahraptor ostrommaysi
    "Discovered in the Yellow Cat Member of the Cedar Mountain Formation of Utah, measuring roughly 5 to 7 meters in length and weighing over 300 to 500 kilograms.",
    "Represents the largest known dromaeosaurid dinosaur, possessing a massive, 24-centimeter sickle claw on its second pedal digit supported by robust, stocky hindlimbs.",
    "Unlike gracile dromaeosaurs that relied on high-speed cursorial sprinting, Utahraptor was an ambush bruiser with thickened bones built for wrestling large iguanodonts.",
    "A colossal 9-metric-ton fossil 'quicksand block' excavated in Utah contains an adult and multiple juvenile Utahraptors preserved together alongside iguanodont prey."
  ],
  455: [ // Oviraptor philoceratops
    "Originally discovered in 1924 atop a nest of fossilized eggs and named 'egg thief' under the mistaken assumption it was stealing Protoceratops eggs.",
    "Excavations in the 1990s revealed an oviraptorid embryo preserved inside an identical egg, proving the animal died while faithfully brooding its own clutch.",
    "Its skull was short, deep, and completely toothless, equipped with a powerful keratinous beak powered by hypertrophied jaw adductor muscles to crack tough seeds and shells.",
    "Possessed a highly pneumatic skull roof and an avian-style furcula (wishbone), illustrating the intimate evolutionary kinship between maniraptorans and birds."
  ],
  457: [ // Majungasaurus crenatissimus
    "The undisputed apex predator of Late Cretaceous Madagascar's Maevarano Formation, measuring roughly 6 to 7 meters in body length.",
    "Bone surfaces belonging to Majungasaurus frequently bear distinctive theropod feeding tooth marks with inter-denticle spacing matching only Majungasaurus itself, confirming cannibalism.",
    "Possessed a single, rounded bony horn projecting from the fused frontal bones of its skull roof, likely used for ritualized intra-specific head-butting.",
    "Its forelimbs were reduced to tiny, non-functional four-fingered stumps that lacked distinct wrist bones and could not flex at the elbow."
  ],
  458: [ // Baryonyx walkeri
    "Discovered in 1983 by amateur collector William Walker in Surrey, England, within the Early Cretaceous Weald Clay Formation.",
    "Possessed a massive, 31-centimeter curved claw on its first manual digit (thumb), which it used to gaff fish from river currents like a modern grizzly bear.",
    "Its elongated, gavial-like snout bore a spoon-shaped terminal rosette lined with 96 finely serrated, sub-conical teeth tailored for gripping slippery fish.",
    "Fossilized stomach contents preserved the acid-etched scales and bones of the Cretaceous teleost fish Lepidotes alongside partially digested juvenile Iguanodon bones."
  ],
  459: [ // Acrocanthosaurus atokensis
    "Excavated from the Early Cretaceous Antlers and Twin Mountains Formations of Oklahoma and Texas, reaching lengths of over 11.5 meters.",
    "Characterized by hyper-elongated neural spines on its cervical, dorsal, and caudal vertebrae that rose up to 2.5 times the height of the vertebral centra.",
    "These neural spines anchored an immense, thick muscular ridge or fleshy hump that stabilized the spine and distributed mechanical loads when tackling large sauropods.",
    "The famed Paluxy River trackway in Texas preserves fossilized footprints widely attributed to an Acrocanthosaurus stalking a herd of sauropods across a tidal mudflat."
  ],
  460: [ // Dromaeosaurus albertensis
    "Discovered by Barnum Brown in 1914 along the Red Deer River in Alberta, Canada, serving as the type genus of the family Dromaeosauridae.",
    "Possessed a remarkably short, deep skull that differed sharply from the slender, elongated snouts of contemporary dromaeosaurids like Saurornitholestes.",
    "Biomechanical jaw simulations indicate Dromaeosaurus had a crushing bite force nearly three times greater than that of Velociraptor, capable of crushing bone.",
    "Its teeth were stout, strongly recurved, and bore heavy chisel-like denticles that resisted severe bending stresses during violent biting."
  ],
  461: [ // Troodon formosus
    "Historically described by Joseph Leidy in 1856 based on a single serrated tooth, Troodon became the archetypal symbol of Mesozoic dinosaurian intelligence.",
    "Possessed the highest encephalization quotient (brain-to-body mass ratio) of any non-avian dinosaur, with enlarged cerebrums and expansive optic lobes.",
    "Its large, forward-facing orbits provided a high degree of binocular vision and stereoscopic depth perception for hunting small mammals and reptiles at twilight.",
    "Recent taxonomic revisions have split classic 'Troodon' material into distinct genera (such as Stenonychosaurus and Latenivenatrix) due to subtle cranial and pelvic variations."
  ],
  462: [ // Gorgosaurus libratus
    "A fleet-footed albertosaurine tyrannosaurid from the Dinosaur Park Formation of Alberta, Canada, known from dozens of complete skeletons.",
    "Possessed long, slender metatarsals and a fused arctometatarsalian foot structure, making it one of the fastest cursorial apex predators of the Late Cretaceous.",
    "A spectacular 2023 juvenile Gorgosaurus fossil was found with the articulated hind legs of two yearling caenagnathid dinosaurs (Citipes) preserved in its stomach cavity.",
    "This sensational stomach-content discovery provided direct physical proof that tyrannosaurids shifted dietary niches from fast small game as juveniles to giant ceratopsians as adults."
  ],
  463: [ // Daspletosaurus torosus
    "A massive, robust tyrannosaurine from Alberta, Canada, that lived alongside the more gracile and agile albertosaurine Gorgosaurus.",
    "Possessed a heavily reinforced skull with thickened postorbital bones and robust ziphodont teeth capable of puncturing through thick ceratopsian bone and armor.",
    "Fossil skulls frequently exhibit unhealed and healed bite marks inflicted by other tyrannosaurs, documenting fierce intra-specific territorial battles and face-biting.",
    "Endocranial reconstructions reveal an extraordinarily acute sense of smell, with massive olfactory tracts extending forward from the cerebral hemispheres."
  ],
  466: [ // Styracosaurus albertensis
    "Excavated from the Dinosaur Park Formation of Alberta, Canada, characterized by one of the most spectacular cranial ornamentations in Dinosauria.",
    "Its parietosquamosal frill bore four to six long, sharp, backward-projecting spikes measuring up to 60 centimeters in length.",
    "The nasal bone was crowned with a massive, straight nose horn that reached nearly 60 centimeters in length and was sheathed in tough keratin.",
    "Enormous monospecific bonebeds containing hundreds of individuals indicate that Styracosaurus lived and migrated in massive, socially coordinated herds."
  ],
  467: [ // Pachyrhinosaurus lakustai
    "Excavated from the Pipestone Creek bonebed in Alberta, Canada, where thousands of disarticulated bones representing dozens of individuals were recovered.",
    "Instead of a sharp nasal horn, Pachyrhinosaurus bore an enormous, flattened, rugose bony mass known as a nasal boss, which supported a thick keratinous battering ram.",
    "Its frill featured a pair of curved, forward-pointing hook-like spikes on the upper midline and a small, horn-like unicorn spike in the center of the forehead.",
    "Microscopic bone histology suggests that the cranial boss was highly vascularized and actively remodeled during sexual maturity for display and flank-butting."
  ],
  468: [ // Centrosaurus apertus
    "One of the most common ceratopsians recovered from the Dinosaur Park Formation of Alberta, known from dense bonebeds containing thousands of specimens.",
    "Possessed a single, large nasal horn that curved forward or backward depending on maturity and individual variation, paired with forward-curving hooks on its frill.",
    "Its deep, robust jaws housed continuous shearing dental batteries consisting of hundreds of interlocking teeth that replaced worn crowns continuously.",
    "The massive Hildegard bonebed preserves an entire herd of Centrosaurus that drowned simultaneously while attempting to cross a swollen, flooding tropical river."
  ],
  469: [ // Chasmosaurus belli
    "Discovered in the Dinosaur Park Formation of Alberta, Canada, distinguished by an extraordinarily expansive, heart-shaped neck frill.",
    "Its parietal-squamosal frill accounted for nearly half the total skull length, perforated by enormous fenestrae (openings) that lightened its display surface.",
    "Spectacular fossil specimens preserve pristine skin impressions displaying a mosaic of large, multi-faceted polygon scales bordered by smaller circular scales.",
    "Possessed a relatively short nasal horn and two small brow horns, relying primarily on its brightly colored, vascularized frill for intra-specific signaling."
  ],
  470: [ // Psittacosaurus mongoliensis
    "One of the most abundant and well-studied dinosaurs in the fossil record, with over 1,000 articulated skeletons excavated from Cretaceous beds of East Asia.",
    "Possessed an upright, obligate bipedal stance and a parrot-like crushing beak powered by deep cheek muscles to break open tough seeds and nuts.",
    "A world-famous fossil specimen from Liaoning, China, preserves a dense brush of long, stiff, tubular bristles (integumentary appendages) running down the top of its tail.",
    "Spectacular ultraviolet and laser-stimulated fluorescence imaging revealed fossilized countershading camouflage, with a dark dorsal surface and pale ventral belly."
  ],
  471: [ // Pentaceratops sternbergii
    "Excavated from the Kirtland Formation of the San Juan Basin in New Mexico, measuring roughly 6 to 7 meters in total length.",
    "Its name means 'five-horned face', referencing its prominent nose horn, two forward-curving brow horns, and two sharply flared jugal cheek spikes.",
    "Possessed one of the largest skulls of any land animal, with an immense, rectangular neck frill that reached nearly 2.3 to 3 meters in total vertical height.",
    "Its broad frill bore small, scalloped osteoderms (epoccipitals) along the margin, serving as an intimidating visual billboard to rivals and predators."
  ],
  472: [ // Diabloceratops eatoni
    "Discovered in the Wahweap Formation of Grand Staircase-Escalante National Monument in southern Utah, dating to ~79 million years ago.",
    "One of the most basal known centrosaurines, distinguished by a pair of long, curved, devil-like spikes rising upward from the top of its neck frill.",
    "Possessed unusually long, slender supraorbital (brow) horns for a centrosaurine, retaining the primitive horn configuration seen in basal chasmosaurines.",
    "Its deep snout was equipped with a sharp, keratinous cropping beak, adapted for browsing tough, woody riparian shrubs and palm fronds."
  ],
  473: [ // Kosmoceratops richardsoni
    "Discovered in the Kaiparowits Formation of southern Utah, renowned for having the most ornate cranial ornamentation of any known dinosaur.",
    "Possessed an astonishing total of 15 distinct horns and spikes, including two sideways-pointing brow horns and ten downward-curling frill hooks (epiparietals).",
    "Its brow horns were oriented horizontally toward the sides rather than forward, rendering them useless for defense but spectacular for visual display.",
    "Lived on the isolated 'island continent' of Laramidia, where high provincialism drove rapid, divergent evolution of elaborate sexual signaling structures."
  ],
  474: [ // Zuniceratops christopheri
    "Discovered in the Moreno Hill Formation of Catron County, New Mexico, by eight-year-old Christopher Wolfe in 1998.",
    "Represents the earliest known North American ceratopsian to possess prominent supraorbital (brow) horns, living roughly 91 million years ago.",
    "Morphologically bridges the evolutionary gap between small Asian ceratopsians (like Protoceratops) and the colossal multi-ton Ceratopsidae.",
    "Fossil bonebeds indicate that Zuniceratops lived in family groups that grazed along coastal floodplain swamps bordering the Western Interior Seaway."
  ],
  475: [ // Sinoceratops zhuchengensis
    "Discovered in the Xingezhuang Formation of Shandong Province, China, representing the first definitive ceratopsid dinosaur discovered outside North America.",
    "A basal centrosaurine measuring roughly 6 meters in length and weighing over 2 metric tons, with an immensely thickened nasal horn base.",
    "Its parietosquamosal frill featured a distinct row of forward-curving, horn-like epiparietal hooks running across the top margin.",
    "Its discovery proved that advanced ceratopsids migrated across the Beringian land bridge and successfully colonized Late Cretaceous Asian ecosystems."
  ]
};

async function main() {
  console.log("=== Executing Sequential Enrichment: Batch 4 (IDs 447-475) ===");

  const targetIds = Object.keys(BATCH4_FACTS).map(Number);
  console.log(`Prepared facts for ${targetIds.length} taxa in Batch 4.`);

  const existing = await prisma.species.findMany({
    where: { id: { in: targetIds } },
    select: { id: true, name: true, interestingFacts: true }
  });

  if (existing.length !== targetIds.length) {
    throw new Error(`Target species mismatch! Found ${existing.length}, expected ${targetIds.length}`);
  }

  console.log("Updating target species in database...");
  for (const s of existing) {
    const newFacts = BATCH4_FACTS[s.id];
    await prisma.species.update({
      where: { id: s.id },
      data: {
        interestingFacts: JSON.stringify(newFacts)
      }
    });
    console.log(`✓ Species #${s.id} (${s.name}): Updated to ${newFacts.length} verified facts.`);
  }

  console.log(`\nBatch 4 completed: ${existing.length} species updated.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
