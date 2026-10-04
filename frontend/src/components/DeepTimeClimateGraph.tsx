import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  PHANEROZOIC_CLIMATE_DATA,
  GEOLOGICAL_PERIODS,
  MASS_EXTINCTIONS,
  ClimateDataPoint
} from '../data/extinctionData.js';
import {
  Flame,
  Wind,
  Waves,
  Thermometer,
  Eye,
  EyeOff,
  Crosshair
} from 'lucide-react';

interface DeepTimeClimateGraphProps {
  selectedExtinctionId: string;
  onSelectExtinction: (id: string) => void;
}

interface MetricConfig {
  key: 'o2Percent' | 'co2Ppm' | 'tempCelsius' | 'seaLevelMeters';
  label: string;
  formula: string;
  unit: string;
  color: string;
  strokeColor: string;
  fillGradient: string;
  min: number;
  max: number;
  modernValue: string;
  icon: React.ElementType;
}

const METRICS: MetricConfig[] = [
  {
    key: 'o2Percent',
    label: 'Atmospheric O₂',
    formula: 'O₂',
    unit: '%',
    color: 'text-cyan-400',
    strokeColor: '#06B6D4',
    fillGradient: 'url(#gradientO2)',
    min: 10,
    max: 38,
    modernValue: '20.9%',
    icon: Wind,
  },
  {
    key: 'co2Ppm',
    label: 'Atmospheric CO₂',
    formula: 'CO₂',
    unit: 'ppm',
    color: 'text-amber-400',
    strokeColor: '#F59E0B',
    fillGradient: 'url(#gradientCO2)',
    min: 0,
    max: 4800,
    modernValue: '280 pre-ind. / 420 modern',
    icon: Flame,
  },
  {
    key: 'tempCelsius',
    label: 'Mean Surface Temp',
    formula: 'Temp',
    unit: '°C',
    color: 'text-rose-400',
    strokeColor: '#F43F5E',
    fillGradient: 'url(#gradientTemp)',
    min: 8,
    max: 32,
    modernValue: '14.5°C',
    icon: Thermometer,
  },
  {
    key: 'seaLevelMeters',
    label: 'Global Sea Level',
    formula: 'Sea Level',
    unit: 'm',
    color: 'text-blue-400',
    strokeColor: '#3B82F6',
    fillGradient: 'url(#gradientSea)',
    min: -80,
    max: 260,
    modernValue: '0 m (baseline)',
    icon: Waves,
  },
];

