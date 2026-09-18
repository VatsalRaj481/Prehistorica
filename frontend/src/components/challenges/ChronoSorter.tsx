import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Species } from '../../services/api.js';
import { Clock, ShieldCheck, AlertCircle, RefreshCw, ChevronUp, ChevronDown, ArrowDown } from 'lucide-react';

interface ChronoSorterProps {
  allSpecies: Species[];
  onScore: (pts: number) => void;
}

export default function ChronoSorter({ allSpecies, onScore }: ChronoSorterProps) {
  const [items, setItems] = useState<Species[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isPerfect, setIsPerfect] = useState(false);

  const startNewRound = () => {
    if (allSpecies.length < 10) return;

    // Filter species with confirmed myaStart
    const valid = allSpecies.filter((s) => s.myaStart && s.myaStart > 0 && s.timePeriod);

    // Pick 4 species from distinct time intervals (spread across at least 30+ Ma)
    const sortedByTime = [...valid].sort((a, b) => b.myaStart - a.myaStart);
    const step = Math.floor(sortedByTime.length / 4);

    const picked: Species[] = [
      sortedByTime[Math.floor(Math.random() * (step * 0.9))],
      sortedByTime[step + Math.floor(Math.random() * (step * 0.9))],
      sortedByTime[step * 2 + Math.floor(Math.random() * (step * 0.9))],
      sortedByTime[step * 3 + Math.floor(Math.random() * (step * 0.9))]
    ].filter(Boolean);

    // Shuffle them so they aren't in correct order initially
    const shuffled = [...picked].sort(() => 0.5 - Math.random());
    setItems(shuffled);
    setIsVerified(false);
    setIsPerfect(false);
  };

  useEffect(() => {
    if (allSpecies.length > 0 && items.length === 0) {
      startNewRound();
    }
  }, [allSpecies, items]);

  if (items.length < 4) {
    return <div className="p-8 text-center font-mono text-slate-400">Assembling chronostratigraphic layers...</div>;
  }

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (isVerified) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const copy = [...items];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setItems(copy);
  };

  const handleVerify = () => {
    if (isVerified) return;
    setIsVerified(true);

    // Check if myaStart is monotonically decreasing (Oldest -> Newest)
    let correct = true;
    for (let i = 0; i < items.length - 1; i++) {
      if (items[i].myaStart < items[i + 1].myaStart) {
        correct = false;
        break;
      }
    }

    setIsPerfect(correct);
    if (correct) {
      onScore(100);
    } else {
      // Partial credit
      onScore(35);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Instructions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div className="space-y-0.5">
          <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Chronostratigraphic Order Challenge
          </span>
          <p className="text-xs text-slate-300 font-sans">
            Arrange these 4 prehistoric species from <strong>Deepest Time (Oldest MYA)</strong> at the top to <strong>Most Recent</strong> at the bottom.
          </p>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase">
          <span>Oldest First</span>
          <ArrowDown className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Tiles Sequence */}
      <div className="space-y-2.5">
        {items.map((sp, idx) => {
          const imgUrl = sp.reconstructionImageUrl || sp.media?.[0]?.url || '/logo.png';
          return (
            <motion.div
              key={sp.id}
              layout
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                isVerified
                  ? 'bg-slate-900/90 border-white/[0.08]'
                  : 'bg-slate-900/70 border-white/[0.08] hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="h-7 w-7 rounded-lg bg-slate-950 border border-white/[0.08] flex items-center justify-center text-xs font-black text-amber-400 shrink-0">
                  #{idx + 1}
                </span>

                <div className="h-12 w-12 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-white/[0.06]">
                  <img
                    src={imgUrl}
                    alt={sp.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-100 uppercase font-sans truncate">{sp.name}</h4>
                  <p className="text-[10px] italic text-slate-400 truncate">{sp.scientificName}</p>
                  {isVerified && (
                    <p className="text-[11px] text-amber-400 font-bold mt-0.5">
                      {sp.timePeriod} &bull; {sp.myaStart}–{sp.myaEnd} Ma
                    </p>
                  )}
                </div>
              </div>

              {/* Move Buttons */}
              {!isVerified && (
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 rounded bg-slate-950 border border-white/[0.06] text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move Earlier in Deep Time"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={idx === items.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 rounded bg-slate-950 border border-white/[0.06] text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move Later in Deep Time"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Verification / Result Footer */}
      {!isVerified ? (
        <button
          onClick={handleVerify}
          className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-lg"
        >
          Verify Stratigraphic Sequence
        </button>
      ) : (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl ${
            isPerfect ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-amber-950/30 border-amber-500/40'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isPerfect ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase text-emerald-400">
                    Flawless Chronostratigraphy! (+100 pts)
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase text-amber-400">
                    Partial Stratigraphic Accuracy (+35 pts)
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-300 font-sans">
              Review each creature's exact epoch and Ma range above.
            </p>
          </div>

          <button
            onClick={startNewRound}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 uppercase font-black flex items-center gap-1.5 cursor-pointer shadow-md text-xs"
          >
            <RefreshCw className="h-3 w-3" /> Next Chrono Set
          </button>
        </div>
      )}
    </div>
  );
}
