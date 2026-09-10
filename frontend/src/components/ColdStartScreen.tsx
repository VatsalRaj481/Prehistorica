import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';
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

  // Transition sequence:
  // 'idle' -> 'completing' (Step 1) -> 'fading-prep' (Step 2) -> 'receding-record' (Step 3) -> 'illuminating' (Step 4) -> 'expanding' (Step 5) -> 'zooming' (Step 6 & 7)
  const [exitPhase, setExitPhase] = useState<
    'idle' | 'completing' | 'fading-prep' | 'receding-record' | 'illuminating' | 'expanding' | 'zooming'
  >('idle');

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

  // Cinematic 7-Step Transition Sequence
  const handleFinish = useCallback(() => {
    if (isFinishing) return;
    setIsFinishing(true);
    setProgress(100);

    // Measure exact navbar target coordinates for continuous flight
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

    // STEP 1: Exhibition preparation reaches completion (100% progress, status shows ready)
    setExitPhase('completing');

    // STEP 2: Exhibition Preparation section softly fades and becomes visually secondary
    const t2 = setTimeout(() => {
      setExitPhase('fading-prep');
    }, 180);

    // STEP 3: Curatorial Collection Record gently recedes with soft fade and minimal downward movement
    const t3 = setTimeout(() => {
      setExitPhase('receding-record');
    }, 380);

    // STEP 4: PREHISTORICA emblem becomes visual anchor, strata rings illuminate warmly
    const t4 = setTimeout(() => {
      setExitPhase('illuminating');
    }, 620);

    // STEP 5: Deep-Time rings slowly expand outward, opening sedimentary layers around visitor
    const t5 = setTimeout(() => {
      setExitPhase('expanding');
    }, 840);

    // STEP 6 & 7: Reveal Home Screen progressively while emblem glides to navbar
    const t6 = setTimeout(() => {
      setExitPhase('zooming');
    }, 1040);

    const t7 = setTimeout(() => {
      if (onWakeComplete) onWakeComplete();
    }, 1040 + 850);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
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

  // When backend wakes up or display timer triggers, complete transition
  useEffect(() => {
    if (!isWaking && !isFinishing) {
      handleFinish();
    }
  }, [isWaking, isFinishing, handleFinish]);

  const currentFact = PALEOFACTS[factIndex];

  // Atmospheric museum preparation status message
  const preparationStatusText = useMemo(() => {
    if (progress < 30) return 'Illuminating exhibition galleries...';
    if (progress < 70) return 'Preparing the galleries for discovery...';
    if (progress < 98) return 'Opening archival exhibition spaces...';
    return 'Exhibition galleries prepared for your arrival.';
  }, [progress]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: exitPhase === 'zooming' ? 0 : 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
          animate={
            exitPhase === 'idle' || exitPhase === 'completing'
              ? { opacity: 1 }
              : exitPhase === 'fading-prep'
              ? { opacity: 0.5 }
              : { opacity: 0 }
          }
          transition={{ duration: 0.3 }}
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

        {/* Center Exhibition Stage: Museum Identity & Curatorial Showcase */}
        <main className="relative z-10 max-w-5xl mx-auto w-full my-auto py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Museum Identity & Deep-Time Geological Strata Rings */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Geological Strata & Sedimentary Horizon Rings */}
              <motion.div
                animate={
                  exitPhase === 'expanding' || exitPhase === 'zooming'
                    ? { scale: 1.55, opacity: 0 }
                    : exitPhase === 'illuminating'
                    ? { scale: 1.05, opacity: 1 }
                    : shouldReduceMotion
                    ? { opacity: 0.8 }
                    : {
                        scale: [1, 1.02, 1],
                        opacity: [0.75, 0.9, 0.75]
                      }
                }
                transition={
                  exitPhase === 'expanding' || exitPhase === 'zooming'
                    ? { duration: 0.85, ease: [0.16, 1, 0.3, 1] }
                    : exitPhase === 'illuminating'
                    ? { duration: 0.3, ease: 'easeOut' }
                    : { duration: 8, repeat: Infinity, ease: 'easeInOut' }
                }
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <svg
                  viewBox="0 0 320 320"
                  className="w-64 h-64 sm:w-72 sm:h-72 overflow-visible select-none"
                  fill="none"
                >
                  <defs>
                    <radialGradient id="deepTimeCoreGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
                      <stop offset="45%" stopColor="#D97706" stopOpacity="0.08" />
                      <stop offset="75%" stopColor="#B45309" stopOpacity="0.02" />
                      <stop offset="100%" stopColor="#080C16" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Ambient Deep-Time Core Glow */}
                  <circle cx="160" cy="160" r="140" fill="url(#deepTimeCoreGlow)" />

                  {/* Strata Horizon IV: Deepest Precambrian Sedimentary Horizon */}
                  <ellipse
                    cx="160"
                    cy="160"
                    rx="146"
                    ry="143"
                    stroke="#F59E0B"
                    strokeOpacity="0.14"
                    strokeWidth="1"
                    strokeDasharray="160 10 40 8 90 14"
                    transform="rotate(-8 160 160)"
                  />

                  {/* Strata Horizon III: Paleozoic Marine Contour Layer */}
                  <ellipse
                    cx="160"
                    cy="160"
                    rx="122"
                    ry="125"
                    stroke="#FBBF24"
                    strokeOpacity="0.18"
                    strokeWidth="1.1"
                    strokeDasharray="220 12 70 10"
                    transform="rotate(12 160 160)"
                  />

                  {/* Strata Horizon II: Mesozoic Terrestrial Excavation Horizon */}
                  <ellipse
                    cx="160"
                    cy="160"
                    rx="98"
                    ry="96"
                    stroke="#F59E0B"
                    strokeOpacity="0.24"
                    strokeWidth="1.2"
                    strokeDasharray="140 8 50 6 80 10"
                    transform="rotate(-4 160 160)"
                  />

                  {/* Strata Horizon I: Cenozoic Excavation Boundary */}
                  <ellipse
                    cx="160"
                    cy="160"
                    rx="76"
                    ry="78"
                    stroke="#FDE68A"
                    strokeOpacity="0.3"
                    strokeWidth="1"
                    transform="rotate(6 160 160)"
                  />

                  {/* Geological Stratigraphic Horizon Scale Ticks */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    const x1 = 160 + Math.cos(rad) * 142;
                    const y1 = 160 + Math.sin(rad) * 142;
                    const x2 = 160 + Math.cos(rad) * 150;
                    const y2 = 160 + Math.sin(rad) * 150;
                    return (
                      <line
                        key={deg}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#F59E0B"
                        strokeOpacity="0.2"
                        strokeWidth="1"
                      />
                    );
                  })}
                </svg>
              </motion.div>

              {/* Central Unboxed Museum Monogram Crest */}
              <motion.div
                animate={
                  exitPhase === 'zooming'
                    ? { opacity: 0 }
                    : shouldReduceMotion
                    ? {}
                    : { scale: [1, 1.02, 1] }
                }
                transition={
                  exitPhase === 'zooming'
                    ? { duration: 0.2 }
                    : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
                }
                className="relative z-10 flex items-center justify-center"
              >
                {/* Crest Container with Ref for Exact Coordinate Flight */}
                <div
                  ref={crestLogoRef}
                  style={{ opacity: flyCoords && exitPhase === 'zooming' ? 0 : 1 }}
                  className="flex items-center justify-center"
                >
                  <DinoLogoMark className="h-28 w-28 sm:h-32 sm:w-32 drop-shadow-[0_4px_30px_rgba(245,158,11,0.5)]" />
                </div>
              </motion.div>
            </div>

            <motion.div
              animate={
                exitPhase === 'idle' || exitPhase === 'completing' || exitPhase === 'fading-prep'
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 6 }
              }
              transition={{ duration: 0.3 }}
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

          {/* Right Column: Exhibition Preparation (Secondary) & Curatorial Record (Dominant) */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Integrated Museum Exhibition Preparation Prologue (Secondary & Atmospheric) */}
            <motion.div
              animate={
                exitPhase === 'idle'
                  ? { opacity: 1, y: 0 }
                  : exitPhase === 'completing'
                  ? { opacity: 0.7, y: 0 }
                  : { opacity: 0, y: -6 }
              }
              transition={{ duration: 0.3 }}
              className="px-1 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Compass className="h-3.5 w-3.5 text-amber-400/90" />
                  <span className="font-['Cinzel',serif] tracking-widest text-[11px] uppercase text-slate-300 font-semibold">
                    Exhibition Preparation
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-['Cinzel',serif] text-[10px] tracking-wider uppercase hidden sm:inline">
                    Galleries Opening
                  </span>
                  <span className="text-amber-400 font-bold tabular-nums text-xs font-mono">
                    {Math.min(100, Math.round(progress))}%
                  </span>
                </div>
              </div>

              {/* Minimal Gilded Museum Horizon Indicator */}
              <div className="relative h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  style={{ width: `${Math.min(100, progress)}%` }}
                  transition={{ ease: 'easeOut', duration: 0.15 }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans pt-0.5">
                <span className="italic text-slate-300/90 text-[11px]">
                  {preparationStatusText}
                </span>
                <span className="hidden sm:inline text-amber-400/70 font-['Cinzel',serif] text-[10px] tracking-widest uppercase">
                  Deep-Time Archives
                </span>
              </div>
            </motion.div>

            {/* 2. Curatorial Collection Record (Primary Dominant Visual Feature) */}
            <motion.div
              animate={
                exitPhase === 'idle' || exitPhase === 'completing' || exitPhase === 'fading-prep'
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 12, scale: 0.98 }
              }
              transition={{ duration: 0.35 }}
              className="bg-gradient-to-b from-[#0E1526] to-[#0A0F1B] rounded-xl p-5 sm:p-6 border border-amber-500/25 shadow-[0_12px_40px_rgba(0,0,0,0.55)] space-y-4 relative overflow-hidden"
            >
              {/* Subtle Archival Gilded Corner Brackets */}
              <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500/40 rounded-tl-sm pointer-events-none" />
              <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500/40 rounded-tr-sm pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/40 rounded-bl-sm pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500/40 rounded-br-sm pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={factIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Archival Record Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/15 pb-3 text-[10px] uppercase tracking-widest text-amber-400">
                    <span className="flex items-center gap-1.5 font-['Cinzel',serif] font-semibold">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>CURATORIAL COLLECTION RECORD</span>
                    </span>
                    <span className="text-slate-400 text-[11px] tracking-wider font-mono">
                      RECORD {factIndex + 1} OF {PALEOFACTS.length}
                    </span>
                  </div>

                  {/* Species Title, Period & Formation */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-wide text-slate-100 font-['Cinzel',serif] italic">
                        {currentFact.species}
                      </h2>
                      <span className="text-xs sm:text-sm text-amber-400 font-medium tracking-wide">
                        ({currentFact.period})
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-amber-300/85 italic leading-relaxed">
                      {currentFact.subheading}
                    </p>

                    <p className="text-xs text-slate-400 pt-0.5 font-sans">
                      Geological Formation: <strong className="text-slate-200 font-medium">{currentFact.formation}</strong>
                    </p>
                  </div>

                  {/* Metric Dimensions Plaque Strip */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-[#060A12]/80 p-3.5 rounded-lg border border-amber-500/15 text-center">
                    <div>
                      <span className="text-[9px] font-['Cinzel',serif] tracking-wider text-slate-400 uppercase block mb-0.5 font-semibold">
                        Estimated Mass
                      </span>
                      <span className="text-amber-400 font-bold text-sm sm:text-base tracking-tight tabular-nums">
                        {currentFact.mass}
                      </span>
                    </div>
                    <div className="border-x border-amber-500/15">
                      <span className="text-[9px] font-['Cinzel',serif] tracking-wider text-slate-400 uppercase block mb-0.5 font-semibold">
                        Total Length
                      </span>
                      <span className="text-slate-100 font-bold text-sm sm:text-base tracking-tight tabular-nums">
                        {currentFact.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-['Cinzel',serif] tracking-wider text-slate-400 uppercase block mb-0.5 font-semibold">
                        Paleo-Habitat
                      </span>
                      <span className="text-slate-200 font-semibold text-xs sm:text-sm truncate block pt-0.5">
                        {currentFact.habitat}
                      </span>
                    </div>
                  </div>

                  {/* Curatorial Anatomical Observation */}
                  <div className="relative pl-4 border-l-2 border-amber-500/70 py-1">
                    <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed italic">
                      "{currentFact.fact}"
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Curatorial Specimen Indicators */}
              <div className="flex items-center justify-end gap-1.5 pt-1">
                {PALEOFACTS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFactIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      factIndex === idx
                        ? 'w-5 bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                        : 'w-1.5 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`View specimen record ${idx + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </main>

        {/* Bottom Footer & Visitor Entry Action */}
        <motion.footer
          animate={
            exitPhase === 'idle' || exitPhase === 'completing'
              ? { opacity: 1 }
              : { opacity: 0 }
          }
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
      {flyCoords && exitPhase === 'zooming' && (
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
          animate={{
            left: flyCoords.targetLeft,
            top: flyCoords.targetTop,
            width: flyCoords.targetWidth,
            height: flyCoords.targetHeight
          }}
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
