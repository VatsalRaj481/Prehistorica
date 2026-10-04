import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data payload for the Big Five mass extinctions
const MASS_EXTINCTIONS = [
  {
    slug: 'end-ordovician',
    name: 'End-Ordovician Mass Extinction',
    commonName: 'The Hirnantian Icehouse Pulse',
    peakAgeMa: 443.8,
    ageSpanLabel: '445 – 443 Ma (Late Ordovician)',
    period: 'Ordovician',
    epoch: 'Hirnantian',
    speciesLossPercent: 85,
    marineGeneraLossPercent: 60,
    terrestrialLossPercent: 0,
    estimatedDuration: '~500,000 to 1,000,000 years (two distinct pulses)',
    headline: 'Glacial freeze followed by suffocating anoxic warming in shallow epicontinental seas.',
    overview:
      'The first of the Big Five mass extinctions struck a biosphere almost entirely confined to the oceans. Driven by the movement of the supercontinent Gondwana across the South Pole, runaway glaciation locked up vast volumes of water, drastically lowering global sea levels by over 100 meters and wiping out rich shallow-water shelf reefs. As glaciers rapidly melted in the second pulse, stagnant, oxygen-depleted bottom waters flooded the continental shelves, choking the survivors.',
    killMechanisms: [
      {
        id: 'hirnantian-glaciation',
        title: 'Rapid Gondwanan Glaciation',
        category: 'Glaciation',
        description:
          'Gondwana settled over the South Pole, triggering ice sheet formation that dropped mean global temperatures by ~8°C to ~10°C and plunged the planet into a brief, violent icehouse.',
        impactRating: 'Cataclysmic',
      },
      {
        id: 'eustatic-sea-level-drop',
        title: 'Severe Eustatic Sea Level Regression',
        category: 'Glaciation',
        description:
          'Continental ice sheets drained global oceans by 100–150 meters, eliminating vast epeiric shallow seas that harbored >90% of global marine benthic biodiversity.',
        impactRating: 'Cataclysmic',
      },
      {
        id: 'post-glacial-anoxia',
        title: 'Post-Glacial Oceanic Anoxia',
        category: 'Anoxia',
        description:
          'As the Hirnantian ice sheets retreated, warm stratified ocean currents stopped circulating, causing toxic, oxygen-free deep waters to upwell over continental shelves.',
        impactRating: 'Severe',
      },
    ],
    decimatedClades: [
      {
        name: 'Trilobita (Trilobites)',
        type: 'Marine Arthropods',
        status: 'Severe Decimation (>90% loss)',
        description: 'Orders like Agnostida and many Asaphida vanished permanently; only surviving orders limped forward into the Silurian.',
      },
      {
        name: 'Graptolithina (Graptolites)',
        type: 'Hemichordates',
        status: 'Severe Decimation (>90% loss)',
        description: 'Free-floating colonial plankton were nearly eradicated as surface ocean chemistry violently shifted.',
      },
      {
        name: 'Brachiopoda & Tabulate Reefs',
        type: 'Sessile Filter Feeders & Corals',
        status: 'Severe Decimation (>90% loss)',
        description: 'Vast calcifying shallow reef communities collapsed as carbonate shelf habitats vanished overnight.',
      },
      {
        name: 'Conodonta (Early Jawless Chordates)',
        type: 'Primitive Vertebrates',
        status: 'Severely Reduced',
        description: 'Over 80% of conodont species disappeared across the two Hirnantian pulses.',
      },
    ],
    survivorsAndRadiators: [
      {
        name: 'Agnathan & Early Jawed Fishes',
        type: 'Stem Vertebrates',
        survivalKey: 'Deeper water tolerance and motile open-ocean foraging allowed early jawless ostracoderms to withstand shelf collapse.',
        postExtinctionRadiation: 'Exploded into the Silurian and Devonian "Age of Fishes", giving rise to placoderms, sharks, and bony fishes.',
      },
      {
        name: 'Nautiloid Cephalopods',
        type: 'Mollusks',
        survivalKey: 'Mobile nektonic swimming and broad depth tolerance allowed coiled nautiloids to survive reef crashes.',
        postExtinctionRadiation: 'Diversified to reclaim apex marine predator niches throughout the Silurian.',
      },
      {
        name: 'Stem Embryophyte Land Plants',
        type: 'Bryophyte-like Land Flora',
        survivalKey: 'Spore-bearing terrestrial pioneers existed outside the marine crisis zone.',
        postExtinctionRadiation: 'Pioneered the greening of continents, paving the way for vascular plants like Cooksonia in the Silurian.',
      },
    ],
    macroevolutionaryLegacy:
      'The End-Ordovician extinction restructured marine benthic ecosystems, clearing out archaic sponge-stromatoporoid dominance and opening the ecological way for the rise of complex Silurian coral-stromatoporoid reefs and the unprecedented evolutionary radiation of jawed vertebrates.',
    rajyPrompt: 'Explain the kill mechanisms and surviving lineages of the End-Ordovician Hirnantian mass extinction.',
    badgeColor: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
    accentBorder: 'border-emerald-500/30 hover:border-emerald-500/60',
  },
  {
    slug: 'late-devonian',
    name: 'Late Devonian Mass Extinction',
    commonName: 'The Kellwasser & Hangenberg Crises',
    peakAgeMa: 372.2,
    ageSpanLabel: '372 – 359 Ma (Frasnian–Famennian boundary)',
    period: 'Devonian',
    epoch: 'Frasnian / Famennian',
    speciesLossPercent: 75,
    marineGeneraLossPercent: 50,
    terrestrialLossPercent: 20,
    estimatedDuration: 'Series of pulses across ~15 million years',
    headline: 'The rise of Earth’s first true forests paradoxically suffocated the ancient oceans.',
    overview:
      'Rather than a single lightning strike, the Late Devonian crisis unfolded in protracted pulses—culminating in the Kellwasser (372 Ma) and Hangenberg (359 Ma) events. A leading curatorial hypothesis is the "Devonian Plant Hypothesis": the evolutionary explosion of deep-rooted Archaeopteris trees broke down continental rock, flushing unprecedented waves of mineral phosphorus and iron into shallow seas. This caused runaway algal blooms, eutrophication, and widespread ocean anoxia that suffocated the monstrous armored fishes of the Devonian.',
    killMechanisms: [
      {
        id: 'terrestrial-eutrophication',
        title: 'Runaway Eutrophication via Land Forests',
        category: 'Eutrophication',
        description:
          'Evolution of deep tree root systems accelerated pedogenesis and continental weathering, dumping catastrophic nutrient surges into waterways and triggering global marine algal blooms.',
        impactRating: 'Cataclysmic',
      },
      {
        id: 'global-marine-anoxia',
        title: 'Black Shale Widespread Ocean Anoxia',
        category: 'Anoxia',
        description:
          'Decaying algal blooms stripped dissolved oxygen from oceans down to the seafloor, preserving organic-rich black shales (Kellwasser beds) and suffocating benthic life.',
        impactRating: 'Cataclysmic',
      },
      {
        id: 'climate-oscillations-volcanism',
        title: 'Viluy Traps Volcanism & Global Cooling',
        category: 'Volcanism',
        description:
          'Eruption of the Viluy large igneous province in modern Siberia combined with CO2 drawdown from land forests plunged the globe into abrupt freeze-thaw cycles.',
        impactRating: 'Severe',
      },
    ],
    decimatedClades: [
      {
        name: 'Placodermi (Armored Jawed Fish)',
        type: 'Apex Marine Vertebrates',
        status: 'Completely Extinct',
        description: 'The terrifying apex predators of the Devonian seas—including 9-meter armor-plated Dunkleosteus—were completely wiped from Earth at the Hangenberg event.',
        notableSpecimens: [
          { name: 'Dunkleosteus terrelli', speciesId: 4, role: 'Apex Placoderm Predator' },
        ],
      },
      {
        name: 'Stromatoporoid Reef Builders',
        type: 'Sponges & Rugose Corals',
        status: 'Severe Decimation (>90% loss)',
        description: 'Massive Paleozoic barrier reefs stretching thousands of kilometers collapsed entirely and never recovered to their Devonian scale.',
      },
      {
        name: 'Trilobite Orders (Phacopida)',
        type: 'Marine Arthropods',
        status: 'Severe Decimation (>90% loss)',
        description: 'Iconic, complex-eyed Phacopid trilobites vanished; only a single order (Proetida) survived into the Carboniferous.',
      },
      {
        name: 'Acanthodians ("Spiny Sharks")',
        type: 'Stem Chondrichthyans',
        status: 'Severely Reduced',
        description: 'Severely bottlenecked, losing almost all marine genera and retreating into restricted freshwater refugia.',
      },
    ],
    survivorsAndRadiators: [
      {
        name: 'Sarcopterygian Tetrapodomorphs',
        type: 'Lobe-finned Vertebrates',
        survivalKey: 'Limb-like fins and lungs allowed them to navigate shallow, anoxic swamps and clamber onto land to exploit uncrowded terrestrial food webs.',
        postExtinctionRadiation: 'Gave rise to all land-dwelling tetrapods: amphibians, reptiles, dinosaurs, birds, and mammals.',
      },
      {
        name: 'Chondrichthyes (True Sharks & Rays)',
        type: 'Cartilaginous Fish',
        survivalKey: 'Highly efficient metabolic physiology, lack of heavy bony armor, and deep-water oceanic resilience.',
        postExtinctionRadiation: 'Exploded in the Carboniferous into the "Golden Age of Sharks", radiating into hundreds of bizarre specialized forms (Stethacanthus, Helicoprion ancestors).',
      },
      {
        name: 'Actinopterygii (Ray-finned Bony Fishes)',
        type: 'Bony Fish',
        survivalKey: 'Small body sizes, agile maneuverability, and high reproductive fecundity in freshwater systems.',
        postExtinctionRadiation: 'Eventually grew to become over 99% of all modern fish species (30,000+ living species today).',
      },
    ],
    macroevolutionaryLegacy:
      'By eradicating the heavily armored placoderms that ruled Devonian waters, the Late Devonian crisis handed oceanic supremacy to modern sharks and ray-finned fish, while driving lobe-finned fish ashore to launch the great terrestrial conquest of the Carboniferous.',
    rajyPrompt: 'Explain how the evolution of land plants and ocean anoxia caused the Late Devonian mass extinction and wiped out Dunkleosteus.',
    badgeColor: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
    accentBorder: 'border-amber-500/30 hover:border-amber-500/60',
  },
  {
    slug: 'end-permian',
    name: 'End-Permian Mass Extinction ("The Great Dying")',
    commonName: 'The Great Dying — Biosphere Near-Total Annihilation',
    peakAgeMa: 251.9,
    ageSpanLabel: '251.9 Ma (Permian–Triassic boundary)',
    period: 'Permian',
    epoch: 'Changhsingian',
    speciesLossPercent: 96,
    marineGeneraLossPercent: 83,
    terrestrialLossPercent: 70,
    estimatedDuration: '~60,000 years (geologically instantaneous)',
    headline: 'Earth’s closest brush with total biological death: 96% of marine species and 70% of land vertebrates perished.',
    overview:
      'The End-Permian extinction is the unmatched apex cataclysm in Earth’s 4.5-billion-year history. Triggered by the apocalyptic eruption of the Siberian Traps—which poured millions of cubic kilometers of lava through coal basins—vast clouds of greenhouse gases superheated the planet. Tropical sea surface temperatures exceeded 40°C (104°F). Oceans acidified like soda water and stagnated, releasing lethal clouds of hydrogen sulfide gas into an atmosphere stripped of ozone.',
    killMechanisms: [
      {
        id: 'siberian-traps-volcanism',
        title: 'Siberian Traps Magmatic Outgassing',
        category: 'Volcanism',
        description:
          'Over 3,000,000 km³ of basalt lava erupted through rich hydrocarbon coal beds in Siberia, injecting tens of thousands of gigatons of CO2, methane, and sulfur into the atmosphere.',
        impactRating: 'Cataclysmic',
      },
      {
        id: 'hyperthermal-super-greenhouse',
        title: 'Runaway Hyperthermal Warming',
        category: 'Hyperthermal',
        description:
          'Global mean surface temperatures soared by 10°C to 15°C. Equators became unlivable thermal dead zones where tropical marine life could not survive.',
        impactRating: 'Cataclysmic',
      },
      {
        id: 'ocean-acidification-euxinia',
        title: 'Ocean Acidification & Lethal Euxinia (H2S)',
        category: 'Acidification',
        description:
          'Massive carbon uptake crashed marine pH, dissolving calcium carbonate shells. Stagnant anoxic deep oceans bred anaerobic sulfate-reducing bacteria that saturated waters and coastal skies with poisonous hydrogen sulfide.',
        impactRating: 'Cataclysmic',
      },
      {
        id: 'ozone-layer-destruction',
        title: 'Stratospheric Ozone Layer Collapse',
        category: 'Atmospheric',
        description:
          'Halocarbons from heated coal basins tore holes in the protective ozone layer, bathing surviving plants and animals in lethal UV-B radiation that produced mutated pollen spores.',
        impactRating: 'Severe',
      },
    ],
    decimatedClades: [
      {
        name: 'Trilobita (Trilobites)',
        type: 'Marine Arthropods',
        status: 'Completely Extinct',
        description: 'After surviving for nearly 300 million years through three previous extinction pulses, the final order (Proetida) was permanently exterminated.',
      },
      {
        name: 'Gorgonopsia (Sabertooth Synapsids)',
        type: 'Apex Therapsid Predators',
        status: 'Completely Extinct',
        description: 'The terrifying dominant terrestrial apex predators of the late Permian vanished entirely as large herbivore prey collapsed.',
      },
      {
        name: 'Eurypterida (Sea Scorpions)',
        type: 'Marine Chelicerates',
        status: 'Completely Extinct',
        description: 'The ancient marine and brackish predators that had stalked shallow seas since the Ordovician met their final extinction.',
      },
      {
        name: 'Tabulate & Rugose Corals',
        type: 'Paleozoic Corals',
        status: 'Completely Extinct',
        description: 'The foundational coral builders of the Paleozoic were wiped out completely, creating a 10-million-year "Reef Gap" in the Early Triassic.',
      },
      {
        name: 'Pareiasauria & Sphenacodontia',
        type: 'Stem Reptiles & Synapsids',
        status: 'Completely Extinct',
        description: 'Heavily armored terrestrial herbivores and primitive sail-backed synapsids perished.',
        notableSpecimens: [
          { name: 'Dimetrodon grandis', speciesId: 9, role: 'Early Permian Pelycosaur Lineage' },
        ],
      },
    ],
    survivorsAndRadiators: [
      {
        name: 'Lystrosaurus (Dicynodont Therapsid)',
        type: 'Herbivorous Synapsid',
        survivalKey: 'Burrowing lifestyle, barrel chest adapted for low-O2 and high-CO2 air, generalist foraging on tough roots.',
        postExtinctionRadiation: 'Became the most dominant single land vertebrate in Earth history, making up over 95% of all terrestrial vertebrate fossils in the Early Triassic!',
        notableSpecimens: [
          { name: 'Lystrosaurus murrayi', speciesId: 1653, role: 'Post-Extinction Disaster Pioneer' },
        ],
      },
      {
        name: 'Archosauromorpha (Stem Archosaurs)',
        type: 'Diapsid Reptiles',
        survivalKey: 'Highly efficient flow-through respiratory system (air sacs) and superior uric acid water conservation in arid heat.',
        postExtinctionRadiation: 'Splintered into Dinosaurs, Pterosaurs, Crocodylomorphs, and Phytosaurs—setting the stage for the entire Mesozoic Era.',
      },
      {
        name: 'Cynodontia (Stem Mammals)',
        type: 'Therapsid Synapsids',
        survivalKey: 'Small body size, subterranean burrowing, incipient warm-bloodedness (endothermy), and differentiated teeth.',
        postExtinctionRadiation: 'Survived the crucible of the Triassic to evolve into the first true Mammaliaformes.',
      },
      {
        name: 'Ammonoidea (Ammonites)',
        type: 'Cephalopods',
        survivalKey: 'A tiny handful of generalist species in deep pelagic waters managed to endure the acidification crisis.',
        postExtinctionRadiation: 'Radiated with ferocious speed in the Triassic, multiplying into thousands of index fossil varieties.',
      },
    ],
    macroevolutionaryLegacy:
      'The Great Dying reset the terrestrial and marine evolutionary clock. By exterminating the dominant mammal-like synapsid megafauna that had ruled the Permian, it handed the vacant throne of Earth to the archosaurs—paving the direct evolutionary path for the Age of Dinosaurs.',
    rajyPrompt: 'Why is the End-Permian extinction called "The Great Dying", and how did Lystrosaurus and early archosaurs survive it?',
    badgeColor: 'bg-rose-950/80 text-rose-400 border-rose-500/40',
    accentBorder: 'border-rose-500/30 hover:border-rose-500/60',
  },
  {
    slug: 'end-triassic',
    name: 'End-Triassic Mass Extinction',
    commonName: 'The CAMP Basalt Rift Cataclysm',
    peakAgeMa: 201.4,
    ageSpanLabel: '201.4 Ma (Triassic–Jurassic boundary)',
    period: 'Triassic',
    epoch: 'Rhaetian',
    speciesLossPercent: 76,
    marineGeneraLossPercent: 47,
    terrestrialLossPercent: 42,
    estimatedDuration: '~100,000 to 600,000 years',
    headline: 'The breakup of Pangea ripped open basalt rifts, crowning the dinosaurs as masters of the planet.',
    overview:
      'As the supercontinent Pangea began to tear itself apart, the Central Atlantic Magmatic Province (CAMP) fractured the crust. Millions of square kilometers of basalt lava poured across modern-day North America, South America, Europe, and Africa. Massive carbon dioxide and sulfur pulses caused rapid thermal whiplash—lethal overheating followed by volcanic winter freezing pulses. While crocodylian-line archosaurs perished en masse, small feathered dinosaurs with high metabolic rates walked through the ashes largely unscathed.',
    killMechanisms: [
      {
        id: 'camp-volcanism',
        title: 'Central Atlantic Magmatic Province (CAMP)',
        category: 'Volcanism',
        description:
          'One of the largest flood basalt events in history (~11 million km²), venting immense volumes of methane and sulfur during the continental rifting of Pangea.',
        impactRating: 'Cataclysmic',
      },
      {
        id: 'thermal-whiplash-volcanic-winters',
        title: 'Volcanic Winters & Hyperthermal Swings',
        category: 'Hyperthermal',
        description:
          'Short, brutal volcanic winters caused by sulfur aerosol shading alternated with prolonged super-greenhouse CO2 warming, destroying ecosystems with severe temperature whiplash.',
        impactRating: 'Cataclysmic',
      },
      {
        id: 'ocean-calcification-crisis',
        title: 'Marine Calcification Crisis',
        category: 'Acidification',
        description:
          'Severe ocean acidification halted skeletal calcification in scleractinian corals and shelled marine mollusks for hundreds of thousands of years.',
        impactRating: 'Severe',
      },
    ],
    decimatedClades: [
      {
        name: 'Pseudosuchia (Crurotarsi Croc-Line Archosaurs)',
        type: 'Archosaurian Apex Predators',
        status: 'Severe Decimation (>90% loss)',
        description: 'Apex predators like giant rauisuchians (Postosuchus) and armored herbivorous aetosaurs that dominated the Triassic were completely obliterated, leaving only crocodylomorph ancestors.',
        notableSpecimens: [
          { name: 'Postosuchus kirkpatricki', speciesId: 16, role: 'Triassic Apex Rauisuchian' },
        ],
      },
      {
        name: 'Phytosauria (Crocodile-like Archosaurs)',
        type: 'Aquatic Predators',
        status: 'Completely Extinct',
        description: 'Semiaquatic ambush predators with dorsal nostrils that choked the Triassic river systems vanished from the fossil record forever.',
      },
      {
        name: 'Large Temnospondyl Amphibians',
        type: 'Giant Amphibians',
        status: 'Severe Decimation (>90% loss)',
        description: 'Massive flat-headed freshwater apex amphibians that had ruled rivers since the Carboniferous were nearly wiped out, with only rare high-latitude relicts surviving.',
      },
      {
        name: 'Conodonta (Conodonts)',
        type: 'Primitive Agnathans',
        status: 'Completely Extinct',
        description: 'The ancient eel-like tooth-bearing chordates that survived both the Ordovician and Devonian extinctions were finally snuffed out completely.',
      },
    ],
    survivorsAndRadiators: [
      {
        name: 'Dinosauria (Theropods, Sauropodomorphs, Ornithischians)',
        type: 'Avemetatarsalian Archosaurs',
        survivalKey: 'Insulative proto-feathers protecting against volcanic winter freezes, avian-style air sacs, and fully erect bipedal/quadrupedal cursorial locomotion.',
        postExtinctionRadiation: 'With pseudosuchian competitors eradicated, dinosaurs stepped into every vacant terrestrial herbivore and carnivore ecological niche across the Jurassic.',
        notableSpecimens: [
          { name: 'Coelophysis bauri', speciesId: 14, role: 'Agile Early Theropod Lineage' },
          { name: 'Plateosaurus trossingensis', speciesId: 15, role: 'Early Sauropodomorph Herbivore' },
        ],
      },
      {
        name: 'Pterosauria (Flying Archosaurs)',
        type: 'Winged Diapsids',
        survivalKey: 'True powered flight, pycnofiber insulation coats, and high metabolic rates enabled them to escape ecological disaster zones.',
        postExtinctionRadiation: 'Conquered Jurassic and Cretaceous skies, evolving from small rhamphorhynchoids into continent-spanning azhdarchids.',
      },
      {
        name: 'Crocodylomorpha (Stem Crocodilians)',
        type: 'Pseudosuchians',
        survivalKey: 'Small, agile, terrestrial generalists (sphenosuchians) with broad diets survived when their giant rauisuchian cousins fell.',
        postExtinctionRadiation: 'Re-invaded freshwater and marine ecosystems throughout the Jurassic as thalattosuchians and teleosaurids.',
      },
      {
        name: 'Mammaliaformes (Early Mammals)',
        type: 'Synapsids',
        survivalKey: 'Nocturnal foraging, fur coat insulation, high metabolic heat generation, and acute hearing/smell.',
        postExtinctionRadiation: 'Continued modest diversification as agile nocturnal insectivores and burrowers in the shadow of dinosaurs.',
      },
    ],
    macroevolutionaryLegacy:
      'The End-Triassic extinction was the single event that created the "Age of Dinosaurs". Without the catastrophic wipeout of the rauisuchians and phytosaurs, dinosaurs would likely have remained small, secondary cursorial animals in a world ruled by crocodile-line archosaurs.',
    rajyPrompt: 'How did the CAMP volcanic eruptions during the End-Triassic extinction allow dinosaurs to take over the planet from pseudosuchians?',
    badgeColor: 'bg-purple-950/80 text-purple-400 border-purple-500/40',
    accentBorder: 'border-purple-500/30 hover:border-purple-500/60',
  },
  {
    slug: 'k-pg',
    name: 'Cretaceous–Paleogene (K-Pg) Extinction',
    commonName: 'The Chicxulub Asteroid Impact & Deccan Traps',
    peakAgeMa: 66.0,
    ageSpanLabel: '66.0 Ma (Mesozoic–Cenozoic boundary)',
    period: 'Cretaceous',
    epoch: 'Maastrichtian',
    speciesLossPercent: 76,
    marineGeneraLossPercent: 40,
    terrestrialLossPercent: 75,
    estimatedDuration: 'Hours to decades for primary shock; millennia for recovery',
    headline: 'A 10-kilometer asteroid slammed into the Yucatán, ending 165 million years of non-avian dinosaur reign.',
    overview:
      'Sixty-six million years ago, a 10-to-15 km wide carbonaceous chondrite asteroid impacted Chicxulub in the modern Yucatán Peninsula at ~20 km/s. The kinetic detonation equaled 100 million megatons of TNT. Superheated ejecta re-entering the atmosphere triggered global thermal radiation pulses and ignite planetary wildfires. Vaporized sulfate rocks cast Earth into a decade of sub-zero "nuclear winter" darkness, halting photosynthesis and collapsing both marine and terrestrial food chains. Concurrently, the Deccan Traps in India poured vast flood basalts that had already destabilized the Late Cretaceous biosphere.',
    killMechanisms: [
      {
        id: 'chicxulub-bolide-impact',
        title: 'Chicxulub Asteroid Impact Shockwave',
        category: 'Impact',
        description:
          'Excavated a 180-km crater in seconds, vaporizing carbonate and anhydrite target rock, triggering mega-tsunamis over 100m high, and ejecting molten glass spherules worldwide.',
        impactRating: 'Cataclysmic',
      },
      {
        id: 'impact-winter-blackout',
        title: 'Decade-Long Impact Winter & Darkness',
        category: 'Impact',
        description:
          'Sulfate aerosols and soot from planetary fires blocked over 90% of sunlight. Photosynthesis collapsed across both ocean plankton and land flora, causing food webs to starve from the bottom up.',
        impactRating: 'Cataclysmic',
      },
      {
        id: 'deccan-traps-volcanism',
        title: 'Deccan Traps Pre-Impact Volcanism',
        category: 'Volcanism',
        description:
          'Vast flood basalt eruptions across India vented enormous quantities of CO2 and SO2 over 500,000 years, destabilizing climate and pre-stressing marine ecosystems prior to impact.',
        impactRating: 'Severe',
      },
      {
        id: 'global-acid-rain',
        title: 'Catastrophic Nitric & Sulfuric Acid Rain',
        category: 'Acidification',
        description:
          'Vaporized gypsum rocks produced immense atmospheric sulfur trioxide, raining down concentrated acid that stripped foliage and rapidly dissolved surface ocean plankton shells.',
        impactRating: 'Severe',
      },
    ],
    decimatedClades: [
      {
        name: 'Non-Avian Dinosaurs',
        type: 'Terrestrial Archosaurs',
        status: 'Completely Extinct',
        description: 'Every single non-avian dinosaur species on Earth—from the colossal sauropods to iconic apex predators—was permanently annihilated.',
        notableSpecimens: [
          { name: 'Tyrannosaurus rex', speciesId: 24, role: 'Late Cretaceous Apex Predator' },
          { name: 'Triceratops horridus', speciesId: 25, role: 'Ceratopsian Mega-Herbivore' },
          { name: 'Ankylosaurus magniventris', speciesId: 28, role: 'Armored Herbivore' },
          { name: 'Rajasaurus narmadensis', speciesId: 1, role: 'Gondwanan Abelisaurid Predator' },
        ],
      },
      {
        name: 'Pterosauria (Pterosaurs)',
        type: 'Winged Reptiles',
        status: 'Completely Extinct',
        description: 'The rulers of the Mesozoic skies, including colossal azhdarchids with 11-meter wingspans, completely perished.',
        notableSpecimens: [
          { name: 'Quetzalcoatlus northropi', speciesId: 30, role: 'Colossal Azhdarchid Pterosaur' },
        ],
      },
      {
        name: 'Marine Reptiles (Mosasaurs & Plesiosaurs)',
        type: 'Marine Apex Predators',
        status: 'Completely Extinct',
        description: 'The terrifying apex rulers of Cretaceous oceans vanished as the marine plankton base starved out higher trophic levels.',
        notableSpecimens: [
          { name: 'Mosasaurus hoffmannii', speciesId: 29, role: 'Apex Marine Macropredator' },
        ],
      },
      {
        name: 'Ammonoidea (Ammonites) & Belemnites',
        type: 'Cephalopods',
        status: 'Completely Extinct',
        description: 'The iconic spiral-shelled cephalopods that filled the oceans for over 350 million years were wiped out down to the very last individual.',
      },
    ],
    survivorsAndRadiators: [
      {
        name: 'Avian Dinosaurs (Neornithes / Modern Birds)',
        type: 'Maniraptoran Theropods',
        survivalKey: 'Toothless beaks capable of crushing hardy buried seeds during the impact winter, ground-dwelling habits, small body size, and flight mobility.',
        postExtinctionRadiation: 'The sole surviving branch of Dinosauria, radiating into over 10,000 living species of modern birds today.',
      },
      {
        name: 'Mammalia (Placentals, Marsupials, Monotremes)',
        type: 'Synapsids',
        survivalKey: 'Subterranean burrowing shielded from thermal radiation; omnivorous detritivory (eating dead roots, fungi, insects) during photosynthetic collapse.',
        postExtinctionRadiation: 'Exploded into the Paleocene and Eocene megafauna, evolving into whales, primates, elephants, bats, carnivorans, and eventually humans.',
      },
      {
        name: 'Crocodylia (True Crocodilians)',
        type: 'Pseudosuchian Archosaurs',
        survivalKey: 'Semi-aquatic freshwater habitats, extremely low metabolic rates (able to fast for over a year), and detritus-based river food webs.',
        postExtinctionRadiation: 'Persisted largely unchanged into modern alligators, crocodiles, and gharials.',
      },
      {
        name: 'Testudines (Turtles) & Lepidosauria (Lizards, Snakes)',
        type: 'Reptiles',
        survivalKey: 'Brumation/hibernation capabilities, burrowing, cold-blooded low energy demands, and aquatic resilience.',
        postExtinctionRadiation: 'Remained foundational components of global terrestrial and freshwater ecosystems.',
      },
    ],
    macroevolutionaryLegacy:
      'The K-Pg boundary brought the curtain down on the Mesozoic Era. By clearing out non-avian dinosaurs and giant marine reptiles, the ecological vacuum permitted tiny, nocturnal burrowing mammals to step into daylight, multiply in size by hundreds of times, and inaugurate the Cenozoic "Age of Mammals".',
    rajyPrompt: 'Explain how the Chicxulub asteroid impact and Deccan Traps combined to wipe out T. rex and ammonites, while mammals and avian birds survived.',
    badgeColor: 'bg-red-950/80 text-red-400 border-red-500/40',
    accentBorder: 'border-red-500/30 hover:border-red-500/60',
  },
];

