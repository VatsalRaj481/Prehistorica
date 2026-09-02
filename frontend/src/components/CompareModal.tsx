import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Species, fetchSpeciesCompare, fetchSpecies } from '../services/api.js';
import { X, ArrowRightLeft, Scale, Calendar, Dna, MapPin, Search, ChevronDown, Check } from 'lucide-react';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';

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

interface SpeciesComboboxProps {
  label: string;
  selectedSpecies: Species | null;
  onSelect: (id: number) => void;
  availableList: Species[];
  placeholder?: string;
  disabled?: boolean;
}

function SpeciesCombobox({
  label,
  selectedSpecies,
  onSelect,
  availableList,
  placeholder = 'Type to search species...',
  disabled = false,
}: SpeciesComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available species list based on search term
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return availableList;
    const term = searchTerm.toLowerCase().trim();
    return availableList.filter((s) => {
      const nameMatch = s.name?.toLowerCase().includes(term);
      const sciMatch = s.scientificName?.toLowerCase().includes(term);
      const cladeMatch = s.clade?.toLowerCase().replace(/_/g, ' ').includes(term);
      const periodMatch = s.timePeriod?.toLowerCase().includes(term);
      const formationMatch = s.fossilFormation?.toLowerCase().includes(term);
      return nameMatch || sciMatch || cladeMatch || periodMatch || formationMatch;
    });
  }, [availableList, searchTerm]);

  // Reset highlighted index when filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredList]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setSearchTerm('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSelect = (species: Species) => {
    onSelect(species.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredList[highlightedIndex]) {
        handleSelect(filteredList[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const selectedDisplay = selectedSpecies
    ? `${selectedSpecies.name} (${formatClade(selectedSpecies.clade)} • ${selectedSpecies.timePeriod})`
    : '-- Select Species --';

  return (
    <div ref={containerRef} className="space-y-1 relative w-full">
      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
        {label}
      </label>

      {/* Combobox Trigger / Search Input */}
      <div
        onClick={() => !isOpen && handleOpen()}
        className={`relative flex items-center bg-slate-900 border ${
          isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-800 hover:border-slate-700'
        } rounded-lg transition-all cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <Search className="h-4 w-4 text-slate-500 ml-3 shrink-0" />

        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full py-2.5 px-2 bg-transparent text-xs font-medium text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        ) : (
          <div className="w-full py-2.5 px-2 text-xs font-medium text-slate-200 truncate select-none">
            {selectedDisplay}
          </div>
        )}

        <div className="flex items-center gap-1 mr-2.5 shrink-0">
          {isOpen && searchTerm && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearchTerm('');
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-400' : ''
            }`}
          />
        </div>
      </div>

      {/* Floating Dropdown Results */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl max-h-64 flex flex-col"
          >
            {/* Filter Count & Search Hints */}
            <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] font-semibold text-slate-400 flex justify-between items-center select-none">
              <span>{filteredList.length} matching species</span>
              {searchTerm && <span>Filter: "{searchTerm}"</span>}
            </div>

            {/* Scrollable List */}
            <div ref={listRef} className="overflow-y-auto divide-y divide-slate-800/60 p-1">
              {filteredList.length > 0 ? (
                filteredList.map((s, idx) => {
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
                          ? 'bg-blue-600/20 text-white'
                          : isSelected
                          ? 'bg-slate-800/60 text-slate-100'
                          : 'hover:bg-slate-800/50 text-slate-200'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="h-9 w-9 rounded-md bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
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

                      {/* Species Details */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xs font-bold uppercase truncate font-sans text-slate-100">
                            {names.heading}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                        </div>
                        <div className="text-[11px] text-amber-400/90 italic font-serif truncate">
                          {names.subheading}{' '}
                          <span className="text-slate-400 not-italic font-sans text-[10px]">
                            &bull; {formatClade(s.clade)} &bull; {s.timePeriod}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No species matching "{searchTerm}"
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
  const [availableList, setAvailableList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (initialSpecies) {
      setSpecies1(initialSpecies);
    }
  }, [initialSpecies]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Fetch full available encyclopedia species
      fetchSpecies({ limit: 1000 })
        .then((res: any) => {
          const rawList: Species[] = Array.isArray(res) ? res : res.data || [];
          const list = rawList.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          setAvailableList(list);

          const firstId = species1?.id || (list.length > 0 ? list[0].id : 1);
          const secondCandidate = list.find((s: Species) => s.id !== firstId) || list[1] || list[0];
          const secondId = species2?.id || (secondCandidate ? secondCandidate.id : 2);

          fetchSpeciesCompare([firstId, secondId])
            .then((compRes) => {
              if (compRes.length >= 1) setSpecies1(compRes[0]);
              if (compRes.length >= 2) setSpecies2(compRes[1]);
              setLoading(false);
            })
            .catch(() => setLoading(false));
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  const handleSelectFirst = (id1: number) => {
    if (isNaN(id1)) return;

    const id2 = species2?.id || availableList.find((s) => s.id !== id1)?.id || 2;
    setLoading(true);
    fetchSpeciesCompare([id1, id2])
      .then((res) => {
        if (res.length >= 1) setSpecies1(res[0]);
        if (res.length >= 2) setSpecies2(res[1]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSelectSecond = (id2: number) => {
    if (isNaN(id2)) return;

    const id1 = species1?.id || 1;
    setLoading(true);
    fetchSpeciesCompare([id1, id2])
      .then((res) => {
        if (res.length >= 1) setSpecies1(res[0]);
        if (res.length >= 2) setSpecies2(res[1]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
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
            className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-bold text-slate-100">Species Side-by-Side Comparison</h2>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Type-to-Search Combobox Pickers for Species #1 and Species #2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 shadow-inner">
              <SpeciesCombobox
                label="Select Species 1:"
                selectedSpecies={species1}
                onSelect={handleSelectFirst}
                availableList={availableList}
                placeholder="Type to search species 1..."
                disabled={loading}
              />

              <SpeciesCombobox
                label="Select Species 2:"
                selectedSpecies={species2}
                onSelect={handleSelectSecond}
                availableList={availableList}
                placeholder="Type to search species 2..."
                disabled={loading}
              />
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
              {/* Species 1 Column */}
              {species1 ? (
                <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800 shadow-inner">
                  <div className="relative h-44 bg-slate-950 rounded-lg overflow-hidden border border-slate-850 flex items-center justify-center p-3">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                    {species1.reconstructionImageUrl ? (
                      <img
                        src={species1.reconstructionImageUrl}
                        alt={species1.name}
                        className="max-w-full max-h-full object-contain rounded drop-shadow z-10"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">
                        No Image
                      </div>
                    )}
                  </div>

                  {(() => {
                    const names1 = getSpeciesDisplayNames(species1);
                    return (
                      <div>
                        <h3 className="text-lg font-black uppercase text-slate-100">{names1.heading}</h3>
                        <p className="text-xs italic font-serif text-amber-400">{names1.subheading}</p>
                      </div>
                    );
                  })()}

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Scale className="h-3 w-3" /> Length
                      </span>
                      <span className="font-extrabold text-blue-400">
                        {species1.lengthM ? `${species1.lengthM} m` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Scale className="h-3 w-3" /> Height
                      </span>
                      <span className="font-extrabold text-blue-400">
                        {species1.heightM ? `${species1.heightM} m` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Scale className="h-3 w-3" /> Mass
                      </span>
                      <span className="font-extrabold text-blue-400">
                        {species1.weightKg ? `${species1.weightKg.toLocaleString()} kg` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Era
                      </span>
                      <span className="font-bold text-slate-200">{species1.timePeriod}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Dna className="h-3 w-3" /> Clade
                      </span>
                      <span className="font-bold text-indigo-400">{formatClade(species1.clade)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Formation
                      </span>
                      <span className="font-bold text-slate-200">{species1.fossilFormation || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-500">
                  <p className="text-xs font-semibold">Select Species 1 above.</p>
                </div>
              )}

              {/* Species 2 Column */}
              {species2 ? (
                <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800 shadow-inner">
                  <div className="relative h-44 bg-slate-950 rounded-lg overflow-hidden border border-slate-850 flex items-center justify-center p-3">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                    {species2.reconstructionImageUrl ? (
                      <img
                        src={species2.reconstructionImageUrl}
                        alt={species2.name}
                        className="max-w-full max-h-full object-contain rounded drop-shadow z-10"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">
                        No Image
                      </div>
                    )}
                  </div>

                  {(() => {
                    const names2 = getSpeciesDisplayNames(species2);
                    return (
                      <div>
                        <h3 className="text-lg font-black uppercase text-slate-100">{names2.heading}</h3>
                        <p className="text-xs italic font-serif text-amber-400">{names2.subheading}</p>
                      </div>
                    );
                  })()}

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Scale className="h-3 w-3" /> Length
                      </span>
                      <span className="font-extrabold text-blue-400">
                        {species2.lengthM ? `${species2.lengthM} m` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Scale className="h-3 w-3" /> Height
                      </span>
                      <span className="font-extrabold text-blue-400">
                        {species2.heightM ? `${species2.heightM} m` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Scale className="h-3 w-3" /> Mass
                      </span>
                      <span className="font-extrabold text-blue-400">
                        {species2.weightKg ? `${species2.weightKg.toLocaleString()} kg` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Era
                      </span>
                      <span className="font-bold text-slate-200">{species2.timePeriod}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Dna className="h-3 w-3" /> Clade
                      </span>
                      <span className="font-bold text-indigo-400">{formatClade(species2.clade)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Formation
                      </span>
                      <span className="font-bold text-slate-200">{species2.fossilFormation || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-500">
                  <p className="text-xs font-semibold">Select Species 2 above to compare side-by-side.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
