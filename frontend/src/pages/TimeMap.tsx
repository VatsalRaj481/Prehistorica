import { useState } from "react";
import { Compass, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * TimeMap Page
 * Design: Geologic timeline slider with continent/formation selection
 * - Interactive era timeline
 * - Map placeholder with continent markers
 * - Results sidebar showing species
 */
export default function TimeMap() {
  const [selectedEra, setSelectedEra] = useState(6); // Cretaceous
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);

  const eras = [
    { name: "Cambrian", range: "541–485 MYA", desc: "Explosion of marine life forms" },
    { name: "Devonian", range: "419–359 MYA", desc: "Dominance of placoderm fishes" },
    { name: "Carboniferous", range: "359–299 MYA", desc: "Giant terrestrial arthropods" },
    { name: "Permian", range: "299–251 MYA", desc: "Rise of synapsids" },
    { name: "Triassic", range: "251–201 MYA", desc: "Dawn of early dinosaurs" },
    { name: "Jurassic", range: "201–145 MYA", desc: "Golden age of sauropods" },
    { name: "Cretaceous", range: "145–66 MYA", desc: "Apex of theropods" },
    { name: "Eocene", range: "56–34 MYA", desc: "Rise of modern mammal groups" },
    { name: "Neogene", range: "23–2.6 MYA", desc: "Era of megalodon" },
    { name: "Pleistocene", range: "2.6–0.01 MYA", desc: "Quaternary Ice Age" }
  ];

  const continents = ["North America", "South America", "Europe", "Asia", "Africa", "Oceania"];
  const activeEra = eras[selectedEra];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          <Compass className="h-8 w-8 text-accent" /> Geologic Time Map
        </h1>
        <p className="text-muted-foreground">
          Slide through geological epochs. Click on continents to see which species roamed there.
        </p>
      </div>

      {/* Era Info Card */}
      <div className="bg-secondary rounded-xl p-6 border border-border space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase">Active Period</p>
            <p className="text-2xl font-bold text-accent mt-1">{activeEra.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-semibold uppercase">Time Range</p>
            <p className="text-lg font-semibold text-foreground mt-1">{activeEra.range}</p>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-3 pt-4 border-t border-border">
          <input
            type="range"
            min="0"
            max={eras.length - 1}
            value={selectedEra}
            onChange={(e) => setSelectedEra(parseInt(e.target.value))}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <div className="flex flex-wrap gap-2 justify-center">
            {eras.map((era, idx) => (
              <button
                key={era.name}
                onClick={() => setSelectedEra(idx)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  idx === selectedEra
                    ? "bg-accent text-white"
                    : "bg-white border border-border text-foreground hover:border-accent"
                }`}
              >
                {era.name}
              </button>
            ))}
          </div>
        </div>

        {/* Era Description */}
        <div className="flex gap-3 p-3 bg-white rounded-lg border border-border">
          <Info className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{activeEra.name}:</span> {activeEra.desc}
          </p>
        </div>
      </div>

      {/* Map & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-border h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-muted-foreground">Interactive Map</p>
            <p className="text-xs text-muted-foreground mt-2">Click on continents to explore</p>
          </div>
        </div>

        {/* Sidebar: Continents */}
        <div className="bg-secondary rounded-xl p-6 border border-border space-y-4">
          <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
            Select Continent
          </h3>
          <div className="space-y-2">
            {continents.map((continent) => (
              <button
                key={continent}
                onClick={() => setSelectedContinent(selectedContinent === continent ? null : continent)}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  selectedContinent === continent
                    ? "bg-accent text-white border border-accent"
                    : "bg-white border border-border text-foreground hover:border-accent"
                }`}
              >
                {continent}
              </button>
            ))}
          </div>

          {/* Results */}
          {selectedContinent && (
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <p className="text-xs text-muted-foreground font-semibold uppercase">Results</p>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded-lg border border-border">
                  <p className="text-sm font-semibold text-foreground">Tyrannosaurus Rex</p>
                  <p className="text-xs text-muted-foreground mt-1">Carnivore</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-border">
                  <p className="text-sm font-semibold text-foreground">Triceratops</p>
                  <p className="text-xs text-muted-foreground mt-1">Herbivore</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
