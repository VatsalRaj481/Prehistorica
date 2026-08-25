import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion, Variants } from 'framer-motion';
import { fetchSpecies, Species } from '../services/api.js';

import { SlidersHorizontal, ArrowRight, Dna, Info, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const shouldReduceMotion = useReducedMotion();

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

  // Motion variants with explicit Framer Motion typing
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.04
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 28
      }
    }
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
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Filter className="h-7 w-7 text-blue-400" /> Explore the Paleocatalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Combinable multi-select filters across millions of years of evolutionary history.
          </p>
        </div>

        {/* Mobile filter toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white flex items-center justify-center cursor-pointer active:bg-slate-800 transition-colors"
            title="Toggle Filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar - Desktop */}
        <motion.aside
          initial={shouldReduceMotion ? false : { opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="hidden md:block bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl h-fit space-y-6 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Combinable Filters</span>
            </h3>
            {hasActiveFilters && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={clearFilters}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold shrink-0 cursor-pointer whitespace-nowrap ml-auto"
              >
                Reset All
              </motion.button>
            )}
          </div>

          {/* Clade Multi-Select Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Taxonomic Clade</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {cladeOptions.map((c) => {
                const isSelected = selectedClades.includes(c);
                return (
                  <motion.label
                    key={c}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 text-xs cursor-pointer py-1 px-2 rounded-lg transition-colors select-none ${
                      isSelected ? 'bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleArrayFilter('clade', c)}
                      className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-blue-500"
                    />
                    <span>{c}</span>
                  </motion.label>
                );
              })}
            </div>
          </div>

          {/* Diet Multi-Select Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Diet</label>
            <div className="space-y-1">
              {dietOptions.map((d) => {
                const isSelected = selectedDiets.includes(d.val);
                return (
                  <motion.label
                    key={d.val}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 text-xs cursor-pointer py-1 px-2 rounded-lg transition-colors select-none ${
                      isSelected ? 'bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleArrayFilter('diet', d.val)}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span>{d.label}</span>
                  </motion.label>
                );
              })}
            </div>
          </div>

          {/* Habitat Multi-Select Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Habitat</label>
            <div className="space-y-1">
              {habitatOptions.map((h) => {
                const isSelected = selectedHabitats.includes(h.val);
                return (
                  <motion.label
                    key={h.val}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 text-xs cursor-pointer py-1 px-2 rounded-lg transition-colors select-none ${
                      isSelected ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleArrayFilter('habitat', h.val)}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>{h.label}</span>
                  </motion.label>
                );
              })}
            </div>
          </div>

          {/* Geologic Era Dropdown */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Geologic Era</label>
            <select
              value={selectedEra}
              onChange={(e) => updateParams({ era: e.target.value })}
              className="block w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">All Geologic Eras</option>
              {eraOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Location Continent Dropdown */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Geographic Region</label>
            <select
              value={selectedLocation}
              onChange={(e) => updateParams({ location: e.target.value })}
              className="block w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">All Regions</option>
              {locationOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Size Class Dropdown */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Length Size Class</label>
            <select
              value={sizeRange}
              onChange={(e) => updateParams({ size: e.target.value })}
              className="block w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">All Sizes</option>
              <option value="small">Small (&lt; 2m)</option>
              <option value="medium">Medium (2m - 10m)</option>
              <option value="large">Giant (&gt; 10m)</option>
            </select>
          </div>
        </motion.aside>

        {/* Mobile Filters Drawer Overlay */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden flex justify-end"
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="bg-slate-900 w-80 h-full p-6 shadow-2xl flex flex-col justify-between border-l border-slate-800 overflow-y-auto"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h2 className="text-lg font-bold text-slate-200">Combinable Filters</h2>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowMobileFilters(false)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
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
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={clearFilters}
                      className="flex-1 py-2 text-center text-xs border border-slate-800 rounded-lg text-slate-400 font-semibold"
                    >
                      Reset All
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 py-2 bg-blue-600 rounded-lg text-xs font-semibold text-white text-center"
                  >
                    Apply Filters
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Species Grid & Pagination */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Filter Badges */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800/80 text-xs overflow-hidden shadow-sm"
              >
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Active Filters:</span>
                {search && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1 font-semibold"
                  >
                    Search: "{search}"
                    <button onClick={() => updateParams({ search: null })} className="hover:text-white"><X className="h-3 w-3" /></button>
                  </motion.span>
                )}
                {selectedClades.map(c => (
                  <motion.span
                    key={c}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1 font-semibold"
                  >
                    Clade: {c}
                    <button onClick={() => toggleArrayFilter('clade', c)} className="hover:text-white"><X className="h-3 w-3" /></button>
                  </motion.span>
                ))}
                {selectedDiets.map(d => (
                  <motion.span
                    key={d}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-1 font-semibold capitalize"
                  >
                    Diet: {d}
                    <button onClick={() => toggleArrayFilter('diet', d)} className="hover:text-white"><X className="h-3 w-3" /></button>
                  </motion.span>
                ))}
                {selectedHabitats.map(h => (
                  <motion.span
                    key={h}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1 font-semibold capitalize"
                  >
                    Habitat: {h}
                    <button onClick={() => toggleArrayFilter('habitat', h)} className="hover:text-white"><X className="h-3 w-3" /></button>
                  </motion.span>
                ))}
                {selectedEra && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1 font-semibold"
                  >
                    Era: {selectedEra}
                    <button onClick={() => updateParams({ era: null })} className="hover:text-white"><X className="h-3 w-3" /></button>
                  </motion.span>
                )}
                {selectedLocation && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1 font-semibold"
                  >
                    Region: {selectedLocation}
                    <button onClick={() => updateParams({ location: null })} className="hover:text-white"><X className="h-3 w-3" /></button>
                  </motion.span>
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="text-blue-400 hover:underline font-semibold ml-auto text-xs"
                >
                  Clear All
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-900 border border-slate-800 rounded-xl h-80 shadow-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-8 text-center text-red-400 text-sm">
              {error}
            </div>
          ) : speciesList.length === 0 ? (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-16 text-center text-slate-400 flex flex-col items-center gap-3 shadow-xl"
            >
              <Info className="h-10 w-10 text-slate-500" />
              <p className="font-semibold text-slate-300">No Prehistoric Species Found</p>
              <p className="text-xs text-slate-500 max-w-sm">
                No catalog entries match your combination of filters. Try broadening your criteria.
              </p>
              {hasActiveFilters && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                >
                  Reset Filters
                </motion.button>
              )}
            </motion.div>
          ) : (
            <>
              <motion.div
                key={`${search}-${selectedClades.join()}-${selectedDiets.join()}-${selectedEra}-${page}`}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
              >
                {speciesList.map((species) => (
                  <motion.div
                    key={species.id}
                    variants={cardVariants}
                    whileHover={shouldReduceMotion ? {} : { y: -5, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to={`/species/${species.id}`}
                      className="group bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 rounded-xl overflow-hidden hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between h-full"
                    >
                      <div>
                        {/* Thumbnail Image */}
                        <div className="relative h-44 bg-slate-950 border-b border-slate-900 overflow-hidden flex items-center justify-center p-3">
                          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                          {species.reconstructionImageUrl ? (
                            <img
                              src={species.reconstructionImageUrl}
                              alt={species.name}
                              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-md z-10"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs bg-slate-950">
                              <Dna className="h-8 w-8 text-slate-700 mb-1" />
                              No Illustration Available
                            </div>
                          )}
                          {/* Era label */}
                          <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-semibold text-blue-400 border border-slate-800 z-20 shadow-sm">
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
                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                            {species.dietDetails}
                          </p>
                        </div>
                      </div>

                      <div className="px-4 py-3 border-t border-slate-900/80 bg-slate-900/30 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex gap-1.5 items-center min-w-0">
                          <span className="font-semibold text-indigo-400 shrink-0">{species.clade || species.dietType}</span>
                          <span className="text-slate-700 font-bold shrink-0">|</span>
                          <span className="font-semibold text-blue-400 truncate">
                            {species.lengthM ? `${species.lengthM}m` : 'Unspecified'}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 group-hover:text-blue-300 transition-colors shrink-0 font-semibold">
                          View Profile <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-6">
                  <span className="text-xs text-slate-400">
                    Showing Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{pagination.totalPages}</strong> ({pagination.total} total species)
                  </span>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      disabled={page <= 1}
                      onClick={() => updateParams({ page: (page - 1).toString() })}
                      className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-lg text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      disabled={page >= pagination.totalPages}
                      onClick={() => updateParams({ page: (page + 1).toString() })}
                      className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-lg text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </motion.button>
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
