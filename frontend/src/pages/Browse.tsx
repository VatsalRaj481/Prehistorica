import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchSpecies, Species } from '../services/api.js';

import { Search, SlidersHorizontal, ArrowRight, Dna, Info, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse state from URL Search Parameters
  const search = searchParams.get('search') || '';
  const selectedClades = searchParams.getAll('clade');
  const selectedDiets = searchParams.getAll('diet');
  const selectedHabitats = searchParams.getAll('habitat');
  const selectedEra = searchParams.get('era') || '';
  const selectedLocation = searchParams.get('location') || '';
  const sizeRange = searchParams.get('size') || ''; // 'small', 'medium', 'large'
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mobile filters panel toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    document.title = 'Browse Prehistoric Paleocatalog | Prehistorica Encyclopedia';
  }, []);

  // Fetch species whenever search parameters shift
  useEffect(() => {
    setLoading(true);

    let min_length: number | undefined;
    let max_length: number | undefined;

    if (sizeRange === 'small') {
      max_length = 2.0;
    } else if (sizeRange === 'medium') {
      min_length = 2.0;
      max_length = 10.0;
    } else if (sizeRange === 'large') {
      min_length = 10.0;
    }

    fetchSpecies({
      search,
      clade: selectedClades.length > 0 ? selectedClades : undefined,
      diet: selectedDiets.length > 0 ? selectedDiets : undefined,
      habitat: selectedHabitats.length > 0 ? selectedHabitats : undefined,
      time_period: selectedEra || undefined,
      location: selectedLocation || undefined,
      min_length,
      max_length,
      page,
      limit: 12
    })
      .then((res) => {
        if ('data' in res) {
          setSpeciesList(res.data);
          setPagination(res.pagination);
        } else {
          setSpeciesList(res);
          setPagination({ total: res.length, totalPages: 1, limit: 12 });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch catalog data.');
        setLoading(false);
      });
  }, [searchParams]);

  // Update URL helper
  const updateParams = (updates: Record<string, string | string[] | null | undefined>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, val]) => {
      newParams.delete(key);
      if (Array.isArray(val)) {
        val.forEach(v => {
          if (v) newParams.append(key, v);
        });
      } else if (val !== null && val !== undefined && val !== '') {
        newParams.set(key, val);
      }
    });

    // Reset to page 1 on filter changes (unless page itself is changing)
    if (!('page' in updates)) {
      newParams.set('page', '1');
    }

    setSearchParams(newParams);
  };

  const toggleArrayFilter = (key: 'clade' | 'diet' | 'habitat', item: string) => {
    const current = searchParams.getAll(key);
    let updated: string[];
    if (current.includes(item)) {
      updated = current.filter(i => i !== item);
    } else {
      updated = [...current, item];
    }
    updateParams({ [key]: updated });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    search !== '' ||
    selectedClades.length > 0 ||
    selectedDiets.length > 0 ||
    selectedHabitats.length > 0 ||
    selectedEra !== '' ||
    selectedLocation !== '' ||
    sizeRange !== '';

  // Filter options
  const cladeOptions = [
    'Theropod',
    'Sauropod',
    'Ornithischian',
    'Pterosaur',
    'Marine Reptile',
    'Ichthyosaur',
    'Ankylosaur',
    'Early Mammal/Synapsid',
    'Invertebrate',
    'Other'
  ];

  const dietOptions = [
    { label: 'Carnivore', val: 'carnivore' },
    { label: 'Herbivore', val: 'herbivore' },
    { label: 'Omnivore', val: 'omnivore' },
    { label: 'Piscivore', val: 'piscivore' },
    { label: 'Filter Feeder', val: 'filter_feeder' }
  ];

  const habitatOptions = [
    { label: 'Terrestrial', val: 'terrestrial' },
    { label: 'Marine', val: 'marine' },
    { label: 'Freshwater', val: 'freshwater' },
    { label: 'Aerial', val: 'aerial' },
    { label: 'Semi-aquatic', val: 'semi_aquatic' }
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
    'Pleistocene'
  ];

  const locationOptions = [
    'North America',
    'South America',
    'Europe',
    'Asia',
    'Africa',
    'Oceania'
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Filter className="h-7 w-7 text-blue-400" /> Explore the Paleocatalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Combinable multi-select filters across millions of years of evolutionary history.
          </p>
        </div>

        {/* Mobile filter button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            title="Toggle Filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar - Desktop */}
        <aside className="hidden md:block bg-slate-900/50 border border-slate-855 p-5 rounded-2xl h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Combinable Filters</span>
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold shrink-0 cursor-pointer whitespace-nowrap ml-auto"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Clade Multi-Select Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Taxonomic Clade</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {cladeOptions.map((c) => (
                <label key={c} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={selectedClades.includes(c)}
                    onChange={() => toggleArrayFilter('clade', c)}
                    className="rounded border-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Diet Multi-Select Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-850">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Diet</label>
            <div className="space-y-1">
              {dietOptions.map((d) => (
                <label key={d.val} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={selectedDiets.includes(d.val)}
                    onChange={() => toggleArrayFilter('diet', d.val)}
                    className="rounded border-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Habitat Multi-Select Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-850">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Habitat</label>
            <div className="space-y-1">
              {habitatOptions.map((h) => (
                <label key={h.val} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={selectedHabitats.includes(h.val)}
                    onChange={() => toggleArrayFilter('habitat', h.val)}
                    className="rounded border-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{h.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Geologic Era Single Select Dropdown */}
          <div className="space-y-2 pt-2 border-t border-slate-850">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Geologic Era</label>
            <select
              value={selectedEra}
              onChange={(e) => updateParams({ era: e.target.value })}
              className="block w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Geologic Eras</option>
              {eraOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Location Continent Dropdown */}
          <div className="space-y-2 pt-2 border-t border-slate-850">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Geographic Region</label>
            <select
              value={selectedLocation}
              onChange={(e) => updateParams({ location: e.target.value })}
              className="block w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Regions</option>
              {locationOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Size Class Dropdown */}
          <div className="space-y-2 pt-2 border-t border-slate-850">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Length Size Class</label>
            <select
              value={sizeRange}
              onChange={(e) => updateParams({ size: e.target.value })}
              className="block w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Sizes</option>
              <option value="small">Small (&lt; 2m)</option>
              <option value="medium">Medium (2m - 10m)</option>
              <option value="large">Giant (&gt; 10m)</option>
            </select>
          </div>
        </aside>

        {/* Mobile Filters Drawer Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden flex justify-end">
            <div className="bg-slate-900 w-80 h-full p-6 shadow-2xl flex flex-col justify-between border-l border-slate-850 overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-slate-200">Combinable Filters</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Geologic Era</label>
                  <select
                    value={selectedEra}
                    onChange={(e) => updateParams({ era: e.target.value })}
                    className="block w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300"
                  >
                    <option value="">All Eras</option>
                    {eraOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Geographic Region</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => updateParams({ location: e.target.value })}
                    className="block w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300"
                  >
                    <option value="">All Regions</option>
                    {locationOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 border-t border-slate-800 pt-4 mt-6">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-2 text-center text-xs border border-slate-800 rounded-lg text-slate-400 font-semibold"
                  >
                    Reset All
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

        {/* Right Species Grid & Pagination */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-855 text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Active Filters:</span>
              {search && (
                <span className="px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1 font-semibold">
                  Search: "{search}"
                  <button onClick={() => updateParams({ search: null })} className="hover:text-white"><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedClades.map(c => (
                <span key={c} className="px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1 font-semibold">
                  Clade: {c}
                  <button onClick={() => toggleArrayFilter('clade', c)} className="hover:text-white"><X className="h-3 w-3" /></button>
                </span>
              ))}
              {selectedDiets.map(d => (
                <span key={d} className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-1 font-semibold capitalize">
                  Diet: {d}
                  <button onClick={() => toggleArrayFilter('diet', d)} className="hover:text-white"><X className="h-3 w-3" /></button>
                </span>
              ))}
              {selectedHabitats.map(h => (
                <span key={h} className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1 font-semibold capitalize">
                  Habitat: {h}
                  <button onClick={() => toggleArrayFilter('habitat', h)} className="hover:text-white"><X className="h-3 w-3" /></button>
                </span>
              ))}
              {selectedEra && (
                <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1 font-semibold">
                  Era: {selectedEra}
                  <button onClick={() => updateParams({ era: null })} className="hover:text-white"><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedLocation && (
                <span className="px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 font-semibold">
                  Region: {selectedLocation}
                  <button onClick={() => updateParams({ location: null })} className="hover:text-white"><X className="h-3 w-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-blue-400 hover:underline font-semibold ml-auto text-xs">
                Clear All
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-900 border border-slate-800 rounded-xl h-80" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-8 text-center text-red-400 text-sm">
              {error}
            </div>
          ) : speciesList.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-855 rounded-2xl p-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <Info className="h-10 w-10 text-slate-500" />
              <p className="font-semibold text-slate-300">No Prehistoric Species Found</p>
              <p className="text-xs text-slate-500 max-w-sm">
                No catalog entries match your combination of filters. Try broadening your criteria.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-750 transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {speciesList.map((species) => (
                  <Link
                    key={species.id}
                    to={`/species/${species.id}`}
                    className="group bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-755 hover:shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail Image */}
                      <div className="relative h-44 bg-slate-950 border-b border-slate-900 overflow-hidden flex items-center justify-center p-3">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                        {species.reconstructionImageUrl ? (
                          <img
                            src={species.reconstructionImageUrl}
                            alt={species.name}
                            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow z-10"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-655 text-xs bg-slate-950">
                            <Dna className="h-8 w-8 text-slate-700 mb-1" />
                            No Illustration Available
                          </div>
                        )}
                        {/* Era label */}
                        <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-blue-400 border border-slate-800 z-20">
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
                        <span className="font-semibold text-indigo-400 shrink-0">{species.clade || species.dietType}</span>
                        <span className="text-slate-700 font-bold shrink-0">|</span>
                        <span className="font-semibold text-blue-400 truncate">
                          {species.lengthM ? `${species.lengthM}m` : 'Unspecified'}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 hover:text-white transition-colors shrink-0">
                        View Profile <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-855 pt-6">
                  <span className="text-xs text-slate-400">
                    Showing Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{pagination.totalPages}</strong> ({pagination.total} total species)
                  </span>


                  <div className="flex items-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => updateParams({ page: (page - 1).toString() })}
                      className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-lg text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </button>
                    <button
                      disabled={page >= pagination.totalPages}
                      onClick={() => updateParams({ page: (page + 1).toString() })}
                      className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-lg text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

