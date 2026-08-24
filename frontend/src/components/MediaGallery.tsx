import { useState } from 'react';
import { MediaItem } from '../services/api.js';
import { Image, ExternalLink, Dna, Layers } from 'lucide-react';

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
  // Construct normalized items list
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2 h-80">
        <Dna className="h-12 w-12 text-slate-700" />
        <p className="text-sm font-semibold text-slate-400">No Reconstructions or Specimen Photos Available</p>
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
      case 'scale_diagram':
        return 'Skeletal Diagram';
      default:
        return 'Reconstruction';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
      {/* Active Main Image Container */}
      <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Subtle grid pattern for clean transparent & white background image display */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <img
          src={activeItem.url}
          alt={`${speciesName} - ${getTypeLabel(activeItem.type)}`}
          className="max-w-full max-h-full object-contain rounded-lg transition-all duration-300 drop-shadow-md z-10"
        />

        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-20">
          <span className="bg-slate-950/80 backdrop-blur-md border border-slate-800 text-blue-400 font-semibold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow-md">
            <Image className="h-3.5 w-3.5" />
            {getTypeLabel(activeItem.type)}
          </span>
        </div>

        {activeItem.sourceUrl && (
          <a
            href={activeItem.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 shadow-lg transition-colors z-20"
          >
            Source <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Credit Footer Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 min-w-0">
          <Layers className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="truncate">Credit: <strong className="text-slate-200">{activeItem.credit}</strong></span>
        </div>

        {/* Thumbnail Tabs */}
        {items.length > 1 && (
          <div className="flex gap-2 shrink-0">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-12 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  idx === activeIndex
                    ? 'border-blue-500 scale-105 shadow-md'
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
                title={getTypeLabel(item.type)}
              >
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
