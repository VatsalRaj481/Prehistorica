import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import L from 'leaflet';
import { fetchSpecies, Species } from '../services/api.js';
import { Compass, Dna, Info, ArrowRight, MapPin, Loader2 } from 'lucide-react';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';

const ERAS = [
  { name: 'Cambrian', myaStart: 541, myaEnd: 485, range: '541–485 MYA', desc: 'Explosion of marine life forms' },
  { name: 'Devonian', myaStart: 419, myaEnd: 359, range: '419–359 MYA', desc: 'Dominance of placoderm fishes & land walkers' },
  { name: 'Carboniferous', myaStart: 359, myaEnd: 299, range: '359–299 MYA', desc: 'Giant terrestrial arthropods & moss forests' },
  { name: 'Permian', myaStart: 299, myaEnd: 251, range: '299–251 MYA', desc: 'Rise of synapsids & major mass extinction' },
  { name: 'Triassic', myaStart: 251, myaEnd: 201, range: '251–201 MYA', desc: 'Dawn of early dinosaurs & archosaurs' },
  { name: 'Jurassic', myaStart: 201, myaEnd: 145, range: '201–145 MYA', desc: 'Golden age of sauropods & first birds' },
  { name: 'Cretaceous', myaStart: 145, myaEnd: 66, range: '145–66 MYA', desc: 'Apex of theropods, ceratopsians & marine reptiles' },
  { name: 'Eocene', myaStart: 56, myaEnd: 34, range: '56–34 MYA', desc: 'Rise of modern mammal groups & giant birds' },
  { name: 'Neogene', myaStart: 23, myaEnd: 2.6, range: '23–2.6 MYA', desc: 'Era of megalodon, hominids & grasslands' },
  { name: 'Pleistocene', myaStart: 2.6, myaEnd: 0.01, range: '2.6–0.01 MYA', desc: 'Quaternary Ice Age megafauna' }
];

const CONTINENTS = [
  { name: 'North America', coords: [45.0, -100.0] as [number, number], zoom: 3 },
  { name: 'South America', coords: [-15.0, -60.0] as [number, number], zoom: 3 },
  { name: 'Europe', coords: [50.0, 15.0] as [number, number], zoom: 4 },
  { name: 'Asia', coords: [32.0, 95.0] as [number, number], zoom: 3 },
  { name: 'Africa', coords: [0.0, 20.0] as [number, number], zoom: 3 },
  { name: 'Oceania', coords: [-25.0, 135.0] as [number, number], zoom: 4 }
];

