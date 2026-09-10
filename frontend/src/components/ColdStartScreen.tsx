import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import DinoLogoMark from './DinoLogoMark.js';

interface ColdStartScreenProps {
  isWaking: boolean;
  onWakeComplete?: () => void;
  simulateDurationSeconds?: number;
}

interface CuratorialPaleofact {
  logNo: string;
  species: string;
  subheading: string;
  formation: string;
  period: string;
  mass: string;
  length: string;
  habitat: string;
  fact: string;
}

interface FlyCoordinates {
  sourceLeft: number;
  sourceTop: number;
  sourceWidth: number;
  sourceHeight: number;
  targetLeft: number;
  targetTop: number;
  targetWidth: number;
  targetHeight: number;
}

// 🛡️ CRITICAL INVARIANT: CONTENT LOCKED — PRESERVED 100% UNTOUCHED
const PALEOFACTS: CuratorialPaleofact[] = [
  {
    logNo: '084',
    species: 'Spinosaurus aegyptiacus',
    subheading: 'Semi-aquatic megatheropod with pachyostotic bone ballast',
    formation: 'Kem Kem Beds, Cenomanian Stage',
    period: 'Late Cretaceous (99–93.5 MYA)',
    mass: '7,400 kg',
    length: '14.0 m',
    habitat: 'Fluvial / Mangrove Delta',
    fact: 'Dense, marrow-filled pachyostotic limb bones provided negative buoyancy ballast for sustained submerged swimming and riverbed bottom-walking.'
  },
  {
    logNo: '112',
    species: 'Stegosaurus stenops',
    subheading: 'Thyreophoran armored herbivore with vascularized dorsal osteoderms',
    formation: 'Morrison Formation, Brushy Basin Member',
    period: 'Late Jurassic (155–150 MYA)',
    mass: '3,800 kg',
    length: '7.0 m',
    habitat: 'Semi-arid Floodplains',
    fact: 'Dorsal plates were alternating dermal osteoderms laced with vascular blood channels for thermoregulation and threat display, terminating in a four-spiked thagomizer.'
  },
  {
    logNo: '206',
    species: 'Dunkleosteus terrelli',
    subheading: 'Apex arthrodire placoderm with self-sharpening gnathal blades',
    formation: 'Cleveland Shale, Ohio, USA',
    period: 'Late Devonian (382–358 MYA)',
    mass: '3,600 kg',
    length: '8.8 m',
    habitat: 'Epipelagic Open Marine',
    fact: 'Lacked true teeth; four-bar linkage jaw kinematics snapped razor-sharp dermal bone plates together in 20 milliseconds, delivering 5,300 Newtons of crushing force.'
  },
  {
    logNo: '341',
    species: 'Argentinosaurus huinculensis',
    subheading: 'Colossal titanosaurian sauropod of the Neuquén Basin',
    formation: 'Huincul Formation, Patagonia, Argentina',
    period: 'Late Cretaceous (96–92 MYA)',
    mass: '75,000 kg',
    length: '35.0 m',
    habitat: 'Wooded River Basins',
    fact: 'Single dorsal vertebrae measured over 1.59 meters in height, supported by pneumatic internal honeycomb chambers to drastically reduce skeletal weight.'
  },
  {
    logNo: '492',
    species: 'Geosternbergia maysei',
    subheading: 'Pteranodontid pterosaur with exaggerated sexual dimorphic cranial crest',
    formation: 'Niobrara Formation, Smoky Hill Chalk Member',
    period: 'Late Cretaceous (88–80.5 MYA)',
    mass: '28 kg',
    length: '3.0 m (7.2m Wingspan)',
    habitat: 'Western Interior Seaway Coastal',
    fact: 'Dynamic soarer utilizing marine thermal updrafts; the vertical upright cranial crest served as an aerodynamic rudder and acoustic display sail.'
  },
  {
    logNo: '559',
    species: 'Nanaimoteuthis haggarti',
    subheading: 'Giant coleoid cephalopod — the Cretaceous Kraken of British Columbia',
    formation: 'Haslam Formation, Vancouver Island',
    period: 'Late Cretaceous (85.8–83.6 MYA)',
    mass: '800 kg',
    length: '10.0 m',
    habitat: 'Deep Pacific Marine Forearc Basin',
    fact: 'Described in 2026 as the largest known Mesozoic cephalopod, possessing a heavily reinforced chitinous gladius exceeding 2.2 meters in length.'
  }
];

