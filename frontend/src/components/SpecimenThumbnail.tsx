import React, { useState, useEffect, useRef } from 'react';
import { Dna } from 'lucide-react';

interface SpecimenThumbnailProps {
  src: string | null | undefined;
  alt: string;
  eraLabel?: string;
  className?: string;
}

type DisplayMode = 'photo-cover' | 'plinth-white-bg' | 'contain-transparent';

export default function SpecimenThumbnail({
  src,
  alt,
  eraLabel,
  className = ''
}: SpecimenThumbnailProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('photo-cover');
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset state on src change
  useEffect(() => {
    setIsError(false);
    setIsLoaded(false);

    if (!src) {
      setDisplayMode('photo-cover');
      return;
    }

    const lower = src.toLowerCase();
    const isDiagramHint =
      lower.includes('skelet') ||
      lower.includes('diagram') ||
      lower.includes('sketch') ||
      lower.includes('drawing') ||
      lower.includes('mount') ||
      lower.includes('white_background') ||
      lower.includes('white-background') ||
      lower.includes('hartman');

    if (isDiagramHint) {
      setDisplayMode('plinth-white-bg');
    } else if (lower.endsWith('.png') || lower.includes('.png?')) {
      setDisplayMode('contain-transparent');
    } else {
      setDisplayMode('photo-cover');
    }
  }, [src]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const { naturalWidth, naturalHeight } = img;
    if (!naturalWidth || !naturalHeight) {
      setIsLoaded(true);
      return;
    }

    const aspect = naturalWidth / naturalHeight;
    const isExtremeAspect = aspect > 2.05 || aspect < 0.72;

    let detectedMode: DisplayMode = 'photo-cover';

    // Universal canvas perimeter sampling on every single catalog image
    try {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.clearRect(0, 0, 16, 16);
        ctx.drawImage(img, 0, 0, 16, 16);
        const data = ctx.getImageData(0, 0, 16, 16).data;

        let whiteCount = 0;
        let transCount = 0;
        let totalBorder = 0;
        let sumBrightness = 0;

        // Sample all 60 perimeter pixels of the 16x16 thumbnail
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            if (x === 0 || x === 15 || y === 0 || y === 15) {
              totalBorder++;
              const idx = (y * 16 + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const a = data[idx + 3];
              const brightness = (r + g + b) / 3;
              sumBrightness += brightness;

              if (a < 40) {
                transCount++;
              } else if (r > 190 && g > 190 && b > 190) {
                whiteCount++;
              }
            }
          }
        }

        const avgBrightness = totalBorder > 0 ? sumBrightness / totalBorder : 0;

        if (whiteCount >= 8 || avgBrightness > 195) {
          // White or near-white background detected from actual pixel data
          detectedMode = 'plinth-white-bg';
        } else if (transCount >= 8) {
          // Transparent / isolated specimen detected
          detectedMode = 'contain-transparent';
        } else if (isExtremeAspect) {
          // Extreme aspect ratio (panorama or tall sketch)
          detectedMode = 'plinth-white-bg';
        } else {
          // Confirmed full-bleed photo/scene with no white margin
          detectedMode = 'photo-cover';
        }
      }
    } catch {
      // Fallback if CORS prevents pixel reading
      const lower = (src || '').toLowerCase();
      if (
        lower.includes('skelet') ||
        lower.includes('diagram') ||
        lower.includes('white') ||
        isExtremeAspect
      ) {
        detectedMode = 'plinth-white-bg';
      } else if (lower.endsWith('.png') || lower.includes('.png?')) {
        detectedMode = 'contain-transparent';
      } else {
        detectedMode = 'photo-cover';
      }
    }

    setDisplayMode(detectedMode);
    setIsLoaded(true);
  };

  return (
    <div
      className={`relative w-full aspect-[16/10] bg-slate-950/80 border-b border-white/[0.08] overflow-hidden flex items-center justify-center select-none ${className}`}
    >
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-fossil-grid opacity-20 pointer-events-none" />

      {/* Era / Chrono Badge */}
      {eraLabel && (
        <span className="absolute top-2.5 left-2.5 bg-slate-950/90 backdrop-blur-md border border-white/[0.08] px-2.5 py-0.5 rounded text-[10px] font-mono font-bold text-amber-400 tracking-wider uppercase z-20 shadow-md pointer-events-none">
          {eraLabel}
        </span>
      )}

      {/* Image Element with Adaptive Display Mode */}
      {src && !isError ? (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {displayMode === 'photo-cover' ? (
            <img
              src={src}
              alt={alt}
              crossOrigin="anonymous"
              loading="lazy"
              onLoad={handleImageLoad}
              onError={() => setIsError(true)}
              className={`w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-105 drop-shadow-md z-10 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : displayMode === 'plinth-white-bg' ? (
            /* Dark-plinth letterbox treatment for white/near-white backgrounds */
            <div className="w-full h-full p-2.5 sm:p-3 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center p-2 rounded-lg bg-slate-900/90 border border-white/[0.08] shadow-inner relative overflow-hidden">
                <img
                  src={src}
                  alt={alt}
                  crossOrigin="anonymous"
                  loading="lazy"
                  onLoad={handleImageLoad}
                  onError={() => setIsError(true)}
                  className={`max-w-full max-h-full object-contain rounded transition-all duration-500 group-hover:scale-105 drop-shadow-md z-10 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                {/* Subtle dark inset vignette to soften white box boundary */}
                <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_10px_rgba(8,12,22,0.6)] z-20" />
              </div>
            </div>
          ) : (
            /* Contained isolated/transparent PNG specimen */
            <div className="w-full h-full p-2.5 sm:p-3 flex items-center justify-center">
              <img
                src={src}
                alt={alt}
                crossOrigin="anonymous"
                loading="lazy"
                onLoad={handleImageLoad}
                onError={() => setIsError(true)}
                className={`max-w-full max-h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] transition-all duration-500 group-hover:scale-105 z-10 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          )}

          {/* Smooth skeleton placeholder before image loads */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-slate-900/60 animate-pulse flex items-center justify-center">
              <Dna className="h-6 w-6 text-slate-700 animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono bg-slate-950/60 rounded-lg">
          <Dna className="h-8 w-8 text-slate-700 mb-1" />
          Illustration Uncataloged
        </div>
      )}
    </div>
  );
}
