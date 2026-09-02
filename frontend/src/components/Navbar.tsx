import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Map, ArrowRightLeft, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchAutocomplete from './SearchAutocomplete.js';
import CompareModal from './CompareModal.js';
import DinoLogoMark from './DinoLogoMark.js';

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
      ? 'text-amber-400 border-b-2 border-amber-400 font-bold bg-amber-500/5'
      : 'text-slate-300 hover:text-white transition-colors';
  };

  const isMobileActive = (path: string) => {
    return location.pathname === path
      ? 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-400 font-bold'
      : 'text-slate-300 hover:bg-slate-900/80 hover:text-white';
  };

  return (
    <>
      <header className="glass-panel sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3 shrink-0 group">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                  <DinoLogoMark className="h-6 w-6 shrink-0 group-hover:scale-105 transition-transform" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg font-black tracking-wider text-slate-100 uppercase font-mono leading-none">
                      PREHISTORICA
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                    ARCHIVAL PAVILION
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex space-x-2 items-center font-mono">
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-md text-xs uppercase tracking-wider transition-colors ${isActive('/')}`}
                >
                  Home
                </Link>
                <Link
                  to="/browse"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs uppercase tracking-wider transition-colors ${isActive('/browse')}`}
                >
                  <Search className="h-3.5 w-3.5 text-amber-400" />
                  Browse Catalog
                </Link>
                <Link
                  to="/map"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs uppercase tracking-wider transition-colors ${isActive('/map')}`}
                >
                  <Map className="h-3.5 w-3.5 text-amber-400" />
                  Time-Map
                </Link>
              </nav>
            </div>

            {/* Desktop Right Side Search & Compare */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-52 md:w-64">
                <SearchAutocomplete />
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsCompareOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-white/[0.08] hover:border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider text-slate-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm"
                title="Compare 2 species side-by-side"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden lg:inline">Compare</span>
              </motion.button>
            </div>

            {/* Mobile Controls: Search & Hamburger Toggle */}
            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={() => setIsCompareOpen(true)}
                className="p-2 rounded-lg bg-slate-900 border border-white/10 text-amber-400 flex items-center justify-center cursor-pointer active:scale-95"
                title="Compare Tool"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-95"
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
              className="md:hidden border-t border-white/[0.08] bg-slate-950/98 px-4 py-4 space-y-4 overflow-hidden font-mono"
            >
              {/* Search Bar on Mobile */}
              <div className="w-full">
                <SearchAutocomplete />
              </div>

              {/* Navigation Links on Mobile */}
              <div className="space-y-1 text-xs uppercase tracking-wider pt-2">
                <Link
                  to="/"
                  className={`block px-3 py-2.5 rounded-lg transition-colors ${isMobileActive('/')}`}
                >
                  Home Pavilion
                </Link>
                <Link
                  to="/browse"
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${isMobileActive('/browse')}`}
                >
                  <Search className="h-4 w-4 text-amber-400" />
                  Browse Catalog
                </Link>
                <Link
                  to="/map"
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${isMobileActive('/map')}`}
                >
                  <Map className="h-4 w-4 text-amber-400" />
                  Interactive Time-Map
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Side-by-side Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />
    </>
  );
}
