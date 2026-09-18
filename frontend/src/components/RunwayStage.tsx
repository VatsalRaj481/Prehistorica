import { useState, useMemo, useEffect } from 'react';
import { Species } from '../services/api.js';
import { formatFeet } from '../utils/formatDimensions.js';

interface RunwayStageProps {
  speciesList: Species[];
  activeReference: 'human' | 'car' | 'bus' | 'elephant' | 'none';
  showGrid?: boolean;
  showCalipers?: boolean;
  highlightedIndex?: number | null;
  onSelectIndex?: (index: number) => void;
}

export default function RunwayStage({
  speciesList,
  activeReference = 'human',
  showGrid = true,
  showCalipers = true,
  highlightedIndex = null,
  onSelectIndex
}: RunwayStageProps) {
  const [aspectRatios, setAspectRatios] = useState<Record<number, number>>({});

  // Dynamically calculate natural aspect ratios for all loaded silhouettes
  useEffect(() => {
    speciesList.forEach((sp) => {
      const url = sp.comparisonSilhouette?.url;
      if (!url) return;
      if (aspectRatios[sp.id]) return;

      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          setAspectRatios((prev) => ({
            ...prev,
            [sp.id]: img.naturalWidth / img.naturalHeight
          }));
        }
      };
      img.src = url;
    });
  }, [speciesList]);

  // Reference configurations (in meters)
  const refSpecs = useMemo(() => {
    switch (activeReference) {
      case 'car':
        return { name: '4.5m Sedan', lengthM: 4.5, heightM: 1.6 };
      case 'bus':
        return { name: '11.5m Transit Bus', lengthM: 11.5, heightM: 3.2 };
      case 'elephant':
        return { name: '3.3m African Elephant', lengthM: 6.5, heightM: 3.3 };
      case 'human':
      default:
        return { name: '1.8m Human', lengthM: 0.95, heightM: 1.8 };
    }
  }, [activeReference]);

  // Metric sizing for each creature
  const creaturesMetrics = useMemo(() => {
    return speciesList.map((sp) => {
      const len = sp.lengthM && sp.lengthM > 0 ? sp.lengthM : 5.0;
      const h = sp.heightM && sp.heightM > 0 ? sp.heightM : Math.max(1, len * 0.35);
      const aspect = aspectRatios[sp.id] || (len / h);
      return {
        species: sp,
        lengthM: len,
        heightM: h,
        aspectRatio: aspect
      };
    });
  }, [speciesList, aspectRatios]);

  // Layout calculations: arrange specimens sequentially on runway with metric spacing
  const runwayLayout = useMemo(() => {
    let currentX = 2.0; // 2m initial padding
    const items: Array<{
      species: Species;
      lengthM: number;
      heightM: number;
      startX: number;
      endX: number;
      midX: number;
    }> = [];

    // Place reference object first if enabled
    let refStartX = 2.0;
    if (activeReference !== 'none') {
      refStartX = 2.0;
      currentX += refSpecs.lengthM + 2.5; // spacing between reference and first specimen
    }

    creaturesMetrics.forEach((item) => {
      const start = currentX;
      const end = currentX + item.lengthM;
      items.push({
        species: item.species,
        lengthM: item.lengthM,
        heightM: item.heightM,
        startX: start,
        endX: end,
        midX: (start + end) / 2
      });
      currentX = end + 3.0; // 3m metric separation between consecutive animals
    });

    const totalStageLength = Math.max(16.0, currentX + 2.0);
    const maxCreatureHeight = Math.max(
      activeReference !== 'none' ? refSpecs.heightM : 1.8,
      ...creaturesMetrics.map((c) => c.heightM)
    );
    const totalStageHeight = Math.max(6.0, maxCreatureHeight * 1.55);

    return {
      items,
      refStartX,
      totalLength: totalStageLength,
      totalHeight: totalStageHeight
    };
  }, [creaturesMetrics, activeReference, refSpecs]);

  // SVG dimensions
  const viewWidth = 1400;
  const viewHeight = 520;
  const scale = viewWidth / runwayLayout.totalLength; // pixels per meter
  const groundY = viewHeight - 65; // baseline ground line

  return (
    <div className="w-full bg-slate-950 rounded-2xl border border-white/[0.08] shadow-2xl p-3 sm:p-5 relative overflow-hidden font-mono select-none">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* SVG Canvas Stage */}
      <div className="w-full overflow-x-auto pb-2 focus:outline-none">
        <svg
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="w-full min-w-[850px] h-auto drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Charcoal / Chalk filter for high-contrast architectural silhouette rendering */}
            <filter id="runwayChalkTint" x="-10%" y="-10%" width="120%" height="120%">
              <feColorMatrix
                type="matrix"
                values="
                  0 0 0 0 0.88
                  0 0 0 0 0.92
                  0 0 0 0 0.98
                  0 0 0 0.92 0
                "
              />
            </filter>

            {/* Amber Highlight Filter for active specimen */}
            <filter id="runwayAmberHighlight" x="-10%" y="-10%" width="120%" height="120%">
              <feColorMatrix
                type="matrix"
                values="
                  0 0 0 0 0.96
                  0 0 0 0 0.62
                  0 0 0 0 0.04
                  0 0 0 1.0 0
                "
              />
            </filter>

            {/* Grid Pattern */}
            <pattern id="metricGridMajor" width={5 * scale} height={5 * scale} patternUnits="userSpaceOnUse">
              <path
                d={`M ${5 * scale} 0 L 0 0 0 ${5 * scale}`}
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="1"
              />
            </pattern>
            <pattern id="metricGridMinor" width={scale} height={scale} patternUnits="userSpaceOnUse">
              <path
                d={`M ${scale} 0 L 0 0 0 ${scale}`}
                fill="none"
                stroke="rgba(255, 255, 255, 0.02)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          {/* Metric Grid Background */}
          {showGrid && (
            <g>
              <rect x="0" y="0" width={viewWidth} height={groundY} fill="url(#metricGridMinor)" />
              <rect x="0" y="0" width={viewWidth} height={groundY} fill="url(#metricGridMajor)" />

              {/* Major 5-meter interval markers along top ceiling */}
              {Array.from({ length: Math.floor(runwayLayout.totalLength / 5) + 1 }).map((_, i) => {
                const x = i * 5 * scale;
                return (
                  <g key={`marker-${i}`} transform={`translate(${x}, 20)`}>
                    <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <text
                      x="4"
                      y="10"
                      fill="rgba(255,255,255,0.3)"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="start"
                    >
                      {i * 5}m
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Architectural Ground Plinth Line */}
          <line
            x1="0"
            y1={groundY}
            x2={viewWidth}
            y2={groundY}
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <line
            x1="0"
            y1={groundY + 2}
            x2={viewWidth}
            y2={groundY + 2}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />

          {/* Baseline Ground Plinth Floor */}
          <rect
            x="0"
            y={groundY}
            width={viewWidth}
            height={viewHeight - groundY}
            fill="rgba(14, 21, 38, 0.7)"
          />

          {/* Reference Figure (Human / Car / Bus / Elephant) */}
          {activeReference !== 'none' && (
            <g transform={`translate(${runwayLayout.refStartX * scale}, 0)`}>
              {activeReference === 'human' && (
                <g>
                  {/* Calibrated Human (1.8m) */}
                  <image
                    href="https://bbsmxcoywionsvmfznah.supabase.co/storage/v1/object/public/species-silhouettes/reference-human.svg"
                    x="0"
                    y={groundY - 1.8 * scale}
                    width={0.95 * scale}
                    height={1.8 * scale}
                    preserveAspectRatio="xMidYMax meet"
                    filter="url(#runwayChalkTint)"
                    opacity="0.85"
                  />
                  {/* Reference Human Caliper Label */}
                  <text
                    x={(0.95 * scale) / 2}
                    y={groundY + 16}
                    fill="#94A3B8"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    1.8m Human
                  </text>
                </g>
              )}

              {activeReference === 'car' && (
                <g>
                  <rect
                    x="0"
                    y={groundY - 1.6 * scale}
                    width={4.5 * scale}
                    height={1.6 * scale}
                    rx="6"
                    fill="#475569"
                    opacity="0.75"
                  />
                  <text
                    x={(4.5 * scale) / 2}
                    y={groundY + 16}
                    fill="#94A3B8"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    4.5m Sedan
                  </text>
                </g>
              )}

              {activeReference === 'bus' && (
                <g>
                  <rect
                    x="0"
                    y={groundY - 3.2 * scale}
                    width={11.5 * scale}
                    height={3.2 * scale}
                    rx="8"
                    fill="#334155"
                    opacity="0.8"
                  />
                  <text
                    x={(11.5 * scale) / 2}
                    y={groundY + 16}
                    fill="#94A3B8"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    11.5m Transit Bus
                  </text>
                </g>
              )}

              {activeReference === 'elephant' && (
                <g>
                  <rect
                    x="0"
                    y={groundY - 3.3 * scale}
                    width={6.5 * scale}
                    height={3.3 * scale}
                    rx="8"
                    fill="#475569"
                    opacity="0.75"
                  />
                  <text
                    x={(6.5 * scale) / 2}
                    y={groundY + 16}
                    fill="#94A3B8"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    3.3m Bush Elephant
                  </text>
                </g>
              )}
            </g>
          )}

          {/* Lineup Species Silhouettes & Calipers */}
          {runwayLayout.items.map((item, idx) => {
            const isHighlighted = highlightedIndex === idx;
            const pxWidth = item.lengthM * scale;
            const pxHeight = item.heightM * scale;
            const startPx = item.startX * scale;
            const midPx = item.midX * scale;
            const yTop = groundY - pxHeight;
            const silhouetteUrl = item.species.comparisonSilhouette?.url;

            return (
              <g
                key={item.species.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => onSelectIndex && onSelectIndex(idx)}
              >
                {/* Stage Pedestal Spot */}
                <ellipse
                  cx={midPx}
                  cy={groundY}
                  rx={pxWidth * 0.45}
                  ry="5"
                  fill={isHighlighted ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.04)'}
                />

                {/* Silhouette or Fallback Box */}
                {silhouetteUrl ? (
                  <image
                    href={silhouetteUrl}
                    x={startPx}
                    y={yTop}
                    width={pxWidth}
                    height={pxHeight}
                    preserveAspectRatio="none"
                    filter={isHighlighted ? 'url(#runwayAmberHighlight)' : 'url(#runwayChalkTint)'}
                    className="transition-all duration-300"
                    style={{
                      transformOrigin: `${midPx}px ${groundY}px`,
                      transform: isHighlighted ? 'scale(1.02)' : 'scale(1)'
                    }}
                  />
                ) : (
                  <g>
                    <rect
                      x={startPx}
                      y={yTop}
                      width={pxWidth}
                      height={pxHeight}
                      rx="4"
                      fill={isHighlighted ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)'}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.2)'}
                      strokeWidth="1"
                    />
                    <text
                      x={midPx}
                      y={yTop + pxHeight / 2}
                      fill="#94A3B8"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {item.species.name}
                    </text>
                  </g>
                )}

                {/* Metric Calipers (Horizontal Length Bracket) */}
                {showCalipers && (
                  <g>
                    {/* Top Length Dimension Caliper */}
                    <line
                      x1={startPx}
                      y1={yTop - 14}
                      x2={startPx + pxWidth}
                      y2={yTop - 14}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.4)'}
                      strokeWidth="1"
                    />
                    {/* Left & Right Caliper Ticks */}
                    <line
                      x1={startPx}
                      y1={yTop - 18}
                      x2={startPx}
                      y2={yTop - 10}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.4)'}
                      strokeWidth="1"
                    />
                    <line
                      x1={startPx + pxWidth}
                      y1={yTop - 18}
                      x2={startPx + pxWidth}
                      y2={yTop - 10}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.4)'}
                      strokeWidth="1"
                    />

                    {/* Metric Badge Pill */}
                    <g transform={`translate(${midPx}, ${yTop - 14})`}>
                      <rect
                        x="-36"
                        y="-10"
                        width="72"
                        height="18"
                        rx="4"
                        fill="#080C16"
                        stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.18)'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        fill={isHighlighted ? '#F59E0B' : '#F3F6FB'}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {item.lengthM.toFixed(1)}m ({formatFeet(item.lengthM)})
                      </text>
                    </g>

                    {/* Vertical Height Line */}
                    <line
                      x1={startPx - 8}
                      y1={yTop}
                      x2={startPx - 8}
                      y2={groundY}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.25)'}
                      strokeWidth="0.8"
                      strokeDasharray="2 2"
                    />
                  </g>
                )}

                {/* Ground Tag Nameplate */}
                <g transform={`translate(${midPx}, ${groundY + 16})`}>
                  <text
                    x="0"
                    y="0"
                    fill={isHighlighted ? '#F59E0B' : '#F3F6FB'}
                    fontSize="11"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    className="uppercase tracking-wider"
                  >
                    #{idx + 1} {item.species.name}
                  </text>
                  <text
                    x="0"
                    y="13"
                    fill="#94A3B8"
                    fontSize="9"
                    fontStyle="italic"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {item.species.clade} &bull; {item.species.timePeriod}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stage Legend and Calibration Notice */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.06] text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span>1:1 Metric Calibrated Runway &bull; Scale: {(scale).toFixed(1)}px / meter</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Click any specimen to highlight</span>
        </div>
      </div>
    </div>
  );
}
