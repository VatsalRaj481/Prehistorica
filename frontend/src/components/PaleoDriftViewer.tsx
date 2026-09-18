import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight, MapPin, Sparkles, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotableFormation {
  name: string;
  modernLocation: string;
  paleoSetting: string;
  x: number; // percentage on Mollweide 2:1 projection (0-100)
  y: number; // percentage on Mollweide 2:1 projection (0-100)
  species: string[];
}

interface PaleoEraConfig {
  id: string;
  name: string;
  mya: number;
  label: string;
  supercontinent: string;
  ocean: string;
  tectonicSummary: string;
  mapImageUrl: string;
  mapAttribution: string;
  paleoFeatures: string[];
  notableFormations: NotableFormation[];
}

const PALEO_ERAS: PaleoEraConfig[] = [
  {
    id: 'triassic',
    name: 'Late Triassic (Norian Age)',
    mya: 220,
    label: '220 MYA',
    supercontinent: 'Pangaea (Singular Supercontinent)',
    ocean: 'Global Panthalassa & Paleo-Tethys Gulf',
    tectonicSummary: 'All continental crust is united into a singular giant C-shaped landmass centered on the equator. An arid continental interior spans thousands of kilometers with fierce seasonal monsoons, while early rifting begins between proto-North America and Northwest Africa.',
    mapImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Mollweide_Paleographic_Map_of_Earth%2C_220_Ma_%28Norian_Age%29.png/1280px-Mollweide_Paleographic_Map_of_Earth%2C_220_Ma_%28Norian_Age%29.png',
    mapAttribution: 'C. R. Scotese / PALEOMAP Project (CC BY 4.0)',
    paleoFeatures: [
      'Singular uninterrupted supercontinent Pangaea centered on the equator',
      'No polar ice sheets; extreme continental interior aridity and megamonsoons',
      'Nascent rift valleys forming the Central Atlantic Magmatic Province'
    ],
    notableFormations: [
      {
        name: 'Chinle Formation',
        modernLocation: 'Southwest USA (Arizona / Utah / New Mexico)',
        paleoSetting: 'Subtropical river basin near the western equatorial margin of Pangaea (~15°N)',
        x: 34,
        y: 41,
        species: ['Coelophysis', 'Postosuchus', 'Placerias']
      },
      {
        name: 'Ischigualasto Formation',
        modernLocation: 'San Juan Province, Northwest Argentina',
        paleoSetting: 'Southern Pangaean rift valley floodplain with active volcanic ashfalls (~45°S)',
        x: 42,
        y: 68,
        species: ['Herrerasaurus', 'Eoraptor', 'Saurosuchus']
      },
      {
        name: 'Maleri & Denwa Formations',
        modernLocation: 'Pranhita-Godavari Basin, Central India',
        paleoSetting: 'Inland Gondwanan rift river basin connected to Antarctica and Madagascar (~40°S)',
        x: 65,
        y: 69,
        species: ['Shringasaurus', 'Hyperodapedon']
      },
      {
        name: 'Lossiemouth Sandstone',
        modernLocation: 'Moray, Scotland (European Pangaea)',
        paleoSetting: 'Arid sand dune fields and coastal braided river channels (~25°N)',
        x: 48,
        y: 35,
        species: ['Stagonolepis', 'Saltopus', 'Ornithosuchus']
      }
    ]
  },
  {
    id: 'jurassic',
    name: 'Late Jurassic (Oxfordian / Kimmeridgian)',
    mya: 155,
    label: '155 MYA',
    supercontinent: 'Laurasia & Gondwana (Pangaea Breakup)',
    ocean: 'Proto-Central Atlantic & Tethys Seaway',
    tectonicSummary: 'Pangaea has split into two giant continental masses: Laurasia in the North and Gondwana in the South, separated by the widening Central Atlantic and the deep equatorial Tethys Seaway. Warm greenhouse seas cover vast continental shelves.',
    mapImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Mollweide_Paleographic_Map_of_Earth%2C_155_Ma_%28Oxfordian_Age%29.png/1280px-Mollweide_Paleographic_Map_of_Earth%2C_155_Ma_%28Oxfordian_Age%29.png',
    mapAttribution: 'C. R. Scotese / PALEOMAP Project (CC BY 4.0)',
    paleoFeatures: [
      'Opening of the Central Atlantic Ocean separating North America from Africa',
      'Vast epicontinental shallow warm shelf seas across Europe',
      'Warm, stable greenhouse climate supporting colossal sauropods across all landmasses'
    ],
    notableFormations: [
      {
        name: 'Morrison Formation',
        modernLocation: 'Western United States (Colorado / Wyoming / Utah)',
        paleoSetting: 'Semi-arid alluvial plain and savannah flanked by young western mountains (~35°N)',
        x: 29,
        y: 36,
        species: ['Allosaurus', 'Stegosaurus', 'Brachiosaurus', 'Apatosaurus']
      },
      {
        name: 'Solnhofen Archipelago',
        modernLocation: 'Bavaria, Germany',
        paleoSetting: 'Hypersaline stagnant tropical lagoon archipelago on European shelf (~30°N)',
        x: 49,
        y: 33,
        species: ['Archaeopteryx', 'Compsognathus', 'Rhamphorhynchus']
      },
      {
        name: 'Tendaguru Formation',
        modernLocation: 'Lindi Region, Southern Tanzania',
        paleoSetting: 'Coastal tidal lagoons and estuarine flats on East African Gondwana (~25°S)',
        x: 55,
        y: 62,
        species: ['Giraffatitan', 'Kentrosaurus', 'Dicraeosaurus']
      },
      {
        name: 'Kota Formation',
        modernLocation: 'Telangana / Maharashtra, India',
        paleoSetting: 'Foreland river basin on interior Gondwanan block (~40°S)',
        x: 68,
        y: 69,
        species: ['Barapasaurus', 'Kotasaurus']
      },
      {
        name: 'Shaximiao Formation',
        modernLocation: 'Sichuan Basin, Southwest China',
        paleoSetting: 'Subtropical lush river valley and inland lacustrine basin (~32°N)',
        x: 77,
        y: 34,
        species: ['Tuojiangosaurus', 'Mamenchisaurus', 'Yangchuanosaurus']
      }
    ]
  },
  {
    id: 'cretaceous',
    name: 'Late Cretaceous (Santonian Age)',
    mya: 85,
    label: '85 MYA',
    supercontinent: 'Fragmented Continents & Island Arcs',
    ocean: 'Western Interior Seaway & South Atlantic',
    tectonicSummary: 'South America and Africa are completely severed by an expanding South Atlantic. North America is bisected by the shallow Western Interior Seaway, creating Laramidia and Appalachia. Island continent India has detached from Madagascar and is racing northward across the Indian Ocean.',
    mapImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Mollweide_Paleographic_Map_of_Earth%2C_85_Ma_%28Santonian_Age%29.png/1280px-Mollweide_Paleographic_Map_of_Earth%2C_85_Ma_%28Santonian_Age%29.png',
    mapAttribution: 'C. R. Scotese / PALEOMAP Project (CC BY 4.0)',
    paleoFeatures: [
      'Western Interior Seaway bisects North America into Laramidia & Appalachia',
      'India is an isolated rafting island continent drifting at up to 18-20 cm/year',
      'Europe exists as an archipelago of warm subtropical islands with insular dwarfism'
    ],
    notableFormations: [
      {
        name: 'Hell Creek & Judith River',
        modernLocation: 'Montana & Dakotas, USA (Laramidia)',
        paleoSetting: 'Humid subtropical coastal plain and delta system on the Western Interior Seaway (~48°N)',
        x: 26,
        y: 28,
        species: ['Tyrannosaurus rex', 'Triceratops', 'Ankylosaurus', 'Edmontosaurus']
      },
      {
        name: 'Lameta Formation',
        modernLocation: 'Jabalpur / Narmada Valley, Central India',
        paleoSetting: 'Subtropical inland lakes and floodplains on isolated rafting island India (~25°S)',
        x: 67,
        y: 64,
        species: ['Rajasaurus', 'Isisaurus', 'Jainosaurus', 'Indosuchus']
      },
      {
        name: 'Yixian & Jiufotang Formations',
        modernLocation: 'Liaoning, Northeast China',
        paleoSetting: 'Temperate montane lake basins with periodic explosive pyroclastic ashfalls (~42°N)',
        x: 76,
        y: 30,
        species: ['Yutyrannus', 'Microraptor', 'Sinornithosaurus', 'Dilong']
      },
      {
        name: 'Djadochta & Nemegt',
        modernLocation: 'Ömnögovi Province, Gobi Desert, Mongolia',
        paleoSetting: 'Semi-arid sand dune fields and lush riparian river channels (~44°N)',
        x: 72,
        y: 28,
        species: ['Velociraptor', 'Protoceratops', 'Therizinosaurus', 'Deinocheirus']
      },
      {
        name: 'Candeleros & Huincul',
        modernLocation: 'Neuquén Province, Patagonia, Argentina',
        paleoSetting: 'Braided river floodplains on isolated South American continent (~42°S)',
        x: 35,
        y: 69,
        species: ['Giganotosaurus', 'Argentinosaurus', 'Mapusaurus']
      },
      {
        name: 'Kem Kem Beds & Bahariya',
        modernLocation: 'Morocco & Egypt (North African Margin)',
        paleoSetting: 'Immense mangrove delta and tidal channels on southern Tethys margin (~15°N)',
        x: 48,
        y: 44,
        species: ['Spinosaurus', 'Carcharodontosaurus', 'Ouranosaurus']
      }
    ]
  },
  {
    id: 'pleistocene',
    name: 'Late Pleistocene (Last Glacial Maximum)',
    mya: 0.02,
    label: '21,000 YA',
    supercontinent: 'Glacial Ice Sheets & Exposed Land Bridges',
    ocean: 'Modern Oceans (Sea Level -120m below present)',
    tectonicSummary: 'Continents occupy their modern positions, but colossal continental ice sheets (Laurentide, Fennoscandian) lock up oceanic water, lowering global sea levels by ~120 meters. Giant subaerial land bridges connect continents across Beringia, Doggerland, and Sundaland.',
    mapImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Mollweide_Paleographic_Map_of_Earth%2C_21_Ka_%28Late_Pleistocene_Age%29.png/1280px-Mollweide_Paleographic_Map_of_Earth%2C_21_Ka_%28Late_Pleistocene_Age%29.png',
    mapAttribution: 'C. R. Scotese / PALEOMAP Project (CC BY 4.0)',
    paleoFeatures: [
      'Beringia land bridge forms a vast subaerial corridor connecting Siberia with Alaska',
      'Massive continental ice sheets cap North America (Laurentide) and Northern Europe',
      'Hyper-arid mammoth steppe biome stretches continuously across Northern Eurasia and America'
    ],
    notableFormations: [
      {
        name: 'La Brea Tar Pits',
        modernLocation: 'Los Angeles, California, USA',
        paleoSetting: 'Natural asphalt seeps trapping late Pleistocene carnivores and megafauna (~34°N)',
        x: 21,
        y: 37,
        species: ['Smilodon fatalis', 'Mammuthus columbi', 'Canis dirus']
      },
      {
        name: 'Yana River & Wrangel Island',
        modernLocation: 'Arctic Siberia / Beringia Corridor',
        paleoSetting: 'Sub-polar permafrost mammoth steppe with dwarf relict populations (~71°N)',
        x: 82,
        y: 16,
        species: ['Mammuthus primigenius', 'Coelodonta antiquitatis']
      },
      {
        name: 'Creswell Crags & Lascaux',
        modernLocation: 'Western Europe (UK / France / Spain)',
        paleoSetting: 'Periglacial limestone karst caves and tundra borderlands (~48°N)',
        x: 47,
        y: 27,
        species: ['Ursus spelaeus', 'Panthera spelaea', 'Megaloceros']
      },
      {
        name: 'Siwalik Hills',
        modernLocation: 'Himalayan Foothills, India',
        paleoSetting: 'Himalayan foreland alluvial plains and river valley corridors (~30°N)',
        x: 67,
        y: 38,
        species: ['Stegodon', 'Sivatherium', 'Hexaprotodon']
      },
      {
        name: 'Naracoorte Caves',
        modernLocation: 'Limestone Coast, South Australia',
        paleoSetting: 'Karst pitfall caves in temperate woodland-savannah (~37°S)',
        x: 85,
        y: 74,
        species: ['Thylacoleo carnifex', 'Diprotodon optatum', 'Procoptodon']
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
        {/* Ocean Background Canvas (Mollweide 2:1 Proportional Frame) */}
        <div className="relative w-full aspect-[2/1] bg-[#050A15] rounded-xl overflow-hidden border border-white/[0.06] shadow-2xl">
          {/* Authentic Scientific Mollweide Paleomap Reconstruction */}
          <img
            key={currentEra.mapImageUrl}
            src={currentEra.mapImageUrl}
            alt={`${currentEra.name} Paleographic Map of Earth`}
            className="absolute inset-0 w-full h-full object-contain filter contrast-[1.04] brightness-[0.96] transition-opacity duration-700 select-none pointer-events-none"
          />

          {/* Graticule Overlay: Mollweide Horizon Ellipse, 0° Equator, and Central Meridian */}
          <svg
            viewBox="0 0 1000 500"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          >
            {/* Outer Mollweide Elliptical Horizon boundary */}
            <ellipse
              cx="500"
              cy="250"
              rx="498"
              ry="248"
              fill="none"
              stroke="rgba(245, 158, 11, 0.25)"
              strokeWidth="1.2"
            />
            {/* 0° Paleo-Equator Line */}
            <line
              x1="2"
              y1="250"
              x2="998"
              y2="250"
              stroke="rgba(245, 158, 11, 0.5)"
              strokeWidth="1"
              strokeDasharray="6 4"
            />
            {/* Central Meridian Line */}
            <line
              x1="500"
              y1="2"
              x2="500"
              y2="498"
              stroke="rgba(56, 189, 248, 0.3)"
              strokeWidth="0.8"
              strokeDasharray="4 4"
            />
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
                {/* Radar Ping Pulse */}
                <span className="absolute -inset-1.5 rounded-full bg-amber-500/40 animate-ping" />
                <div
                  className={`relative px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 scale-110 ring-2 ring-amber-300'
                      : 'bg-slate-950/90 text-amber-400 border border-amber-500/60 hover:scale-105 hover:bg-slate-900'
                  }`}
                >
                  <MapPin className="h-3 w-3 shrink-0 text-amber-400 group-hover:animate-bounce" />
                  <span className="hidden sm:inline truncate max-w-[130px]">{form.name}</span>
                </div>
              </div>
            );
          })}

          {/* Map Overlay HUD Card */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 max-w-[190px] sm:max-w-sm bg-slate-950/90 backdrop-blur-md p-2 sm:p-3.5 rounded-xl border border-white/[0.08] shadow-2xl font-mono text-xs space-y-1 sm:space-y-1.5 pointer-events-none">
            <div className="flex items-center gap-1.5 sm:gap-2 text-amber-400 font-bold uppercase text-[10px] sm:text-[11px]">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{currentEra.supercontinent}</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-300 leading-tight sm:leading-relaxed font-sans line-clamp-2 sm:line-clamp-none">
              {currentEra.tectonicSummary}
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[8px] sm:text-[9px] text-slate-400 border-t border-white/[0.06]">
              <span className="text-sky-400 font-bold">Ocean:</span>
              <span className="truncate">{currentEra.ocean}</span>
            </div>
          </div>

          {/* Scientific Attribution Pill */}
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/[0.08] text-[9px] font-mono text-slate-400">
            Reconstruction: <span className="text-amber-400 font-bold">{currentEra.mapAttribution}</span>
          </div>

          {/* Equator Tag */}
          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-[9px] font-mono text-amber-500/80 font-bold uppercase tracking-widest pointer-events-none hidden sm:block">
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
