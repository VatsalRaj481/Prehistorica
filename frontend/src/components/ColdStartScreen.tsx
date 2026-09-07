import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Database, Compass, Clock, CheckCircle2 } from 'lucide-react';
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
  const [progress, setProgress] = useState(6);
  const [factIndex, setFactIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // Rotate Did You Know facts every 4.5 seconds
  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % MUSEUM_FACTS.length);
    }, 4500);
    return () => clearInterval(factInterval);
  }, []);

  // Elapsed seconds timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulated or real progress increment
  useEffect(() => {
    const targetDuration = simulateDurationSeconds || 35; // Default ~35s cold start curve
    const intervalTime = 200;
    const increment = (94 - 6) / ((targetDuration * 1000) / intervalTime);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return 94; // Hold at 94% until wake resolves
        return Math.min(94, prev + increment);
      });
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [simulateDurationSeconds]);

  // When wake completes, smoothly advance to 100% and trigger exit
  useEffect(() => {
    if (!isWaking && !isFinishing) {
      setIsFinishing(true);
      setProgress(100);
      const timer = setTimeout(() => {
        if (onWakeComplete) onWakeComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isWaking, isFinishing, onWakeComplete]);

  // Determine stage message
  const getStageMessage = () => {
    if (progress >= 100) return 'Archival database online. Unlocking museum pavilion...';
    if (progress < 25) return 'Waking archival cloud servers & spinning up database...';
    if (progress < 50) return 'Excavating 550+ verified prehistoric fauna records...';
    if (progress < 75) return 'Calibrating 1:1 metric scale projection stage & architectural calipers...';
    return 'Synchronizing stratigraphic formations & global paleomaps...';
  };

  const currentFact = MUSEUM_FACTS[factIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] bg-[#080C16] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none font-mono"
    >
      {/* Ambient Radial Exhibit Lighting */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(217,119,6,0.12)_0%,_transparent_65%)]" />
      <div className="absolute inset-0 bg-fossil-grid opacity-25 pointer-events-none" />

      {/* Subtle Atmospheric Rotating Stratigraphic Rings Motif */}
      <div className="absolute w-[480px] h-[480px] sm:w-[620px] sm:h-[620px] pointer-events-none opacity-20 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-dashed border-amber-500/40"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-8 rounded-full border border-dotted border-white/20"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-20 rounded-full border border-amber-400/20"
        />
      </div>

      <div className="relative z-10 max-w-xl w-full flex flex-col items-center space-y-7 text-center">
        {/* Animated Museum Crest */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.25)]"
        >
          <DinoLogoMark className="h-14 w-14 sm:h-16 sm:w-16 drop-shadow-[0_2px_12px_rgba(245,158,11,0.4)]" />
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.95, 1.08, 0.95] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-2xl ring-1 ring-amber-400/30 pointer-events-none"
          />
        </motion.div>

        {/* Title & Archival Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Deep Time Archive &bull; Stratigraphic Cloud Initialization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100 uppercase font-sans">
            Prehistorica Museum Pavilion
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Free-tier archival servers cold-start on inactivity. Please allow ~30&ndash;45 seconds while specimen databases wake.
          </p>
        </div>

        {/* Progress Bar & Stage Indicator */}
        <div className="w-full space-y-2.5 bg-slate-900/80 border border-white/[0.08] p-4 sm:p-5 rounded-xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span className="flex items-center gap-1.5 text-amber-400 truncate">
              {progress >= 100 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Database className="h-3.5 w-3.5 text-amber-500 animate-pulse shrink-0" />
              )}
              <span className="truncate">{getStageMessage()}</span>
            </span>
            <span className="text-slate-100 font-mono tabular-nums text-xs shrink-0 pl-2">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Calibrated Progress Track */}
          <div className="relative h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/[0.06]">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-500" /> Elapsed: {elapsedSeconds}s
            </span>
            <span className="uppercase tracking-widest text-amber-500/80 font-bold">
              Render Instance Wake
            </span>
          </div>
        </div>

        {/* Rotating Museum "Did You Know?" Dossier Cards */}
        <div className="w-full min-h-[90px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={factIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="w-full bg-slate-950/60 border border-amber-500/20 rounded-xl p-3.5 sm:p-4 text-left shadow-lg space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase tracking-widest border-b border-white/[0.06] pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Curatorial Paleofact &bull; {currentFact.topic}</span>
                </span>
                <span className="text-slate-500">
                  {factIndex + 1} / {MUSEUM_FACTS.length}
                </span>
              </div>
              <p className="text-xs font-sans text-slate-300 leading-relaxed pt-1">
                {currentFact.fact}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Reassurance Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Compass className="h-3.5 w-3.5 text-amber-500/70" />
          <span>Curated exhibition begins automatically once the archive synchronizes.</span>
        </div>
      </div>
    </motion.div>
  );
}
