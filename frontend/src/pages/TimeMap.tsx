import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { fetchSpecies, Species } from '../services/api.js';
import { Compass, Dna, Info, ArrowRight, MapPin, Loader2 } from 'lucide-react';

// Geologic Eras config
const ERAS = [
  { name: 'Cambrian', range: '541–485 MYA', desc: 'Explosion of marine life forms' },
  { name: 'Devonian', range: '419–359 MYA', desc: 'Dominance of placoderm fishes & land walkers' },
  { name: 'Carboniferous', range: '359–299 MYA', desc: 'Giant terrestrial arthropods & moss forests' },
  { name: 'Permian', range: '299–251 MYA', desc: 'Rise of synapsids & major mass extinction' },
  { name: 'Triassic', range: '251–201 MYA', desc: 'Dawn of early dinosaurs & archosaurs' },
  { name: 'Jurassic', range: '201–145 MYA', desc: 'Golden age of sauropods & first birds' },
  { name: 'Cretaceous', range: '145–66 MYA', desc: 'Apex of theropods, ceratopsians & marine reptiles' },
  { name: 'Eocene', range: '56–34 MYA', desc: 'Rise of modern mammal groups & giant birds' },
  { name: 'Neogene', range: '23–2.6 MYA', desc: 'Era of megalodon, hominids & grasslands' },
  { name: 'Pleistocene', range: '2.6–0.01 MYA', desc: 'Quaternary Ice Age megafauna' }
];

// Continent coordinate centers and zoom levels
const CONTINENTS = [
  { name: 'North America', coords: [45.0, -100.0] as [number, number], zoom: 3 },
  { name: 'South America', coords: [-15.0, -60.0] as [number, number], zoom: 3 },
  { name: 'Europe', coords: [50.0, 15.0] as [number, number], zoom: 4 },
  { name: 'Asia', coords: [32.0, 95.0] as [number, number], zoom: 3 },
  { name: 'Africa', coords: [0.0, 20.0] as [number, number], zoom: 3 },
  { name: 'Oceania', coords: [-25.0, 135.0] as [number, number], zoom: 4 }
];

// Fossil Formations config (with global coordinates and casing corresponding to database names)
const FORMATIONS = [
  // North America
  { name: 'Hell Creek Formation', continent: 'North America', country: 'United States', coords: [47.0, -106.0] as [number, number] },
  { name: 'Morrison Formation', continent: 'North America', country: 'United States', coords: [39.0, -105.0] as [number, number] },
  { name: 'Niobrara Formation', continent: 'North America', country: 'United States', coords: [38.5, -99.0] as [number, number] },
  { name: 'Chinle Formation', continent: 'North America', country: 'United States', coords: [35.0, -109.0] as [number, number] },
  { name: 'Dinosaur Park Formation', continent: 'North America', country: 'Canada', coords: [50.7, -111.5] as [number, number] },
  { name: 'Two Medicine Formation', continent: 'North America', country: 'United States', coords: [48.0, -112.5] as [number, number] },
  // South America
  { name: 'Ischigualasto Formation', continent: 'South America', country: 'Argentina', coords: [-30.1, -67.8] as [number, number] },
  { name: 'Candeleros Formation', continent: 'South America', country: 'Argentina', coords: [-39.0, -69.0] as [number, number] },
  { name: 'Romualdo Formation', continent: 'South America', country: 'Brazil', coords: [-7.2, -39.5] as [number, number] },
  { name: 'Santana Formation', continent: 'South America', country: 'Brazil', coords: [-7.1, -40.0] as [number, number] },
  // Europe
  { name: 'Solnhofen Limestone', continent: 'Europe', country: 'Germany', coords: [48.9, 11.0] as [number, number] },
  { name: 'Wessex Formation', continent: 'Europe', country: 'United Kingdom', coords: [50.6, -1.5] as [number, number] },
  { name: 'Oxford Clay Formation', continent: 'Europe', country: 'United Kingdom', coords: [52.5, -0.2] as [number, number] },
  { name: 'Wealden Group', continent: 'Europe', country: 'United Kingdom', coords: [51.0, 0.5] as [number, number] },
  // Asia
  { name: 'Yixian Formation', continent: 'Asia', country: 'China', coords: [41.5, 120.0] as [number, number] },
  { name: 'Djadochta Formation', continent: 'Asia', country: 'Mongolia', coords: [44.0, 103.5] as [number, number] },
  { name: 'Nemegt Formation', continent: 'Asia', country: 'Mongolia', coords: [43.5, 101.0] as [number, number] },
  { name: 'Shaximiao Formation', continent: 'Asia', country: 'China', coords: [29.4, 104.8] as [number, number] },
  { name: 'Lufeng Formation', continent: 'Asia', country: 'China', coords: [25.1, 102.1] as [number, number] },
  { name: 'Lameta Formation', continent: 'Asia', country: 'India', coords: [22.0, 79.0] as [number, number] },
  { name: 'Kota Formation', continent: 'Asia', country: 'India', coords: [18.8, 79.8] as [number, number] },
  { name: 'Siwalik Hills', continent: 'Asia', country: 'India', coords: [30.8, 77.0] as [number, number] },
  // Africa
  { name: 'Bahariya Formation', continent: 'Africa', country: 'Egypt', coords: [28.3, 28.9] as [number, number] },
  { name: 'Tendaguru Formation', continent: 'Africa', country: 'Tanzania', coords: [-9.7, 39.3] as [number, number] },
  { name: 'Elliot Formation', continent: 'Africa', country: 'South Africa', coords: [-30.5, 27.5] as [number, number] },
  { name: 'Kem Kem Beds', continent: 'Africa', country: 'Morocco', coords: [31.2, -4.0] as [number, number] },
  { name: 'Karoo Basin', continent: 'Africa', country: 'South Africa', coords: [-32.0, 25.0] as [number, number] },
  // Oceania
  { name: 'Winton Formation', continent: 'Oceania', country: 'Australia', coords: [-22.4, 143.0] as [number, number] },
  { name: 'Lightning Ridge', continent: 'Oceania', country: 'Australia', coords: [-29.4, 147.9] as [number, number] }
];

