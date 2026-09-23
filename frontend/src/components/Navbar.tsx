import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Map, ArrowRightLeft, Menu, X, Scale, BookOpen, Trophy, Sparkles, Camera, ChevronDown } from 'lucide-react';
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
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsToolsDropdownOpen(false);
  }, [location.pathname]);

  // Handle outside click for tools dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-2 sm:gap-4">
            {/* Brand Logo and Title */}
            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
              <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
                <div id="navbar-logo-target" className="relative flex items-center justify-center">
                  <div
                    className={`transition-opacity duration-200 ${
                      isLogoVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <DinoLogoMark className="h-8 w-8 sm:h-9 sm:w-9 drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform duration-200" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-black tracking-wider text-slate-100 uppercase font-mono leading-none">
                      PREHISTORICA
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                    ARCHIVAL PAVILION
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 font-mono shrink min-w-0">
              <Link
                to="/"
                className={`hidden xl:inline-block px-2 py-1.5 rounded-md text-xs uppercase tracking-wider transition-all active:scale-95 ${isActive('/')}`}
              >
                Home
              </Link>
              <Link
                to="/browse"
                className={`flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-md text-xs uppercase tracking-wider transition-all active:scale-95 shrink-0 ${isActive('/browse')}`}
              >
                <Search className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Catalog</span>
              </Link>
              <Link
                to="/map"
                className={`flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-md text-xs uppercase tracking-wider transition-all active:scale-95 shrink-0 ${isActive('/map')}`}
              >
                <Map className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Time-Map</span>
              </Link>
              <Link
                to="/runway"
                className={`flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-md text-xs uppercase tracking-wider transition-all active:scale-95 shrink-0 ${isActive('/runway')}`}
              >
                <Scale className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Runway</span>
              </Link>
              <Link
                to="/challenge"
                className={`flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-md text-xs uppercase tracking-wider transition-all active:scale-95 shrink-0 ${isActive('/challenge')}`}
              >
                <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Trials</span>
              </Link>
              <Link
                to="/notebook"
                className={`flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-md text-xs uppercase tracking-wider transition-all active:scale-95 shrink-0 ${isActive('/notebook')}`}
              >
                <BookOpen className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Notebook</span>
                {bookmarkCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                    {bookmarkCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Desktop Right Side Search & Action Tools */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
              <div className="w-36 focus-within:w-52 xl:w-44 2xl:w-56 transition-all duration-300">
                <SearchAutocomplete />
              </div>

              {/* Research Lab & AI Tools Dropdown Menu */}
              <div className="relative pl-1 border-l border-white/[0.08]" ref={toolsDropdownRef}>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                  className={`h-8 xl:h-9 px-2.5 xl:px-3 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm select-none ${
                    isToolsDropdownOpen
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'bg-slate-900/90 hover:bg-slate-850 border-white/[0.08] hover:border-amber-500/40 text-slate-200 hover:text-white'
                  }`}
                  title="Open Research Lab Tools & AI Docents"
                  aria-expanded={isToolsDropdownOpen}
                  aria-haspopup="true"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="font-mono">Research Lab</span>
                  <span className="px-1 py-0.2 rounded text-[8px] sm:text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold uppercase">
                    AI
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 transition-transform duration-200 ${
                      isToolsDropdownOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </motion.button>

                {/* Dropdown Menu Popover with High-End Glassmorphism */}
                <AnimatePresence>
                  {isToolsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-slate-950/98 border border-white/[0.12] shadow-2xl p-2 z-50 divide-y divide-white/[0.06] backdrop-blur-2xl font-mono"
                    >
                      <div className="px-3 py-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center justify-between">
                        <span>Museum Research Lab</span>
                        <span className="text-amber-400">3 AI Tools</span>
                      </div>

                      <div className="py-1 space-y-1">
                        {/* Tool 1: Chief Curator */}
                        <button
                          onClick={() => {
                            setIsToolsDropdownOpen(false);
                            setIsCuratorOpen(true);
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/90 transition-colors flex items-start gap-3 group cursor-pointer"
                        >
                          <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 font-sans uppercase tracking-wider">
                                Chief Curator
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold">
                                RAG AI
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans leading-snug line-clamp-1 pt-0.5">
                              Evidence-grounded conversational docent
                            </p>
                          </div>
                        </button>

                        {/* Tool 2: Fossil Lens */}
                        <button
                          onClick={() => {
                            setIsToolsDropdownOpen(false);
                            setIsFossilLensOpen(true);
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/90 transition-colors flex items-start gap-3 group cursor-pointer"
                        >
                          <div className="h-8 w-8 rounded-lg bg-slate-900 border border-white/[0.1] flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                            <Camera className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 font-sans uppercase tracking-wider">
                                Fossil Lens
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-extrabold">
                                VISION
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans leading-snug line-clamp-1 pt-0.5">
                              Multimodal bone & fossil identifier
                            </p>
                          </div>
                        </button>

                        {/* Tool 3: Specimen Comparison */}
                        <button
                          onClick={() => {
                            setIsToolsDropdownOpen(false);
                            setIsCompareOpen(true);
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/90 transition-colors flex items-start gap-3 group cursor-pointer"
                        >
                          <div className="h-8 w-8 rounded-lg bg-slate-900 border border-white/[0.1] flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                            <ArrowRightLeft className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 font-sans uppercase tracking-wider">
                                Specimen Compare
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-extrabold">
                                1:1 STAGE
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans leading-snug line-clamp-1 pt-0.5">
                              Side-by-side metric caliper comparison
                            </p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Controls: Quick Actions & Hamburger Drawer */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
              <button
                onClick={() => setIsCuratorOpen(true)}
                className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] p-2 sm:p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                title="Chief Curator"
                aria-label="Open Chief Curator"
              >
                <Sparkles className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsCompareOpen(true)}
                className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-white/10 text-amber-400 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                title="Compare Tool"
                aria-label="Open Species Comparison Tool"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
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
              className="lg:hidden border-t border-white/[0.08] bg-slate-950/98 backdrop-blur-xl px-4 py-4 space-y-4 overflow-visible font-mono overscroll-contain shadow-2xl"
            >
              {/* Search Bar on Mobile */}
              <div className="w-full">
                <SearchAutocomplete />
              </div>

              {/* Navigation Links on Mobile */}
              <div className="space-y-1 text-xs uppercase tracking-wider pt-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-3 py-1">
                  Exhibition Pavilions
                </div>
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

                {/* AI Research Lab Tools Section */}
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-3 pt-3 pb-1 border-t border-white/[0.06]">
                  Research & AI Docent
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCuratorOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-amber-300 bg-amber-500/10 border border-amber-500/30 font-bold cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>The Chief Curator (AI Docent)</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsFossilLensOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-200 bg-slate-900 border border-white/10 font-bold cursor-pointer"
                >
                  <Camera className="h-4 w-4 text-amber-400" />
                  <span>Fossil Lens (AI Specimen Identifier)</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCompareOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-200 bg-slate-900 border border-white/10 font-bold cursor-pointer"
                >
                  <ArrowRightLeft className="h-4 w-4 text-amber-400" />
                  <span>Specimen Comparison Stage</span>
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
        title="Ask Rajy — AI Docent"
      >
        <img src="/curator-raja.jpg" alt="Rajy" className="w-6 h-6 rounded-full object-cover object-top" />
        <span className="hidden sm:inline text-xs uppercase tracking-wider font-bold">Ask Rajy</span>
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
