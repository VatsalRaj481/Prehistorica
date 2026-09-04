import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { User, Car, Bus, Layers, ExternalLink, ShieldCheck, AlertTriangle, Eye, Ruler, ArrowLeftRight } from 'lucide-react';
import { formatMass } from '../utils/formatMass.js';
import { formatFeet } from '../utils/formatDimensions.js';

export interface SilhouetteData {
  url?: string | null;
  sourceUrl?: string | null;
  license?: string | null;
  credit?: string | null;
  taxon?: string | null;
  taxonMatch?: 'species-specific' | 'generic approximation, not species-specific' | string | null;
}

interface TwoDScaleViewerProps {
  speciesName: string;
  scientificName?: string;
  lengthM?: number | null;
  heightM?: number | null;
  weightKg?: number | null;
  clade?: string | null;
  silhouette?: SilhouetteData | null;
}

type ReferenceType = 'human' | 'car' | 'bus' | 'elephant';

interface ReferenceConfig {
  name: string;
  lengthM: number;
  heightM: number;
  label: string;
  renderPath: (scale: number, groundY: number, startX: number, flip: boolean) => JSX.Element;
}

export default function TwoDScaleViewer({
  speciesName,
  scientificName,
  lengthM,
  heightM,
  weightKg,
  clade,
  silhouette
}: TwoDScaleViewerProps) {
  const [refType, setRefType] = useState<ReferenceType>('human');
  const [showGrid, setShowGrid] = useState(true);
  const [showCalipers, setShowCalipers] = useState(true);
  const [faceCreature, setFaceCreature] = useState(false);
  const [silhouetteAspect, setSilhouetteAspect] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Dynamically load image natural aspect ratio so silhouette is scaled accurately without clipping or empty bounding boxes
  useEffect(() => {
    if (!silhouette?.url) {
      setSilhouetteAspect(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setSilhouetteAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = silhouette.url;
  }, [silhouette?.url]);

  const safeLength = lengthM && lengthM > 0 ? lengthM : 6;
  const safeHeight = heightM && heightM > 0 ? heightM : Math.max(1, safeLength * 0.35);

  // References configuration with real metric dimensions
  const references: Record<ReferenceType, ReferenceConfig> = {
    human: {
      name: 'Human',
      lengthM: 0.95,
      heightM: 1.8,
      label: '1.8m Human',
      renderPath: (scale, groundY, startX, flip) => {
        const hPx = 1.8 * scale;
        const wPx = 0.95 * scale;
        const y = groundY - hPx;
        return (
          <g
            key="human"
            transform={
              flip
                ? `translate(${startX + wPx}, ${y}) scale(-1, 1)`
                : `translate(${startX}, ${y})`
            }
          >
            {/* Calibrated Self-hosted PhyloPic Human Silhouette (Homo sapiens by Guillaume Dera, CC0 1.0) */}
            <image
              href="https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/reference-human.svg"
              x="0"
              y="0"
              width={wPx}
              height={hPx}
              preserveAspectRatio="xMidYMax meet"
              filter="url(#chalkSlateTint)"
            />
          </g>
        );
      }
    },
    car: {
      name: 'Vehicle',
      lengthM: 4.5,
      heightM: 1.6,
      label: '4.5m Vehicle',
      renderPath: (scale, groundY, startX, flip) => {
        const hPx = 1.6 * scale;
        const wPx = 4.5 * scale;
        const y = groundY - hPx;
        const wheelR = hPx * 0.16;
        const wheelCenterY = hPx - wheelR;
        return (
          <g
            key="car"
            transform={
              flip
                ? `translate(${startX + wPx}, ${y}) scale(-1, 1)`
                : `translate(${startX}, ${y})`
            }
          >
            {/* Sedan car silhouette */}
            <path
              d={`M 0 ${hPx * 0.75} 
                  C 0 ${hPx * 0.65}, ${wPx * 0.05} ${hPx * 0.55}, ${wPx * 0.2} ${hPx * 0.55} 
                  L ${wPx * 0.35} ${hPx * 0.2} 
                  C ${wPx * 0.4} ${hPx * 0.15}, ${wPx * 0.65} ${hPx * 0.15}, ${wPx * 0.7} ${hPx * 0.2} 
                  L ${wPx * 0.85} ${hPx * 0.55} 
                  L ${wPx * 0.98} ${hPx * 0.6} 
                  C ${wPx} ${hPx * 0.65}, ${wPx} ${hPx * 0.82}, ${wPx * 0.95} ${hPx * 0.82} 
                  L ${wPx * 0.85} ${hPx * 0.82} 
                  A ${wheelR * 1.2} ${wheelR * 1.2} 0 0 0 ${wPx * 0.65} ${hPx * 0.82} 
                  L ${wPx * 0.35} ${hPx * 0.82} 
                  A ${wheelR * 1.2} ${wheelR * 1.2} 0 0 0 ${wPx * 0.15} ${hPx * 0.82} 
                  L 0 ${hPx * 0.82} 
                  Z`}
              fill="#94A3B8"
            />
            {/* Wheels calibrated to touch ground line exactly at hPx */}
            <circle cx={wPx * 0.25} cy={wheelCenterY} r={wheelR} fill="#334155" />
            <circle cx={wPx * 0.75} cy={wheelCenterY} r={wheelR} fill="#334155" />
          </g>
        );
      }
    },
    bus: {
      name: 'Transit Bus',
      lengthM: 11.5,
      heightM: 3.0,
      label: '11.5m Bus',
      renderPath: (scale, groundY, startX, flip) => {
        const hPx = 3.0 * scale;
        const wPx = 11.5 * scale;
        const y = groundY - hPx;
        const wheelR = hPx * 0.14;
        const wheelCenterY = hPx - wheelR;
        return (
          <g
            key="bus"
            transform={
              flip
                ? `translate(${startX + wPx}, ${y}) scale(-1, 1)`
                : `translate(${startX}, ${y})`
            }
          >
            {/* Bus silhouette body */}
            <rect x="0" y="0" width={wPx} height={hPx - wheelR * 0.75} rx={hPx * 0.08} fill="#94A3B8" />
            {/* Wheels calibrated to touch ground line exactly at hPx */}
            <circle cx={wPx * 0.2} cy={wheelCenterY} r={wheelR} fill="#334155" />
            <circle cx={wPx * 0.82} cy={wheelCenterY} r={wheelR} fill="#334155" />
          </g>
        );
      }
    },
    elephant: {
      name: 'African Bush Elephant',
      lengthM: 4.71,
      heightM: 3.3,
      label: '3.3m African Elephant',
      renderPath: (scale, groundY, startX, flip) => {
        const hPx = 3.3 * scale;
        const wPx = 4.71 * scale;
        const y = groundY - hPx;
        return (
          <g
            key="elephant"
            transform={
              flip
                ? `translate(${startX + wPx}, ${y}) scale(-1, 1)`
                : `translate(${startX}, ${y})`
            }
          >
            {/* Calibrated Self-hosted PhyloPic African Bush Elephant (Loxodonta africana by Chuanxin Yu, CC0 1.0) */}
            <image
              href="https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/reference-african-bush-elephant.svg"
              x="0"
              y="0"
              width={wPx}
              height={hPx}
              preserveAspectRatio="xMidYMax meet"
              filter="url(#chalkSlateTint)"
            />
          </g>
        );
      }
    }
  };

  const activeRef = references[refType];

  // Effective aspect ratio of the creature silhouette or fallback box
  const effectiveAspect = silhouetteAspect || (safeLength / safeHeight);
  const naturalCreatureHeightM = safeLength / effectiveAspect;
  const effectiveCreatureHeightM = Math.max(safeHeight, naturalCreatureHeightM);

  // Stage physical layout calculations
  const viewBoxWidth = 1000;
  const viewBoxHeight = 400;
  const paddingBottom = 46;
  const paddingTop = 36;
  const paddingLeft = 55;
  const paddingRight = 45;

  const groundY = viewBoxHeight - paddingBottom;
  const availableWidth = viewBoxWidth - paddingLeft - paddingRight;
  const availableHeight = groundY - paddingTop;

  // Total horizontal span: Reference figure + gap + Creature length
  const gapMeters = 1.2;
  const totalSpanMeters = activeRef.lengthM + gapMeters + safeLength;
  const maxVerticalMeters = Math.max(activeRef.heightM, effectiveCreatureHeightM) * 1.15;

  // Scale: pixels per meter (keep aspect ratio 1:1)
  const scale = useMemo(() => {
    const scaleX = availableWidth / (totalSpanMeters * 1.08);
    const scaleY = availableHeight / maxVerticalMeters;
    return Math.min(scaleX, scaleY);
  }, [availableWidth, availableHeight, totalSpanMeters, maxVerticalMeters]);

  const totalSpanPx = totalSpanMeters * scale;
  const stageMarginLeft = paddingLeft + Math.max(25, (availableWidth - totalSpanPx) / 2);
  const refStartX = stageMarginLeft;
  const refWidthPx = activeRef.lengthM * scale;
  const creatureStartX = refStartX + refWidthPx + gapMeters * scale;

  // Calculate creature dimensions matching true aspect ratio
  let creatureWidthPx = safeLength * scale;
  let creatureHeightPx = creatureWidthPx / effectiveAspect;

  if (creatureHeightPx > availableHeight * 0.94) {
    creatureHeightPx = availableHeight * 0.94;
    creatureWidthPx = creatureHeightPx * effectiveAspect;
  }

  const creatureY = groundY - creatureHeightPx;
  const renderedHeightM = Number((creatureHeightPx / scale).toFixed(1));

  // Reference Dimension Badge position above reference figure
  const refBadgeX = refStartX + refWidthPx / 2;
  const refBadgeY = Math.max(16, groundY - activeRef.heightM * scale - 12);

  // Metric Grid Steps
  const gridSteps = useMemo(() => {
    const maxM = Math.ceil(totalSpanMeters + 2);
    let step = 1;
    if (maxM > 25) step = 5;
    else if (maxM > 12) step = 2;
    else if (maxM < 5) step = 0.5;

    const lines: number[] = [];
    for (let m = 0; m <= maxM; m += step) {
      lines.push(m);
    }
    return lines;
  }, [totalSpanMeters]);

  const verticalGridSteps = useMemo(() => {
    const maxH = Math.ceil(maxVerticalMeters);
    let step = 1;
    if (maxH > 15) step = 2;
    else if (maxH < 3) step = 0.5;

    const lines: number[] = [];
    for (let h = 0; h <= maxH; h += step) {
      lines.push(h);
    }
    return lines;
  }, [maxVerticalMeters]);

  const isExact = silhouette?.taxonMatch === 'species-specific';
  const hasSilhouette = Boolean(silhouette?.url);

  return (
    <div className="w-full space-y-3 font-sans">
      {/* 2D Museum Stage Card Container */}
      <div className="w-full bg-[#070B14] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl select-none flex flex-col">
        
        {/* Dedicated Stage Header & Controls Bar (Decoupled from SVG stage to prevent mobile overlay cutoffs) */}
        <div className="p-3 sm:p-4 border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Specimen Badge & Readout */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400">
                2D Scale Comparison Stage
              </span>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
                &bull; 1:1 Metric Projection
              </span>
              {clade && (
                <span className="text-[9px] font-mono text-amber-500/80 uppercase tracking-wider hidden md:inline truncate max-w-[140px]">
                  &bull; {clade.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <h4 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-tight font-mono truncate">
                {speciesName}
              </h4>
              {scientificName && (
                <span className="text-xs text-slate-400 italic hidden md:inline truncate">
                  ({scientificName})
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 tabular-nums">
              Length: <span className="text-amber-400 font-bold">{safeLength}m</span> ({formatFeet(safeLength)}) &bull; Height:{' '}
              <span className="text-amber-400 font-bold">{safeHeight}m</span> ({formatFeet(safeHeight)})
              {weightKg ? ` • Mass: ${formatMass(weightKg)}` : ''}
            </p>
          </div>

          {/* Controls: Reference Switcher & Toggles */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto max-w-full pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Reference Target Switcher */}
            <div className="flex items-center bg-slate-900/90 border border-white/[0.08] rounded-xl p-1 gap-1 shadow-lg shrink-0">
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setRefType('human')}
                className={`min-h-[34px] px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  refType === 'human'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                title="Compare with Human (1.8m)"
                aria-label="Compare with Human scale"
              >
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[10px] sm:text-[11px]">Human (1.8m)</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setRefType('car')}
                className={`min-h-[34px] px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  refType === 'car'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                title="Compare with Vehicle (4.5m)"
                aria-label="Compare with Vehicle scale"
              >
                <Car className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[10px] sm:text-[11px]">Car (4.5m)</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setRefType('bus')}
                className={`min-h-[34px] px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  refType === 'bus'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                title="Compare with Transit Bus (11.5m)"
                aria-label="Compare with Bus scale"
              >
                <Bus className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline text-[10px] sm:text-[11px]">Bus (11.5m)</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setRefType('elephant')}
                className={`min-h-[34px] px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  refType === 'elephant'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                title="Compare with African Elephant (3.3m)"
                aria-label="Compare with African Elephant scale"
              >
                <Layers className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden md:inline text-[10px] sm:text-[11px]">Elephant (3.3m)</span>
              </motion.button>
            </div>

            {/* Toggle Calipers */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowCalipers(!showCalipers)}
              className={`min-h-[34px] min-w-[34px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer shadow-lg flex items-center justify-center shrink-0 ${
                showCalipers
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-slate-900/90 border-white/[0.08] text-slate-400 hover:text-white'
              }`}
              title="Toggle Architectural Caliper Lines"
              aria-label="Toggle Architectural Caliper Lines"
            >
              <Ruler className="h-4 w-4" />
            </motion.button>

            {/* Toggle Grid */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setShowGrid(!showGrid)}
              className={`min-h-[34px] min-w-[34px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer shadow-lg flex items-center justify-center shrink-0 ${
                showGrid
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-slate-900/90 border-white/[0.08] text-slate-400 hover:text-white'
              }`}
              title="Toggle Metric Grid"
              aria-label="Toggle Metric Grid"
            >
              <Eye className="h-4 w-4" />
            </motion.button>

            {/* Toggle Orientation: Face each other vs Parallel */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setFaceCreature(!faceCreature)}
              className={`min-h-[34px] min-w-[34px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer shadow-lg flex items-center justify-center gap-1.5 shrink-0 ${
                faceCreature
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-slate-900/90 border-white/[0.08] text-slate-400 hover:text-white'
              }`}
              title={faceCreature ? "Orientation: Facing Creature (click for Parallel)" : "Orientation: Parallel (Both Left) (click to Face Creature)"}
              aria-label="Toggle figure orientation"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Dedicated SVG Drawing Canvas Stage */}
        <div className="relative w-full h-[280px] sm:h-[360px] md:h-[400px]">
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Museum exhibit background radial gradient */}
              <radialGradient id="stageGlow" cx="50%" cy="80%" r="70%">
                <stop offset="0%" stopColor="#1E1B18" stopOpacity="0.7" />
                <stop offset="60%" stopColor="#0A0E1A" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#050810" stopOpacity="1.0" />
              </radialGradient>

              {/* Uniform Amber Tint Filter for Any Silhouette Source */}
              <filter id="amberTint" colorInterpolationFilters="sRGB">
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.96
                          0 0 0 0 0.62
                          0 0 0 0 0.04
                          0 0 0 1 0"
                />
              </filter>

              {/* Uniform Chalk Slate Filter for Reference Figures */}
              <filter id="chalkSlateTint" colorInterpolationFilters="sRGB">
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.82
                          0 0 0 0 0.86
                          0 0 0 0 0.90
                          0 0 0 1 0"
                />
              </filter>

              {/* Arrow marker for caliper dimension lines */}
              <marker id="arrowAmber" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M 0 1.5 L 4.5 3 L 0 4.5 Z" fill="#F59E0B" />
              </marker>
            </defs>

            {/* Background */}
            <rect width={viewBoxWidth} height={viewBoxHeight} fill="url(#stageGlow)" />

            {/* Architectural Metric Grid */}
            {showGrid && (
              <g opacity="0.35">
                {/* Horizontal height grid lines */}
                {verticalGridSteps.map((m) => {
                  const y = groundY - m * scale;
                  if (y < paddingTop - 10) return null;
                  return (
                    <g key={`v-grid-${m}`}>
                      <line
                        x1={paddingLeft - 10}
                        y1={y}
                        x2={viewBoxWidth - paddingRight}
                        y2={y}
                        stroke="#334155"
                        strokeWidth={m % 5 === 0 ? "1.2" : "0.6"}
                        strokeDasharray={m === 0 ? undefined : "3,3"}
                      />
                      <text
                        x={paddingLeft - 16}
                        y={y + 3}
                        fill="#64748B"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {m}m
                      </text>
                    </g>
                  );
                })}

                {/* Vertical length grid lines */}
                {gridSteps.map((m) => {
                  const x = refStartX + m * scale;
                  if (x > viewBoxWidth - paddingRight) return null;
                  return (
                    <line
                      key={`h-grid-${m}`}
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={groundY}
                      stroke="#1E293B"
                      strokeWidth="0.8"
                      strokeDasharray="2,4"
                    />
                  );
                })}
              </g>
            )}

            {/* Museum Stage Ground Baseline */}
            <line
              x1={paddingLeft - 15}
              y1={groundY}
              x2={viewBoxWidth - paddingRight + 15}
              y2={groundY}
              stroke="#D97706"
              strokeWidth="2"
            />
            {/* Subtle Ground Horizon Shadow */}
            <rect
              x={paddingLeft - 15}
              y={groundY}
              width={viewBoxWidth - paddingLeft - paddingRight + 30}
              height="6"
              fill="rgba(217, 119, 6, 0.15)"
            />

            {/* Scale Reference Model standing flush on ground baseline */}
            <AnimatePresence mode="wait">
              <motion.g
                key={`${refType}-${faceCreature}`}
                initial={shouldReduceMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, x: 12 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              >
                {activeRef.renderPath(scale, groundY, refStartX, faceCreature)}
              </motion.g>
            </AnimatePresence>

            {/* Specimen Silhouette or Envelope Fallback */}
            {hasSilhouette ? (
              <g transform={`translate(${creatureStartX}, ${creatureY})`}>
                {/* Silhouette SVG rendered with true aspect ratio calibrated to ground */}
                <image
                  href={silhouette?.url || ''}
                  x="0"
                  y="0"
                  width={creatureWidthPx}
                  height={creatureHeightPx}
                  preserveAspectRatio="xMidYMax meet"
                  filter="url(#amberTint)"
                  className="transition-all duration-300"
                />
              </g>
            ) : (
              /* Stats-Only Physical Bounding Caliper Stage */
              <g transform={`translate(${creatureStartX}, ${creatureY})`}>
                <rect
                  x="0"
                  y="0"
                  width={creatureWidthPx}
                  height={creatureHeightPx}
                  fill="rgba(245, 158, 11, 0.06)"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="6,4"
                  rx="6"
                />
                <text
                  x={creatureWidthPx / 2}
                  y={creatureHeightPx / 2 - 8}
                  textAnchor="middle"
                  fill="#FBBF24"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                  letterSpacing="0.08em"
                >
                  PHYSICAL ENVELOPE ONLY
                </text>
                <text
                  x={creatureWidthPx / 2}
                  y={creatureHeightPx / 2 + 10}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  Silhouette unavailable &bull; Scaled {safeLength}m &times; {safeHeight}m
                </text>
              </g>
            )}

            {/* Caliper Dimension Lines & Dimension Text */}
            {showCalipers && (
              <g>
                {/* Horizontal Length Caliper under baseline */}
                <g transform={`translate(0, ${groundY + 18})`}>
                  <line
                    x1={creatureStartX}
                    y1="0"
                    x2={creatureStartX + creatureWidthPx}
                    y2="0"
                    stroke="#F59E0B"
                    strokeWidth="1.2"
                  />
                  <line
                    x1={creatureStartX}
                    y1="-4"
                    x2={creatureStartX}
                    y2="4"
                    stroke="#F59E0B"
                    strokeWidth="1.2"
                  />
                  <line
                    x1={creatureStartX + creatureWidthPx}
                    y1="-4"
                    x2={creatureStartX + creatureWidthPx}
                    y2="4"
                    stroke="#F59E0B"
                    strokeWidth="1.2"
                  />
                  <text
                    x={creatureStartX + creatureWidthPx / 2}
                    y="14"
                    textAnchor="middle"
                    fill="#FBBF24"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    Length: {safeLength}m ({formatFeet(safeLength)})
                  </text>
                </g>

                {/* Vertical Height Caliper to the right of creature */}
                <g transform={`translate(${creatureStartX + creatureWidthPx + 14}, 0)`}>
                  <line
                    x1="0"
                    y1={creatureY}
                    x2="0"
                    y2={groundY}
                    stroke="#F59E0B"
                    strokeWidth="1.2"
                  />
                  <line
                    x1="-4"
                    y1={creatureY}
                    x2="4"
                    y2={creatureY}
                    stroke="#F59E0B"
                    strokeWidth="1.2"
                  />
                  <line
                    x1="-4"
                    y1={groundY}
                    x2="4"
                    y2={groundY}
                    stroke="#F59E0B"
                    strokeWidth="1.2"
                  />
                  <text
                    x="8"
                    y={creatureY + creatureHeightPx / 2 + 3}
                    fill="#FBBF24"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {renderedHeightM}m
                  </text>
                </g>

                {/* Reference Dimension Badge with dark glass backdrop */}
                {refBadgeY >= 14 && (
                  <AnimatePresence mode="wait">
                    <g key={`badge-wrap-${refType}`} transform={`translate(${refBadgeX}, ${refBadgeY})`}>
                      <motion.g
                        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.18 }}
                      >
                        <rect
                          x="-42"
                          y="-11"
                          width="84"
                          height="16"
                          rx="4"
                          fill="#070B14"
                          fillOpacity="0.92"
                          stroke="rgba(255, 255, 255, 0.18)"
                          strokeWidth="0.8"
                        />
                        <text
                          x="0"
                          y="1"
                          dominantBaseline="middle"
                          textAnchor="middle"
                          fill="#E2E8F0"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {activeRef.label}
                        </text>
                      </motion.g>
                    </g>
                  </AnimatePresence>
                )}
              </g>
            )}
          </svg>
        </div>

        {/* Bottom Architectural Caption */}
        <div className="px-4 py-2 bg-slate-950/95 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 uppercase font-bold text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            2D Isometric Scale Stage
          </span>
          <span className="text-amber-400/90 font-bold uppercase tracking-wider">
            Rendered at 1:1 Physical Scale
          </span>
        </div>
      </div>

      {/* Curatorial Attribution & Taxonomic Match Line */}
      <div className="bg-slate-950/70 border border-white/[0.08] rounded-xl p-3 sm:p-4 text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        {hasSilhouette ? (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {isExact ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck className="h-3 w-3" /> Species-Specific Silhouette
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/40 text-amber-400 uppercase tracking-wider">
                  <AlertTriangle className="h-3 w-3" /> Generic Approximation — Not Species-Specific
                </span>
              )}
              <span className="text-[11px] text-slate-300 font-bold">
                Taxon: <em>{silhouette?.taxon || speciesName}</em>
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Silhouette artwork by{' '}
              <strong className="text-slate-200">{silhouette?.credit || 'Uncredited'}</strong> under{' '}
              <span className="text-amber-400/90 font-bold">{silhouette?.license || 'CC License'}</span>.
              Uniform curatorial amber fill applied for exhibit consistency.
            </p>

            {/* Reference Model Attribution */}
            <p className="text-[10px] text-slate-500 pt-0.5">
              Reference: <strong className="text-slate-400">{activeRef.name}</strong> &bull;{' '}
              {refType === 'elephant' ? (
                <>
                  Silhouette of <em>Loxodonta africana</em> (African Bush Elephant) by Chuanxin Yu (CC0 1.0 Universal) via{' '}
                  <a href="https://www.phylopic.org/images/910d853a-1a15-4953-a1d3-b81208994d35/loxodonta-africana" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-400">
                    PhyloPic
                  </a>.
                </>
              ) : refType === 'human' ? (
                <>
                  Silhouette of <em>Homo sapiens sapiens</em> by Guillaume Dera (CC0 1.0 Universal) via{' '}
                  <a href="https://www.phylopic.org/images/b8c16fc6-d16b-4fac-8a04-67182448157e" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-400">
                    PhyloPic
                  </a>.
                </>
              ) : (
                'Architectural metric standard.'
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-white/10 text-slate-300 uppercase tracking-wider">
              Physical Envelope
            </span>
            <p className="text-[11px] text-slate-400">
              No verified public silhouette currently cataloged in PhyloPic for this lineage. Showing 1:1 physical dimension envelope.
            </p>
          </div>
        )}

        {/* Source Link to PhyloPic */}
        {silhouette?.sourceUrl && (
          <a
            href={silhouette.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-amber-400 text-xs font-mono font-bold transition-all shrink-0 cursor-pointer"
          >
            <span>PhyloPic Source</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
