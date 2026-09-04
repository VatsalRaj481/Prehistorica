import '../src/dns-init.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// High-precision scientific fact banks for Batch 5 (IDs 476 to 543)
// 53 taxa: Cretaceous Hadrosaurs, Ankylosaurs, Sauropods, Pterosaurs, Marine Reptiles, Cephalopods
const BATCH5_FACTS: Record<number, string[]> = {
  476: [ // Einiosaurus procurvicornis
    "Discovered in the Two Medicine Formation of Montana, celebrated for its unique, forward-curving, hook-like nasal horn.",
    "The nasal horn curved strongly downward and forward over the front of the beak, functioning as a ritualized wrestling hook rather than an impaling weapon.",
    "Its parietosquamosal frill bore a pair of large, backward-pointing spikes (epiparietals) that projected straight from the top corners.",
    "Represents a key intermediate transitional evolutionary stage linking primitive centrosaurines like Centrosaurus to derived forms like Achelousaurus."
  ],
  477: [ // Achelousaurus horneri
    "Excavated from the Upper Cretaceous Two Medicine Formation of Montana, named in honor of paleontologist Jack Horner.",
    "Lacked true pointed horns, possessing instead heavily rugose, flattened bony pads (bosses) over both the snout and orbital regions.",
    "Its neck frill retained two prominent, straight, backward-directed spikes extending from the posterior parietal margin.",
    "Represents an exquisite example of anagenesis (lineage evolution without branching), directly descended from Einiosaurus and ancestral to Pachyrhinosaurus."
  ],
  478: [ // Nasutoceratops titusi
    "Discovered in the Kaiparowits Formation of southern Utah, dating to the late Campanian (~75.5 million years ago).",
    "Possessed extraordinarily long, forward-curving brow horns that extended almost horizontally over its snout, resembling modern cattle.",
    "Its snout was exceptionally deep and round, with an enlarged pneumatic nasal cavity that comprised over 75% of total pre-orbital skull length.",
    "Its short, round neck frill lacked large spikes, relying instead on its bull-like horns and deep snout profile for visual display and sparring."
  ],
  481: [ // Edmontosaurus annectens
    "One of the largest hadrosaurids, reaching lengths of up to 12 to 15 meters and an estimated weight exceeding 9 metric tons.",
    "Sensational 'mummy' specimens (such as AMNH 5060 and 'Dakota') preserve fossilized skin, muscle envelopes, hoof-like keratinous forefoot mitts, and soft-tissue fleshy combs atop the head.",
    "Housed a continuous dental battery containing over 1,000 tightly interlocking teeth that operated as an efficient grinding mill for tough conifer needles and twigs.",
    "Taphonomic evidence demonstrates that giant packs of Edmontosaurus formed the primary prey base for adult Tyrannosaurus rex across western North America."
  ],
  482: [ // Corythosaurus casuarius
    "Discovered along the Red Deer River in Alberta, Canada, within the Dinosaur Park Formation, named for its helmet-like cranial crest.",
    "Its hollow, semi-circular crest was formed from expanded nasal and premaxillary bones, housing convoluted internal acoustic air passages.",
    "Acoustic modeling indicates the crest functioned as a low-frequency resonating chamber capable of broadcasting foghorn-like vocalizations over long distances.",
    "Several fully articulated specimens preserve extensive impressions of tuberculate skin with polygonal scales covering the flanks and tail."
  ],
  483: [ // Maiasaura peeblesorum
    "Discovered by Jack Horner in the Two Medicine Formation of Montana, Maiasaura translates to 'good mother lizard'.",
    "Excavations at 'Egg Mountain' uncovered colonial nesting grounds, fossilized egg clutches, and nests containing altricial hatchlings with worn teeth.",
    "The presence of worn teeth in nestling hatchlings provided the first definitive proof that dinosaurs actively brought food to their young and engaged in prolonged parental care.",
    "Dense bonebeds containing an estimated 10,000 individuals indicate that Maiasaura traveled in colossal herds that migrated seasonally across coastal plains."
  ],
  484: [ // Tsintaosaurus spinorhinus
    "Discovered in the Jingangkou Formation of Shandong Province, China, dating to the late Campanian stage (~72 Ma).",
    "Famous for its iconic tubular cranial crest: once thought to be a unicorn-like spike, comprehensive re-examinations confirmed it formed the posterior wall of a broad hollow crest.",
    "The hollow crest was connected directly to the nasal cavity and functioned in species recognition, olfactory enhancement, and vocal resonance.",
    "Possessed robust, quadrupedal forelimbs and a heavy pelvic girdle, allowing it to transition effortlessly between four-legged browsing and bipedal running."
  ],
  485: [ // Lambeosaurus lambei
    "Discovered in the Dinosaur Park Formation of Alberta, Canada, serving as the foundational type genus of the subfamily Lambeosaurinae.",
    "Possessed a distinctive hatchet-shaped cranial crest comprising a vertical anterior blade and a slender, backward-pointing posterior horn.",
    "Exhibited pronounced sexual and ontogenetic dimorphism: adult males possessed significantly larger, more upright crests than females and juveniles.",
    "Its tail was deep and stiffened by a crisscrossing lattice of ossified tendons, providing balance while galloping or wading across coastal floodplains."
  ],
  487: [ // Ouranosaurus nigerensis
    "Excavated from the Elrhaz Formation of Niger, dating to the Early Cretaceous (Aptian stage, ~112 million years ago).",
    "Its dorsal vertebrae bore hyper-elongated, blade-like neural spines up to 1 meter tall, forming a high dorsal sail or thick muscular fat-storage hump.",
    "Possessed a wide, flattened, duck-like bill followed by specialized dental batteries, optimized for harvesting tough riparian ferns, horsetails, and shrubs.",
    "Retained a small, conical thumb spike on its first manual digit, utilized for defense against contemporary apex theropods like Suchomimus."
  ],
  488: [ // Saurolophus osborni
    "Discovered in the Horseshoe Canyon Formation of Alberta, with a closely related giant sister species (S. angustirostris) excavated in the Nemegt Formation of Mongolia.",
    "Possessed a solid, backward-pointing, rod-like cranial crest constructed from the nasal bones that projected over the top of the skull roof.",
    "Pristine skin impressions demonstrate that Saurolophus bore distinct vertical stripes of large, raised limpet-shaped scales along its tail and flanks.",
    "Proves that late hadrosaurine lineages migrated freely between East Asia and North America across the Cretaceous Beringian land bridge."
  ],
  489: [ // Olorotitan arharensis
    "Discovered in the Tsagayan Formation of the Amur Region in far eastern Russia, dating to the latest Maastrichtian (~66 Ma).",
    "Characterized by a unique, backward-pointing, fan-shaped cranial crest that rose vertically from the back of the skull like an inverted ax blade.",
    "Possessed an exceptionally elongated neck comprising 18 cervical vertebrae, more than any other known hadrosaur, providing broad vertical browse reach.",
    "Its sacrum and proximal caudal vertebrae were reinforced by additional fused bony bridges, supporting a massive body mass near the K-Pg boundary."
  ],
  490: [ // Shantungosaurus giganteus
    "Discovered in the Wangshi Group of Shandong Province, China, measuring up to 15 to 16.6 meters in length and weighing an estimated 16 to 18 metric tons.",
    "Represents the largest known ornithischian and non-sauropod dinosaur in the fossil record, rivaling medium-sized sauropods in total bulk.",
    "Its massive skull measured 1.63 meters in length, equipped with expansive dental batteries containing roughly 1,500 densely packed teeth.",
    "Monospecific bonebeds in Zhucheng contain thousands of disarticulated bones, showing that Shantungosaurus formed colossal, landscape-altering herds."
  ],
  491: [ // Tenontosaurus tilletti
    "Excavated from the Cloverly Formation of Montana and Wyoming, measuring roughly 6 to 7 meters in total length.",
    "Characterized by an extraordinarily long, deep tail that accounted for nearly two-thirds of its total body length, stiffened by dense bundles of ossified tendons.",
    "Frequently discovered in direct taphonomic association with multiple skeletons of the sickle-clawed dromaeosaur Deinonychus, evidencing a classic predator-prey relationship.",
    "Histological analysis shows that Tenontosaurus achieved sexual maturity well before reaching full skeletal growth, reproducing while still subadults."
  ],
  492: [ // Hypsilophodon foxii
    "Excavated from the Early Cretaceous Wessex Formation of the Isle of Wight, England, measuring roughly 1.8 meters in length.",
    "Historically misinterpreted in 19th-century literature as a tree-dwelling, grasping climber; modern biomechanical studies proved it was a strictly terrestrial sprinter.",
    "Possessed an exceptionally long, stiffened tail counterbalanced by slender hindlimbs, allowing high-speed evasive maneuvering through forest scrub.",
    "Retained five distinct digits on the manus and a small premaxillary dental battery, representing a conservative, basal neornithischian body plan."
  ],
  493: [ // Thescelosaurus neglectus
    "Discovered in the Hell Creek and Lance Formations of North America, living up to the very moment of the K-Pg extinction event.",
    "A remarkably heavy, stocky ornithopod that possessed robust limbs, heavy shoulders, and small dermal osteoderms along its flanks.",
    "The famous 'Willo' fossil specimen was celebrated in 2000 for an ironstone concretion originally claimed to be a fossilized four-chambered heart with an aorta.",
    "Subsequent high-resolution micro-CT scans reinterpreted the concretion as a mineralized sediment fill, though it remains a milestone in paleopathology research."
  ],
  495: [ // Edmontonia longiceps
    "Discovered in the Horseshoe Canyon Formation and Dinosaur Park Formation of Alberta, Canada, measuring roughly 6.6 meters in length.",
    "A heavily armored panoplosaurin nodosaurid that lacked a tail club, relying instead on a massive shield of fused shoulder spikes and lateral armor.",
    "Its anterior shoulder plates bore forward-pointing, double-bladed spines up to 50 centimeters long, used to spear attacking predators during broadside charges.",
    "Its skull was composed of thick, fused cranial scutes with no temporal fenestrae, forming a solid, drop-forged bony helmet over the braincase."
  ],
  496: [ // Borealopelta markmitchelli
    "Discovered in 2011 in the Suncor Millennium Mine near Fort McMurray, Alberta, preserved in extraordinary three-dimensional detail as a marine-buried 'dinosaur mummy'.",
    "The pristine specimen retains fully articulated dermal osteoderms, the keratinous sheaths covering the armor, and organic residues of skin pigments.",
    "Chemical mass spectrometry identified pheomelanin pigments in the skin, proving that Borealopelta exhibited countershading camouflage (dark reddish-brown dorsal, light belly).",
    "Its preserved stomach contents reveal a specialized diet consisting of 85% leptosporangiate fern leaves, alongside charcoal indicating feeding in burned forest regrowth."
  ],
  497: [ // Euoplocephalus tutus
    "One of the most abundant and well-preserved ankylosaurids from the Dinosaur Park Formation of Alberta, measuring roughly 6 meters in length.",
    "Possessed armored eyelids consisting of oval bony plates (palpebral bones) that swung down like armored visors to protect its eyes from predator claws.",
    "Its tail terminated in a colossal, fused bony tail club anchored by rigid, interlocking ossified tendons, capable of fracturing theropod leg bones.",
    "CT scans reveal an elaborate, loop-de-loop nasal airway that warmed inspired air, conserved moisture, and amplified resonant vocalizations."
  ],
  498: [ // Sauropelta edwardsorum
    "Excavated from the Early Cretaceous Cloverly Formation of Wyoming and Montana, measuring roughly 5 to 6 meters in length.",
    "Distinguished by an imposing row of sharp, triangular, backward-curving spines projecting from its neck and shoulders, the largest exceeding 40 centimeters.",
    "Possessed an exceptionally long tail comprising over half its body length, armored by small, keeled osteoderms but devoid of a terminal club.",
    "Its narrow, tapered snout indicates a selective foraging strategy, carefully browsing high-nutrient dicot shrubs and flowering angiosperms."
  ],
  499: [ // Nodosaurus textilis
    "Discovered in the Frontier Formation of Wyoming, serving as the foundational type genus of the family Nodosauridae.",
    "Its generic name translates to 'knobbed lizard', referencing the dense mosaic of rounded, pea-sized dermal scutes covering its dorsal carapace.",
    "Alternating bands of small and large ribbed plates provided both rigid protection and mechanical flexibility across its hips and tail.",
    "Possessed pillar-like limbs with five functional digits on the forefoot, supporting a low-slung, steady herbivorous feeding posture."
  ],
  501: [ // Tarchia kielanae
    "Excavated from the Late Cretaceous Barun Goyot and Nemegt Formations of the Gobi Desert, Mongolia, measuring up to 8 meters in length.",
    "Possessed one of the largest and most heavily fortified skulls of any Asian ankylosaur, adorned with bulbous caputegulae (armor tiles) and stout squamosal horns.",
    "Micro-CT analysis of tooth wear facets reveals asymmetrical pitting and scratching, indicating a dual diet of hard desert scrub and low-growing vegetation.",
    "Its immense tail club was wielded offensively against apex Mongolian predators such as Tarbosaurus and fellow rival ankylosaurs."
  ],
  502: [ // Polacanthus foxii
    "Discovered in 1865 by William Fox in the Wessex Formation of the Isle of Wight, England, measuring roughly 4 to 5 meters in length.",
    "Its pelvic region was armored by a solid, continuous 'pelvic shield' constructed from dozens of fused, flat dermal scutes bonded directly to the hip bones.",
    "Its back bore paired rows of long, hollow, razor-sharp spines that projected laterally and dorsally to deter attacking allosauroids.",
    "Represents a key member of the Polacanthinae, illustrating the specialized basal thyreophoran faunas that flourished across Early Cretaceous Europe."
  ],
  503: [ // Gastonia burgei
    "Excavated in immense numbers from the Yellow Cat Member of the Cedar Mountain Formation in Grand County, Utah.",
    "Possessed an extraordinary defensive array featuring colossal, outward-projecting shoulder spikes and shearing, scissor-like lateral tail scutes.",
    "Its tail scutes interlocked such that swinging the tail caused adjacent plates to slide against each other, slicing the legs of attacking predators like Utahraptor.",
    "Recovered from dense multi-individual bonebeds, showing that Gastonia lived in structured social groups around drying Cretaceous watering holes."
  ],
  504: [ // Pachycephalosaurus wyomingensis
    "The largest known pachycephalosaur, reaching up to 4.5 meters in length and weighing an estimated 450 kilograms in the Hell Creek Formation.",
    "Possessed an enormous, solid bone dome atop its skull up to 25 centimeters thick, surrounded by blunt bony knobs and spikes along the snout and cheeks.",
    "Histological analysis reveals that the skull dome was composed of fibrolamellar bone prone to chronic traumatic lesions and healing, confirming intra-specific head- or flank-butting.",
    "Leading paleontologists have proposed that Dracorex and Stygimoloch represent juvenile and subadult ontogenetic growth stages of Pachycephalosaurus."
  ],
  505: [ // Stegoceras validum
    "Discovered in the Dinosaur Park Formation of Alberta, Canada, measuring approximately 2 meters in length.",
    "Possessed a prominent, rounded frontoparietal bone dome that grew progressively thicker and more domed as the animal matured.",
    "High-resolution CT scanning of its endocast revealed enlarged olfactory bulbs and well-developed semicircular canals for exquisite balance and rapid agility.",
    "Its teeth were small, serrated, and curved, adapted for slicing leaves, seeds, flowers, and occasionally small insects."
  ],
  509: [ // Argentinosaurus huinculensis
    "Discovered in the Huincul Formation of Neuquén Province, Argentina, by Guillermo Heredia in 1987, dating to the Cenomanian stage (~95 Ma).",
    "Widely recognized as one of the largest land animals in Earth's history, with estimates ranging from 30 to 35 meters in length and 65 to 80 metric tons in mass.",
    "A single dorsal vertebra measures an astonishing 1.59 meters tall, reinforced by complex hyposphene-hypantrum accessory articulations to prevent vertebral dislocation.",
    "The femur is estimated to have reached 2.5 meters in length, functioning as an immense load-bearing pillar that supported gigantic gravitational loads."
  ],
  510: [ // Alamosaurus sanjuanensis
    "Excavated from the Ojo Alamo Sandstone of New Mexico and Javelina Formation of Texas, living right up to the end of the Cretaceous (~66 Ma).",
    "The only titanosaur known to have inhabited North America during the latest Cretaceous, migrating northward from South America following island-arc connections.",
    "Recent colossal cervical and dorsal discoveries indicate Alamosaurus attained lengths of 30 meters and masses comparable to Patagonian giant titanosaurs.",
    "Coexisted with and served as the primary megaherbivore prey item for giant adult Tyrannosaurus rex in southern North American habitats."
  ],
  511: [ // Saltasaurus loricatus
    "Discovered in the Lecho Formation of Salta Province, Argentina, measuring roughly 8 to 10 meters in total body length.",
    "The first sauropod ever discovered with definitive dermal armor: its back was covered in thousands of small dermal studs and large oval bony plates (osteoderms).",
    "Its caudal vertebrae possessed ball-and-socket procoelous articulations, allowing extreme horizontal flexibility for defensive tail sweeps.",
    "Its compact body size and dermal armor illustrate secondary miniaturization and defensive specialization among Late Cretaceous South American titanosaurs."
  ],
  512: [ // Amargasaurus cazaui
    "Excavated from the Early Cretaceous La Amarga Formation of Neuquén Province, Argentina, measuring approximately 9 to 10 meters in length.",
    "Characterized by a remarkable double row of hyper-elongated neural spines along its neck that rose up to 60 centimeters in height.",
    "Debate continues whether these paired spines supported parallel keratinous display horns or were bridged by a vascularized double skin sail.",
    "Its neck was unusually short for a sauropod, with biomechanical simulations showing its head naturally hung near ground level to graze low ferns."
  ],
  513: [ // Dreadnoughtus schrani
    "Discovered in the Cerro Fortaleza Formation of Santa Cruz Province, Argentina, preserved with over 70% of its postcranial skeleton.",
    "Represents the most complete skeleton ever recovered for a supermassive titanosaur, providing an empirical benchmark for titanosaurian mass calculations.",
    "Laser 3D volumetric modeling of its preserved bones calculated a living mass of roughly 35 to 40 metric tons, with individuals reaching 26 meters in length.",
    "Histological analysis of the holotype humerus revealed that this colossal individual was still actively growing at the time of its death."
  ],
  514: [ // Patagotitan mayorum
    "Discovered in the Cerro Barcino Formation of Chubut, Argentina, where excavations yielded remains of at least six giant individuals.",
    "Measuring an estimated 37 meters in length and weighing approximately 55 to 70 metric tons, it ranks among the largest terrestrial vertebrates ever discovered.",
    "A single femur excavated from the quarry measures an incredible 2.38 meters in height, weighing over 500 kilograms.",
    "Its discovery confirmed that multiple distinct clades of titanosaurian sauropods achieved 50+ metric ton gigantism across Cretaceous Patagonia."
  ],
  516: [ // Rapetosaurus krausei
    "Excavated from the Maevarano Formation of Madagascar, preserved as a remarkably complete juvenile skeleton with an associated skull.",
    "Its discovery was monumental: it provided the first definitive skull associated directly with an articulated titanosaurian postcranial skeleton.",
    "Possessed an elongated, diplodocid-like skull with pencil-thin peg teeth, confirming that titanosaurs evolved slender foliage-stripping dentitions independently.",
    "Micro-CT bone histology of a tiny hatchling specimen revealed that baby Rapetosaurus were precocial, foraging independently immediately after hatching."
  ],
  518: [ // Magyarosaurus dacus
    "Discovered in the Sânpetru Formation of Hațeg Island in Transylvania, Romania, measuring just 5 to 6 meters in length and weighing roughly 1 metric ton.",
    "A textbook example of insular dwarfism: marooned on a Late Cretaceous island, Magyarosaurus shrank dramatically to cope with limited island resources.",
    "Bone histology confirmed that these tiny sauropod specimens were fully mature, reproductively active adults rather than juveniles of a giant taxon.",
    "Possessed small dermal osteoderms along its back, retaining ancestral titanosaurian armor despite its drastically reduced body dimensions."
  ],
  522: [ // Tupandactylus imperator
    "Excavated from the Early Cretaceous Crato Formation of northeastern Brazil, celebrated for its astonishing cranial crest.",
    "Its colossal sail-like crest accounted for over 75% of total skull surface area, constructed from a thin bony framework supporting a vast soft-tissue keratin sheet.",
    "A seminal 2022 study discovered fossilized branched feathers (protofeathers) embedded in the crest tissue, containing distinct color-producing melanosomes.",
    "Its completely edentulous (toothless) beak was deep, downturned, and powerful, adapted for cracking tough tropical palm fruits and seeds."
  ],
  523: [ // Pterodaustro guinazui
    "Discovered in the Lagarcito Formation of San Luis Province, Argentina, dating to the Early Cretaceous (~105 Ma).",
    "Possessed over 1,000 extraordinarily long, flexible, bristle-like teeth in its upturned lower jaw, made of elastic dentine to sieve plankton and brine shrimp.",
    "Its upper jaw bore tiny, globular crushing teeth, which it used to grind the sieved microscopic organisms before swallowing.",
    "Fossil gizzard stones (gastroliths) have been discovered clustered inside its abdominal cavity, assisting in the physical breakdown of hard crustacean shells."
  ],
  524: [ // Nyctosaurus gracilis
    "Discovered in the Niobrara Formation of Kansas, measuring roughly 2 meters in wingspan with an astonishing hyper-developed cranial crest.",
    "Its head was crowned by an enormous, two-pronged antler-like crest that towered over 90 centimeters high—exceeding the entire length of its body.",
    "Uniquely among pterosaurs, Nyctosaurus had completely lost manual digits I, II, and III, retaining only the hypertrophied flight finger (digit IV).",
    "Its long, narrow, high-aspect-ratio wings were adapted for dynamic soaring over open oceans, analogous to modern wandering albatrosses."
  ],
  525: [ // Ornithocheirus simus
    "Discovered in the Cambridge Greensand of England, serving as the foundational type genus of Ornithocheiridae.",
    "Its jaws ended in a rounded, semicircular bony crest at the very tip of the beak, which helped stabilize its jaws when dipping them into water at speed.",
    "Possessed robust, vertical, interlocking fangs that decreased regularly in size toward the rear of the jaws, tailored for seizing large open-sea fish.",
    "Its shoulder girdle possessed a fused notarium that anchored powerful flight muscles, enabling long-distance pelagic trans-oceanic flight."
  ],
  526: [ // Anhanguera blittersdorffi
    "Discovered in the Romualdo Formation of the Araripe Basin in northeastern Brazil, preserved with pristine three-dimensional skulls.",
    "Possessed prominent rounded crests on the tips of both its upper premaxilla and lower dentary, creating an expanded fish-snaring rosette.",
    "CT scans of the inner ear endocast reveal enlarged semicircular canals and a horizontal head posture, optimized for scanning ocean waves while soaring.",
    "Its wingspan exceeded 4 to 5 meters, with thin-walled, hollow, air-filled bones that provided immense strength with minimal aerodynamic drag."
  ],
  527: [ // Hatzegopteryx thambema
    "Excavated from the Densuș-Ciula Formation of Hațeg Basin, Romania, living as the undisputed apex predator of an insular Cretaceous island.",
    "Unlike the gracile, slender-necked Quetzalcoatlus, Hatzegopteryx possessed an immensely thickened, stocky neck with cervical vertebrae up to 24 centimeters wide.",
    "The internal bone structure of its cervicals was constructed of a dense, foam-like cellular matrix that resisted immense compressive and bending forces.",
    "With a 10- to 12-meter wingspan and massive skull, Hatzegopteryx operated as a terrestrial stalker, actively hunting dwarf sauropods and hadrosaurs."
  ],
  528: [ // Azhdarcho lancicollis
    "Discovered in the Bissekty Formation of the Kyzylkum Desert in Uzbekistan, serving as the name-bearing type genus of Azhdarchidae.",
    "Its genus name derives from the Uzbek dragon 'Azhdarha', honoring its formidable, soaring pterosaurian anatomy.",
    "Characterized by hyper-elongated, cylindrical cervical vertebrae that lacked lateral pneumatopores and bore completely fused, non-mobile cervical ribs.",
    "Its completely toothless, spear-like beak was used to pick up small vertebrates, eggs, and amphibians from Cretaceous floodplains while walking upright."
  ],
  531: [ // Kronosaurus queenslandicus
    "Excavated from the Toolebuc Formation of Queensland, Australia, measuring roughly 9 to 10.5 meters in total length.",
    "A colossal brachauchenine pliosaur armed with enormous, smooth-enameled teeth up to 30 centimeters long, completely lacking cutting carinae.",
    "Fossilized crushed skulls of the long-necked plesiosaur Eromangasaurus bear puncture wounds matching the dental spacing of Kronosaurus.",
    "Possessed an immense 2.2-meter skull that anchored colossal adductor muscles, delivering an estimated bite force of up to 30,000 newtons."
  ],
  532: [ // Tylosaurus proriger
    "The apex macropredator of the Western Interior Seaway, measuring up to 13 to 14 meters in length and weighing several metric tons.",
    "Possessed an elongated, cylindrical, toothless bony snout projection (the 'predental rostrum') that it used as a high-velocity battering ram against prey.",
    "Fossil stomach contents have revealed an astonishingly diverse diet including hesperornithiform diving birds, sharks, plesiosaurs, and smaller mosasaurs.",
    "Pristine skin impressions reveal tiny, diamond-shaped, non-overlapping scales coated in dark melanin, confirming dark countershading camouflage."
  ],
  533: [ // Aristonectes quiriquinensis
    "Discovered in the Quiriquina Formation of central Chile, representing an extreme evolutionary departure from typical elasmosaurid plesiosaurs.",
    "Possessed a massive, broad, scoop-like skull packed with over 300 tiny, needle-like teeth that formed a dense sieve along the jaw margins.",
    "Fed via active underwater filter-feeding, sweeping its expanded jaws through benthic muds to harvest shoals of krill and tiny crustaceans.",
    "Its cervical vertebrae were unusually short, thick, and flexible, supporting sweeping lateral feeding motions through cold southern polar waters."
  ],
  534: [ // Prognathodon solvayi
    "Discovered throughout the Campanian-Maastrichtian marine deposits of Belgium, the Netherlands, and North America.",
    "Possessed an exceptionally robust, deep skull armed with massive, heavy, enamel-fluted conical teeth designed to crush hard shells and bone.",
    "The roof of its mouth bore prominent pterygoid teeth that prevented struggling ammonites, turtles, and fish from escaping back out of its throat.",
    "Several exceptionally preserved specimens preserve a two-lobed, shark-like hypocercal tail fin with an expanded dorsal lobe made of stiff fibrous tissue."
  ],
  535: [ // Platecarpus tympaniticus
    "One of the most common mosasaurs recovered from the Smoky Hill Chalk of Kansas, measuring roughly 4.3 meters in length.",
    "A landmark 2010 fossil discovery preserved soft-tissue impressions including retinal eye pigments, bronchial branching of the lungs, and a downward-curved caudal fluke.",
    "Micro-CT scans of its inner ear revealed a specialized calcified tympanic membrane, adapted for directional underwater sound wave reception.",
    "Its diet consisted primarily of fast, soft-bodied pelagic cephalopods and teleost fish, snared by its slender, recurved teeth."
  ],
  536: [ // Dolichorhynchops osborni
    "Excavated from the Niobrara Formation of Kansas, Dolichorhynchops was a sleek, short-necked polycotylid plesiosaur measuring about 3 meters in length.",
    "Possessed an extraordinarily long, slender beak lined with small, sharp conical teeth, specialized for pursuing fast-swimming pelagic fish.",
    "Its four flippers were long, narrow, and hydrodynamically tapered, functioning like high-speed underwater hydrofoils for pursuit hunting.",
    "A celebrated fossil specimen preserves a gravid female containing a large, single unborn fetus, proving that polycotylids gave birth to single, well-developed young."
  ],
  537: [ // Archelon ischyros
    "Discovered in the Pierre Shale of South Dakota by George R. Wieland in 1895, measuring over 4.6 meters from flipper to flipper and weighing over 2.2 metric tons.",
    "The largest sea turtle ever documented, possessing a reduced carapace composed of open framework struts covered in thick, leathery hide rather than solid bone.",
    "Its massive, toothless jaws ended in a hooked, scissor-like keratin beak powered by immense jaw muscles to crush giant ammonites and jellyfish.",
    "A famous specimen exhibited at the Yale Peabody Museum displays an amputated right rear flipper, healed from an attack by a giant mosasaur or shark."
  ],
  538: [ // Deinosuchus riograndensis
    "Excavated from the Aguja Formation of Texas and Campanian beds of Utah, reaching staggering lengths of 10 to 12 meters and weighing over 5 to 7 metric tons.",
    "Possessed thick, hemispherical crushing teeth at the rear of its jaws, built with micro-crack-resistant enamel to shatter the carapaces of giant marine turtles.",
    "Fossil bones of contemporary hadrosaurs and tyrannosauroids exhibit deep, oval puncture marks and sheared fractures directly matching Deinosuchus dentition.",
    "Bone histology reveals that Deinosuchus attained its colossal size by maintaining steady, prolonged growth over 50 years rather than accelerating juvenile growth."
  ],
  539: [ // Xiphactinus audax
    "Discovered in the Smoky Hill Chalk of western Kansas, measuring up to 5 to 6 meters in length, known colloquially as the 'bulldog fish'.",
    "Its jaws were packed with enormous, dagger-like fangs up to 6 centimeters long that projected forward from the premaxilla and lower jaw.",
    "The world-famous 'fish-within-a-fish' fossil preserved at the Sternberg Museum exhibits an entire 2-meter Gillicus arcuatus swallowed whole inside a 4-meter Xiphactinus.",
    "Possessed a powerful, homocercal caudal fin and stiffened pectoral fins that propelled it at explosive speeds to breach or ambush prey near the ocean surface."
  ],
  540: [ // Cretoxyrhina mantelli
    "Known as the 'Ginsu shark', Cretoxyrhina was an apex pelagic lamniform shark of the Western Interior Seaway reaching lengths of up to 7 meters.",
    "Its teeth measured up to 8 centimeters in length, possessing smooth, razor-sharp enamel edges that lacked serrations, functioning like surgical scalpels.",
    "Fossil mosasaur vertebrae and plesiosaur limb bones have been discovered with embedded Cretoxyrhina teeth and deep gouge marks, confirming aggressive predation.",
    "Possessed a rigid, crescent-shaped caudal fin and high-aspect pectoral flippers, capable of sustained, high-speed open-ocean cruising similar to the modern Great White."
  ],
  541: [ // Baculites compressus
    "A straight-shelled, heteromorph ammonite that flourished in astronomical numbers throughout the Western Interior Seaway during the Late Cretaceous.",
    "Unlike ancestral spiral ammonites, Baculites uncoiled during juvenile development to form an elongated, ribbed conical shell up to 2 meters in length.",
    "Synchrotron X-ray micro-tomography of fossilized buccal cavities revealed tiny radular teeth and jaws containing remains of planktonic pelagic copepods.",
    "Its shell displays complex, fractal-like suture lines that provided structural reinforcement against high water pressure while maintaining neutral buoyancy."
  ],
  542: [ // Jeletzkytes nebrascensis
    "Excavated from the Late Cretaceous Fox Hills Formation of South Dakota and Nebraska, serving as an index fossil for the late Maastrichtian.",
    "Possessed a tightly coiled, discoidal scaphitid shell adorned with prominent lateral nodes and fine, bifurcating ribbing across the body chamber.",
    "Displays pronounced sexual dimorphism: larger macroconchs (females) possessed expanded living chambers for eggs, while microconchs (males) were substantially smaller.",
    "Pristine fossil shells often retain iridescent aragonite nacre (mother-of-pearl), exhibiting dazzling opalescent structural colors after 66 million years."
  ],
  543: [ // Tusoteuthis longa
    "Discovered in the Smoky Hill Chalk of the Niobrara Formation in Kansas, measuring an estimated 6 to 9 meters in total body length.",
    "Often described as a giant squid, Tusoteuthis was a large enchoteuthid vampyromorph coleoid more closely related to modern vampire squids and octopuses.",
    "Its internal gladius (pen) was a broad, rigid organic structure made of chitin, measuring up to 1.8 meters in length to support muscular jet propulsion.",
    "A famous fossil slab preserves a Tusoteuthis gladius lodged inside the throat of a 2-meter predatory fish (Cimolichthys nepaholica), showing both died choking."
  ]
};

async function main() {
  console.log("=== Executing Sequential Enrichment: Batch 5 (IDs 476-543) ===");

  const targetIds = Object.keys(BATCH5_FACTS).map(Number);
  console.log(`Prepared facts for ${targetIds.length} taxa in Batch 5.`);

  const existing = await prisma.species.findMany({
    where: { id: { in: targetIds } },
    select: { id: true, name: true, interestingFacts: true }
  });

  if (existing.length !== targetIds.length) {
    throw new Error(`Target species mismatch! Found ${existing.length}, expected ${targetIds.length}`);
  }

  console.log("Updating target species in database...");
  for (const s of existing) {
    const newFacts = BATCH5_FACTS[s.id];
    await prisma.species.update({
      where: { id: s.id },
      data: {
        interestingFacts: JSON.stringify(newFacts)
      }
    });
    console.log(`✓ Species #${s.id} (${s.name}): Updated to ${newFacts.length} verified facts.`);
  }

  console.log(`\nBatch 5 completed: ${existing.length} species updated.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
