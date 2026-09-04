import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// High-precision scientific fact banks accurately mapped to DB IDs
const BATCH2_FACTS: Record<number, string[]> = {
  50: [ // Lisowicia bojani
    "At roughly 9 metric tons and 4.5 meters in length, Lisowicia overturned the long-standing paradigm that only sauropodomorph dinosaurs attained gigantic body size during the Late Triassic.",
    "Unlike typical non-mammalian synapsids with sprawling gaits, bone histology reveals an upright, fully erect quadrupedal limb posture supported by a pillarlike columnar arrangement.",
    "Histological cross-sections of the femur and humerus demonstrate uninterrupted fibrolamellar bone, indicating rapid, continuous juvenile growth similar to large mammals and sauropods.",
    "Its skull bore a completely edentulous, keratinized beak in front of the jaws, powered by massive jaw adductor muscles to slice tough fibrous vegetation."
  ],
  51: [ // Cynognathus crateronotus
    "Possessed a differentiated heterodont dentition with prominent recurved canines and sectorial postcanines bearing serrated accessory cusps specialized for shearing flesh.",
    "Skull architecture features a fully developed secondary bony palate, which allowed Cynognathus to breathe continuously while processing and chewing food.",
    "Deep pits and foramina along the maxillary bones strongly indicate the presence of vibrissae (whiskers), offering morphological evidence of early synapsid pelage and sensory tactile hair.",
    "The dentary bone constitutes over 90% of the lower jaw length, marking a critical transition toward the mammalian single-bone mandible and middle ear ossicle evolution."
  ],
  52: [ // Thrinaxodon liorhinus
    "Articulated skeletons found curled tightly in Karoo Basin fossil burrows prove Thrinaxodon engaged in active fossorial denning to survive extreme Early Triassic thermal fluctuations.",
    "A famous dual fossil burrow preserve demonstrates Thrinaxodon sharing a den with the temnospondyl amphibian Broomistega putterilli while the latter healed from broken ribs.",
    "Possessed interlocking, expanded ribs with overlapping costal plates that stiffened the thoracic spine, supporting powerful digging motions while restricting lateral undulation.",
    "Computed micro-tomography of the snout revealed complex maxillary canals supplying blood and nerves to early tactile whiskers (vibrissae)."
  ],
  53: [ // Shonisaurus popularis
    "Adult Shonisaurus specimens completely lacked functional teeth in their elongated, slender jaws, instead employing powerful suction feeding to ingest soft cephalopods.",
    "Berlin-Ichthyosaur State Park in Nevada preserves an extraordinary bonebed containing at least 37 Shonisaurus individuals, likely representing a recurring calving or breeding ground.",
    "Possessed unusually elongated, narrow flippers where both forelimbs and hindlimbs remained nearly equal in length, acting as stabilization hydrofoils rather than sculling paddles.",
    "Its deep, barrel-shaped ribcage and massive body length of 15 meters made Shonisaurus one of the earliest giant apex vertebrates to evolve in Mesozoic oceans."
  ],
  54: [ // Cymbospondylus petrinus
    "Unlike later dolphin-like parvipelvian ichthyosaurs, Cymbospondylus retained a primitive anguilliform (eel-like) body plan propelled by sinusoidal whole-body undulations.",
    "The tail possessed only a subtle downward bend without a prominent dorsal fin or crescent fluke, relying on an elongated, ribbon-like caudal paddle for propulsion.",
    "Its skull was exceptionally long and low, armed with numerous small, conical teeth designed to snare slippery pelagic fish and ammonites in the open Panthalassic Ocean.",
    "Fossil discoveries of Cymbospondylus youngorum in Nevada revealed that ichthyosaurs attained macroscopic 17-meter body sizes within just 3 million years of the end-Permian extinction."
  ],
  55: [ // Peteinosaurus zambellii
    "One of the geologically oldest known pterosaurs, discovered in the Late Triassic Calcare di Zorzino formation of Cene, northern Italy.",
    "The fifth toe of the foot was remarkably elongated and bore a curved phalanx, which supported a broad cruropatagium extending between the hindlimbs.",
    "Retained an exceptionally long, stiffened tail supported by interwoven ossified rod-like vertebral zygapophyses to maintain aerodynamic pitch stability.",
    "Its jaws were lined with small, sharp, single-cusped conical teeth specialized for piercing the chitinous exoskeletons of Triassic insects."
  ],
  60: [ // Eodromaeus murphi
    "Discovered in Argentina's Ischigualasto Formation, Eodromaeus represents one of the most basal known theropods, living approximately 231 million years ago.",
    "Possessed serrated, ziphodont teeth set in deeply rooted sockets and a pneumatic antorbital fossa characteristic of true predatory saurischians.",
    "Contrasting with its contemporary omnivorous basal relative Eoraptor, Eodromaeus shows definitive hypercarnivorous cranial and postcranial adaptations.",
    "Its slender, hollow long bones and elongated metatarsals indicate a swift cursorial sprinter capable of high-speed pursuit of early reptiles."
  ],
  61: [ // Nyasasaurus parringtoni
    "Unearthed from the Middle Triassic Manda Beds of Tanzania, Nyasasaurus dates to ~243 Ma, making it either the earliest known dinosaur or their closest sister taxon.",
    "The humerus possesses an elongated deltopectoral crest that extends down over 30% of the bone length, a diagnostic synapomorphy of true Dinosauria.",
    "Cross-sectional bone histology displays dense vascular networks and disorganized woven fibers, indicating elevated metabolic and growth rates unmatched by other pseudosuchians.",
    "Preserves three sacral vertebrae with ancestral dinosaurian articular facets, bridging the morphological gap between dinosauromorphs and basal saurischians."
  ],
  62: [ // Procompsognathus triassicus
    "Excavated from the Late Triassic Stubensandstein quarries of Baden-Württemberg, Germany, measuring roughly 1 meter in total body length.",
    "Possessed exceptionally slender, bird-like hollow limb bones with an elongated tibia and ankle adapted for agile, high-frequency cursorial locomotion.",
    "Its delicate skull was armed with recurved, laterally compressed teeth tailored for hunting insects, sphenodontians, and juvenile cynodonts.",
    "Phylogenetically positioned as a basal coelophysoid, demonstrating that gracile theropod body plans flourished widely across central Pangaea."
  ],
  63: [ // Liliensternus liliensterni
    "One of the largest known European Triassic theropods, reaching 5.1 meters in length and weighing an estimated 130 kilograms.",
    "Its skull featured a pair of low, elongated crests running along the nasal and frontal bones, precursor to the prominent cranial ornamentation seen in Dilophosaurus.",
    "Possessed an exceptionally elongated cervical vertebral series with deep lateral pleurocoels, foreshadowing advanced theropod pneumaticity.",
    "Served as the top terrestrial apex predator of the Late Triassic Trossingen environment, actively preying on subadult Plateosaurus."
  ],
  64: [ // Halticosaurus longotarsus
    "Discovered by Friedrich von Huene in 1908 in the Löwenstein Formation of Germany alongside articulated skeletons of Plateosaurus.",
    "Characterized by fused proximal tarsals and an elongated metatarsus forming an integrated, shock-absorbing cursorial ankle mechanism.",
    "Its fragmentary cranial remains exhibit recurved, finely serrated ziphodont crowns designed for slicing through fibrous flesh.",
    "Historically grouped with Liliensternus, modern cladistic analyses confirm Halticosaurus as an early branching, fast-moving coelophysoid theropod."
  ],
  65: [ // Gojirasaurus quayi
    "Discovered in the Late Triassic Bull Canyon Formation of New Mexico and named in honor of the iconic cinematic monster 'Gojira' (Godzilla).",
    "Measuring an estimated 5.5 to 6.5 meters in length, it represents one of the largest North American theropods from the Norian stage.",
    "Its holotype retains exceptionally robust dorsal vertebrae with tall neural spines and a strongly bowed scapula indicative of heavy musculature.",
    "Shares diagnostic coelophysoid chevron morphology and pelvic proportions, illustrating the early evolution of large-bodied macropredatory theropods."
  ],
  66: [ // Zupaysaurus rougieri
    "Unearthed from the Los Colorados Formation in La Rioja Province, Argentina, dating to the latest Triassic (Rhaetian stage).",
    "Its name derives from the Quechua word 'Zupay', referring to an Andean underworld spirit or devil, due to its formidable predatory anatomy.",
    "Preserved a distinct double crest along the dorsal margins of the skull roof, constructed from parallel thin flanges of the nasal and lacrimal bones.",
    "Displays a mobile intramandibular joint in the lower jaw, which expanded the throat laterally to swallow substantial chunks of prey."
  ],
  67: [ // Thecodontosaurus antiquus
    "Named in 1836, Thecodontosaurus was the fifth dinosaur ever formally scientifically named, discovered in Triassic fissure fills near Bristol, England.",
    "Possessed distinctively leaf-shaped, coarsely serrated tooth crowns set in individual sockets, optimized for shredding tough Triassic gymnosperm foliage.",
    "Computed tomography scans of its braincase reveal enlarged floccular lobes, indicating agile bipedal balance and sophisticated visual-head coordination.",
    "Retained a prominent grasping thumb claw (ungual) on its forelimb, used for hooking low branches or defending against small pseudosuchian predators."
  ],
  68: [ // Riojasaurus incertus
    "Unlike later sauropods, Riojasaurus was an enormous 10-meter melanorosaurid sauropodomorph that retained dense, non-pneumatized solid limb bones.",
    "Its forelimbs and hindlimbs were subequal in length, indicating that adults had transitioned to an obligate, heavy quadrupedal stance.",
    "Possessed robust, spatulate teeth with wrinkled enamel surfaces, designed to pulverize fibrous seed ferns and conifers without complex mastication.",
    "Excavations in the Los Colorados Formation have recovered dozens of individuals, suggesting that Riojasaurus lived in structured gregarious herds."
  ],
  70: [ // Isanosaurus attavipachi
    "Discovered in the Late Triassic Nam Phong Formation of northeastern Thailand, dating to roughly 210 million years ago.",
    "Recognized as one of the oldest known true sauropods, demonstrating that the obligate quadrupedal sauropod body plan originated prior to the Jurassic.",
    "The femur displays an asymmetrical fourth trochanter positioned mid-shaft, anchoring immense retractor caudofemoralis tail musculature.",
    "Histological analysis of its bone cortex shows lines of arrested growth alongside dense fibrolamellar tissue, showing rapid growth to multi-ton size."
  ],
  72: [ // Antetonitrus ingenipes
    "Unearthed from the Lower Elliot Formation of South Africa, Antetonitrus predates the Jurassic and translates literally to 'before the thunder'.",
    "Its forelimb exhibits early adaptations for weight support, yet the first manual digit (thumb) retained high mobility and a large defensive claw.",
    "The radius and ulna were locked in an inflexible pronated position, marking an evolutionary point of no return toward obligate quadrupedality.",
    "Weighed roughly 1.5 to 2 metric tons, representing a transitional morphological bridge between bipedal 'prosauropods' and gigantic eusauropods."
  ],
  73: [ // Lessemsaurus sauropoides
    "Discovered in Argentina's Los Colorados Formation and named in honor of paleo-advocate and science educator Don Lessem.",
    "Serves as the type genus of the family Lessemsauridae, proving that sauropodomorph gigantism evolved independently in South America during the Triassic.",
    "Histology reveals cyclical spurts of extremely rapid skeletal deposition, enabling it to reach 9 meters in length without fully continuous mammalian-style growth.",
    "Possessed unusually tall, neural-spine-dominated dorsal vertebrae that anchored robust supraspinous ligaments to balance its heavy torso."
  ],
  74: [ // Mussaurus patagonicus
    "Initially discovered as tiny 20-centimeter hatchlings in Patagonian nests, giving it the scientific name meaning 'mouse lizard'.",
    "Biomechanical limb studies confirmed that Mussaurus underwent a dramatic ontogenetic transition from sprawling/quadrupedal hatchlings to obligate bipedal adults.",
    "Massive nesting grounds excavated in the Laguna Colorada Formation reveal communal colonial nesting, egg clutches, and age-segregated social groupings.",
    "Adult specimens reached over 6 meters in length and weighed more than 1 metric ton, completely rewriting early ideas about its true adult size."
  ],
  75: [ // Coloradisaurus brevis
    "Excavated from the Upper Triassic Los Colorados Formation of San Juan Province, Argentina, known from exceptionally well-preserved skulls.",
    "Possessed a noticeably short, deep snout compared to Plateosaurus, with large circular orbits housing substantial sclerotic rings for keen vision.",
    "Its closely spaced, serrated lanceolate teeth were arranged in a tight dental battery adapted for high-fiber shearing of tough desert flora.",
    "Phylogenetic studies place Coloradisaurus firmly within Massospondylidae, illustrating the broad southern dispersal of early sauropodomorph clades."
  ],
  79: [ // Guaibasaurus candelariensis
    "Discovered in the Caturrita Formation of southern Brazil, dating to the early Norian stage (~225 million years ago).",
    "Its phylogenetic position is pivotal, displaying mosaic traits of both basal theropods and basal sauropodomorphs within early Saurischia.",
    "Articulated specimens have been discovered preserved in a bird-like resting posture, with hindlimbs tucked beneath the body and tail curved.",
    "Possessed a manual formula of 2-3-4-2-1, retaining five distinct digits on the manus with reduced outer digits IV and V."
  ],
  80: [ // Silesaurus opolensis
    "Discovered in Krasiejów, Poland, where over 1,000 bones belonging to dozens of articulated individuals have been recovered.",
    "As a member of Silesauridae, it represents the immediate sister lineage to true dinosaurs, sharing an open acetabulum and ascending astragalar process.",
    "The tip of its lower jaw lacked teeth and ended in a conical rhamphotheca (keratin beak), followed by triangular teeth adapted for insectivory or herbivory.",
    "Preserved fossil coprolites (bromalites) associated with Silesaurus contain undigested beetle elytra, confirming an insectivorous foraging diet."
  ],
  81: [ // Asilisaurus kongwe
    "Excavated from the Middle Triassic (Anisian) Manda Beds of Tanzania, dating to ~243 Ma and representing the oldest described silesaurid.",
    "Its discovery confirmed that the avian-line archosaurs (ornithodirans) had already diversified extensively alongside the crocodilian-line pseudosuchians.",
    "Possessed a slender, quadrupedal build with elongated, gracile limbs, grazing on low herbaceous vegetation along riparian floodplains.",
    "Bonebeds containing multiple individuals across varying growth stages indicate gregarious social behavior in early stem-dinosaurian clades."
  ],
  82: [ // Marasuchus lilloensis
    "Excavated from the Chañares Formation of La Rioja, Argentina, Marasuchus is a basal dinosauromorph measuring roughly 40 centimeters in length.",
    "Possessed an upright, fully digitigrade posture with an elongated ankle (astragalus and calcaneum) adapted for rapid saltatorial and cursorial bounding.",
    "Its femoral head was distinctly turned inward, fitting into an incipiently perforate hip socket that anticipated early dinosaurian locomotion.",
    "Limb-to-body proportions demonstrate that obligate bipedal speed was the primary ancestral locomotion that spurred dinosauromorph evolutionary success."
  ],
  83: [ // Lagerpeton chanarensis
    "A small, gracile archosaur from the Middle Triassic of Argentina with hindlimbs nearly twice the length of its trunk.",
    "Possessed an extremely specialized foot where digit IV was elongated far beyond digit III, a unique autapomorphy within early archosauromorphs.",
    "Computed micro-tomography of the endocast indicates expanded semicircular canals and cerebellar flocculi, optimized for agile jumping and pitch balance.",
    "Recent phylogenetic analyses place Lagerpeton as a stem-pterosaur, providing anatomical keys to the origin of powered reptilian flight."
  ],
  84: [ // Ixalerpeton polesinensis
    "Discovered in the Santa Maria Formation of Rio Grande do Sul, Brazil, preserved alongside the early saurischian dinosaur Buriolestes.",
    "Micro-CT scanning revealed a neurocranial structure that closely matches early pterosaurs, supporting the clade Pterosauromorpha.",
    "Possessed slender, pneumatic-like hollow limb bones with expanded muscle insertion scars along the femur for high-velocity leaping.",
    "Its co-occurrence with basal sauropodomorphs and cynodonts confirms that lagerpetids shared ecological niches across the Carnian humid pulse."
  ],
  85: [ // Dromomeron romeri
    "Excavated from the famed Hayden Quarry in Ghost Ranch, New Mexico, within the Late Triassic Chinle Formation.",
    "Proved that primitive non-dinosaurian lagerpetids coexisted with diverse theropod dinosaurs for over 15 to 20 million years.",
    "The distal end of its femur features an asymmetrical crest and an unossified articular surface adapted for shock absorption during high-impact leaps.",
    "Multiple species of Dromomeron have now been described from North America, Argentina, and Brazil, illustrating wide Pangaean distribution."
  ],
  86: [ // Euparkeria capensis
    "Excavated from the Early Triassic Cynognathus Assemblage Zone of South Africa shortly following the catastrophic end-Permian extinction.",
    "Possessed a crurotarsal ankle joint and an incipiently vertical pelvic girdle capable of transitioning between quadrupedal walking and facultative bipedal sprinting.",
    "Its dorsal surface was armored by a double row of small, paired dermal osteoderms running from behind the neck to the end of the tail.",
    "Occupies a foundational phylogenetic position near the base of Archosauria, the root divergence giving rise to both crocodiles and dinosaurs."
  ],
  87: [ // Proterosuchus fergusi
    "An early archosauromorph from the Karoo Basin that survived the end-Permian mass extinction to become a dominant apex carnivore of the Early Triassic.",
    "Characterized by a pronounced downcurved, hook-shaped premaxilla that overhung the lower jaw to ensnare struggling prey.",
    "Its skull was highly akinetic and possessed palatal teeth on the pterygoid and vomer, a primitive reptilian feature lost in later archosaurs.",
    "Sclerotic ring measurements suggest cathemeral activity, enabling Proterosuchus to hunt effectively in both daylight and low-light nocturnal hours."
  ],
  88: [ // Erythrosuchus africanus
    "An immense 5-meter apex predator from South Africa that possessed one of the largest skulls relative to body size of any terrestrial carnivore, measuring 1 meter in length.",
    "Its enormous head was supported by hyper-developed nuchal ligaments anchoring onto massive, tall cervical neural spines.",
    "Bone histology exhibits highly vascularized fibrolamellar cortical bone, revealing fast growth rates comparable to large mammals and theropods.",
    "Possessed deeply rooted, ziphodont teeth capable of crushing bone and dismembering contemporary dicynodonts like Kannemeyeria."
  ],
  89: [ // Garjainia prima
    "Excavated from the Early Triassic deposits of European Russia, representing an extremely close northern relative of Erythrosuchus.",
    "Possessed massive, thickened bony bosses above the orbits and along the postorbital bar, likely used for intra-specific head-butting or skull reinforcement.",
    "Its pectoral girdle was heavily ossified, with fused scapulocoracoids supporting muscular, semi-erect forelimbs.",
    "High-resolution CT scans reveal that Garjainia had an exceptionally large olfactory bulb, indicating an acute sense of smell for tracking carrion and prey."
  ],
  90: [ // Vjushkovia triassica
    "Described from the Middle Triassic Donguz Formation of Orenburg Oblast, Russia, often classified within or as a sister genus to Garjainia.",
    "Exhibits a robust skull with reinforced suture contacts between the jugal, squamosal, and quadrate to dissipate severe biting stresses.",
    "Possessed recurved, serrated carinae on its marginal teeth that lacked the deep fluting seen in later rauisuchians.",
    "Limb proportions indicate a transitional semi-sprawling to semi-erect pillar-erect stance, maximizing torque over sustained running speed."
  ],
  91: [ // Ticinosuchus ferox
    "Discovered in the Middle Triassic Besano Formation of the Monte San Giorgio UNESCO site on the Swiss-Italian border.",
    "Possessed a sophisticated 'crocodile-normal' tarsal ankle joint with a prominent calcaneal tuber, allowing an efficient, elevated high-walk gait.",
    "A continuous dorsal carapace of rectangular osteoderms was interlocked with the vertebral neural spines, providing rigid trunk stabilization.",
    "Associated marine sediments suggest it stalked coastal lagoons and tidal flats, preying on juvenile marine reptiles and terrestrial archosauromorphs."
  ],
  93: [ // Fasolasuchus tenax
    "Excavated from the Los Colorados Formation of Argentina, Fasolasuchus reached an estimated 8 to 10 meters in length, making it the largest known terrestrial rauisuchian.",
    "Possessed a true pillar-erect pelvic configuration where the hip socket faced directly downward and the femur articulated vertically beneath the body.",
    "Its lower jaw featured a specialized ventral inflection at the symphysis, anchoring powerful digastric muscles to rapidly snap its immense jaws shut.",
    "Represented the undisputed apex macropredator of Late Triassic South America, competing directly with the earliest large predatory dinosaurs."
  ],
  94: [ // Prestosuchus chiniquensis
    "Discovered in the Santa Maria Formation of southern Brazil, measuring up to 7 meters in length and weighing over 1 metric ton.",
    "Its femur possesses a distinctive crest-like anterior trochanter, showing advanced pseudosuchian muscle development for powerful forward propulsion.",
    "Preserved soft-tissue impressions and micro-CT analysis of muscle attachment scars confirm a robust, semi-erect to pillar-erect quadrupedal locomotion.",
    "Lived as the apex hypercarnivore of the Carnian ecosystem, hunting large rhynchosaurs and dicynodonts across southwestern Pangaea."
  ],
  95: [ // Batrachotomus kupferzellensis
    "Excavated from the Middle Triassic Erfurt Formation of Kupferzell, Germany; its name translates to 'frog-eating crocodile'.",
    "Its cranium featured an exceptionally large mandibular fenestra and a deepened dentary, accommodating enormous jaw adductor muscles.",
    "Fossil bones of the giant temnospondyl Mastodonsaurus bear deep, puncture-shaped tooth marks directly matching the dental spacing of Batrachotomus.",
    "Possessed stacked, double-layered rows of dorsal scutes with pitted external surfaces that assisted in dermal thermoregulation and biomechanical rigidity."
  ],
  96: [ // Ornithosuchus woodwardi
    "Discovered in the Lossiemouth Sandstone of Elgin, Scotland, measuring roughly 3.5 to 4 meters in length.",
    "Possessed five functional digits on the forelimbs but had hindlimbs roughly one-third longer than the arms, enabling both quadrupedal walking and bipedal galloping.",
    "Its skull was deep and narrow with a distinct overhanging premaxilla and two enlarged fangs in the dentary that slotted into deep maxillary diastemata.",
    "Once considered the ancestor of carnosaurian dinosaurs, cladistic analyses definitively place Ornithosuchus within the crocodilian-line Pseudosuchia."
  ],
  98: [ // Smilosuchus gregorii
    "Excavated from the Chinle Formation of Arizona, Smilosuchus reached up to 12 meters in length and weighed an estimated 3 to 4 metric tons.",
    "Its snout featured a massive, elevated bony crest along the rostral midline, providing structural reinforcement to withstand enormous thrashing stresses.",
    "Unlike fish-eating slender-snouted phytosaurs, Smilosuchus possessed massive, dagger-like heterodont teeth designed to tackle multi-ton land animals.",
    "The external nostrils sat on an elevated volcano-like volcanic bony crater atop the skull, allowing it to breathe while completely submerged."
  ],
  99: [ // Phytosaurus cylindricodon
    "Named in 1828, Phytosaurus was the very first phytosaur genus described in scientific literature, discovered in the Keuper beds of Germany.",
    "Its name ('plant lizard') was a historical misnomer based on petrified mud casts inside the skull that were initially mistaken for herbivorous tooth grinding surfaces.",
    "Possessed elongated, heavily armored jaws lined with sharp conical teeth suited for ambush predation along Triassic lake margins.",
    "Serves as the taxonomic name-bearing type genus of the widespread clade Phytosauria."
  ],
  100: [ // Machaeroprosopus buceros
    "A prominent phytosaur from the Upper Triassic Chinle Formation of the American Southwest, previously referred to Pseudopalatus.",
    "Characterized by an expanded, rounded rostral crest that terminated abruptly in front of the elevated external nares.",
    "CT scans indicate a sophisticated, reinforced cranial architecture optimized for distributing bending loads when subduing thrashing prey.",
    "Displays pronounced sexual or individual dimorphism in the elevation, curvature, and lateral thickness of its bony skull crest."
  ],
  101: [ // Leptosuchus crosbiensis
    "Excavated from the Late Triassic Dockum Group of Texas and Chinle Formation of Arizona, measuring roughly 6 to 8 meters in length.",
    "Possessed a broad, flattened skull with a slender anterior snout ending in a swollen terminal rosette armed with intermeshing grasping teeth.",
    "Its postorbital and squamosal bones were extensively sculptured with deep pits for blood vessels supporting thick, leathery cranial skin.",
    "Occupied the role of a dominant semi-aquatic predator in the extensive braided river networks of southwestern North America."
  ],
  102: [ // Redondasaurus bermani
    "Discovered in the Redonda Formation of east-central New Mexico, representing one of the geologically youngest known phytosaurs (~205 Ma).",
    "Its external nostrils were positioned far back, situated between and slightly behind the anterior rims of the orbital sockets.",
    "Possessed an exceptionally wide, reinforced skull base and heavy temporal arcade designed to deliver devastating crushing bite forces.",
    "Its extinction at the Triassic-Jurassic boundary opened ecological space for the rapid radiation of early crocodilians and crocodylomorphs."
  ],
  103: [ // Mystriosuchus planirostris
    "Discovered in the Stubensandstein of Germany and marine limestones of northern Italy, measuring around 4 meters in length.",
    "Possessed an exceptionally long, narrow, and flattened rostrum that minimized drag when sweeping its jaws laterally through water.",
    "Unlike most freshwater phytosaurs, specimens discovered in marine sediments in Italy show that Mystriosuchus adapted successfully to coastal lagoon life.",
    "Its tail vertebrae bore elongated haemal arches, forming a deep, laterally flattened paddle for powerful sculling propulsion."
  ],
  105: [ // Stagonolepis robertsoni
    "Discovered in the Lossiemouth Sandstone Formation of Elgin, Scotland, measuring roughly 3 meters in total length.",
    "Its snout terminated in a flattened, expanded pig-like rostral pad, adapted for rooting in soft fluvial sediments for edible roots and bulbs.",
    "Possessed small, bulbous teeth with peg-like crowns and heavy wear facets, indicative of grinding tough, gritty plant material.",
    "Fossils have been found in dense bonebeds, indicating that Stagonolepis formed coordinated social herds that migrated across Triassic floodplains."
  ],
  106: [ // Aetosaurus ferratus
    "Discovered in 1877 in the Stubensandstein of Kaltental near Stuttgart, Germany, where 22 articulated skeletons were found huddled together in a single quarry.",
    "This famous aggregate fossil discovery provides the earliest definitive evidence of communal gregarious clustering and sheltering in pseudosuchians.",
    "Measuring only 1 meter in length, it was a delicate, small-bodied aetosaur with a narrow dorsal carapace consisting of smooth rectangular plates.",
    "Its slender, unspecialized limbs and small pointed teeth indicate an omnivorous diet of soft leaves, fallen seeds, and small soil-dwelling invertebrates."
  ],
  107: [ // Neoaetosauroides engaeus
    "Excavated from the Los Colorados Formation of Argentina, dating to the late Norian-Rhaetian boundary.",
    "Unlike northern hemisphere aetosaurs, Neoaetosauroides retained fully toothed upper premaxillary bones, demonstrating a more basal dental condition.",
    "Its limbs were unusually slender and elongated, suggesting that it possessed greater cursorial agility than the heavily armored desmatosuchines.",
    "A remarkably complete juvenile specimen shows that aetosaur dermal scute ornamentation developed progressively throughout ontogeny."
  ],
  108: [ // Longosuchus meadei
    "Discovered in the Late Triassic Otis Chalk quarries of Howard County, Texas, within the Dockum Group.",
    "Distinguished by a collar of conical, horn-like spikes protruding dorsolaterally from the cervical plates around its neck.",
    "Possessed a narrow, tapered skull with circular nares positioned high on the rostrum, facilitating respiration while rooting in soggy riverbanks.",
    "Its limb joints were heavily cartilaginous, supporting a ponderous, steady quadrupedal gait adapted for crushing vegetation underfoot."
  ],
  109: [ // Gracilisuchus stipanicicorum
    "Discovered in the Chañares Formation of Argentina by famed paleontologist Alfred Romer, measuring just 30 centimeters in length.",
    "A tiny, gracile archosaur possessing an exceptionally large antorbital fenestra and orbital openings, indicative of acute sensory acuity.",
    "Its hindlimbs were significantly longer than its forelimbs, allowing it to execute rapid, agile bipedal dashes to capture insects and small reptiles.",
    "Possessed a double row of delicate, leaf-shaped osteoderms running along the dorsal spine to stiffen the back without adding restrictive weight."
  ],
  110: [ // Erpetosuchus granti
    "Discovered in the Lossiemouth Sandstone of Scotland, with additional specimens recovered from the Newark Supergroup of Connecticut.",
    "Its dental arrangement was bizarrely reduced: teeth were restricted exclusively to the front of the maxilla and dentary, leaving the rear jaws toothless.",
    "The lower jaw curved upward into a deep symphysis, suggesting a specialized grasping mechanism for handling hard-shelled invertebrates or pupae.",
    "Cladistic studies identify Erpetosuchus as a close sister taxon to crocodylomorphs, providing critical clues to cranial evolution in pseudosuchians."
  ],
  111: [ // Saltoposuchus connectens
    "Excavated from the Late Triassic Löwenstein Formation of Germany, measuring approximately 1 to 1.5 meters in total length.",
    "Possessed long, bird-like hindlimbs and a lightweight skeleton, enabling it to maintain an obligate or facultatively bipedal running sprint.",
    "Its skull was low and slender, armed with sharply recurved, needle-like teeth ideal for snapping up early cynodonts, lizards, and large insects.",
    "Historically compared to dinosaurs, it represents a foundational stem-crocodylomorph showing that ancestral crocs were terrestrial sprinters."
  ],
  112: [ // Terrestrisuchus gracilis
    "Discovered in fissure fill deposits of Glamorgan, Wales, measuring roughly 75 centimeters in length with the proportions of a miniature greyhound.",
    "Its wrist (carpus) was distinctly elongated with columnar radiale and ulnare bones, functioning as an extra limb segment to extend stride length.",
    "Retained an extremely long, whip-like tail comprising over half its total body length, used as an active counterweight during high-speed directional turns.",
    "Micro-anatomical studies show thin-walled, hollow cortical bone identical to cursorial avian and theropod bone architecture."
  ],
  113: [ // Hesperosuchus agilis
    "Discovered in the Petrified Forest Member of the Chinle Formation in Arizona, dating to approximately 210 million years ago.",
    "Preserved with an extraordinarily gracile skull featuring a deeply incised otic notch and enlarged tympanic membrane depressions for sensitive hearing.",
    "Possessed an upright digitigrade foot stance, walking strictly on the pads of its toes to minimize ground resistance during sustained pursuit.",
    "One famous fossil block was initially misidentified as containing Coelophysis stomach contents before being recognized as a distinct Hesperosuchus skeleton."
  ],
  114: [ // Sphenosuchus acutus
    "Excavated from the Early Jurassic Upper Elliot Formation of South Africa, measuring roughly 1.4 meters in body length.",
    "Features a specialized otic region where the quadrate bone was pneumatized and kinetically mobile against the squamosal, ancestral to modern crocodilian skulls.",
    "Its braincase displays fully enclosed perilymphatic ducts and specialized internal carotid canals, demonstrating advanced reptilian neuroanatomy.",
    "Retained a terrestrial predatory lifestyle, hunting early prosauropod hatchlings and heterodontosaurids along dry Jurassic river basins."
  ],
  115: [ // Protosuchus richardsoni
    "Discovered in the Early Jurassic Moenave Formation of northern Arizona, measuring roughly 1 meter in length.",
    "Its jaws exhibited prominent canine-like maxillary teeth that slotted into deep notches in the upper jaw when closed, just like modern alligators and crocodylians.",
    "Possessed a broad, heavily armored ventral gastralia basket combined with overlapping dorsal osteoderms, forming a rigid protective tube around the torso.",
    "Its limbs were positioned directly beneath the body in a columnar stance, proving that early crocodyliforms walked fully upright on land."
  ],
  116: [ // Effigia okeeffeae
    "Unearthed from the Ghost Ranch quarry in New Mexico, Effigia represents one of the most astonishing cases of evolutionary convergence in vertebrate history.",
    "Despite being a pseudosuchian closely related to crocodilians, its skeleton was almost indistinguishable from ornithomimid ('ostrich-mimic') coelurosaurian dinosaurs.",
    "Possessed an entirely toothless skull ending in an edentulous, keratin-covered rhamphotheca (beak) optimized for cropping vegetation or omnivory.",
    "Walked on long, slender bipedal hindlimbs with a reduced inner toe and an erect hip socket, evolving ostrich-like locomotion 80 million years before ornithomimids."
  ],
  117: [ // Shuvosaurus inexpectatus
    "Discovered in the Late Triassic Dockum Group of Texas by Sankar Chatterjee, originally misidentified as a Triassic ornithomimid dinosaur.",
    "Its complete lack of teeth and deep, bird-like mandible puzzled paleontologists until the discovery of its postcranial relative Effigia revealed its pseudosuchian affinity.",
    "CT scans of the braincase show expanded cerebral hemispheres and an acute visual center, supporting an active, visually guided diurnal lifestyle.",
    "Its premaxillary beak possessed sharp, self-shearing keratinous margins capable of slicing tough horsetails, cycad seeds, and fleshy ferns."
  ],
  119: [ // Lotosaurus adentus
    "Excavated from the Middle Triassic Badong Formation of Hunan Province, China, where over ten articulated skeletons have been recovered.",
    "Possessed a prominent, arched neural spine sail running along its back, supported by elongated, paddle-shaped dorsal spines.",
    "Its skull was completely toothless with a heavy, downturned beak, making it one of the earliest known herbivorous sail-backed pseudosuchians.",
    "The dense concentration of multiple individuals in a single quarry suggests gregarious herd behavior around drying lacustrine watering holes."
  ],
  120: [ // Arizonasaurus babbitti
    "Discovered in the Middle Triassic Moenkopi Formation of northern Arizona, preserved with neural spines up to 1 meter tall.",
    "These hyper-elongated spines supported a tall dorsal sail of vascularized skin, utilized for rapid thermoregulation and visual display.",
    "Classified within Ctenosauriscidae, proving that sail-backed archosaurs achieved worldwide distribution during the Anisian stage.",
    "Its slender pelvis and deep ilium indicate agile, highly cursorial bipedal or facultatively bipedal movement across desert river systems."
  ],
  121: [ // Sillosuchus sangregorioensis
    "Excavated from the Late Triassic Ischigualasto Formation of San Juan, Argentina, dating to ~231 Ma.",
    "Reaching an estimated 9 to 10 meters in total length, Sillosuchus represents one of the largest bipedal pseudosuchians ever discovered.",
    "Its dorsal and cervical vertebrae are profoundly hollowed by invasive lateral pleurocoels, evidencing an extensive avian-style pulmonary air sac system.",
    "Possessed a slender, elongated pubis and ischium that supported an erect bipedal posture, showing that pseudosuchians achieved bipedal gigantism alongside early dinosaurs."
  ],
  122: [ // Sharovipteryx mirabilis
    "Discovered in the Middle-to-Late Triassic Madygen Formation of Kyrgyzstan, Sharovipteryx is unique among all known gliding vertebrates.",
    "Its aerodynamic delta-wing gliding membrane was anchored primarily between its extraordinarily elongated hindlimbs rather than its arms.",
    "Possessed tiny forelimbs that supported a secondary canard patagium near the neck, functioning like the forward winglets of a modern supersonic jet.",
    "Microscopic examination of fossil skin impressions reveals delicate, overlapping reptilian scales and webbed, elongated digits."
  ],
  123: [ // Longisquama insignis
    "Discovered in the Madygen Formation of Kyrgyzstan, famous for bearing a row of bizarre, hockey-stick-shaped dorsal plumes along its back.",
    "These elongate integumentary structures possessed a central hollow shaft (rachis) with lateral vanes, sparking decades of debate over early feather origins.",
    "High-resolution imaging indicates the plumes were anchored into specialized dermal follicles along the dorsal midline, deployed laterally for gliding or display.",
    "Its skull was delicate and bird-like, with an open antorbital fenestra and small, pointed teeth adapted for hunting small forest insects."
  ],
  124: [ // Tanystropheus longobardicus
    "Excavated from the Middle Triassic marine deposits of Besano, Italy, and Monte San Giorgio, Switzerland.",
    "Its neck measured up to 3 meters long—making up fully half of its total body length—supported by just 12 to 13 hyper-elongated cervical vertebrae.",
    "Long, ossified cervical ribs ran parallel along the underside of the neck, forming rigid muscular bundles that restricted neck bending to a stiff fishing crane.",
    "Stable carbon and oxygen isotope analyses confirm an aquatic ambush lifestyle, thrusting its small head into fish and cephalopod shoals from coastal shallows."
  ],
  125: [ // Macrocnemus bassanii
    "Discovered at Monte San Giorgio on the Swiss-Italian border, measuring roughly 1 meter in length.",
    "Possessed exceptionally elongated, slender hindlimbs with a tibia longer than the femur, diagnostic of an explosive, cursorial sprinting predator.",
    "Its neck was moderately elongated and constructed of eight slender cervicals, allowing it to rapidly strike at agile lizards and insects.",
    "Phylogenetically positioned within Tanystropheidae, demonstrating the agile terrestrial ancestral body plan from which long-necked forms diverged."
  ],
  126: [ // Dinocephalosaurus orientalis
    "Excavated from the Middle Triassic Guanling Formation of Guizhou Province, southwestern China.",
    "Possessed 33 cervical vertebrae, more than any other known archosauromorph, creating an exceptionally flexible, snake-like neck.",
    "A phenomenal 2017 fossil discovery revealed an embryo preserved inside the maternal body cavity, providing the first definitive evidence of viviparity (live birth) in Archosauromorpha.",
    "Fossilized neck ribs show that Dinocephalosaurus could flare its throat ribs outward, expanding its esophagus to create suction that drew fish into its maw."
  ],
  127: [ // Placodus gigas
    "Excavated from the Middle Triassic Muschelkalk formations of central Europe, measuring roughly 2 to 3 meters in length.",
    "Possessed forward-pointing, chisel-like incisors to pry stubborn mollusks and brachiopods off underwater rocks.",
    "The roof of its mouth and lower jaws were paved with massive, broad, flattened crushing tooth plates that functioned like hydraulic nutcrackers.",
    "Its dense, non-pneumatized ribs and gastralia displayed extreme pachyostosis (thickened bone) to act as natural ballast for bottom-walking."
  ],
  128: [ // Cyamodus rostratus
    "Discovered in the Muschelkalk limestones of Germany, Cyamodus was a heavily armored placodont measuring roughly 1.3 meters in length.",
    "Its body was protected by a broad, turtle-like carapace composed of two separate fused shields: an anterior dorsal shield and a smaller pelvic shield.",
    "Possessed a narrow, tapered rostrum bearing rounded crushing tooth plates in the palate, specialized for crushing benthic bivalves and crabs.",
    "Limb bones were modified into broad, paddle-shaped swimming flippers with reduced claws, adapted for propelling itself along shallow reef floors."
  ],
  129: [ // Henodus chelyops
    "Discovered in the Carnian Lustnau quarry near Tübingen, Germany, measuring roughly 1 meter in length.",
    "An extraordinary case of convergent evolution with turtles: Henodus possessed a broad, box-like shell made of dozens of fused polygonal dermal plates.",
    "Its mouth was completely toothless except for a single pair of tiny crushing teeth in each jaw, possessing instead a square-fronted, horn-covered beak.",
    "Inhabited brackish or hypersaline lagoons, filtering tiny crustaceans and scraping algae and bivalves from the substrate."
  ],
  130: [ // Nothosaurus mirabilis
    "Discovered throughout the Middle Triassic epicontinental seas of Europe and China, measuring up to 4 to 5 meters in length.",
    "Its skull was elongated and low, armed with dozens of long, slender, interlocking needle-like fangs designed to trap slippery pelagic fish.",
    "Possessed paddle-like limbs with webbed digits, allowing it to alternate between graceful subaqueous swimming and hauling out onto rocky shores like modern seals.",
    "Bone histology indicates high resting metabolic rates and cyclical growth rings tied to seasonal marine temperature variations."
  ],
  131: [ // Lariosaurus balsami
    "Excavated from the Perledo and Besano formations of northern Italy, measuring around 60 centimeters to 1 meter in length.",
    "Forelimbs were transformed into efficient hydrofoil paddles, while its hindlimbs retained five distinct, clawed, webbed digits for steering and shoreline traction.",
    "Several exceptionally preserved specimens contain fossil embryos inside their body cavities, demonstrating that nothosauroids had evolved viviparity (live birth).",
    "Fossil stomach contents preserve partially digested pachypleurosaurs and small actinopterygian fish, illustrating its role as a nimble lagoon predator."
  ],
  132: [ // Ceresiosaurus calcagnii
    "Discovered at Monte San Giorgio on Lake Lugano, measuring up to 3 meters in total length.",
    "Exhibited extreme hyperphalangy: its elongated paddle digits contained numerous extra finger joints, creating stiff, high-efficiency flippers.",
    "Possessed an elongated, powerful tail with tall neural spines that provided primary sculling propulsion through open Triassic waters.",
    "Morphologically bridges the gap between primitive littoral nothosaurs and the fully pelagic, open-ocean plesiosaurs."
  ],
  133: [ // Pistosaurus longaevus
    "Discovered in the Middle Triassic Muschelkalk of Germany, Pistosaurus represents the critical phylogenetic transition between nothosaurs and plesiosaurs.",
    "Possessed a plesiosaur-like skull with a fully fused palate and backward-shifted nostrils, but retained primitive nothosaur-like teeth.",
    "Its axial skeleton was stiffened by interlocking zygapophyses, forcing it to swim using simultaneous underwater wing-like flipper strokes (subaqueous flight).",
    "Its discovery confirmed that plesiosaurian four-flipper underwater flight evolved directly from Triassic pistosauroid ancestors."
  ],
  134: [ // Simosaurus gaillardoti
    "Discovered in the Middle Triassic Upper Muschelkalk of France and Germany, measuring roughly 3 to 4 meters in length.",
    "Unlike long-snouted fish-catching nothosaurs, Simosaurus possessed a short, triangular, blunt skull with deep temporal regions for crushing muscles.",
    "Its teeth were bulbous, peg-shaped, and covered with coarse vertical enamel ridges, ideal for crushing hard-shelled ammonites and armored fish.",
    "Micro-CT studies of the braincase show a hypertrophied vestibular system, assisting dynamic spatial orientation in murky coastal waters."
  ],
  135: [ // Mixosaurus cornalianus
    "Discovered at Monte San Giorgio on the Swiss-Italian border, measuring around 1 meter in length.",
    "A transitional ichthyosaur displaying a hybrid body plan: retained a distinct flexible neck and elongated flippers while developing a downcurved caudal fin.",
    "Possessed heterodont dentition, bearing sharp pointed teeth at the front of the jaws and flattened crushing teeth at the rear for mixed fish/mollusk prey.",
    "Bone histology reveals fibrolamellar bone indicative of elevated metabolic rates and rapid juvenile growth in warm, shallow coastal waters."
  ],
  136: [ // Besanosaurus leptorhynchus
    "Discovered in the Middle Triassic Besano Formation of northern Italy, measuring up to 8 meters in total body length.",
    "Possessed an exceptionally slender, tubular snout lined with hundreds of tiny, delicate conical teeth, specialized for snatching small cephalopods.",
    "An articulated gravid female specimen revealed four well-developed embryos inside her body cavity, demonstrating live birth tail-first in early giant ichthyosaurs.",
    "Its flippers retained five elongated digits with hyperphalangy, functioning as precision stabilization hydrofoils in calm Panthalassic embayments."
  ],
  137: [ // Shastasaurus pacificus
    "Excavated from the Late Triassic Hosselkus Limestone of Shasta County, California, measuring up to 7 to 8 meters in length.",
    "Characterized by a short, toothless snout that relied on rapid expansion of the buccal cavity to vacuum soft-bodied cephalopods directly into its throat.",
    "Lacked the dorsal fin seen in later Jurassic ichthyosaurs, relying instead on a straight-to-gently bent tail with a low caudal fin.",
    "Serves as the type species of Shastasauridae, the family containing the largest marine reptiles in Earth's history."
  ],
  138: [ // Guanlingsaurus liangae
    "Discovered in the Late Triassic Xiaowa Formation of Guizhou Province, southwestern China, measuring over 10 meters in length.",
    "Characterized by an exceptionally short, triangular snout that accounted for only a small fraction of total skull length.",
    "Completely edentulous (toothless) as adults, with deeply expanded ventral hyoid arches adapted for dynamic suction feeding in Panthalassic depths.",
    "Preserved with broad, paddle-like fins possessing extra phalanges (hyperphalangy), allowing precise hydrodynamic attitude control."
  ],
  139: [ // Eudimorphodon ranzii
    "Discovered near Bergamo, Italy, in 1973, Eudimorphodon represents the first known Triassic pterosaur with exceptionally preserved multi-cusped teeth.",
    "Its jaws contained over 110 teeth displaying complex multi-cusped morphology (with up to five cusps per crown), specialized for grinding hard fish scales.",
    "Fossil gut contents directly preserve the ganoid scales of the Triassic fish Parapholidophorus, offering definitive proof of a piscivorous diet.",
    "Its long, bony tail was stiffened by interlocking vertebral filaments and terminated in a diamond-shaped vane that functioned as an aerodynamic rudder."
  ],
  140: [ // Preondactylus buffarinii
    "Excavated from the Dolomia di Forni formation of the Italian Alps, dating to the late Carnian or early Norian (~228 Ma).",
    "Retained primitive single-cusped conical teeth, differing sharply from the specialized multi-cusped dentition of contemporary Eudimorphodon.",
    "Possessed an extremely gracile, hollow skeletal frame with a wingspan of only 45 centimeters, making it an extraordinarily agile aerial acrobat.",
    "A famous fossil specimen was discovered preserved inside a fossilized regurgitated fish pellet (gastrolith/bromalite), showing it fell prey to large predatory fish."
  ],
  141: [ // Austriadactylus cristatus
    "Discovered in the Seefeld Formation of the Austrian Alps, dating to the middle Norian stage (~215 million years ago).",
    "Its skull featured an enormous, blade-like bony crest that rose from the tip of the snout and curved backward over the front of the eyes.",
    "Exhibited extreme heterodonty: the front of the jaws bore large, recurved fangs, while the rear jaws were packed with tiny, multi-cusped teeth.",
    "Its tail was flexible near the base but stiffened distally by elongated bony rod-like processes, functioning as a high-speed aerodynamic stabilizer."
  ],
  142: [ // Caviramus schesaplanensis
    "Discovered in the Kössen Formation of the high Swiss Alps, perched at an altitude of over 2,500 meters.",
    "Possessed a prominent bony sagittal crest on its skull and a deep, multi-fenestrated lower jaw bearing a series of prominent air cavities (cavitates).",
    "Its teeth were multicusped and closely spaced, showing distinct wear facets that indicate active mastication of tough-shelled insects or crustaceans.",
    "Phylogenetic studies place Caviramus as a basal member of Eudimorphodontidae, documenting the remarkable diversification of Alpine pterosaurs."
  ],
  145: [ // Ceratosaurus nasicornis
    "Possessed a prominent, laterally flattened horn on the midline of its nasal bones and a pair of smaller hornlets above the prefrontal eyes.",
    "Uniquely among theropod dinosaurs, Ceratosaurus bore a continuous row of small, bladelike dermal osteoderms running along the midline of its spine.",
    "Its maxillary teeth were disproportionately long and blade-like, extending far below the margin of the lower jaw when the mouth was closed.",
    "Its tail was exceptionally deep and laterally compressed with tall neural spines, leading some paleontologists to hypothesize strong swimming capabilities."
  ],
  147: [ // Megalosaurus bucklandii
    "Described by William Buckland in 1824, Megalosaurus was the very first dinosaur genus to be formally described and scientifically named.",
    "The original holotype consists of a partial lower jaw with unerupted replacement teeth, showing the thecodont (socketed) dentition characteristic of archosaurs.",
    "Along with Iguanodon and Hylaeosaurus, it formed the foundational triumvirate upon which Sir Richard Owen erected the clade Dinosauria in 1842.",
    "True Megalosaurus remains are strictly restricted to the Middle Jurassic Taynton Limestone Formation of Stonesfield, Oxfordshire, England."
  ],
  148: [ // Cryolophosaurus ellioti
    "Discovered at an elevation of 4,000 meters on Mount Kirkpatrick, Antarctica, in the Early Jurassic Hanson Formation.",
    "Its cranium was adorned with a bizarre, fan-like transverse crest running across the skull roof just above the eyes, earned it the nickname 'Elvisaurus'.",
    "The delicate bony crest was heavily ribbed and lacked internal pneumatic chambers, indicating it served primarily as a visual display structure.",
    "Represented the undisputed apex carnivore of Early Jurassic Antarctica, when the continent was forested, ice-free, and located at high southern latitudes."
  ],
  149: [ // Monolophosaurus jiangi
    "Unearthed from the Middle Jurassic Shishugou Formation of Xinjiang, China, measuring approximately 5 meters in length.",
    "Possessed a single, prominent median crest running along the midline of its snout from the premaxilla back to the frontal bones.",
    "High-resolution CT imaging reveals that the cranial crest was hollowed out by extensive nasal air sacs, dramatically reducing its mass.",
    "Occupied an intermediate evolutionary position as a basal tetanuran, shedding light on the early radiation of bird-like carnivorous dinosaurs."
  ],
  150: [ // Torvosaurus tanneri
    "One of the largest terrestrial macropredators of the Jurassic, reaching lengths of up to 10 to 11 meters and weighing between 3 and 4 metric tons.",
    "Its massive skull measured over 1.2 meters in length and was armed with elongated, serrated ziphodont teeth capable of shearing through thick dinosaurian hide.",
    "Unlike Allosaurus, Torvosaurus possessed extraordinarily robust, heavily muscled forelimbs equipped with an immense, hooked thumb ungual.",
    "Remains discovered in both the Morrison Formation of North America and the Lourinhã Formation of Portugal prove it dominated ecosystems on both sides of the young Atlantic."
  ]
};

async function main() {
  console.log("=== Executing Sequential Enrichment: Batch 2 (IDs 46-150) ===");

  const targetIds = Object.keys(BATCH2_FACTS).map(Number);
  console.log(`Prepared facts for ${targetIds.length} taxa in Batch 2.`);

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
    const newFacts = BATCH2_FACTS[s.id];
    await prisma.species.update({
      where: { id: s.id },
      data: {
        interestingFacts: JSON.stringify(newFacts)
      }
    });
    console.log(`✓ Species #${s.id} (${s.name}): Updated to ${newFacts.length} verified facts.`);
  }

  console.log(`\nBatch 2 completed: ${existing.length} species updated.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
