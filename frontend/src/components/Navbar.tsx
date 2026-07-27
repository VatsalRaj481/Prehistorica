import { Link } from "wouter";
import { Compass, Search, Map } from "lucide-react";

/**
 * Navigation Bar Component
 * Design: Minimal, elegant top navigation with Playfair Display branding
 * - Warm terracotta accent for the logo
 * - Clean, readable links with hover states
 * - Responsive mobile menu support
 */
export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-1.5">
              <img 
                src="/manus-storage/trilobite-logo_f0a5af50.png" 
                alt="Prehistorica" 
                className="h-7 w-7"
              />
              <span className="text-xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                PREHISTORICA
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              Home
            </Link>
            <Link
              to="/browse"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors flex items-center gap-1.5"
            >
              <Search className="h-4 w-4" />
              Browse
            </Link>
            <Link
              to="/map"
              className="text-sm font-medium text-foreground hover:text-accent transition-colors flex items-center gap-1.5"
            >
              <Map className="h-4 w-4" />
              Map
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <Link to="/browse" className="text-foreground hover:text-accent">
              <Search className="h-5 w-5" />
            </Link>
            <Link to="/map" className="text-foreground hover:text-accent">
              <Map className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
