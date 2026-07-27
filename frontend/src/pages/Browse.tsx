import { useState } from "react";
import { Link } from "wouter";
import { Search, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Browse Page
 * Design: Warm, museum-quality catalog with sidebar filters and card grid
 * - Collapsible filter sidebar (mobile-friendly)
 * - Search bar with icon
 * - Staggered card grid with hover effects
 */
export default function Browse() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Mock data for demonstration
  const creatures = [
    { id: 1, name: "Tyrannosaurus Rex", era: "Cretaceous", diet: "Carnivore" },
    { id: 2, name: "Brachiosaurus", era: "Jurassic", diet: "Herbivore" },
    { id: 3, name: "Triceratops", era: "Cretaceous", diet: "Herbivore" },
    { id: 4, name: "Velociraptor", era: "Cretaceous", diet: "Carnivore" },
    { id: 5, name: "Stegosaurus", era: "Jurassic", diet: "Herbivore" },
    { id: 6, name: "Ankylosaurus", era: "Cretaceous", diet: "Herbivore" },
  ];

  const filteredCreatures = creatures.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Explore the Paleocatalog
        </h1>
        <p className="text-muted-foreground text-base">
          Search and filter through millions of years of evolutionary history.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden"
        >
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block space-y-4">
          <div className="bg-secondary rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Filters</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Diet Type</label>
                <select className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                  <option>All Diets</option>
                  <option>Carnivore</option>
                  <option>Herbivore</option>
                  <option>Omnivore</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Geologic Era</label>
                <select className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
                  <option>All Eras</option>
                  <option>Triassic</option>
                  <option>Jurassic</option>
                  <option>Cretaceous</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filters - Drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg p-6 space-y-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-foreground">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Diet Type</label>
                  <select className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-white text-foreground text-sm">
                    <option>All Diets</option>
                    <option>Carnivore</option>
                    <option>Herbivore</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Geologic Era</label>
                  <select className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-white text-foreground text-sm">
                    <option>All Eras</option>
                    <option>Triassic</option>
                    <option>Jurassic</option>
                    <option>Cretaceous</option>
                  </select>
                </div>
              </div>

              <Button onClick={() => setShowFilters(false)} className="w-full bg-accent hover:bg-accent/90 text-white">
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        <div className="lg:col-span-3">
          {filteredCreatures.length === 0 ? (
            <div className="text-center py-12 bg-secondary rounded-xl border border-border">
              <p className="text-muted-foreground">No creatures found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredCreatures.map((creature, index) => (
                <Link key={creature.id} to={`/species/${creature.id}`}>
                  <div 
                    className="group bg-white rounded-xl overflow-hidden border border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 50}ms both`,
                    }}
                  >
                    {/* Image Placeholder */}
                    <div className="h-40 bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center group-hover:from-accent/20 group-hover:to-accent/10 transition-colors">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🦖</div>
                        <p className="text-xs text-muted-foreground">{creature.era}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-foreground text-sm group-hover:text-accent transition-colors">
                          {creature.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{creature.era}</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">{creature.diet}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
