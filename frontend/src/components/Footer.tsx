import { Link } from 'react-router-dom';
import ShinyText from './reactbits/ShinyText.js';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/[0.08] text-slate-400 py-8 sm:py-9 mt-auto font-mono relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-3.5">
            <img
              src="/logo.png"
              alt="Prehistorica Museum Crest"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(245,158,11,0.2)] select-none"
              draggable={false}
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <ShinyText
                  text="PREHISTORICA"
                  color="#F1F5F9"
                  shineColor="#FBBF24"
                  speed={3.5}
                  className="text-sm font-black tracking-widest uppercase font-mono"
                />
                <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-widest">
                  ARCHIVE v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-lg leading-relaxed font-sans">
                An architectural digital museum documenting verified prehistoric fauna species across Earth's geological eras. Sourced from peer-reviewed scientific records and public domain paleoart.
              </p>
            </div>
          </div>
          
          <div className="text-left md:text-right text-xs space-y-1.5 border-t md:border-t-0 border-white/[0.08] pt-4 md:pt-0 w-full md:w-auto font-mono md:pr-32 lg:pr-36 pb-12 sm:pb-0">
            <p className="text-slate-400 leading-snug">
              Reconstructions &amp; media courtesy of <span className="text-amber-400 font-bold">Wikimedia Commons</span>
            </p>
            <p className="text-slate-500 text-[11px]">
              &copy; {new Date().getFullYear()} PREHISTORICA ARCHIVE. All rights reserved.
            </p>
          </div>
        </div>

        {/* Quick Pavilion Explorations Links */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pavilion Galleries:</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400">
            <Link to="/browse" className="hover:text-amber-400 transition-colors">Catalog Archive</Link>
            <Link to="/cladogram" className="hover:text-amber-400 transition-colors">Tree of Life</Link>
            <Link to="/map" className="hover:text-amber-400 transition-colors">Time-Map</Link>
            <Link to="/runway" className="hover:text-amber-400 transition-colors">1:1 Metric Runway</Link>
            <Link to="/extinctions" className="text-rose-400 hover:text-rose-300 font-bold transition-colors flex items-center gap-1">
              <span>Mass Extinctions Chronicle</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">NEW</span>
            </Link>
            <Link to="/challenge" className="hover:text-amber-400 transition-colors">Curator Trials</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


