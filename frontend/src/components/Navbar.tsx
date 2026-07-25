import { Link, useLocation } from 'react-router-dom';
import { Compass, Search, Map } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-blue-400 border-b-2 border-blue-400 font-semibold'
      : 'text-slate-300 hover:text-white transition-colors';
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Compass className="h-8 w-8 text-blue-500 animate-pulse" />
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                PREHISTORICA
              </span>
            </Link>
          </div>
          
          <div className="flex space-x-8 items-center">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-1 py-5 text-sm font-medium ${isActive('/')}`}
            >
              Home
            </Link>
            <Link
              to="/browse"
              className={`flex items-center gap-1.5 px-1 py-5 text-sm font-medium ${isActive('/browse')}`}
            >
              <Search className="h-4 w-4" />
              Browse
            </Link>
            <Link
              to="/map"
              className={`flex items-center gap-1.5 px-1 py-5 text-sm font-medium ${isActive('/map')}`}
            >
              <Map className="h-4 w-4" />
              Interactive Map
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
