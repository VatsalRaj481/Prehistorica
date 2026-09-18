import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Species, SpeciesRosterItem } from '../../services/api.js';
import { ShieldCheck, AlertCircle, Sparkles, Eye, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HolotypeDetectiveProps {
  roster: SpeciesRosterItem[];
  allSpecies: Species[];
  onScore: (pts: number) => void;
}

export default function HolotypeDetective({ roster, allSpecies, onScore }: HolotypeDetectiveProps) {
  const [target, setTarget] = useState<Species | null>(null);
  const [options, setOptions] = useState<SpeciesRosterItem[]>([]);
  const [cluesRevealed, setCluesRevealed] = useState(1);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const startNewRound = () => {
    if (allSpecies.length < 4 || roster.length < 4) return;

    // Pick random target species with at least 1 interesting fact
    const validTargets = allSpecies.filter(
      (s) => s.interestingFacts && s.interestingFacts.length > 0 && s.timePeriod
    );
    const chosenTarget = validTargets[Math.floor(Math.random() * validTargets.length)];

    // Pick 3 distractors from roster
    const distractors = roster
      .filter((r) => r.id !== chosenTarget.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const fullOptions = [...distractors, {
      id: chosenTarget.id,
      name: chosenTarget.name,
      scientificName: chosenTarget.scientificName,
      clade: chosenTarget.clade,
      timePeriod: chosenTarget.timePeriod
    }].sort(() => 0.5 - Math.random());

    setTarget(chosenTarget);
    setOptions(fullOptions);
    setCluesRevealed(1);
    setSelectedGuess(null);
    setIsAnswered(false);
  };

  useEffect(() => {
    if (allSpecies.length > 0 && !target) {
      startNewRound();
    }
  }, [allSpecies, target]);

  if (!target) {
    return (
      <div className="p-8 text-center font-mono text-slate-400">
        Preparing mystery holotype specimen...
      </div>
    );
  }

  const handleRevealNextClue = () => {
    if (cluesRevealed < 3) {
      setCluesRevealed((c) => c + 1);
    }
  };

  const handleGuess = (id: number) => {
    if (isAnswered) return;
    setSelectedGuess(id);
    setIsAnswered(true);

    const isCorrect = id === target.id;
    if (isCorrect) {
      // 1 clue = 100pts, 2 clues = 70pts, 3 clues = 45pts
      const pts = cluesRevealed === 1 ? 100 : cluesRevealed === 2 ? 70 : 45;
      onScore(pts);
    }
  };

  const isCorrect = selectedGuess === target.id;
  const silhouetteUrl = target.comparisonSilhouette?.url;

  return (
    <div className="space-y-6 font-mono">
      {/* Round Header & Clue Progress */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase">
            Detective Challenge
          </span>
          <span className="text-xs text-slate-400">Clues Active: {cluesRevealed}/3</span>
        </div>

        {cluesRevealed < 3 && !isAnswered && (
          <button
            onClick={handleRevealNextClue}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-white/[0.08] text-amber-400 hover:text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="h-3 w-3" /> Reveal Next Diagnostic Clue (-25 pts)
          </button>
        )}
      </div>

      {/* Clues Presentation Plinth */}
      <div className="space-y-3">
        {/* Clue 1: Geologic Setting */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-1">
          <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Diagnostic Clue #1 &bull; Chronostratigraphy & Provenance
          </span>
          <p className="text-xs text-slate-200 font-sans leading-relaxed">
            Fossils excavated from the <strong className="text-amber-400 font-mono">{target.fossilFormation || 'official paleontology beds'}</strong>, dating back to the{' '}
            <strong className="text-slate-100">{target.timePeriod}</strong> ({target.myaStart}–{target.myaEnd} Ma). It belonged to the clade <strong className="text-amber-300">{target.clade}</strong>.
          </p>
        </div>

        {/* Clue 2: Anatomical / Dietary Trait */}
        {cluesRevealed >= 2 && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] space-y-1"
          >
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Diagnostic Clue #2 &bull; Anatomical & Paleobiological Trait
            </span>
            <p className="text-xs text-slate-200 font-sans leading-relaxed italic">
              "{target.interestingFacts[0]}"
            </p>
          </motion.div>
        )}

        {/* Clue 3: Silhouette Outline */}
        {cluesRevealed >= 3 && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-slate-950 border border-white/[0.08] flex flex-col items-center justify-center space-y-2"
          >
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest">
              Diagnostic Clue #3 &bull; Skeletal Silhouette Profile
            </span>
            {silhouetteUrl ? (
              <img
                src={silhouetteUrl}
                alt="Mystery specimen silhouette"
                className="h-28 w-auto object-contain filter invert opacity-80"
              />
            ) : (
              <div className="h-24 flex items-center justify-center text-xs text-slate-500">
                [Silhouette Encrypted] Total Length: ~{target.lengthM ? `${target.lengthM}m` : 'Disputed'}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Answer Options Grid */}
      <div className="space-y-2 pt-2">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          Identify the Prehistoric Genus:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {options.map((opt) => {
            const isSelected = selectedGuess === opt.id;
            const isTargetOpt = opt.id === target.id;

            let btnStyle = 'bg-slate-900/90 border-white/[0.08] hover:border-amber-500/50 hover:bg-slate-850 text-slate-200';
            if (isAnswered) {
              if (isTargetOpt) {
                btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md';
              } else if (isSelected) {
                btnStyle = 'bg-red-500/20 border-red-500 text-red-300';
              } else {
                btnStyle = 'bg-slate-900/40 border-white/[0.04] text-slate-600 opacity-60';
              }
            }

            return (
              <button
                key={opt.id}
                disabled={isAnswered}
                onClick={() => handleGuess(opt.id)}
                className={`p-3 rounded-xl border text-left transition-all font-sans cursor-pointer ${btnStyle}`}
              >
                <p className="text-sm font-bold uppercase truncate">{opt.name}</p>
                <p className="text-[10px] font-mono text-slate-400 italic truncate">
                  {opt.scientificName || opt.clade}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Post-Answer Result & Next Round */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl ${
            isCorrect ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-red-950/30 border-red-500/40'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase text-emerald-400">
                    Correct Identification! (+{cluesRevealed === 1 ? 100 : cluesRevealed === 2 ? 70 : 45} pts)
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-bold uppercase text-red-400">
                    Incorrect. It was {target.name} ({target.scientificName}).
                  </span>
                </>
              )}
            </div>
            {target.nameMeaning && (
              <p className="text-[11px] text-slate-300 font-sans">
                Meaning: "{target.nameMeaning}"
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-xs w-full sm:w-auto justify-end">
            <Link
              to={`/species/${target.id}`}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-slate-300 hover:text-white uppercase font-bold"
            >
              Exhibit Profile
            </Link>
            <button
              onClick={startNewRound}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 uppercase font-black flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <RefreshCw className="h-3 w-3" /> Next Case
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