export default function DeepTimeClimateGraph({
  selectedExtinctionId,
  onSelectExtinction,
}: DeepTimeClimateGraphProps) {
  const [activeMetrics, setActiveMetrics] = useState<Record<string, boolean>>({
    o2Percent: true,
    co2Ppm: true,
    tempCelsius: true,
    seaLevelMeters: true,
  });

  const [hoveredPoint, setHoveredPoint] = useState<ClimateDataPoint | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Chart dimensions in SVG viewBox coordinate space
  const svgWidth = 1000;
  const svgHeight = 420;
  const margin = { top: 30, right: 30, bottom: 65, left: 55 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  // Time scale mapping: 541 Ma (left = margin.left) to 0 Ma (right = margin.left + plotWidth)
  const timeToX = useMemo(() => {
    return (ageMa: number) => {
      const clamped = Math.max(0, Math.min(541, ageMa));
      const fraction = (541 - clamped) / 541;
      return margin.left + fraction * plotWidth;
    };
  }, [margin.left, plotWidth]);

  const xToTime = useMemo(() => {
    return (x: number) => {
      const clampedX = Math.max(margin.left, Math.min(margin.left + plotWidth, x));
      const fraction = (clampedX - margin.left) / plotWidth;
      return 541 - fraction * 541;
    };
  }, [margin.left, plotWidth]);

  // Scaler for metric values into Y coordinates (plotHeight)
  const valueToY = useMemo(() => {
    return (value: number, min: number, max: number) => {
      const clamped = Math.max(min, Math.min(max, value));
      const fraction = (clamped - min) / (max - min);
      return margin.top + plotHeight - fraction * plotHeight;
    };
  }, [margin.top, plotHeight]);

  // Build SVG smooth path strings for each metric
  const metricPaths = useMemo(() => {
    // Sort chronologically from 541 down to 0
    const sorted = [...PHANEROZOIC_CLIMATE_DATA].sort((a, b) => b.ageMa - a.ageMa);

    const paths: Record<string, { stroke: string; area: string }> = {};

    METRICS.forEach((m) => {
      if (!activeMetrics[m.key]) return;

      const points = sorted.map((d) => ({
        x: timeToX(d.ageMa),
        y: valueToY(d[m.key], m.min, m.max),
      }));

      if (points.length < 2) return;

      // Generate smooth bezier curve path
      let strokePath = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const midX = (curr.x + next.x) / 2;
        strokePath += ` C ${midX.toFixed(1)},${curr.y.toFixed(1)} ${midX.toFixed(1)},${next.y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
      }

      // Close path at the bottom for subtle gradient area fill
      const lastPoint = points[points.length - 1];
      const areaPath = `${strokePath} L ${lastPoint.x.toFixed(1)},${(margin.top + plotHeight).toFixed(1)} L ${points[0].x.toFixed(1)},${(margin.top + plotHeight).toFixed(1)} Z`;

      paths[m.key] = { stroke: strokePath, area: areaPath };
    });

    return paths;
  }, [activeMetrics, timeToX, valueToY, margin.top, plotHeight]);

  // Handle pointer scrub over SVG
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) * (svgWidth / rect.width);
    
    if (relativeX >= margin.left && relativeX <= margin.left + plotWidth) {
      setHoverX(relativeX);
      const hoveredAge = xToTime(relativeX);

      // Find nearest data point
      let nearest = PHANEROZOIC_CLIMATE_DATA[0];
      let minDiff = Math.abs(nearest.ageMa - hoveredAge);
      for (const pt of PHANEROZOIC_CLIMATE_DATA) {
        const diff = Math.abs(pt.ageMa - hoveredAge);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = pt;
        }
      }
      setHoveredPoint(nearest);
    }
  };

  const handlePointerLeave = () => {
    setHoverX(null);
    setHoveredPoint(null);
  };

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) => {
      const currentTrueCount = Object.values(prev).filter(Boolean).length;
      // Do not allow turning off all metrics simultaneously
      if (currentTrueCount <= 1 && prev[key]) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const selectedExtinction = useMemo(() => {
    return MASS_EXTINCTIONS.find((e) => e.id === selectedExtinctionId);
  }, [selectedExtinctionId]);

  return (
    <div className="bg-slate-900/80 border border-white/[0.08] rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header Bar with Telemetry Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-slate-100 font-sans tracking-wide flex items-center gap-2">
              Deep-Time Paleoclimate Telemetry
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                541 – 0 Ma
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Synchronized Phanerozoic geochemical curves calibrated from GEOCARBSULF and oxygen isotope stacks.
          </p>
        </div>

        {/* Metric Visibility Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {METRICS.map((m) => {
            const isActive = activeMetrics[m.key];
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800/90 border-white/[0.15] text-slate-200 shadow-sm'
                    : 'bg-slate-950/40 border-white/[0.04] text-slate-500 hover:text-slate-400 opacity-60'
                }`}
                title={`Toggle ${m.label}`}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: isActive ? m.strokeColor : '#64748B' }}
                />
                <Icon className="h-3 w-3 shrink-0" />
                <span>{m.formula}</span>
                {isActive ? (
                  <Eye className="h-2.5 w-2.5 text-slate-400 ml-0.5" />
                ) : (
                  <EyeOff className="h-2.5 w-2.5 text-slate-600 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main SVG Chart Stage */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair overflow-visible"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            {/* Gradient fills for area under curves */}
            <linearGradient id="gradientO2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradientCO2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradientTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradientSea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing filter for extinction beacons */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Lines & Y-Axis Scale Markers */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = margin.top + pct * plotHeight;
            return (
              <g key={idx}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + plotWidth}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
              </g>
            );
          })}

          {/* Time Division Gridlines (every 100 Ma) */}
          {[500, 400, 300, 200, 100, 0].map((age) => {
            const x = timeToX(age);
            return (
              <g key={age}>
                <line
                  x1={x}
                  y1={margin.top}
                  x2={x}
                  y2={margin.top + plotHeight}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="2 4"
                />
                <text
                  x={x}
                  y={margin.top - 10}
                  fill="#94A3B8"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {age === 0 ? '0 Ma (Now)' : `${age} Ma`}
                </text>
              </g>
            );
          })}

          {/* Area Fills under curves */}
          {METRICS.map((m) => {
            if (!activeMetrics[m.key] || !metricPaths[m.key]) return null;
            return (
              <path
                key={`area-${m.key}`}
                d={metricPaths[m.key].area}
                fill={m.fillGradient}
                pointerEvents="none"
              />
            );
          })}

          {/* Stroke Lines for Curves */}
          {METRICS.map((m) => {
            if (!activeMetrics[m.key] || !metricPaths[m.key]) return null;
            return (
              <path
                key={`stroke-${m.key}`}
                d={metricPaths[m.key].stroke}
                fill="none"
                stroke={m.strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pointerEvents="none"
              />
            );
          })}

          {/* Extinction Pulse Beacons (Vertical Laser Beacons & Markers) */}
          {MASS_EXTINCTIONS.map((ext) => {
            const beaconX = timeToX(ext.peakAgeMa);
            const isSelected = ext.id === selectedExtinctionId;

            return (
              <g
                key={ext.id}
                className="cursor-pointer group"
                onClick={() => onSelectExtinction(ext.id)}
              >
                {/* Active Column Aura */}
                {isSelected && (
                  <rect
                    x={beaconX - 16}
                    y={margin.top}
                    width="32"
                    height={plotHeight}
                    fill="rgba(244, 63, 94, 0.08)"
                    rx="4"
                    pointerEvents="none"
                  />
                )}

                {/* Vertical Beacon Line */}
                <line
                  x1={beaconX}
                  y1={margin.top}
                  x2={beaconX}
                  y2={margin.top + plotHeight}
                  stroke={isSelected ? '#F43F5E' : 'rgba(244, 63, 94, 0.5)'}
                  strokeWidth={isSelected ? '2' : '1.5'}
                  strokeDasharray={isSelected ? 'none' : '3 3'}
                  className="transition-all duration-300 group-hover:stroke-rose-400 group-hover:stroke-[2]"
                />

                {/* Top Pulsing Beacon Pin Head */}
                <circle
                  cx={beaconX}
                  y={margin.top + 6}
                  r={isSelected ? '6' : '4'}
                  fill={isSelected ? '#F43F5E' : '#9F1239'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                  className="transition-all duration-200 group-hover:scale-125"
                />

                {/* Mini Flag Label Tag */}
                <g transform={`translate(${beaconX}, ${margin.top + 22})`}>
                  <rect
                    x="-32"
                    y="0"
                    width="64"
                    height="16"
                    rx="3"
                    fill={isSelected ? '#E11D48' : '#1E293B'}
                    stroke={isSelected ? '#FDA4AF' : 'rgba(255,255,255,0.1)'}
                    strokeWidth="1"
                    className="transition-colors group-hover:fill-rose-900"
                  />
                  <text
                    x="0"
                    y="11"
                    fill="#FFFFFF"
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                  >
                    -{ext.casualtyStats.speciesLossPercent}% Taxa
                  </text>
                </g>
              </g>
            );
          })}

          {/* Interactive Hover Scrubber Crosshair */}
          {hoverX !== null && (
            <g pointerEvents="none">
              <line
                x1={hoverX}
                y1={margin.top}
                x2={hoverX}
                y2={margin.top + plotHeight}
                stroke="#F8FAFC"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                opacity="0.8"
              />
              <circle
                cx={hoverX}
                cy={margin.top + plotHeight}
                r="4"
                fill="#F8FAFC"
              />
            </g>
          )}

          {/* Chronostratigraphic Geological Period Band at Bottom */}
          <g transform={`translate(0, ${margin.top + plotHeight + 14})`}>
            {GEOLOGICAL_PERIODS.map((period) => {
              const startX = timeToX(period.startMa);
              const endX = timeToX(period.endMa);
              const width = Math.max(1, endX - startX);

              return (
                <g key={period.name} className="group">
                  <rect
                    x={startX}
                    y="0"
                    width={width}
                    height="20"
                    fill={period.color}
                    stroke="#0F172A"
                    strokeWidth="1"
                    opacity="0.85"
                    className="transition-opacity hover:opacity-100"
                  />
                  {width > 22 && (
                    <text
                      x={startX + width / 2}
                      y="14"
                      fill={period.textColor}
                      fontSize={width > 45 ? '10' : '8'}
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                    >
                      {width > 48 ? period.name : period.shortCode}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Live Hover HUD Telemetry Box (Float directly above cursor or pinned) */}
        {hoveredPoint && hoverX !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 left-2 sm:left-auto sm:right-4 z-20 pointer-events-none bg-slate-950/95 border border-amber-500/30 shadow-2xl rounded-xl p-3 sm:p-4 text-xs font-mono max-w-xs backdrop-blur-md"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] mb-2">
              <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                <Crosshair className="h-3.5 w-3.5" />
                {hoveredPoint.ageMa === 0 ? 'Present Day' : `${hoveredPoint.ageMa} Ma`}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-sans text-[11px] font-bold">
                {hoveredPoint.period}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-cyan-300">
                <span>O₂ Conc:</span>
                <span className="font-bold">{hoveredPoint.o2Percent}%</span>
              </div>
              <div className="flex items-center justify-between text-amber-300">
                <span>CO₂ Level:</span>
                <span className="font-bold">{hoveredPoint.co2Ppm.toLocaleString()} ppm</span>
              </div>
              <div className="flex items-center justify-between text-rose-300">
                <span>Mean Temp:</span>
                <span className="font-bold">{hoveredPoint.tempCelsius}°C</span>
              </div>
              <div className="flex items-center justify-between text-blue-300">
                <span>Sea Level:</span>
                <span className="font-bold">
                  {hoveredPoint.seaLevelMeters >= 0 ? `+${hoveredPoint.seaLevelMeters}m` : `${hoveredPoint.seaLevelMeters}m`}
                </span>
              </div>
            </div>

            {hoveredPoint.notes && (
              <p className="mt-2.5 pt-2 border-t border-white/[0.06] text-[10px] text-slate-300 font-sans leading-relaxed italic">
                "{hoveredPoint.notes}"
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Legend & Baseline Calibration Notes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/[0.06] text-[11px] font-mono">
        {METRICS.map((m) => {
          const isActive = activeMetrics[m.key];
          return (
            <div
              key={m.key}
              className={`p-2 rounded-lg border flex flex-col justify-between transition-colors ${
                isActive
                  ? 'bg-slate-950/60 border-white/[0.08]'
                  : 'bg-slate-950/20 border-white/[0.03] opacity-40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-bold ${m.color}`}>{m.label}</span>
                <span className="text-[10px] text-slate-500">{m.unit}</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-[10px] text-slate-400">
                <span>Range: {m.min}–{m.max}</span>
                <span className="text-slate-300">Mod: {m.modernValue}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Extinction Banner Link */}
      {selectedExtinction && (
        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0 animate-ping" />
            <span className="text-slate-200 font-sans">
              Currently Inspecting Pulse:{' '}
              <strong className="text-rose-400 font-semibold">{selectedExtinction.name}</strong> ({selectedExtinction.ageSpanLabel})
            </span>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold shrink-0">
            {selectedExtinction.casualtyStats.speciesLossPercent}% Total Species Eradicated
          </span>
        </div>
      )}
    </div>
  );
}
