import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight, MapPin, Sparkles, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaleoEraConfig {
  id: string;
  name: string;
  mya: number;
  label: string;
  supercontinent: string;
  ocean: string;
  tectonicSummary: string;
  paleoFeatures: string[];
  // SVG landmass positions: array of polygons / paths representing continental landmasses at this epoch
  landmasses: Array<{
    name: string;
    path: string;
    paleoLat: string;
    driftVector?: string;
  }>;
  notableFormations: Array<{
    name: string;
    modernLocation: string;
    paleoSetting: string;
    x: number; // percentage on SVG (0-100)
    y: number; // percentage on SVG (0-100)
    species: string[];
  }>;
}

const PALEO_ERAS: PaleoEraConfig[] = [
  {
    id: 'triassic',
    name: 'Late Triassic',
    mya: 220,
    label: '220 MYA',
    supercontinent: 'Pangaea (Supercontinent)',
    ocean: 'Panthalassa & Paleo-Tethys',
    tectonicSummary: 'All continental crust is united into a singular giant C-shaped landmass centered on the equator, surrounded by the global Panthalassa ocean.',
    paleoFeatures: [
      'Singular uninterrupted supercontinent Pangaea',
      'No polar ice caps; arid continental interior with monsoon belts',
      'Early rifting beginning between North America and Northwest Africa'
    ],
    landmasses: [
      {
        name: 'Pangaea Main Body',
        path: 'M 320 120 C 380 90, 520 80, 600 120 C 650 150, 680 230, 640 310 C 610 370, 560 420, 480 430 C 400 440, 340 380, 310 320 C 290 270, 270 210, 300 150 Z',
        paleoLat: 'Equatorial to 70°S / 60°N',
        driftVector: 'Beginning initial crustal thinning'
      },
      {
        name: 'Siberian Platform',
        path: 'M 540 70 C 580 50, 660 60, 680 90 C 670 120, 620 130, 560 110 Z',
        paleoLat: '60°N - 75°N'
      }
    ],
    notableFormations: [
      {
        name: 'Chinle Formation',
        modernLocation: 'Southwest USA',
        paleoSetting: 'Subtropical river basin near western Pangaean margin',
        x: 36,
        y: 35,
        species: ['Coelophysis', 'Postosuchus', 'Placerias']
      },
      {
        name: 'Ischigualasto Formation',
        modernLocation: 'Argentina',
        paleoSetting: 'Southern Pangaean rift valley floodplain',
        x: 42,
        y: 65,
        species: ['Herrerasaurus', 'Eoraptor', 'Saurosuchus']
      },
      {
        name: 'Maleri & Denwa Formations',
        modernLocation: 'Central India',
        paleoSetting: 'Inland Gondwanan rift basin near Antarctica',
        x: 58,
        y: 72,
        species: ['Shringasaurus', 'Hyperodapedon']
      }
    ]
  },
  {
    id: 'jurassic',
    name: 'Late Jurassic',
    mya: 150,
    label: '150 MYA',
    supercontinent: 'Laurasia & Gondwana (Pangaea Breakup)',
    ocean: 'Central Atlantic & Tethys Seaway',
    tectonicSummary: 'Pangaea splits into two giant supercontinents: Laurasia in the North and Gondwana in the South, separated by the expanding Tethys Ocean and narrow proto-Atlantic seaway.',
    paleoFeatures: [
      'Opening of the young Central Atlantic Ocean',
      'Extensive epicontinental shallow warm shelf seas',
      'Warm, greenhouse climate supporting colossal sauropods across continents'
    ],
    landmasses: [
      {
        name: 'Laurasia (North America & Eurasia)',
        path: 'M 220 120 C 310 90, 480 80, 580 110 C 620 150, 590 210, 510 220 C 420 220, 360 210, 270 200 C 210 180, 190 150, 220 120 Z',
        paleoLat: '10°N - 60°N',
        driftVector: 'Drifting North / West'
      },
      {
        name: 'Gondwana (South America, Africa, Indo-Madagascar)',
        path: 'M 320 260 C 440 240, 560 250, 600 300 C 620 370, 570 440, 480 440 C 380 430, 330 380, 300 330 C 290 290, 300 270, 320 260 Z',
        paleoLat: 'Equator to South Pole',
        driftVector: 'Beginning initial southern rifting'
      }
    ],
    notableFormations: [
      {
        name: 'Morrison Formation',
        modernLocation: 'Western USA',
        paleoSetting: 'Semi-arid alluvial plain flanked by nascent mountains',
        x: 28,
        y: 32,
        species: ['Allosaurus', 'Stegosaurus', 'Brachiosaurus', 'Apatosaurus']
      },
      {
        name: 'Solnhofen Limestone',
        modernLocation: 'Bavaria, Germany',
        paleoSetting: 'Calm, hypersaline tropical archipelago lagoons',
        x: 48,
        y: 28,
        species: ['Archaeopteryx', 'Compsognathus', 'Rhamphorhynchus']
      },
      {
        name: 'Tendaguru Formation',
        modernLocation: 'Tanzania, East Africa',
        paleoSetting: 'Coastal tidal flats and lagoons on western Indian Ocean margin',
        x: 52,
        y: 58,
        species: ['Giraffatitan', 'Kentrosaurus', 'Dicraeosaurus']
      },
      {
        name: 'Kota Formation',
        modernLocation: 'Pranhita-Godavari Basin, India',
        paleoSetting: 'Inland river valley on Gondwanan plate',
        x: 61,
        y: 64,
        species: ['Barapasaurus', 'Kotasaurus']
      }
    ]
  },
  {
    id: 'cretaceous',
    name: 'Late Cretaceous',
    mya: 70,
    label: '70 MYA',
    supercontinent: 'Fragmented Continents & Island Arcs',
    ocean: 'Western Interior Seaway & Neo-Tethys',
    tectonicSummary: 'South America and Africa have fully split with an opening South Atlantic. North America is bisected by the shallow Western Interior Seaway. India is an isolated island continent racing northward toward Asia.',
    paleoFeatures: [
      'Western Interior Seaway bisects North America into Laramidia & Appalachia',
      'India is an isolated rafting island continent with unique endemic abelisaurs',
      'Europe exists as a warm, subtropical island archipelago (Hateg Island)'
    ],
    landmasses: [
      {
        name: 'Laramidia (Western North America)',
        path: 'M 180 110 C 230 100, 260 120, 250 180 C 240 240, 220 280, 180 260 C 160 220, 150 160, 180 110 Z',
        paleoLat: '25°N - 70°N'
      },
      {
        name: 'Appalachia (Eastern North America)',
        path: 'M 290 130 C 330 120, 360 140, 350 210 C 330 250, 300 240, 280 190 Z',
        paleoLat: '25°N - 50°N'
      },
      {
        name: 'South America',
        path: 'M 270 290 C 330 280, 360 320, 340 410 C 310 440, 280 430, 260 360 Z',
        paleoLat: '10°S - 55°S',
        driftVector: 'Westward drift'
      },
      {
        name: 'Africa',
        path: 'M 420 220 C 490 210, 520 260, 510 360 C 470 410, 420 390, 400 300 Z',
        paleoLat: '30°N - 35°S'
      },
      {
        name: 'Island Continent India',
        path: 'M 590 320 C 620 310, 640 330, 630 360 C 610 380, 585 365, 590 320 Z',
        paleoLat: '25°S - 15°S (Rafting North)',
        driftVector: 'Fast northward drift (18-20 cm/year)'
      },
      {
        name: 'Eurasia',
        path: 'M 520 100 C 660 80, 750 110, 720 180 C 650 200, 560 180, 520 140 Z',
        paleoLat: '30°N - 75°N'
      }
    ],
    notableFormations: [
      {
        name: 'Hell Creek Formation',
        modernLocation: 'Montana & Dakotas, USA',
        paleoSetting: 'Humid coastal delta plain bordering the Western Interior Seaway',
        x: 23,
        y: 28,
        species: ['Tyrannosaurus rex', 'Triceratops', 'Ankylosaurus', 'Edmontosaurus']
      },
      {
        name: 'Lameta Formation',
        modernLocation: 'Jabalpur / Narmada, India',
        paleoSetting: 'Subtropical inland lakes and floodplains on rafting island India',
        x: 61,
        y: 68,
        species: ['Rajasaurus', 'Isisaurus', 'Jainosaurus', 'Indosuchus']
      },
      {
        name: 'Yixian Formation',
        modernLocation: 'Liaoning, China',
        paleoSetting: 'Volcanic temperate forests & caldera lake beds',
        x: 72,
        y: 24,
        species: ['Yutyrannus', 'Microraptor', 'Sinornithosaurus', 'Dilong']
      },
      {
        name: 'Djadochta & Nemegt',
        modernLocation: 'Gobi Desert, Mongolia',
        paleoSetting: 'Semi-arid dune fields and riparian river oasis channels',
        x: 67,
        y: 28,
        species: ['Velociraptor', 'Protoceratops', 'Therizinosaurus', 'Deinocheirus']
      }
    ]
  },
  {
    id: 'pleistocene',
    name: 'Pleistocene (Ice Age)',
    mya: 0.1,
    label: '100,000 YA',
    supercontinent: 'Modern Continents & Glacial Land Bridges',
    ocean: 'Atlantic, Pacific & Indian Oceans (Sea level -120m)',
    tectonicSummary: 'Continents are essentially in modern positions, but massive continental ice sheets lock up oceanic water, lowering sea levels by over 120 meters and creating giant land bridges.',
    paleoFeatures: [
      'Beringia land bridge connects Siberia with Alaska',
      'Sundaland exposed in Southeast Asia; Doggerland in the North Sea',
      'Mammoth steppe biome extends across northern hemisphere'
    ],
    landmasses: [
      {
        name: 'North America & Glaciers',
        path: 'M 160 110 C 260 80, 360 100, 340 220 C 310 260, 240 250, 190 200 Z',
        paleoLat: 'Modern Latitude'
      },
      {
        name: 'South America',
        path: 'M 270 280 C 330 270, 360 330, 330 430 C 290 440, 260 370, 270 280 Z',
        paleoLat: 'Modern Latitude'
      },
      {
        name: 'Eurasia & Beringia',
        path: 'M 440 90 C 620 70, 780 90, 750 200 C 650 240, 520 220, 450 160 Z',
        paleoLat: 'Modern Latitude'
      },
      {
        name: 'Africa',
        path: 'M 440 210 C 510 200, 530 270, 500 380 C 450 400, 420 330, 430 240 Z',
        paleoLat: 'Modern Latitude'
      },
      {
        name: 'Australia & Sahul',
        path: 'M 680 320 C 760 310, 780 360, 750 420 C 700 420, 670 370, 680 320 Z',
        paleoLat: 'Modern Latitude'
      }
    ],
    notableFormations: [
      {
        name: 'La Brea Tar Pits',
        modernLocation: 'California, USA',
        paleoSetting: 'Natural asphalt seeps trapping Ice Age megafauna',
        x: 21,
        y: 35,
        species: ['Smilodon fatalis', 'Mammuthus columbi', 'Dire Wolf']
      },
      {
        name: 'Siwalik Hills',
        modernLocation: 'Himalayan Foothills, India',
        paleoSetting: 'Himalayan foreland basin river plain',
        x: 62,
        y: 35,
        species: ['Stegodon', 'Sivatherium', 'Hexaprotodon']
      }
    ]
  }
];