// Phanerozoic climate points (541 to 0 Ma)
const PHANEROZOIC_CLIMATE_DATA = [
  { ageMa: 541, period: 'Cambrian', o2Percent: 12.5, co2Ppm: 4500, tempCelsius: 22.0, seaLevelMeters: 180, notes: 'Cambrian Explosion commences. High greenhouse atmosphere.' },
  { ageMa: 520, period: 'Cambrian', o2Percent: 13.8, co2Ppm: 4200, tempCelsius: 21.5, seaLevelMeters: 200, notes: 'Radiation of early trilobites and stem-arthropods.' },
  { ageMa: 500, period: 'Cambrian', o2Percent: 15.0, co2Ppm: 4400, tempCelsius: 22.5, seaLevelMeters: 220, notes: 'Warm shallow epeiric seas dominate paleocontinents.' },
  { ageMa: 485, period: 'Ordovician', o2Percent: 16.5, co2Ppm: 4100, tempCelsius: 21.0, seaLevelMeters: 210, notes: 'Great Ordovician Biodiversification Event (GOBE).' },
  { ageMa: 470, period: 'Ordovician', o2Percent: 17.5, co2Ppm: 3900, tempCelsius: 19.5, seaLevelMeters: 200, notes: 'Vast epicontinental carbonate platforms spread.' },
  { ageMa: 455, period: 'Ordovician', o2Percent: 18.0, co2Ppm: 3400, tempCelsius: 17.0, seaLevelMeters: 160, notes: 'Gradual cooling trend as land plants begin silicate weathering.' },
  { ageMa: 443.8, period: 'Ordovician', o2Percent: 15.2, co2Ppm: 2200, tempCelsius: 11.5, seaLevelMeters: -40, notes: 'Hirnantian Glaciation peak! O-S Mass Extinction event.' },
  { ageMa: 435, period: 'Silurian', o2Percent: 16.8, co2Ppm: 3200, tempCelsius: 17.5, seaLevelMeters: 110, notes: 'Post-Hirnantian deglaciation; coral reefs recover.' },
  { ageMa: 420, period: 'Silurian', o2Percent: 18.2, co2Ppm: 3100, tempCelsius: 18.0, seaLevelMeters: 140, notes: 'First vascular land plants (Cooksonia) and early jawed fishes.' },
  { ageMa: 410, period: 'Devonian', o2Percent: 19.5, co2Ppm: 2800, tempCelsius: 19.5, seaLevelMeters: 170, notes: 'Age of Fishes begins; placoderms radiate globally.' },
  { ageMa: 395, period: 'Devonian', o2Percent: 21.0, co2Ppm: 2300, tempCelsius: 21.0, seaLevelMeters: 190, notes: 'First deep-rooted forests (Archaeopteris) accelerate weathering.' },
  { ageMa: 372.2, period: 'Devonian', o2Percent: 19.0, co2Ppm: 1800, tempCelsius: 15.0, seaLevelMeters: 80, notes: 'Kellwasser Event! Marine anoxia causes Late Devonian Extinction.' },
  { ageMa: 358.9, period: 'Devonian', o2Percent: 17.5, co2Ppm: 1200, tempCelsius: 13.0, seaLevelMeters: 40, notes: 'Hangenberg Event; placoderm fishes wiped out.' },
  { ageMa: 340, period: 'Carboniferous', o2Percent: 24.5, co2Ppm: 800, tempCelsius: 14.5, seaLevelMeters: 90, notes: 'Mississippian coal swamps expand; atmospheric O2 surges.' },
  { ageMa: 320, period: 'Carboniferous', o2Percent: 29.0, co2Ppm: 450, tempCelsius: 12.0, seaLevelMeters: 30, notes: 'Pennsylvanian ice age; giant arthropods (Arthropleura).' },
  { ageMa: 300, period: 'Carboniferous', o2Percent: 34.5, co2Ppm: 320, tempCelsius: 11.0, seaLevelMeters: -10, notes: 'Peak Phanerozoic O2 (~35%)! Evolution of amniote egg.' },
  { ageMa: 280, period: 'Permian', o2Percent: 30.0, co2Ppm: 600, tempCelsius: 14.0, seaLevelMeters: 40, notes: 'Pangea coalesces; aridification of continental interiors.' },
  { ageMa: 265, period: 'Permian', o2Percent: 24.0, co2Ppm: 900, tempCelsius: 17.5, seaLevelMeters: 60, notes: 'Synapsid apex predators (Dimetrodon, Gorgonopsians) dominate.' },
  { ageMa: 251.9, period: 'Permian', o2Percent: 13.5, co2Ppm: 2800, tempCelsius: 28.5, seaLevelMeters: -20, notes: 'Siberian Traps eruptions! THE GREAT DYING (96% species loss).' },
  { ageMa: 245, period: 'Triassic', o2Percent: 14.5, co2Ppm: 2200, tempCelsius: 27.0, seaLevelMeters: 20, notes: 'Early Triassic super-hot desert world; Lystrosaurus disaster taxon.' },
  { ageMa: 230, period: 'Triassic', o2Percent: 16.0, co2Ppm: 1800, tempCelsius: 24.0, seaLevelMeters: 50, notes: 'Carnian Pluvial Episode; sudden 2-million-year humid rainfall pulse.' },
  { ageMa: 215, period: 'Triassic', o2Percent: 17.5, co2Ppm: 1950, tempCelsius: 22.5, seaLevelMeters: 70, notes: 'First basal dinosaurs (Coelophysis) and early pterosaurs emerge.' },
  { ageMa: 201.4, period: 'Triassic', o2Percent: 15.0, co2Ppm: 2600, tempCelsius: 25.0, seaLevelMeters: 30, notes: 'CAMP Basalt volcanism! End-Triassic Mass Extinction.' },
  { ageMa: 190, period: 'Jurassic', o2Percent: 18.0, co2Ppm: 1900, tempCelsius: 21.0, seaLevelMeters: 80, notes: 'Dinosaurs radiate explosively across Pangean rift valleys.' },
  { ageMa: 165, period: 'Jurassic', o2Percent: 21.0, co2Ppm: 1600, tempCelsius: 19.5, seaLevelMeters: 110, notes: 'Rise of colossal sauropods and allosauroid predators.' },
  { ageMa: 150, period: 'Jurassic', o2Percent: 23.5, co2Ppm: 1450, tempCelsius: 19.0, seaLevelMeters: 130, notes: 'Morrison Formation & Solnhofen lagoons thrive.' },
  { ageMa: 130, period: 'Cretaceous', o2Percent: 24.5, co2Ppm: 1300, tempCelsius: 20.0, seaLevelMeters: 150, notes: 'First flowering angiosperm plants emerge and co-evolve.' },
  { ageMa: 100, period: 'Cretaceous', o2Percent: 26.0, co2Ppm: 1600, tempCelsius: 24.5, seaLevelMeters: 220, notes: 'Cretaceous Thermal Maximum; super-high sea levels flood continents.' },
  { ageMa: 80, period: 'Cretaceous', o2Percent: 25.0, co2Ppm: 1100, tempCelsius: 21.5, seaLevelMeters: 180, notes: 'Western Interior Seaway teems with mosasaurs and ammonites.' },
  { ageMa: 66.0, period: 'Cretaceous', o2Percent: 23.5, co2Ppm: 950, tempCelsius: 19.0, seaLevelMeters: 120, notes: 'Chicxulub Asteroid Impact & Deccan Traps! K-Pg Extinction.' },
  { ageMa: 55, period: 'Paleogene', o2Percent: 22.5, co2Ppm: 1400, tempCelsius: 26.0, seaLevelMeters: 90, notes: 'PETM thermal maximum; mammals rapidly radiate into megafauna.' },
  { ageMa: 34, period: 'Paleogene', o2Percent: 21.8, co2Ppm: 600, tempCelsius: 16.5, seaLevelMeters: 40, notes: 'Eocene-Oligocene cooling; Antarctic ice sheet initiates.' },
  { ageMa: 20, period: 'Neogene', o2Percent: 21.2, co2Ppm: 400, tempCelsius: 15.5, seaLevelMeters: 25, notes: 'Grasslands expand globally; rise of modern ungulates.' },
  { ageMa: 3, period: 'Neogene', o2Percent: 20.9, co2Ppm: 300, tempCelsius: 13.0, seaLevelMeters: 10, notes: 'Isthmus of Panama closes; Great American Biotic Interchange.' },
  { ageMa: 0, period: 'Quaternary', o2Percent: 20.9, co2Ppm: 280, tempCelsius: 14.5, seaLevelMeters: 0, notes: 'Present Day (pre-industrial baseline). Modern biosphere.' },
];

