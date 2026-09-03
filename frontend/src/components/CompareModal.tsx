import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Species, fetchSpeciesCompare, fetchSpeciesRoster, SpeciesRosterItem, primeSpeciesCache } from '../services/api.js';
import { X, ArrowRightLeft, Scale, Calendar, Dna, MapPin, ChevronDown, Check } from 'lucide-react';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';
import { formatFeet } from '../utils/formatDimensions.js';

interface CompareModalProps {
  initialSpecies?: Species | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatClade = (cladeStr?: string | null) => {
  if (!cladeStr) return 'Unspecified';
  if (cladeStr === 'Early_Mammal_Synapsid') return 'Early Mammal / Synapsid';
  if (cladeStr === 'Marine_Reptile') return 'Marine Reptile';
  if (cladeStr === 'Early_Tetrapod_Amphibian') return 'Early Tetrapod / Amphibian';
  return cladeStr.replace(/_/g, ' ');
};

interface SpeciesSearchInputProps {
  label: string;
  selectedSpecies: Species | SpeciesRosterItem | null;
  onSelect: (id: number) => void;
  availableList: SpeciesRosterItem[];
  placeholder?: string;
  disabled?: boolean;
}

function SpeciesSearchInput({
  label,
  selectedSpecies,
  onSelect,
  availableList,
  placeholder = 'Type species name, clade, or period...',
  disabled = false,
}: SpeciesSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available species based on what the user types
  const filteredList = useMemo(() => {
    if (!query.trim()) return availableList;
    const term = query.toLowerCase().trim();
    return availableList.filter((s) => {
      const nameMatch = s.name?.toLowerCase().includes(term);
      const sciMatch = s.scientificName?.toLowerCase().includes(term);
      const cladeMatch = s.clade?.toLowerCase().replace(/_/g, ' ').includes(term);
      const periodMatch = s.timePeriod?.toLowerCase().includes(term);
      const formationMatch = s.fossilFormation?.toLowerCase().includes(term);
      return nameMatch || sciMatch || cladeMatch || periodMatch || formationMatch;
    });
  }, [availableList, query]);

  // Cap rendered items to 40 for optimal 60fps rendering without DOM thrashing
  const displayList = useMemo(() => filteredList.slice(0, 40), [filteredList]);

  // Reset highlight to first item when search query changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [displayList]);

  // Auto-scroll highlighted option into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (species: SpeciesRosterItem) => {
    onSelect(species.id);
    setIsOpen(false);
    setIsFocused(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < displayList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : displayList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (displayList[highlightedIndex]) {
        handleSelect(displayList[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setIsFocused(false);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const displayInputValue = isFocused
    ? query
    : selectedSpecies
    ? `${selectedSpecies.name} (${formatClade(selectedSpecies.clade)} • ${selectedSpecies.timePeriod})`
    : '';

  return (
    <div ref={containerRef} className="space-y-1 relative w-full font-mono">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          {label}
        </label>
        {selectedSpecies && !isFocused && (
          <span className="text-[10px] text-amber-400 font-mono">Selected: {selectedSpecies.name}</span>
        )}
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={displayInputValue}
          placeholder={placeholder}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-slate-950 border border-white/[0.08] focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-all pr-8"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : ''}`}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-slate-900 border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl max-h-64 flex flex-col font-mono"
          >
            <div className="px-3 py-1.5 bg-slate-950/90 border-b border-white/[0.08] text-[10px] font-semibold text-slate-400 flex justify-between items-center select-none">
              <span>{filteredList.length} matching species</span>
              {query ? (
                <span className="text-amber-400">Filtering: "{query}"</span>
              ) : (
                <span className="text-slate-500">Type to filter list</span>
              )}
            </div>

            <div ref={listRef} className="overflow-y-auto divide-y divide-white/[0.04] p-1">
              {displayList.length > 0 ? (
                <>
                  {displayList.map((s, idx) => {
                    const isSelected = selectedSpecies?.id === s.id;
                    const isHighlighted = highlightedIndex === idx;
                    const names = getSpeciesDisplayNames(s);

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelect(s)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${
                          isHighlighted
                            ? 'bg-amber-500/20 text-white'
                            : isSelected
                            ? 'bg-slate-800/80 text-slate-100'
                            : 'hover:bg-slate-800/50 text-slate-200'
                        }`}
                      >
                        <div className="h-9 w-9 rounded-md bg-slate-950 border border-white/[0.08] overflow-hidden shrink-0 flex items-center justify-center">
                          {s.reconstructionImageUrl ? (
                            <img
                              src={s.reconstructionImageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Dna className="h-4 w-4 text-slate-600" />
                          )}
                        </div>

                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-xs font-bold uppercase truncate font-sans text-slate-100">
                              {names.heading}
                            </span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                          </div>
                          <div className="text-[11px] text-amber-400/90 italic font-mono truncate">
                            {names.subheading}{' '}
                            <span className="text-slate-400 not-italic text-[10px]">
                              &bull; {formatClade(s.clade)} &bull; {s.timePeriod}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {filteredList.length > displayList.length && (
                    <div className="px-3 py-2 text-[10px] text-slate-500 text-center bg-slate-950/60 border-t border-white/[0.04]">
                      Showing top {displayList.length} of {filteredList.length} species. Type to refine search.
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No species matching "<span className="text-slate-200 font-bold">{query}</span>"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CompareModal({ initialSpecies, isOpen, onClose }: CompareModalProps) {
  const [species1, setSpecies1] = useState<Species | null>(initialSpecies || null);
  const [species2, setSpecies2] = useState<Species | null>(null);
  const [availableList, setAvailableList] = useState<SpeciesRosterItem[]>([]);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (initialSpecies) {
      setSpecies1(initialSpecies);
      primeSpeciesCache(initialSpecies);
    }
  }, [initialSpecies]);

  useEffect(() => {
    if (isOpen) {
      // 1. Fetch lightweight roster in background (returns instantly from cache after 1st fetch)
      fetchSpeciesRoster()
        .then((list) => {
          setAvailableList(list);
        })
        .catch(console.error);

      // 2. Fetch species comparison immediately in parallel!
      const firstId = species1?.id || 1;
      const secondId = species2?.id || (firstId === 1 ? 2 : 1);

      if (!species1) setLoading1(true);
      if (!species2) setLoading2(true);

      fetchSpeciesCompare([firstId, secondId])
        .then((compRes) => {
          const s1 = compRes.find((s) => s.id === firstId) || compRes[0];
          const s2 = compRes.find((s) => s.id === secondId && s.id !== s1?.id) || compRes[1];
          if (s1) setSpecies1(s1);
          if (s2) setSpecies2(s2);
        })
        .catch(console.error)
        .finally(() => {
          setLoading1(false);
          setLoading2(false);
        });
    }
  }, [isOpen]);

  const handleSelectFirst = (id1: number) => {
    if (isNaN(id1) || species1?.id === id1) return;

    setLoading1(true);
    fetchSpeciesCompare([id1])
      .then((res) => {
        if (res.length > 0) {
          setSpecies1(res[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading1(false));
  };

  const handleSelectSecond = (id2: number) => {
    if (isNaN(id2) || species2?.id === id2) return;

    setLoading2(true);
    fetchSpeciesCompare([id2])
      .then((res) => {
        if (res.length > 0) {
          setSpecies2(res[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading2(false));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="bg-slate-900 border border-white/[0.08] rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto font-mono"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-bold text-slate-100 font-sans uppercase tracking-tight">Species Side-by-Side Comparison</h2>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-white/[0.08]"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-white/[0.06] shadow-inner">
              <SpeciesSearchInput
                label="Select Species 1:"
                selectedSpecies={species1}
                onSelect={handleSelectFirst}
                availableList={availableList}
                placeholder="Type species 1 (e.g. Diplodocus, T-Rex)..."
                disabled={loading1}
              />

              <SpeciesSearchInput
                label="Select Species 2:"
                selectedSpecies={species2}
                onSelect={handleSelectSecond}
                availableList={availableList}
                placeholder="Type species 2 (e.g. Triceratops, Spino)..."
                disabled={loading2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
              {species1 ? (
                <div className={`space-y-4 museum-card p-4 rounded-xl shadow-inner relative transition-opacity duration-200 ${loading1 ? 'opacity-60 pointer-events-none' : ''}`}>
                  {loading1 && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-20">
                      <div className="h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="relative h-44 bg-slate-950 rounded-lg overflow-hidden border border-white/[0.06] flex items-center justify-center p-3">
                    {species1.reconstructionImageUrl ? (
                      <img
                        src={species1.reconstructionImageUrl}
                        alt={species1.name}
                        className="max-w-full max-h-full object-contain drop-shadow z-10"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">
                        No Image Available
                      </div>
                    )}
                  </div>

                  {(() => {
                    const names1 = getSpeciesDisplayNames(species1);
                    return (
                      <div>
                        <h3 className="text-base font-black uppercase text-slate-100 font-sans tracking-tight">{names1.heading}</h3>
                        <p className="text-xs italic font-mono text-amber-400">{names1.subheading}</p>
                      </div>
                    );
                  })()}

                  <div className="space-y-2 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Scale className="h-3 w-3 text-amber-400" /> Length
                      </span>
                      <span className="font-bold text-amber-400">
                        {formatFeet(species1.lengthM)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Scale className="h-3 w-3 text-amber-400" /> Height
                      </span>
                      <span className="font-bold text-amber-400">
                        {formatFeet(species1.heightM)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Scale className="h-3 w-3 text-amber-400" /> Mass
                      </span>
                      <span className="font-bold text-amber-400">
                        {species1.weightKg ? `${species1.weightKg.toLocaleString()} kg` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-amber-400" /> Era
                      </span>
                      <span className="font-bold text-slate-200">{species1.timePeriod}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Dna className="h-3 w-3 text-amber-400" /> Clade
                      </span>
                      <span className="font-bold text-slate-200">{formatClade(species1.clade)}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-amber-400" /> Formation
                      </span>
                      <span className="font-bold text-slate-200">{species1.fossilFormation || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-white/[0.06] rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-500">
                  <p className="text-xs font-semibold font-sans">Select Species 1 above.</p>
                </div>
              )}

              {species2 ? (
                <div className={`space-y-4 museum-card p-4 rounded-xl shadow-inner relative transition-opacity duration-200 ${loading2 ? 'opacity-60 pointer-events-none' : ''}`}>
                  {loading2 && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-20">
                      <div className="h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="relative h-44 bg-slate-950 rounded-lg overflow-hidden border border-white/[0.06] flex items-center justify-center p-3">
                    {species2.reconstructionImageUrl ? (
                      <img
                        src={species2.reconstructionImageUrl}
                        alt={species2.name}
                        className="max-w-full max-h-full object-contain drop-shadow z-10"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">
                        No Image Available
                      </div>
                    )}
                  </div>

                  {(() => {
                    const names2 = getSpeciesDisplayNames(species2);
                    return (
                      <div>
                        <h3 className="text-base font-black uppercase text-slate-100 font-sans tracking-tight">{names2.heading}</h3>
                        <p className="text-xs italic font-mono text-amber-400">{names2.subheading}</p>
                      </div>
                    );
                  })()}

                  <div className="space-y-2 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Scale className="h-3 w-3 text-amber-400" /> Length
                      </span>
                      <span className="font-bold text-amber-400">
                        {formatFeet(species2.lengthM)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Scale className="h-3 w-3 text-amber-400" /> Height
                      </span>
                      <span className="font-bold text-amber-400">
                        {formatFeet(species2.heightM)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Scale className="h-3 w-3 text-amber-400" /> Mass
                      </span>
                      <span className="font-bold text-amber-400">
                        {species2.weightKg ? `${species2.weightKg.toLocaleString()} kg` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-amber-400" /> Era
                      </span>
                      <span className="font-bold text-slate-200">{species2.timePeriod}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Dna className="h-3 w-3 text-amber-400" /> Clade
                      </span>
                      <span className="font-bold text-slate-200">{formatClade(species2.clade)}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.06] pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-amber-400" /> Formation
                      </span>
                      <span className="font-bold text-slate-200">{species2.fossilFormation || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-white/[0.06] rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-500">
                  <p className="text-xs font-semibold font-sans">Select Species 2 above to compare side-by-side.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
