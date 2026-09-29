import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Dna, 
  Search, 
  ChevronRight, 
  Sparkles, 
  Info, 
  ArrowUpRight, 
  Loader2
} from 'lucide-react';
import { fetchSpeciesRoster, SpeciesRosterItem } from '../services/api.js';
import ShinyText from './reactbits/ShinyText.js';

interface CladeNode {
  id: string;
  name: string;
  scientificName: string;
  rank: string;
  timeRange: string;
  synapomorphy: string;
  description: string;
  color: string;
  subclades?: CladeNode[];
  matchFn?: (s: SpeciesRosterItem) => boolean;
}

const CLADOGRAM_DATA: CladeNode[] = [
  {
    id: 'saurischia-theropoda',
    name: 'Theropoda',
    scientificName: 'Theropoda ("Beast-Footed")',
    rank: 'Suborder',
    timeRange: '231–0 Ma (Extant in Aves)',
    synapomorphy: 'Hollow, thin-walled limb bones (pneumaticity), three functional weight-bearing toes, and intramandibular shock-absorbing joint.',
    description: 'Ancestrally bipedal carnivorous archosaurs spanning apex apex carnosaurs, feathered paravians, and modern avian dinosaurs.',
    color: '#EF4444',
    subclades: [
      {
        id: 'theropoda-basal',
        name: 'Basal Neotheropoda',
        scientificName: 'Neotheropoda & Coelophysoidea',
        rank: 'Infraorder',
        timeRange: '230–185 Ma',
        synapomorphy: 'Gracile bipedal cursorial skeletons, flexible cranial kinesis, paired cranial crests in dilophosaurids.',
        description: 'Triassic and Early Jurassic pioneer runners that initiated theropod dominance.',
        color: '#F87171',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('coelophys') || fam.includes('dilophosaur') || name.includes('coelophysis') || name.includes('dilophosaurus') || name.includes('herrerasaur');
        }
      },
      {
        id: 'theropoda-ceratosauria',
        name: 'Ceratosauria & Abelisauridae',
        scientificName: 'Ceratosauria',
        rank: 'Infraorder',
        timeRange: '190–66 Ma',
        synapomorphy: 'Heavily rugose, fused cranial ornamentation, vestigial or reduced forelimbs, and reinforced sacrum.',
        description: 'Dominant Gondwanan apex predators sporting short, robust snouts and cranial horns.',
        color: '#F97316',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('ceratosaur') || fam.includes('abelisaur') || fam.includes('noasaur') || name.includes('carnotaurus') || name.includes('ceratosaurus') || name.includes('majungasaurus') || name.includes('rugops');
        }
      },
      {
        id: 'theropoda-spinosauridae',
        name: 'Spinosauridae & Megalosauroidea',
        scientificName: 'Spinosauridae & Megalosauroidea',
        rank: 'Superfamily',
        timeRange: '170–93 Ma',
        synapomorphy: 'Hypertrophied manual ungual I (recurve thumb hook), conical non-serrated teeth, and elevated dorsal neural spines.',
        description: 'Semi-aquatic shoreline specialists adapted for piscivory with sensory snout pits and dense osteosclerotic bones.',
        color: '#06B6D4',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('spinosaur') || fam.includes('megalosaur') || name.includes('spinosaurus') || name.includes('baryonyx') || name.includes('suchomimus') || name.includes('torvosaurus') || name.includes('megalosaurus');
        }
      },
      {
        id: 'theropoda-allosauroidea',
        name: 'Allosauroidea & Carcharodontosauria',
        scientificName: 'Allosauroidea',
        rank: 'Superfamily',
        timeRange: '165–89 Ma',
        synapomorphy: 'Ziphodont, laterally compressed blade teeth and kinetic skulls specialized for high-velocity slashing jaw strikes.',
        description: 'Apex macro-predators of the Jurassic and Mid-Cretaceous, hunting giant sauropods and ornithischians.',
        color: '#DC2626',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('allosaur') || fam.includes('carcharodontosaur') || fam.includes('neovenator') || fam.includes('metriacanthosaur') || name.includes('allosaurus') || name.includes('giganotosaurus') || name.includes('carcharodontosaurus') || name.includes('mapusaurus') || name.includes('acrocanthosaurus');
        }
      },
      {
        id: 'theropoda-tyrannosauroidea',
        name: 'Tyrannosauroidea',
        scientificName: 'Tyrannosauroidea',
        rank: 'Superfamily',
        timeRange: '165–66 Ma',
        synapomorphy: 'Incrassate D-shaped premaxillary teeth, fused nasal bones, stereoscopic vision, and immense osteophagous bite forces (>35,000 N).',
        description: 'Apex predators of Laurasia, evolving from small agile agile runners into giant bone-crushing titans.',
        color: '#B91C1C',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('tyrannosaur') || fam.includes('proceratosaur') || name.includes('tyrannosaurus') || name.includes('tarbosaurus') || name.includes('albertosaurus') || name.includes('gorgosaurus') || name.includes('daspletosaurus') || name.includes('yutyrannus') || name.includes('qianzhousaurus');
        }
      },
      {
        id: 'theropoda-maniraptora',
        name: 'Maniraptora & Paraves',
        scientificName: 'Maniraptora & Paraves',
        rank: 'Clade',
        timeRange: '160–0 Ma',
        synapomorphy: 'Pennaceous vaned contour feathers, semi-lunate carpal wrist bone for lateral folding, and hyperextensible second toe sickle claw.',
        description: 'Feathered, large-brained theropods including dromaeosaurs, troodontids, and the lineage that produced living birds.',
        color: '#EC4899',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('dromaeosaur') || fam.includes('troodont') || fam.includes('oviraptor') || fam.includes('therizinosaur') || fam.includes('ornithomim') || fam.includes('archaeopteryg') || name.includes('velociraptor') || name.includes('deinonychus') || name.includes('utahraptor') || name.includes('archaeopteryx') || name.includes('microraptor') || name.includes('therizinosaurus');
        }
      }
    ]
  },
  {
    id: 'saurischia-sauropodomorpha',
    name: 'Sauropodomorpha',
    scientificName: 'Sauropodomorpha ("Lizard-Foot Forms")',
    rank: 'Suborder',
    timeRange: '230–66 Ma',
    synapomorphy: 'Elongated cervical vertebrae, miniaturized skulls relative to torso, columnar graviportal limbs, and extensive internal vertebral pneumaticity.',
    description: 'The largest terrestrial animals in Earth history, progressing from small Triassic bipedal browsers to 70-tonne titanosaurs.',
    color: '#10B981',
    subclades: [
      {
        id: 'sauropod-prosauropod',
        name: 'Basal Sauropodomorphs',
        scientificName: 'Plateosauria & Anchisauria',
        rank: 'Infraorder',
        timeRange: '230–180 Ma',
        synapomorphy: 'Bipedal/facultative quadrupedal posture, leaf-shaped serrated cropping teeth, and enlarged manual thumb claw.',
        description: 'Late Triassic and Early Jurassic pioneer herbivores that initiated high-canopy grazing.',
        color: '#34D399',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('plateosaur') || fam.includes('massospondyl') || fam.includes('anchisaur') || name.includes('plateosaurus') || name.includes('massospondylus') || name.includes('lufengosaurus');
        }
      },
      {
        id: 'sauropod-diplodocoidea',
        name: 'Diplodocoidea',
        scientificName: 'Diplodocoidea',
        rank: 'Superfamily',
        timeRange: '170–93 Ma',
        synapomorphy: 'Whiplash tail with elongated chevron bones, peg-like pencil teeth concentrated in snout tip, and bifurcated neural spines for elastic ligaments.',
        description: 'Long-necked, low-to-medium canopy rakers and whip-tailed defensive giants of the Jurassic.',
        color: '#059669',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('diplodoc') || fam.includes('dicraeosaur') || fam.includes('rebbachisaur') || name.includes('diplodocus') || name.includes('apatosaurus') || name.includes('brontosaurus') || name.includes('barosaurus') || name.includes('amargasaurus');
        }
      },
      {
        id: 'sauropod-macronaria',
        name: 'Macronaria & Titanosauria',
        scientificName: 'Macronaria & Titanosauria',
        rank: 'Superfamily',
        timeRange: '165–66 Ma',
        synapomorphy: 'Nares larger than orbits, anteriorly elevated shoulder girdles for vertical browsing, and broad bone-supported feet.',
        description: 'Towering canopy giants including Brachiosaurus and the colossal armored Late Cretaceous titanosaurs.',
        color: '#047857',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('brachiosaur') || fam.includes('camarasaur') || fam.includes('titanosaur') || fam.includes('saltasaur') || name.includes('brachiosaurus') || name.includes('giraffatitan') || name.includes('argentinosaurus') || name.includes('dreadnoughtus') || name.includes('patagotitan') || name.includes('alamosaurus') || name.includes('camarasaurus');
        }
      }
    ]
  },
  {
    id: 'ornithischia',
    name: 'Ornithischia',
    scientificName: 'Ornithischia ("Bird-Hipped Dinosaurs")',
    rank: 'Order',
    timeRange: '230–66 Ma',
    synapomorphy: 'Posteriorly directed pubis bone, predentary bone in lower jaw, and inset tooth rows indicating muscular cheeks for plant chewing.',
    description: 'A colossal herbivorous radiation featuring armored plate-backs, horned shields, dome-skulls, and duck-billed dental batteries.',
    color: '#F59E0B',
    subclades: [
      {
        id: 'ornithischia-thyreophora',
        name: 'Thyreophora (Stegosaurs & Ankylosaurs)',
        scientificName: 'Thyreophora ("Shield-Bearers")',
        rank: 'Suborder',
        timeRange: '200–66 Ma',
        synapomorphy: 'Longitudinal rows of dermal armor (osteoderms), paired caudal spikes (thagomizers), and fused osteoderm tail clubs.',
        description: 'Heavily fortified quadrupeds armored against theropod bites with dorsal plates, spikes, and pelvic shields.',
        color: '#D97706',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('stegosaur') || fam.includes('ankylosaur') || fam.includes('nodosaur') || fam.includes('scelidosaur') || name.includes('stegosaurus') || name.includes('ankylosaurus') || name.includes('kentrosaurus') || name.includes('borealopelta') || name.includes('euoplocephalus');
        }
      },
      {
        id: 'ornithischia-marginocephalia',
        name: 'Marginocephalia (Ceratopsians & Pachycephalosaurs)',
        scientificName: 'Marginocephalia ("Fringed Heads")',
        rank: 'Suborder',
        timeRange: '160–66 Ma',
        synapomorphy: 'Expanded posterior parietal-squamosal frill/shelf, rostral bone beak, and thickened frontoparietal dome.',
        description: 'Horned quadrupedal herd herbivores and dome-headed bipeds adapted for social combat and predator defense.',
        color: '#B45309',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('ceratops') || fam.includes('pachycephalosaur') || fam.includes('psittacosaur') || fam.includes('protoceratop') || name.includes('triceratops') || name.includes('styracosaurus') || name.includes('pachycephalosaurus') || name.includes('protoceratops') || name.includes('centrosaurus');
        }
      },
      {
        id: 'ornithischia-ornithopoda',
        name: 'Ornithopoda (Hadrosaurs & Iguanodonts)',
        scientificName: 'Ornithopoda ("Bird-Feet")',
        rank: 'Suborder',
        timeRange: '190–66 Ma',
        synapomorphy: 'Pleurokinetic skulls enabling chewing jaw motion, keratinous rhamphotheca beaks, and grinding multi-layered dental batteries.',
        description: 'The premier browsers of the Cretaceous, renowned for cranial resonating crests and bipedal/quadrupedal versatility.',
        color: '#EAB308',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('hadrosaur') || fam.includes('iguanodont') || fam.includes('dryosaur') || fam.includes('hypsilophodont') || name.includes('parasaurolophus') || name.includes('edmontosaurus') || name.includes('corythosaurus') || name.includes('iguanodon') || name.includes('maiasaura');
        }
      }
    ]
  },
  {
    id: 'pterosauria',
    name: 'Pterosauria',
    scientificName: 'Pterosauria ("Winged Lizards")',
    rank: 'Order',
    timeRange: '228–66 Ma',
    synapomorphy: 'Elongated fourth manual digit supporting flight wing membrane (patagium), pteroid bone, and ultra-light hollow bones.',
    description: 'The first vertebrates to achieve active flapping powered flight, from sparrow-sized insectivores to aircraft-sized azhdarchids.',
    color: '#8B5CF6',
    subclades: [
      {
        id: 'pterosaur-rhampho',
        name: 'Basal Pterosauria ("Rhamphorhynchoids")',
        scientificName: 'Non-Pterodactyloid Pterosaurs',
        rank: 'Suborder (Grade)',
        timeRange: '228–145 Ma',
        synapomorphy: 'Long bony tails with terminal vanes, fifth pedal toe, and distinct interlocking dentition.',
        description: 'Triassic and Jurassic flying reptiles patrolling ancient coastlines and insect-rich canopies.',
        color: '#A78BFA',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return s.clade === 'Pterosaur' && (fam.includes('rhamphorhynch') || fam.includes('dimorphodont') || fam.includes('anurognath') || name.includes('rhamphorhynchus') || name.includes('dimorphodon') || name.includes('scaphognathus'));
        }
      },
      {
        id: 'pterosaur-pterodactyloidea',
        name: 'Pterodactyloidea',
        scientificName: 'Pterodactyloidea',
        rank: 'Suborder',
        timeRange: '155–66 Ma',
        synapomorphy: 'Shortened tails, confluent nostril and antorbital fenestra, elongated metacarpals, and elaborate cranial crests.',
        description: 'Advanced Mesozoic flyers culminating in Quetzalcoatlus with an 11-meter wingspan.',
        color: '#7C3AED',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return s.clade === 'Pterosaur' && (!fam.includes('rhamphorhynch') && !fam.includes('dimorphodont') && !name.includes('rhamphorhynchus') && !name.includes('dimorphodon'));
        }
      }
    ]
  },
  {
    id: 'marine-reptiles',
    name: 'Marine Reptile Radiations',
    scientificName: 'Sauropterygia, Ichthyosauria & Mosasauroidea',
    rank: 'Clade (Marine Formations)',
    timeRange: '250–66 Ma',
    synapomorphy: 'Hyperphalangy flippers, viviparous live-birth adaptations, hydrofoil bodies, and salt-excretion glands.',
    description: 'Secondarily adapted aquatic diapsids dominating the prehistoric oceans throughout the Mesozoic.',
    color: '#0284C7',
    subclades: [
      {
        id: 'marine-ichthyosauria',
        name: 'Ichthyopterygia (Fish-Lizards)',
        scientificName: 'Ichthyosauria',
        rank: 'Order',
        timeRange: '250–90 Ma',
        synapomorphy: 'Dolphin-convergent fusiform body, sclerotic eye rings, dorsal fin, and vertical hypocercal tail fin.',
        description: 'High-speed pelagic pursuit predators that conquered deep waters through extreme convergent evolution.',
        color: '#38BDF8',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('ichthyosaur') || fam.includes('shonisaur') || fam.includes('ophthalmosaur') || name.includes('ichthyosaurus') || name.includes('shonisaurus') || name.includes('ophthalmosaurus');
        }
      },
      {
        id: 'marine-sauropterygia',
        name: 'Sauropterygia (Plesiosaurs & Pliosaurs)',
        scientificName: 'Plesiosauria & Pliosauroidea',
        rank: 'Order',
        timeRange: '245–66 Ma',
        synapomorphy: 'Four-flipper underwater flight mechanics, rigid reinforced ventral gastralia basket, and elongated cervical series.',
        description: 'Snake-necked fish snipers (Plesiosauroidea) and massive mega-predatory crushing jaws (Pliosauroidea).',
        color: '#0EA5E9',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('plesiosaur') || fam.includes('pliosaur') || fam.includes('elasmorosaur') || name.includes('plesiosaurus') || name.includes('liopleurodon') || name.includes('elasmosaurus') || name.includes('kronosaurus');
        }
      },
      {
        id: 'marine-mosasauroidea',
        name: 'Mosasauroidea (Sea Squamates)',
        scientificName: 'Mosasauroidea',
        rank: 'Superfamily',
        timeRange: '98–66 Ma',
        synapomorphy: 'Intramandibular joint, pterygoid palate teeth for swallowing whole prey, and hypocercal tail flukes.',
        description: 'Apex marine squamates related to monitor lizards that radiated rapidly in the Late Cretaceous.',
        color: '#0369A1',
        matchFn: (s) => {
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('mosasaur') || fam.includes('tylosaur') || name.includes('mosasaurus') || name.includes('tylosaurus') || name.includes('platecarpus') || name.includes('clidastes');
        }
      }
    ]
  },
  {
    id: 'synapsida',
    name: 'Synapsida & Stem-Mammals',
    scientificName: 'Synapsida ("Single-Arch Reptiles")',
    rank: 'Clade',
    timeRange: '318–0 Ma (Extant in Mammalia)',
    synapomorphy: 'Single lower temporal fenestra behind eye orbit, heterodont differentiated dentition (incisors, canines, molars), and endothermy.',
    description: 'The ancient stem-mammal lineage that produced sail-backed pelycosaurs, gorgonopsians, and modern mammals.',
    color: '#D97706',
    subclades: [
      {
        id: 'synapsida-pelycosauria',
        name: 'Pelycosauria (Sail-Backed Stem-Mammals)',
        scientificName: 'Caseasauria & Eupelycosauria',
        rank: 'Grade',
        timeRange: '318–270 Ma',
        synapomorphy: 'Elongated dorsal neural spines supporting thermoregulatory skin sail and early differentiated canines.',
        description: 'Permian apex carnivores and herbivores flourishing long before the dawn of true dinosaurs.',
        color: '#F59E0B',
        matchFn: (s) => {
          const isSyn = s.clade === 'Early_Mammal_Synapsid' || s.clade === 'Early Mammal/Synapsid';
          if (!isSyn) return false;
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          return fam.includes('sphenacodont') || fam.includes('edaphosaur') || fam.includes('caseid') || fam.includes('varanop') || fam.includes('ophiacodont') || name.includes('dimetrodon') || name.includes('edaphosaurus');
        }
      },
      {
        id: 'synapsida-therapsida',
        name: 'Therapsida & Non-Mammalian Cynodontia',
        scientificName: 'Therapsida, Gorgonopsia & Dicynodontia',
        rank: 'Clade',
        timeRange: '275–200 Ma',
        synapomorphy: 'Parasagittal upright limb posture, secondary palate for simultaneous breathing/chewing, and differentiated theriodont dentition.',
        description: 'Saber-toothed gorgonopsians, herbivorous dicynodonts, dinocephalians, and advanced non-mammalian cynodont stem-mammals.',
        color: '#D97706',
        matchFn: (s) => {
          const isSyn = s.clade === 'Early_Mammal_Synapsid' || s.clade === 'Early Mammal/Synapsid';
          if (!isSyn) return false;
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          const ord = (s.taxonomy?.order || '').toLowerCase();
          if (fam.includes('sphenacodont') || fam.includes('edaphosaur') || name.includes('dimetrodon') || name.includes('edaphosaurus')) return false;
          return (
            ord.includes('therapsida') ||
            ord.includes('dinocephalia') ||
            ord.includes('gorgonopsia') ||
            ord.includes('dicynodontia') ||
            ord.includes('cynodontia') ||
            fam.includes('gorgonops') ||
            fam.includes('dicynodont') ||
            fam.includes('kannemeyeri') ||
            fam.includes('lystrosaur') ||
            fam.includes('cynognath') ||
            fam.includes('thrinaxodont') ||
            fam.includes('traversodont') ||
            fam.includes('procynosuch') ||
            fam.includes('tapinocephal') ||
            fam.includes('anteosaur') ||
            fam.includes('estemmenosuch') ||
            fam.includes('stahleckeri') ||
            fam.includes('scylacosaur') ||
            fam.includes('diictodont') ||
            name.includes('inostrancevia') ||
            name.includes('lisowicia') ||
            name.includes('cynognathus') ||
            name.includes('thrinaxodon') ||
            name.includes('placerias') ||
            name.includes('exaeretodon') ||
            name.includes('lystrosaurus') ||
            name.includes('moschops') ||
            name.includes('diictodon') ||
            name.includes('gorgonops') ||
            name.includes('rubidgea') ||
            name.includes('procynosuchus') ||
            name.includes('anteosaurus') ||
            name.includes('estemmenosuchus') ||
            name.includes('scylacosaurus')
          );
        }
      },
      {
        id: 'synapsida-mammalia',
        name: 'Mammaliaformes & Crown Mammals',
        scientificName: 'Mammaliaformes & Mammalia',
        rank: 'Clade',
        timeRange: '210–0 Ma (Extant in Mammalia)',
        synapomorphy: 'Dentary-squamosal jaw articulation, three middle ear ossicles (malleus, incus, stapes), mammary glands, and hair/pelage.',
        description: 'Mesozoic pioneer mammals, Cenozoic megafauna (mammoths, saber-tooths, indricotheres), and marine cetacean radiations.',
        color: '#B45309',
        matchFn: (s) => {
          const isSyn = s.clade === 'Early_Mammal_Synapsid' || s.clade === 'Early Mammal/Synapsid';
          if (!isSyn) return false;
          const name = s.name.toLowerCase();
          const fam = (s.taxonomy?.family || '').toLowerCase();
          const ord = (s.taxonomy?.order || '').toLowerCase();
          if (fam.includes('sphenacodont') || fam.includes('edaphosaur') || name.includes('dimetrodon') || name.includes('edaphosaurus')) return false;
          const isStemTherapsid =
            ord.includes('therapsida') ||
            ord.includes('dinocephalia') ||
            ord.includes('gorgonopsia') ||
            ord.includes('dicynodontia') ||
            ord.includes('cynodontia') ||
            fam.includes('gorgonops') ||
            fam.includes('dicynodont') ||
            fam.includes('kannemeyeri') ||
            fam.includes('lystrosaur') ||
            fam.includes('cynognath') ||
            fam.includes('thrinaxodont') ||
            fam.includes('traversodont') ||
            fam.includes('procynosuch') ||
            fam.includes('tapinocephal') ||
            fam.includes('anteosaur') ||
            fam.includes('estemmenosuch') ||
            fam.includes('stahleckeri') ||
            fam.includes('scylacosaur') ||
            fam.includes('diictodont') ||
            name.includes('inostrancevia') ||
            name.includes('lisowicia') ||
            name.includes('cynognathus') ||
            name.includes('thrinaxodon') ||
            name.includes('placerias') ||
            name.includes('exaeretodon') ||
            name.includes('lystrosaurus') ||
            name.includes('moschops') ||
            name.includes('diictodon') ||
            name.includes('gorgonops') ||
            name.includes('rubidgea') ||
            name.includes('procynosuchus') ||
            name.includes('anteosaurus') ||
            name.includes('estemmenosuchus') ||
            name.includes('scylacosaurus');
          return !isStemTherapsid;
        }
      }
    ]
  }
];

