import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { fetchCreatureOfTheDay, Species } from '../services/api.js';
import ThreeDFossilStarfield from '../components/ThreeDFossilStarfield.js';
import { Calendar, ArrowRight, Dna, Map, ShieldAlert, Sparkles, FileText, Layers } from 'lucide-react';

export default function Home() {
  const [creature, setCreature] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    document.title = 'Prehistorica | Museum Exhibit Pavilion & Deep Time Archives';
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

  return (
    <div className="space-y-16 relative">
      {/* 3D Particle Fossil Canvas Background */}
      <ThreeDFossilStarfield />

      {/* Modern Museum Pavilion Hero Section */}
      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center max-w-4xl mx-auto py-10 space-y-6 border-b border-slate-800/80 pb-12"
      >
        <motion.div
          whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase shadow-md"
        >
          <Sparkles className="h-3.5 w-3.5" /> Prehistorica Exhibit Pavilion
        </motion.div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-slate-100 uppercase leading-none">
          Deep Time Prehistoric Archive
        </h1>

        <p className="text-base sm:text-lg font-mono text-slate-400 leading-relaxed max-w-2xl mx-auto">
          An architectural digital museum exhibit documenting 450+ verified prehistoric fauna across Earth's geological eras.
        </p>

        <div className="flex justify-center gap-4 pt-4 font-mono text-xs">
          <motion.div whileTap={{ scale: 0.94 }}>
            <Link
              to="/browse"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold uppercase tracking-wider rounded-none border border-amber-400 transition-all shadow-xl flex items-center gap-2"
            >
              Explore Museum Catalog <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.94 }}>
            <Link
              to="/map"
              className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-slate-200 font-bold uppercase tracking-wider rounded-none border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2"
            >
              <Map className="h-4 w-4 text-amber-500" /> Interactive Time Map
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Exhibit: Creature of the Day */}
      <section className="relative z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-mono font-extrabold uppercase tracking-tight text-slate-100">
              Featured Specimen of the Day
            </h2>
          </div>
          <span className="text-xs font-mono text-amber-400/90 font-bold uppercase tracking-widest bg-slate-950 px-3 py-1 border border-slate-800">
            Daily Rotation Index
          </span>
        </div>

        {loading ? (
          <div className="animate-pulse bg-slate-950 border border-slate-800 h-96 flex items-center justify-center font-mono text-slate-500 text-sm">
            Excavating daily archive specimen...
          </div>
        ) : error || !creature ? (
          <div className="bg-slate-950 border border-red-500/20 p-8 text-center text-red-400 flex flex-col items-center gap-2 font-mono">
            <ShieldAlert className="h-10 w-10 text-red-500" />
            <p className="font-bold">{error || 'Creature record not found'}</p>
          </div>
        ) : (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="relative bg-slate-950 border border-slate-800 rounded-none overflow-hidden shadow-2xl hover:border-amber-500/40 transition-all duration-500 group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
              <div className="lg:col-span-7 relative h-72 sm:h-96 rounded-none bg-slate-900 border border-slate-800 flex items-center justify-center p-6 shadow-inner">
                {creature.reconstructionImageUrl ? (
                  <img
                    src={creature.reconstructionImageUrl}
                    alt={creature.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-2xl z-10"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono bg-slate-950">
                    <Dna className="h-12 w-12 text-slate-700 mb-2" />
                    Reconstruction illustration uncataloged
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-mono font-bold text-amber-400 tracking-widest uppercase shadow-md z-20">
                  {creature.timePeriod} ({creature.myaStart}–{creature.myaEnd} MYA)
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1 border-l-2 border-amber-500 pl-4">
                    <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-100 group-hover:text-amber-400 transition-colors">
                      {creature.name}
                    </h3>
                    <p className="text-sm italic font-serif text-amber-200/80">
                      {creature.scientificName} &bull; "{creature.nameMeaning}"
                    </p>
                  </div>

                  {creature.interestingFacts && creature.interestingFacts.length > 0 && (
                    <div className="p-3.5 bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-400 uppercase tracking-widest text-[10px]">
                        <FileText className="h-3.5 w-3.5" /> Key Diagnostic Feature
                      </div>
                      <p className="leading-relaxed">{creature.interestingFacts[0]}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-px bg-slate-800 border border-slate-800 p-px font-mono text-center">
                    <div className="bg-slate-950 p-2.5">
                      <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Length</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5">
                        {creature.lengthM ? `${creature.lengthM}m` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-2.5">
                      <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Height</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5">
                        {creature.heightM ? `${creature.heightM}m` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-2.5">
                      <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Mass</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5">
                        {creature.weightKg ? `${(creature.weightKg / 1000).toFixed(1)}t` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Layers className="h-4 w-4 text-amber-500" />
                    <span>Clade: <strong className="text-slate-200">{creature.clade}</strong></span>
                  </div>
                  <motion.div whileTap={{ scale: 0.93 }}>
                    <Link
                      to={`/species/${creature.id}`}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 transition-all shadow-md"
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

      {/* Museum Quick Access Portals */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
        <Link
          to="/browse"
          className="p-6 bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-amber-500 font-bold text-xs uppercase tracking-widest">Catalog Pavilion</span>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <h3 className="text-2xl font-black uppercase text-slate-100 group-hover:text-amber-400 transition-colors">
            Fauna Search Index
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Filter 450+ cataloged species by period, diet, habitat, and taxonomic clade with interactive 3D scale inspection.
          </p>
        </Link>

        <Link
          to="/map"
          className="p-6 bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-amber-500 font-bold text-xs uppercase tracking-widest">Global Excavation Map</span>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <h3 className="text-2xl font-black uppercase text-slate-100 group-hover:text-amber-400 transition-colors">
            Geological Formations
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Explore 30 major fossil sites around the globe dynamically filtered by geological time period (Triassic to Pleistocene).
          </p>
        </Link>
      </section>
    </div>
  );
}
