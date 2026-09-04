import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion, Variants } from 'framer-motion';
import { fetchSpecies, Species } from '../services/api.js';
import ThreeDFossilStarfield from '../components/ThreeDFossilStarfield.js';
import SpotlightCard from '../components/SpotlightCard.js';
import { SlidersHorizontal, ArrowRight, Dna, Info, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';
import { formatFeet } from '../utils/formatDimensions.js';

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
    document.title = 'Catalog Pavilion | Prehistorica Museum Index';
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
        staggerChildren: shouldReduceMotion ? 0 : 0.03
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
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
    <div className="space-y-6 relative">
      {/* 3D Particle Fossil Background */}
      <ThreeDFossilStarfield />

      {/* Header Bar */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 font-mono"
      >
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2 font-sans">
            <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 shrink-0" /> Fauna Catalog Index
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Archival search across <strong className="text-amber-400">{pagination.total > 0 ? `${pagination.total}+` : '460+'}</strong> verified prehistoric specimens.
          </p>
        </div>

        {/* Mobile filter icon button: compact icon with active filter badge (Apple HIG 44pt min target) */}
        <div className="flex items-center gap-2 lg:hidden">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="relative min-h-[44px] min-w-[44px] p-2.5 sm:px-4 sm:py-2.5 bg-slate-900 border border-amber-500/40 text-amber-400 font-bold hover:text-white flex items-center justify-center cursor-pointer font-mono text-xs uppercase tracking-wider rounded-xl shadow-lg transition-colors"
            title="Toggle Filters"
            aria-label="Toggle Catalog Filters"
          >
            <SlidersHorizontal className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2 text-amber-500" />
            <span className="hidden sm:inline">Catalog Filters</span>
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-slate-950 animate-pulse" />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile / Tablet Filter Drawer Overlay with Apple Scroll Containment */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-xl flex flex-col p-4 sm:p-6 overflow-y-auto lg:hidden font-mono overscroll-contain"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-amber-500" /> Catalog Filters
              </h2>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="min-h-[44px] px-3 py-2 text-xs text-amber-400 hover:underline font-bold uppercase tracking-wider flex items-center active:scale-95 transition-transform"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="min-h-[44px] min-w-[44px] p-2.5 bg-slate-900 border border-white/[0.08] text-slate-400 hover:text-white rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="Close Filter Drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 text-xs flex-1 pb-6">
              {/* Clade Multi-Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taxonomic Clade</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {cladeOptions.map((c) => {
                    const isSelected = selectedClades.includes(c);
                    return (
                      <label
                        key={c}
                        className={`flex items-center gap-2 text-xs cursor-pointer py-2 px-2.5 rounded-lg border transition-colors select-none ${
                          isSelected ? 'bg-amber-500/10 text-amber-300 font-bold border-amber-500/40' : 'bg-slate-900 border-white/[0.06] text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleArrayFilter('clade', c)}
                          className="rounded border-white/10 bg-slate-950 text-amber-500"
                        />
                        <span className="truncate">{c}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Diet Multi-Select */}
              <div className="space-y-2 pt-3 border-t border-white/[0.08]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dietary Type</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {dietOptions.map((d) => {
                    const isSelected = selectedDiets.includes(d.val);
                    return (
                      <label
                        key={d.val}
                        className={`flex items-center gap-2 text-xs cursor-pointer py-2 px-2.5 rounded-lg border transition-colors select-none ${
                          isSelected ? 'bg-amber-500/10 text-amber-300 font-bold border-amber-500/40' : 'bg-slate-900 border-white/[0.06] text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleArrayFilter('diet', d.val)}
                          className="rounded border-white/10 bg-slate-950 text-amber-500"
                        />
                        <span>{d.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Habitat Multi-Select */}
              <div className="space-y-2 pt-3 border-t border-white/[0.08]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Habitat</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {habitatOptions.map((h) => {
                    const isSelected = selectedHabitats.includes(h.val);
                    return (
                      <label
                        key={h.val}
                        className={`flex items-center gap-2 text-xs cursor-pointer py-2 px-2.5 rounded-lg border transition-colors select-none ${
                          isSelected ? 'bg-amber-500/10 text-amber-300 font-bold border-amber-500/40' : 'bg-slate-900 border-white/[0.06] text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleArrayFilter('habitat', h.val)}
                          className="rounded border-white/10 bg-slate-950 text-amber-500"
                        />
                        <span>{h.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Geologic Era */}
              <div className="space-y-2 pt-3 border-t border-white/[0.08]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Geologic Era</label>
                <select
                  value={selectedEra}
                  onChange={(e) => updateParams({ era: e.target.value })}
                  className="block w-full p-2.5 bg-slate-900 border border-white/[0.08] rounded-lg text-xs text-slate-200"
                >
                  <option value="">All Geologic Eras</option>
                  {eraOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Location Continent */}
              <div className="space-y-2 pt-3 border-t border-white/[0.08]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Geographic Region</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => updateParams({ location: e.target.value })}
                  className="block w-full p-2.5 bg-slate-900 border border-white/[0.08] rounded-lg text-xs text-slate-200"
                >
                  <option value="">All Regions</option>
                  {locationOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Size Range */}
              <div className="space-y-2 pt-3 border-t border-white/[0.08]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Size Scale</label>
                <select
                  value={sizeRange}
                  onChange={(e) => updateParams({ size: e.target.value })}
                  className="block w-full p-2.5 bg-slate-900 border border-white/[0.08] rounded-lg text-xs text-slate-200"
                >
                  <option value="">All Sizes</option>
                  <option value="small">Small (&lt; 2m)</option>
                  <option value="medium">Medium (2m - 10m)</option>
                  <option value="large">Giant (&gt; 10m)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-wider text-xs rounded-lg sticky bottom-0 cursor-pointer shadow-lg"
            >
              Apply & Close Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar: Only displayed on desktop (hidden on mobile/tablet) */}
        <motion.aside
          initial={shouldReduceMotion ? false : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="hidden lg:block lg:col-span-1 glass-panel rounded-xl p-5 border border-white/[0.08] shadow-xl space-y-5 h-fit font-mono text-xs"
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <h3 className="font-black text-slate-100 uppercase tracking-wide font-sans text-sm">Catalog Filters</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] text-amber-400 hover:underline uppercase tracking-wider font-bold cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Taxonomic Clade Checkboxes */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Taxonomic Clade</label>
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {cladeOptions.map((c) => {
                const isSelected = selectedClades.includes(c);
                return (
                  <motion.label
                    key={c}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 text-xs cursor-pointer py-1.5 px-2.5 rounded-lg transition-colors select-none ${
                      isSelected ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleArrayFilter('clade', c)}
                      className="rounded border-white/10 bg-slate-950 text-amber-500 focus:ring-amber-500/40"
                    />
                    <span>{c}</span>
                  </motion.label>
                );
              })}
            </div>
          </div>

          {/* Diet Multi-Select Checkboxes */}
          <div className="space-y-2 pt-3 border-t border-white/[0.08]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Dietary Type</label>
            <div className="space-y-1">
              {dietOptions.map((d) => {
                const isSelected = selectedDiets.includes(d.val);
                return (
                  <motion.label
                    key={d.val}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 text-xs cursor-pointer py-1.5 px-2.5 rounded-lg transition-colors select-none ${
                      isSelected ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleArrayFilter('diet', d.val)}
                      className="rounded border-white/10 bg-slate-950 text-amber-500 focus:ring-amber-500/40"
                    />
                    <span>{d.label}</span>
                  </motion.label>
                );
              })}
            </div>
          </div>

          {/* Habitat Multi-Select Checkboxes */}
          <div className="space-y-2 pt-3 border-t border-white/[0.08]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Habitat</label>
            <div className="space-y-1">
              {habitatOptions.map((h) => {
                const isSelected = selectedHabitats.includes(h.val);
                return (
                  <motion.label
                    key={h.val}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 text-xs cursor-pointer py-1.5 px-2.5 rounded-lg transition-colors select-none ${
                      isSelected ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleArrayFilter('habitat', h.val)}
                      className="rounded border-white/10 bg-slate-950 text-amber-500 focus:ring-amber-500/40"
                    />
                    <span>{h.label}</span>
                  </motion.label>
                );
              })}
            </div>
          </div>

          {/* Geologic Era Dropdown */}
          <div className="space-y-2 pt-3 border-t border-white/[0.08]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Geologic Era</label>
            <select
              value={selectedEra}
              onChange={(e) => updateParams({ era: e.target.value })}
              className="block w-full p-2.5 bg-slate-900/90 border border-white/[0.08] rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500/60 font-mono transition-colors"
            >
              <option value="">All Geologic Eras</option>
              {eraOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Location Continent Dropdown */}
          <div className="space-y-2 pt-3 border-t border-white/[0.08]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Geographic Region</label>
            <select
              value={selectedLocation}
              onChange={(e) => updateParams({ location: e.target.value })}
              className="block w-full p-2.5 bg-slate-900/90 border border-white/[0.08] rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500/60 font-mono transition-colors"
            >
              <option value="">All Regions</option>
              {locationOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Size Class Dropdown */}
          <div className="space-y-2 pt-3 border-t border-white/[0.08]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Length Scale Class</label>
            <select
              value={sizeRange}
              onChange={(e) => updateParams({ size: e.target.value })}
              className="block w-full p-2.5 bg-slate-900/90 border border-white/[0.08] rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500/60 font-mono transition-colors"
            >
              <option value="">All Sizes</option>
              <option value="small">Small (&lt; 2m)</option>
              <option value="medium">Medium (2m - 10m)</option>
              <option value="large">Giant (&gt; 10m)</option>
            </select>
          </div>
        </motion.aside>

        {/* Right Species Grid & Pagination: Spans full width on mobile/tablet */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          {/* Active Filter Badges */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center gap-2 p-3 glass-panel rounded-xl border border-white/[0.08] text-xs font-mono overflow-hidden shadow-md"
              >
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Active Filters:</span>
                {search && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 font-bold"
                  >
                    Query: "{search}"
                    <button onClick={() => updateParams({ search: null })} className="hover:text-white cursor-pointer"><X className="h-3 w-3" /></button>
                  </motion.span>
                )}
                {selectedClades.map(c => (
                  <motion.span
                    key={c}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 font-bold"
                  >
                    Clade: {c}
                    <button onClick={() => toggleArrayFilter('clade', c)} className="hover:text-white cursor-pointer"><X className="h-3 w-3" /></button>
                  </motion.span>
                ))}
                {selectedDiets.map(d => (
                  <motion.span
                    key={d}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-2.5 py-1 rounded-md bg-slate-900 border border-white/[0.08] text-slate-300 flex items-center gap-1.5 font-bold capitalize"
                  >
                    Diet: {d}
                    <button onClick={() => toggleArrayFilter('diet', d)} className="hover:text-white cursor-pointer"><X className="h-3 w-3" /></button>
                  </motion.span>
                ))}
                {selectedEra && (
                  <motion.span
                    key={selectedEra}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1.5 font-bold"
                  >
                    Era: {selectedEra}
                    <button onClick={() => updateParams({ era: null })} className="hover:text-white cursor-pointer"><X className="h-3 w-3" /></button>
                  </motion.span>
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="text-amber-400 hover:underline font-bold uppercase tracking-wider ml-auto text-[10px] cursor-pointer"
                >
                  Reset All
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse museum-card rounded-xl border border-white/[0.06] h-80" />
              ))}
            </div>
          ) : error ? (
            <div className="glass-panel rounded-xl border border-red-500/30 p-8 text-center text-red-400 text-xs font-mono">
              {error}
            </div>
          ) : speciesList.length === 0 ? (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="glass-panel rounded-xl border border-white/[0.08] p-16 text-center text-slate-400 flex flex-col items-center gap-3 font-mono shadow-2xl"
            >
              <Info className="h-10 w-10 text-amber-400" />
              <p className="font-bold text-slate-200 uppercase tracking-widest text-sm font-sans">No Specimen Records Located</p>
              <p className="text-xs text-slate-400 max-w-sm font-sans">
                No catalog entries match your combination of filters. Try broadening your filter criteria.
              </p>
              {hasActiveFilters && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-300 transition-colors cursor-pointer"
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
                {speciesList.map((species) => {
                  const names = getSpeciesDisplayNames(species);
                  return (
                    <SpotlightCard
                      key={species.id}
                      layout={shouldReduceMotion ? false : true}
                      variants={cardVariants}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, amount: 0.1 }}
                      whileHover={shouldReduceMotion ? {} : { y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        layout: { type: 'spring', stiffness: 350, damping: 30 }
                      }}
                      className="museum-card rounded-xl flex flex-col justify-between h-full shadow-xl"
                    >
                      <Link
                        to={`/species/${species.id}`}
                        className="group flex flex-col justify-between h-full"
                      >
                        <div>
                          {/* Thumbnail Image */}
                          <div className="relative h-48 bg-slate-950/80 border-b border-white/[0.08] overflow-hidden flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-fossil-grid opacity-20 pointer-events-none" />
                            {species.reconstructionImageUrl ? (
                              <img
                                src={species.reconstructionImageUrl}
                                alt={species.name}
                                className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-xl z-10"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono bg-slate-950/60 rounded-lg">
                                <Dna className="h-8 w-8 text-slate-700 mb-1" />
                                Illustration Uncataloged
                              </div>
                            )}
                            {/* Era label */}
                            <span className="absolute top-2 left-2 bg-slate-950/90 backdrop-blur-md border border-white/[0.08] px-2.5 py-0.5 rounded text-[10px] font-mono font-bold text-amber-400 tracking-wider uppercase z-20 shadow-md">
                              {species.timePeriod.split(' ').pop()}
                            </span>
                          </div>

                          <div className="p-4 space-y-2">
                            <div className="space-y-0.5 border-l-2 border-amber-500 pl-3">
                              <h3 className="text-base font-black uppercase text-slate-100 group-hover:text-amber-400 transition-colors tracking-tight font-sans">
                                {names.heading}
                              </h3>
                              <p className="text-xs italic text-amber-400 font-mono">
                                {names.subheading}
                              </p>
                            </div>
                            <p className="text-xs font-sans text-slate-300 line-clamp-3 leading-relaxed">
                              {species.dietDetails}
                            </p>
                          </div>
                        </div>

                        <div className="px-4 py-3 border-t border-white/[0.08] bg-slate-950/60 flex items-center justify-between font-mono text-[11px] text-slate-400">
                          <div className="flex gap-2 items-center min-w-0">
                            <span className="font-bold text-amber-400 shrink-0 uppercase text-[10px] tracking-wider">{species.clade || species.dietType}</span>
                            <span className="text-slate-600 font-bold shrink-0">|</span>
                            <span className="font-bold text-slate-300 truncate">
                              {formatFeet(species.lengthM, 'Unspecified')}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 group-hover:text-amber-400 transition-colors shrink-0 font-bold uppercase tracking-wider text-[10px]">
                            Inspect Specimen <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    </SpotlightCard>
                  );
                })}
              </motion.div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08] pt-6 font-mono text-xs">
                  <span className="text-slate-400 text-center sm:text-left">
                    Page <strong className="text-amber-400">{page}</strong> / <strong className="text-slate-200">{pagination.totalPages}</strong> ({pagination.total} total specimens)
                  </span>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      disabled={page <= 1}
                      onClick={() => updateParams({ page: (page - 1).toString() })}
                      className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-850 disabled:opacity-40 border border-white/[0.08] rounded-lg text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      disabled={page >= pagination.totalPages}
                      onClick={() => updateParams({ page: (page + 1).toString() })}
                      className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-850 disabled:opacity-40 border border-white/[0.08] rounded-lg text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
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

