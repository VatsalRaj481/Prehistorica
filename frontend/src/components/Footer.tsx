export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 text-slate-400 py-10 mt-auto font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-black tracking-widest text-slate-100 uppercase font-sans">
                PREHISTORICA
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed font-sans">
              An architectural digital museum documenting verified prehistoric fauna species across Earth's geological eras. Sourced from peer-reviewed scientific records and public domain paleoart.
            </p>
          </div>
          
          <div className="text-left md:text-right text-xs space-y-1 border-t md:border-t-0 border-white/10 pt-4 md:pt-0 w-full md:w-auto">
            <p className="text-slate-400">
              Reconstructions & media courtesy of <span className="text-amber-400 font-bold">Wikimedia Commons</span>
            </p>
            <p className="text-slate-400">
              &copy; {new Date().getFullYear()} PREHISTORICA ARCHIVE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

