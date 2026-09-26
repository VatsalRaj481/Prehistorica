import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fetchSpeciesAutocomplete, fetchSemanticSearch, AutocompleteItem, SemanticSearchItem } from '../services/api.js';
import { Search, Loader2, Dna, ArrowRight, Sparkles, Globe, Calendar } from 'lucide-react';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';

interface ExampleQuery {
  text: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const EXAMPLE_QUERIES: ExampleQuery[] = [
  { text: 'giant armored fish', category: 'Anatomy', icon: Dna },
  { text: 'crested theropods', category: 'Morphology', icon: Sparkles },
  { text: 'semi-aquatic predators', category: 'Ecology', icon: Globe },
  { text: 'Late Cretaceous titan', category: 'Era & Scale', icon: Calendar }
];

export default function SearchAutocomplete() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || searchParams.get('semantic') || '';

  const [query, setQuery] = useState(location.pathname === '/browse' ? urlSearch : '');
  const [isSemanticMode, setIsSemanticMode] = useState(Boolean(searchParams.get('semantic')));
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Sync search input state with URL search parameter
  useEffect(() => {
    if (location.pathname === '/browse') {
      setQuery(urlSearch);
      if (searchParams.get('semantic')) setIsSemanticMode(true);
    } else {
      setQuery('');
    }
  }, [location.pathname, urlSearch, searchParams]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setSemanticResults([]);
      if (!isSemanticMode) {
        setIsOpen(false);
      }
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
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isSemanticMode]);

  const handleSelect = (id: number) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/species/${id}`);
  };

  const handleSelectQuery = (text: string) => {
    setQuery(text);
    setIsOpen(false);
    if (isSemanticMode) {
      navigate(`/browse?semantic=${encodeURIComponent(text.trim())}`);
    } else {
      navigate(`/browse?search=${encodeURIComponent(text.trim())}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      if (isSemanticMode) {
        navigate(`/browse?semantic=${encodeURIComponent(query.trim())}`);
      } else {
        navigate(`/browse?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full sm:max-w-xs md:max-w-sm font-mono">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin" />
          ) : isSemanticMode ? (
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Search className="h-3.5 w-3.5 text-slate-500" />
          )}
        </span>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2 || isSemanticMode) {
              setIsOpen(true);
            }
          }}
          placeholder={isSemanticMode ? 'e.g. sail-backed predators of the Permian...' : 'Search fauna, clade, era...'}
          className={`block w-full pl-8 pr-14 py-1.5 bg-slate-900/90 border rounded-lg text-xs placeholder-slate-400 text-slate-200 focus:outline-none transition-all font-mono ${
            isSemanticMode
              ? 'border-amber-500/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30'
              : 'border-white/[0.08] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30'
          }`}
        />

        {/* AI Semantic Search Toggle */}
        <button
          type="button"
          onClick={() => {
            const nextMode = !isSemanticMode;
            setIsSemanticMode(nextMode);
            setSuggestions([]);
            setSemanticResults([]);
            if (nextMode) {
              setIsOpen(true);
            }
          }}
          className={`absolute inset-y-1 right-1 px-1.5 rounded flex items-center gap-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
            isSemanticMode
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title={isSemanticMode ? 'Switch to Exact Name Search' : 'Switch to 🧠 AI Semantic Search'}
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>AI</span>
        </button>
      </form>

      {/* Semantic mode hint — clickable pills under search input when dropdown is closed */}
      {isSemanticMode && !query && !isOpen && (
        <div className="hidden sm:flex absolute left-0 right-0 top-full mt-1.5 items-center gap-1.5 z-30">
          <span className="text-[9px] font-mono text-amber-500/80 flex items-center gap-1 shrink-0 select-none">
            <Sparkles className="w-2.5 h-2.5 shrink-0" /> Try:
          </span>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {EXAMPLE_QUERIES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.text}
                  type="button"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04, ease: 'easeOut' }}
                  onClick={() => handleSelectQuery(item.text)}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900/95 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-[9px] font-mono text-amber-300 hover:text-amber-200 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                  title={`Search: "${item.text}" (${item.category})`}
                >
                  <Icon className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                  <span className="truncate max-w-[120px]">"{item.text}"</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Autocomplete / Suggestions Dropdown List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute top-full left-0 w-72 sm:w-80 mt-2 bg-slate-950/98 backdrop-blur-xl border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-white/[0.04]"
          >
            {isSemanticMode && query.trim().length < 2 ? (
              // Example Queries Section in Semantic Mode
              <div>
                <div className="px-3 py-2 bg-slate-950/90 text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-white/[0.06]">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Example AI Queries
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">Tap to Search</span>
                </div>
                <div className="p-1.5 space-y-1">
                  {EXAMPLE_QUERIES.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.text}
                        type="button"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.25,
                          delay: idx * 0.04,
                          ease: 'easeOut'
                        }}
                        onClick={() => handleSelectQuery(item.text)}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-900/90 text-slate-200 hover:text-white transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="h-3.5 w-3.5 text-amber-400/80 group-hover:text-amber-400 shrink-0" />
                          <span className="text-xs font-sans font-medium truncate">
                            "{item.text}"
                          </span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-white/[0.06] text-amber-400/90 group-hover:border-amber-500/40 group-hover:text-amber-300 font-bold shrink-0 ml-2">
                          {item.category}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : isSemanticMode ? (
              // Semantic Vector Results List
              semanticResults.length > 0 ? (
                <>
                  <div className="px-3 py-1.5 bg-slate-950/80 text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center justify-between">
                    <span>🧠 Semantic Vector Matches</span>
                    <span>pgvector Cosine</span>
                  </div>
                  {semanticResults.map((item, idx) => (
                    <motion.button
                      key={item.id}
                      type="button"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: idx * 0.04,
                        ease: 'easeOut'
                      }}
                      onClick={() => handleSelect(item.id)}
                      className="w-full text-left p-2.5 hover:bg-slate-800/80 transition-colors flex items-center gap-2.5 group cursor-pointer"
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
                    </motion.button>
                  ))}
                </>
              ) : !loading ? (
                <div className="p-4 text-center text-xs text-slate-400 font-mono">
                  No semantic matches above threshold.
                </div>
              ) : null
            ) : (
              // Standard Autocomplete Results List
              suggestions.length > 0 &&
              suggestions.map((item, idx) => {
                const names = getSpeciesDisplayNames(item);
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: idx * 0.04,
                      ease: 'easeOut'
                    }}
                    onClick={() => handleSelect(item.id)}
                    className="w-full text-left p-2.5 hover:bg-slate-800/80 transition-colors flex items-center gap-2.5 group cursor-pointer"
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
                  </motion.button>
                );
              })
            )}

            {query.trim().length > 0 && (
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full p-2.5 bg-slate-950 text-center text-xs font-bold font-mono uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>
                  {isSemanticMode
                    ? `Explore semantic results for "${query}"`
                    : `View all matches for "${query}"`}
                </span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
