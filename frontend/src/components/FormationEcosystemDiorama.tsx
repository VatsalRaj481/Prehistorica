import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Layers, 
  MapPin, 
  ArrowUpRight, 
  Network, 
  Shield, 
  Zap, 
  Leaf, 
  Fish,
  Flame,
  Loader2
} from 'lucide-react';
import { fetchSpeciesRoster, SpeciesRosterItem } from '../services/api.js';
import { formatEnumLabel } from '../utils/formatEnumLabel.js';
import ShinyText from './reactbits/ShinyText.js';

interface FormationPreset {
  id: string;
  name: string;
  aliases: string[];
  mya: string;
  location: string;
  paleoenvironment: string;
  description: string;
  color: string;
}

const FORMATION_PRESETS: FormationPreset[] = [
  {
    id: 'hell-creek',
    name: 'Hell Creek Formation',
    aliases: ['hell creek', 'hell creek formation', 'lance formation'],
    mya: '66–68 Ma (Late Cretaceous)',
    location: 'Montana, North Dakota, South Dakota, Wyoming (USA)',
    paleoenvironment: 'Subtropical coastal floodplains and meandering river estuaries along the dying Western Interior Seaway.',
    description: 'The final ecological act of non-avian dinosaurs before the Chicxulub asteroid impact.',
    color: '#EF4444'
  },
  {
    id: 'morrison',
    name: 'Morrison Formation',
    aliases: ['morrison', 'morrison formation', 'brushy basin'],
    mya: '155–148 Ma (Late Jurassic)',
    location: 'Western United States (Colorado, Utah, Wyoming, Montana)',
    paleoenvironment: 'Semi-arid savannah and seasonal floodplains bordered by the shallow Sundance Sea to the north.',
    description: 'The golden age of gigantism, characterized by massive sauropod herds and apex carnosaur guilds.',
    color: '#10B981'
  },
  {
    id: 'kem-kem',
    name: 'Kem Kem Group / Beds',
    aliases: ['kem kem', 'kem kem beds', 'kem kem group', 'bahariya'],
    mya: '100–93 Ma (Cenomanian Stage)',
    location: 'Southeastern Morocco & North Africa',
    paleoenvironment: 'Enormous deltaic mangrove river systems teeming with giant coelacanths, lungfish, and sawfish.',
    description: 'An ecological anomaly known as the "river of giants", boasting an unprecedented excess of apex theropods.',
    color: '#06B6D4'
  },
  {
    id: 'yixian',
    name: 'Yixian Formation (Jehol Biota)',
    aliases: ['yixian', 'yixian formation', 'jehol', 'jehol biota'],
    mya: '125–121 Ma (Early Cretaceous)',
    location: 'Liaoning Province, Northeastern China',
    paleoenvironment: 'Temperate volcanic lacustrine basin with frequent pyroclastic Pompeii-like fossil preservation.',
    description: 'World-famous lagerstätte that proved the direct dinosaur-bird evolutionary link through filamentous feathers.',
    color: '#EC4899'
  },
  {
    id: 'dinosaur-park',
    name: 'Dinosaur Park Formation',
    aliases: ['dinosaur park', 'dinosaur park formation', 'belly river'],
    mya: '76.5–74.8 Ma (Late Cretaceous)',
    location: 'Alberta, Canada',
    paleoenvironment: 'Warm, low-energy coastal floodplains bordered by coastal marshes and dense angiosperm forests.',
    description: 'Highest dinosaur species diversity in the global fossil record with intense niche partitioning.',
    color: '#F59E0B'
  },
  {
    id: 'solnhofen',
    name: 'Solnhofen Archipelago',
    aliases: ['solnhofen', 'solnhofen limestone', 'solnhofen formation'],
    mya: '152–150 Ma (Late Jurassic)',
    location: 'Bavaria, Germany',
    paleoenvironment: 'Hypersaline stagnant tropical lagoon archipelago with anoxic bottom muds.',
    description: 'Renowned for preserving the iconic transition fossil Archaeopteryx along with delicate pterosaur wings.',
    color: '#38BDF8'
  },
  {
    id: 'ischigualasto',
    name: 'Ischigualasto Formation',
    aliases: ['ischigualasto', 'ischigualasto formation', 'valley of the moon'],
    mya: '231.4–225.9 Ma (Carnian Stage, Late Triassic)',
    location: 'San Juan Province, Argentina',
    paleoenvironment: 'Volcanically active river valley with seasonal monsoonal precipitation and conifer forests.',
    description: 'The crucible of dinosaur origins where ancestral theropods lived in the shadow of giant pseudosuchians.',
    color: '#D97706'
  }
];