const FORMATIONS = [
  { name: 'Hell Creek Formation', continent: 'North America', country: 'United States', coords: [47.0, -106.0] as [number, number], eras: ['Cretaceous'] },
  { name: 'Morrison Formation', continent: 'North America', country: 'United States', coords: [39.0, -105.0] as [number, number], eras: ['Jurassic'] },
  { name: 'Niobrara Formation', continent: 'North America', country: 'United States', coords: [38.5, -99.0] as [number, number], eras: ['Cretaceous'] },
  { name: 'Chinle Formation', continent: 'North America', country: 'United States', coords: [35.0, -109.0] as [number, number], eras: ['Triassic'] },
  { name: 'Dinosaur Park Formation', continent: 'North America', country: 'Canada', coords: [50.7, -111.5] as [number, number], eras: ['Cretaceous'] },
  { name: 'Two Medicine Formation', continent: 'North America', country: 'United States', coords: [48.0, -112.5] as [number, number], eras: ['Cretaceous'] },
  { name: 'Ischigualasto Formation', continent: 'South America', country: 'Argentina', coords: [-30.1, -67.8] as [number, number], eras: ['Triassic'] },
  { name: 'Candeleros Formation', continent: 'South America', country: 'Argentina', coords: [-39.0, -69.0] as [number, number], eras: ['Cretaceous'] },
  { name: 'Romualdo Formation', continent: 'South America', country: 'Brazil', coords: [-7.2, -39.5] as [number, number], eras: ['Cretaceous'] },
  { name: 'Santana Formation', continent: 'South America', country: 'Brazil', coords: [-7.1, -40.0] as [number, number], eras: ['Cretaceous'] },
  { name: 'Solnhofen Limestone', continent: 'Europe', country: 'Germany', coords: [48.9, 11.0] as [number, number], eras: ['Jurassic'] },
  { name: 'Wessex Formation', continent: 'Europe', country: 'United Kingdom', coords: [50.6, -1.5] as [number, number], eras: ['Cretaceous'] },
  { name: 'Oxford Clay Formation', continent: 'Europe', country: 'United Kingdom', coords: [52.5, -0.2] as [number, number], eras: ['Jurassic'] },
  { name: 'Wealden Group', continent: 'Europe', country: 'United Kingdom', coords: [51.0, 0.5] as [number, number], eras: ['Cretaceous'] },
  { name: 'Yixian Formation', continent: 'Asia', country: 'China', coords: [41.5, 120.0] as [number, number], eras: ['Cretaceous'] },
  { name: 'Djadochta Formation', continent: 'Asia', country: 'Mongolia', coords: [44.0, 103.5] as [number, number], eras: ['Cretaceous'] },
  { name: 'Nemegt Formation', continent: 'Asia', country: 'Mongolia', coords: [43.5, 101.0] as [number, number], eras: ['Cretaceous'] },
  { name: 'Shaximiao Formation', continent: 'Asia', country: 'China', coords: [29.4, 104.8] as [number, number], eras: ['Jurassic'] },
  { name: 'Lufeng Formation', continent: 'Asia', country: 'China', coords: [25.1, 102.1] as [number, number], eras: ['Triassic', 'Jurassic'] },
  { name: 'Lameta Formation', continent: 'Asia', country: 'India', coords: [22.0, 79.0] as [number, number], eras: ['Cretaceous'] },
  { name: 'Kota Formation', continent: 'Asia', country: 'India', coords: [18.8, 79.8] as [number, number], eras: ['Jurassic'] },
  { name: 'Siwalik Hills', continent: 'Asia', country: 'India', coords: [30.8, 77.0] as [number, number], eras: ['Neogene', 'Pleistocene'] },
  { name: 'Maleri Formation', continent: 'Asia', country: 'India', coords: [19.0, 79.5] as [number, number], eras: ['Triassic'] },
  { name: 'Bahariya Formation', continent: 'Africa', country: 'Egypt', coords: [28.3, 28.9] as [number, number], eras: ['Cretaceous'] },
  { name: 'Tendaguru Formation', continent: 'Africa', country: 'Tanzania', coords: [-9.7, 39.3] as [number, number], eras: ['Jurassic'] },
  { name: 'Elliot Formation', continent: 'Africa', country: 'South Africa', coords: [-30.5, 27.5] as [number, number], eras: ['Triassic', 'Jurassic'] },
  { name: 'Kem Kem Beds', continent: 'Africa', country: 'Morocco', coords: [31.2, -4.0] as [number, number], eras: ['Cretaceous'] },
  { name: 'Karoo Basin', continent: 'Africa', country: 'South Africa', coords: [-32.0, 25.0] as [number, number], eras: ['Permian', 'Triassic'] },
  { name: 'Winton Formation', continent: 'Oceania', country: 'Australia', coords: [-22.4, 143.0] as [number, number], eras: ['Cretaceous'] },
  { name: 'Lightning Ridge', continent: 'Oceania', country: 'Australia', coords: [-29.4, 147.9] as [number, number], eras: ['Cretaceous'] }
];

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.0 });
  }, [center, zoom, map]);
  return null;
}

const getEraColor = (eraName: string) => {
  if (['Cambrian', 'Devonian', 'Carboniferous', 'Permian'].includes(eraName)) {
    return '#3B82F6';
  }
  if (eraName === 'Triassic') return '#D97706';
  if (eraName === 'Jurassic') return '#10B981';
  if (eraName === 'Cretaceous') return '#EF4444';
  if (['Eocene', 'Neogene', 'Pleistocene'].includes(eraName)) {
    return '#EAB308';
  }
  return '#D97706';
};

