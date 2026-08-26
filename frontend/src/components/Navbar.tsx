import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Search, Map, ArrowRightLeft, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchAutocomplete from './SearchAutocomplete.js';
import CompareModal from './CompareModal.js';

export default function Navbar() {
  const location = useLocation();
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
      : 'text-slate-300 hover:text-white transition-colors';
  };

  const isMobileActive = (path: string) => {
    return location.pathname === path
      ? 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-400 font-bold'
      : 'text-slate-300 hover:bg-slate-900 hover:text-white';
  };

  return (
    <>
      <nav className="bg-slate-950/90 border-b border-slate-850 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 shrink-0">
                <Compass className="h-7 w-7 text-amber-500 animate-pulse shrink-0" />
                <span className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-400 bg-clip-text text-transparent uppercase font-mono">
                  PREHISTORICA
                </span>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex space-x-6 items-center font-mono">
                <Link
                  to="/"
                  className={`flex items-center gap-1.5 px-1 py-5 text-xs uppercase tracking-wider ${isActive('/')}`}
                >
                  Home
                </Link>
                <Link
                  to="/browse"
                  className={`flex items-center gap-1.5 px-1 py-5 text-xs uppercase tracking-wider ${isActive('/browse')}`}
                >
                  <Search className="h-3.5 w-3.5" />
                  Browse Catalog
                </Link>
                <Link
                  to="/map"
                  className={`flex items-center gap-1.5 px-1 py-5 text-xs uppercase tracking-wider ${isActive('/map')}`}
                >
                  <Map className="h-3.5 w-3.5" />
                  Time-Map
                </Link>
              </div>
            </div>

            {/* Desktop Right Side Search & Compare */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-52 md:w-64">
                <SearchAutocomplete />
              </div>

              <button
                onClick={() => setIsCompareOpen(true)}
                className="px-3 py-2 rounded-none bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold uppercase tracking-wider text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Compare 2 species side-by-side"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden lg:inline">Compare</span>
              </button>
            </div>

            {/* Mobile Controls: Search & Hamburger Toggle */}
            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={() => setIsCompareOpen(true)}
                className="p-2 rounded-none bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center cursor-pointer"
                title="Compare Tool"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-none bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
                title="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5 text-amber-400" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-850 bg-slate-950 px-4 py-4 space-y-4 overflow-hidden font-mono"
            >
              {/* Search Bar on Mobile */}
              <div className="w-full">
                <SearchAutocomplete />
              </div>

              {/* Navigation Links on Mobile */}
              <div className="space-y-1 text-xs uppercase tracking-wider pt-2">
                <Link
                  to="/"
                  className={`block px-3 py-2.5 rounded-none transition-colors ${isMobileActive('/')}`}
                >
                  Home Pavilion
                </Link>
                <Link
                  to="/browse"
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-none transition-colors ${isMobileActive('/browse')}`}
                >
                  <Search className="h-4 w-4 text-amber-500" />
                  Browse Catalog
                </Link>
                <Link
                  to="/map"
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-none transition-colors ${isMobileActive('/map')}`}
                >
                  <Map className="h-4 w-4 text-amber-500" />
                  Interactive Time-Map
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Side-by-side Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />
    </>
  );
}
