import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { fetchCreatureOfTheDay, fetchSpecies, Species } from '../services/api.js';
import ThreeDFossilStarfield from '../components/ThreeDFossilStarfield.js';
import { Calendar, ArrowRight, Dna, Compass, ShieldAlert, Sparkles, FileText, Layers, Loader2 } from 'lucide-react';
import { formatMass } from '../utils/formatMass.js';

export default function Home() {
  const [creature, setCreature] = useState<Species | null>(null);
  const [totalSpecies, setTotalSpecies] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    document.title = 'Prehistorica | Museum Exhibit Pavilion & Deep Time Archives';

    // Fetch Creature of the Day
    fetchCreatureOfTheDay()
      .then((data) => {
        setCreature(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load the Creature of the Day.');
        setLoading(false);
      });

    // Fetch Live Total Species Count from DB
    fetchSpecies({ limit: 1 })
      .then((res) => {
        if ('pagination' in res) {
          setTotalSpecies(res.pagination.total);
        }
      })
      .catch((err) => console.error('Failed to fetch live species count:', err));
  }, []);

  const heroVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : -20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 350, damping: 26 }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20, scale: shouldReduceMotion ? 1 : 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 350, damping: 28 }
    }
  };

  const formattedTotal = totalSpecies ? `${totalSpecies}+` : '460+';

  return (
    <div className="space-y-16 relative">
      {/* 3D Particle Fossil Canvas Background */}
      <ThreeDFossilStarfield />

      {/* Modern Museum Pavilion Hero Section */}
      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center max-w-4xl mx-auto py-12 space-y-6 border-b border-white/10 pb-16"
      >
        <motion.div
          whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase shadow-md backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5" /> Prehistorica Exhibit Pavilion
        </motion.div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-100 uppercase leading-[1.05] font-sans">
          Deep Time Prehistoric Archive
        </h1>

        <p className="text-sm sm:text-base font-sans text-slate-300 leading-relaxed max-w-xl mx-auto">
          An architectural digital museum documenting <strong className="text-amber-400 font-bold">{formattedTotal}</strong> verified prehistoric fauna species across Earth's geological eras.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4 font-mono text-xs">
          <motion.div whileTap={{ scale: 0.96 }}>
            <Link
              to="/browse"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider rounded-lg border border-amber-300 transition-all shadow-xl flex items-center gap-2 cursor-pointer"
            >
              Explore Catalog <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.96 }}>
            <Link
              to="/map"
              className="px-6 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold uppercase tracking-wider rounded-lg border border-white/10 hover:border-amber-500/40 transition-all flex items-center gap-2 cursor-pointer glass-panel"
            >
              <Compass className="h-4 w-4 text-amber-400" /> Interactive Time-Map
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Exhibit: Creature of the Day */}
      <section className="relative z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Calendar className="h-5 w-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-wide text-slate-100 font-sans">
              Featured Specimen of the Day
            </h2>
          </div>
          <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest bg-slate-900/80 px-3 py-1.5 rounded-full border border-amber-500/30 shadow-inner">
            Daily Rotation
          </span>
        </div>

        {loading ? (
          <div className="relative glass-panel rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Image Viewport Skeleton */}
              <div className="lg:col-span-7 relative h-72 sm:h-96 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="h-10 w-10 text-amber-400 animate-spin mb-3" />
                <p className="font-mono text-slate-300 font-bold text-sm">
                  Waking up museum archive server...
                </p>
                <p className="font-mono text-slate-500 text-xs mt-1">
                  Excavating daily specimen (Render cold start may take 30–50s)
                </p>
              </div>

              {/* Specimen Dossier Details Skeleton */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2 border-l-2 border-slate-700 pl-4">
                    <div className="h-8 bg-slate-800 w-3/4 rounded" />
                    <div className="h-4 bg-slate-800/60 w-1/2 rounded" />
                  </div>
                  <div className="p-4 bg-slate-900/60 border border-white/10 rounded-xl space-y-2">
                    <div className="h-3 bg-slate-800 w-1/3 rounded" />
                    <div className="h-3 bg-slate-800/60 w-full rounded" />
                    <div className="h-3 bg-slate-800/60 w-4/5 rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 border-y border-white/10 py-4">
                    <div className="space-y-2">
                      <div className="h-2.5 bg-slate-800/60 w-12 rounded" />
                      <div className="h-6 bg-slate-800 w-16 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 bg-slate-800/60 w-12 rounded" />
                      <div className="h-6 bg-slate-800 w-16 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 bg-slate-800/60 w-12 rounded" />
                      <div className="h-6 bg-slate-800 w-16 rounded" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="h-4 bg-slate-800 w-28 rounded" />
                  <div className="h-9 bg-slate-800 w-36 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ) : error || !creature ? (
          <div className="glass-panel border border-red-500/30 rounded-2xl p-8 text-center text-red-400 flex flex-col items-center gap-3 font-mono">
            <ShieldAlert className="h-10 w-10 text-red-400" />
            <p className="font-bold text-sm">{error || 'Creature record not found'}</p>
          </div>
        ) : (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="relative glass-panel rounded-2xl overflow-hidden shadow-2xl hover:border-amber-500/40 transition-all duration-500 group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
              {/* Artwork / Specimen Image Viewport */}
              <div className="lg:col-span-7 relative h-72 sm:h-96 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-center p-6 shadow-inner overflow-hidden">
                <div className="absolute inset-0 bg-fossil-grid opacity-30 pointer-events-none" />
                {creature.reconstructionImageUrl ? (
                  <img
                    src={creature.reconstructionImageUrl}
                    alt={creature.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-2xl z-10"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono bg-slate-950/60 rounded-xl">
                    <Dna className="h-12 w-12 text-slate-700 mb-2" />
                    Reconstruction illustration uncataloged
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-amber-400 tracking-widest uppercase shadow-lg z-20">
                  {creature.timePeriod} ({creature.myaStart}–{creature.myaEnd} MYA)
                </div>
              </div>

              {/* Specimen Dossier Details */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <div className="space-y-1.5 border-l-2 border-amber-500 pl-4">
                    <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-100 group-hover:text-amber-400 transition-colors font-sans">
                      {creature.name}
                    </h3>
                    <p className="text-xs italic font-serif text-amber-200/80">
                      {creature.scientificName} &bull; "{creature.nameMeaning}"
                    </p>
                  </div>

                  {creature.interestingFacts && creature.interestingFacts.length > 0 && (
                    <div className="p-4 bg-slate-950/60 border border-white/10 rounded-xl text-xs font-mono text-slate-300 space-y-1.5 shadow-inner">
                      <div className="font-bold flex items-center gap-1.5 text-amber-400 uppercase tracking-widest text-[10px]">
                        <FileText className="h-3.5 w-3.5 text-amber-400" /> Diagnostic Specimen Feature
                      </div>
                      <p className="leading-relaxed font-sans text-xs text-slate-300">{creature.interestingFacts[0]}</p>
                    </div>
                  )}

                  {/* Redesigned Asymmetric Specimen Stat Boxes */}
                  <div className="grid grid-cols-3 gap-3 border-y border-white/10 py-4 font-mono">
                    <div className="space-y-1 p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-amber-400 rounded-full shrink-0" /> Length
                      </div>
                      <div className="text-lg font-black text-slate-100">
                        {creature.lengthM ? `${creature.lengthM}m` : 'N/A'}
                      </div>
                    </div>

                    <div className="space-y-1 p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-amber-400 rounded-full shrink-0" /> Height
                      </div>
                      <div className="text-lg font-black text-slate-100">
                        {creature.heightM ? `${creature.heightM}m` : 'N/A'}
                      </div>
                    </div>

                    <div className="space-y-1 p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-amber-400 rounded-full shrink-0" /> Mass
                      </div>
                      <div className="text-lg font-black text-amber-400">
                        {formatMass(creature.weightKg)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Layers className="h-4 w-4 text-amber-400" />
                    <span>Clade: <strong className="text-amber-300 font-bold">{creature.clade}</strong></span>
                  </div>
                  <motion.div whileTap={{ scale: 0.94 }}>
                    <Link
                      to={`/species/${creature.id}`}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs rounded-lg flex items-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                      Inspect Specimen 3D <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* Redesigned Editorial Museum Access Portals */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 font-mono">
        {/* Portal 1: Catalog Index */}
        <Link
          to="/browse"
          className="group relative glass-panel rounded-2xl hover:border-amber-500/40 p-8 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                EXHIBIT 01 / CATALOG INDEX
              </span>
              <span className="text-xs text-slate-400 font-bold">
                {formattedTotal} SPECIMENS
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black uppercase text-slate-100 group-hover:text-amber-400 transition-colors tracking-tight font-sans">
              Fauna Search Index
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Filter cataloged species by period, diet, habitat, and taxonomic clade with interactive scale inspection and physical human reference models.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-amber-400 transition-colors">
            <span>Access Catalog Pavilion</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Portal 2: Time Map */}
        <Link
          to="/map"
          className="group relative glass-panel rounded-2xl hover:border-amber-500/40 p-8 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                EXHIBIT 02 / PALEOCONTINENTS
              </span>
              <span className="text-xs text-slate-400 font-bold">
                GEOLOGICAL FORMATIONS
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black uppercase text-slate-100 group-hover:text-amber-400 transition-colors tracking-tight font-sans">
              Geological Time-Map
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Explore major fossil sites around the globe dynamically filtered by geological time period from Cambrian marine explosion to Pleistocene megafauna.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-amber-400 transition-colors">
            <span>Open Interactive Map</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>
    </div>
  );
}