const createMapMarkerIcon = (name: string, isSelected: boolean, eraColor: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="--era-color: ${eraColor};" class="flex items-center gap-1.5 px-3 py-1.5 rounded-none border shadow-2xl font-mono font-bold text-xs transition-all duration-200 uppercase tracking-widest whitespace-nowrap min-w-[80px] justify-center ${
        isSelected
          ? 'bg-slate-950 text-amber-400 border-amber-500 scale-110 shadow-[0_0_20px_var(--era-color)] z-50'
          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-500/50 hover:text-white'
      }">
        <span class="w-2 h-2 rounded-none" style="background-color: ${eraColor};"></span>
        <span>${name}</span>
      </div>
    `,
    iconSize: [120, 36],
    iconAnchor: [60, 18]
  });
};

export default function TimeMap() {
  const [selectedEraIndex, setSelectedEraIndex] = useState(4);
  const [selectedLocation, setSelectedLocation] = useState('North America');
  const [selectedFormation, setSelectedFormation] = useState<string | null>(null);

  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldReduceMotion = useReducedMotion();

  const currentEra = ERAS[selectedEraIndex];
  const eraColor = getEraColor(currentEra.name);

  const activeContinentObj = CONTINENTS.find(c => c.name === selectedLocation) || CONTINENTS[0];

  const formationsInContinent = FORMATIONS.filter(
    f => f.continent === selectedLocation && f.eras.includes(currentEra.name)
  );

  useEffect(() => {
    document.title = `Time-Map Pavilion (${currentEra.name} - ${selectedLocation}) | Prehistorica`;
  }, [currentEra, selectedLocation]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchSpecies({
      time_period: selectedFormation ? undefined : currentEra.name,
      location: selectedFormation ? undefined : selectedLocation,
      fossil_formation: selectedFormation || undefined,
      limit: 100
    })
      .then((res) => {
        const fetchedData = 'data' in res ? res.data : res;

        if (selectedFormation) {
          const cleanForm = selectedFormation.toLowerCase().replace(/\s+(formation|beds|limestone|group|basin|shale)$/i, '').trim();
          const filtered = fetchedData.filter(s => {
            const formStr = (s.fossilFormation || s.geographicRange?.fossilFormation || '').toLowerCase();
            return formStr.includes(cleanForm) || JSON.stringify(s).toLowerCase().includes(cleanForm);
          });
          setSpeciesList(filtered.length > 0 ? filtered : fetchedData);
        } else {
          setSpeciesList(fetchedData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch fossil discoveries for this era and region.');
        setLoading(false);
      });
  }, [selectedEraIndex, selectedLocation, selectedFormation]);

  const handleEraChange = (newIndex: number) => {
    setSelectedEraIndex(newIndex);
    setSelectedFormation(null);
  };

  const handleLocationChange = (locName: string) => {
    setSelectedLocation(locName);
    setSelectedFormation(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5"
      >
        <div>
          <h1 className="text-4xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Compass className="h-7 w-7 text-amber-500" /> Geologic Excavation Time-Map
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Navigate Earth's ancient paleocontinents and unearth location-verified fossil formations.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 font-bold uppercase tracking-widest shadow-md">
            Era: <strong style={{ color: eraColor }}>{currentEra.name}</strong> ({currentEra.range})
          </span>
        </div>
      </motion.div>

      {/* Geologic Era Timeline Scrubber */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl space-y-4 font-mono"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Geologic Era Scrubber</span>
            <h2 className="text-xl font-black text-slate-100 uppercase tracking-wide font-sans">
              {currentEra.name} Period
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
              {currentEra.range}
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline">&bull; {currentEra.desc}</span>
          </div>
        </div>

        {/* Range Slider & Quick Era Pills */}
        <div className="space-y-4 pt-2">
          <input
            type="range"
            min={0}
            max={ERAS.length - 1}
            value={selectedEraIndex}
            onChange={(e) => handleEraChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer border border-white/10"
          />

          <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
            {ERAS.map((era, idx) => {
              const isSelected = idx === selectedEraIndex;
              const badgeColor = getEraColor(era.name);
              return (
                <motion.button
                  key={era.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEraChange(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg'
                      : 'bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: isSelected ? '#070A12' : badgeColor }} />
                  <span>{era.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Interactive Map Section */}
        <div className="lg:col-span-7 space-y-4 font-mono">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" /> Continent Focus Viewport
            </h3>

            {/* Continent Selector Pills */}
            <div className="flex flex-wrap gap-1.5">
              {CONTINENTS.map((c) => (
                <motion.button
                  key={c.name}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleLocationChange(c.name)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    selectedLocation === c.name
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md'
                      : 'bg-slate-900/80 border-white/10 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {c.name}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="relative h-[440px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
            <MapContainer
              center={activeContinentObj.coords}
              zoom={activeContinentObj.zoom}
              scrollWheelZoom={false}
              className="w-full h-full z-10"
              style={{ background: '#070A12' }}
            >
              <ChangeView center={activeContinentObj.coords} zoom={activeContinentObj.zoom} />

              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>, USGS, NOAA'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                maxZoom={16}
              />

              {formationsInContinent.map((f) => {
                const isSelected = selectedFormation === f.name;
                const icon = createMapMarkerIcon(f.name, isSelected, eraColor);

                return (
                  <Marker
                    key={f.name}
                    position={f.coords}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        setSelectedFormation(isSelected ? null : f.name);
                      }
                    }}
                  />
                );
              })}
            </MapContainer>

            <div className="absolute top-4 left-4 z-20 bg-slate-950/90 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 shadow-xl pointer-events-none uppercase tracking-wider">
              Region: <span className="text-amber-400">{selectedLocation}</span>
              {selectedFormation && (
                <span className="ml-1.5 text-emerald-400">&bull; {selectedFormation}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Fossil Discoveries Column */}
        <div className="lg:col-span-5 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <Dna className="h-4 w-4 text-amber-400" />
              <span>Fossil Discoveries ({speciesList.length})</span>
            </h3>
            {selectedFormation && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setSelectedFormation(null)}
                className="text-amber-400 hover:underline font-bold uppercase tracking-wider text-[10px] cursor-pointer"
              >
                Clear Formation
              </motion.button>
            )}
          </div>

          {loading ? (
            <div className="h-96 glass-panel rounded-2xl border border-white/10 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Unearthing records...</span>
            </div>
          ) : error ? (
            <div className="glass-panel rounded-2xl border border-red-500/30 p-6 text-center text-red-400 text-xs">
              {error}
            </div>
          ) : speciesList.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-white/10 p-10 text-center text-slate-400 flex flex-col items-center gap-2 shadow-xl">
              <Info className="h-8 w-8 text-amber-400" />
              <p className="font-bold text-sm text-slate-200 uppercase tracking-widest font-sans">No Species Records</p>
              <p className="text-xs text-slate-400 max-w-xs font-sans">
                No catalog specimens found for {currentEra.name} in {selectedLocation}
                {selectedFormation ? ` (${selectedFormation})` : ''}.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {speciesList.map((species) => {
                const names = getSpeciesDisplayNames(species);
                return (
                  <motion.div
                    key={species.id}
                    whileHover={shouldReduceMotion ? {} : { x: 3, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to={`/species/${species.id}`}
                      className="group glass-panel rounded-xl border border-white/10 p-3.5 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3 shadow-md overflow-hidden"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 bg-slate-900/80 rounded-lg border border-white/10 shrink-0 flex items-center justify-center p-1 overflow-hidden">
                          {species.reconstructionImageUrl ? (
                            <img
                              src={species.reconstructionImageUrl}
                              alt={species.name}
                              className="w-full h-full object-contain drop-shadow"
                            />
                          ) : (
                            <Dna className="h-5 w-5 text-slate-700" />
                          )}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-sm font-black uppercase text-slate-100 group-hover:text-amber-400 transition-colors truncate tracking-tight font-sans">
                            {names.heading}
                          </h4>
                          <p className="text-xs italic font-serif text-amber-400 truncate">
                            {names.subheading}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="font-bold text-amber-400">{species.clade}</span>
                            <span>&bull;</span>
                            <span className="truncate">{species.fossilFormation || 'Formation Unspecified'}</span>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
