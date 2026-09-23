import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  X,
  Loader2,
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertOctagon,
  Scale,
  Sparkles
} from 'lucide-react';
import { simulateRunwayMatchup, RunwayInteractionResult, Species } from '../services/api.js';

interface RunwayMatchupModalProps {
  isOpen: boolean;
  onClose: () => void;
  speciesList: Species[];
}

export default function RunwayMatchupModal({ isOpen, onClose, speciesList }: RunwayMatchupModalProps) {
  const [simulation, setSimulation] = useState<RunwayInteractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && speciesList.length >= 2) {
      runSimulation();
    }
  }, [isOpen, speciesList]);

  const runSimulation = async () => {
    if (speciesList.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const ids = [speciesList[0].id, speciesList[1].id];
      const res = await simulateRunwayMatchup(ids);
      setSimulation(res.simulation);
      setCached(res.cached);
    } catch (err: any) {
      setError(err.message || 'Failed to simulate interaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.08] bg-slate-950/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold tracking-wide font-mono text-slate-100 uppercase">
                      Biomechanical Interaction Engine
                    </h2>
                    {cached && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                        Instant DB Cache
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {speciesList[0]?.name} vs {speciesList[1]?.name} • Stratigraphic & Locomotion Analysis
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-white/[0.08] text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <h3 className="text-sm font-bold font-mono text-slate-200">
                    Computing Kinetic & Stratigraphic Matchup...
                  </h3>
                  <p className="text-xs text-slate-400 font-mono max-w-sm">
                    Analyzing basion-cranial bite force, center of gravity differentials, and thagomizer defense radii
                  </p>
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>Simulation Error</span>
                  </div>
                  <p>{error}</p>
                  <button
                    onClick={runSimulation}
                    className="px-3 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 font-bold uppercase tracking-wider"
                  >
                    Retry Simulation
                  </button>
                </div>
              ) : simulation ? (
                <div className="space-y-6">
                  {/* Coexistence Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                      simulation.coexisted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    {simulation.coexisted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertOctagon className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold uppercase text-xs tracking-wider">
                          {simulation.coexisted ? 'Stratigraphically Coexistent' : 'Deep-Time Chronological Separation'}
                        </span>
                        {!simulation.coexisted && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                            {simulation.temporalGapMa} Ma Gap
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {simulation.temporalVerdict}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono pt-1">
                        📍 {simulation.geographicNotes}
                      </p>
                    </div>
                  </div>

                  {/* Physical & Metric Comparison Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                        <h4 className="font-mono font-bold text-amber-300 text-sm">
                          {simulation.physicalComparison.speciesA.name}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {speciesList[0]?.clade}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center font-mono">
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-white/[0.04]">
                          <span className="text-[10px] text-slate-400 uppercase block">Length</span>
                          <span className="text-xs font-bold text-slate-200">
                            {simulation.physicalComparison.speciesA.lengthM}m
                          </span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-white/[0.04]">
                          <span className="text-[10px] text-slate-400 uppercase block">Mass</span>
                          <span className="text-xs font-bold text-slate-200">
                            {simulation.physicalComparison.speciesA.massKg.toLocaleString()} kg
                          </span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-white/[0.04]">
                          <span className="text-[10px] text-slate-400 uppercase block">Bite Force</span>
                          <span className="text-xs font-bold text-amber-400">
                            {simulation.physicalComparison.speciesA.estimatedBiteForceN ? `${simulation.physicalComparison.speciesA.estimatedBiteForceN.toLocaleString()} N` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                        <h4 className="font-mono font-bold text-amber-300 text-sm">
                          {simulation.physicalComparison.speciesB.name}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {speciesList[1]?.clade}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center font-mono">
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-white/[0.04]">
                          <span className="text-[10px] text-slate-400 uppercase block">Length</span>
                          <span className="text-xs font-bold text-slate-200">
                            {simulation.physicalComparison.speciesB.lengthM}m
                          </span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-white/[0.04]">
                          <span className="text-[10px] text-slate-400 uppercase block">Mass</span>
                          <span className="text-xs font-bold text-slate-200">
                            {simulation.physicalComparison.speciesB.massKg.toLocaleString()} kg
                          </span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-white/[0.04]">
                          <span className="text-[10px] text-slate-400 uppercase block">Bite Force</span>
                          <span className="text-xs font-bold text-amber-400">
                            {simulation.physicalComparison.speciesB.estimatedBiteForceN ? `${simulation.physicalComparison.speciesB.estimatedBiteForceN.toLocaleString()} N` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mass Ratio & Kinetic Advantage */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.08] flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-amber-400" />
                      Body Mass Differential:
                    </span>
                    <span className="text-slate-200 font-bold">
                      {simulation.physicalComparison.massRatio}x Ratio • {simulation.physicalComparison.kineticAdvantage}
                    </span>
                  </div>

                  {/* Biomechanical Breakdown Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.08] space-y-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        Offensive Dynamics
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {simulation.biomechanicalBreakdown.offensiveCapabilities}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.08] space-y-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Defensive Architecture
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {simulation.biomechanicalBreakdown.defensiveCapabilities}
                      </p>
                    </div>
                  </div>

                  {/* Ecological Interaction Narrative */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950/90 via-slate-900 to-slate-950/90 border border-white/[0.1] space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Evidence-Based Encounter Narrative
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                      {simulation.ecologicalInteractionNarrative}
                    </p>
                  </div>

                  {/* Curator Conclusion */}
                  <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs font-mono text-amber-200/90 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-400 block">
                      Curatorial Assessment
                    </span>
                    <p>{simulation.curatorConclusion}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