export default function ColdStartScreen({
  isWaking,
  onWakeComplete,
  simulateDurationSeconds
}: ColdStartScreenProps) {
  const [progress, setProgress] = useState(14);
  const [factIndex, setFactIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [canBypass, setCanBypass] = useState(false);
  const [exitPhase, setExitPhase] = useState<'idle' | 'collapsing' | 'zooming'>('idle');
  const [flyCoords, setFlyCoords] = useState<FlyCoordinates | null>(null);
  const crestLogoRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Rotate Curatorial Paleofacts every 5.5s
  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % PALEOFACTS.length);
    }, 5500);
    return () => clearInterval(factInterval);
  }, []);

  // Keyboard shortcut listener (Space or Enter bypasses directly once allowed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'Enter') && (canBypass || progress >= 85 || isFinishing)) {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Enable bypass invitation after 5.5 seconds
  useEffect(() => {
    const bypassTimer = setTimeout(() => {
      setCanBypass(true);
    }, 5500);
    return () => clearTimeout(bypassTimer);
  }, []);

  // Completion sequence: measure navbar logo position, launch strata expansion & logo flight
  const handleFinish = useCallback(() => {
    if (isFinishing) return;
    setIsFinishing(true);
    setProgress(100);

    // Calculate exact flight coordinates from current crest to navbar logo
    const targetEl = document.getElementById('navbar-logo-target');
    const sourceEl = crestLogoRef.current;

    if (targetEl && sourceEl) {
      const targetRect = targetEl.getBoundingClientRect();
      const sourceRect = sourceEl.getBoundingClientRect();
      setFlyCoords({
        sourceLeft: sourceRect.left,
        sourceTop: sourceRect.top,
        sourceWidth: sourceRect.width,
        sourceHeight: sourceRect.height,
        targetLeft: targetRect.left,
        targetTop: targetRect.top,
        targetWidth: targetRect.width,
        targetHeight: targetRect.height
      });
    } else {
      const fallbackTargetLeft = Math.max(16, (window.innerWidth - 1280) / 2 + 16);
      setFlyCoords({
        sourceLeft: window.innerWidth * 0.28,
        sourceTop: window.innerHeight * 0.45,
        sourceWidth: 80,
        sourceHeight: 80,
        targetLeft: fallbackTargetLeft,
        targetTop: 14,
        targetWidth: 40,
        targetHeight: 40
      });
    }

    setExitPhase('collapsing');

    const flyTimer = setTimeout(() => {
      setExitPhase('zooming');
    }, 220);

    const exitTimer = setTimeout(() => {
      if (onWakeComplete) onWakeComplete();
    }, 220 + 850);

    return () => {
      clearTimeout(flyTimer);
      clearTimeout(exitTimer);
    };
  }, [isFinishing, onWakeComplete]);

  // Smooth progressive preparation towards 100% across the display duration
  useEffect(() => {
    const targetDuration = simulateDurationSeconds || 2;
    const intervalTime = 30;
    const totalSteps = (targetDuration * 1000) / intervalTime;
    const stepIncrement = (100 - 14) / totalSteps;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + stepIncrement);
      });
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [simulateDurationSeconds]);

  // Max fail-safe auto unlock after 18 seconds (bypassed in preview mode)
  useEffect(() => {
    const isPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('coldstart') === 'true';
    if (isPreview) return;
    const autoUnlockTimeout = setTimeout(() => {
      handleFinish();
    }, 18000);
    return () => clearTimeout(autoUnlockTimeout);
  }, [handleFinish]);

  // When backend wakes up, complete cleanly
  useEffect(() => {
    if (!isWaking && !isFinishing) {
      handleFinish();
    }
  }, [isWaking, isFinishing, handleFinish]);

  const currentFact = PALEOFACTS[factIndex];

  // Curatorial preparation status message
  const preparationStatusText = useMemo(() => {
    if (progress < 35) return 'Illuminating exhibition galleries...';
    if (progress < 70) return 'Arranging the deep-time specimen collection...';
    if (progress < 96) return 'Opening archival exhibition spaces...';
    return 'Exhibition galleries prepared for your arrival.';
  }, [progress]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: exitPhase === 'zooming' ? 0 : 1 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[9999] bg-[#080C16] flex flex-col justify-between p-4 sm:p-6 md:p-8 overflow-y-auto select-none text-slate-300 font-sans"
      >
        {/* Atmospheric Museum Gallery Lighting */}
        <div className="absolute inset-0 bg-fossil-grid opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_45%,_rgba(217,119,6,0.09)_0%,_transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(251,191,36,0.03)_0%,_transparent_70%)] pointer-events-none" />

        {/* Delicate Museum Inset Perimeter Border */}
        <div className="absolute inset-2 sm:inset-3 rounded-2xl border border-white/[0.04] pointer-events-none" />

        {/* Top Header Bar: Museum Institutional Masthead */}
        <motion.header
          animate={{ opacity: exitPhase === 'idle' ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/15 pb-4 text-xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 font-['Cinzel',serif] tracking-widest text-[11px] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>PREHISTORICA PAVILION</span>
            </div>
            <span className="text-slate-400 hidden md:inline text-[11px] tracking-wide">
              MUSEUM OF NATURAL HISTORY &bull; DEEP-TIME ARCHIVES
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-medium tracking-wide">Galleries Preparing to Open</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline text-amber-400/90 font-['Cinzel',serif] text-[11px] tracking-wider font-semibold">
              541 Million Years of Natural History
            </span>
          </div>
        </motion.header>

        {/* Center Exhibition Stage: Museum Identity & Curatorial Dossier */}
        <main className="relative z-10 max-w-5xl mx-auto w-full my-auto py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Museum Identity & Deep-Time Geological Strata Rings */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              {/* Concentric Geological Strata & Sedimentary Horizons */}
              <motion.div
                animate={
                  exitPhase === 'zooming'
                    ? { scale: 1.45, opacity: 0 }
                    : shouldReduceMotion
                    ? { opacity: 0.7 }
                    : {
                        scale: [1, 1.025, 1],
                        opacity: [0.65, 0.85, 0.65]
                      }
                }
                transition={
                  exitPhase === 'zooming'
                    ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                    : { duration: 9, repeat: Infinity, ease: 'easeInOut' }
                }
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                {/* Outer Deep-Time Strata Boundary */}
                <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-amber-500/15 shadow-[0_0_30px_rgba(217,119,6,0.06)]" />

                {/* Mesozoic Sedimentary Horizon */}
                <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-amber-400/20" />

                {/* Paleozoic Fossil Horizon */}
                <div className="absolute w-34 h-34 sm:w-40 sm:h-40 rounded-full border border-amber-500/25" />

                {/* Ambient Deep-Time Geological Glow */}
                <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-amber-600/10 via-amber-500/15 to-transparent blur-xl" />
              </motion.div>

              {/* Central Museum Monogram Crest */}
              <motion.div
                animate={
                  exitPhase !== 'idle'
                    ? { opacity: 0 }
                    : shouldReduceMotion
                    ? {}
                    : { scale: [1, 1.02, 1] }
                }
                transition={
                  exitPhase !== 'idle'
                    ? { duration: 0.2 }
                    : { duration: 5, repeat: Infinity, ease: 'easeInOut' }
                }
                className="relative z-10 flex items-center justify-center"
              >
                {/* Crest Container with Ref for Exact Coordinate Flight */}
                <div
                  ref={crestLogoRef}
                  style={{ opacity: flyCoords && exitPhase !== 'idle' ? 0 : 1 }}
                  className="flex items-center justify-center"
                >
                  <DinoLogoMark className="h-28 w-28 sm:h-32 sm:w-32 drop-shadow-[0_4px_28px_rgba(245,158,11,0.45)]" />
                </div>
              </motion.div>
            </div>

            <motion.div
              animate={{ opacity: exitPhase === 'idle' ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1.5 max-w-xs mx-auto"
            >
              <h1 className="text-2xl sm:text-3xl font-bold tracking-widest text-slate-100 uppercase font-['Cinzel',serif]">
                PREHISTORICA
              </h1>
              <p className="text-xs tracking-widest text-amber-400 uppercase font-['Cinzel',serif] font-semibold">
                Museum Archive Pavilion
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                A permanent digital pavilion cataloging 540 million years of natural history and prehistoric life.
              </p>
            </motion.div>
          </div>

          {/* Right Column: Museum Preparation & Curatorial Specimen Dossier */}
          <motion.div
            animate={
              exitPhase === 'idle'
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 12 }
            }
            transition={{ duration: 0.25 }}
            className="lg:col-span-7 space-y-5"
          >
            {/* Museum Preparation Indicator */}
            <div className="bg-[#0E1526] rounded-xl p-4 sm:p-5 border border-white/[0.08] shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-amber-400" />
                  <span className="font-['Cinzel',serif] font-semibold tracking-wider uppercase text-slate-200 text-xs">
                    Exhibition Preparation
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium">Preparation:</span>
                  <span className="text-amber-400 font-bold tabular-nums">
                    {Math.min(100, Math.round(progress))}%
                  </span>
                </div>
              </div>

              {/* Minimal Elegant Gold Progress Bar */}
              <div className="relative h-1.5 w-full bg-[#080C16] rounded-full overflow-hidden border border-white/[0.06]">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${Math.min(100, progress)}%` }}
                  transition={{ ease: 'easeOut', duration: 0.15 }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="italic text-slate-300">
                  {preparationStatusText}
                </span>
                <span className="hidden sm:inline text-amber-400/80 font-['Cinzel',serif] text-[10px] tracking-widest uppercase">
                  Deep-Time Archives
                </span>
              </div>
            </div>

            {/* Curatorial Collection Record Plaque */}
            <div className="bg-[#0E1526] rounded-xl p-5 sm:p-6 border border-amber-500/20 shadow-2xl space-y-4 relative overflow-hidden">
              {/* Subtle Gilded Corner Bracket Accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-500/40 rounded-tl-sm pointer-events-none" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500/40 rounded-tr-sm pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-500/40 rounded-bl-sm pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-500/40 rounded-br-sm pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={factIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Plaque Header: Pure Museum Archival Label */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3 text-[10px] uppercase tracking-widest text-amber-400">
                    <span className="flex items-center gap-1.5 font-['Cinzel',serif] font-semibold">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>CURATORIAL COLLECTION RECORD</span>
                    </span>
                    <span className="text-slate-400 text-[11px] tracking-wider">
                      RECORD {factIndex + 1} OF {PALEOFACTS.length}
                    </span>
                  </div>

                  {/* Species Title, Period & Geological Formation */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-100 font-['Cinzel',serif] italic">
                        {currentFact.species}
                      </h2>
                      <span className="text-xs text-amber-400 font-medium tracking-wide">
                        ({currentFact.period})
                      </span>
                    </div>

                    <p className="text-xs text-amber-300/80 italic">
                      {currentFact.subheading}
                    </p>

                    <p className="text-xs text-slate-400 pt-0.5">
                      Geological Formation: <strong className="text-slate-200 font-medium">{currentFact.formation}</strong>
                    </p>
                  </div>

                  {/* Metric Dimensions Plaque Strip */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-[#080C16] p-3 rounded-lg border border-white/[0.06] text-center">
                    <div>
                      <span className="text-[9px] font-['Cinzel',serif] tracking-wider text-slate-400 uppercase block mb-0.5 font-semibold">
                        Estimated Mass
                      </span>
                      <span className="text-amber-400 font-bold text-sm tracking-tight tabular-nums">
                        {currentFact.mass}
                      </span>
                    </div>
                    <div className="border-x border-white/[0.08]">
                      <span className="text-[9px] font-['Cinzel',serif] tracking-wider text-slate-400 uppercase block mb-0.5 font-semibold">
                        Total Length
                      </span>
                      <span className="text-amber-400 font-bold text-sm tracking-tight tabular-nums">
                        {currentFact.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-['Cinzel',serif] tracking-wider text-slate-400 uppercase block mb-0.5 font-semibold">
                        Paleo-Habitat
                      </span>
                      <span className="text-slate-200 font-semibold text-xs truncate block pt-0.5">
                        {currentFact.habitat}
                      </span>
                    </div>
                  </div>

                  {/* Curatorial Anatomical Observation */}
                  <div className="relative pl-4 border-l-2 border-amber-500/70 py-0.5">
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{currentFact.fact}"
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Curatorial Carousel Dots */}
              <div className="flex items-center justify-end gap-1.5 pt-1">
                {PALEOFACTS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFactIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      factIndex === idx
                        ? 'w-5 bg-amber-400'
                        : 'w-1.5 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`View specimen record ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </main>

        {/* Bottom Footer & Visitor Entry Action */}
        <motion.footer
          animate={{ opacity: exitPhase === 'idle' ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-amber-500/15 pt-4 text-xs"
        >
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span className="text-amber-400 text-sm">◆</span>
            <span>Galleries open automatically once preparation is complete.</span>
          </div>

          {/* Visitor Call To Action */}
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {(canBypass || isFinishing || progress >= 85) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFinish}
                  id="begin-visit-btn"
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold uppercase tracking-widest text-xs font-['Cinzel',serif] flex items-center gap-2.5 shadow-[0_4px_24px_rgba(217,119,6,0.35)] transition-all cursor-pointer"
                >
                  <span>Begin Your Visit</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.footer>
      </motion.div>

      {/* Hero Flight Transition: Logo zooms out and glides directly to the exact Navbar position */}
      {flyCoords && exitPhase !== 'idle' && (
        <motion.div
          initial={{
            position: 'fixed',
            left: flyCoords.sourceLeft,
            top: flyCoords.sourceTop,
            width: flyCoords.sourceWidth,
            height: flyCoords.sourceHeight,
            zIndex: 10001,
            pointerEvents: 'none'
          }}
          animate={
            exitPhase === 'zooming'
              ? {
                  left: flyCoords.targetLeft,
                  top: flyCoords.targetTop,
                  width: flyCoords.targetWidth,
                  height: flyCoords.targetHeight
                }
              : {
                  left: flyCoords.sourceLeft,
                  top: flyCoords.sourceTop,
                  width: flyCoords.sourceWidth,
                  height: flyCoords.sourceHeight
                }
          }
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="flex items-center justify-center pointer-events-none"
        >
          <img
            src="/logo.png"
            alt="Prehistorica Museum Crest"
            className="w-full h-full object-contain drop-shadow-[0_2px_14px_rgba(245,158,11,0.45)]"
          />
        </motion.div>
      )}
    </>
  );
}
