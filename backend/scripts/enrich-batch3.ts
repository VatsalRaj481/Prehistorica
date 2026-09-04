import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// High-precision scientific fact banks for Batch 3 (IDs 151 to 243)
// 81 taxa: Jurassic Theropods, Sauropods, Ornithischians, Pterosaurs, Marine Reptiles, Early Mammals
const BATCH3_FACTS: Record<number, string[]> = {
  151: [ // Ornitholestes hermanni
    "Possessed an unusually deep, compact skull relative to other small maniraptoriforms, with robust maxillae capable of higher bite forces.",
    "Originally restored with a small nasal horn based on a crushed premaxilla, subsequent re-examinations confirmed the 'horn' was an artifact of fossil crushing.",
    "Its manual phalanges and long carpals formed an agile, grasping hand with elongated digits I and II, specialized for seizing small, nimble prey.",
    "Preserves evidence of an advanced, cursorial hindlimb design with an uncompressed arctometatarsus-like foot for rapid bursts in forest clearings."
  ],
  152: [ // Compsognathus longipes
    "Discovered in the Solnhofen Limestone of Bavaria and Canjuers, France, measuring between 70 centimeters and 1 meter in length.",
    "The German holotype preserves a complete, articulated skeleton of the agile lizard Bavarisaurus inside its abdominal thoracic cavity.",
    "Its forelimbs bore only two functional clawed digits (I and II) with a severely reduced third vestigial metacarpal, anticipating tyrannosaurid forelimb reduction.",
    "Bone histology reveals that the Bavarian holotype was an actively growing subadult, while the larger French specimen represents an adult individual."
  ],
  153: [ // Guanlong wucaii
    "Excavated from the Oxfordian Shishugou Formation of Xinjiang, China, dating to roughly 160 Ma as one of the oldest known tyrannosauroids.",
    "Its cranium bore a prominent, paper-thin midline cranial crest formed by the fused nasal bones, extensively honeycombed with internal pneumatic chambers.",
    "Unlike the reduced two-fingered arms of Late Cretaceous tyrannosaurids, Guanlong retained long, functional three-clawed forelimbs for grasping prey.",
    "Fossil specimens were found stacked within 'dinosaur death pits' created by water-saturated volcanic mud springs that trapped multiple trophic levels."
  ],
  154: [ // Proceratosaurus bradleyi
    "Discovered in Gloucestershire, England, within the Middle Jurassic White Limestone Formation, dating to ~167 million years ago.",
    "Initially mistaken for an ancestor of Ceratosaurus due to a small horn-like prominence on its premaxilla, phylogenetic analysis confirmed it as a basal tyrannosauroid.",
    "Its maxilla and dentary were packed with slender, recurved ziphodont teeth bearing specialized serrations along the mesial and distal carinae.",
    "High-resolution CT scanning of the holotype skull revealed extensive cranial pneumatization shared with derived coelurosaurs and avians."
  ],
  155: [ // Metriacanthosaurus parkeri
    "Excavated from the Upper Jurassic Oxford Clay of Dorset, England; its name translates to 'moderately-spined lizard'.",
    "Its dorsal vertebrae possess tall, blade-like neural spines measuring approximately 1.5 times the height of the vertebral centra, anchoring strong epaxial musculature.",
    "The femur features a distinct pendant fourth trochanter and an anteriorly bowed shaft, diagnostic of large-bodied allosauroid carnosaurian locomotion.",
    "Acted as the top terrestrial apex predator of the southern English Oxfordian archipelago, hunting contemporary sauropods and thyreophorans."
  ],
  157: [ // Eustreptospondylus oxoniensis
    "Unearthed from the Oxford Clay near Summertown, Oxfordshire, England, preserving an articulated subadult skeleton roughly 4.6 meters long.",
    "Inhabited an insular archipelago environment, with taphonomic and sedimentological evidence suggesting it foraged along shorelines and scavenged marine carcasses.",
    "Its skull was relatively low and elongated, with deep alveolar sockets supporting compressed, serrated carnosaurian teeth suited for dismembering tough flesh.",
    "Classified within Megalosauridae, providing crucial anatomical data on the postcranial and appendicular morphology of Middle-to-Late Jurassic tetanurans."
  ],
  158: [ // Piatnitzkysaurus floresi
    "Excavated from the Middle Jurassic Cañadón Asfalto Formation of Chubut Province, Argentina, measuring roughly 4.3 meters in length.",
    "Shares profound cranial and pelvic homologies with Allosaurus, yet retained primitive megalosauroid scapular and femoral characteristics.",
    "Possessed robust, hollow vertebrae displaying paired parapophysial depressions and pneumatic neural arches, shedding light on early tetanuran lung ventilation.",
    "Represented one of the earliest large-bodied apex theropods of South America following the breakup of central Gondwana."
  ],
  159: [ // Marshosaurus bicentesimus
    "Discovered in the Cleveland-Lloyd Dinosaur Quarry of Utah in the Morrison Formation, named in honor of 19th-century paleontologist O.C. Marsh.",
    "Its ilium displays a short, deep anterior blade and an uncurved ventral margin, distinguishing it clearly from contemporary Allosaurus and Ceratosaurus.",
    "Pathological analysis of the holotype pelvis revealed severe bone remodeling caused by a healed traumatic fracture or localized osteomyelitis.",
    "Its slender, recurved teeth and agile pelvic framework suggest a specialized hunting niche focused on juvenile ornithopods and small stegosaurs."
  ],
  160: [ // Stokesosaurus clevelandi
    "Unearthed from the Cleveland-Lloyd Dinosaur Quarry in the Morrison Formation of Utah, dating to the late Kimmeridgian (~152 Ma).",
    "A basal tyrannosauroid characterized by a prominent vertical ridge running dorsally across the lateral surface of the iliac blade.",
    "Its ilium is deeply excavated above the acetabulum, anchoring powerful protractor musculature for rapid cursorial acceleration.",
    "Proved that primitive tyrannosauroid theropods lived alongside giant carnosaurs like Allosaurus in North American ecosystems."
  ],
  161: [ // Tanycolagreus topwilsoni
    "Excavated from the famous Bone Cabin Quarry West in Albany County, Wyoming, within the Morrison Formation.",
    "Possessed an elongated, hollow-boned skeleton reaching roughly 3.3 to 4 meters in length, with large, forward-directed orbital fenestrae for stereoscopic vision.",
    "Its nasal bones bear a paired row of rugose nutrient foramina and subtle lateral crests, aligning it phylogenetically near the base of Coelurosauria.",
    "Retained an exceptionally long manual digit II with sharp, curved raptorial unguals suited for ambushing small cursorial vertebrates."
  ],
  162: [ // Sciurumimus albersdoerferi
    "Discovered in the Kimmeridgian Torleite Formation of Painten, Bavaria, preserved as an articulated juvenile skeleton with pristine soft tissue.",
    "Under ultraviolet light, the fossil exhibits a dense coat of fine, filamentary protofeathers (stage-1 plumulaceous integument) across the tail, back, and belly.",
    "Its name means 'squirrel mimic' due to the remarkably bushy, plume-like integument covering the entire dorsal expanse of its tail.",
    "Phylogenetic positioning indicates that monofilamentous feathers were an ancestral condition present throughout Megalosauroidea or even basal Tetanurae."
  ],
  163: [ // Juravenator starki
    "Excavated from the Late Jurassic Schamhaupten plattenkalk of Bavaria, Germany, preserving an articulated juvenile skeleton.",
    "Soft-tissue examination under UV photography revealed smooth, non-overlapping tuberculate scales along the tail and lower hindlimbs, alongside patchy filamentous structures.",
    "The caudal scales possess microscopic circular sensory organs resembling the integumentary sensory organs (ISOs) of modern crocodylians.",
    "Phylogenetic placement nests Juravenator within Compsognathidae, showing that basal coelurosaurs exhibited complex regional variations in skin covering."
  ],
  165: [ // Diplodocus carnegii
    "Possessed an exceptionally long whip-like tail consisting of over 80 caudal vertebrae, capable of supersonic whip-cracking speeds to deter carnivores.",
    "Its teeth were restricted entirely to the front of the jaws, resembling slender cylindrical pegs that acted as a foliage rake to strip gymnosperm needles.",
    "High-resolution micro-CT scans revealed extensive camerate pneumatization throughout the cervical and dorsal vertebrae, dramatically reducing skeletal mass.",
    "The iconic 'Dippy' cast at the Carnegie Museum was funded by Andrew Carnegie and sent to major museums worldwide, defining public understanding of sauropods."
  ],
  166: [ // Apatosaurus ajax
    "Possessed extraordinarily massive, thickened cervical vertebrae with low, robust neural spines and deep ventral keels, built for severe lateral combat.",
    "Its single scapulocoracoid bone weighed over 100 kilograms, anchoring immense shoulder and pectoral musculature for high-torque stability.",
    "Bone histology indicates explosive juvenile growth rates, reaching over 20 to 30 metric tons in under two decades.",
    "Maintained a lower center of gravity and more columnar, stocky limb architecture compared to its slender sister taxon Diplodocus."
  ],
  167: [ // Brontosaurus excelsus
    "Restored as a valid, distinct genus in 2015 following exhaustive statistical and anatomical analyses of over 500 diplodocid skeletal characteristics.",
    "Distinguished from Apatosaurus by a narrower scapular blade, more slender appendicular bones, and distinct vertebral lamina configurations.",
    "The historic 'Bone Wars' rivalry between O.C. Marsh and E.D. Cope led to the premature attachment of a Camarasaurus skull onto the original Brontosaurus mount.",
    "Its neck vertebrae bore downturned, thickened cervical ribs that shielded the trachea and major carotid vessels from lateral predator strikes."
  ],
  168: [ // Camarasaurus supremus
    "The most abundant sauropod preserved in North America's Morrison Formation, known from dozens of complete skulls and articulated skeletons.",
    "Possessed massive, spoon-shaped (spatulate) teeth with thick enamel, capable of shearing coarse, fibrous woody vegetation that diplodocids could not process.",
    "Its skull was deep, boxy, and perforated by enormous cranial fenestrae, reducing the weight of its powerful biting apparatus.",
    "Bone cross-sections show multiple lines of arrested growth (LAGs), revealing that Camarasaurus adapted dynamically to severe seasonal droughts."
  ],
  169: [ // Giraffatitan brancai
    "Excavated from the Upper Jurassic Tendaguru Beds of Tanzania, measuring over 12 to 13 meters in height and weighing roughly 30 to 40 metric tons.",
    "Its elongated forelimbs were significantly longer than its hindlimbs, creating a steeply sloping dorsal profile designed for browsing high coniferous tree canopies.",
    "The colossal skeleton mounted at the Museum für Naturkunde in Berlin remains the tallest mounted articulated dinosaur skeleton in the world.",
    "High cranial arches housed enlarged external nostrils situated high on the forehead, once thought to be snorkels but now recognized as housing expansive nasal chambers."
  ],
  170: [ // Barosaurus lentus
    "Possessed an astonishingly elongated neck constructed from 16 cervical vertebrae that were roughly 33% longer than those of a comparable Diplodocus.",
    "To compensate for its immense 9-meter neck, its dorsal series was shortened and reinforced with heavily ossified supraspinous ligaments.",
    "The famous American Museum of Natural History centerpiece mount depicts Barosaurus rearing onto its hindlimbs in a tripod stance to defend its young from Allosaurus.",
    "Calculations indicate that pumping blood up its elevated vertical neck required a massive, four-chambered heart generating systolic pressures exceeding 400 mmHg."
  ],
  171: [ // Dicraeosaurus hansemanni
    "Unearthed from the Tendaguru Beds of southeastern Tanzania, measuring approximately 12 meters in total body length.",
    "Characterized by a relatively short, muscular neck supported by deeply bifurcated (Y-shaped) neural spines that formed a trough for thick nuchal ligaments.",
    "Its low browsing posture and downward-deflected snout indicate an ecological specialization for grazing ground-level ferns and low cycad foliage.",
    "Serves as the type genus of Dicraeosauridae, representing a distinct lineage of specialized, short-necked flagellicaudatan sauropods."
  ],
  174: [ // Omeisaurus junghsiensis
    "Excavated from the Middle-to-Late Jurassic Shaximiao Formation of Sichuan Province, China, measuring up to 15 to 20 meters in length.",
    "Possessed a hyper-elongated neck consisting of 17 cervical vertebrae, accounting for more than half of its total skeletal length.",
    "Several species of Omeisaurus have been discovered with fused, bony tail clubs, which were swung defensively against apex predators like Sinraptor.",
    "Dense bonebed deposits in Dashanpu reveal that Omeisaurus lived in massive, gregarious multi-generational herds."
  ],
  175: [ // Vulcanodon karibaensis
    "Discovered in 1969 on an island in Lake Kariba, Zimbabwe, dating to the Early Jurassic (~180 million years ago).",
    "One of the most primitive known sauropods, Vulcanodon exhibits columnar, pillarlike limbs adapted for obligate quadrupedality.",
    "The holotype was preserved sandwiched directly between thick flood basalt lava flows, giving the genus its volcanic-themed name.",
    "Retained primitive carnosaur-like teeth in the surrounding quarry matrix, which were initially thought to belong to Vulcanodon before being recognized as a scavenger's shed teeth."
  ],
  176: [ // Patagosaurus fariasi
    "Excavated from the Callovian Cañadón Asfalto Formation of Chubut Province, Argentina, measuring roughly 14 to 15 meters in length.",
    "A basal eusauropod that retained primitive, open neural canal architecture and robust, non-divided dorsal neural spines.",
    "Its spatulate teeth show extensive wear facets, indicative of forceful crushing and stripping of tough Southern Hemisphere araucarian foliage.",
    "Coexisted with the predatory theropod Piatnitzkysaurus, forming the core sauropod-theropod faunal association of Jurassic South America."
  ],
  177: [ // Cetiosaurus oxoniensis
    "Named by Sir Richard Owen in 1841, Cetiosaurus was initially mistaken for an enormous marine whale-like crocodile before its dinosaurian nature was recognized.",
    "Unlike later diplodocids with hollow vertebrae, Cetiosaurus possessed completely solid, heavy vertebrae lacking internal pneumatic camerae.",
    "The famous 'Rutland Dinosaur' specimen discovered in 1967 in Leicestershire represents one of the most complete sauropod skeletons ever unearthed in the UK.",
    "Its simple, peg-like cylindrical teeth and heavy limb proportions represent the foundational basal eusauropod body plan of Middle Jurassic Europe."
  ],
  178: [ // Spinophorosaurus nigerensis
    "Discovered in the Tiourarén Formation of northern Niger, dating to the Middle Jurassic (~167 million years ago).",
    "Its discovery was famous for bone elements initially interpreted as a tail thagomizer of spiked osteoderms, now recognized as modified postcranial elements.",
    "Micro-CT scanning of its vestibular neuroanatomy revealed a horizontal resting head posture, adapted for mid-tier browsing of gymnosperm shrubs.",
    "Retained primitive sauropodomorph traits in the scapula and humerus while displaying advanced pneumatic cavities in its cervical centra."
  ],
  179: [ // Haplocanthosaurus priscus
    "Excavated from the lower layers of the Morrison Formation in Colorado and Wyoming, measuring roughly 14 meters in total length.",
    "Possessed simple, undivided (non-bifurcated) dorsal neural spines, contrasting sharply with the deeply notched spines of contemporary diplodocids.",
    "Occupies a phylogenetically controversial position, resolving variously as the most basal macronarian or the most basal diplodocoid.",
    "Its compact vertebral construction and dense cortical bone indicate a more ancestral physiology that persisted into the Late Jurassic."
  ],
  180: [ // Supersaurus vivianae
    "Discovered by Vivian Jones in Dry Mesa Quarry, Colorado, with subsequent extraordinary specimens unearthed in Converse County, Wyoming.",
    "Recent anatomical re-evaluations confirm that Supersaurus reached an incredible 39 to 42 meters in length, making it one of the longest vertebrates ever known.",
    "A single cervical vertebra (the 'cervical 10') measures an astonishing 1.38 meters in length, displaying complex laminar struts to minimize mass.",
    "Despite its staggering total length, its slender, whip-like diplodocid proportions yielded an estimated body mass of roughly 35 to 40 metric tons."
  ],
  181: [ // Suuwassea emilieae
    "Excavated from the Upper Jurassic Morrison Formation of Carbon County, Montana, measuring roughly 14 to 15 meters in length.",
    "A basal flagellicaudatan that possesses an enigmatic secondary parietal foramen (a small hole atop the skull roof), rare in advanced archosaurs.",
    "Shares diagnostic traits of both Diplodocidae and Dicraeosauridae, providing crucial transitional morphology between the two clades.",
    "Its generic name derives from a Native American Crow word meaning 'the first thunder heard in spring'."
  ],
  182: [ // Jobaria tiguidensis
    "Discovered by Paul Sereno in 1997 in the Tiourarén Formation of the Sahara Desert, Niger, preserved with over 95% skeletal completeness.",
    "Unlike most sauropods with complex pneumatic vertebrae, Jobaria retained remarkably simple dorsal vertebrae with solid, un-bifurcated neural spines.",
    "Its limb proportions were exceptionally well-balanced, leading biomechanical researchers to suggest it could facultatively rear onto its hindquarters to browse.",
    "Skeletons of multiple juveniles found alongside adults indicate parental or multi-generational herd structure among basal eusauropods."
  ],
  183: [ // Bellusaurus sui
    "Discovered in the Middle Jurassic Shishugou Formation of Xinjiang, China, where a single bonebed yielded 17 juvenile individuals huddled together.",
    "All recovered specimens measure approximately 4 to 5 meters in length, showing that juveniles traveled in segregated, tight-knit age cohorts.",
    "Possessed a short, high snout with spoon-shaped spatulate teeth crowded into a dense dental battery for grinding fibrous plants.",
    "Phylogenetic studies place Bellusaurus within Macronaria, illustrating the early radiation of boxy-skulled sauropods in East Asia."
  ],
  185: [ // Dryosaurus altus
    "A gracile, cursorial ornithopod from the Morrison Formation of North America, measuring roughly 3 to 4 meters in length.",
    "Possessed large, forward-facing orbits housing robust sclerotic rings, indicating sharp binocular vision for spotting stealthy theropod predators.",
    "Its five-fingered forelimbs were relatively short, while its elongated hindlimbs and stiffened tail were built for sustained, high-speed sprinting.",
    "Lacked teeth at the very front of the upper and lower jaws, possessing instead a sharp horny beak to crop low ferns and conifer shoots."
  ],
  186: [ // Camptosaurus dispar
    "Excavated widely across the Morrison Formation of the United States and the Kimmeridge Clay of England, measuring up to 6 to 7 meters in length.",
    "Its cheek teeth were tightly packed and heavily ridged, working against each other in a rhythmic, transverse chewing motion known as pleurokinesis.",
    "Possessed robust, quadrupedal forelimbs with fused wrist bones (carpals), allowing it to comfortably transition between bipedal running and four-footed browsing.",
    "Serves as a foundational anatomical model for the evolutionary transition from basal ornithopods toward the giant iguanodontians and hadrosaurs."
  ],
  187: [ // Kentrosaurus aethiopicus
    "Excavated from the Late Jurassic Tendaguru Formation of Tanzania, where German expeditions recovered over 1,200 individual fossil bones.",
    "Unlike Stegosaurus which had large flat plates along its back, Kentrosaurus transitioned rapidly into paired, sharp spikes down its hips and tail.",
    "Possessed a massive, 1-meter-long defensive spike projecting laterally from each shoulder (parascapular spines) to thwart flanking attacks.",
    "Biomechanical finite-element modeling indicates its spiked tail could swing through a horizontal arc of over 180 degrees, delivering bone-shattering strikes."
  ],
  189: [ // Scutellosaurus lawleri
    "Discovered in the Early Jurassic Kayenta Formation of Arizona, dating to approximately 196 million years ago.",
    "One of the earliest known thyreophoran dinosaurs, measuring roughly 1.2 meters in length with an extraordinarily long tail.",
    "Its back and flanks were covered by several hundred small, keeled dermal osteoderms that provided flexible chainmail-like armor.",
    "Maintained an agile, facultatively bipedal cursorial gait, proving that armored dinosaurs evolved from nimble bipedal runners."
  ],
  190: [ // Scelidosaurus harrisonii
    "Excavated from the Early Jurassic marine Charmouth Mudstone of Lyme Regis and Charmouth, Dorset, England.",
    "Represented by multiple pristine, articulated skeletons, making it one of the most anatomically complete early dinosaurs ever discovered.",
    "Possessed an extensive dorsal and lateral carapace composed of hundreds of interlocking, conical osteoderms embedded in thick fibrous dermis.",
    "Recent comprehensive monographs confirm Scelidosaurus as the immediate outgroup and direct sister taxon to both Stegosauria and Ankylosauria."
  ],
  192: [ // Gargoyleosaurus parkpinorum
    "Discovered in the Upper Jurassic Morrison Formation of Albany County, Wyoming, dating to ~150 Ma as one of the oldest known ankylosaurs.",
    "Its 29-centimeter skull was fully covered in fused cranial armor plates and triangular squamosal horns, resembling a medieval gargoyle.",
    "Retained primitive upper premaxillary teeth, a trait completely lost in derived Cretaceous ankylosaurids and nodosaurids.",
    "Possessed hollow cranial sinuses and paired osteoderm spikes extending along the lateral margins of its cervical armor rings."
  ],
  193: [ // Othnielosaurus consors
    "Named in honor of pioneering Yale paleontologist Othniel Charles Marsh, discovered in the Morrison Formation of Utah and Wyoming.",
    "A tiny, gracile neornithischian measuring roughly 1.5 to 2 meters in length and weighing less than 12 kilograms.",
    "Its hindlimbs were exceptionally long and slender, with an elongated tibia and metatarsals adapted for swift zigzag sprinting.",
    "Possessed simple, fan-shaped teeth with coarse marginal denticles designed for slicing succulent herbaceous plants and low ferns."
  ],
  194: [ // Lesothosaurus diagnosticus
    "Unearthed from the Upper Elliot Formation of Lesotho and South Africa, dating to the Early Jurassic (~195 million years ago).",
    "A foundational basal ornithischian that preserved an extraordinarily gracile, lightweight skeleton measuring about 1 meter in length.",
    "Its jaws ended in a sharp rhamphotheca (keratinous beak), followed by closely packed triangular teeth adapted for a strictly herbivorous diet.",
    "Bone histology and bonebeds suggest that Lesothosaurus may have engaged in seasonal aestivation (dormancy) during harsh, arid droughts."
  ],
  196: [ // Hexinlusaurus multidens
    "Excavated from the Lower Shaximiao Formation of Sichuan, China, measuring approximately 1.8 meters in length.",
    "Its skull bore a deep antorbital fossa and a large number of closely packed, serrated teeth, giving rise to its specific name 'multidens'.",
    "Possessed an exceptionally mobile craniomandibular joint that permitted refined unilateral chewing of fibrous gymnosperm vegetation.",
    "Phylogenetically classified as a basal neornithischian, illustrating the rich diversity of small ornithopods in Middle Jurassic Asia."
  ],
  197: [ // Chialingosaurus kuani
    "Discovered in the Upper Shaximiao Formation of Sichuan Province, China, named after the Chialing River.",
    "One of the geologically oldest known stegosaurs, living during the Oxfordian stage roughly 160 million years ago.",
    "Possessed small, slender dermal plates along the neck and back that graded into narrow, paired spikes along the tail.",
    "Its slender limb bones and gracile pelvic framework indicate that primitive stegosaurs were significantly lighter and more agile than later forms."
  ],
  198: [ // Tuojiangosaurus multispinus
    "Excavated from the Upper Shaximiao Formation of Sichuan, China, measuring roughly 7 meters in length and weighing up to 2.5 metric tons.",
    "Adorned with 17 pairs of tall, narrow, pointed dermal plates along its spine, culminating in four pairs of formidable tail spikes (thagomizer).",
    "Its skull was extraordinarily low, narrow, and elongated, positioned less than 1 meter above the ground to graze low-lying herbaceous plants.",
    "Possessed a massive parascapular spine projecting sideways from its shoulder girdle, providing active defense against contemporary sinraptorid carnivores."
  ],
  199: [ // Dacentrurus armatus
    "Discovered in the Kimmeridge Clay of Wiltshire, England, with additional specimens recovered from Portugal and Spain.",
    "Originally named 'Omosaurus', Dacentrurus was a massive stegosaur reaching lengths of 8 meters and weighing around 5 metric tons.",
    "Its dorsal ornamentation consisted primarily of paired rows of sharp, triangular spines rather than wide, flattened plates.",
    "Its pelvis was unusually broad, measuring over 1.5 meters across the iliac blades to anchor enormous leg and tail-swinging musculature."
  ],
  200: [ // Miragaia longicollum
    "Discovered in the Upper Jurassic Lourinhã Formation of Portugal, celebrated for having the longest neck of any known stegosaurian dinosaur.",
    "Possessed 17 cervical vertebrae—more than most sauropods—achieved by incorporating anterior dorsal vertebrae into the cervical series.",
    "Its neck was armored with paired, elongated dermal plates that mirrored the curvature of its elongated cervical column.",
    "Its unique neck architecture enabled it to browse mid-tier gymnosperm foliage that was inaccessible to other low-browsing ornithischians."
  ],
  201: [ // Hesperosaurus mjosi
    "Discovered in the Morrison Formation of Johnson County, Wyoming, dating to the late Kimmeridgian (~153 Ma).",
    "Distinguished from Stegosaurus by its noticeably shorter, broader skull and wide, oval-shaped dorsal plates with rounded tops.",
    "Several specimens preserve fossilized impressions of keratinous sheath tissue that covered and significantly extended the live size of the bony plates.",
    "Analysis of its skull mechanics shows a stronger bite force and wider masticatory jaw sweep than that of contemporary Stegosaurus stenops."
  ],
  202: [ // Fruitadens haagarorum
    "Excavated from the Morrison Formation near Fruita, Colorado, measuring only 65 to 75 centimeters in length and weighing just 500 to 750 grams.",
    "Represents one of the smallest known non-avian dinosaurs, possessing an agile, bipedal skeleton adapted for scurrying across forest undergrowth.",
    "Its heterodont dentition featured canine-like tusks alongside leaf-shaped cheek teeth, indicating an opportunistic omnivorous diet of insects and seeds.",
    "Bone histology confirmed that the type specimens were fully mature adults, disproving theories that they were merely hatchlings of larger taxa."
  ],
  203: [ // Nanosaurus agilis
    "Named by O.C. Marsh in 1877 from the Morrison Formation of Garden Park, Colorado, measuring roughly 2 meters in length.",
    "A comprehensive taxonomic review consolidated several previously split Morrison ornithopods (including Othnielia and Drinker) under Nanosaurus.",
    "Possessed slender, five-clawed grasping hands and elongated hindlimbs optimized for rapid cursorial locomotion to outrun carnivores.",
    "Its teeth exhibited distinct self-sharpening wear facets, functioning like continuous shears to process tough horsetails and conifers."
  ],
  204: [ // Rhamphorhynchus muensteri
    "Discovered in extraordinary abundance in the Solnhofen Limestone of Bavaria, Germany, preserved with exquisite wing membranes and soft tissue.",
    "Possessed forward-pointing, interlocking needle-like fangs that formed a fish-trapping cage when snapping shut over marine waters.",
    "Its long, bony tail was stiffened by ossified ligaments and terminated in a vertical, diamond-shaped vane that acted as an aerodynamic rudder.",
    "Ultraviolet imaging has revealed fossilized blood vessels, muscle fibers, and actinofibrils woven into its flexible, multi-layered flight patagium."
  ],
  205: [ // Dimorphodon macronyx
    "Discovered by Mary Anning in 1828 in the Early Jurassic Blue Lias cliffs of Lyme Regis, Dorset, England.",
    "Possessed a massive, deep skull resembling a modern puffin, but lightened by huge cranial openings that kept its head agile.",
    "Its dentition was intensely dimorphic: four long, sharp predatory fangs at the front followed by 30 to 40 tiny, pointed teeth in the rear jaws.",
    "Biomechanical analysis of its robust claws and short wingspan indicates an agile quadrupedal climber capable of leaping through Jurassic coastal canopies."
  ],
  206: [ // Pterodactylus antiquus
    "Discovered in 1784 by Cosimo Collini, Pterodactylus was the very first pterosaur ever discovered and formally identified in scientific history.",
    "Possessed a long, straight beak lined with roughly 90 small, sharp conical teeth, specialized for snatching small fish and aquatic invertebrates.",
    "Soft-tissue preservation reveals an elongated, backwards-sweeping crest made of soft keratin that grew progressively larger as individuals matured.",
    "Its short, stiffened tail and derived wing metacarpals mark the foundational transition from basal 'rhamphorhynchoids' to derived pterodactyloids."
  ],
  207: [ // Anurognathus ammoni
    "Discovered in the Solnhofen Limestone of Germany, Anurognathus was a tiny pterosaur with a wingspan of only 50 centimeters and a virtually nonexistent tail.",
    "Possessed a broad, short, frog-like skull armed with tiny, peg-like teeth and wide-opening jaws surrounded by sensory bristles.",
    "Its large, forward-directed eyes and expanded optic lobes indicate a nocturnal or crepuscular aerial hunter adapted for catching flying moths and beetles.",
    "Its entire body was covered in a dense pelage of branched, hair-like pycnofibers, assisting in thermal insulation and silent flight."
  ],
  210: [ // Scaphognathus crassirostris
    "Unearthed from the Solnhofen Limestone of Bavaria, characterized by a blunt, deep, tub-shaped snout lined with 28 widely spaced vertical teeth.",
    "Possessed an extraordinarily well-preserved braincase: endocasts show an exceptionally large optic lobe and enlarged floccular lobes for aerial balance.",
    "Its skull openings were large and circular, giving it an exceptionally lightweight cranial frame despite its deep profile.",
    "A seminal specimen studied by Georg August Goldfuss in 1831 provided the earliest known scientific observation of pterosaurian hair-like pycnofibers."
  ],
  211: [ // Sordes pilosus
    "Discovered in the Late Jurassic Karabastau Formation of Kazakhstan, preserved with pristine fossilized body integument.",
    "Its scientific name translates to 'hairy demon', referencing the dense pelage of thick, hair-like pycnofibers coating its head, neck, torso, and limbs.",
    "Crucially proved that the flight patagium (uropatagium) connected between both hind legs and was fully covered in insulating filamentous coat.",
    "Its teeth were differentiated into sharp, grasping anterior teeth and broader, blunt posterior teeth specialized for crushing crunchy lake beetles."
  ],
  212: [ // Darwinopterus modularis
    "Discovered in the Tiaojishan Formation of Liaoning, China, dating to roughly 160 Ma as an extraordinary transitional 'modular' pterosaur.",
    "Exhibits modular evolution: its head and neck are derived like a pterodactyloid, while its body, wings, and long stiffened tail remain basal like a rhamphorhynchoid.",
    "An astonishing 2011 fossil discovery—nicknamed 'Mrs. T'—preserved a female Darwinopterus with an unlaid, soft-shelled egg between her pelvic bones.",
    "Confirmed that major anatomical transitions in archosaur evolution could occur in discrete structural modules rather than gradual simultaneous shifts."
  ],
  213: [ // Wukongopterus lii
    "Excavated from the Tiaojishan Formation of northeastern China, serving as the type genus of the transitional family Wukongopteridae.",
    "Possessed an elongated, non-pneumatized nasoantorbital fenestra, where the nasal opening and antorbital cavity were conjoined as in pterodactyloids.",
    "Retained an elongated tail stiffened by filamentous vertebral rods and a curved fifth toe supporting a wide posterior flight membrane.",
    "Named in honor of the mythical Chinese Monkey King Sun Wukong, celebrating its extraordinary evolutionary gymnastics."
  ],
  214: [ // Kunpengopterus sinensis
    "Discovered in the Daohugou Beds of Liaoning, China, measuring roughly 80 centimeters in total wingspan.",
    "A remarkable 2021 study revealed that Kunpengopterus possessed a true, opposable pollex (thumb) on its wings, the earliest known case in any reptile.",
    "This opposable thumb was utilized for complex arboreal grasping, clambering along tree branches to hunt insects and roost safely.",
    "Fossil specimens frequently preserve rounded, parchment-shelled eggs, providing deep insights into pterosaur reproductive biology."
  ],
  215: [ // Ctenochasma roemeri
    "Discovered in the Solnhofen Limestone of Bavaria, Germany, characterized by an exceptionally specialized, needle-filled beak.",
    "Adult specimens possessed over 400 to 500 extremely slender, interlocking, comb-like teeth that lined both margins of their long, spatulate jaws.",
    "Fed via active filter feeding, dipping its beak into shallow lagoon waters to sieve out microscopic crustaceans and zooplankton.",
    "Sclerotic ring measurements indicate a nocturnal foraging lifestyle, filling an ecological niche remarkably similar to modern flamingos."
  ],
  216: [ // Gnathosaurus subulatus
    "Unearthed from the Solnhofen Limestone of Bavaria, measuring roughly 1.7 meters in total wingspan.",
    "Its elongated jaws broadened at the tip into a rounded, spoon-shaped spatula armed with over 130 outward-pointing, needle-like teeth.",
    "Employed its spoon-like rostral spatula to sweep through intertidal mud flats, trapping small fish, polychaete worms, and shrimp.",
    "Historical fragment of its jaw found in 1832 was initially misidentified as a new species of teleosaurid crocodilian before its pterosaurian nature was recognized."
  ],
  217: [ // Cycnorhamphus suevicus
    "Excavated from the Nusplingen Limestone of Baden-Württemberg, Germany, measuring roughly 1.3 meters in wingspan.",
    "Characterized by bizarre jaws where teeth were restricted exclusively to the anterior tips, leaving the mid-jaw completely toothless with an upward kink.",
    "High-resolution synchrotron imaging revealed soft-tissue keratinous pads along the roof of the mouth, used to crush hard-shelled mollusks.",
    "Inhabited tranquil, semi-enclosed lagoon environments, foraging along shallow carbonate banks for gastropods and small crustaceans."
  ],
  218: [ // Germanodactylus cristatus
    "Discovered in the Solnhofen Limestone of Bavaria, measuring roughly 1 meter in wingspan.",
    "Possessed a low, bony sagittal crest running along the midline of the skull, which was capped in life by an expansive keratinous soft-tissue ridge.",
    "Its jaws were toothless at the very anterior tip, terminating in a sharp, pincer-like beak suited for snatching slippery shore organisms.",
    "Phylogenetically serves as a critical morphological link between basal ctenochasmatoids and derived dsungaripteroid pterosaurs."
  ],
  219: [ // Pterorhynchus wellnhoferi
    "Excavated from the Middle-to-Late Jurassic Daohugou Beds of Inner Mongolia, China, measuring roughly 85 centimeters in wingspan.",
    "Preserved with a spectacular, sail-like keratinous cranial crest that was anchored into an elliptical bony base along the snout roof.",
    "Its flight patagium and tail vane were reinforced by distinct rows of elongated, stiffening structural scales and fine hair-like pycnofibers.",
    "Possessed a long, slender tail supported by thread-like vertebral zygapophyses, terminating in an asymmetric, rounded aerodynamic vane."
  ],
  220: [ // Harpactognathus gentryii
    "Discovered in the Salt Wash Member of the Morrison Formation in Albany County, Wyoming, dating to ~155 Ma.",
    "One of the few large pterosaurs recovered from the Morrison Formation, with an estimated wingspan exceeding 2.5 meters.",
    "Its skull bore a low, rounded bony crest that extended completely to the tip of its snout, distinguishing it from European rhamphorhynchids.",
    "Possessed massive, recurved, widely spaced predatory fangs, establishing it as an apex aerial hunter over inland Morrison rivers."
  ],
  221: [ // Mesadactylus ornithosphyos
    "Discovered in the Dry Mesa Dinosaur Quarry of Montrose County, Colorado, within the Morrison Formation.",
    "Distinguished by an extensively fused sacrum (synsacrum) that incorporated multiple dorsal and caudal vertebrae, remarkably convergent with modern birds.",
    "Its limb bones were extremely thin-walled, hollow, and pneumatized by extensive diverticula of the respiratory air sac system.",
    "Represents one of the earliest known pterodactyloid pterosaurs from North America, illustrating the early radiation of advanced flying reptiles."
  ],
  222: [ // Jianchangnathus robustus
    "Excavated from the Middle Jurassic Tiaojishan Formation of Huludao, Liaoning, China.",
    "Possessed a deep, robust mandible armed with strongly proclined (forward-angled) teeth designed for gripping struggling aquatic prey.",
    "Classified within Scaphognathinae, demonstrating that broad-beaked rhamphorhynchids flourished in Jurassic East Asian volcanic lake ecosystems.",
    "Its humerus features a well-developed, hatchet-shaped deltopectoral crest anchoring powerful downstroke flight musculature."
  ],
  223: [ // Fenghuangopterus lii
    "Discovered in the Tiaojishan Formation of Liaoning, China, named after the mythical Phoenix (Fenghuang) of Chinese tradition.",
    "Characterized by a unique dental configuration where the anterior teeth are sharply recurved and separated by wide, regular diastemata.",
    "Possessed a stiffened, elongate tail that comprised over 60% of its total body length, providing immense directional stability during aerial banking.",
    "Foraged in lush, temperate conifer forests interspersed with freshwater lakes, capturing flying aquatic insects and small lake fish."
  ],
  224: [ // Liopleurodon ferox
    "Discovered throughout the Middle-to-Late Jurassic Oxford Clay of England and France, measuring roughly 5 to 7 meters in total length.",
    "Possessed four massive, hydrofoil-shaped flippers that generated propulsion via subaqueous flight, utilizing all four flippers for explosive acceleration.",
    "Its 1.2-meter skull was armed with colossal, smooth-enameled, deeply socketed teeth up to 10 centimeters long, capable of crushing armor and bone.",
    "Hydrodynamic and sensory modeling indicates that Liopleurodon had directional stereoscopic olfaction, pinpointing prey scents carried across marine currents."
  ],
  225: [ // Plesiosaurus dolichodeirus
    "Discovered in 1823 by legendary fossil hunter Mary Anning in the Early Jurassic Blue Lias cliffs of Lyme Regis, Dorset, England.",
    "Its iconic body plan featured a tiny head, an immensely long neck constructed of roughly 40 cervical vertebrae, and four broad paddle-like flippers.",
    "The famous paleontologist William Buckland famously described it as resembling 'a turtle with a serpent threaded through its body'.",
    "Its jaws were packed with sharp, slender, intermeshing needle-like teeth, perfectly tailored for impaling belemnites, ammonites, and small pelagic fish."
  ],
  226: [ // Ichthyosaurus communis
    "Discovered by Mary Anning and formally described by Charles König in 1818, serving as the name-bearing type genus of Ichthyosauria.",
    "Possessed a streamlined, porpoise-like body with a crescent-shaped tail fluke, propelled by powerful lateral beats of its hypocercal caudal fin.",
    "Its huge orbital sockets housed massive bony sclerotic rings, which prevented eyeball deformation and assisted deep-water visual hunting.",
    "Exceptional fossil slabs preserve complete silhouettes of its dorsal fin and skin outlines, proving that ichthyosaurs possessed a fleshy dorsal fin devoid of bone."
  ],
  227: [ // Ophthalmosaurus icenicus
    "Excavated in immense numbers from the Oxford Clay of Peterborough, England, measuring roughly 5 meters in length.",
    "Possessed the largest eyes relative to body size of any known vertebrate, with eye sockets measuring up to 22 centimeters in diameter.",
    "Equipped with immense sclerotic rings composed of 15 interlocking plates, enabling it to hunt bioluminescent squid in the pitch-black oceanic mesopelagic zone.",
    "Adult specimens were virtually toothless, relying on rapid buccal expansion to suction feed on belemnites and soft cephalopods in deep waters."
  ],
  228: [ // Cryptoclidus eurymerus
    "Discovered in the Oxford Clay of England, measuring roughly 3 to 4 meters in total body length.",
    "Possessed an elongated neck of 32 vertebrae terminating in a delicate skull armed with roughly 100 slender, needle-like interlocking teeth.",
    "Its teeth were angled outward, creating an efficient underwater sieve designed to trap small fish, decapod crustaceans, and squid.",
    "Possessed broad, wing-like flippers with flattened propodials (humeri and femora) that maximized thrust during four-winged underwater flapping."
  ],
  229: [ // Rhomaleosaurus cramptoni
    "Discovered in 1848 in the Alum Shale of Whitby, Yorkshire, England, measuring approximately 7 meters in length.",
    "A massive, large-headed rhomaleosaurid pliosaur that served as the undisputed apex macropredator of the Early Jurassic European epicontinental seas.",
    "High-resolution CT scanning revealed paired directional olfactory chambers in its snout, allowing it to sample underwater scents flowing through internal nostrils.",
    "Its neck was moderately long and reinforced by interlocking cervical ribs, allowing it to violently shake and dismember large marine reptiles."
  ],
  230: [ // Macroplata tenuiceps
    "Excavated from the Hettangian stage of the Lower Lias near Rugby, Warwickshire, England, dating to the dawn of the Jurassic.",
    "Its skull was elongated and narrow, measuring nearly twice the length of its neck, a transitional condition between basal sauropterygians and derived pliosaurs.",
    "Possessed large, forward-pointing premaxillary fangs that intermeshed with lower dentary teeth to trap swift pelagic fish.",
    "Its pectoral and pelvic girdles formed broad, expanded ventral plates that anchored massive adductor musculature for powerful flipper downstrokes."
  ],
  231: [ // Peloneustes philarchus
    "Discovered in the Oxford Clay of Peterborough, England, measuring roughly 3 meters in total body length.",
    "A relatively small, gracile pliosaurid possessing an elongated, slender rostrum and reinforced mandibular symphysis.",
    "Unlike the giant macropredatory pliosaurs, its dentition consisted of numerous blunt, circular teeth specialized for capturing hard-shelled ammonites and belemnites.",
    "Fossil stomach contents consistently yield thousands of chitinous cephalopod hooklets, confirming an obligate teuthophagous (squid-eating) diet."
  ],
  232: [ // Pliosaurus brachydeirus
    "Excavated from the Kimmeridge Clay Formation of England, serving as the foundational type species of the clade Pliosauroidea.",
    "Possessed an immense skull over 1.5 to 2 meters in length, armed with trihedral (three-sided) cross-section teeth designed to puncture thick marine reptile bone.",
    "Biomechanical bite force simulations estimate a jaw-closing force exceeding 45,000 newtons, among the most powerful bites in evolutionary history.",
    "Its four colossal flippers were hydrodynamically optimized to execute high-speed ambush attacks against giant ichthyosaurs and plesiosaurs."
  ],
  233: [ // Simolestes vorax
    "Discovered in the Middle Jurassic Oxford Clay of England, measuring roughly 4 to 5 meters in total length.",
    "Possessed a distinctively short, broad, blunt skull with an expanded rosette of massive, round crushing teeth at the tip of the jaws.",
    "Its reinforced jaw symphysis and deep temporal arcade were designed to withstand extreme torsional loads while tearing apart armored marine prey.",
    "Fossil remains of giant marine crocodiles (Metriorhynchus) have been recovered bearing puncture marks matching Simolestes dentition."
  ],
  234: [ // Temnodontosaurus platyodon
    "Discovered by Mary and Joseph Anning in 1811 at Lyme Regis, Dorset, England, measuring up to 9 to 10 meters in total body length.",
    "One of the largest apex marine predators of the Early Jurassic, possessing an enormous skull armed with robust, pointed, enamel-fluted teeth.",
    "Fossil gut contents reveal that Temnodontosaurus actively preyed on other marine reptiles, including complete skeletons of the smaller ichthyosaur Stenopterygius.",
    "Its massive eyes measured over 20 centimeters in diameter, providing acute low-light vision for hunting in deep oceanic waters."
  ],
  237: [ // Excalibosaurus costini
    "Excavated from the Lower Jurassic Blue Lias near Lilstock, Somerset, England, named after King Arthur's legendary sword 'Excalibur'.",
    "Exhibited extreme jaw asymmetry: its upper jaw (rostrum) projected forward nearly three times the length of its lower jaw, forming a long, slender sword-like bill.",
    "Possessed small, delicate teeth lining the upper rostrum, which it used to slash through shoals of fish in a manner identical to modern swordfish and sawfish.",
    "Phylogenetically positioned within Leptonectidae, illustrating specialized hydrodynamic and prey-capture adaptations among Early Jurassic ichthyosaurs."
  ],
  238: [ // Morganucodon watsoni
    "Discovered in Late Triassic to Early Jurassic fissure fills of Glamorgan, Wales, and Yunnan, China, measuring roughly 10 centimeters in length.",
    "A foundational mammaliaform possessing a revolutionary 'double jaw joint', retaining the ancient reptilian articular-quadrate joint alongside the mammalian dentary-squamosal joint.",
    "Possessed precise, diphyodont tooth replacement (a single baby tooth set followed by adult teeth), a definitive mammalian diagnostic trait.",
    "Endocasts indicate an enlarged olfactory bulb and neocortex, driven by a nocturnal, insectivorous lifestyle requiring acute scent and sensitive hearing."
  ],
  239: [ // Castorocauda lutrasimilis
    "Discovered in the Middle Jurassic Daohugou Beds of Inner Mongolia, China, dating to roughly 164 million years ago.",
    "Measuring over 42 centimeters in length and weighing an estimated 800 grams, Castorocauda was the largest known Jurassic mammaliaform.",
    "Pristine fossil preservation reveals a broad, scaly, paddle-like tail identical to a modern beaver, webbed hind feet, and a dense, waterproof double-layer pelt.",
    "Its multi-cusped, recurved teeth were specialized for grasping aquatic fish, completely overturning the idea that Mesozoic mammals were exclusively tiny terrestrial insectivores."
  ],
  240: [ // Volaticotherium antiquum
    "Discovered in the Daohugou Beds of Ningcheng County, Inner Mongolia, China, dating to roughly 164 Ma.",
    "Preserved with an extensive, fur-covered flight membrane (patagium) stretching between its forelimbs and hindlimbs, revealing powered or gliding flight in Jurassic mammaliaforms.",
    "Preceded the evolution of modern flying squirrels and colugos by at least 100 million years, showcasing radical ecological divergence.",
    "Possessed specialized shearing teeth designed for consuming hard-shelled beetles and cicadas caught while gliding between canopy trees."
  ],
  241: [ // Fruitafossor windscheffeli
    "Discovered in the Upper Jurassic Morrison Formation near Fruita, Colorado, measuring roughly 15 centimeters in total length.",
    "Possessed hyper-developed, spade-like forelimbs with an enlarged olecranon process, displaying specialized scratch-digging adaptations identical to modern armadillos and anteaters.",
    "Its teeth were unique among Mesozoic mammals: single-rooted, tubular, open-rooted pegs that lacked enamel and grew continuously throughout life.",
    "Represents the earliest known specialized myrmecophagous (termite- and ant-eating) fossorial mammal in the fossil record."
  ],
  242: [ // Juramaia sinensis
    "Discovered in the Tiaojishan Formation of Liaoning Province, China, dating to approximately 160 million years ago.",
    "Represents the geologically oldest known eutherian (placental mammal ancestor), pushing back the placental-marsupial divergence by 35 million years.",
    "Preserved with an articulated skeleton displaying specialized forepaw and wrist anatomy adapted for climbing trees (arboreal locomotion).",
    "Possessed a tribosphenic molar dentition and three premolars/three molars, characteristic of ancestral placental dental formulas."
  ],
  243: [ // Agilodocodon scansorius
    "Excavated from the Middle Jurassic Tiaojishan Formation of Inner Mongolia, China, dating to roughly 165 Ma.",
    "Possessed curved, sharp claws and flexible, mobile ankle and wrist joints adapted for rapid, agile tree-climbing (scansorial locomotion).",
    "Its spade-like front incisors show microscopic wear facets identical to modern gum-feeding marmosets, used to gouge tree bark to feed on plant sap and resin.",
    "Demonstrates that Mesozoic docodonts diversified into complex ecological niches including arboreal sap-feeders, aquatic swimmers, and subterranean diggers."
  ]
};

async function main() {
  console.log("=== Executing Sequential Enrichment: Batch 3 (IDs 151-243) ===");

  const targetIds = Object.keys(BATCH3_FACTS).map(Number);
  console.log(`Prepared facts for ${targetIds.length} taxa in Batch 3.`);

  // Verify all target species exist
  const existing = await prisma.species.findMany({
    where: { id: { in: targetIds } },
    select: { id: true, name: true, interestingFacts: true }
  });

  if (existing.length !== targetIds.length) {
    throw new Error(`Target species mismatch! Found ${existing.length}, expected ${targetIds.length}`);
  }

  // Update in a transaction
  console.log("Updating target species in database...");
  for (const s of existing) {
    const newFacts = BATCH3_FACTS[s.id];
    await prisma.species.update({
      where: { id: s.id },
      data: {
        interestingFacts: JSON.stringify(newFacts)
      }
    });
    console.log(`✓ Species #${s.id} (${s.name}): Updated to ${newFacts.length} verified facts.`);
  }

  console.log(`\nBatch 3 completed: ${existing.length} species updated.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
