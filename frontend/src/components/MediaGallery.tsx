import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MediaItem } from '../services/api.js';
import { Image, ExternalLink, Palette } from 'lucide-react';

interface MediaGalleryProps {
  media?: MediaItem[];
  reconstructionImageUrl?: string | null;
  fossilImageUrl?: string | null;
  speciesName: string;
}

export default function MediaGallery({
  media,
  reconstructionImageUrl,
  fossilImageUrl,
  speciesName
}: MediaGalleryProps) {
  const shouldReduceMotion = useReducedMotion();

  let items: MediaItem[] = media && media.length > 0 ? media : [];

  if (items.length === 0) {
    if (reconstructionImageUrl) {
      items.push({
        url: reconstructionImageUrl,
        type: 'art',
        credit: 'Life reconstruction illustration',
        sourceUrl: reconstructionImageUrl
      });
    }
    if (fossilImageUrl) {
      items.push({
        url: fossilImageUrl,
        type: 'photo',
        credit: 'Fossil skeletal specimen photo',
        sourceUrl: fossilImageUrl
      });
    }
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});

  const handleImageError = (url: string) => {
    console.warn(`MediaGallery: Failed to load image URL: ${url}`);
    setFailedUrls(prev => ({ ...prev, [url]: true }));
  };

  if (items.length === 0) {
    return (
      <div className="bg-slate-950 border border-slate-800 p-8 sm:p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3 aspect-[16/9] w-full shadow-2xl font-mono">
        <div className="h-14 w-14 bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 shadow-inner">
          <Palette className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Life reconstruction artwork pending</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            No open-licensed life reconstruction artwork is currently cataloged for {speciesName}. Skeletal diagrams or artwork will appear here once verified.
          </p>
        </div>
      </div>
    );
  }

  const activeItem = items[activeIndex] || items[0];

  // Clean Wikimedia Commons URL by removing trailing query params if needed
  const cleanUrl = activeItem.url ? activeItem.url.split('?')[0] : '';
  const isFailed = failedUrls[activeItem.url] || failedUrls[cleanUrl];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'art':
        return 'Life Reconstruction';
      case 'taxonomy_diagram':
        return 'Taxonomy Diagram';
      case 'fossil_specimen':
      case 'photo':
        return 'Fossil Specimen';
      case 'skeletal_reconstruction':
      case 'scale_diagram':
      case 'diagram':
        return 'Skeletal Reconstruction';
      case 'comparative_anatomy':
        return 'Comparative Anatomy';
      case 'scientific_figure':
        return 'Scientific Figure';
      default:
        return 'Life Reconstruction';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-none overflow-hidden shadow-2xl font-mono">
      <div className="relative w-full aspect-[16/9] bg-slate-900 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {isFailed ? (
          <div className="text-center text-slate-400 flex flex-col items-center justify-center space-y-3 aspect-[16/9] w-full font-mono">
            <div className="h-12 w-12 bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500">
              <Palette className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Exhibit Image Preview Unavailable</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Unable to load remote media stream for {speciesName}.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.img
              key={cleanUrl}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              src={cleanUrl}
              referrerPolicy="no-referrer"
              onError={() => handleImageError(activeItem.url)}
              alt={`${speciesName} - ${getTypeLabel(activeItem.type)}`}
              className="max-w-full max-h-full object-contain rounded-none drop-shadow-2xl z-10"
            />
          </AnimatePresence>
        )}

        <div className="absolute top-4 left-4 flex gap-2 z-20">
          <span className="bg-slate-950/90 border border-slate-800 text-amber-400 font-bold uppercase tracking-wider px-3 py-1 text-[10px] flex items-center gap-1.5 shadow-md">
            <Image className="h-3.5 w-3.5" />
            {getTypeLabel(activeItem.type)}
          </span>
        </div>

        {activeItem.sourceUrl && !isFailed && (
          <motion.a
            whileTap={{ scale: 0.92 }}
            href={activeItem.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg transition-colors z-20"
          >
            Source <ExternalLink className="h-3 w-3" />
          </motion.a>
        )}
      </div>

      <div className="p-4 border-t border-slate-850 bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-400 space-y-0.5 max-w-md">
          <div className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Attribution & Credit:</div>
          <p className="italic text-slate-300 leading-relaxed truncate">
            {activeItem.credit || `Wikimedia Commons contributor (${speciesName})`}
          </p>
        </div>

        {items.length > 1 && (
          <div className="flex gap-2 shrink-0">
            {items.map((item, idx) => {
              const thumbUrl = item.url ? item.url.split('?')[0] : '';
              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative h-12 w-12 border overflow-hidden transition-all cursor-pointer ${
                    activeIndex === idx
                      ? 'border-amber-500 shadow-lg ring-1 ring-amber-500'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={thumbUrl}
                    referrerPolicy="no-referrer"
                    onError={() => handleImageError(item.url)}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
