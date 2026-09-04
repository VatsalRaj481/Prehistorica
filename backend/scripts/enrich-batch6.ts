import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// High-precision scientific fact banks for Batch 6 (20 taxa)
// Paleozoic, Cenozoic, and Asian fauna: Cambrian, Devonian, Permian, Paleogene, Pleistocene, and Indian Cretaceous
const BATCH6_FACTS: Record<number, string[]> = {
  567: [ // Pikaia gracilens
    "Discovered in 1911 by Charles Doolittle Walcott in the Middle Cambrian Burgess Shale of British Columbia, Canada.",
    "Preserved with a well-defined, flexible dorsal notochord and repeating, V-shaped zig-zag muscle blocks (myomeres), identifying it as a foundational stem-chordate.",
    "Possessed a distinct cephalic head end with a pair of delicate sensory tentacles, swimming via sinusoidal undulations powered by its ribbon-like caudal fin.",
    "Represents one of the earliest known evolutionary ancestors of the entire vertebrate subphylum, bridging invertebrate deuterostomes to primitive craniates."
  ],
  568: [ // Wiwaxia corrugata
    "Discovered in the Burgess Shale, Wiwaxia was a bizarre, slug-like bilaterian reaching roughly 5 centimeters in length.",
    "Its soft body was completely covered by overlapping, ribbed organic armor scales (sclerites) alongside two parallel rows of long, upward-curving defensive spines.",
    "Possessed a ventral feeding apparatus equipped with two to three rows of conical chitinous teeth, functioning like a primitive molluscan radula.",
    "Microscopic examination of the sclerite surfaces revealed microscopic diffraction gratings that created an iridescent, metallic rainbow sheen in Cambrian sunlight."
  ],
  569: [ // Bothriolepis canadensis
    "One of the most widely distributed placoderms in Earth's history, with articulated fossils discovered in Devonian sediments across every modern continent.",
    "Its thoracic armor was articulated to a pair of unique, jointed, hollow, bony pectoral appendages (arms) that functioned like crab-like walking flippers or sediment anchors.",
    "Possessed specialized ventral pharyngeal pouches that some paleobiologists interpret as primitive paired lungs, allowing it to gulp atmospheric oxygen in stagnant waters.",
    "High-resolution synchrotron imaging reveals that Bothriolepis fed by ingesting nutrient-rich mud, sifting organic detritus through a fine internal gill-raker system."
  ],
  570: [ // Eusthenopteron foordi
    "Discovered in exceptional, three-dimensional limestone concretions in the Late Devonian Escuminac Formation of Miguasha, Quebec, Canada.",
    "An iconic 'lobe-finned' tetrapodomorph fish that possessed the internal humerus, radius, and ulna in the forelimb, and femur, tibia, and fibula in the hindlimb.",
    "Its skull was divided by an intracranial joint, allowing the snout to flex upward relative to the braincase during explosive lunges at prey.",
    "Possessed teeth with complex labyrinthodont internal enamel folding, establishing the direct anatomical evolutionary transition from lobe-fins to early four-limbed tetrapods."
  ],
  571: [ // Hylonomus lyelli
    "Discovered in 1852 by Sir William Dawson preserved inside petrified lycopsid tree stumps (Sigillaria) in the Carboniferous Joggins Fossil Cliffs of Nova Scotia.",
    "Represents the earliest confirmed amniote in the fossil record (~315 Ma), having evolved the revolutionary cleidoic (shelled) egg that freed vertebrates from aquatic reproduction.",
    "Its skull lacked temporal fenestrae (anapsid condition) and was armed with small, sharp, peg-like teeth adapted for piercing the chitinous armor of Carboniferous millipedes and insects.",
    "Possessed slender, lizard-like proportions with clawed digits and flexible wrist joints, allowing agile scurrying across Carboniferous coal swamp floors."
  ],
  572: [ // Diplocaulus magnicornis
    "Discovered in the Early Permian Red Beds of Texas, measuring roughly 1 meter in length, famous for its colossal boomerang-shaped skull.",
    "The massive lateral horns of its skull were formed by hyper-elongated tabular and squamosal bones, functioning as dynamic hydrodynamic lifting hydrofoils.",
    "Biomechanical flume tests reveal that water flowing across the boomerang skull generated substantial vertical lift, allowing Diplocaulus to shoot upward to ambush prey.",
    "Its nostrils were located on the dorsal surface of the head, and its eyes faced straight upward, indicating a benthic ambush predator lying concealed in river mud."
  ],
  573: [ // Estemmenosuchus uralensis
    "Excavated from the Middle Permian Ocher Assemblage of Perm Krai, Russia, measuring roughly 3 to 4.5 meters in length and weighing over 1 metric ton.",
    "Its massive skull was crowned by an elaborate array of bony horns, including moose-like upward flaring antlers on the frontals and bulging lateral bosses on the cheeks.",
    "Possessed an eclectic heterodont dentition featuring sharp, conical incisors, colossal predatory canine tusks, and small, serrated postcanine teeth for grinding plants.",
    "Histological analysis of exceptional Russian specimens preserves impressions of smooth, glandular skin that lacked reptilian scales, foreshadowing synapsid glandular skin."
  ],
  574: [ // Andrewsarchus mongoliensis
    "Discovered in 1923 by Kan Chuen Pao during Roy Chapman Andrews' American Museum of Natural History expedition to the Irdin Manha Formation of Inner Mongolia.",
    "The holotype skull measures an astonishing 83 centimeters in length and 56 centimeters wide, making it one of the largest terrestrial carnivorous mammals known.",
    "Historically classified as a mesonychid, recent phylogenetic analyses place Andrewsarchus as a basal artiodactyl, closely related to entelodonts ('hell pigs') and hippos.",
    "Its blunt, robust premolars and heavily worn molars were built for immense crushing power, capable of splintering thick bone, crushing turtles, and tearing carrion."
  ],
  575: [ // Uintatherium anceps
    "Discovered in the Middle Eocene Bridger Formation of Wyoming and Utah, Uintatherium was a colossal, rhinoceros-sized dinoceratan herbivore.",
    "Its bizarre skull featured three distinct pairs of knobby, skin-covered bony ossicones (horns) on the snout, forehead, and cheeks, alongside a deep concave cranial bowl.",
    "Adult males possessed enormous, saber-like upper canine tusks that were protected when the mouth was closed by deep, downturned bony flanges on the lower jaw.",
    "Despite its 4-meter body length and 2-metric-ton bulk, its brain cavity was remarkably small, smaller than that of a modern domestic dog."
  ],
  576: [ // Paraceratherium transouralicum
    "Discovered throughout the Oligocene floodplains of Central Asia, Paraceratherium was the largest land mammal ever to walk the Earth, reaching 7.4 meters in length.",
    "Stood roughly 4.8 meters tall at the shoulder with an estimated body mass of 15 to 20 metric tons, easily browsing canopy branches 7 meters above the ground.",
    "Possessed a pair of downward-pointing, chisel-like upper incisors that worked against forward-pointing lower incisors to strip bark and shear tough desert shrubs.",
    "Its three-toed, columnar limbs lacked collarbones (clavicles), and its cervical vertebrae were lightened by deep lateral excavations to support its elongated neck."
  ],
  577: [ // Elasmotherium sibiricum
    "Known as the 'Siberian Unicorn', Elasmotherium was a colossal Pleistocene rhinoceros of the Eurasian steppe, surviving until roughly 39,000 years ago.",
    "Its forehead was dominated by a massive, domed, highly vascularized bony boss on the frontal bone that supported a single, gigantic keratinous horn up to 2 meters long.",
    "Possessed hyper-hypsodont (high-crowned) molar teeth with complex prismatic enamel folds that continuously ground abrasive, dust-covered steppe grasses.",
    "Late Pleistocene cave paintings in Rouffignac and Kapova caves in the Ural Mountains depict Elasmotherium with its distinctive, hump-backed unicorn profile."
  ],
  578: [ // Titanoboa cerrejonensis
    "Discovered in 2009 in the open-cast coal mines of the Cerrejón Formation in La Guajira, Colombia, dating to the middle Paleocene (~58-60 Ma).",
    "Measuring an estimated 12.8 to 14.3 meters in length and weighing over 1.1 metric tons, Titanoboa is the largest snake ever documented in Earth's history.",
    "Calculations based on poikilothermic reptile metabolic limits indicate that supporting a snake of Titanoboa's mass required an equatorial mean annual temperature of 30°C to 34°C.",
    "Its tooth anatomy and skull structure indicate that Titanoboa was specialized for hunting giant aquatic prey, constricting colossal dyrosaurid crocodiles and giant pelomedusid turtles."
  ],
  579: [ // Moeritherium lyonsi
    "Discovered in the Late Eocene to Early Oligocene Qasr el Sagha Formation of the Fayum Depression, Egypt, measuring roughly 70 centimeters tall and 2 meters long.",
    "A foundational stem-proboscidean that possessed an amphibious, tapir-like or pygmy-hippo-like semi-aquatic ecology in lush mangrove swamps.",
    "Its upper and lower second incisors were enlarged into incipient, chisel-like tusks, while its elongated upper lip and nose formed a prehensile, mobile snout.",
    "Stable oxygen isotope values in its tooth enamel match those of fully aquatic mammals, confirming that ancestral elephants spent most of their lives submerged in water."
  ],
  844: [ // Stygimoloch spinifer
    "Excavated from the Hell Creek Formation of Montana and Wyoming, dating to the latest Maastrichtian stage (~66 million years ago).",
    "Characterized by a narrow, reduced frontoparietal dome surrounded by a dramatic cluster of three to four long, horn-like spikes measuring up to 10 centimeters.",
    "In 2009, paleontologists Jack Horner and Mark Goodwin presented extensive histological evidence proposing that Stygimoloch represents a subadult ontogenetic stage of Pachycephalosaurus.",
    "Bone cross-sections show high levels of active cranial remodeling, where juvenile horns were reabsorbed and incorporated into the expanding adult dome as the animal matured."
  ],
  845: [ // Dracorex hogwartsia
    "Discovered in the Hell Creek Formation of South Dakota in 2004 by amateur collectors and named in honor of the fictional Hogwarts school from J.K. Rowling's Harry Potter books.",
    "Possessed a completely flat skull roof that lacked a developed dome, adorned with an elaborate crown of sharp, symmetrical spikes and nodes across the squamosals.",
    "Microscopic histological analysis of the flat skull showed open cranial sutures and juvenile vascularization, supporting its classification as the juvenile form of Pachycephalosaurus.",
    "Possessed small, serrated premaxillary teeth and a sharp keratinous beak, specialized for browsing high-quality herbs, roots, and fruits."
  ],
  882: [ // Rajasaurus narmadensis
    "Discovered in 1983 by Suresh Srivastava in the Lameta Formation of Gujarat, western India, along the banks of the Narmada River; its name means 'princely lizard of Narmada'.",
    "Possessed a prominent, rounded horn core on the midline of its skull roof formed by the fused frontal bones, utilized for intra-specific head-butting.",
    "A formidable abelisaurid measuring roughly 7.5 to 9 meters in length, acting as the undisputed apex macropredator of the isolated Late Cretaceous Indian subcontinent.",
    "Preyed upon the diverse titanosaurian sauropods (such as Jainosaurus and Isisaurus) that nested in immense numbers along the volcanic floodplains of the Deccan Traps."
  ],
  884: [ // Indosuchus raptorius
    "Excavated from the Late Cretaceous Lameta Formation of Jabalpur, Madhya Pradesh, India, by Charles Alfred Matley and described by Friedrich von Huene in 1933.",
    "Possessed a remarkably narrow, laterally compressed skull with deep alveolar margins, specialized for delivering high-velocity slicing bites against tough sauropod hide.",
    "Historically classified as a carnosaur or tyrannosauroid, modern cladistic analyses place Indosuchus firmly within Abelisauridae alongside Rajasaurus.",
    "Its discovery proved that abelisaurid theropods achieved immense ecological and morphological diversity across Gondwanan landmasses before the K-Pg extinction."
  ],
  922: [ // Vasuki indicus
    "Discovered in 2024 in the Lignite Mine of Panandhro, Kutch, Gujarat, India, within the Middle Eocene Naredi Formation (~47 Ma).",
    "Measuring an estimated 11 to 15 meters in length and weighing roughly 1 metric ton, Vasuki rivals Titanoboa as one of the largest snakes ever to exist.",
    "Belongs to the extinct family Madtsoiidae, characterized by massive vertebrae measuring over 6 centimeters wide with complex accessory zygosphene-zygantrum joints.",
    "Named after the mythical serpent king 'Vasuki' from Hindu cosmology who rests around the neck of Lord Shiva, celebrating India's rich paleontological heritage."
  ],
  923: [ // Sivatherium giganteum
    "Discovered in the Pliocene to Early Pleistocene Siwalik Hills of northern India and Pakistan, measuring roughly 3 meters tall at the shoulder.",
    "A colossal, heavily built giraffid that weighed roughly 1.2 to 1.5 metric tons, making it one of the largest ruminant mammals in Earth's history.",
    "Its skull was crowned by two pairs of massive bony ossicones: a smaller conical pair above the eyes and a gigantic, palmate, moose-like pair sweeping backward from the parietals.",
    "Possessed robust, stocky limbs and deep cheek teeth with crenulated enamel, adapted for browsing coarse gymnosperms, acacia branches, and gritty savanna scrub."
  ],
  924: [ // Stegodon ganesa
    "Discovered in the Early Pleistocene Upper Siwalik formations of northern India, named after the elephant-headed Hindu deity Ganesha.",
    "Possessed extraordinarily massive, spiraled, closely spaced tusks that reached up to 3 to 3.5 meters in length, curving outward and upward from the upper jaw.",
    "Its massive molar teeth exhibited low-crowned enamel ridges (lamellae) shaped like roof-like gables (stegos), specialized for shearing tough bamboo and riverbank vegetation.",
    "The legendary 1845 holotype cranium and colossal tusks housed at the Natural History Museum in London remain among the most spectacular fossil proboscideans ever unearthed."
  ]
};

async function main() {
  console.log("=== Executing Sequential Enrichment: Batch 6 (20 taxa) ===");

  const targetIds = Object.keys(BATCH6_FACTS).map(Number);
  console.log(`Prepared facts for ${targetIds.length} taxa in Batch 6.`);

  const existing = await prisma.species.findMany({
    where: { id: { in: targetIds } },
    select: { id: true, name: true, interestingFacts: true }
  });

  if (existing.length !== targetIds.length) {
    throw new Error(`Target species mismatch! Found ${existing.length}, expected ${targetIds.length}`);
  }

  console.log("Updating target species in database...");
  for (const s of existing) {
    const newFacts = BATCH6_FACTS[s.id];
    await prisma.species.update({
      where: { id: s.id },
      data: {
        interestingFacts: JSON.stringify(newFacts)
      }
    });
    console.log(`✓ Species #${s.id} (${s.name}): Updated to ${newFacts.length} verified facts.`);
  }

  console.log(`\nBatch 6 completed: ${existing.length} species updated.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
