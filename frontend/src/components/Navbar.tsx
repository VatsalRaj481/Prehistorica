import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Map, ArrowRightLeft, Menu, X, Scale, BookOpen, Trophy, Sparkles, Camera, ChevronDown, Dna, Home } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useReducedMotion } from 'framer-motion';
import SearchAutocomplete from './SearchAutocomplete.js';
import CompareModal from './CompareModal.js';
import ChiefCuratorModal from './ChiefCuratorModal.js';
import FossilLensModal from './FossilLensModal.js';
import DinoLogoMark from './DinoLogoMark.js';
import { getBookmarkIds, NOTEBOOK_UPDATED_EVENT } from '../utils/notebookStorage.js';
import ShinyText from './reactbits/ShinyText.js';
import SlingButton from './reactbits/SlingButton.js';

interface NavbarProps {
  isLogoVisible?: boolean;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
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

  const shouldReduceMotion = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 24);
    });
  }, [scrollY]);

  const isMobileActive = (path: string) => {
    return location.pathname === path
      ? 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-400 font-bold'
      : 'text-slate-300 hover:bg-slate-900/80 hover:text-white';
  };

  // 6 core pavilion links comfortably fit down to 1140px on standard laptops
  const isCompactNav = useMediaQuery('(max-width: 1140px)');

  // Reading progress bar is meaningful only on long-scroll editorial & specimen profile pages
  const isEditorialRoute = location.pathname.startsWith('/species/') || location.pathname.startsWith('/editorial');

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/browse', label: 'Catalog', icon: Search },
    { to: '/cladogram', label: 'Tree of Life', icon: Dna },
    { to: '/map', label: 'Time-Map', icon: Map },
    { to: '/runway', label: 'Runway', icon: Scale },
    { to: '/notebook', label: 'Notebook', icon: BookOpen, badge: bookmarkCount }
  ];

  return (
    <>
      <header
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)'
        }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#080C16]/85 backdrop-blur-xl border-b border-amber-500/20 shadow-[0_12px_32px_rgba(0,0,0,0.7)]'
            : 'bg-[#080C16]/95 border-b border-white/[0.08] shadow-2xl'
        }`}
      >
        {/* Deep-Time Chronostratigraphic Reading Progress Bar (Editorial & Specimen views only) */}
        {!shouldReduceMotion && isEditorialRoute && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 origin-left z-50 pointer-events-none"
            style={{ scaleX: scrollYProgress }}
          />
        )}

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
                    <ShinyText
                      text="PREHISTORICA"
                      color="#F1F5F9"
                      shineColor="#FBBF24"
                      speed={3}
                      className="text-sm sm:text-base font-black tracking-wider uppercase font-mono leading-none"
                    />
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                    ARCHIVAL PAVILION
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links with Gliding Plinth */}
            <nav className="hidden lg:flex items-center gap-1 font-sans shrink min-w-0">
              {navLinks.map((link) => {
                const active = location.pathname === link.to;
                const IconComponent = link.icon;
                const showLabel = !isCompactNav || active;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    title={showLabel ? undefined : link.label}
                    aria-label={link.label}
                    className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-colors duration-200 active:scale-95 shrink-0 ${
                      active ? 'text-amber-300 font-bold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeNavPill"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute inset-0 rounded-lg bg-amber-500/15 border border-amber-500/35 -z-10 shadow-[0_0_14px_rgba(245,158,11,0.2)]"
                      />
                    )}
                    {IconComponent && <IconComponent className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                    {showLabel ? (
                      <span>{link.label}</span>
                    ) : (
                      /* Zero-lag instant micro-tooltip for compact viewports */
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900/95 border border-white/10 text-amber-300 text-[10px] font-sans font-semibold tracking-wide whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-xl z-50">
                        {link.label}
                      </span>
                    )}
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] font-mono">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right Side Search & Action Tools */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
              <SearchAutocomplete isMobileDrawer={false} />

              {/* Pavilion Lab & Interactive Tools Dropdown Menu */}
              <div className="relative pl-1 border-l border-white/[0.08]" ref={toolsDropdownRef}>
                <button
                  onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                  className={`h-8 xl:h-9 px-2.5 xl:px-3 rounded-lg border text-xs font-sans font-semibold tracking-wide flex items-center gap-1.5 transition-all cursor-pointer shadow-sm select-none ${
                    isToolsDropdownOpen
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'bg-slate-900/90 hover:bg-slate-850 border-white/[0.08] hover:border-amber-500/40 text-slate-200 hover:text-white'
                  }`}
                  title="Pavilion Lab & Tools"
                  aria-expanded={isToolsDropdownOpen}
                  aria-haspopup="true"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Lab & Tools</span>
                  <ChevronDown
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 transition-transform duration-200 ${
                      isToolsDropdownOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu Popover with High-End Glassmorphism */}
                <AnimatePresence>
                  {isToolsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-76 rounded-xl bg-slate-950/98 border border-white/[0.12] shadow-2xl p-2 z-50 divide-y divide-white/[0.06] backdrop-blur-2xl font-sans"
                    >
                      <div className="px-3 py-2 text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold flex items-center justify-between">
                        <span>Interactive Pavilion Lab</span>
                        <span className="text-amber-400 font-mono">4 Tools</span>
                      </div>

                      <div className="py-1 space-y-1">
                        {/* Tool 1: Side-by-Side Specimen Comparison */}
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
                              <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 font-sans tracking-wide">
                                Specimen Compare
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-extrabold">
                                STAGE
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans leading-snug line-clamp-1 pt-0.5">
                              Dual-specimen metric caliper comparison
                            </p>
                          </div>
                        </button>

                        {/* Tool 2: Fossil Lens Vision Identifier */}
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
                              <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 font-sans tracking-wide">
                                Fossil Lens
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold">
                                VISION AI
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans leading-snug line-clamp-1 pt-0.5">
                              Multimodal bone & fossil identifier
                            </p>
                          </div>
                        </button>

                        {/* Tool 3: Curator Trials Challenges */}
                        <Link
                          to="/challenge"
                          onClick={() => setIsToolsDropdownOpen(false)}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/90 transition-colors flex items-start gap-3 group cursor-pointer"
                        >
                          <div className="h-8 w-8 rounded-lg bg-slate-900 border border-white/[0.1] flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                            <Trophy className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 font-sans tracking-wide">
                                Curator Trials
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-extrabold">
                                QUIZ
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans leading-snug line-clamp-1 pt-0.5">
                              Paleobiological accreditation & mastery
                            </p>
                          </div>
                        </Link>

                        {/* Tool 4: Chief Curator / Rajy */}
                        <button
                          onClick={() => {
                            setIsToolsDropdownOpen(false);
                            setIsCuratorOpen(true);
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-900/90 transition-colors flex items-start gap-3 group cursor-pointer"
                        >
                          <div className="h-8 w-8 rounded-lg overflow-hidden border border-amber-500/40 shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                            <img src="/rajy-head.jpg" alt="Rajy" className="w-full h-full object-cover object-top" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-100 group-hover:text-amber-300 font-sans tracking-wide">
                                Ask Rajy
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Controls: Search & Hamburger Toggle (Uncluttered layout) */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-200 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                title="Toggle Navigation Menu"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-amber-400" />
                ) : (
                  <>
                    <Menu className="h-5 w-5 text-slate-300" />
                    <span className="text-xs font-sans font-medium text-slate-300">Menu</span>
                  </>
                )}
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
              style={{
                paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)'
              }}
              className="lg:hidden border-t border-white/[0.08] bg-slate-950/98 backdrop-blur-xl px-4 py-4 space-y-4 overflow-visible font-mono overscroll-contain shadow-2xl"
            >
              {/* Search Bar on Mobile - Full width row */}
              <div className="w-full">
                <SearchAutocomplete isMobileDrawer={true} />
              </div>

              {/* Navigation Links on Mobile */}
              <div className="space-y-1 text-xs pt-1 font-sans">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono px-3 py-1">
                  Exhibition Pavilions
                </div>
                <Link
                  to="/"
                  className={`block px-3 py-2.5 rounded-lg transition-colors font-medium ${isMobileActive('/')}`}
                >
                  Home Pavilion
                </Link>
                <Link
                  to="/browse"
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors font-medium ${isMobileActive('/browse')}`}
                >
                  <Search className="h-4 w-4 text-amber-400" />
                  <span>Browse Catalog</span>
                </Link>
                <Link
                  to="/cladogram"
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors font-medium ${isMobileActive('/cladogram')}`}
                >
                  <Dna className="h-4 w-4 text-amber-400" />
                  <span>Tree of Life (Cladogram)</span>
                </Link>
                <Link
                  to="/map"
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors font-medium ${isMobileActive('/map')}`}
                >
                  <Map className="h-4 w-4 text-amber-400" />
                  <span>Interactive Time-Map</span>
                </Link>
                <Link
                  to="/runway"
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors font-medium ${isMobileActive('/runway')}`}
                >
                  <Scale className="h-4 w-4 text-amber-400" />
                  <span>Caliper Runway</span>
                </Link>
                <Link
                  to="/notebook"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors font-medium ${isMobileActive('/notebook')}`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-400" />
                    <span>Field Notebook</span>
                  </div>
                  {bookmarkCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] font-mono">
                      {bookmarkCount}
                    </span>
                  )}
                </Link>

                {/* Interactive Pavilion Lab Tools */}
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono px-3 pt-3 pb-1 border-t border-white/[0.06]">
                  Interactive Pavilion Lab
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCompareOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-200 bg-slate-900 border border-white/10 font-medium cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4 text-amber-400" />
                    <span>Specimen Comparison Stage</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">STAGE</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsFossilLensOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-200 bg-slate-900 border border-white/10 font-medium cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-amber-400" />
                    <span>Fossil Lens (Bone Identifier)</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">VISION AI</span>
                </button>

                <Link
                  to="/challenge"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-200 bg-slate-900 border border-white/10 font-medium cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span>Curator Trials (Challenge)</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">QUIZ</span>
                </Link>

                {/* Featured AI Docent Hero Card */}
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono px-3 pt-3 pb-1 border-t border-white/[0.06]">
                  Chief Curator AI
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCuratorOpen(true);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left bg-gradient-to-r from-amber-500/15 to-slate-900/90 border border-amber-500/40 cursor-pointer active:scale-98 transition-transform shadow-lg"
                >
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-amber-400/60 shrink-0 shadow-md">
                    <img src="/rajy-head.jpg" alt="Rajy" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 font-sans tracking-wide">
                        Ask Rajy
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                        ONLINE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-tight pt-0.5 line-clamp-1">
                      Evidence-grounded conversational docent
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Floating Chief Curator Docent Launcher (Sling Button) — hidden when modal or drawer is open */}
      <AnimatePresence>
        {!isCuratorOpen && !isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center"
          >
            <SlingButton
              onClick={() => setIsCuratorOpen(true)}
              tooltipText="Ask Rajy • AI Docent"
              ariaLabel="Open Rajy AI Docent"
              className="w-13 h-13 sm:w-14 sm:h-14 p-0.5 bg-slate-900/95 border-2 border-amber-500/50 hover:border-amber-400 shadow-[0_8px_25px_rgba(0,0,0,0.7),0_0_20px_rgba(245,158,11,0.22)]"
              badgeContent={
                <div className="relative flex items-center justify-center">
                  <span
                    className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-md ring-1 ring-slate-950"
                    title="AI Docent ready"
                  >
                    ✦
                  </span>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-950"
                    title="Rajy online"
                  />
                </div>
              }
            >
              <img
                src="/rajy-head.jpg"
                alt="Rajy AI Docent"
                className="w-full h-full object-cover object-top select-none pointer-events-none"
                draggable={false}
              />
            </SlingButton>
          </motion.div>
        )}
      </AnimatePresence>

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
