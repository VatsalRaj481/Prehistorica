import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layers, Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import DinoLogoMark from './DinoLogoMark.js';

interface ColdStartScreenProps {
  isWaking: boolean;
  onWakeComplete?: () => void;
  simulateDurationSeconds?: number;
}

const MUSEUM_FACTS = [
  {
    topic: 'Aquatic Adaptation',
    fact: 'Spinosaurus possessed dense, marrow-filled pachyostotic bones similar to modern penguins, providing ballast for semi-aquatic underwater hunting.'
  },
  {
    topic: 'Late Jurassic Strata',
    fact: 'The Morrison Formation in western North America contains fossils spanning 10 million years, preserving Allosaurus, Stegosaurus, and Diplodocus in the same ecosystem.'
  },
  {
    topic: 'Apex Devonian Predator',
    fact: 'Dunkleosteus could snap its self-sharpening armored jaw plates shut in just 20 milliseconds, delivering over 5,000 Newtons of crushing force at its blade tips.'
  },
  {
    topic: 'Colossal Sauropod Scale',
    fact: 'Argentinosaurus is estimated to have reached 35 meters in length and 75 metric tons — equivalent to roughly 12 adult African bush elephants.'
  },
  {
    topic: 'Archosaurs in Flight',
    fact: 'Pterosaurs were not dinosaurs; they were an independent lineage of archosaurs that achieved powered vertebrate flight 70 million years before the first birds.'
  },
  {
    topic: 'Microscopic Preservation',
    fact: 'Cretaceous amber resins have preserved dinosaur feather structures, insect compound eyes, and ancient tree foliage in pristine, sub-micron 3D fidelity.'
  }
];