export default function FormationEcosystemDiorama({
  onOpenFoodWeb
}: {
  onOpenFoodWeb?: (formationName: string) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [roster, setRoster] = useState<SpeciesRosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormationId, setSelectedFormationId] = useState<string>('hell-creek');

  useEffect(() => {
    fetchSpeciesRoster()
      .then((data) => {
        setRoster(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load roster', err);
        setLoading(false);
      });
  }, []);

  const activePreset = useMemo(() => {
    return FORMATION_PRESETS.find((p) => p.id === selectedFormationId) || FORMATION_PRESETS[0];
  }, [selectedFormationId]);

  // Match species belonging to this formation
  const formationSpecies = useMemo(() => {
    return roster.filter((s) => {
      const form = (s.fossilFormation || '').toLowerCase();
      const name = s.name.toLowerCase();
      // Match aliases
      return activePreset.aliases.some((alias) => form.includes(alias) || name.includes(alias));
    });
  }, [roster, activePreset]);

  // Categorize species into 5 Trophic Tiers
  const trophicTiers = useMemo(() => {
    const apex: SpeciesRosterItem[] = [];
    const mesopredators: SpeciesRosterItem[] = [];
    const megaherbivores: SpeciesRosterItem[] = [];
    const browsers: SpeciesRosterItem[] = [];
    const smallFauna: SpeciesRosterItem[] = [];

    formationSpecies.forEach((s) => {
      const length = s.lengthM || 0;
      const clade = s.clade.toLowerCase();
      const diet = (s.diet || '').toLowerCase();

      if (diet === 'carnivore') {
        if (length >= 8.0) {
          apex.push(s);
        } else {
          mesopredators.push(s);
        }
      } else if (diet === 'piscivore' || diet === 'filter_feeder' || clade.includes('pterosaur') || s.habitat === 'marine') {
        smallFauna.push(s);
      } else if (diet === 'herbivore') {
        if (length >= 9.0 || clade.includes('sauropod')) {
          megaherbivores.push(s);
        } else {
          browsers.push(s);
        }
      } else {
        // omnivore / default
        browsers.push(s);
      }
    });

    return [
      {
        tier: 1,
        title: 'Apex Hypercarnivores',
        role: 'Top-tier apex predators exerting top-down population pressure on megaherbivore populations.',
        icon: Zap,
        color: '#EF4444',
        items: apex
      },
      {
        tier: 2,
        title: 'Mesopredators & Pursuit Hunters',
        role: 'Agile theropods and pack hunters targeting juveniles, small vertebrates, and forest browsers.',
        icon: Flame,
        color: '#F97316',
        items: mesopredators
      },
      {
        tier: 3,
        title: 'Megaherbivores & High Browsers',
        role: 'Immense primary consumers shaping ancient vegetation and canopy structures.',
        icon: Leaf,
        color: '#10B981',
        items: megaherbivores
      },
      {
        tier: 4,
        title: 'Armored & Ground Browsers',
        role: 'Low-to-medium foliage feeders with formidable defensive plates, frills, horns, or clubs.',
        icon: Shield,
        color: '#EAB308',
        items: browsers
      },
      {
        tier: 5,
        title: 'Aerial, Aquatic & Specialized Fauna',
        role: 'Pterosaurs, piscivores, and freshwater foragers occupying riparian and shoreline niches.',
        icon: Fish,
        color: '#06B6D4',
        items: smallFauna
      }
    ];
  }, [formationSpecies]);

  return (
    <div className="space-y-8 font-sans">
      {/* ── Section Title ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 font-mono">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-widest mb-1.5">
            <Layers className="h-4 w-4" />
            <span>Paleo-Ecosystem Dioramas &bull; Stratigraphic Co-Occurrence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2 font-sans">
            <ShinyText text="Stratigraphic Formation Dioramas" speed={3.5} />
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-mono">
            Explore fossil-proven co-occurrence networks and trophic pyramids from Earth's most famous paleontological beds.
          </p>
        </div>

        {/* AI Food Web Trigger */}
        {onOpenFoodWeb && (
          <button
            onClick={() => onOpenFoodWeb(activePreset.name)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10 shrink-0"
          >
            <Network className="h-4 w-4" />
            <span>Simulate AI Food Web</span>
          </button>
        )}
      </div>

      {/* ── Formation Selector Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
        {FORMATION_PRESETS.map((preset) => {
          const isSelected = preset.id === selectedFormationId;
          return (
            <button
              key={preset.id}
              onClick={() => setSelectedFormationId(preset.id)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.25)] scale-[1.02]'
                  : 'bg-slate-900/80 hover:bg-slate-850 border-white/[0.08] hover:border-amber-500/40 text-slate-300 hover:text-white'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isSelected ? '#090D1A' : preset.color }} />
              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3 font-mono text-slate-400">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          <p className="text-xs uppercase tracking-widest">Excavating Stratigraphic Horizons...</p>
        </div>
      ) : (
        <>
          {/* ── Formation Atmosphere Header Card ── */}
          <motion.div
            key={activePreset.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0E172B] to-slate-900 border border-amber-500/25 shadow-xl space-y-3 relative overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-bold text-slate-200 text-sm sm:text-base font-sans">{activePreset.name}</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-slate-400">{activePreset.location}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                {activePreset.mya}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">
                Reconstructed Biome &amp; Taphonomic Setting:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                {activePreset.paleoenvironment}
              </p>
            </div>

            <p className="text-xs text-slate-400 font-mono italic">
              {activePreset.description} &bull; <strong>{formationSpecies.length} cataloged museum specimens verified</strong>
            </p>
          </motion.div>

          {/* ── Ecological Trophic Tier Pyramid ── */}
          <div className="space-y-6">
            {trophicTiers.map((tier) => {
              const IconComp = tier.icon;
              if (tier.items.length === 0) return null;

              return (
                <div key={tier.tier} className="space-y-3">
                  {/* Tier Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1 border-b border-white/[0.06] pb-2 font-mono">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-950 font-bold text-xs"
                        style={{ backgroundColor: tier.color }}
                      >
                        T{tier.tier}
                      </span>
                      <IconComp className="h-4 w-4" style={{ color: tier.color }} />
                      <h4 className="text-sm font-bold text-slate-200 font-sans">{tier.title}</h4>
                      <span className="px-2 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-bold">
                        {tier.items.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">{tier.role}</span>
                  </div>

                  {/* Tier Species Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {tier.items.map((specimen) => (
                      <Link
                        key={specimen.id}
                        to={`/species/${specimen.id}`}
                        className="group relative p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-850/95 border border-white/[0.08] hover:border-amber-500/50 hover:shadow-[0_4px_16px_rgba(245,158,11,0.12)] transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                              {specimen.name}
                            </h5>
                            <span className="text-[10px] font-mono text-slate-400">
                              #{specimen.id}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 italic truncate">
                            {specimen.scientificName}
                          </p>
                        </div>

                        {/* Silhouette or Reconstruction */}
                        <div className="my-2.5 h-20 rounded-lg bg-slate-950/70 border border-white/[0.04] flex items-center justify-center p-2">
                          {specimen.silhouetteUrl ? (
                            <img
                              src={specimen.silhouetteUrl}
                              alt={specimen.name}
                              className="w-full h-full object-contain filter invert contrast-125 opacity-80 group-hover:opacity-100 transition-all duration-200"
                              loading="lazy"
                            />
                          ) : specimen.reconstructionImageUrl ? (
                            <img
                              src={specimen.reconstructionImageUrl}
                              alt={specimen.name}
                              className="w-full h-full object-cover rounded opacity-85 group-hover:opacity-100 transition-all duration-200"
                              loading="lazy"
                            />
                          ) : (
                            <div className="text-[10px] font-mono text-slate-500">
                              Profile Active
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/[0.04]">
                          <span className="text-slate-300">{formatEnumLabel(specimen.clade)}</span>
                          {specimen.lengthM && (
                            <span className="text-amber-400 font-bold">{specimen.lengthM}m</span>
                          )}
                          <span className="text-slate-500 group-hover:text-amber-400 flex items-center gap-0.5">
                            <span>Dossier</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
