import { Link } from "wouter";
import { ArrowRight, Compass, Map, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Home Page
 * Design: Warm, earthy hero section with feature cards and call-to-action
 * - Large hero image with gradient overlay
 * - "Creature of the Day" feature card
 * - Feature grid showcasing main sections
 */
export default function Home() {
  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
        <div 
          className="relative h-96 sm:h-[500px] bg-cover bg-center"
          style={{
            backgroundImage: "url('/manus-storage/hero-cretaceous_832e4b3c.png')",
            backgroundPosition: "center",
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          
          {/* Hero Content */}
          <div className="relative h-full flex flex-col justify-center px-4 sm:px-8 lg:px-12 max-w-3xl">
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 w-fit">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                  Earth's Deep Time Archives
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Prehistoric Fauna Encyclopedia
              </h1>
              
              <p className="text-base sm:text-lg text-white/90 max-w-2xl leading-relaxed">
                Embark on an immersive journey across geological eras. Unearth verified facts, scientific measurements, and rich reconstructions of creatures that ruled the earth millions of years ago.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/browse">
                  <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white font-semibold rounded-lg px-6 py-3 flex items-center justify-center gap-2">
                    Explore Catalog <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/map">
                  <Button variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 font-semibold rounded-lg px-6 py-3 flex items-center justify-center gap-2">
                    <Map className="h-4 w-4" /> View Time Map
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Explore Prehistorica
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Browse Card */}
          <div className="group relative bg-white rounded-xl p-6 sm:p-8 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="absolute top-6 right-6 h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Compass className="h-6 w-6 text-accent" />
            </div>

            <div className="space-y-4 pr-16">
              <h3 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Browse the Catalog
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Search our comprehensive collection of verified prehistoric species. Filter by diet classification, geographic locations, or geologic eras to discover creatures that match your interests.
              </p>
              <Link to="/browse" className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all text-sm">
                Start Browsing <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Map Card */}
          <div className="group relative bg-white rounded-xl p-6 sm:p-8 border border-border shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="absolute top-6 right-6 h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Map className="h-6 w-6 text-accent" />
            </div>

            <div className="space-y-4 pr-16">
              <h3 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                Interactive Geologic Map
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Travel through geological time. Pick a prehistoric period and click on continental regions to see which species roamed there during different eras.
              </p>
              <Link to="/map" className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all text-sm">
                Launch Map <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Info Section */}
      <section className="bg-secondary rounded-xl p-8 sm:p-12 border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">541M</div>
            <p className="text-sm text-muted-foreground">Years of Evolutionary History</p>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">10+</div>
            <p className="text-sm text-muted-foreground">Geologic Eras Covered</p>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-accent mb-2">100+</div>
            <p className="text-sm text-muted-foreground">Prehistoric Species</p>
          </div>
        </div>
      </section>
    </div>
  );
}
