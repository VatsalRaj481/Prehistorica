import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { fetchSpeciesAutocomplete, AutocompleteItem } from '../services/api.js';
import { Search, Loader2, Dna, ArrowRight } from 'lucide-react';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';

export default function SearchAutocomplete() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [query, setQuery] = useState(location.pathname === '/browse' ? urlSearch : '');
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync search input state with URL search parameter
  useEffect(() => {
    if (location.pathname === '/browse') {
      setQuery(urlSearch);
    } else {
      setQuery('');
    }
  }, [location.pathname, urlSearch]);

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
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetchSpeciesAutocomplete(query)
        .then((items) => {
          setSuggestions(items);
          setIsOpen(true);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (id: number) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/species/${id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/browse?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full sm:max-w-xs md:max-w-sm font-mono">
      <form onSubmit={handleSubmit} className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin" />
          ) : (
            <Search className="h-3.5 w-3.5 text-slate-500" />
          )}
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search fauna, clade, era..."
          className="block w-full pl-8 pr-3 py-1.5 bg-slate-900/90 border border-white/[0.08] rounded-lg text-xs placeholder-slate-500 text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
        />
      </form>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-white/[0.04]">
          {suggestions.map((item) => {
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
          })}
          <button
            onClick={handleSubmit}
            className="w-full p-2.5 bg-slate-950 text-center text-xs font-bold font-mono uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View all matches for "{query}"</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

