/**
 * Footer Component
 * Design: Minimal, warm footer with brand info and links
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary border-t border-border mt-16 sm:mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Prehistorica
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A comprehensive digital museum exploring prehistoric fauna across geological time periods.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Explore</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><a href="/" className="hover:text-accent transition-colors">Home</a></li>
              <li><a href="/browse" className="hover:text-accent transition-colors">Browse Catalog</a></li>
              <li><a href="/map" className="hover:text-accent transition-colors">Geologic Map</a></li>
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">About</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Discover verified facts, scientific measurements, and rich reconstructions of creatures that ruled the earth millions of years ago.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Prehistorica. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
