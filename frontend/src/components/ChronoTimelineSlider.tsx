import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  AlertTriangle,
  Clock,
  Skull,
  Activity,
  Loader2
} from 'lucide-react';
import { fetchSpeciesRoster, SpeciesRosterItem } from '../services/api.js';
import ShinyText from './reactbits/ShinyText.js';

interface ExtinctionEvent {
  id: string;
  name: string;
  shortName: string;
  mya: number;
  lossRate: string;
  causes: string;
  affectedTaxa: string;
  survivors: string;
  badgeColor: string;
}

const EXTINCTION_EVENTS: ExtinctionEvent[] = [
  {
    id: 'k-pg',
    name: 'Cretaceous–Paleogene (K-Pg) Extinction',
    shortName: 'K-Pg Boundary',
    mya: 66.0,
    lossRate: '76% of all species',
    causes: '10km Chicxulub asteroid impact (Yucatán) triggering global firestorms, nuclear winter, and Deccan Traps flood volcanism.',
    affectedTaxa: 'Non-avian dinosaurs, pterosaurs, mosasaurs, plesiosaurs, ammonites, belemnites.',
    survivors: 'Neornithine birds, crocodylomorphs, turtles, squamates, small burrowing mammals.',
    badgeColor: '#EF4444'
  },
  {
    id: 'tr-j',
    name: 'End-Triassic Extinction',
    shortName: 'Tr-J Boundary',
    mya: 201.3,
    lossRate: '80% of all species',
    causes: 'Central Atlantic Magmatic Province (CAMP) rifting, basaltic flood floods, and extreme oceanic acidification.',
    affectedTaxa: 'Conodonts, large pseudosuchians (rauisuchians, aetosaurs), phytosaurs, early therapsids.',
    survivors: 'Crocodylomorphs, early theropods and sauropodomorphs (clearing the way for the Jurassic dinosaur radiation).',
    badgeColor: '#F59E0B'
  },
  {
    id: 'p-tr',
    name: 'End-Permian "The Great Dying"',
    shortName: 'P-Tr Boundary',
    mya: 251.9,
    lossRate: '96% marine, 70% terrestrial',
    causes: 'Siberian Traps massive volcanic eruptions, runaway greenhouse effect, and oceanic hydrogen sulfide release.',
    affectedTaxa: 'Trilobites, sea scorpions, blastoids, gorgonopsians, pareiasaurs.',
    survivors: 'Dicynodonts (Lystrosaurus), proterosuchid archosauriforms, early cynodonts.',
    badgeColor: '#DC2626'
  },
  {
    id: 'late-devonian',
    name: 'Late Devonian Kellwasser Event',
    shortName: 'Late Devonian',
    mya: 372.2,
    lossRate: '75% of all species',
    causes: 'Proliferation of land plants causing terrestrial weathering, nutrient ocean eutrophication, and widespread anoxia.',
    affectedTaxa: 'Placoderm armored fishes, stromatoporoid reef builders, primitive agnathans.',
    survivors: 'Chondrichthyes (sharks), sarcopterygian lobe-finned fishes, early tetrapods.',
    badgeColor: '#38BDF8'
  }
];

const PERIOD_ANCHORS = [
  { name: 'Late Cretaceous', mya: 68, color: '#EF4444' },
  { name: 'Mid Cretaceous', mya: 100, color: '#F87171' },
  { name: 'Early Cretaceous', mya: 125, color: '#FB923C' },
  { name: 'Late Jurassic', mya: 152, color: '#10B981' },
  { name: 'Mid Jurassic', mya: 168, color: '#34D399' },
  { name: 'Early Jurassic', mya: 190, color: '#059669' },
  { name: 'Late Triassic', mya: 220, color: '#D97706' },
  { name: 'Mid Triassic', mya: 242, color: '#F59E0B' },
  { name: 'Permian Boundary', mya: 255, color: '#B45309' }
];

