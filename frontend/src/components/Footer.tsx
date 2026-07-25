export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-slate-200 tracking-wider">
              PREHISTORICA
            </h3>
            <p className="text-xs mt-1 max-w-md">
              A comprehensive encyclopedia cataloging prehistoric fauna. Sourced from peer-reviewed scientific records and public domain paleoart.
            </p>
          </div>
          
          <div className="text-center md:text-right text-xs">
            <p>
              Images sourced from <span className="text-blue-400">Wikimedia Commons</span> under Public Domain / CC licenses.
            </p>
            <p className="mt-1">
              &copy; {new Date().getFullYear()} Prehistorica. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
