import { useState, useEffect } from 'react';
import { Species } from '../../services/api.js';
import { Ruler, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatFeet } from '../../utils/formatDimensions.js';

interface CaliperGuesserProps {
  allSpecies: Species[];
  onScore: (pts: number) => void;
}

export default function CaliperGuesser({ allSpecies, onScore }: CaliperGuesserProps) {
  const [target, setTarget] = useState<Species | null>(null);
  const [guessM, setGuessM] = useState<number>(5.0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [precisionScore, setPrecisionScore] = useState<number | null>(null);

  const startNewRound = () => {
    const valid = allSpecies.filter(
      (s) => s.lengthM && s.lengthM > 0.5 && s.comparisonSilhouette?.url
    );
    if (valid.length === 0) return;

    const chosen = valid[Math.floor(Math.random() * valid.length)];
    setTarget(chosen);
    setGuessM(Math.min(15, Math.max(1.5, Math.round((chosen.lengthM || 5) * (0.6 + Math.random() * 0.8)))));
    setIsSubmitted(false);
    setPrecisionScore(null);
  };

  useEffect(() => {
    if (allSpecies.length > 0 && !target) {
      startNewRound();
    }
  }, [allSpecies, target]);

  if (!target) {
    return <div className="p-8 text-center font-mono text-slate-400">Loading mystery metric specimen...</div>;
  }

  const actualLen = target.lengthM || 5.0;
  const actualH = target.heightM || Math.max(1, actualLen * 0.35);

  const handleSubmitGuess = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    const diffPct = Math.abs(guessM - actualLen) / actualLen;
    let earnedPts = 10;
    if (diffPct <= 0.05) {
      earnedPts = 100;
    } else if (diffPct <= 0.15) {
      earnedPts = 75;
    } else if (diffPct <= 0.30) {
      earnedPts = 45;
    } else if (diffPct <= 0.50) {
      earnedPts = 25;
    }

    setPrecisionScore(earnedPts);
    onScore(earnedPts);
  };

  // Stage coordinate scaling
  const stageRange = Math.max(12, actualLen * 1.45 + 3.0);
  const viewWidth = 800;
  const viewHeight = 320;
  const scale = viewWidth / stageRange;
  const groundY = viewHeight - 50;

  const silhouetteUrl = target.comparisonSilhouette?.url;

  return (
    <div className="space-y-6 font-mono">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="space-y-0.5">
          <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5" /> Caliper Metric Guesser
          </span>
          <p className="text-xs text-slate-300 font-sans">
            Estimate this creature's length by comparing it against the 1.8m human reference figure.
          </p>
        </div>

        <span className="px-2.5 py-1 rounded bg-slate-900 border border-white/[0.08] text-xs text-amber-300 font-bold uppercase">
          Clade: {target.clade}
        </span>
      </div>

      {/* Metric Projection Stage */}
      <div className="w-full bg-slate-950 rounded-2xl border border-white/[0.08] p-4 relative overflow-hidden shadow-2xl">
        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-auto drop-shadow-md select-none">
          <defs>
            <filter id="guesserTint" x="-10%" y="-10%" width="120%" height="120%">
              <feColorMatrix
                type="matrix"
                values="
                  0 0 0 0 0.85
                  0 0 0 0 0.88
                  0 0 0 0 0.95
                  0 0 0 0.90 0
                "
              />
            </filter>
          </defs>

          {/* Baseline Ground Line */}
          <line x1="0" y1={groundY} x2={viewWidth} y2={groundY} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 2" />

          {/* Reference Human (1.8m) */}
          <g transform={`translate(${2.0 * scale}, 0)`}>
            <image
              href="https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/reference-human.svg"
              x="0"
              y={groundY - 1.8 * scale}
              width={0.95 * scale}
              height={1.8 * scale}
              preserveAspectRatio="xMidYMax meet"
              opacity="0.8"
            />
            <text x={(0.95 * scale) / 2} y={groundY + 16} fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">
              1.8m Human
            </text>
          </g>

          {/* Mystery Creature Silhouette */}
          <g transform={`translate(${5.0 * scale}, 0)`}>
            {silhouetteUrl && (
              <image
                href={silhouetteUrl}
                x="0"
                y={groundY - actualH * scale}
                width={actualLen * scale}
                height={actualH * scale}
                preserveAspectRatio="none"
                filter="url(#guesserTint)"
              />
            )}

            {/* Revealed Calipers upon submission */}
            {isSubmitted && (
              <g>
                <line x1="0" y1={groundY - actualH * scale - 14} x2={actualLen * scale} y2={groundY - actualH * scale - 14} stroke="#F59E0B" strokeWidth="1.5" />
                <line x1="0" y1={groundY - actualH * scale - 18} x2="0" y2={groundY - actualH * scale - 10} stroke="#F59E0B" strokeWidth="1.5" />
                <line x1={actualLen * scale} y1={groundY - actualH * scale - 18} x2={actualLen * scale} y2={groundY - actualH * scale - 10} stroke="#F59E0B" strokeWidth="1.5" />

                <g transform={`translate(${(actualLen * scale) / 2}, ${groundY - actualH * scale - 14})`}>
                  <rect x="-38" y="-10" width="76" height="18" rx="4" fill="#080C16" stroke="#F59E0B" strokeWidth="1" />
                  <text x="0" y="3" fill="#F59E0B" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {actualLen.toFixed(1)}m ({formatFeet(actualLen)})
                  </text>
                </g>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Interactive Guess Slider & Controls */}
      <div className="museum-plinth rounded-xl p-5 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300 uppercase font-bold">
            Your Metric Estimate:
          </span>
          <span className="text-xl font-black text-amber-400 font-mono tabular-nums">
            {guessM.toFixed(1)} Meters <span className="text-xs text-slate-400 font-normal">({formatFeet(guessM)})</span>
          </span>
        </div>

        <input
          type="range"
          min="0.5"
          max="35"
          step="0.5"
          disabled={isSubmitted}
          value={guessM}
          onChange={(e) => setGuessM(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />

        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>0.5m (Micro)</span>
          <span>10m (Medium)</span>
          <span>20m (Large)</span>
          <span>35m (Titan)</span>
        </div>

        {!isSubmitted ? (
          <button
            onClick={handleSubmitGuess}
            className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-lg"
          >
            Lock In Metric Estimate
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-2">
              <div>
                <h4 className="text-base font-bold text-slate-100 uppercase font-sans">
                  {target.name} <span className="text-xs italic font-mono text-amber-400">({target.scientificName})</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Actual: <strong className="text-amber-400">{actualLen}m</strong> &bull; Your Guess: <strong className="text-slate-200">{guessM}m</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-amber-400">+{precisionScore} Points</span>
                <p className="text-[10px] text-slate-400 uppercase">
                  {precisionScore && precisionScore >= 75 ? '🎯 Flawless Precision' : 'Field Estimate'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 text-xs pt-1">
              <Link
                to={`/species/${target.id}`}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/[0.08] text-slate-300 hover:text-white uppercase font-bold"
              >
                View Full Exhibit
              </Link>
              <button
                onClick={startNewRound}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 uppercase font-black flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <RefreshCw className="h-3 w-3" /> Next Silhouette
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