export default function ChronoTimelineSlider() {
  const shouldReduceMotion = useReducedMotion();
  const [roster, setRoster] = useState<SpeciesRosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetMya, setTargetMya] = useState<number>(68); // Default to Hell Creek apex (68 Ma)
  const [selectedExtinction, setSelectedExtinction] = useState<ExtinctionEvent | null>(EXTINCTION_EVENTS[0]);

  useEffect(() => {
    fetchSpeciesRoster()
      .then((data) => {
        setRoster(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load species roster', err);
        setLoading(false);
      });
  }, []);

  // Filter co-existing species at the target temporal horizon (+/- 4 Ma tolerance for stratigraphic overlap)
  const coexistingSpecies = useMemo(() => {
    return roster.filter((s) => {
      if (s.myaStart == null || s.myaEnd == null) return false;
      // Overlaps if myaStart >= targetMya - 3 and myaEnd <= targetMya + 3
      return s.myaStart >= targetMya - 4 && s.myaEnd <= targetMya + 4;
    });
  }, [roster, targetMya]);

  // Determine current geological period name
  const currentPeriodName = useMemo(() => {
    if (targetMya >= 251.9) return 'Permian–Triassic Transition';
    if (targetMya >= 201.3) return 'Triassic Period';
    if (targetMya >= 145.0) return 'Jurassic Period';
    if (targetMya >= 66.0) return 'Cretaceous Period';
    return 'Cenozoic Era';
  }, [targetMya]);

  return (
    <div className="space-y-8 font-sans">
      {/* ── Section Title & Scientific Context ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 font-mono">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-widest mb-1.5">
            <Clock className="h-4 w-4" />
            <span>Deep-Time Chronostratigraphy &bull; 541–0 Million Years Ago</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2 font-sans">
            <ShinyText text="Stratigraphic Temporal Slider" speed={3.5} />
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-mono">
            Scrub through deep time to observe which cataloged creatures co-existed and inspect the catastrophic extinction horizons that reshaped the biosphere.
          </p>
        </div>

        {/* Current Temporal Horizon Badge */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center gap-3 shrink-0 shadow-lg">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Temporal Horizon</span>
            <span className="text-lg font-black text-amber-400 font-mono">{targetMya.toFixed(1)} Ma</span>
          </div>
          <div className="h-8 w-px bg-white/[0.1]" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Period</span>
            <span className="text-xs font-bold text-slate-200">{currentPeriodName}</span>
          </div>
        </div>
      </div>

      {/* ── Extinction Horizon Boundary Quick-Jump Pills ── */}
      <div className="space-y-2 font-mono">
        <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
          <Skull className="h-3.5 w-3.5 text-red-400" />
          <span>Major Mass Extinction Horizons (Click to Investigate)</span>
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
          {EXTINCTION_EVENTS.map((event) => {
            const isSelected = selectedExtinction?.id === event.id;
            return (
              <button
                key={event.id}
                onClick={() => {
                  setSelectedExtinction(event);
                  setTargetMya(event.mya);
                }}
                className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm ${
                  isSelected
                    ? 'bg-red-500/20 text-red-300 border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.25)] ring-1 ring-red-500/50'
                    : 'bg-slate-900/80 hover:bg-slate-850 border-white/[0.08] hover:border-red-500/40 text-slate-300 hover:text-white'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span>{event.shortName}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                  {event.mya} Ma
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Selected Extinction Horizon Diagnostic Card ── */}
      <AnimatePresence mode="wait">
        {selectedExtinction && (
          <motion.div
            key={selectedExtinction.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#180A0A] via-slate-900 to-[#140808] border border-red-500/30 shadow-xl space-y-3 relative overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 font-mono border-b border-white/[0.08] pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/40 uppercase tracking-wider text-[10px]">
                  Mass Extinction Horizon
                </span>
                <span className="text-slate-100 font-bold font-sans text-sm sm:text-base">
                  {selectedExtinction.name}
                </span>
              </div>
              <span className="text-red-400 font-bold">Loss Rate: {selectedExtinction.lossRate}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono pt-1">
              <div className="space-y-1">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">Geophysical Mechanism:</span>
                <p className="text-slate-200 font-sans leading-relaxed">{selectedExtinction.causes}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">Extinct Clades:</span>
                <p className="text-red-300 font-sans leading-relaxed">{selectedExtinction.affectedTaxa}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">Survivor Lineages:</span>
                <p className="text-emerald-300 font-sans leading-relaxed">{selectedExtinction.survivors}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Continuous Timeline Scrubber ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-white/[0.08] space-y-5 shadow-lg">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400">
          <span className="uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            <span>Interactive Geologic Caliper</span>
          </span>
          <span>Older &larr; 260 Ma &bull;&bull;&bull; 60 Ma &rarr; Younger</span>
        </div>

        {/* Range Input Slider */}
        <div className="relative pt-2 pb-1">
          <input
            type="range"
            min="60"
            max="260"
            step="0.5"
            value={targetMya}
            onChange={(e) => {
              setTargetMya(parseFloat(e.target.value));
              // Clear selected extinction if custom value
              const match = EXTINCTION_EVENTS.find((ev) => Math.abs(ev.mya - parseFloat(e.target.value)) < 1.0);
              setSelectedExtinction(match || null);
            }}
            className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-white/[0.08]"
          />
        </div>

        {/* Period Anchor Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
          {PERIOD_ANCHORS.map((anchor) => (
            <button
              key={anchor.name}
              onClick={() => {
                setTargetMya(anchor.mya);
                const match = EXTINCTION_EVENTS.find((ev) => Math.abs(ev.mya - anchor.mya) < 1.0);
                setSelectedExtinction(match || null);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-amber-500/10 border border-white/[0.06] hover:border-amber-500/40 text-[10px] font-mono text-slate-300 hover:text-amber-300 shrink-0 transition-all cursor-pointer"
            >
              <span>{anchor.name}</span>
              <span className="text-slate-500 ml-1">({anchor.mya} Ma)</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Co-Existing Species Stage ── */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3 font-mono text-slate-400">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            <p className="text-xs uppercase tracking-widest">Excavating Chronostratigraphic Horizons...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-mono">
              <span className="text-slate-300 font-bold">
                Specimens Inhabiting This Geological Horizon: <strong className="text-amber-400">{coexistingSpecies.length}</strong>
              </span>
              <span className="text-slate-500">
                Window: {Math.max(60, targetMya - 4).toFixed(0)}–{(targetMya + 4).toFixed(0)} Ma
              </span>
            </div>

            {coexistingSpecies.length === 0 ? (
              <div className="p-12 rounded-2xl bg-slate-900/40 border border-white/[0.06] text-center font-mono text-xs text-slate-400">
                No cataloged specimens in the archives currently match this exact metric window. Drag the slider to 68 Ma, 150 Ma, or 230 Ma to see living faunal cohorts.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {coexistingSpecies.map((specimen) => (
                  <Link
                    key={specimen.id}
                    to={`/species/${specimen.id}`}
                    className="group relative p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-850/95 border border-white/[0.08] hover:border-amber-500/50 hover:shadow-[0_4px_16px_rgba(245,158,11,0.12)] transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                          {specimen.name}
                        </h5>
                        <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0">
                          {specimen.myaStart}&ndash;{specimen.myaEnd} Ma
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 italic truncate">
                        {specimen.scientificName}
                      </p>
                    </div>

                    {/* Silhouette or Reconstruction */}
                    <div className="my-2.5 h-20 rounded-lg bg-slate-950/70 border border-white/[0.04] flex items-center justify-center p-2">
                      {specimen.silhouetteUrl ? (
                        <img
                          src={specimen.silhouetteUrl}
                          alt={specimen.name}
                          className="w-full h-full object-contain filter invert contrast-125 opacity-80 group-hover:opacity-100 transition-all duration-200"
                          loading="lazy"
                        />
                      ) : specimen.reconstructionImageUrl ? (
                        <img
                          src={specimen.reconstructionImageUrl}
                          alt={specimen.name}
                          className="w-full h-full object-cover rounded opacity-85 group-hover:opacity-100 transition-all duration-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-[10px] font-mono text-slate-500">
                          Profile Active
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/[0.04]">
                      <span className="text-slate-300">{specimen.clade}</span>
                      {specimen.lengthM && (
                        <span className="text-amber-400 font-bold">{specimen.lengthM}m</span>
                      )}
                      <span className="text-slate-500 group-hover:text-amber-400">View &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
