import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Layers, CheckCircle2, ArrowRight, Activity, Terminal, Shield, Sparkles } from 'lucide-react';
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
  const [progress, setProgress] = useState(12);
  const [factIndex, setFactIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [canBypass, setCanBypass] = useState(false);
  const [telemetryTick, setTelemetryTick] = useState(14880);
  const shouldReduceMotion = useReducedMotion();

  // Fast telemetry ticker for cinematic technical realism
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTick((prev) => prev + Math.floor(Math.random() * 14 + 1));
    }, 120);
    return () => clearInterval(timer);
  }, []);

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
      if ((e.code === 'Space' || e.code === 'Enter') && (canBypass || progress >= 90 || isFinishing)) {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Enable bypass after 6.5 seconds so no user is trapped
  useEffect(() => {
    const bypassTimer = setTimeout(() => {
      setCanBypass(true);
    }, 6500);
    return () => clearTimeout(bypassTimer);
  }, []);

  const handleFinish = useCallback(() => {
    if (isFinishing) return;
    setIsFinishing(true);
    setProgress(100);
    const exitTimer = setTimeout(() => {
      if (onWakeComplete) onWakeComplete();
    }, 450);
    return () => clearTimeout(exitTimer);
  }, [isFinishing, onWakeComplete]);

  // Smooth progressive timeline towards 96%
  useEffect(() => {
    const targetDuration = simulateDurationSeconds || 16;
    const intervalTime = 120;
    const stepIncrement = (94 - 12) / ((targetDuration * 1000) / intervalTime);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        if (prev >= 94) return prev + 0.12;
        return Math.min(94, prev + stepIncrement);
      });
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [simulateDurationSeconds]);

  // Max fail-safe auto unlock after 18 seconds
  useEffect(() => {
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

  // Multi-stage status calculations
  const stage1Complete = progress >= 33 || isFinishing;
  const stage2Active = progress >= 33 && progress < 75 && !isFinishing;
  const stage2Complete = progress >= 75 || isFinishing;
  const stage3Active = progress >= 75 && progress < 99 && !isFinishing;
  const stage3Complete = progress >= 99 || isFinishing;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.99, filter: 'blur(4px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] bg-[#080C16] flex flex-col justify-between p-4 sm:p-6 md:p-8 overflow-y-auto select-none font-mono text-slate-300"
    >
      {/* Subtle Stratigraphic Sediment Grid Texture */}
      <div className="absolute inset-0 bg-fossil-grid opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,_rgba(217,119,6,0.08)_0%,_transparent_70%)] pointer-events-none" />

      {/* Top Header Bar: Telemetry Status */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold uppercase tracking-widest text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>EXHIBIT PAVILION INITIALIZATION</span>
          </div>
          <span className="text-slate-500 hidden md:inline text-[11px]">
            STRATIGRAPHIC SYNCHRONIZATION // DEEP-TIME ARCHIVE
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-emerald-400" />
            <span>RENDER API: <strong className="text-slate-200">STANDBY &bull; WAKING</strong></span>
          </span>
          <span className="text-slate-600 hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline font-mono tabular-nums text-slate-400">
            CLOCK: {telemetryTick} ns
          </span>
          <span className="text-slate-600 hidden sm:inline">&bull;</span>
          <span className="text-amber-400 font-bold">
            ARCHIVE v2.0
          </span>
        </div>
      </header>

      {/* Center Stage: Monogram Crest + Concentric Calipers + Telemetry Grid */}
      <main className="relative z-10 max-w-5xl mx-auto w-full my-auto py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
        {/* Left Column: Illuminated Monogram Crest & Rotating Stratigraphic Calipers */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-5 text-center">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
            {/* Concentric Outer Caliper Ring (Paleozoic / Mesozoic / Cenozoic Cardinal Ticks) */}
            <motion.div
              animate={shouldReduceMotion ? {} : { rotate: 360 }}
              transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-amber-500/30"
            >
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1 text-[8px] font-bold text-amber-400/80 bg-[#080C16]">
                541 MYA &bull; CAMBRIAN
              </span>
              <span className="absolute top-1/2 -right-3 -translate-y-1/2 px-1 text-[8px] font-bold text-amber-400/80 bg-[#080C16]">
                251 MYA &bull; TRIASSIC
              </span>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1 text-[8px] font-bold text-amber-400/80 bg-[#080C16]">
                66 MYA &bull; K-PG BOUNDARY
              </span>
              <span className="absolute top-1/2 -left-3 -translate-y-1/2 px-1 text-[8px] font-bold text-amber-400/80 bg-[#080C16]">
                0.01 MYA &bull; HOLOCENE
              </span>
            </motion.div>

            {/* Inner Counter-Rotating Dotted Caliper Ring */}
            <motion.div
              animate={shouldReduceMotion ? {} : { rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-4 rounded-full border border-dotted border-white/20"
            />

            {/* Metric Dimension Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-amber-500/20 to-transparent" />
            </div>

            {/* Inner Ambient Glow Aura */}
            <div className="absolute inset-10 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

            {/* Central Museum Monogram Crest Plinth */}
            <motion.div
              animate={shouldReduceMotion ? {} : { scale: [1, 1.03, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#0E1526] border border-amber-500/40 shadow-[0_12px_32px_rgba(0,0,0,0.8),0_0_24px_rgba(245,158,11,0.2)]"
            >
              <DinoLogoMark className="h-14 w-14 sm:h-16 sm:w-16 drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]" />
              <span className="text-[9px] font-black tracking-widest text-amber-400 uppercase pt-1 font-mono">
                PREHISTORICA
              </span>
            </motion.div>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 uppercase font-sans">
              Museum Archive Pavilion
            </h1>
            <p className="text-xs text-slate-400 max-w-xs font-sans">
              Natural History Encyclopedia &amp; Calibrated 1:1 Metric Scale Stage
            </p>
          </div>
        </div>

        {/* Right Column: Multi-Stage Telemetry Module & Curatorial Paleofact Field Card */}
        <div className="lg:col-span-7 space-y-5">
          {/* Telemetry Stage Progress Plinth */}
          <div className="museum-plinth rounded-xl p-5 sm:p-6 border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Museum Synchronizer Status
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Total Progress:</span>
                <span className="text-amber-400 font-bold text-sm tabular-nums">
                  {Math.min(100, Math.round(progress))}%
                </span>
              </div>
            </div>

            {/* Linear Metric Caliper Progress Bar */}
            <div className="space-y-1.5">
              <div className="relative h-2 w-full bg-[#080C16] rounded-full overflow-hidden border border-white/[0.08]">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                  style={{ width: `${Math.min(100, progress)}%` }}
                  transition={{ ease: 'easeOut', duration: 0.15 }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.00 MYA</span>
                <span className="text-amber-400/90 font-bold">CALIBRATING 1:1 DIMENSION CALIPERS</span>
                <span>541.00 MYA</span>
              </div>
            </div>

            {/* 3 Synchronization Stages (Stitch Architectural Telemetry Readout) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              {/* Stage 1 */}
              <div className={`p-2.5 rounded-lg border transition-colors ${
                stage1Complete
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-[#080C16] border-white/[0.06] text-slate-400'
              }`}>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1">
                  {stage1Complete ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                  <span>1. Stratigraphy</span>
                </div>
                <p className="text-[11px] leading-tight font-sans">
                  {stage1Complete ? '10 Eras Primed' : 'Parsing Strata...'}
                </p>
              </div>

              {/* Stage 2 */}
              <div className={`p-2.5 rounded-lg border transition-colors ${
                stage2Complete
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : stage2Active
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-[#080C16] border-white/[0.06] text-slate-500'
              }`}>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1">
                  {stage2Complete ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : stage2Active ? (
                    <Layers className="h-3.5 w-3.5 text-amber-400 animate-pulse shrink-0" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-slate-600" />
                  )}
                  <span>2. Species Catalog</span>
                </div>
                <p className="text-[11px] leading-tight font-sans">
                  {stage2Complete ? '559 Fauna Ready' : 'Unpacking 559 Records...'}
                </p>
              </div>

              {/* Stage 3 */}
              <div className={`p-2.5 rounded-lg border transition-colors ${
                stage3Complete
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : stage3Active
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-[#080C16] border-white/[0.06] text-slate-500'
              }`}>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1">
                  {stage3Complete ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : stage3Active ? (
                    <Activity className="h-3.5 w-3.5 text-amber-400 animate-pulse shrink-0" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-slate-600" />
                  )}
                  <span>3. 1:1 Metric Stage</span>
                </div>
                <p className="text-[11px] leading-tight font-sans">
                  {stage3Complete ? 'Calipers Grounded' : 'Aligning Calipers...'}
                </p>
              </div>
            </div>
          </div>

          {/* Curatorial Paleofact Field Card (Stitch Component Design) */}
          <div className="museum-plinth rounded-xl p-5 border border-white/[0.08] shadow-xl space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={factIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-2 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>CURATORIAL PALEOFACT // LOG NO. {currentFact.logNo}</span>
                  </span>
                  <span className="text-slate-500">
                    DOSSIER {factIndex + 1} OF {PALEOFACTS.length}
                  </span>
                </div>

                {/* Species Title & Formation */}
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-100 uppercase font-sans">
                      {currentFact.species}
                    </h3>
                    <span className="text-xs text-amber-400 font-mono italic">
                      ({currentFact.period})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans">
                    Formation: <strong className="text-slate-200">{currentFact.formation}</strong>
                  </p>
                </div>

                {/* Metric Strip (Mass, Length, Habitat) */}
                <div className="grid grid-cols-3 gap-2 bg-[#080C16] p-2.5 rounded-lg border border-white/[0.06] text-center text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Mass</span>
                    <span className="text-amber-400 font-bold tabular-nums">{currentFact.mass}</span>
                  </div>
                  <div className="border-x border-white/[0.06]">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Length</span>
                    <span className="text-amber-400 font-bold tabular-nums">{currentFact.length}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Habitat</span>
                    <span className="text-slate-200 font-bold truncate block">{currentFact.habitat}</span>
                  </div>
                </div>

                {/* Curatorial Annotation Note */}
                <p className="text-xs font-sans text-slate-300 leading-relaxed border-l-2 border-amber-500 pl-3 italic">
                  "{currentFact.fact}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Bottom Footer & Manual Bypass Navigation Action */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08] pt-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <Shield className="h-3.5 w-3.5 text-amber-400" />
          <span>Pavilion automatically unlocks when database handshake finishes.</span>
        </div>

        {/* Manual Bypass Button */}
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {(canBypass || isFinishing || progress >= 85) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFinish}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer font-sans"
              >
                <span>Enter Museum Pavilion</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {(canBypass || isFinishing || progress >= 85) && (
            <span className="hidden md:inline text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              [SPACE / ENTER]
            </span>
          )}
        </div>
      </footer>
    </motion.div>
  );
}
