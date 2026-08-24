import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Search, Map, ArrowRightLeft } from 'lucide-react';
import SearchAutocomplete from './SearchAutocomplete.js';
import CompareModal from './CompareModal.js';

export default function Navbar() {
  const location = useLocation();
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-blue-400 border-b-2 border-blue-400 font-semibold'
      : 'text-slate-300 hover:text-white transition-colors';
  };

  return (
    <>
      <nav className="bg-slate-900/85 border-b border-slate-850 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2">
                <Compass className="h-8 w-8 text-blue-500 animate-pulse" />
                <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  PREHISTORICA
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex space-x-6 items-center">
                <Link
                  to="/"
                  className={`flex items-center gap-1.5 px-1 py-5 text-sm font-medium ${isActive('/')}`}
                >
                  Home
                </Link>
                <Link
                  to="/browse"
                  className={`flex items-center gap-1.5 px-1 py-5 text-sm font-medium ${isActive('/browse')}`}
                >
                  <Search className="h-4 w-4" />
                  Browse Catalog
                </Link>
                <Link
                  to="/map"
                  className={`flex items-center gap-1.5 px-1 py-5 text-sm font-medium ${isActive('/map')}`}
                >
                  <Map className="h-4 w-4" />
                  Interactive Time-Map
                </Link>
              </div>
            </div>

            {/* Right side Autocomplete search & Compare Modal trigger */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <SearchAutocomplete />
              </div>

              <button
                onClick={() => setIsCompareOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Compare 2 species side-by-side"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-blue-400" />
                <span className="hidden lg:inline">Compare Tool</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side-by-side Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />
    </>
  );
}

