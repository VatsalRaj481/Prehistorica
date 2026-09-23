import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { fetchSpeciesAutocomplete, fetchSemanticSearch, AutocompleteItem, SemanticSearchItem } from '../services/api.js';
import { Search, Loader2, Dna, ArrowRight, Sparkles } from 'lucide-react';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';

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
      setIsOpen(false);
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
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder={isSemanticMode ? 'Semantic query (e.g. sail-backed predators)...' : 'Search fauna, clade, era...'}
          className={`block w-full pl-8 pr-14 py-1.5 bg-slate-900/90 border rounded-lg text-xs placeholder-slate-500 text-slate-200 focus:outline-none transition-all font-mono ${
            isSemanticMode
              ? 'border-amber-500/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30'
              : 'border-white/[0.08] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30'
          }`}
        />

        {/* AI Semantic Search Toggle */}
        <button
          type="button"
          onClick={() => {
            setIsSemanticMode(!isSemanticMode);
            setSuggestions([]);
            setSemanticResults([]);
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

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-white/[0.04]">
          {isSemanticMode ? (
            // Semantic Results List
            semanticResults.length > 0 ? (
              <>
                <div className="px-3 py-1.5 bg-slate-950/80 text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>🧠 Semantic Vector Matches</span>
                  <span>pgvector Cosine</span>
                </div>
                {semanticResults.map((item) => (
                  <button
                    key={item.id}
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
                  </button>
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
            suggestions.map((item) => {
              const names = getSpeciesDisplayNames(item);
              return (
                <button
                  key={item.id}
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
                </button>
              );
            })
          )}

          <button
            onClick={handleSubmit}
            className="w-full p-2.5 bg-slate-950 text-center text-xs font-bold font-mono uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>
              {isSemanticMode
                ? `Explore semantic results for "${query}"`
                : `View all matches for "${query}"`}
            </span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
