import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SizeComparisonSilhouetteProps {
  speciesName?: string;
  lengthM: number | null;
  heightM: number | null;
  weightKg: number | null;
  clade?: string;
}

export default function SizeComparisonSilhouette({
  lengthM,
  heightM,
  weightKg,
  clade
}: SizeComparisonSilhouetteProps) {
  const shouldReduceMotion = useReducedMotion();

  const humanHeightM = 1.8;
  const humanWidthM = 0.5;

  const targetLength = Math.max(0.1, lengthM || 5);
  const targetHeight = Math.max(0.05, heightM || targetLength * 0.4);

  const canvasWidth = 720;
  const canvasHeight = 240;

  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const plotWidth = canvasWidth - paddingLeft - paddingRight;
  const plotHeight = canvasHeight - paddingTop - paddingBottom;

  const humanStartX = 0.3;
  const humanEndX = humanStartX + humanWidthM;
  const creatureStartX = humanEndX + 0.5;
  const creatureEndX = creatureStartX + targetLength;

  const totalRequiredMetersX = Math.max(creatureEndX * 1.08, 2.5);
  const totalRequiredMetersY = Math.max(targetHeight * 1.15, humanHeightM * 1.15, 1.2);

  const getGridStep = (maxM: number) => {
    if (maxM <= 1) return 0.2;
    if (maxM <= 2.5) return 0.5;
    if (maxM <= 8) return 1;
    if (maxM <= 18) return 2;
    if (maxM <= 35) return 5;
    return 10;
  };

  const stepX = getGridStep(totalRequiredMetersX);
  const stepY = getGridStep(totalRequiredMetersY);

  const maxMeterX = Math.ceil(totalRequiredMetersX / stepX) * stepX;
  const maxMeterY = Math.ceil(totalRequiredMetersY / stepY) * stepY;

  const scaleX = plotWidth / maxMeterX;
  const scaleY = plotHeight / maxMeterY;
  const scale = Math.min(scaleX, scaleY);

  const groundY = paddingTop + maxMeterY * scale;

  const ticksX = useMemo(() => {
    const arr: number[] = [];
    for (let x = 0; x <= maxMeterX + 0.001; x += stepX) {
      arr.push(Number(x.toFixed(1)));
    }
    return arr;
  }, [maxMeterX, stepX]);

  const ticksY = useMemo(() => {
    const arr: number[] = [];
    for (let y = 0; y <= maxMeterY + 0.001; y += stepY) {
      arr.push(Number(y.toFixed(1)));
    }
    return arr;
  }, [maxMeterY, stepY]);

  const humanPxLeft = paddingLeft + humanStartX * scale;
  const humanPxWidth = humanWidthM * scale;
  const humanPxHeight = humanHeightM * scale;

  const creaturePxLeft = paddingLeft + creatureStartX * scale;
  const creaturePxWidth = targetLength * scale;
  const creaturePxHeight = targetHeight * scale;

  const getCreaturePath = (c?: string) => {
    const cladeLower = (c || '').toLowerCase();
    if (cladeLower.includes('theropod')) {
      return "M 0.02 0.55 C 0.12 0.45 0.28 0.35 0.45 0.38 C 0.58 0.4 0.65 0.28 0.72 0.12 C 0.78 0.02 0.88 -0.02 0.95 0.04 C 1.0 0.1 0.98 0.25 0.9 0.32 C 0.8 0.4 0.7 0.48 0.65 0.58 L 0.58 1.0 L 0.5 1.0 C 0.52 0.8 0.54 0.65 0.48 0.6 C 0.42 0.6 0.38 0.78 0.36 1.0 L 0.28 1.0 C 0.3 0.82 0.32 0.68 0.26 0.62 C 0.16 0.62 0.08 0.6 0.02 0.55 Z";
    }
    if (cladeLower.includes('sauropod')) {
      return "M 0.02 0.75 C 0.08 0.7 0.15 0.55 0.22 0.35 C 0.28 0.18 0.32 0.02 0.38 0.02 C 0.44 0.02 0.46 0.15 0.42 0.35 C 0.45 0.42 0.55 0.45 0.7 0.48 C 0.85 0.52 0.95 0.65 0.98 0.72 L 0.92 1.0 L 0.84 1.0 L 0.86 0.75 L 0.68 0.75 L 0.64 1.0 L 0.56 1.0 L 0.6 0.75 L 0.4 0.75 L 0.36 1.0 L 0.28 1.0 L 0.32 0.75 L 0.18 0.75 L 0.02 0.75 Z";
    }
    if (cladeLower.includes('pterosaur')) {
      return "M 0.5 0.8 C 0.3 0.6 0.1 0.4 0.02 0.2 C -0.02 0.1 0.05 0.05 0.15 0.15 C 0.3 0.3 0.42 0.5 0.5 0.6 C 0.58 0.5 0.7 0.3 0.85 0.15 C 0.95 0.05 1.02 0.1 0.98 0.2 C 0.9 0.4 0.7 0.6 0.5 0.8 Z";
    }
    if (cladeLower.includes('marine') || cladeLower.includes('ichthyosaur') || cladeLower.includes('plesiosaur')) {
      return "M 0.02 0.5 C 0.15 0.3 0.35 0.2 0.55 0.25 C 0.75 0.3 0.92 0.42 0.98 0.5 C 0.92 0.58 0.75 0.7 0.55 0.75 C 0.35 0.8 0.15 0.7 0.02 0.5 Z";
    }
    return "M 0.05 0.65 C 0.15 0.45 0.35 0.4 0.5 0.42 C 0.65 0.45 0.8 0.35 0.9 0.25 C 0.95 0.2 0.98 0.3 0.92 0.45 C 0.82 0.6 0.7 0.68 0.65 1.0 L 0.55 1.0 C 0.58 0.8 0.52 0.68 0.45 0.68 L 0.3 1.0 L 0.2 1.0 C 0.22 0.8 0.18 0.65 0.05 0.65 Z";
  };

  const creatureSvgPath = getCreaturePath(clade);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
            Scale Comparison vs Human (1.8m)
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-semibold bg-slate-950 px-3 py-1 rounded-full border border-slate-800 w-fit">
          1:1 Dynamic Scale Grid
        </span>
      </div>

      <div className="relative w-full overflow-x-auto bg-slate-950 rounded-xl border border-slate-850 p-2 shadow-inner">
        <svg
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="w-full h-auto min-w-[600px]"
        >
          <defs>
            <linearGradient id="humanSilhouetteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="creatureSilhouetteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.5" />
            </linearGradient>
            <pattern id="plotGridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" opacity="0.6" />
            </pattern>
          </defs>

          <rect
            x={paddingLeft}
            y={paddingTop}
            width={plotWidth}
            height={plotHeight}
            fill="url(#plotGridPattern)"
          />

          {ticksX.map((tick) => {
            const px = paddingLeft + tick * scale;
            if (px > canvasWidth - paddingRight + 2) return null;
            return (
              <g key={`x-${tick}`}>
                <line
                  x1={px}
                  y1={paddingTop}
                  x2={px}
                  y2={groundY}
                  stroke="#334155"
                  strokeWidth="0.75"
                  strokeDasharray="2,2"
                />
                <text
                  x={px}
                  y={groundY + 16}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {tick}m
                </text>
              </g>
            );
          })}

          {ticksY.map((tick) => {
            const py = groundY - tick * scale;
            if (py < paddingTop - 2) return null;
            return (
              <g key={`y-${tick}`}>
                <line
                  x1={paddingLeft}
                  y1={py}
                  x2={paddingLeft + maxMeterX * scale}
                  y2={py}
                  stroke="#334155"
                  strokeWidth="0.75"
                  strokeDasharray="2,2"
                />
                <text
                  x={paddingLeft - 8}
                  y={py + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {tick}m
                </text>
              </g>
            );
          })}

          <line
            x1={paddingLeft - 10}
            y1={groundY}
            x2={canvasWidth - paddingRight + 10}
            y2={groundY}
            stroke="#475569"
            strokeWidth="2"
          />

          <motion.g
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            transform={`translate(${humanPxLeft}, ${groundY - humanPxHeight})`}
          >
            <rect
              x="0"
              y="0"
              width={humanPxWidth}
              height={humanPxHeight}
              rx={humanPxWidth * 0.25}
              fill="url(#humanSilhouetteGrad)"
              stroke="#38bdf8"
              strokeWidth="1"
            />
            <circle
              cx={humanPxWidth / 2}
              cy={-humanPxWidth * 0.4}
              r={humanPxWidth * 0.45}
              fill="url(#humanSilhouetteGrad)"
              stroke="#38bdf8"
              strokeWidth="1"
            />
            <text
              x={humanPxWidth / 2}
              y={humanPxHeight + 14}
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="10"
              fontWeight="bold"
            >
              Human (1.8m)
            </text>
          </motion.g>

          <motion.g
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28, delay: 0.1 }}
            transform={`translate(${creaturePxLeft}, ${groundY - creaturePxHeight})`}
          >
            <svg
              x="0"
              y="0"
              width={creaturePxWidth}
              height={creaturePxHeight}
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
            >
              <path
                d={creatureSvgPath}
                fill="url(#creatureSilhouetteGrad)"
                stroke="#34d399"
                strokeWidth="0.02"
              />
            </svg>

            <g transform={`translate(0, ${-8})`}>
              <line x1="0" y1="0" x2={creaturePxWidth} y2="0" stroke="#34d399" strokeWidth="1.5" />
              <line x1="0" y1="-3" x2="0" y2="3" stroke="#34d399" strokeWidth="1.5" />
              <line x1={creaturePxWidth} y1="-3" x2={creaturePxWidth} y2="3" stroke="#34d399" strokeWidth="1.5" />
              <text
                x={creaturePxWidth / 2}
                y={-5}
                textAnchor="middle"
                fill="#6ee7b7"
                fontSize="11"
                fontWeight="extrabold"
              >
                {targetLength}m length
              </text>
            </g>
          </motion.g>
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Length</span>
          <p className="font-extrabold text-emerald-400">{targetLength} m</p>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Height</span>
          <p className="font-extrabold text-emerald-400">{targetHeight} m</p>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Estimated Mass</span>
          <p className="font-extrabold text-slate-200">{weightKg ? `${weightKg.toLocaleString()} kg` : 'Unknown'}</p>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Scale Ratio</span>
          <p className="font-extrabold text-blue-400">{(targetLength / humanHeightM).toFixed(1)}x human</p>
        </div>
      </div>
    </div>
  );
}
