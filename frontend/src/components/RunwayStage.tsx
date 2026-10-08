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

  // Known silhouette aspect ratios (width / height) for instant zero-jump rendering
  const KNOWN_ASPECT_RATIOS: Record<string, number> = {
    // Azhdarchid pterosaurs
    'c464d4f2-caf6-4f60-b139-0c649dd3cecb.svg': 1.200, // Quetzalcoatlus northropi
    '6dd3a0b6-8c58-4205-9f10-45b6686c4cd0.svg': 0.7886, // Hatzegopteryx / Azhdarcho
    'bb407d49-45f6-47f5-95c7-359115bfca64.svg': 0.7310, // Thanatosdrakon amaru
    // Sauropods
    '7a99b167-b719-4233-946c-addf3ef1c06c.png': 2.6775, // Argentinosaurus / Patagotitan
    '769e86a0-ef2a-47ef-b6f9-5df58cf9fa9c.png': 2.6500, // Dreadnoughtus
    '952dfeab-8c3b-49a5-a43b-96d46b18885f.png': 2.4500, // Isisaurus
    // Megatheropods
    'ccb9b896-20b5-4e0b-8979-001742a884c5.svg': 2.8200, // Tyrannosaurus rex
    'b8db44e0-1c99-4256-8c35-61e914af848b.svg': 3.1000, // Spinosaurus
    'cf75413c-6985-400e-9389-81d7007e5d91-calibrated.svg': 2.7500, // Giganotosaurus
    '84bfa110-4a5b-437e-b759-711c76f5eed8.png': 2.8000, // Carcharodontosaurus
    // Armored & Ceratopsians
    '8a8a2525-e97d-4505-8085-7958f8d36137.svg': 2.6200, // Ankylosaurus
    '429d71d8-2940-449b-838b-a5b7f1733eba-calibrated.svg': 2.1800, // Stegosaurus
    '075de9e2-1b71-49d3-8d22-9eb2a78248e4.svg': 2.6000, // Triceratops
    '5b062105-b6a2-4405-bd75-3d0399102b9a.svg': 2.5000, // Euoplocephalus
    // Reference models
    'reference-human.svg': 0.5280,
    'reference-african-bush-elephant.svg': 1.4270
  };

  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({});

  // Dynamically detect intrinsic aspect ratio of any loaded silhouette image
  useEffect(() => {
    speciesList.forEach((sp) => {
      const url = sp.comparisonSilhouette?.url;
      if (!url || aspectRatios[url]) return;
      const filename = url.split('/').pop() || '';
      if (KNOWN_ASPECT_RATIOS[filename]) {
        setAspectRatios((prev) => ({ ...prev, [url]: KNOWN_ASPECT_RATIOS[filename] }));
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          setAspectRatios((prev) => ({
            ...prev,
            [url]: img.naturalWidth / img.naturalHeight
          }));
        }
      };
      img.src = url;
    });
  }, [speciesList]);

  const getSilhouetteAR = (url?: string | null): number | null => {
    if (!url) return null;
    if (aspectRatios[url]) return aspectRatios[url];
    const filename = url.split('/').pop() || '';
    if (KNOWN_ASPECT_RATIOS[filename]) return KNOWN_ASPECT_RATIOS[filename];
    return null;
  };

  // Stable architectural runway dimensions:
  // The runway stage height (440px) and ground baseline remain constant so zooming in/out
  // only scales the size of the species silhouettes without resizing or distorting the stage
  const STAGE_HEIGHT = 440;
  const groundY = STAGE_HEIGHT - 65; // Fixed baseline ground line (375px)
  const maxStageUsableH = groundY - 55; // 320px headroom under ceiling grid

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

  // Metric sizing for each creature: calibrated directly to scientific length and standing height
  // taking into account the silhouette's true aspect ratio so caliper brackets hug the visual shape
  const creaturesMetrics = useMemo(() => {
    return speciesList.map((sp) => {
      const rawLen = sp.lengthM && sp.lengthM > 0 ? sp.lengthM : 5.0;
      const rawH = sp.heightM && sp.heightM > 0 ? sp.heightM : Math.max(1, rawLen * 0.35);
      const silUrl = sp.comparisonSilhouette?.url;
      const ar = getSilhouetteAR(silUrl);

      let renderWidthM: number;
      let renderHeightM: number;

      if (ar) {
        // If species is primarily vertical/tall (standing height > axial length, e.g. Azhdarchid pterosaurs)
        if (rawH > rawLen) {
          renderHeightM = rawH;
          renderWidthM = renderHeightM * ar;
        } else {
          // Primarily horizontal creatures (sauropods, theropods, ceratopsians, etc.)
          renderWidthM = rawLen;
          renderHeightM = renderWidthM / ar;
        }
      } else {
        renderWidthM = rawLen;
        renderHeightM = rawH;
      }

      // Ensure creature height does not clip through stage ceiling at current scale
      const rawPxHeight = renderHeightM * scale;
      if (rawPxHeight > maxStageUsableH) {
        const shrinkRatio = maxStageUsableH / rawPxHeight;
        renderHeightM = renderHeightM * shrinkRatio;
        renderWidthM = renderWidthM * shrinkRatio;
      }

      return {
        species: sp,
        lengthM: rawLen,
        heightM: rawH,
        renderWidthM,
        renderHeightM,
        actualAR: ar || (renderWidthM / renderHeightM)
      };
    });
  }, [speciesList, aspectRatios, scale]);

  // Layout calculations: arrange specimens sequentially on the runway track.
  // At maximum zoom out (or when content width is less than container), silhouettes are evenly
  // spaced across the full runway stage to eliminate dead space on the right.
  const runwayLayout = useMemo(() => {
    const estimateNameplateWidth = (sp: Species) => {
      const nameLen = (sp.name || '').length;
      const cladeLen = formatEnumLabel(sp.clade).length;
      const periodLen = (sp.timePeriod || '').length;
      const nameW = nameLen * 8.5 + 46;
      const subW = (cladeLen + periodLen) * 6.2 + 24;
      return Math.max(140, Math.min(270, Math.max(nameW, subW)));
    };

    type LayoutElement =
      | { type: 'ref'; widthPx: number; heightPx: number; cardWPx: number }
      | { type: 'species'; index: number; widthPx: number; heightPx: number; cardWPx: number };

    const elements: LayoutElement[] = [];

    if (activeReference !== 'none') {
      elements.push({
        type: 'ref',
        widthPx: refSpecs.lengthM * scale,
        heightPx: refSpecs.heightM * scale,
        cardWPx: 90
      });
    }

    creaturesMetrics.forEach((cm, idx) => {
      elements.push({
        type: 'species',
        index: idx,
        widthPx: cm.renderWidthM * scale,
        heightPx: cm.renderHeightM * scale,
        cardWPx: estimateNameplateWidth(cm.species)
      });
    });

    if (elements.length === 0) {
      return {
        items: [],
        refStartX: 2.0,
        totalTrackWidthPx: containerWidth,
        totalLength: containerWidth / scale
      };
    }

    // Left and right margins:
    // Reference figure needs ~50px left margin; creature without reference needs 100px for height caliper badge
    const leftMarginPx =
      elements[0].type === 'ref'
        ? Math.max(45, (elements[0].cardWPx - elements[0].widthPx) / 2 + 20)
        : showCalipers
        ? 100
        : 50;

    const lastEl = elements[elements.length - 1];
    const rightMarginPx = Math.max(60, (lastEl.cardWPx - lastEl.widthPx) / 2 + 30);

    // Calculate minimum required gap between consecutive elements to prevent:
    // 1. Nameplate overlap
    // 2. Caliper collision on species (height caliper needs ~96px)
    const minGapsPx: number[] = [];
    for (let i = 0; i < elements.length - 1; i++) {
      const eCur = elements[i];
      const eNext = elements[i + 1];

      const minCenterDist = (eCur.cardWPx + eNext.cardWPx) / 2 + 20;
      const halfSpans = eCur.widthPx / 2 + eNext.widthPx / 2;
      const nameplateGap = Math.max(20, minCenterDist - halfSpans);

      // Next element's height caliper sits 10-90px to its left
      const caliperGap = (eNext.type === 'species' && showCalipers) ? 96 : 30;

      minGapsPx.push(Math.max(caliperGap, nameplateGap));
    }

    const totalElementsWidthPx = elements.reduce((acc, el) => acc + el.widthPx, 0);
    const sumMinGapsPx = minGapsPx.reduce((acc, g) => acc + g, 0);
    const minTrackWidthPx = leftMarginPx + totalElementsWidthPx + sumMinGapsPx + rightMarginPx;

    // Distribute across containerWidth if available:
    // At maximum zoom out (or whenever total track is narrower than the viewport),
    // evenly space out the silhouettes so the entire runway space is covered without empty voids.
    let stageTrackWidthPx = Math.max(containerWidth, minTrackWidthPx);
    const extraSpacePx = stageTrackWidthPx - leftMarginPx - rightMarginPx - totalElementsWidthPx;
    const numGaps = elements.length - 1;

    const elementPositions: number[] = [];

    if (numGaps === 0) {
      // Single element: center in container
      elementPositions.push(Math.max(leftMarginPx, (stageTrackWidthPx - elements[0].widthPx) / 2));
    } else {
      const evenGapPx = extraSpacePx / numGaps;

      // Check if evenGapPx is large enough for all pairs
      const allGapsSatisfied = minGapsPx.every((minG) => evenGapPx >= minG);

      if (allGapsSatisfied) {
        // Perfect even distribution spanning 100% of the stage container
        let curX = leftMarginPx;
        elements.forEach((el) => {
          elementPositions.push(curX);
          curX += el.widthPx + evenGapPx;
        });
      } else {
        // If some gaps need more than evenGapPx, distribute surplus space proportionally
        const surplusSpacePx = Math.max(0, extraSpacePx - sumMinGapsPx);
        const extraPerGap = surplusSpacePx / numGaps;

        let curX = leftMarginPx;
        elements.forEach((el, i) => {
          elementPositions.push(curX);
          const gap = i < minGapsPx.length ? minGapsPx[i] + extraPerGap : 0;
          curX += el.widthPx + gap;
        });
        stageTrackWidthPx = Math.max(stageTrackWidthPx, curX + rightMarginPx);
      }
    }

    // Map calculated pixel positions back to reference and creature items
    let refStartX = 2.0;
    const items: Array<{
      species: Species;
      lengthM: number;
      heightM: number;
      renderWidthM: number;
      renderHeightM: number;
      startPx: number;
      endPx: number;
      midPx: number;
      pxWidth: number;
      pxHeight: number;
      yTop: number;
      nameplateWidth: number;
    }> = [];

    elements.forEach((el, i) => {
      const posPx = elementPositions[i];
      if (el.type === 'ref') {
        refStartX = posPx / scale;
      } else {
        const cm = creaturesMetrics[el.index];
        const pxWidth = el.widthPx;
        const pxHeight = el.heightPx;
        const yTop = groundY - pxHeight;
        items.push({
          species: cm.species,
          lengthM: cm.lengthM,
          heightM: cm.heightM,
          renderWidthM: cm.renderWidthM,
          renderHeightM: cm.renderHeightM,
          startPx: posPx,
          endPx: posPx + pxWidth,
          midPx: posPx + pxWidth / 2,
          pxWidth,
          pxHeight,
          yTop,
          nameplateWidth: el.cardWPx
        });
      }
    });

    return {
      items,
      refStartX,
      totalTrackWidthPx: stageTrackWidthPx,
      totalLength: stageTrackWidthPx / scale
    };
  }, [creaturesMetrics, activeReference, refSpecs, scale, showCalipers, containerWidth]);

  // Total track width: spans at least 100% of container and dynamically expands when content overflows
  const viewWidth = Math.max(containerWidth, runwayLayout.totalTrackWidthPx);
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
                  <g transform={`translate(${(0.95 * scale) / 2}, ${groundY + 12})`}>
                    <rect
                      x="-42"
                      y="0"
                      width="84"
                      height="34"
                      rx="6"
                      fill="rgba(11, 17, 33, 0.88)"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="13"
                      fill="#94A3B8"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      1.8m Human
                    </text>
                    <text
                      x="0"
                      y="25"
                      fill="#64748B"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      Scale Reference
                    </text>
                  </g>
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
                  <g transform={`translate(${(4.5 * scale) / 2}, ${groundY + 12})`}>
                    <rect
                      x="-45"
                      y="0"
                      width="90"
                      height="34"
                      rx="6"
                      fill="rgba(11, 17, 33, 0.88)"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="13"
                      fill="#94A3B8"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      4.5m Sedan
                    </text>
                    <text
                      x="0"
                      y="25"
                      fill="#64748B"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      Scale Reference
                    </text>
                  </g>
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
                  <g transform={`translate(${(11.5 * scale) / 2}, ${groundY + 12})`}>
                    <rect
                      x="-52"
                      y="0"
                      width="104"
                      height="34"
                      rx="6"
                      fill="rgba(11, 17, 33, 0.88)"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="13"
                      fill="#94A3B8"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      11.5m Transit Bus
                    </text>
                    <text
                      x="0"
                      y="25"
                      fill="#64748B"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      Scale Reference
                    </text>
                  </g>
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
                  <g transform={`translate(${(6.5 * scale) / 2}, ${groundY + 12})`}>
                    <rect
                      x="-54"
                      y="0"
                      width="108"
                      height="34"
                      rx="6"
                      fill="rgba(11, 17, 33, 0.88)"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="13"
                      fill="#94A3B8"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      3.3m Bush Elephant
                    </text>
                    <text
                      x="0"
                      y="25"
                      fill="#64748B"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      Scale Reference
                    </text>
                  </g>
                </g>
              )}
            </g>
          )}

          {/* Lineup Species Silhouettes & Calipers */}
          {runwayLayout.items.map((item, idx) => {
            const isHighlighted = highlightedIndex === idx;
            const pxWidth = item.pxWidth;
            const pxHeight = item.pxHeight;
            const midPx = item.midPx;
            const startPx = item.startPx;
            const yTop = item.yTop;
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
                    preserveAspectRatio="xMinYMax meet"
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
                        {item.renderWidthM.toFixed(1)}m ({formatFeet(item.renderWidthM)})
                      </text>
                    </g>

                    {/* Vertical Height Line: Ground up to Standing Height */}
                    <line
                      x1={startPx - 10}
                      y1={yTop}
                      x2={startPx - 10}
                      y2={groundY}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.35)'}
                      strokeWidth="1"
                      strokeDasharray="3 2"
                    />
                    {/* Vertical Height Ticks */}
                    <line
                      x1={startPx - 15}
                      y1={yTop}
                      x2={startPx - 5}
                      y2={yTop}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.5)'}
                      strokeWidth="1"
                    />
                    <line
                      x1={startPx - 15}
                      y1={groundY}
                      x2={startPx - 5}
                      y2={groundY}
                      stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.5)'}
                      strokeWidth="1"
                    />

                    {/* Vertical Height Metric Pill Badge */}
                    <g transform={`translate(${startPx - 14}, ${yTop + pxHeight / 2})`}>
                      <rect
                        x="-76"
                        y="-8.5"
                        width="76"
                        height="17"
                        rx="3.5"
                        fill="#080C16"
                        stroke={isHighlighted ? '#F59E0B' : 'rgba(255,255,255,0.22)'}
                        strokeWidth="1"
                      />
                      <text
                        x="-38"
                        y="3.5"
                        fill={isHighlighted ? '#F59E0B' : '#F3F6FB'}
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {item.renderHeightM.toFixed(1)}m ({formatFeet(item.renderHeightM)})
                      </text>
                    </g>
                  </g>
                )}

                {/* Ground Tag Nameplate Plinth */}
                <g transform={`translate(${midPx}, ${groundY + 12})`}>
                  <rect
                    x={-item.nameplateWidth / 2}
                    y="0"
                    width={item.nameplateWidth}
                    height="34"
                    rx="6"
                    fill={isHighlighted ? 'rgba(245, 158, 11, 0.15)' : 'rgba(11, 17, 33, 0.88)'}
                    stroke={isHighlighted ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="13"
                    fill={isHighlighted ? '#F59E0B' : '#F3F6FB'}
                    fontSize={item.species.name.length > 20 ? '9.5' : '10.5'}
                    fontWeight="900"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    className="uppercase tracking-wider"
                  >
                    #{idx + 1} {item.species.name}
                  </text>
                  <text
                    x="0"
                    y="25"
                    fill={isHighlighted ? '#FCD34D' : '#94A3B8'}
                    fontSize="8.5"
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
