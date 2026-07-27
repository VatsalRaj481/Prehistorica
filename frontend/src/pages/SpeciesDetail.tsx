import { useRoute } from "wouter";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Scale, Dna, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Species Detail Page
 * Design: Two-column layout with large imagery, taxonomy, and scientific facts
 * - Hero image with era badge
 * - Taxonomy classification tree
 * - Size specifications card
 * - Discovery history and facts sections
 */
export default function SpeciesDetail() {
  const [match, params] = useRoute("/species/:id");

  if (!match) return null;

  // Mock species data
  const species = {
    id: parseInt(params?.id || "1"),
    name: "Tyrannosaurus Rex",
    scientificName: "Tyrannosaurus rex",
    nameMeaning: "Tyrant Lizard King",
    era: "Cretaceous",
    myaStart: 68,
    myaEnd: 66,
    diet: "Carnivore",
    length: 12.3,
    height: 3.7,
    weight: 9000,
    taxonomy: "Animalia → Chordata → Reptilia → Dinosauria → Theropoda → Tyrannosauridae",
    locations: ["North America", "Montana", "Wyoming", "South Dakota"],
    discoveryHistory: "First discovered in 1902 in Montana. Named by Henry Fairfield Osborn. Remains of over 30 individuals have been found, making it one of the most well-studied dinosaurs.",
    facts: [
      "The largest known terrestrial carnivore of all time",
      "Could run at speeds up to 25 mph (40 km/h)",
      "Had a bite force of approximately 12,800 pounds",
      "Vision was comparable to modern eagles",
      "May have been a scavenger or an active predator"
    ]
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Back Button */}
      <Link to="/browse">
        <Button variant="ghost" className="text-accent hover:text-accent/80 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Button>
      </Link>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
        {/* Left: Images */}
        <div className="space-y-6">
          {/* Main Image */}
          <div className="relative rounded-xl overflow-hidden border border-border shadow-lg h-96 bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4">🦖</div>
              <p className="text-muted-foreground">Life Reconstruction</p>
            </div>
          </div>

          {/* Secondary Image */}
          <div className="relative rounded-xl overflow-hidden border border-border shadow-md h-48 bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">🦴</div>
              <p className="text-xs text-muted-foreground">Fossil Skeleton</p>
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-3 border-b border-border pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-semibold">
              {species.era} • {species.myaStart}–{species.myaEnd} MYA
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              {species.name}
            </h1>
            <p className="text-sm italic text-muted-foreground">{species.scientificName}</p>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Name Meaning:</span> "{species.nameMeaning}"
            </p>
          </div>

          {/* Size Card */}
          <div className="bg-secondary rounded-xl p-5 border border-border space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Scale className="h-4 w-4 text-accent" /> Size & Weight
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white rounded-lg border border-border">
                <p className="text-xs text-muted-foreground font-semibold">Length</p>
                <p className="text-lg font-bold text-accent mt-1">{species.length}m</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-border">
                <p className="text-xs text-muted-foreground font-semibold">Height</p>
                <p className="text-lg font-bold text-accent mt-1">{species.height}m</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-border">
                <p className="text-xs text-muted-foreground font-semibold">Weight</p>
                <p className="text-lg font-bold text-accent mt-1">{species.weight.toLocaleString()}kg</p>
              </div>
            </div>
          </div>

          {/* Taxonomy */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Dna className="h-4 w-4 text-accent" /> Taxonomy
            </h3>
            <div className="flex flex-wrap gap-2">
              {species.taxonomy.split(" → ").map((taxon, idx, arr) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-secondary border border-border text-xs font-medium text-foreground">
                    {taxon}
                  </span>
                  {idx < arr.length - 1 && <span className="text-muted-foreground">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Diet & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-secondary rounded-lg border border-border">
              <p className="text-xs text-muted-foreground font-semibold uppercase">Diet</p>
              <p className="text-sm font-semibold text-foreground mt-2">{species.diet}</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg border border-border">
              <p className="text-xs text-muted-foreground font-semibold uppercase">Locations</p>
              <p className="text-sm font-semibold text-foreground mt-2">{species.locations.join(", ")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Discovery & Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-border pt-8 sm:pt-12">
        {/* Discovery History */}
        <div className="bg-secondary rounded-xl p-6 border border-border space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <BookOpen className="h-5 w-5 text-accent" /> Discovery History
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{species.discoveryHistory}</p>
        </div>

        {/* Key Facts */}
        <div className="bg-secondary rounded-xl p-6 border border-border space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <FileText className="h-5 w-5 text-accent" /> Key Scientific Facts
          </h2>
          <ul className="space-y-2">
            {species.facts.map((fact, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
