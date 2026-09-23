import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  X,
  Loader2,
  ShieldAlert,
  Flame,
  Droplets,
  CloudSun,
  Sparkles,
  Layers
} from 'lucide-react';
import { fetchFormationFoodWeb, FormationFoodWebResult, TrophicNode } from '../services/api.js';

interface FoodWebModalProps {
  isOpen: boolean;
  onClose: () => void;
  formationName: string;
  era?: string;
}

const STRESSORS = [
  { id: '', label: 'Baseline Ecological Equilibrium', icon: Sparkles },
  { id: 'Marine Regression & Severe Drought', label: 'Marine Regression & Drought', icon: Droplets },
  { id: 'Volcanic Aerosols & Acid Rain', label: 'Volcanism & Acid Rain', icon: Flame },
  { id: 'Abrupt Megathermal Global Warming', label: 'Megathermal Warming', icon: CloudSun }
];

export default function FoodWebModal({ isOpen, onClose, formationName, era = 'Mesozoic' }: FoodWebModalProps) {
  const [foodWeb, setFoodWeb] = useState<FormationFoodWebResult | null>(null);
  const [stressor, setStressor] = useState('');
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && formationName) {
      loadWeb(stressor);
    }
  }, [isOpen, formationName, stressor]);

  const loadWeb = async (currentStressor: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFormationFoodWeb(formationName, era, currentStressor || undefined);
      setFoodWeb(res.foodWeb);
      setCached(res.cached);
    } catch (err: any) {
      setError(err.message || 'Failed to synthesize formation food web.');
    } finally {
      setLoading(false);
    }
  };

  const getTrophicColor = (level: string) => {
    switch (level) {
      case 'Primary Producer':
        return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
      case 'Primary Consumer (Herbivore)':
        return 'border-teal-500/40 bg-teal-500/10 text-teal-300';
      case 'Mesopredator':
        return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
      case 'Apex Predator':
        return 'border-red-500/40 bg-red-500/10 text-red-300';
      case 'Scavenger / Decomposer':
      default:
        return 'border-purple-500/40 bg-purple-500/10 text-purple-300';
    }
  };

  // Group nodes by trophic level
  const groupedNodes: Record<string, TrophicNode[]> = {
    'Apex Predator': [],
    'Mesopredator': [],
    'Primary Consumer (Herbivore)': [],
    'Primary Producer': [],
    'Scavenger / Decomposer': []
  };

  foodWeb?.nodes.forEach((n) => {
    if (groupedNodes[n.trophicLevel]) {
      groupedNodes[n.trophicLevel].push(n);
    } else {
      groupedNodes['Primary Consumer (Herbivore)'].push(n);
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-slate-900 border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.08] bg-slate-950/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold tracking-wide font-mono text-slate-100 uppercase">
                      Paleo-Biome & Food Web Synthesizer
                    </h2>
                    {cached && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                        Instant DB Cache
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {formationName} ({era}) • Trophic Energy Transfer & Ecosystem Stressors
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

            {/* Stressor Selector Toolbar */}
            <div className="px-5 py-3 border-b border-white/[0.06] bg-slate-950/60 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 font-mono text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0 mr-1">
                Ecosystem Simulation:
              </span>
              {STRESSORS.map((s) => {
                const Icon = s.icon;
                const active = stressor === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStressor(s.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      active
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                        : 'bg-slate-850 hover:bg-slate-800 border-white/[0.08] text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <h3 className="text-sm font-bold font-mono text-slate-200">
                    Synthesizing Paleo-Biome Biomass Pyramid...
                  </h3>
                  <p className="text-xs text-slate-400 font-mono max-w-sm">
                    Reconstructing paleoflora producers, primary herbivore guilds, and apex macropredators
                  </p>
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>Synthesis Error</span>
                  </div>
                  <p>{error}</p>
                  <button
                    onClick={() => loadWeb(stressor)}
                    className="px-3 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 font-bold uppercase tracking-wider"
                  >
                    Retry Synthesis
                  </button>
                </div>
              ) : foodWeb ? (
                <div className="space-y-6">
                  {/* Environment & Climate Card */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">
                        Paleoenvironment
                      </span>
                      <p className="text-slate-200 font-sans leading-relaxed">
                        {foodWeb.paleoenvironment}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">
                        Climate & Biome
                      </span>
                      <p className="text-slate-200 font-sans leading-relaxed">
                        {foodWeb.climate}
                      </p>
                    </div>
                  </div>

                  {/* Stressor Impact Alert (if stressor selected) */}
                  {foodWeb.stressorScenario && stressor && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold font-mono text-amber-300 uppercase tracking-wider">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>Environmental Perturbation: {foodWeb.stressorScenario.stressorName}</span>
                      </div>
                      <p className="text-slate-200 font-sans leading-relaxed">
                        {foodWeb.stressorScenario.impactDescription}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        <div className="p-2 rounded bg-red-500/15 border border-red-500/30 text-red-300">
                          <strong className="block text-red-200 mb-0.5">High Extinction Vulnerability:</strong>
                          {foodWeb.stressorScenario.vulnerableSpecies.join(', ')}
                        </div>
                        <div className="p-2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                          <strong className="block text-emerald-200 mb-0.5">Ecological Generalists / Resilient:</strong>
                          {foodWeb.stressorScenario.resilientSpecies.join(', ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trophic Hierarchy Stack */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Trophic Energy Pyramid & Taxa Guilds
                    </h3>

                    {Object.entries(groupedNodes).map(([level, nodes]) => {
                      if (nodes.length === 0) return null;
                      return (
                        <div
                          key={level}
                          className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.08] space-y-2.5"
                        >
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-bold uppercase tracking-wider text-slate-300">
                              {level}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {nodes.length} Taxa Guilds
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {nodes.map((n) => (
                              <div
                                key={n.id}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${getTrophicColor(
                                  n.trophicLevel
                                )}`}
                              >
                                <span className="font-bold">{n.name}</span>
                                {n.diet && (
                                  <span className="text-[10px] opacity-75 italic">({n.diet})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Trophic Energy Flow Summary */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.08] text-xs font-mono space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                      Trophic Energy Transfer Dynamics
                    </span>
                    <p className="text-slate-300 font-sans leading-relaxed">
                      {foodWeb.trophicPyramidSummary}
                    </p>
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
