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

  if (items.length === 0) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-8 sm:p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3 aspect-[16/9] w-full shadow-xl">
        <div className="h-14 w-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
          <Palette className="h-7 w-7 text-blue-400/70" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-200">Life reconstruction artwork pending</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No open-licensed life reconstruction artwork is currently available for {speciesName}. Skeletal diagrams or commissioned art will appear here once verified.
          </p>
        </div>
      </div>
    );
  }

  const activeItem = items[activeIndex] || items[0];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'art':
        return 'Life Reconstruction';
      case 'photo':
        return 'Fossil Specimen';
      case 'diagram':
      case 'scale_diagram':
        return 'Skeletal Diagram';
      default:
        return 'Reconstruction';
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl space-y-0">
      <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.img
            key={activeItem.url}
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            src={activeItem.url}
            alt={`${speciesName} - ${getTypeLabel(activeItem.type)}`}
            className="max-w-full max-h-full object-contain rounded-lg drop-shadow-xl z-10"
          />
        </AnimatePresence>

        <div className="absolute top-4 left-4 flex gap-2 z-20">
          <span className="bg-slate-950/85 backdrop-blur-md border border-slate-800 text-blue-400 font-semibold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow-md">
            <Image className="h-3.5 w-3.5" />
            {getTypeLabel(activeItem.type)}
          </span>
        </div>

        {activeItem.sourceUrl && (
          <motion.a
            whileTap={{ scale: 0.92 }}
            href={activeItem.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 shadow-lg transition-colors z-20"
          >
            Source <ExternalLink className="h-3 w-3" />
          </motion.a>
        )}
      </div>

      <div className="p-4 border-t border-slate-850 bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-400 space-y-0.5 max-w-md">
          <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Attribution & Credit:</div>
          <p className="italic text-slate-300 leading-relaxed truncate">{activeItem.credit}</p>
        </div>

        {items.length > 1 && (
          <div className="flex gap-2 shrink-0">
            {items.map((item, idx) => (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveIndex(idx)}
                className={`relative h-12 w-12 rounded-lg border overflow-hidden transition-all cursor-pointer ${
                  activeIndex === idx
                    ? 'border-blue-500 shadow-md shadow-blue-500/20 ring-1 ring-blue-500'
                    : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                <img src={item.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
