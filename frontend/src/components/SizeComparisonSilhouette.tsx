import { useMemo } from 'react';

interface SizeComparisonSilhouetteProps {
  speciesName: string;
  lengthM: number | null;
  heightM: number | null;
  weightKg: number | null;
  clade?: string;
}

export default function SizeComparisonSilhouette({
  speciesName,
  lengthM,
  heightM,
  weightKg,
  clade
}: SizeComparisonSilhouetteProps) {
  const humanHeightM = 1.8;
  const humanWidthM = 0.5;

  const targetLength = Math.max(0.1, lengthM || 5);
  const targetHeight = Math.max(0.05, heightM || targetLength * 0.4);

  // Layout Canvas Dimensions
  const canvasWidth = 720;
  const canvasHeight = 240;

  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const plotWidth = canvasWidth - paddingLeft - paddingRight; // 640px
  const plotHeight = canvasHeight - paddingTop - paddingBottom; // 170px

  // Determine meter bounds for X and Y axes
  const humanStartX = 0.3;
  const humanEndX = humanStartX + humanWidthM; // 0.8m
  const creatureStartX = humanEndX + 0.5; // 1.3m
  const creatureEndX = creatureStartX + targetLength; // 1.3 + targetLength

  const totalRequiredMetersX = Math.max(creatureEndX * 1.08, 2.5);
  const totalRequiredMetersY = Math.max(targetHeight * 1.15, humanHeightM * 1.15, 1.2);

  // Dynamic axis grid steps
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

  // Uniform scale (pixels per meter, identical for X and Y to avoid distortion)
  const scaleX = plotWidth / maxMeterX;
  const scaleY = plotHeight / maxMeterY;
  const scale = Math.min(scaleX, scaleY);

  const groundY = paddingTop + maxMeterY * scale;

  // Grid tick arrays
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

  // Positions in SVG space
  const humanPxLeft = paddingLeft + humanStartX * scale;
  const humanPxWidth = humanWidthM * scale;
  const humanPxHeight = humanHeightM * scale;

  const creaturePxLeft = paddingLeft + creatureStartX * scale;
  const creaturePxWidth = targetLength * scale;
  const creaturePxHeight = targetHeight * scale;

  // Select creature silhouette SVG path normalized to (0..1, 0..1)
  const getCreaturePath = (c?: string) => {
    const cladeLower = (c || '').toLowerCase();
    if (cladeLower.includes('theropod')) {
      return "M 0.02 0.55 C 0.12 0.45 0.28 0.35 0.45 0.38 C 0.58 0.4 0.65 0.28 0.72 0.12 C 0.78 0.02 0.88 -0.02 0.95 0.04 C 1.0 0.1 0.98 0.25 0.9 0.32 C 0.8 0.4 0.7 0.48 0.65 0.58 L 0.58 1.0 L 0.5 1.0 C 0.52 0.8 0.54 0.65 0.48 0.6 C 0.42 0.6 0.38 0.78 0.36 1.0 L 0.28 1.0 C 0.3 0.82 0.32 0.68 0.26 0.62 C 0.16 0.62 0.08 0.6 0.02 0.55 Z";
    }
    if (cladeLower.includes('sauropod')) {
      return "M 0 0.55 C 0.1 0.5 0.2 0.38 0.35 0.32 C 0.48 0.3 0.58 0.25 0.68 0.2 C 0.75 0.14 0.8 0.05 0.86 0 C 0.93 0 0.98 0.06 0.96 0.16 C 0.9 0.3 0.82 0.42 0.76 0.52 L 0.78 1.0 L 0.7 1.0 L 0.7 0.62 L 0.58 0.62 L 0.56 1.0 L 0.48 1.0 L 0.5 0.58 L 0.3 0.58 L 0.28 1.0 L 0.2 1.0 L 0.22 0.6 L 0.1 0.62 Z";
    }
    if (cladeLower.includes('pterosaur')) {
      return "M 0.5 0 C 0.55 0.08 0.65 0.18 0.82 0.22 C 0.96 0.26 1.0 0.32 0.95 0.38 C 0.8 0.42 0.65 0.4 0.55 0.48 L 0.54 1.0 L 0.46 1.0 L 0.45 0.48 C 0.35 0.4 0.2 0.42 0.05 0.38 C 0 0.32 0.04 0.26 0.18 0.22 C 0.35 0.18 0.45 0.08 0.5 0 Z";
    }
    if (cladeLower.includes('marine')) {
      return "M 0 0.48 C 0.15 0.32 0.38 0.18 0.62 0.12 C 0.82 0.08 0.96 0.22 1.0 0.42 C 0.96 0.62 0.82 0.78 0.6 0.82 C 0.38 0.85 0.15 0.68 0 0.48 Z M 0.35 0.48 C 0.42 0.72 0.48 0.92 0.52 1.0 C 0.56 1.0 0.52 0.72 0.45 0.48 Z";
    }
    return "M 0 0.45 C 0.12 0.38 0.28 0.28 0.48 0.22 C 0.68 0.18 0.85 0.18 0.98 0.32 C 0.95 0.48 0.82 0.52 0.76 0.56 L 0.76 1.0 L 0.68 1.0 L 0.68 0.6 L 0.36 0.6 L 0.34 1.0 L 0.26 1.0 L 0.28 0.55 C 0.16 0.55 0.06 0.52 0 0.45 Z";
  };

  const creatureSvgPath = getCreaturePath(clade);
  const humanSvgPath = "M 0.5 0 C 0.38 0 0.35 0.06 0.35 0.12 C 0.35 0.18 0.38 0.22 0.5 0.22 C 0.62 0.22 0.65 0.18 0.65 0.12 C 0.65 0.06 0.62 0 0.5 0 Z M 0.3 0.26 C 0.22 0.27 0.1 0.35 0.05 0.52 C 0.02 0.62 0.08 0.65 0.12 0.63 C 0.16 0.6 0.2 0.48 0.24 0.44 L 0.24 0.68 C 0.24 0.72 0.16 0.94 0.16 0.98 C 0.16 1.0 0.24 1.0 0.32 1.0 C 0.34 0.88 0.42 0.66 0.46 0.55 L 0.5 0.55 L 0.54 0.55 C 0.58 0.66 0.66 0.88 0.68 1.0 C 0.76 1.0 0.84 1.0 0.84 0.98 C 0.84 0.94 0.76 0.72 0.76 0.68 L 0.76 0.44 C 0.8 0.48 0.84 0.6 0.88 0.63 C 0.92 0.65 0.98 0.62 0.95 0.52 C 0.9 0.35 0.78 0.27 0.7 0.26 C 0.62 0.25 0.38 0.25 0.3 0.26 Z";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            In-House In-Scale Comparison Graphic
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500/80 border border-blue-400 inline-block" />
            Human (1.8m)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/80 border border-emerald-400 inline-block" />
            {speciesName} ({targetLength}m L &bull; {targetHeight}m H)
          </span>
        </div>
      </div>

      {/* SVG Axis Graphic Container */}
      <div className="relative w-full overflow-hidden bg-slate-950/80 rounded-xl border border-slate-850 p-2">
        <svg
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="w-full h-auto select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="humanSilhouetteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="creatureSilhouetteGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.85" />
            </linearGradient>

            <pattern id="minorGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Background Grid Pattern */}
          <rect
            x={paddingLeft}
            y={paddingTop}
            width={maxMeterX * scale}
            height={maxMeterY * scale}
            fill="url(#minorGrid)"
            opacity="0.5"
          />

          {/* Y Axis Grid Lines & Tick Labels */}
          {ticksY.map((yVal) => {
            const yPx = groundY - yVal * scale;
            if (yPx < paddingTop - 5) return null;
            return (
              <g key={`y-${yVal}`}>
                <line
                  x1={paddingLeft}
                  y1={yPx}
                  x2={paddingLeft + maxMeterX * scale}
                  y2={yPx}
                  stroke={yVal === 0 ? '#475569' : '#334155'}
                  strokeWidth={yVal === 0 ? '2' : '1'}
                  strokeDasharray={yVal === 0 ? 'none' : '3 3'}
                />
                <text
                  x={paddingLeft - 8}
                  y={yPx + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {yVal}m
                </text>
              </g>
            );
          })}

          {/* X Axis Grid Lines & Tick Labels */}
          {ticksX.map((xVal) => {
            const xPx = paddingLeft + xVal * scale;
            if (xPx > paddingLeft + maxMeterX * scale + 5) return null;
            return (
              <g key={`x-${xVal}`}>
                <line
                  x1={xPx}
                  y1={paddingTop}
                  x2={xPx}
                  y2={groundY}
                  stroke={xVal === 0 ? '#475569' : '#334155'}
                  strokeWidth={xVal === 0 ? '2' : '1'}
                  strokeDasharray={xVal === 0 ? 'none' : '3 3'}
                />
                <text
                  x={xPx}
                  y={groundY + 16}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {xVal}m
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text
            x={paddingLeft + (maxMeterX * scale) / 2}
            y={canvasHeight - 6}
            textAnchor="middle"
            fill="#64748b"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="1"
            className="uppercase"
          >
            Length Axis (Meters)
          </text>

          <text
            x={14}
            y={paddingTop + (maxMeterY * scale) / 2}
            textAnchor="middle"
            fill="#64748b"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="1"
            transform={`rotate(-90 14 ${paddingTop + (maxMeterY * scale) / 2})`}
            className="uppercase"
          >
            Height Axis (Meters)
          </text>

          {/* Solid Ground Line */}
          <line
            x1={paddingLeft}
            y1={groundY}
            x2={paddingLeft + maxMeterX * scale}
            y2={groundY}
            stroke="#64748b"
            strokeWidth="2.5"
          />

          {/* Human Silhouette Group */}
          <g transform={`translate(${humanPxLeft}, ${groundY - humanPxHeight})`}>
            <svg
              width={humanPxWidth}
              height={humanPxHeight}
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
            >
              <path
                d={humanSvgPath}
                fill="url(#humanSilhouetteGrad)"
                stroke="#60a5fa"
                strokeWidth="0.03"
              />
            </svg>
            <text
              x={humanPxWidth / 2}
              y={-6}
              textAnchor="middle"
              fill="#93c5fd"
              fontSize="10"
              fontWeight="bold"
            >
              1.8m
            </text>
          </g>

          {/* Creature Silhouette Group */}
          <g transform={`translate(${creaturePxLeft}, ${groundY - creaturePxHeight})`}>
            <svg
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

            {/* Top Length Measurement Arrow / Indicator */}
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
          </g>
        </svg>
      </div>

      {/* Metric Stats Footer Bar */}
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
