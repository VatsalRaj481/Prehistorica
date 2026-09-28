import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fetchSpeciesAutocomplete, fetchSemanticSearch, AutocompleteItem, SemanticSearchItem } from '../services/api.js';
import { Search, Loader2, Dna, ArrowRight, Sparkles, Globe, Calendar, Scale, X, CornerDownLeft } from 'lucide-react';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';

interface ExampleQuery {
  text: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

// 4 distinct, non-overlapping paleobiological query dimensions
const EXAMPLE_QUERIES: ExampleQuery[] = [
  { text: 'crested and feathered theropods', category: 'Anatomy & Form', icon: Dna },
  { text: 'semi-aquatic ambush predators', category: 'Ecology & Niche', icon: Globe },
  { text: 'Late Cretaceous extinction horizon', category: 'Chronostratigraphy', icon: Calendar },
  { text: 'titanosaurs exceeding 30 meters', category: 'Scale & Biometrics', icon: Scale }
];

interface SearchAutocompleteProps {
  isMobileDrawer?: boolean;
}

export default function SearchAutocomplete({ isMobileDrawer = false }: SearchAutocompleteProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || searchParams.get('semantic') || '';

  const [query, setQuery] = useState(location.pathname === '/browse' ? urlSearch : '');
  const [isSemanticMode, setIsSemanticMode] = useState(Boolean(searchParams.get('semantic')));
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOverlayExpanded, setIsOverlayExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Detect coarse pointer (touch device) vs fine pointer (mouse/trackpad)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  // Sync search input state with URL search parameter
  useEffect(() => {
    if (location.pathname === '/browse') {
      setQuery(urlSearch);
      if (searchParams.get('semantic')) setIsSemanticMode(true);
    } else {
      setQuery('');
    }
  }, [location.pathname, urlSearch, searchParams]);

  // Global keyboard shortcut (⌘K or /) to focus search
  useEffect(() => {
    function handleGlobalKeyDown(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isMobileDrawer) {
          inputRef.current?.focus();
        } else {
          setIsOverlayExpanded(true);
          setIsOpen(true);
          setTimeout(() => overlayInputRef.current?.focus(), 50);
        }
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (isMobileDrawer) {
          inputRef.current?.focus();
        } else {
          setIsOverlayExpanded(true);
          setIsOpen(true);
          setTimeout(() => overlayInputRef.current?.focus(), 50);
        }
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isMobileDrawer]);

  // Close desktop overlay or mobile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isMobileDrawer) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      } else if (isOverlayExpanded) {
        if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
          setIsOverlayExpanded(false);
          setIsOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileDrawer, isOverlayExpanded]);

  // Reset active index when query or results shift
  useEffect(() => {
    setActiveIndex(-1);
  }, [query, isSemanticMode, suggestions, semanticResults]);

  // Fetch live autocomplete suggestions when query changes
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setSemanticResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);

      if (isSemanticMode) {
        fetchSemanticSearch(query, 6)
          .then((items) => {
            setSemanticResults(items);
            setIsOpen(true);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        fetchSpeciesAutocomplete(query)
          .then((items) => {
            setSuggestions(items);
            setIsOpen(true);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, isSemanticMode]);

  const handleSelect = useCallback((id: number) => {
    setIsOpen(false);
    setIsOverlayExpanded(false);
    setQuery('');
    navigate(`/species/${id}`);
  }, [navigate]);

  const handleSelectQuery = useCallback((text: string, forceAiMode = false) => {
    setQuery(text);
    setIsOpen(false);
    setIsOverlayExpanded(false);
    if (isSemanticMode || forceAiMode) {
      setIsSemanticMode(true);
      navigate(`/browse?semantic=${encodeURIComponent(text.trim())}`);
    } else {
      navigate(`/browse?search=${encodeURIComponent(text.trim())}`);
    }
  }, [isSemanticMode, navigate]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      setIsOverlayExpanded(false);
      if (isSemanticMode) {
        navigate(`/browse?semantic=${encodeURIComponent(query.trim())}`);
      } else {
        navigate(`/browse?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  // Keyboard navigation for dropdown (Up/Down/Enter/Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isShowingExamples = query.trim() === '';
    const currentListLength = isShowingExamples
      ? EXAMPLE_QUERIES.length
      : isSemanticMode
      ? semanticResults.length
      : suggestions.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (currentListLength > 0) {
        setActiveIndex((prev) => (prev + 1 >= currentListLength ? 0 : prev + 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (currentListLength > 0) {
        setActiveIndex((prev) => (prev <= 0 ? currentListLength - 1 : prev - 1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && activeIndex < currentListLength) {
        e.preventDefault();
        if (isShowingExamples) {
          handleSelectQuery(EXAMPLE_QUERIES[activeIndex].text, true);
        } else if (isSemanticMode) {
          handleSelect(semanticResults[activeIndex].id);
        } else {
          handleSelect(suggestions[activeIndex].id);
        }
      } else {
        handleSubmit(e);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      if (isOverlayExpanded) {
        setIsOverlayExpanded(false);
      }
    }
  };

  // Renders the suggestion listbox dropdown content
  const renderDropdownContent = () => {
    const isShowingExamples = query.trim() === '';

    return (
      <div
        id="search-dropdown-listbox"
        role="listbox"
        aria-label="Search suggestions"
        className="divide-y divide-white/[0.06] overflow-y-auto max-h-[70vh] overscroll-contain"
      >
        {isShowingExamples ? (
          // Example Queries Section (Visible ONLY when input is empty — clarified as AI Semantic Mode prompts)
          <div>
            <div className="px-3.5 py-2.5 bg-slate-950 text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Curated AI Inquiries</span>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400/40 text-[9px] font-mono font-bold text-amber-300">
                  AI Mode
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">
                {isTouchDevice ? 'Tap to run with AI' : 'Click to run with AI'}
              </span>
            </div>
            <div className="px-3.5 py-1.5 bg-slate-900/40 border-b border-white/[0.04] text-[10px] text-slate-400 font-sans flex items-center justify-between gap-2">
              <span className="truncate">Natural-language evolutionary and ecological prompts powered by pgvector AI search</span>
              <span className="text-[9px] font-mono text-amber-400/80 shrink-0 font-bold uppercase tracking-wider">Semantic Vector</span>
            </div>
            <div className="p-1.5 space-y-1">
              {EXAMPLE_QUERIES.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = activeIndex === idx;
                return (
                  <button
                    key={item.text}
                    id={`search-item-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => handleSelectQuery(item.text, true)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-slate-200 hover:text-white transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 ring-1 ring-amber-400/30'
                        : 'hover:bg-slate-900/90'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-amber-300' : 'text-amber-400/80 group-hover:text-amber-400'}`} />
                      <span className="text-xs font-sans font-medium truncate">
                        "{item.text}"
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-white/[0.06] text-amber-400/90 group-hover:border-amber-500/40 group-hover:text-amber-300 font-bold">
                        {item.category}
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                        AI
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : isSemanticMode ? (
          // Semantic Vector Search Matches
          semanticResults.length > 0 ? (
            <div>
              <div className="px-3.5 py-2 bg-slate-950 text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-white/[0.06]">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" /> AI Vector Matches
                </span>
                <span className="text-[9px] text-slate-500">pgvector Cosine</span>
              </div>
              <div className="p-1 space-y-0.5">
                {semanticResults.map((item, idx) => {
                  const isSelected = activeIndex === idx;
                  return (
                    <button
                      key={item.id}
                      id={`search-item-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center gap-2.5 group cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 text-white border border-amber-400/40 ring-1 ring-amber-400/30'
                          : 'hover:bg-slate-900/90 text-slate-200'
                      }`}
                    >
                      <div className="h-9 w-9 rounded-md bg-slate-950 border border-white/[0.08] overflow-hidden shrink-0 flex items-center justify-center">
                        {item.reconstructionImageUrl ? (
                          <img src={item.reconstructionImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Dna className="h-3.5 w-3.5 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-slate-100 group-hover:text-amber-400 transition-colors truncate font-sans">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 font-bold ml-2 shrink-0">
                            {item.similarity}%
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 italic font-mono truncate">
                          {item.scientificName} &bull; <span className="not-italic text-slate-400">{item.clade}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-amber-400 transition-colors shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : !loading ? (
            <div className="p-6 text-center text-xs text-slate-400 font-mono">
              No semantic matches found above threshold.
            </div>
          ) : null
        ) : (
          // Standard Exact/Keyword Autocomplete Results
          suggestions.length > 0 ? (
            <div className="p-1 space-y-0.5">
              {suggestions.map((item, idx) => {
                const names = getSpeciesDisplayNames(item);
                const isSelected = activeIndex === idx;
                return (
                  <button
                    key={item.id}
                    id={`search-item-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center gap-2.5 group cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 text-white border border-amber-400/40 ring-1 ring-amber-400/30'
                        : 'hover:bg-slate-900/90 text-slate-200'
                    }`}
                  >
                    <div className="h-9 w-9 rounded-md bg-slate-950 border border-white/[0.08] overflow-hidden shrink-0">
                      {item.reconstructionImageUrl ? (
                        <img src={item.reconstructionImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Dna className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-xs font-bold uppercase text-slate-100 group-hover:text-amber-400 transition-colors truncate font-sans">
                        {names.heading}
                      </div>
                      <div className="text-[10px] text-amber-400/90 italic font-mono truncate">
                        {names.subheading} &bull; <span className="text-slate-400 not-italic">{item.clade}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-amber-400 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : !loading && query.trim().length >= 2 ? (
            <div className="p-5 text-center text-xs text-slate-400 font-mono">
              No matching species found in archives.
            </div>
          ) : null
        )}

        {/* Bottom Search Execution Row */}
        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full p-2.5 bg-slate-950 text-center text-xs font-bold font-mono uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:bg-slate-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-t border-white/[0.06]"
          >
            <span>
              {isSemanticMode
                ? `Explore semantic results for "${query}"`
                : `View all matches for "${query}"`}
            </span>
            <CornerDownLeft className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────
  // 1. MOBILE DRAWER VARIANT (Full width inline row)
  // ──────────────────────────────────────────────────────────
  if (isMobileDrawer) {
    return (
      <div ref={wrapperRef} className="relative w-full font-mono">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {loading ? (
              <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
            ) : isSemanticMode ? (
              <Sparkles className="h-4 w-4 text-amber-400" />
            ) : (
              <Search className="h-4 w-4 text-slate-400" />
            )}
          </span>

          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="search-dropdown-listbox"
            aria-activedescendant={activeIndex >= 0 ? `search-item-${activeIndex}` : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search or ask AI…"
            className={`block w-full pl-9 pr-16 py-2.5 bg-slate-900/95 border rounded-xl text-xs placeholder-slate-400 text-slate-100 focus:outline-none transition-all font-mono shadow-inner ${
              isSemanticMode
                ? 'border-amber-500/60 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30'
                : 'border-white/[0.12] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30'
            }`}
          />

          {/* AI Toggle inside Search Input */}
          <button
            type="button"
            role="switch"
            aria-checked={isSemanticMode}
            aria-label="Toggle Semantic AI Search"
            title={isSemanticMode ? 'Semantic AI Search: ON (Click to switch to keyword search)' : 'Semantic AI Search: OFF (Click to enable AI semantic mode)'}
            onClick={() => {
              const nextMode = !isSemanticMode;
              setIsSemanticMode(nextMode);
              setSuggestions([]);
              setSemanticResults([]);
              setIsOpen(true);
            }}
            className={`absolute inset-y-1.5 right-1.5 px-2 rounded-lg flex items-center gap-1 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              isSemanticMode
                ? 'bg-amber-500 text-slate-950 border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)] ring-1 ring-amber-400'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
            }`}
          >
            <Sparkles className={`w-2.5 h-2.5 ${isSemanticMode ? 'text-slate-950' : 'text-slate-400'}`} />
            <span>AI</span>
            {isSemanticMode && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 ml-0.5" />}
          </button>
        </form>

        {/* Mobile Dropdown List */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="mt-2 w-full bg-slate-950/98 backdrop-blur-2xl border border-white/[0.14] rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-white/[0.04]"
            >
              {renderDropdownContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // 2. DESKTOP NAVBAR VARIANT (Compact static pill + Expanded Overlay)
  // ──────────────────────────────────────────────────────────
  return (
    <>
      {/* Static Default Compact Pill in Desktop Navbar (NEVER changes inline layout width) */}
      <div ref={wrapperRef} className="relative font-mono">
        <button
          type="button"
          onClick={() => {
            setIsOverlayExpanded(true);
            setIsOpen(true);
            setTimeout(() => overlayInputRef.current?.focus(), 60);
          }}
          className="h-8 xl:h-9 w-36 xl:w-44 px-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-white/[0.08] hover:border-amber-500/40 text-xs text-slate-300 hover:text-white flex items-center justify-between gap-1.5 transition-all cursor-pointer shadow-sm group select-none"
          title="Search species or ask AI (Press ⌘K or /)"
          aria-label="Open Search (Press ⌘K or /)"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-400 transition-colors shrink-0" />
            <span className="truncate text-slate-400 group-hover:text-slate-200 text-xs font-mono">
              {query || 'Search…'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isSemanticMode && (
              <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                AI
              </span>
            )}
            <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-800/80 rounded border border-white/[0.08]">
              /
            </kbd>
          </div>
        </button>
      </div>

      {/* Expanded Desktop Search Stage Overlay (High z-index with subtle backdrop) */}
      <AnimatePresence>
        {isOverlayExpanded && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-3 sm:pt-4 px-4">
            {/* Subtle Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                setIsOverlayExpanded(false);
                setIsOpen(false);
              }}
              className="fixed inset-0 bg-slate-950/65 backdrop-blur-[2px]"
            />

            {/* Overlay Search Modal Box */}
            <motion.div
              ref={overlayRef}
              initial={shouldReduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl bg-slate-950/98 backdrop-blur-2xl border border-amber-500/35 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(245,158,11,0.15)] overflow-hidden font-mono z-10"
            >
              <form onSubmit={handleSubmit} className="relative flex items-center p-3 sm:p-3.5 border-b border-white/[0.08] bg-slate-900/60">
                <span className="pl-1 pr-2.5 flex items-center pointer-events-none">
                  {loading ? (
                    <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
                  ) : isSemanticMode ? (
                    <Sparkles className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Search className="h-4 w-4 text-slate-400" />
                  )}
                </span>

                <input
                  ref={overlayInputRef}
                  type="text"
                  role="combobox"
                  aria-expanded={isOpen}
                  aria-autocomplete="list"
                  aria-controls="search-dropdown-listbox"
                  aria-activedescendant={activeIndex >= 0 ? `search-item-${activeIndex}` : undefined}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={() => setIsOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search or ask AI…"
                  className="flex-1 bg-transparent text-sm sm:text-base placeholder-slate-400 text-slate-100 focus:outline-none font-mono"
                />

                <div className="flex items-center gap-1.5 pl-2">
                  {/* AI Toggle Button */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isSemanticMode}
                    aria-label="Toggle Semantic AI Search"
                    title={isSemanticMode ? 'Semantic AI Search: ON (Click to switch to keyword search)' : 'Semantic AI Search: OFF (Click to enable AI semantic mode)'}
                    onClick={() => {
                      const nextMode = !isSemanticMode;
                      setIsSemanticMode(nextMode);
                      setSuggestions([]);
                      setSemanticResults([]);
                      setIsOpen(true);
                    }}
                    className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      isSemanticMode
                        ? 'bg-amber-500 text-slate-950 border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.45)] ring-1 ring-amber-400'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                    }`}
                  >
                    <Sparkles className={`w-3 h-3 ${isSemanticMode ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>AI Mode</span>
                    {isSemanticMode && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 ml-0.5" />}
                  </button>

                  {/* Close Overlay Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOverlayExpanded(false);
                      setIsOpen(false);
                    }}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title="Close Search (Esc)"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Render Dropdown Results inside the Overlay */}
              {renderDropdownContent()}

              {/* Footer Guide */}
              <div className="px-4 py-2 bg-slate-950/80 border-t border-white/[0.06] text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Navigation: <kbd className="px-1 py-0.2 bg-slate-900 border border-white/10 rounded">↑</kbd> <kbd className="px-1 py-0.2 bg-slate-900 border border-white/10 rounded">↓</kbd></span>
                  <span>Select: <kbd className="px-1 py-0.2 bg-slate-900 border border-white/10 rounded">↵</kbd></span>
                </div>
                <span>Close: <kbd className="px-1 py-0.2 bg-slate-900 border border-white/10 rounded">Esc</kbd></span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