export default function PaleoDriftViewer() {
  const [activeEraIndex, setActiveEraIndex] = useState(2); // Default to Late Cretaceous
  const [selectedFormation, setSelectedFormation] = useState<any | null>(null);

  const currentEra = PALEO_ERAS[activeEraIndex];

  return (
    <div className="space-y-6 font-sans">
      {/* Interactive Geologic Era Scrubber Bar */}
      <div className="museum-plinth rounded-2xl p-5 border border-white/[0.08] space-y-4 font-mono shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Deep-Time Chrono-Drift Slider
            </span>
          </div>
          <span className="text-[11px] text-amber-400 font-bold">
            {currentEra.label} &bull; {currentEra.name}
          </span>
        </div>

        {/* Era Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PALEO_ERAS.map((era, i) => (
            <button
              key={era.id}
              onClick={() => {
                setActiveEraIndex(i);
                setSelectedFormation(null);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeEraIndex === i
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-md'
                  : 'bg-slate-900/70 border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.15]'
              }`}
            >
              <p className="text-[10px] text-slate-500 font-bold uppercase">{era.label}</p>
              <p className="text-xs font-bold text-slate-200 uppercase font-sans mt-0.5 truncate">{era.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Paleogeographic Map Canvas */}
      <div className="museum-plinth rounded-2xl border border-white/[0.08] p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Ocean Background Canvas */}
        <div className="relative w-full aspect-[16/9] min-h-[380px] sm:min-h-[460px] bg-[#070D1B] rounded-xl overflow-hidden border border-white/[0.06]">
          {/* Subtle Lat/Long Grid Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
            {/* Equator */}
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#F59E0B" strokeWidth="1" strokeDasharray="6 3" />
            {/* Tropic lines */}
            <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#38BDF8" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#38BDF8" strokeWidth="0.5" strokeDasharray="2 2" />
            {/* Meridians */}
            <line x1="25%" y1="0" x2="25%" y2="100%" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <line x1="75%" y1="0" x2="75%" y2="100%" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          </svg>

          {/* Continental Landmass Polygons */}
          <svg viewBox="0 0 900 500" className="w-full h-full object-contain">
            <defs>
              <linearGradient id="paleoLandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
              <filter id="landGlow" x="-5%" y="-5%" width="110%" height="110%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(245, 158, 11, 0.12)" />
              </filter>
            </defs>

            {/* Render Tectonic Landmasses */}
            {currentEra.landmasses.map((land, idx) => (
              <g key={land.name + idx} filter="url(#landGlow)">
                <path
                  d={land.path}
                  fill="url(#paleoLandGradient)"
                  stroke="#334155"
                  strokeWidth="1.5"
                  className="transition-all duration-700 ease-out"
                />
                {/* Landmass Label */}
                <text
                  x="0"
                  y="0"
                  fill="rgba(255,255,255,0.35)"
                  fontSize="11"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="uppercase tracking-widest pointer-events-none select-none"
                >
                  <textPath href={`#land-${idx}`} startOffset="50%">
                    {land.name}
                  </textPath>
                </text>
              </g>
            ))}
          </svg>

          {/* Paleogeographic Formation Pins */}
          {currentEra.notableFormations.map((form) => {
            const isSelected = selectedFormation?.name === form.name;
            return (
              <div
                key={form.name}
                style={{ left: `${form.x}%`, top: `${form.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                onClick={() => setSelectedFormation(form)}
              >
                {/* Radar Ping */}
                <span className="absolute -inset-1.5 rounded-full bg-amber-500/30 animate-ping" />
                <div
                  className={`relative px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 scale-110'
                      : 'bg-slate-900/90 text-amber-400 border border-amber-500/40 hover:scale-105 hover:bg-slate-850'
                  }`}
                >
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="hidden sm:inline truncate max-w-[120px]">{form.name}</span>
                </div>
              </div>
            );
          })}

          {/* Map Overlay HUD Card */}
          <div className="absolute top-4 left-4 z-10 max-w-sm bg-slate-950/85 backdrop-blur-md p-3.5 rounded-xl border border-white/[0.08] shadow-xl font-mono text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px]">
              <Globe className="h-3.5 w-3.5" />
              <span>{currentEra.supercontinent}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              {currentEra.tectonicSummary}
            </p>
          </div>

          {/* Equator Tag */}
          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-[9px] font-mono text-amber-500/80 font-bold uppercase tracking-widest pointer-events-none">
            0° Paleo-Equator
          </div>
        </div>

        {/* Selected Formation Detail Monograph */}
        <AnimatePresence>
          {selectedFormation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-3 font-mono shadow-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
                    Fossil Formation
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 uppercase font-sans">
                    {selectedFormation.name}
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  Modern: <strong className="text-slate-200">{selectedFormation.modernLocation}</strong>
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                <strong className="text-amber-400 font-mono uppercase text-[10px]">Paleo-Environmental Setting: </strong>
                {selectedFormation.paleoSetting}
              </p>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Contemporaneous Cataloged Fauna:
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedFormation.species.map((sp: string) => (
                    <Link
                      key={sp}
                      to={`/browse?search=${encodeURIComponent(sp)}`}
                      className="px-2.5 py-1 rounded bg-slate-950 border border-white/[0.08] text-xs font-sans text-amber-300 hover:text-white hover:border-amber-500/50 transition-colors flex items-center gap-1"
                    >
                      <span>{sp}</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Geological Features Bullets */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          {currentEra.paleoFeatures.map((feat, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] text-slate-300 flex items-start gap-2"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed font-sans">{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