export default function CladogramViewer() {
  const shouldReduceMotion = useReducedMotion();
  const [roster, setRoster] = useState<SpeciesRosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMajorId, setSelectedMajorId] = useState<string>('saurischia-theropoda');
  const [selectedSubcladeId, setSelectedSubcladeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load roster once
  useEffect(() => {
    fetchSpeciesRoster()
      .then((data) => {
        setRoster(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load roster for cladogram', err);
        setLoading(false);
      });
  }, []);

  const activeMajorClade = useMemo(() => {
    return CLADOGRAM_DATA.find((c) => c.id === selectedMajorId) || CLADOGRAM_DATA[0];
  }, [selectedMajorId]);

  // Group species under active subclades
  const subcladesWithSpecies = useMemo(() => {
    const subclades = activeMajorClade.subclades || [];
    return subclades.map((sc) => {
      const matched = roster.filter((s) => {
        if (sc.matchFn) {
          return sc.matchFn(s);
        }
        return false;
      });

      // Filter by search query if present
      const query = searchQuery.trim().toLowerCase();
      const filtered = query
        ? matched.filter(
            (s) =>
              s.name.toLowerCase().includes(query) ||
              s.scientificName.toLowerCase().includes(query) ||
              s.timePeriod.toLowerCase().includes(query) ||
              (s.fossilFormation || '').toLowerCase().includes(query)
          )
        : matched;

      return {
        ...sc,
        speciesCount: matched.length,
        speciesList: filtered
      };
    });
  }, [activeMajorClade, roster, searchQuery]);

  // Auto-select first subclade or maintain selection
  useEffect(() => {
    if (activeMajorClade.subclades && activeMajorClade.subclades.length > 0) {
      if (!selectedSubcladeId || !activeMajorClade.subclades.some(sc => sc.id === selectedSubcladeId)) {
        setSelectedSubcladeId(activeMajorClade.subclades[0].id);
      }
    } else {
      setSelectedSubcladeId(null);
    }
  }, [activeMajorClade]);

  const activeSubclade = useMemo(() => {
    if (!selectedSubcladeId) return null;
    return subcladesWithSpecies.find((sc) => sc.id === selectedSubcladeId) || null;
  }, [selectedSubcladeId, subcladesWithSpecies]);

  // Total matched species in active major clade
  const totalInMajorClade = useMemo(() => {
    return subcladesWithSpecies.reduce((acc, cur) => acc + cur.speciesCount, 0);
  }, [subcladesWithSpecies]);

  return (
    <div className="space-y-8 font-sans">
      {/* ── Top Curatorial Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 font-mono">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-widest mb-1.5">
            <Dna className="h-4 w-4" />
            <span>Phylogenetic Cladistics &bull; Macro-Evolutionary Systematic Stage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3 font-sans">
            <ShinyText text="The Tree of Extinct Life" speed={3.5} />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl font-mono leading-relaxed">
            Trace the evolutionary breakthroughs, anatomical synapomorphies, and deep-time lineage splits connecting 
            <strong> {roster.length || 601} cataloged museum specimens</strong> from early tetrapods to giant dinosaurs.
          </p>
        </div>

        {/* Global Cladogram Search */}
        <div className="w-full lg:w-72 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lineage or species..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/[0.08] focus:border-amber-400 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* ── Primary Clade Navigation Bar (Macro-Phylogenetic Trunks) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
        {CLADOGRAM_DATA.map((clade) => {
          const isSelected = clade.id === selectedMajorId;
          return (
            <button
              key={clade.id}
              onClick={() => {
                setSelectedMajorId(clade.id);
                setSearchQuery('');
              }}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.25)] scale-[1.02]'
                  : 'bg-slate-900/80 hover:bg-slate-850 border-white/[0.08] hover:border-amber-500/40 text-slate-300 hover:text-white'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: isSelected ? '#090D1A' : clade.color }}
              />
              <span>{clade.name}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-3 font-mono text-slate-400">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          <p className="text-xs uppercase tracking-widest">Resolving Macro-Phylogenetic Lineages...</p>
        </div>
      ) : (
        <>
          {/* ── Active Macro-Clade Synapomorphy Banner ── */}
      <motion.div
        key={activeMajorClade.id}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0E172B] to-slate-900 border border-amber-500/25 shadow-xl space-y-3 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
              {activeMajorClade.rank}
            </span>
            <span className="text-slate-200 font-bold font-sans text-sm sm:text-base">
              {activeMajorClade.scientificName}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Range: <strong className="text-slate-200">{activeMajorClade.timeRange}</strong></span>
            <span>&bull;</span>
            <span>Cataloged Specimens: <strong className="text-amber-400">{totalInMajorClade}</strong></span>
          </div>
        </div>

        {/* Defining Evolutionary Breakthrough (Synapomorphy) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Defining Evolutionary Synapomorphy</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
            {activeMajorClade.synapomorphy}
          </p>
        </div>

        <p className="text-xs text-slate-400 italic">
          {activeMajorClade.description}
        </p>
      </motion.div>

      {/* ── Subclade Branches Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Subclade Lineage Tree Column (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span>Evolutionary Branches ({subcladesWithSpecies.length})</span>
            <span>Select Branch</span>
          </div>

          <div className="space-y-2">
            {subcladesWithSpecies.map((sc) => {
              const isActive = sc.id === selectedSubcladeId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedSubcladeId(sc.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isActive
                      ? 'bg-[#152038] border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-slate-900/70 hover:bg-slate-850/90 border-white/[0.08] hover:border-amber-500/30'
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.color }} />
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${isActive ? 'text-amber-300' : 'text-slate-200 group-hover:text-amber-200'}`}>
                        {sc.name}
                      </h4>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      {sc.scientificName} &bull; {sc.timeRange}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-300 font-bold border border-white/[0.08]">
                      {sc.speciesList.length}
                    </span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90 text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Specimen Exhibit Stage (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeSubclade ? (
            <div className="space-y-4">
              {/* Subclade Diagnostic Card */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-white/[0.08] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">{activeSubclade.name}</span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-slate-400 italic font-sans">{activeSubclade.scientificName}</span>
                  </div>
                  <span className="text-slate-400">{activeSubclade.timeRange}</span>
                </div>
                <div className="text-xs text-slate-300 font-mono bg-slate-950/70 p-2.5 rounded-lg border border-white/[0.04]">
                  <strong className="text-amber-400/90 uppercase text-[10px] tracking-wider block mb-0.5">
                    Branch Synapomorphy:
                  </strong>
                  {activeSubclade.synapomorphy}
                </div>
              </div>

              {/* Specimen Cards Grid */}
              <div className="flex items-center justify-between px-1 text-xs font-mono text-slate-400">
                <span>Cataloged Specimens ({activeSubclade.speciesList.length})</span>
                <span className="text-[11px] text-slate-500">Click specimen to view full exhibit dossier</span>
              </div>

              {activeSubclade.speciesList.length === 0 ? (
                <div className="p-10 rounded-2xl bg-slate-900/40 border border-white/[0.06] text-center space-y-2">
                  <Info className="h-8 w-8 text-slate-500 mx-auto" />
                  <p className="text-xs font-mono text-slate-400">
                    No cataloged specimens in this specific branch match your search criteria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeSubclade.speciesList.map((specimen) => (
                    <Link
                      key={specimen.id}
                      to={`/species/${specimen.id}`}
                      className="group relative p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-850/95 border border-white/[0.08] hover:border-amber-500/50 hover:shadow-[0_4px_20px_rgba(245,158,11,0.12)] transition-all duration-200 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <h5 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                            {specimen.name}
                          </h5>
                          <p className="text-[11px] font-mono text-slate-400 italic truncate">
                            {specimen.scientificName}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                          #{specimen.id}
                        </span>
                      </div>

                      {/* Silhouette / Life Reconstruction Visual Window */}
                      <div className="my-3 h-28 rounded-lg bg-gradient-to-b from-[#0B1222] to-[#070B16] border border-white/[0.04] flex items-center justify-center p-2 relative overflow-hidden">
                        {specimen.silhouetteUrl ? (
                          <img
                            src={specimen.silhouetteUrl}
                            alt={`${specimen.name} calibrated lateral silhouette`}
                            className="w-full h-full object-contain filter invert contrast-125 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                            loading="lazy"
                          />
                        ) : specimen.reconstructionImageUrl ? (
                          <img
                            src={specimen.reconstructionImageUrl}
                            alt={`${specimen.name} life restoration`}
                            className="w-full h-full object-cover rounded filter brightness-90 group-hover:brightness-105 transition-all duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-center font-mono text-[10px] text-slate-500">
                            Lateral Profile Calibrating
                          </div>
                        )}
                      </div>

                      {/* Metrics Footer */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/[0.04]">
                        <span className="truncate max-w-[140px] text-slate-300">
                          {specimen.timePeriod}
                        </span>
                        {specimen.lengthM && (
                          <span className="text-amber-400 font-bold shrink-0">
                            {specimen.lengthM}m long
                          </span>
                        )}
                        <span className="flex items-center gap-0.5 text-slate-500 group-hover:text-amber-400 transition-colors">
                          <span>Dossier</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 font-mono text-xs">
              Select an evolutionary branch to inspect its cataloged specimens.
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
