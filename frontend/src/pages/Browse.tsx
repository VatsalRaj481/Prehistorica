import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSpecies, Species } from '../services/api.js';
import { Search, SlidersHorizontal, ArrowRight, Dna, Info, X } from 'lucide-react';

export default function Browse() {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [diet, setDiet] = useState('');
  const [location, setLocation] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [creatureType, setCreatureType] = useState('');

  // Mobile filters panel toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchSpecies({
      search,
      diet,
      location,
      time_period: timePeriod,
      creature_type: creatureType,
    })
      .then((data) => {
        setSpeciesList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch catalog data.');
        setLoading(false);
      });
  }, [search, diet, location, timePeriod, creatureType]);

  const clearFilters = () => {
    setSearch('');
    setDiet('');
    setLocation('');
    setTimePeriod('');
    setCreatureType('');
  };

  const hasActiveFilters = search !== '' || diet !== '' || location !== '' || timePeriod !== '' || creatureType !== '';

  // Options for filter lists
  const dietOptions = ['Carnivore', 'Herbivore', 'Omnivore'];
  
  const locationOptions = [
    'North America',
    'South America',
    'Europe',
    'Asia',
    'Africa',
    'Oceania',
  ];

  const eraOptions = [
    'Cambrian',
    'Devonian',
    'Carboniferous',
    'Permian',
    'Triassic',
    'Jurassic',
    'Cretaceous',
    'Eocene',
    'Neogene',
    'Pleistocene',
  ];

  const creatureTypeOptions = [
    'Dinosaur (Theropod)',
    'Dinosaur (Sauropod)',
    'Dinosaur (Ornithischian)',
    'Marine Reptile',
    'Pterosaur',
    'Synapsid/Early Mammal',
    'Early Tetrapod/Amphibian',
    'Invertebrate',
    'Other'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Explore the Paleocatalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Search and filter through millions of years of evolutionary history.
          </p>
        </div>

        {/* Search bar & filter controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog..."
              className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm placeholder-slate-500 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-250 flex items-center justify-center"
            title="Toggle Filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar - Desktop */}
        <aside className="hidden md:block bg-slate-900/50 border border-slate-850 p-5 rounded-2xl h-fit space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" /> Filters
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Creature Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Creature Type</label>
            <select
              value={creatureType}
              onChange={(e) => setCreatureType(e.target.value)}
              className="block w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Types</option>
              {creatureTypeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Diet Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Diet Type</label>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="block w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Diets</option>
              {dietOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Continent Found</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="block w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Regions</option>
              {locationOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Geologic Era Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Geologic Era</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="block w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Eras</option>
              {eraOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Mobile Filters Drawer Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden flex justify-end">
            <div className="bg-slate-900 w-80 h-full p-6 shadow-2xl flex flex-col justify-between border-l border-slate-850">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-slate-200">Filter Options</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Creature Type Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Creature Type</label>
                  <select
                    value={creatureType}
                    onChange={(e) => setCreatureType(e.target.value)}
                    className="block w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300"
                  >
                    <option value="">All Types</option>
                    {creatureTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Mobile Diet Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Diet Type</label>
                  <select
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    className="block w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300"
                  >
                    <option value="">All Diets</option>
                    {dietOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Mobile Location Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Continent Found</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="block w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300"
                  >
                    <option value="">All Regions</option>
                    {locationOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Mobile Era Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Geologic Era</label>
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="block w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300"
                  >
                    <option value="">All Eras</option>
                    {eraOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 border-t border-slate-800 pt-4 mt-auto">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-2 text-center text-xs border border-slate-800 rounded-lg text-slate-400 font-semibold"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-2 bg-blue-600 rounded-lg text-xs font-semibold text-white text-center"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Cards List Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-slate-900 border border-slate-800 rounded-xl h-80"
                />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-8 text-center text-red-400">
              {error}
            </div>
          ) : speciesList.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <Info className="h-10 w-10 text-slate-500" />
              <p className="font-semibold text-slate-300">No Prehistoric Fauna Found</p>
              <p className="text-xs text-slate-500 max-w-sm">
                We couldn't find any results matching your search terms or active filters. Try broadening your keywords.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-750 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {speciesList.map((species) => (
                <Link
                  key={species.id}
                  to={`/species/${species.id}`}
                  className="group bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-755 hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative h-44 bg-slate-950 border-b border-slate-900 overflow-hidden">
                      {species.reconstructionImageUrl ? (
                        <img
                          src={species.reconstructionImageUrl}
                          alt={species.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-655 text-xs bg-slate-950">
                          <Dna className="h-8 w-8 text-slate-700 mb-1" />
                          No Illustration Available
                        </div>
                      )}
                      {/* Era label */}
                      <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-blue-400 border border-slate-800">
                        {species.timePeriod.split(' ').pop()}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-extrabold text-slate-100 group-hover:text-blue-400 transition-colors">
                          {species.name}
                        </h3>
                        <p className="text-xs italic text-slate-400">
                          {species.scientificName}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-3">
                        {species.dietDetails}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-slate-900/60 bg-slate-900/20 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex gap-1.5 items-center min-w-0">
                      <span className="font-semibold text-indigo-400 shrink-0">{species.dietType}</span>
                      <span className="text-slate-700 font-bold shrink-0">|</span>
                      <span className="font-semibold text-blue-400 truncate" title={species.creatureType || 'Prehistoric'}>
                        {species.creatureType || 'Prehistoric'}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 hover:text-white transition-colors shrink-0">
                      View Profile <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