// Helper component to handle map center/zoom animations
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.0 });
  }, [center, zoom, map]);
  return null;
}

// Helper function to resolve era-coded colors for map pin hover glow
const getEraColor = (eraName: string) => {
  if (['Cambrian', 'Devonian', 'Carboniferous', 'Permian'].includes(eraName)) {
    return '#4A6FA5'; // Paleozoic
  }
  if (eraName === 'Triassic') return '#B5602E';
  if (eraName === 'Jurassic') return '#3E7A4F';
  if (eraName === 'Cretaceous') return '#8B3A3A';
  if (['Eocene', 'Neogene', 'Pleistocene'].includes(eraName)) {
    return '#B58B2E'; // Cenozoic
  }
  return '#D98E4A'; // Default Accent Primary
};

// Custom Leaflet DivIcon factory for continents
const createMapMarkerIcon = (name: string, isSelected: boolean, eraColor: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="--era-color: ${eraColor};" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-lg font-bold text-xs transition-all duration-200 uppercase tracking-wide whitespace-nowrap min-w-[80px] justify-center hover:shadow-[0_0_15px_var(--era-color)] hover:scale-105 ${
        isSelected
          ? 'bg-blue-600 border-blue-400 text-white ring-4 ring-blue-500/30 scale-105'
          : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
      }">
        <span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white animate-ping' : 'bg-blue-500'}"></span>
        ${name}
      </div>
    `,
    iconSize: [110, 32],
    iconAnchor: [55, 16]
  });
};

// Custom Leaflet DivIcon factory for fossil formations
const createFormationMarkerIcon = (name: string, isSelected: boolean, eraColor: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker-formation',
    html: `
      <div style="--era-color: ${eraColor};" class="flex items-center gap-1 px-2.5 py-1 rounded-lg border shadow-md font-bold text-[10px] transition-all duration-200 whitespace-nowrap justify-center hover:shadow-[0_0_15px_var(--era-color)] hover:scale-105 ${
        isSelected
          ? 'bg-indigo-600 border-indigo-400 text-white ring-4 ring-indigo-500/30 scale-105'
          : 'bg-slate-950/90 border-slate-800 text-indigo-400 hover:bg-slate-900 hover:text-indigo-300'
      }">
        <span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white animate-ping' : 'bg-indigo-500'}"></span>
        ${name}
      </div>
    `,
    iconSize: [140, 26],
    iconAnchor: [70, 13]
  });
};

export default function TimeMap() {
  const [eraIndex, setEraIndex] = useState(6); // Default: Cretaceous
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null); // Start at global map view
  const [selectedFormation, setSelectedFormation] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mapCenter, setMapCenter] = useState<[number, number]>([20.0, 10.0]);
  const [mapZoom, setMapZoom] = useState<number>(2);

  const activeEra = ERAS[eraIndex];
  const activeEraColor = getEraColor(activeEra.name);

  // Adjust center/zoom when selected continent changes
  useEffect(() => {
    if (selectedContinent) {
      const cont = CONTINENTS.find(c => c.name === selectedContinent);
      if (cont) {
        setMapCenter(cont.coords);
        setMapZoom(cont.zoom);
      }
    } else {
      setMapCenter([20.0, 10.0]);
      setMapZoom(2);
    }
  }, [selectedContinent]);

  // Fetch species whenever chosen era, continent, or formation shifts
  useEffect(() => {
    if (!selectedContinent && !selectedFormation) {
      setSpeciesList([]);
      return;
    }

    setLoading(true);
    setError(null);

    const queryParams: any = {
      time_period: activeEra.name
    };

    if (selectedFormation) {
      queryParams.fossil_formation = selectedFormation;
      if (selectedCountry) queryParams.country = selectedCountry;
    } else {
      queryParams.location = selectedContinent;
    }

    fetchSpecies(queryParams)
      .then((data) => {
        setSpeciesList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch geologic location records.');
        setLoading(false);
      });
  }, [selectedContinent, selectedFormation, selectedCountry, eraIndex]);

  // Filter formations belonging to selected continent
  const visibleFormations = selectedContinent
    ? FORMATIONS.filter(f => f.continent === selectedContinent)
    : [];

  return (
    <div className="space-y-6">
      {/* Geologic Era Header and Info */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-855 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
              <Compass className="h-6 w-6 text-blue-500" /> Geologic Time-Period Map
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Slide to alter the geological epoch. Click on any active region or fossil formation pin on the map.
            </p>
          </div>
          <div className="bg-slate-950 px-4 py-1.5 rounded-xl border border-slate-850 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Period</span>
            <div className="text-sm font-extrabold text-blue-400">{activeEra.name}</div>
          </div>
        </div>

        {/* Timeline Slider Control */}
        <div className="space-y-2 pt-2">
          <input
            type="range"
            min="0"
            max={ERAS.length - 1}
            value={eraIndex}
            onChange={(e) => setEraIndex(parseInt(e.target.value, 10))}
            className="w-full appearance-none bg-slate-950 h-2 rounded-lg cursor-pointer animate-none"
            id="timeline-slider"
          />
          <div className="flex justify-between text-[10px] text-slate-400 overflow-x-auto pb-1 gap-4 font-semibold uppercase tracking-wider">
            {ERAS.map((era, index) => (
              <button
                key={era.name}
                onClick={() => setEraIndex(index)}
                className={`transition-colors whitespace-nowrap focus:outline-none cursor-pointer ${
                  index === eraIndex ? 'text-blue-400 font-extrabold border-b-2 border-blue-400 pb-0.5' : 'hover:text-slate-200'
                }`}
              >
                {era.name}
              </button>
            ))}
          </div>
        </div>

        {/* Era descriptions block */}
        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900 text-xs text-slate-400 flex items-center gap-2.5">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span>
            <strong className="text-slate-350">{activeEra.name} ({activeEra.range}):</strong> {activeEra.desc}
          </span>
        </div>
      </div>

      {/* Main Grid: Map + Sidebar Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Leaflet Map Frame Container */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-850 rounded-2xl p-3 shadow-xl h-[450px] sm:h-[550px] relative overflow-hidden flex flex-col justify-between">
          
          {/* Back to Continents Button */}
          {selectedContinent && (
            <button
              onClick={() => {
                setSelectedContinent(null);
                setSelectedFormation(null);
                setSelectedCountry(null);
              }}
              className="absolute top-6 left-6 z-20 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-blue-400 px-3 py-1.5 rounded-xl shadow-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Compass className="h-4 w-4" /> Back to Global Map
            </button>
          )}

          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            minZoom={1.5}
            className="w-full h-full rounded-xl flex-grow z-10"
            zoomControl={true}
            maxBounds={[
              [-90, -180],
              [90, 180]
            ]}
          >
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* Render Continent Pins if no continent is selected */}
            {!selectedContinent && CONTINENTS.map((region) => (
              <Marker
                key={region.name}
                position={region.coords}
                icon={createMapMarkerIcon(region.name, selectedContinent === region.name, activeEraColor)}
                eventHandlers={{
                  click: () => {
                    setSelectedContinent(region.name);
                    setSelectedFormation(null);
                    setSelectedCountry(null);
                  }
                }}
              />
            ))}

            {/* Render Formation Pins if a continent is selected */}
            {selectedContinent && visibleFormations.map((form) => (
              <Marker
                key={form.name}
                position={form.coords}
                icon={createFormationMarkerIcon(form.name, selectedFormation === form.name, activeEraColor)}
                eventHandlers={{
                  click: () => {
                    setSelectedFormation(form.name);
                    setSelectedCountry(form.country);
                  }
                }}
              />
            ))}
          </MapContainer>

          {/* Map Status indicator */}
          <div className="absolute bottom-6 left-6 z-20 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-855 text-xs text-slate-350 shadow-xl flex items-center gap-2 pointer-events-none">
            <MapPin className="h-4 w-4 text-blue-400" />
            <span>
              Selected Location:{' '}
              <strong className="text-white">
                {selectedFormation
                  ? `${selectedFormation} (${selectedCountry})`
                  : selectedContinent
                  ? `${selectedContinent} (Drilled down)`
                  : 'Global (Click a continent)'}
              </strong>
            </span>
          </div>
        </div>

        {/* Sidebar Results Panel */}
        <aside className="lg:col-span-4 bg-slate-900/50 border border-slate-855 rounded-2xl p-5 flex flex-col h-[450px] sm:h-[550px] justify-between">
          <div className="space-y-4 flex flex-col flex-grow overflow-hidden">
            <div className="border-b border-slate-805 pb-3 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Fossil Beds
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {selectedFormation ? 'Fossil formation results' : 'Continent broad results'}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-slate-400">
                {speciesList.length} Found
              </span>
            </div>

            {/* List scroll container */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-1">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  <span className="text-xs">Searching fossil beds...</span>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-center text-red-400 text-xs">
                  {error}
                </div>
              ) : !selectedContinent ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 gap-2">
                  <Compass className="h-8 w-8 text-slate-600" />
                  <p className="text-xs font-semibold text-slate-400">No Region Selected</p>
                  <p className="text-[10px] text-slate-500 max-w-xs">
                    Please click on a continental location marker on the map to explore prehistoric species and reveal local formations.
                  </p>
                </div>
              ) : speciesList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 gap-2">
                  <Dna className="h-8 w-8 text-slate-600" />
                  <p className="text-xs font-semibold text-slate-400">No Records Discovered</p>
                  <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                    No cataloged species in our database fit this geologic selection during the {activeEra.name} period. Try switching eras on the timeline or checking another formation.
                  </p>
                </div>
              ) : (
                speciesList.map((species) => (
                  <Link
                    key={species.id}
                    to={`/species/${species.id}`}
                    className="group flex gap-3 p-2 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-900 hover:border-slate-800 rounded-xl transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="h-16 w-16 bg-slate-950 border border-slate-900 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {species.reconstructionImageUrl ? (
                        <img
                          src={species.reconstructionImageUrl}
                          alt={species.name}
                          className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[8px] text-slate-600 font-bold uppercase text-center bg-slate-950">
                          No Pic
                        </div>
                      )}
                    </div>

                    {/* Stats at a glance */}
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                          {species.name}
                        </h4>
                        <p className="text-[10px] italic text-slate-450 truncate">
                          {species.scientificName}
                        </p>
                        {species.isMapFallback ? (
                          <div className="text-[8px] text-amber-500 font-semibold mt-0.5 truncate bg-amber-500/5 border border-amber-500/10 px-1 py-0.5 rounded w-max">
                            ⚠️ {species.country || 'Country'} Fallback
                          </div>
                        ) : (
                          <div className="text-[8px] text-indigo-400 font-semibold mt-0.5 truncate bg-indigo-500/5 border border-indigo-500/10 px-1 py-0.5 rounded w-max">
                            📍 {species.fossilFormation || 'Formation Site'}
                          </div>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-550 flex flex-wrap gap-1 items-center">
                        <span className="font-semibold text-blue-400/90">{species.dietType}</span>
                        <span>&bull;</span>
                        <span>{species.lengthM ? `${species.lengthM}m` : 'N/A'} length</span>
                      </div>
                    </div>

                    <div className="flex items-center text-slate-600 group-hover:text-white transition-colors pl-1">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
