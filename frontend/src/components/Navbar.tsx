import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Map, ArrowRightLeft, Menu, X, Scale, BookOpen, Trophy, Sparkles, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchAutocomplete from './SearchAutocomplete.js';
import CompareModal from './CompareModal.js';
import ChiefCuratorModal from './ChiefCuratorModal.js';
import FossilLensModal from './FossilLensModal.js';
import DinoLogoMark from './DinoLogoMark.js';
import { getBookmarkIds, NOTEBOOK_UPDATED_EVENT } from '../utils/notebookStorage.js';

interface NavbarProps {
  isLogoVisible?: boolean;
}

export default function Navbar({ isLogoVisible = true }: NavbarProps) {
  const location = useLocation();
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCuratorOpen, setIsCuratorOpen] = useState(false);
  const [isFossilLensOpen, setIsFossilLensOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Sync bookmark count
  useEffect(() => {
    const updateCount = () => {
      setBookmarkCount(getBookmarkIds().length);
    };
    updateCount();
    window.addEventListener(NOTEBOOK_UPDATED_EVENT, updateCount);
    return () => window.removeEventListener(NOTEBOOK_UPDATED_EVENT, updateCount);
  }, []);

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
      <header className="bg-slate-950 sticky top-0 z-50 border-b border-white/[0.08] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3 shrink-0 group">
                <div id="navbar-logo-target" className="relative flex items-center justify-center">
                  <div
                    className={`transition-opacity duration-200 ${
                      isLogoVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <DinoLogoMark className="h-9 w-9 sm:h-10 sm:w-10 drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform duration-200" />
                  </div>
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
              <nav className="hidden lg:flex space-x-1.5 items-center font-mono">
                <Link
                  to="/"
                  className={`px-2.5 py-1.5 rounded-md text-xs uppercase tracking-wider transition-all active:scale-95 ${isActive('/')}`}
                >
                  Home
                </Link>
                <Link
                  to="/browse"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs uppercase tracking-wider transition-all active:scale-95 ${isActive('/browse')}`}
                >
                  <Search className="h-3.5 w-3.5 text-amber-400" />
                  Catalog
                </Link>
                <Link
                  to="/map"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs uppercase tracking-wider transition-all active:scale-95 ${isActive('/map')}`}
                >
                  <Map className="h-3.5 w-3.5 text-amber-400" />
                  Time-Map
                </Link>
                <Link
                  to="/runway"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs uppercase tracking-wider transition-all active:scale-95 ${isActive('/runway')}`}
                >
                  <Scale className="h-3.5 w-3.5 text-amber-400" />
                  Runway
                </Link>
                <Link
                  to="/challenge"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs uppercase tracking-wider transition-all active:scale-95 ${isActive('/challenge')}`}
                >
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  Trials
                </Link>
                <Link
                  to="/notebook"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs uppercase tracking-wider transition-all active:scale-95 ${isActive('/notebook')}`}
                >
                  <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                  Notebook
                  {bookmarkCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                      {bookmarkCount}
                    </span>
                  )}
                </Link>
              </nav>
            </div>

            {/* Desktop Right Side Search & Compare */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-52 xl:w-60">
                <SearchAutocomplete />
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsCuratorOpen(true)}
                className="px-3 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
                title="Consult The Chief Curator (Grounded AI Docent)"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Curator</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsFossilLensOpen(true)}
                className="px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-white/[0.08] hover:border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
                title="Identify Fossil Specimens & Bones"
              >
                <Camera className="h-3.5 w-3.5 text-amber-400" />
                <span>Fossil Lens</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsCompareOpen(true)}
                className="px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-white/[0.08] hover:border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
                title="Compare 2 species side-by-side"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
                <span>Compare</span>
              </motion.button>
            </div>

            {/* Mobile Controls: Curator, Compare & Hamburger Toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsCuratorOpen(true)}
                className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                title="Chief Curator"
                aria-label="Open Chief Curator"
              >
                <Sparkles className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsCompareOpen(true)}
                className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900 border border-white/10 text-amber-400 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                title="Compare Tool"
                aria-label="Open Species Comparison Tool"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                title="Toggle Menu"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5 text-amber-400" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer with Critically Damped Spring */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="lg:hidden border-t border-white/[0.08] bg-slate-950/98 px-4 py-4 space-y-4 overflow-visible font-mono overscroll-contain"
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
                <Link
                  to="/runway"
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${isMobileActive('/runway')}`}
                >
                  <Scale className="h-4 w-4 text-amber-400" />
                  Caliper Runway
                </Link>
                <Link
                  to="/challenge"
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${isMobileActive('/challenge')}`}
                >
                  <Trophy className="h-4 w-4 text-amber-400" />
                  Curator Trials
                </Link>
                <Link
                  to="/notebook"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${isMobileActive('/notebook')}`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-400" />
                    <span>Field Notebook</span>
                  </div>
                  {bookmarkCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                      {bookmarkCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCuratorOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-300 bg-amber-500/10 border border-amber-500/30 font-bold"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>The Chief Curator (AI Docent)</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsFossilLensOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-200 bg-slate-900 border border-white/10 font-bold"
                >
                  <Camera className="h-4 w-4 text-amber-400" />
                  <span>Fossil Lens (AI Identifier)</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Floating Chief Curator Docent Launcher */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCuratorOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-2xl shadow-amber-500/40 border border-amber-400 font-mono font-black flex items-center gap-2 cursor-pointer group"
        title="Consult The Chief Curator"
      >
        <Sparkles className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline text-xs uppercase tracking-wider font-bold">Ask Curator</span>
      </motion.button>

      {/* Side-by-side Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />

      {/* Chief Curator RAG Modal */}
      <ChiefCuratorModal
        isOpen={isCuratorOpen}
        onClose={() => setIsCuratorOpen(false)}
      />

      {/* Fossil Lens Modal */}
      <FossilLensModal
        isOpen={isFossilLensOpen}
        onClose={() => setIsFossilLensOpen(false)}
      />
    </>
  );
}
