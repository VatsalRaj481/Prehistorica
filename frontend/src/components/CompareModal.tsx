import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Species, fetchSpeciesCompare, fetchSpeciesRoster, SpeciesRosterItem, primeSpeciesCache } from '../services/api.js';
import { X, ArrowRightLeft, Scale, Calendar, Dna, MapPin, ChevronDown, Check, ExternalLink, BarChart2 } from 'lucide-react';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';
import { formatFeet } from '../utils/formatDimensions.js';
import { formatMass } from '../utils/formatMass.js';
import SpotlightCard from './SpotlightCard.js';

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

interface ComparativeMetricBarProps {
  label: string;
  name1: string;
  val1: number | null | undefined;
  display1: string;
  name2: string;
  val2: number | null | undefined;
  display2: string;
  shouldReduceMotion?: boolean | null;
}

function ComparativeMetricBar({
  label,
  name1,
  val1,
  display1,
  name2,
  val2,
  display2,
  shouldReduceMotion
}: ComparativeMetricBarProps) {
  const v1 = val1 && val1 > 0 ? val1 : 0;
  const v2 = val2 && val2 > 0 ? val2 : 0;
  const maxVal = Math.max(v1, v2, 0.001);
  const pct1 = Math.round((v1 / maxVal) * 100);
  const pct2 = Math.round((v2 / maxVal) * 100);

  let differenceBadge: string | null = null;
  if (v1 > 0 && v2 > 0) {
    if (v1 > v2) {
      const diffPct = Math.round(((v1 - v2) / v2) * 100);
      differenceBadge = `${name1} +${diffPct}%`;
    } else if (v2 > v1) {
      const diffPct = Math.round(((v2 - v1) / v1) * 100);
      differenceBadge = `${name2} +${diffPct}%`;
    } else {
      differenceBadge = 'Equal';
    }
  }

  return (
    <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/70 border border-white/[0.06] text-xs font-mono shadow-inner">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">{label}</span>
        {differenceBadge && (
          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
            {differenceBadge}
          </span>
        )}
      </div>

      <div className="space-y-2 pt-1">
        {/* Species 1 Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-amber-400 font-bold truncate max-w-[200px]">{name1}</span>
            <span className="text-slate-200 font-bold">{display1}</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/[0.04]">
            <motion.div
              initial={shouldReduceMotion ? false : { width: 0 }}
              animate={{ width: `${pct1}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
            />
          </div>
        </div>

        {/* Species 2 Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-sky-400 font-bold truncate max-w-[200px]">{name2}</span>
            <span className="text-slate-200 font-bold">{display2}</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/[0.04]">
            <motion.div
              initial={shouldReduceMotion ? false : { width: 0 }}
              animate={{ width: `${pct2}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DualSilhouetteStageProps {
  s1: Species;
  s2: Species;
  shouldReduceMotion?: boolean | null;
}

function DualSilhouetteStage({ s1, s2, shouldReduceMotion }: DualSilhouetteStageProps) {
  const safeL1 = s1.lengthM && s1.lengthM > 0 ? s1.lengthM : 6;
  const safeH1 = s1.heightM && s1.heightM > 0 ? s1.heightM : Math.max(1, safeL1 * 0.35);

  const safeL2 = s2.lengthM && s2.lengthM > 0 ? s2.lengthM : 6;
  const safeH2 = s2.heightM && s2.heightM > 0 ? s2.heightM : Math.max(1, safeL2 * 0.35);

  const gapM = 1.8;
  const totalSpanM = safeL1 + gapM + safeL2;
  const maxHM = Math.max(safeH1, safeH2, 1.8) * 1.25;

  const viewBoxW = 800;
  const viewBoxH = 220;
  const groundY = 175;
  const padX = 50;

  const availW = viewBoxW - padX * 2;
  const availH = groundY - 35;

  const scale = Math.min(availW / totalSpanM, availH / maxHM);

  const w1 = safeL1 * scale;
  const h1 = safeH1 * scale;
  const w2 = safeL2 * scale;
  const h2 = safeH2 * scale;

  const totalW = totalSpanM * scale;
  const startX = padX + (availW - totalW) / 2;

  const x1 = startX;
  const y1 = groundY - h1;

  const x2 = startX + w1 + gapM * scale;
  const y2 = groundY - h2;

  const s1Sil = s1.comparisonSilhouette?.url;
  const s2Sil = s2.comparisonSilhouette?.url;

  return (
    <div className="rounded-xl bg-slate-950/80 border border-white/[0.08] overflow-hidden shadow-inner font-mono text-xs">
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-amber-400" />
          <span className="font-bold text-slate-100 uppercase tracking-wide text-[11px] font-sans">
            Direct 1:1 Physical Scale Stage
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> {s1.name}
          </span>
          <span className="flex items-center gap-1.5 text-sky-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-sky-400" /> {s2.name}
          </span>
        </div>
      </div>

      <div className="relative h-56 w-full flex items-center justify-center p-2">
        <svg
          viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="modalAmberTint" colorInterpolationFilters="sRGB">
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.96
                        0 0 0 0 0.62
                        0 0 0 0 0.04
                        0 0 0 1 0"
              />
            </filter>
            <filter id="modalSkyTint" colorInterpolationFilters="sRGB">
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.22
                        0 0 0 0 0.74
                        0 0 0 0 0.97
                        0 0 0 1 0"
              />
            </filter>
          </defs>

          {/* Ground Baseline */}
          <line x1="20" y1={groundY} x2={viewBoxW - 20} y2={groundY} stroke="#334155" strokeWidth="1.5" />

          {/* Species 1 Silhouette */}
          <motion.g
            key={`s1-${s1.id}`}
            initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            transform={`translate(${x1}, ${y1})`}
          >
            {s1Sil ? (
              <image
                href={s1Sil}
                x="0"
                y="0"
                width={w1}
                height={h1}
                preserveAspectRatio="xMidYMax meet"
                filter="url(#modalAmberTint)"
              />
            ) : (
              <rect x="0" y="0" width={w1} height={h1} fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="1.2" rx="4" />
            )}
          </motion.g>

          {/* Species 2 Silhouette (facing left) */}
          <motion.g
            key={`s2-${s2.id}`}
            initial={shouldReduceMotion ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            transform={`translate(${x2 + w2}, ${y2}) scale(-1, 1)`}
          >
            {s2Sil ? (
              <image
                href={s2Sil}
                x="0"
                y="0"
                width={w2}
                height={h2}
                preserveAspectRatio="xMidYMax meet"
                filter="url(#modalSkyTint)"
              />
            ) : (
              <rect x="0" y="0" width={w2} height={h2} fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="1.2" rx="4" />
            )}
          </motion.g>

          {/* Labels & Calipers */}
          <text x={x1 + w1 / 2} y={groundY + 18} textAnchor="middle" fill="#FBBF24" fontSize="10" fontFamily="monospace" fontWeight="bold">
            {s1.name}: {safeL1}m
          </text>
          <text x={x2 + w2 / 2} y={groundY + 18} textAnchor="middle" fill="#38BDF8" fontSize="10" fontFamily="monospace" fontWeight="bold">
            {s2.name}: {safeL2}m
          </text>
        </svg>
      </div>
    </div>
  );
}

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
  const navigate = useNavigate();
  const [species1, setSpecies1] = useState<Species | null>(initialSpecies || null);
  const [species2, setSpecies2] = useState<Species | null>(null);
  const [availableList, setAvailableList] = useState<SpeciesRosterItem[]>([]);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleCardClick = (id: number) => {
    onClose();
    navigate(`/species/${id}`);
  };

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
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        >
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="bg-slate-900 border border-white/[0.08] rounded-2xl w-full max-w-4xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6 relative max-h-[92vh] sm:max-h-[90vh] overflow-y-auto font-mono"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 sm:pb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                <h2 className="text-sm sm:text-lg font-bold text-slate-100 font-sans uppercase tracking-tight">Species Comparison</h2>
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
                <SpotlightCard
                  onClick={() => handleCardClick(species1.id)}
                  spotlightColor="rgba(245, 158, 11, 0.08)"
                  className={`space-y-4 museum-card p-4 rounded-xl shadow-inner relative transition-all duration-200 cursor-pointer hover:border-amber-500/50 hover:bg-slate-900/60 group ${loading1 ? 'opacity-60 pointer-events-none' : ''}`}
                  title={`Click to view details for ${species1.name}`}
                >
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
                        className="max-w-full max-h-full object-contain drop-shadow z-10 group-hover:scale-[1.02] transition-transform duration-200"
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
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-black uppercase text-slate-100 font-sans tracking-tight group-hover:text-amber-400 transition-colors">
                            {names1.heading}
                          </h3>
                          <p className="text-xs italic font-mono text-amber-400">{names1.subheading}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0 mt-0.5" />
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
                </SpotlightCard>
              ) : (
                <div className="bg-slate-950/60 border border-white/[0.06] rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-500">
                  <p className="text-xs font-semibold font-sans">Select Species 1 above.</p>
                </div>
              )}

              {species2 ? (
                <SpotlightCard
                  onClick={() => handleCardClick(species2.id)}
                  spotlightColor="rgba(56, 189, 248, 0.08)"
                  className={`space-y-4 museum-card p-4 rounded-xl shadow-inner relative transition-all duration-200 cursor-pointer hover:border-sky-500/50 hover:bg-slate-900/60 group ${loading2 ? 'opacity-60 pointer-events-none' : ''}`}
                  title={`Click to view details for ${species2.name}`}
                >
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
                        className="max-w-full max-h-full object-contain drop-shadow z-10 group-hover:scale-[1.02] transition-transform duration-200"
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
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-black uppercase text-slate-100 font-sans tracking-tight group-hover:text-amber-400 transition-colors">
                            {names2.heading}
                          </h3>
                          <p className="text-xs italic font-mono text-amber-400">{names2.subheading}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0 mt-0.5" />
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
                </SpotlightCard>
              ) : (
                <div className="bg-slate-950/60 border border-white/[0.06] rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-500">
                  <p className="text-xs font-semibold font-sans">Select Species 2 above to compare side-by-side.</p>
                </div>
              )}
            </div>

            {/* When both species are loaded, render interactive comparative features */}
            {species1 && species2 && (
              <div className="space-y-5 pt-2 border-t border-white/[0.08]">
                {/* 1. Direct 1:1 Scale Silhouette Comparison Stage */}
                <DualSilhouetteStage
                  s1={species1}
                  s2={species2}
                  shouldReduceMotion={shouldReduceMotion}
                />

                {/* 2. Animated Comparative Metrics Breakdown */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    <BarChart2 className="h-4 w-4" />
                    <span>Comparative Metric Breakdown</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <ComparativeMetricBar
                      label="Total Length"
                      name1={species1.name}
                      val1={species1.lengthM}
                      display1={formatFeet(species1.lengthM)}
                      name2={species2.name}
                      val2={species2.lengthM}
                      display2={formatFeet(species2.lengthM)}
                      shouldReduceMotion={shouldReduceMotion}
                    />

                    <ComparativeMetricBar
                      label="Standing Height"
                      name1={species1.name}
                      val1={species1.heightM}
                      display1={formatFeet(species1.heightM)}
                      name2={species2.name}
                      val2={species2.heightM}
                      display2={formatFeet(species2.heightM)}
                      shouldReduceMotion={shouldReduceMotion}
                    />

                    <ComparativeMetricBar
                      label="Estimated Mass"
                      name1={species1.name}
                      val1={species1.weightKg}
                      display1={formatMass(species1.weightKg)}
                      name2={species2.name}
                      val2={species2.weightKg}
                      display2={formatMass(species2.weightKg)}
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
