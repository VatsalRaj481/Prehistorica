import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fetchSpecies, fetchSpeciesRoster, Species, SpeciesRosterItem } from '../services/api.js';
import HolotypeDetective from '../components/challenges/HolotypeDetective.js';
import CaliperGuesser from '../components/challenges/CaliperGuesser.js';
import ChronoSorter from '../components/challenges/ChronoSorter.js';
import {
  Trophy,
  HelpCircle,
  Ruler,
  Clock,
  RotateCcw
} from 'lucide-react';
import ShinyText from '../components/reactbits/ShinyText.js';
import CountUp from '../components/reactbits/CountUp.js';
import ClickSpark from '../components/reactbits/ClickSpark.js';
import CuratorialLoader from '../components/CuratorialLoader.js';

type ChallengeTab = 'detective' | 'caliper' | 'chrono';

interface CuratorRank {
  title: string;
  minScore: number;
  badge: string;
}

const RANKS: CuratorRank[] = [
  { title: 'Novice Fossil Hunter', minScore: 0, badge: '🪨' },
  { title: 'Field Excavation Tech', minScore: 250, badge: '⛏️' },
  { title: 'Paleontological Scholar', minScore: 600, badge: '📜' },
  { title: 'Lead Stratigrapher', minScore: 1200, badge: '🧭' },
  { title: 'Chief Museum Curator', minScore: 2500, badge: '🏛️' }
];

export default function PaleoChallenge() {
  const [activeTab, setActiveTab] = useState<ChallengeTab>('detective');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [roster, setRoster] = useState<SpeciesRosterItem[]>([]);
  const [speciesPool, setSpeciesPool] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  // Load saved score and streak from localStorage
  useEffect(() => {
    document.title = 'Paleontology Challenges Pavilion | Prehistorica Museum';
    try {
      const savedScore = parseInt(localStorage.getItem('prehistorica_curator_score') || '0', 10);
      const savedStreak = parseInt(localStorage.getItem('prehistorica_curator_streak') || '0', 10);
      setScore(isNaN(savedScore) ? 0 : savedScore);
      setStreak(isNaN(savedStreak) ? 0 : savedStreak);
    } catch {}

    // Load full roster and complete species catalog (all 592 species) for randomized challenges
    Promise.all([
      fetchSpeciesRoster(),
      fetchSpecies({ limit: 600 })
    ])
      .then(([rosterData, speciesData]) => {
        setRoster(rosterData);
        const list = 'data' in speciesData ? speciesData.data : speciesData;
        setSpeciesPool(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load challenge datasets:', err);
        setLoading(false);
      });
  }, []);

  const handleScore = (pts: number) => {
    const newScore = score + pts;
    const newStreak = streak + 1;
    setScore(newScore);
    setStreak(newStreak);

    try {
      localStorage.setItem('prehistorica_curator_score', newScore.toString());
      localStorage.setItem('prehistorica_curator_streak', newStreak.toString());
    } catch {}
  };

  const handleReset = () => {
    setScore(0);
    setStreak(0);
    try {
      localStorage.removeItem('prehistorica_curator_score');
      localStorage.removeItem('prehistorica_curator_streak');
    } catch {}
  };

  // Determine current rank and next rank progress
  const currentRank = useMemo(() => {
    let r = RANKS[0];
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (score >= RANKS[i].minScore) {
        r = RANKS[i];
        break;
      }
    }
    return r;
  }, [score]);

  const nextRank = useMemo(() => {
    const currentIdx = RANKS.findIndex((r) => r.title === currentRank.title);
    return currentIdx < RANKS.length - 1 ? RANKS[currentIdx + 1] : null;
  }, [currentRank]);

  const progressPercent = useMemo(() => {
    if (!nextRank) return 100;
    const range = nextRank.minScore - currentRank.minScore;
    const currentProg = score - currentRank.minScore;
    return Math.min(100, Math.max(0, Math.round((currentProg / range) * 100)));
  }, [score, currentRank, nextRank]);

  return (
    <div className="space-y-8 py-4 font-sans">
      {/* Top Header & Curator Rank Banner */}
      <div className="museum-plinth rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest">
              <Trophy className="h-3.5 w-3.5" />
              <ShinyText text="Curator Challenge Pavilion" speed={3.5} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-100 font-sans">
              Paleontological Field Trials
            </h1>
            <p className="text-sm text-slate-400 font-mono max-w-xl">
              Test your anatomical diagnosis, metric caliper scale intuition, and deep-time chronostratigraphy across 540 million years of natural history.
            </p>
          </div>

          {/* Curator Score & Rank Badge Card */}
          <div className="bg-slate-900/90 border border-white/[0.08] rounded-xl p-4 sm:p-5 font-mono text-xs space-y-3 min-w-[280px] shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Curator Standing:</span>
              <button
                onClick={handleReset}
                className="text-[10px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset Score"
              >
                <RotateCcw className="h-2.5 w-2.5" /> Reset
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentRank.badge}</span>
              <div>
                <h4 className="text-sm font-bold text-slate-100 uppercase font-sans">{currentRank.title}</h4>
                <p className="text-[11px] text-amber-400 font-bold tabular-nums flex items-center gap-1">
                  <CountUp to={score} duration={0.6} />
                  <span>Points &bull; {streak} Streak</span>
                </p>
              </div>
            </div>

            {/* Rank Progress Bar */}
            {nextRank && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Next: {nextRank.title}</span>
                  <span className="tabular-nums">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/[0.04]">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Challenge Mode Navigation Tabs */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] font-mono text-xs">
          <ClickSpark sparkColor="#F59E0B">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('detective')}
                className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'detective'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-white/[0.08]'
                }`}
              >
                <HelpCircle className="h-4 w-4" /> 1. Holotype Detective
              </button>

              <button
                onClick={() => setActiveTab('caliper')}
                className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'caliper'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-white/[0.08]'
                }`}
              >
                <Ruler className="h-4 w-4" /> 2. Caliper Guesser
              </button>

              <button
                onClick={() => setActiveTab('chrono')}
                className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'chrono'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-white/[0.08]'
                }`}
              >
                <Clock className="h-4 w-4" /> 3. Chrono Sequence
              </button>
            </div>
          </ClickSpark>
        </div>
      </div>

      {/* Main Challenge Chamber */}
      <div className="museum-plinth rounded-2xl p-5 sm:p-7 border border-white/[0.08] shadow-2xl">
        {loading ? (
          <div className="py-16 flex justify-center items-center">
            <CuratorialLoader
              variant="amber"
              label="Cataloging Geological Specimens For Trial..."
              sublabel="Accessing verified museum specimen database for randomized curator challenges"
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'detective' && (
              <motion.div
                key="detective"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <HolotypeDetective
                  roster={roster}
                  allSpecies={speciesPool}
                  onScore={handleScore}
                />
              </motion.div>
            )}

            {activeTab === 'caliper' && (
              <motion.div
                key="caliper"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CaliperGuesser
                  allSpecies={speciesPool}
                  onScore={handleScore}
                />
              </motion.div>
            )}

            {activeTab === 'chrono' && (
              <motion.div
                key="chrono"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ChronoSorter
                  allSpecies={speciesPool}
                  onScore={handleScore}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