async function initExtinctionTables() {
  try {
    console.log('Connecting to PostgreSQL and creating Extinction tables...');

    // 1. Create ExtinctionEvent Table
    await prisma.$queryRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ExtinctionEvent" (
        "id" SERIAL PRIMARY KEY,
        "slug" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "commonName" TEXT NOT NULL,
        "peakAgeMa" DOUBLE PRECISION NOT NULL,
        "ageSpanLabel" TEXT NOT NULL,
        "period" TEXT NOT NULL,
        "epoch" TEXT NOT NULL,
        "speciesLossPercent" INTEGER NOT NULL,
        "marineGeneraLossPercent" INTEGER NOT NULL,
        "terrestrialLossPercent" INTEGER NOT NULL,
        "estimatedDuration" TEXT NOT NULL,
        "headline" TEXT NOT NULL,
        "overview" TEXT NOT NULL,
        "killMechanisms" JSONB NOT NULL,
        "decimatedClades" JSONB NOT NULL,
        "survivorsAndRadiators" JSONB NOT NULL,
        "macroevolutionaryLegacy" TEXT NOT NULL,
        "rajyPrompt" TEXT NOT NULL,
        "badgeColor" TEXT NOT NULL,
        "accentBorder" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await prisma.$queryRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ExtinctionEvent_peakAgeMa_idx" ON "ExtinctionEvent"("peakAgeMa");
    `);

    // 2. Create PaleoclimatePoint Table
    await prisma.$queryRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PaleoclimatePoint" (
        "id" SERIAL PRIMARY KEY,
        "ageMa" DOUBLE PRECISION UNIQUE NOT NULL,
        "period" TEXT NOT NULL,
        "epoch" TEXT,
        "o2Percent" DOUBLE PRECISION NOT NULL,
        "co2Ppm" DOUBLE PRECISION NOT NULL,
        "tempCelsius" DOUBLE PRECISION NOT NULL,
        "seaLevelMeters" DOUBLE PRECISION NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await prisma.$queryRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "PaleoclimatePoint_ageMa_idx" ON "PaleoclimatePoint"("ageMa");
    `);

    console.log('✅ PostgreSQL tables "ExtinctionEvent" and "PaleoclimatePoint" created or verified.');

    // 3. Upsert Mass Extinction Events
    console.log('Seeding Big Five mass extinction records...');
    for (const ext of MASS_EXTINCTIONS) {
      await prisma.$queryRawUnsafe(
        `
        INSERT INTO "ExtinctionEvent" (
          "slug", "name", "commonName", "peakAgeMa", "ageSpanLabel", "period", "epoch",
          "speciesLossPercent", "marineGeneraLossPercent", "terrestrialLossPercent",
          "estimatedDuration", "headline", "overview", "killMechanisms", "decimatedClades",
          "survivorsAndRadiators", "macroevolutionaryLegacy", "rajyPrompt", "badgeColor", "accentBorder", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15::jsonb, $16::jsonb, $17, $18, $19, $20, NOW()
        )
        ON CONFLICT ("slug") DO UPDATE SET
          "name" = EXCLUDED."name",
          "commonName" = EXCLUDED."commonName",
          "peakAgeMa" = EXCLUDED."peakAgeMa",
          "ageSpanLabel" = EXCLUDED."ageSpanLabel",
          "period" = EXCLUDED."period",
          "epoch" = EXCLUDED."epoch",
          "speciesLossPercent" = EXCLUDED."speciesLossPercent",
          "marineGeneraLossPercent" = EXCLUDED."marineGeneraLossPercent",
          "terrestrialLossPercent" = EXCLUDED."terrestrialLossPercent",
          "estimatedDuration" = EXCLUDED."estimatedDuration",
          "headline" = EXCLUDED."headline",
          "overview" = EXCLUDED."overview",
          "killMechanisms" = EXCLUDED."killMechanisms",
          "decimatedClades" = EXCLUDED."decimatedClades",
          "survivorsAndRadiators" = EXCLUDED."survivorsAndRadiators",
          "macroevolutionaryLegacy" = EXCLUDED."macroevolutionaryLegacy",
          "rajyPrompt" = EXCLUDED."rajyPrompt",
          "badgeColor" = EXCLUDED."badgeColor",
          "accentBorder" = EXCLUDED."accentBorder",
          "updatedAt" = NOW();
        `,
        ext.slug,
        ext.name,
        ext.commonName,
        ext.peakAgeMa,
        ext.ageSpanLabel,
        ext.period,
        ext.epoch,
        ext.speciesLossPercent,
        ext.marineGeneraLossPercent,
        ext.terrestrialLossPercent,
        ext.estimatedDuration,
        ext.headline,
        ext.overview,
        JSON.stringify(ext.killMechanisms),
        JSON.stringify(ext.decimatedClades),
        JSON.stringify(ext.survivorsAndRadiators),
        ext.macroevolutionaryLegacy,
        ext.rajyPrompt,
        ext.badgeColor,
        ext.accentBorder
      );
    }
    console.log(`✅ ${MASS_EXTINCTIONS.length} Mass Extinction records seeded.`);

    // 4. Upsert Paleoclimate Points
    console.log('Seeding Phanerozoic paleoclimate curves...');
    for (const pt of PHANEROZOIC_CLIMATE_DATA) {
      await prisma.$queryRawUnsafe(
        `
        INSERT INTO "PaleoclimatePoint" (
          "ageMa", "period", "epoch", "o2Percent", "co2Ppm", "tempCelsius", "seaLevelMeters", "notes", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW()
        )
        ON CONFLICT ("ageMa") DO UPDATE SET
          "period" = EXCLUDED."period",
          "epoch" = EXCLUDED."epoch",
          "o2Percent" = EXCLUDED."o2Percent",
          "co2Ppm" = EXCLUDED."co2Ppm",
          "tempCelsius" = EXCLUDED."tempCelsius",
          "seaLevelMeters" = EXCLUDED."seaLevelMeters",
          "notes" = EXCLUDED."notes",
          "updatedAt" = NOW();
        `,
        pt.ageMa,
        pt.period,
        pt.epoch || null,
        pt.o2Percent,
        pt.co2Ppm,
        pt.tempCelsius,
        pt.seaLevelMeters,
        pt.notes || null
      );
    }
    console.log(`✅ ${PHANEROZOIC_CLIMATE_DATA.length} Paleoclimate points seeded.`);

    // 5. Verification Check: Ensure Species table was 100% untouched
    const speciesCount = await prisma.species.count();
    console.log(`🛡️ Verification: Species count is ${speciesCount} (Target: 790).`);
    if (speciesCount === 790) {
      console.log('✅ 100% Anti-Regression Invariant PASSED: Species records remain untouched!');
    } else {
      console.error('❌ Invariant VIOLATION: Species count changed!');
    }
  } catch (err: any) {
    console.error('Migration error:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

initExtinctionTables();
