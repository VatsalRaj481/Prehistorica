import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Species } from '../services/api.js';
import { formatFeet } from '../utils/formatDimensions.js';
import { formatEnumLabel } from '../utils/formatEnumLabel.js';

interface RunwayStageProps {
  speciesList: Species[];
  activeReference: 'human' | 'car' | 'bus' | 'elephant' | 'none';
  showGrid?: boolean;
  showCalipers?: boolean;
  highlightedIndex?: number | null;
  onSelectIndex?: (index: number) => void;
  scale?: number;
}

export default function RunwayStage({
  speciesList,
  activeReference = 'human',
  showGrid = true,
  showCalipers = true,
  highlightedIndex = null,
  onSelectIndex,
  scale = 23
}: RunwayStageProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1200);
  const [isDraggingMouse, setIsDraggingMouse] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);
  const [silhouetteAspects, setSilhouetteAspects] = useState<Record<string, number>>({});

  // Track container width so the runway floor and grid always span 100% of the stage container
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const updateWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth || 1200);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(scrollContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Dynamically load image natural aspect ratio so silhouette is scaled accurately without floating or empty padding
  useEffect(() => {
    speciesList.forEach((sp) => {
      const url = sp.comparisonSilhouette?.url;
      if (url && !silhouetteAspects[url]) {
        const img = new Image();
        img.onload = () => {
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            setSilhouetteAspects((prev) => ({
              ...prev,
              [url]: img.naturalWidth / img.naturalHeight
            }));
          }
        };
        img.src = url;
      }
    });
  }, [speciesList]);

  // Reference figure configurations (in meters)
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

  // Metric sizing for each creature: calibrated directly to scientific length, standing height, and silhouette aspect ratio
  const creaturesMetrics = useMemo(() => {
    return speciesList.map((sp) => {
      const len = sp.lengthM && sp.lengthM > 0 ? sp.lengthM : 5.0;
      const h = sp.heightM && sp.heightM > 0 ? sp.heightM : Math.max(1, len * 0.35);
      const url = sp.comparisonSilhouette?.url;
      const aspect = url && silhouetteAspects[url] ? silhouetteAspects[url] : len / h;
      const isHeightDominant = h >= len * 0.85;

      let renderWidthM: number;
      let renderHeightM: number;

      if (isHeightDominant) {
        // Upright or height-dominant creatures (azhdarchid pterosaurs, terror birds, bipeds)
        // anchor directly to nominal standing height so silhouettes align with ground baseline
        renderHeightM = h;
        renderWidthM = h * aspect;
      } else {
        // Length-dominant creatures (theropods, sauropods, marine reptiles)
        renderWidthM = len;
        renderHeightM = len / aspect;
      }

      return {
        species: sp,
        lengthM: len,
        heightM: h,
        renderWidthM,
        renderHeightM
      };
    });
  }, [speciesList, silhouetteAspects]);

  // Layout calculations: arrange specimens sequentially on the runway track with 3.0m metric spacing
  const runwayLayout = useMemo(() => {
    let currentX = 2.0; // 2m initial padding
    const items: Array<{
      species: Species;
      lengthM: number;
      heightM: number;
      renderWidthM: number;
      renderHeightM: number;
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
      const spanM = Math.max(item.lengthM, item.renderWidthM);
      const start = currentX;
      const end = currentX + spanM;
      items.push({
        species: item.species,
        lengthM: item.lengthM,
        heightM: item.heightM,
        renderWidthM: item.renderWidthM,
        renderHeightM: item.renderHeightM,
        startX: start,
        endX: end,
        midX: (start + end) / 2
      });
      currentX = end + 3.0; // 3m metric separation between consecutive animals
    });

    const totalStageLength = Math.max(16.0, currentX + 2.0);
    const maxCreatureHeight = Math.max(
      activeReference !== 'none' ? refSpecs.heightM : 1.8,
      ...creaturesMetrics.map((c) => c.renderHeightM)
    );
    const totalStageHeight = Math.max(4.6, maxCreatureHeight * 1.35);

    return {
      items,
      refStartX,
      totalLength: totalStageLength,
      totalHeight: totalStageHeight
    };
  }, [creaturesMetrics, activeReference, refSpecs]);

  // Stable architectural runway dimensions:
  // The runway stage height (440px) and ground baseline remain constant so zooming in/out
  // only scales the size of the species silhouettes without resizing or distorting the stage
  const STAGE_HEIGHT = 440;
  const groundY = STAGE_HEIGHT - 65; // Fixed baseline ground line

  // Total track width: expands with scale to accommodate all creatures, but spans at least 100% of the stage container
  const trackContentWidthPx = Math.ceil(runwayLayout.totalLength * scale + 80);
  const viewWidth = Math.max(containerWidth, trackContentWidthPx);
  const maxMeters = Math.max(runwayLayout.totalLength, Math.ceil(viewWidth / scale));

  // Interactive mouse drag-to-scroll handlers for desktop users
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (!scrollContainerRef.current) return;
    setIsDraggingMouse(true);
    setDragStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollStartLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingMouse || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.4;
    scrollContainerRef.current.scrollLeft = scrollStartLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDraggingMouse(false);
  };

  return (
    <div className="w-full bg-slate-950 rounded-2xl border border-white/[0.08] shadow-2xl p-3 sm:p-5 relative overflow-hidden font-mono select-none">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Mobile & Trackpad Pan Hint */}
      <div className="flex items-center justify-between text-[11px] text-amber-400/90 pb-2 px-1">
        <span className="flex items-center gap-1.5 font-bold">
          <svg className="w-3.5 h-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Scroll or drag horizontally to explore 1:1 metric stage
        </span>
        <span className="text-slate-400 text-[10px]">
          Zoom: {(scale).toFixed(0)} px/m &bull; Total Track: {runwayLayout.totalLength.toFixed(1)}m
        </span>
      </div>

      {/* SVG Canvas Stage with true scalable width */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`w-full overflow-x-auto pb-4 focus:outline-none touch-pan-x overscroll-x-contain ${
          isDraggingMouse ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <svg
          viewBox={`0 0 ${viewWidth} ${STAGE_HEIGHT}`}
          style={{
            width: `${viewWidth}px`,
            height: `${STAGE_HEIGHT}px`,
          }}
          className="drop-shadow-md overflow-visible select-none"
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
                stroke="rgba(255, 255, 255, 0.07)"
                strokeWidth="1"
              />
            </pattern>
            <pattern id="metricGridMinor" width={scale} height={scale} patternUnits="userSpaceOnUse">
              <path
                d={`M ${scale} 0 L 0 0 0 ${scale}`}
                fill="none"
                stroke="rgba(255, 255, 255, 0.025)"
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
              {Array.from({ length: Math.floor(maxMeters / 5) + 1 }).map((_, i) => {
                const x = i * 5 * scale;
                if (x > viewWidth + 10) return null;
                return (
                  <g key={`marker-${i}`} transform={`translate(${x}, 20)`}>
                    <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                    <text
                      x="4"
                      y="11"
                      fill="rgba(255,255,255,0.4)"
                      fontSize="9.5"
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
            height={STAGE_HEIGHT - groundY}
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
                    fontSize="9.5"
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
                    fontSize="9.5"
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
                    fontSize="9.5"
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
                    fontSize="9.5"
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
            const pxWidth = item.renderWidthM * scale;
            const rawPxHeight = item.renderHeightM * scale;
            const maxAllowedH = groundY - 45;
            const pxHeight = Math.min(rawPxHeight, maxAllowedH);
            const midPx = item.midX * scale;
            const startPx = midPx - pxWidth / 2;
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

                {/* Silhouette or Fallback Box: Calibrated to fit within physical envelope flush on baseline */}
                {silhouetteUrl ? (
                  <image
                    href={silhouetteUrl}
                    x={startPx}
                    y={yTop}
                    width={pxWidth}
                    height={pxHeight}
                    preserveAspectRatio="xMidYMax meet"
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

                {/* Metric Calipers (Length and Height matching matrix table exactly) */}
                {showCalipers && (
                  <g>
                    {/* Top Length Dimension Caliper */}
                    <line
                      x1={startPx}
                      y1={yTop - 14}
                      x2={startPx + pxWidth}
                      y2={yTop - 14}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.45)'}
                      strokeWidth="1"
                    />
                    {/* Left & Right Caliper Ticks */}
                    <line
                      x1={startPx}
                      y1={yTop - 18}
                      x2={startPx}
                      y2={yTop - 10}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.45)'}
                      strokeWidth="1"
                    />
                    <line
                      x1={startPx + pxWidth}
                      y1={yTop - 18}
                      x2={startPx + pxWidth}
                      y2={yTop - 10}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.45)'}
                      strokeWidth="1"
                    />

                    {/* Metric Badge Pill for Length */}
                    <g transform={`translate(${midPx}, ${yTop - 14})`}>
                      <rect
                        x="-46"
                        y="-10"
                        width="92"
                        height="19"
                        rx="4"
                        fill="#080C16"
                        stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.22)'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3.5"
                        fill={isHighlighted ? '#F59E0B' : '#F3F6FB'}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {item.lengthM.toFixed(1)}m ({formatFeet(item.lengthM)})
                      </text>
                    </g>

                    {/* Vertical Height Line: Ground up to Standing Height */}
                    <line
                      x1={startPx - 8}
                      y1={yTop}
                      x2={startPx - 8}
                      y2={groundY}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.3)'}
                      strokeWidth="0.8"
                      strokeDasharray="2 2"
                    />
                    {/* Vertical Height Ticks */}
                    <line
                      x1={startPx - 11}
                      y1={yTop}
                      x2={startPx - 5}
                      y2={yTop}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.4)'}
                      strokeWidth="0.8"
                    />
                    <line
                      x1={startPx - 11}
                      y1={groundY}
                      x2={startPx - 5}
                      y2={groundY}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.4)'}
                      strokeWidth="0.8"
                    />
                    {/* Vertical Height Metric Label */}
                    <text
                      x={startPx - 13}
                      y={yTop + pxHeight / 2}
                      fill={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.65)'}
                      fontSize="8.5"
                      fontFamily="monospace"
                      textAnchor="end"
                      dominantBaseline="middle"
                    >
                      {item.heightM.toFixed(1)}m ({formatFeet(item.heightM)})
                    </text>
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
                    {formatEnumLabel(item.species.clade)} &bull; {item.species.timePeriod}
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
          <span>1:1 Scale comparison &bull; Scale: {(scale).toFixed(1)}px / meter</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Click any specimen to highlight &bull; Drag track to pan</span>
        </div>
      </div>
    </div>
  );
}
