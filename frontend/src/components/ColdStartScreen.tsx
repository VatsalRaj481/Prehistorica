import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';
import DinoLogoMark from './DinoLogoMark.js';

interface ColdStartScreenProps {
  isWaking: boolean;
  onWakeComplete?: () => void;
  onLogoDock?: () => void;
  simulateDurationSeconds?: number;
  onRetryHealth?: () => void;
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
  onLogoDock,
  simulateDurationSeconds,
  onRetryHealth
}: ColdStartScreenProps) {
  const [progress, setProgress] = useState(14);
  const [factIndex, setFactIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Cinematic Transition Phases:
  // 'idle' -> 'completing' -> 'fading-prep' -> 'receding-record' -> 'illuminating' -> 'expanding' -> 'zooming'
  const [exitPhase, setExitPhase] = useState<
    'idle' | 'completing' | 'fading-prep' | 'receding-record' | 'illuminating' | 'expanding' | 'zooming'
  >('idle');

  const [flyCoords, setFlyCoords] = useState<FlyCoordinates | null>(null);
  const crestLogoRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Track elapsed waiting seconds while backend is waking
  useEffect(() => {
    if (!isWaking) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWaking]);

  // Rotate Curatorial Paleofacts every 5.5s
  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % PALEOFACTS.length);
    }, 5500);
    return () => clearInterval(factInterval);
  }, []);

  // Keyboard shortcut listener: Space or Enter advances only once backend is online or finishing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'Enter') && (!isWaking || isFinishing)) {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWaking, isFinishing]);

  // Cinematic Zoom-Out Transition Sequence
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
        sourceWidth: 160,
        sourceHeight: 160,
        targetLeft: fallbackTargetLeft,
        targetTop: 14,
        targetWidth: 40,
        targetHeight: 40
      });
    }

    // 1. Preparation indicator reaches completion
    setExitPhase('completing');

    // 2. Secondary interface elements gradually fade
    const t2 = setTimeout(() => {
      setExitPhase('fading-prep');
    }, 180);

    // 3. Curatorial Collection Record softly recedes
    const t3 = setTimeout(() => {
      setExitPhase('receding-record');
    }, 380);

    // 4. PREHISTORICA logo becomes primary visual focus with illuminated strata
    const t4 = setTimeout(() => {
      setExitPhase('illuminating');
    }, 620);

    // 5. Cinematic camera pull-back: geological strata rings slowly expand outward
    const t5 = setTimeout(() => {
      setExitPhase('expanding');
    }, 850);

    // 6 & 7. Smooth cinematic zoom-out flight from emblem to reveal the Home Screen environment
    const t6 = setTimeout(() => {
      setExitPhase('zooming');
    }, 1080);

    // Exact docking moment: when the flying logo reaches target coordinates in the navbar
    const tDock = setTimeout(() => {
      if (onLogoDock) onLogoDock();
    }, 1080 + 850);

    // Final handover and unmount of cold start screen
    const t7 = setTimeout(() => {
      if (onWakeComplete) onWakeComplete();
    }, 1080 + 850 + 60);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(tDock);
      clearTimeout(t7);
    };
  }, [isFinishing, onWakeComplete, onLogoDock]);

  // Smooth progressive preparation while waiting for backend to wake up
  useEffect(() => {
    if (!isWaking) return;
    const targetDuration = simulateDurationSeconds || 22;
    const intervalTime = 60;
    const totalSteps = (targetDuration * 1000) / intervalTime;
    const stepIncrement = (94 - 14) / totalSteps;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) return 96;
        if (prev >= 92) return prev + 0.04;
        return Math.min(94, prev + stepIncrement);
      });
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [isWaking, simulateDurationSeconds]);

  // When backend wakes up (confirmed online), complete cleanly and trigger transition
  useEffect(() => {
    if (!isWaking && !isFinishing) {
      handleFinish();
    }
  }, [isWaking, isFinishing, handleFinish]);

  const currentFact = PALEOFACTS[factIndex];

  // Atmospheric museum preparation status message
  const preparationStatusText = useMemo(() => {
    if (!isWaking || isFinishing) {
      return 'Exhibition galleries prepared for your arrival.';
    }
    if (elapsedSeconds >= 45) {
      return 'Waking archive database from standby (Render cold start)... Opening shortly.';
    }
    if (elapsedSeconds >= 25) {
      return 'Synchronizing archival records (cloud server awakening)...';
    }
    if (progress < 30) return 'Illuminating exhibition galleries...';
    if (progress < 70) return 'Preparing the galleries for discovery...';
    if (progress < 98) return 'Opening archival exhibition spaces...';
    return 'Synchronizing museum archives...';
  }, [isWaking, isFinishing, elapsedSeconds, progress]);

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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_45%,_rgba(217,119,6,0.11)_0%,_transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(251,191,36,0.04)_0%,_transparent_70%)] pointer-events-none" />

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
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  !isWaking ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="text-[11px] font-medium tracking-wide">
                {!isWaking ? 'Galleries Ready' : 'Archival Server Connecting'}
              </span>
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
          <motion.div
            animate={
              exitPhase === 'expanding'
                ? { scale: 0.96 } // Subtle camera pull-back effect before zooming
                : exitPhase === 'zooming'
                ? { scale: 0.92, opacity: 0 }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col items-center justify-center space-y-6 text-center"
          >
            {/* Enlarged 25-30% Logo Stage with Calibrated Strata Horizon Structure */}
            <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center">
              {/* Geological Strata & Sedimentary Horizon Rings */}
              <motion.div
                animate={
                  exitPhase === 'expanding' || exitPhase === 'zooming'
                    ? { scale: 1.65, opacity: 0 }
                    : exitPhase === 'illuminating'
                    ? { scale: 1.05, opacity: 1, filter: 'brightness(1.2)' }
                    : shouldReduceMotion
                    ? { opacity: 0.85 }
                    : {
                        scale: [1, 1.025, 1],
                        opacity: [0.8, 0.95, 0.8]
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
                  viewBox="0 0 380 380"
                  className="w-72 h-72 sm:w-84 sm:h-84 overflow-visible select-none"
                  fill="none"
                >
                  <defs>
                    <radialGradient id="deepTimeCoreGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.32" />
                      <stop offset="35%" stopColor="#D97706" stopOpacity="0.14" />
                      <stop offset="70%" stopColor="#B45309" stopOpacity="0.04" />
                      <stop offset="100%" stopColor="#080C16" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Concentrated Warm Amber Core Radiance behind Enlarged Crest */}
                  <circle cx="190" cy="190" r="165" fill="url(#deepTimeCoreGlow)" />

                  {/* Strata Horizon IV: Deepest Precambrian Boundary (Outer subtle sedimentary layer) */}
                  <ellipse
                    cx="190"
                    cy="190"
                    rx="178"
                    ry="174"
                    stroke="#D97706"
                    strokeOpacity="0.11"
                    strokeWidth="0.9"
                    strokeDasharray="180 14 50 10 110 16"
                    transform="rotate(-7 190 190)"
                  />

                  {/* Strata Horizon III: Paleozoic Marine Sedimentary Contour */}
                  <ellipse
                    cx="190"
                    cy="190"
                    rx="152"
                    ry="156"
                    stroke="#F59E0B"
                    strokeOpacity="0.18"
                    strokeWidth="1.0"
                    strokeDasharray="210 14 65 10"
                    transform="rotate(10 190 190)"
                  />

                  {/* Strata Horizon II: Mesozoic Terrestrial Excavation Contour */}
                  <ellipse
                    cx="190"
                    cy="190"
                    rx="124"
                    ry="120"
                    stroke="#FBBF24"
                    strokeOpacity="0.26"
                    strokeWidth="1.1"
                    strokeDasharray="160 12 50 8 90 14"
                    transform="rotate(-4 190 190)"
                  />

                  {/* Strata Horizon I: Cenozoic Primary Horizon (Strongest warm amber illumination) */}
                  <ellipse
                    cx="190"
                    cy="190"
                    rx="98"
                    ry="102"
                    stroke="#FDE68A"
                    strokeOpacity="0.45"
                    strokeWidth="1.2"
                    strokeDasharray="120 10 40 8 70 12"
                    transform="rotate(5 190 190)"
                  />

                  {/* Archaeological Stratigraphic Scale Ticks along Outer Sedimentary Horizon */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    const x1 = 190 + Math.cos(rad) * 173;
                    const y1 = 190 + Math.sin(rad) * 173;
                    const x2 = 190 + Math.cos(rad) * 182;
                    const y2 = 190 + Math.sin(rad) * 182;
                    return (
                      <line
                        key={deg}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#F59E0B"
                        strokeOpacity="0.22"
                        strokeWidth="1"
                      />
                    );
                  })}
                </svg>
              </motion.div>

              {/* Central Enlarged Museum Monogram Crest (+25% scale for commanding focal presence) */}
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
                  <DinoLogoMark className="h-36 w-36 sm:h-44 sm:w-44 drop-shadow-[0_6px_36px_rgba(245,158,11,0.55)]" />
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
              className="space-y-1.5 max-w-xs mx-auto pt-1"
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
          </motion.div>

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
              {/* Archival Collection Record Framing Marks (Curatorial Registration Details) */}
              <div className="absolute top-2.5 left-2.5 w-4 h-4 pointer-events-none">
                <div className="w-full h-full border-t border-l border-amber-400/45 rounded-tl-[1px]" />
                <div className="absolute -bottom-1 -left-[0.5px] w-[1px] h-1.5 bg-amber-400/30" />
              </div>
              <div className="absolute top-2.5 right-2.5 w-4 h-4 pointer-events-none">
                <div className="w-full h-full border-t border-r border-amber-400/45 rounded-tr-[1px]" />
                <div className="absolute -bottom-1 -right-[0.5px] w-[1px] h-1.5 bg-amber-400/30" />
              </div>
              <div className="absolute bottom-2.5 left-2.5 w-4 h-4 pointer-events-none">
                <div className="w-full h-full border-b border-l border-amber-400/45 rounded-bl-[1px]" />
                <div className="absolute -top-1 -left-[0.5px] w-[1px] h-1.5 bg-amber-400/30" />
              </div>
              <div className="absolute bottom-2.5 right-2.5 w-4 h-4 pointer-events-none">
                <div className="w-full h-full border-b border-r border-amber-400/45 rounded-br-[1px]" />
                <div className="absolute -top-1 -right-[0.5px] w-[1px] h-1.5 bg-amber-400/30" />
              </div>

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
            {!isWaking ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-300 font-medium">
                  Archives online &bull; Opening exhibition galleries...
                </span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Galleries open automatically once archive connection is confirmed.</span>
              </>
            )}
          </div>

          {/* Visitor Call To Action / Archival Uplink Actions */}
          <div className="flex items-center gap-3">
            {/* Show retry uplink button if waiting unusually long (>60s) */}
            {isWaking && elapsedSeconds >= 60 && onRetryHealth && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetryHealth}
                className="px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 font-['Cinzel',serif] uppercase tracking-wider text-[11px] font-semibold transition-all cursor-pointer"
              >
                Retry Archival Uplink
              </motion.button>
            )}

            <AnimatePresence>
              {(!isWaking || isFinishing) && (
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

      {/* Hero Flight Transition: Larger Emblem zooms out and glides smoothly into Navbar target position */}
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
