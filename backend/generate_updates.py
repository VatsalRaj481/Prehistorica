import json

species_list = [
    "Anomalocaris canadensis",
    "Hallucigenia sparsa",
    "Opabinia regalis",
    "Dunkleosteus terrelli",
    "Tiktaalik roseae",
    "Ichthyostega stensioei",
    "Arthropleura armata",
    "Meganeura monyi",
    "Dimetrodon grandis",
    "Edaphosaurus pogonias",
    "Helicoprion bessonowi",
    "Scutosaurus karpinskii",
    "Inostrancevia alexandri",
    "Gastornis parisiensis",
    "Basilosaurus cetoides",
    "Megalodon",
    "Smilodon fatalis",
    "Mammuthus primigenius",
    "Megatherium americanum",
    "Coelodonta antiquitatis",
    "Doedicurus clavicaudatus",
    "Thylacoleo carnifex",
    "Diprotodon optatum"
]

data = {}

for sp in species_list:
    if sp == "Anomalocaris canadensis":
        disc = "• Discovered by Joseph Whiteaves in 1892 in the Burgess Shale.\n• Initially its parts were thought to be three separate animals (a shrimp, a jellyfish, and a sponge).\n• Reconstructed correctly by Harry Whittington and Derek Briggs in the 1980s."
        facts = ["It was one of the earliest known apex predators, dominating Cambrian seas.", "It had highly developed compound eyes with thousands of lenses.", "It used flexible lobes on its body sides to swim."]
    elif sp == "Hallucigenia sparsa":
        disc = "• Found in the Burgess Shale and first described by Charles Walcott in 1911.\n• Simon Conway Morris redescribed it in 1977, famously reconstructing it upside-down and backward.\n• Later studies correctly identified its legs and back spines, linking it to modern velvet worms."
        facts = ["Its strange appearance baffled scientists for decades, leading to its name.", "It defended itself with rigid pairs of spines along its back.", "It belongs to the lobopodians, an ancient group of 'worm-like' animals with legs."]
    elif sp == "Opabinia regalis":
        disc = "• Discovered in the Burgess Shale by Charles Walcott in 1912.\n• Its bizarre anatomy led to laughter when Harry Whittington presented a reconstruction in 1975.\n• It is an important fossil for understanding the early evolution of arthropods."
        facts = ["It had five stalked eyes, granting it a near 360-degree field of vision.", "It fed using a flexible, hose-like proboscis tipped with grasping claws.", "Unlike many of its contemporaries, it lacked jointed legs, swimming with lateral lobes."]
    elif sp == "Dunkleosteus terrelli":
        disc = "• First discovered by Jay Terrell in 1867 in the Cleveland Shale, Ohio.\n• Later named Dunkleosteus in 1956 to honor paleontologist David Dunkle.\n• Complete skulls have rarely been found, but its massive armored head plates are iconic."
        facts = ["Instead of teeth, it possessed self-sharpening bony plates that functioned like shears.", "It had an incredibly powerful bite, capable of crushing armor-plated prey.", "It could open its jaws in a fraction of a second to create a vacuum and suck in prey."]
    elif sp == "Tiktaalik roseae":
        disc = "• Discovered in 2004 on Ellesmere Island, Canada, by a team led by Neil Shubin.\n• Named 'Tiktaalik', meaning 'burbot' in the Inuktitut language, following suggestions from Inuit elders.\n• It is considered one of the most significant 'missing links' between fish and land animals."
        facts = ["It possessed primitive wrists and fingers capable of supporting its weight in shallow water.", "Unlike typical fish, it had a mobile neck allowing it to turn its head independently.", "It had both gills for breathing underwater and lungs for breathing air."]
    elif sp == "Ichthyostega stensioei":
        disc = "• First discovered in East Greenland during an expedition in 1929.\n• Described by Gunnar Säve-Söderbergh in 1932.\n• Known as one of the first tetrapods in the fossil record, marking the transition to land."
        facts = ["It had seven toes on its hind limbs, showing that early tetrapods did not strictly have five digits.", "It likely moved on land similarly to modern mudskippers, pulling itself with front limbs.", "Its ribcage was robust, protecting its internal organs when out of the water."]
    elif sp == "Arthropleura armata":
        disc = "• Initially described in 1854 based on fragmentary fossils from Germany.\n• A massive, nearly complete specimen was found in England in 2018.\n• Trackways attributed to it have been found in multiple locations across Europe and North America."
        facts = ["It is the largest known land invertebrate in Earth's history.", "Its colossal size was enabled by the high oxygen levels of the Carboniferous atmosphere.", "Despite its fearsome appearance, it was a herbivore that fed on rotting plant matter."]
    elif sp == "Meganeura monyi":
        disc = "• First discovered in the coal measures of Commentry, France, in 1880.\n• Described by Charles Brongniart in 1885.\n• Further discoveries have cemented its status as one of the largest flying insects ever."
        facts = ["It is closely related to modern dragonflies but belongs to an extinct group called griffinflies.", "Its wingspan could reach over 70 centimeters (28 inches).", "It was an agile aerial predator that hunted other insects and possibly small amphibians."]
    elif sp == "Dimetrodon grandis":
        disc = "• Named by Edward Drinker Cope in 1878 during the 'Bone Wars'.\n• Abundant fossils have been excavated from the Red Beds of Texas.\n• It is one of the most thoroughly studied of all early synapsids."
        facts = ["Though often confused with dinosaurs, it lived millions of years earlier and is closer to mammals.", "Its iconic sail was likely used for thermoregulation or mating displays.", "It had two distinct types of teeth in its jaws, a trait common to later mammals."]
    elif sp == "Edaphosaurus pogonias":
        disc = "• Discovered in Texas and described by Edward Drinker Cope in 1882.\n• One of the first large, terrestrial herbivores known to science.\n• Notable for its highly specialized feeding apparatus compared to contemporary predators."
        facts = ["It possessed a large sail supported by vertebral spines featuring unique crossbars.", "Its mouth was filled with peg-like teeth forming plates for crushing tough plants.", "It had a disproportionately small head compared to its massive, barrel-shaped body."]
    elif sp == "Helicoprion bessonowi":
        disc = "• First described by Alexander Karpinsky in 1899 from Russian fossils.\n• The exact placement of its bizarre tooth whorl debated for over a century.\n• A 2013 CT scan of a specimen finally confirmed the whorl fit within its lower jaw."
        facts = ["It retained old teeth, curling them into a spiral instead of shedding them.", "It belongs to the eugenodonts, a group of cartilaginous fish closer to ratfish than true sharks.", "Its jaw mechanism sliced through soft-bodied prey like a circular saw."]
    elif sp == "Scutosaurus karpinskii":
        disc = "• Found by Vladimir Amalitsky near the Northern Dvina River in Russia in the 1890s.\n• Named posthumously in 1921.\n• It represents one of the most specialized and armored pareiasaurs discovered."
        facts = ["Its body was covered in bony plates called osteoderms for defense.", "It walked with its legs positioned more vertically under its body, unusual for Permian reptiles.", "It had a massive ribcage to house a large digestive tract for processing fibrous plants."]
    elif sp == "Inostrancevia alexandri":
        disc = "• Discovered in northern Russia by Vladimir Amalitsky in the late 19th century.\n• Described formally in 1922.\n• In 2023, fossils were found in South Africa, demonstrating a vast geographic range."
        facts = ["It was the largest of the gorgonopsians, early predatory relatives of mammals.", "It wielded massive saber-like canine teeth for hunting large, thick-skinned prey.", "It could open its jaws incredibly wide to utilize its impressive fangs."]
    elif sp == "Gastornis parisiensis":
        disc = "• Discovered in 1855 near Paris by Gaston Planté.\n• Known for a long time under the synonym 'Diatryma' in North America.\n• Once thought to be a top predator, modern analysis of its remains indicates it was herbivorous."
        facts = ["Despite its intimidating beak, isotopic evidence suggests it fed on tough plants and seeds.", "It was completely flightless but possessed strong, muscular legs.", "It lived in dense forests during the warm climate of the early Eocene."]
    elif sp == "Basilosaurus cetoides":
        disc = "• Initial discoveries in the US were so common the bones were used as fireplace supports.\n• Described initially as a giant reptile ('king lizard') by Richard Harlan in 1834.\n• Richard Owen correctly identified it as an early whale in 1839."
        facts = ["It was a primitive whale that maintained tiny, non-functional hind legs.", "Its body was unusually elongated and serpentine compared to modern whales.", "It could not echolocate and relied on good eyesight and hearing to hunt."]
    elif sp == "Megalodon":
        disc = "• Its fossilized teeth were originally thought to be the petrified tongues of dragons.\n• Nicolas Steno correctly identified them as shark teeth in 1667.\n• Louis Agassiz gave it the scientific name meaning 'giant tooth' in 1843."
        facts = ["It was the largest predatory shark known to have existed.", "Because its skeleton was made of cartilage, primarily only its teeth and vertebrae fossilized.", "It preyed heavily on small whales, and its extinction coincided with a cooling climate."]
    elif sp == "Smilodon fatalis":
        disc = "• Described by Joseph Leidy in 1869 from fossils found in Texas.\n• Thousands of skeletons have been recovered from the La Brea Tar Pits in California.\n• It is arguably the most famous extinct mammal aside from the woolly mammoth."
        facts = ["Its iconic saber teeth could reach up to 7 inches in length.", "It had a weaker bite force than a modern lion but robust forelimbs to pin prey.", "Its jaws could open up to 120 degrees to clear its massive fangs for a bite."]
    elif sp == "Mammuthus primigenius":
        disc = "• Scientifically described by Johann Friedrich Blumenbach in 1799.\n• Spectacular mummified remains have been found preserved in the Siberian permafrost.\n• Known from extensive interactions with early humans, documented in cave art."
        facts = ["It had a specialized double coat of hair and a thick layer of fat for insulation.", "Its ears were much smaller than those of modern elephants to prevent heat loss.", "Its massive, curved tusks were likely used to sweep away snow to reach vegetation."]
    elif sp == "Megatherium americanum":
        disc = "• First discovered in Argentina in 1788 by Manuel Torres.\n• Described by the famous naturalist Georges Cuvier in 1796.\n• It was one of the first prehistoric mammals to be reconstructed and exhibited."
        facts = ["It was a giant ground sloth that reached the size of an elephant.", "It possessed massive claws used for stripping leaves from branches, not for hunting.", "It could rear up on its hind legs, using its heavy tail as a tripod for balance."]
    elif sp == "Coelodonta antiquitatis":
        disc = "• First formally described by Johann Friedrich Blumenbach in 1799.\n• Numerous mummified specimens have been found frozen in Siberia.\n• Perfectly preserved specimens have even been found in oil seeps in Poland."
        facts = ["It was a large, woolly rhinoceros adapted to the cold Pleistocene environment.", "It had a massive, flattened front horn used for clearing snow from the ground.", "It is frequently depicted in Paleolithic European cave paintings."]
    elif sp == "Doedicurus clavicaudatus":
        disc = "• Described by Richard Owen in 1874 from fossils found in Argentina.\n• It is one of the best-known members of the glyptodont family.\n• Early humans coexisted with it and may have hunted it for meat and its large shell."
        facts = ["It was a massive relative of the armadillo, heavily armored with a bony carapace.", "It defended itself with a spiked, club-like tail reminiscent of a medieval mace.", "Its rigid shell meant it could not roll into a ball like some modern armadillos."]
    elif sp == "Thylacoleo carnifex":
        disc = "• First described by Richard Owen in 1859 from fragmented remains.\n• A nearly complete skeleton discovered in 2002 offered unprecedented insight into its anatomy.\n• Known from fossils across the Australian continent."
        facts = ["It is the largest known carnivorous marsupial from Australia.", "It had massive, blade-like premolars designed to shear through meat and bone.", "It featured a unique, semi-opposable thumb claw to grapple with large prey."]
    elif sp == "Diprotodon optatum":
        disc = "• First discovered in the Wellington Caves of New South Wales in the 1830s.\n• Described by Richard Owen in 1838.\n• Trackways reveal they moved in large herds across the Australian interior."
        facts = ["It is the largest marsupial ever discovered, comparable in size to a rhinoceros.", "Like modern wombats, females had a backward-facing pouch.", "It migrated vast distances in search of water and food during the Pleistocene."]
    else:
        disc = "• Discovered in its respective fossil formation.\n• Has been the subject of ongoing paleontological research.\n• Historically significant in understanding ancient ecosystems."
        facts = ["It had unique adaptations suited to its environment.", "It occupied a specific ecological niche during its time.", "Its fossils help trace evolutionary history."]

    data[sp] = {
        "discoveryHistory": disc,
        "interestingFacts": facts
    }

out_path = 'C:/Users/vatsa/.gemini/antigravity/brain/42c77894-f39c-405b-ab28-6492c932b9df/scratch/updates_others.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)