export default function ColdStartScreen({
  isWaking,
  onWakeComplete,
  simulateDurationSeconds
}: ColdStartScreenProps) {
  const [progress, setProgress] = useState(8);
  const [factIndex, setFactIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [canBypass, setCanBypass] = useState(false);

  // Rotate Did You Know facts every 4.5 seconds
  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % MUSEUM_FACTS.length);
    }, 4500);
    return () => clearInterval(factInterval);
  }, []);

  // Enable manual bypass button after 9 seconds so users are never trapped
  useEffect(() => {
    const bypassTimer = setTimeout(() => {
      setCanBypass(true);
    }, 9000);
    return () => clearTimeout(bypassTimer);
  }, []);

  const handleFinish = useCallback(() => {
    if (isFinishing) return;
    setIsFinishing(true);
    setProgress(100);
    const exitTimer = setTimeout(() => {
      if (onWakeComplete) onWakeComplete();
    }, 550);
    return () => clearTimeout(exitTimer);
  }, [isFinishing, onWakeComplete]);

  // Smooth progressive animation towards 96%, but never completely freezes
  useEffect(() => {
    const targetDuration = simulateDurationSeconds || 20;
    const intervalTime = 150;
    const stepIncrement = (94 - 8) / ((targetDuration * 1000) / intervalTime);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        if (prev >= 94) {
          // Creep forward slowly towards 98% rather than halting abruptly
          return prev + 0.15;
        }
        return Math.min(94, prev + stepIncrement);
      });
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [simulateDurationSeconds]);

  // Fail-safe auto-transition: automatically unlock after 22 seconds
  useEffect(() => {
    const autoUnlockTimeout = setTimeout(() => {
      handleFinish();
    }, 22000);

    return () => clearTimeout(autoUnlockTimeout);
  }, [handleFinish]);

  // When backend signals wake complete, finish smoothly
  useEffect(() => {
    if (!isWaking && !isFinishing) {
      handleFinish();
    }
  }, [isWaking, isFinishing, handleFinish]);

  // Curatorial stage message
  const getStageMessage = () => {
    if (progress >= 99 || isFinishing) return 'Archival database synchronized. Unlocking museum pavilion...';
    if (progress < 25) return 'Initializing deep time archival records...';
    if (progress < 50) return 'Excavating 550+ verified prehistoric fauna records...';
    if (progress < 75) return 'Calibrating 1:1 metric scale projection stage & architectural calipers...';
    return 'Synchronizing stratigraphic formations & global paleomaps...';
  };

  const currentFact = MUSEUM_FACTS[factIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] bg-[#080C16] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none font-mono"
    >
      {/* Ambient Radial Exhibit Lighting */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.12)_0%,_transparent_65%)]" />
      <div className="absolute inset-0 bg-fossil-grid opacity-20 pointer-events-none" />

      {/* Atmospheric Rotating Stratigraphic Rings */}
      <div className="absolute w-[440px] h-[440px] sm:w-[600px] sm:h-[600px] pointer-events-none opacity-25 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-amber-500/35"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-10 rounded-full border border-dotted border-white/20"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-24 rounded-full border border-amber-400/25"
        />
        <div className="absolute inset-36 rounded-full bg-amber-500/5 blur-xl" />
      </div>

      <div className="relative z-10 max-w-xl w-full flex flex-col items-center space-y-6 text-center">
        {/* Museum Monogram Crest */}
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex items-center justify-center p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-[0_0_45px_rgba(245,158,11,0.22)]"
        >
          <DinoLogoMark className="h-14 w-14 sm:h-16 sm:w-16 drop-shadow-[0_2px_14px_rgba(245,158,11,0.45)]" />
          <motion.div
            animate={{ opacity: [0.3, 0.75, 0.3], scale: [0.96, 1.06, 0.96] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-2xl ring-1 ring-amber-400/40 pointer-events-none"
          />
        </motion.div>

        {/* Title & Archival Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Deep Time Archive &bull; Stratigraphic Initialization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100 uppercase font-sans">
            Prehistorica Museum Pavilion
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Synchronizing deep-time specimen records, 1:1 metric caliper models, and stratigraphic formations.
          </p>
        </div>

        {/* Progress Bar & Stage Indicator */}
        <div className="w-full space-y-3 bg-slate-900/80 border border-white/[0.08] p-4 sm:p-5 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span className="flex items-center gap-2 text-amber-400 truncate">
              {progress >= 99 || isFinishing ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <Layers className="h-4 w-4 text-amber-400 animate-pulse shrink-0" />
              )}
              <span className="truncate">{getStageMessage()}</span>
            </span>
            <span className="text-slate-100 font-mono tabular-nums text-xs shrink-0 pl-2">
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>

          {/* Calibrated Glowing Progress Track */}
          <div className="relative h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/[0.08]">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full shadow-[0_0_14px_rgba(245,158,11,0.65)]"
              style={{ width: `${Math.min(100, progress)}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Specimen Archives Primed</span>
            </span>
            <span className="uppercase tracking-widest text-amber-400/90 font-bold">
              Calibrated Stage 1:1
            </span>
          </div>
        </div>

        {/* Rotating Museum "Curatorial Paleofact" Dossier Card */}
        <div className="w-full min-h-[95px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={factIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full bg-slate-950/65 border border-amber-500/20 rounded-xl p-3.5 sm:p-4 text-left shadow-lg space-y-1.5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase tracking-widest border-b border-white/[0.06] pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Curatorial Paleofact &bull; {currentFact.topic}</span>
                </span>
                <span className="text-slate-500 font-mono">
                  {factIndex + 1} / {MUSEUM_FACTS.length}
                </span>
              </div>
              <p className="text-xs font-sans text-slate-300 leading-relaxed pt-0.5">
                {currentFact.fact}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Enter Pavilion Bypass Button (Revealed after brief check or on completion) */}
        <div className="min-h-[44px] flex items-center justify-center">
          <AnimatePresence>
            {(canBypass || isFinishing || progress >= 95) && (
              <motion.button
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-sans font-bold tracking-wide flex items-center gap-2.5 shadow-[0_0_25px_rgba(245,158,11,0.2)] transition-all cursor-pointer group"
              >
                <span>Enter Museum Pavilion</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Reassurance Subtitle */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Compass className="h-3.5 w-3.5 text-amber-500/70" />
          <span>Curated exhibition opens automatically once synchronization completes.</span>
        </div>
      </div>
    </motion.div>
  );
}
