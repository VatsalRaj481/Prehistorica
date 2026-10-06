import ShinyText from './reactbits/ShinyText.js';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/[0.08] text-slate-400 pt-8 pb-24 sm:pb-20 md:py-8 mt-auto font-mono relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-10">
          {/* Left: Museum Branding & Archival Scope */}
          <div className="flex items-start gap-3.5 max-w-xl">
            <img
              src="/logo.png"
              alt="Prehistorica Museum Crest"
              className="h-10 w-10 sm:h-11 sm:w-11 object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(245,158,11,0.2)] select-none mt-0.5"
              draggable={false}
            />
            <div className="space-y-1.5">
              <ShinyText
                text="PREHISTORICA"
                color="#F1F5F9"
                shineColor="#FBBF24"
                speed={3.5}
                className="text-sm font-black tracking-widest uppercase font-mono block"
              />
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                An architectural digital museum documenting verified prehistoric fauna species across Earth's geological eras. Sourced from peer-reviewed scientific records and public domain paleoart.
              </p>
            </div>
          </div>
          
          {/* Right: Attribution & Archival Copyright (with safe area clearance for fixed RAJY widget) */}
          <div className="text-left md:text-right text-xs space-y-1.5 border-t md:border-t-0 border-white/[0.08] pt-4 md:pt-0 w-full md:w-auto font-mono shrink-0 pr-16 md:pr-24 lg:pr-28">
            <p className="text-slate-400 leading-snug">
              Reconstructions &amp; media courtesy of{' '}
              <a
                href="https://commons.wikimedia.org/wiki/Main_page"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-amber-400 transition-colors"
              >
                Wikimedia Commons
              </a>
            </p>
            <p className="text-slate-500 text-[11px]">
              &copy; {new Date().getFullYear()} PREHISTORICA ARCHIVE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
