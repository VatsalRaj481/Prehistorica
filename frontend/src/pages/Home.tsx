import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { fetchCreatureOfTheDay, fetchSpecies, Species } from '../services/api.js';
import ThreeDFossilStarfield from '../components/ThreeDFossilStarfield.js';
import { Calendar, ArrowRight, Dna, Map, ShieldAlert, Sparkles, FileText, Layers } from 'lucide-react';

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
        className="relative z-10 text-center max-w-4xl mx-auto py-10 space-y-6 border-b border-slate-800/80 pb-12"
      >
        <motion.div
          whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase shadow-md"
        >
          <Sparkles className="h-3.5 w-3.5" /> Prehistorica Exhibit Pavilion
        </motion.div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-slate-100 uppercase leading-none">
          Deep Time Prehistoric Archive
        </h1>

        <p className="text-base sm:text-lg font-mono text-slate-400 leading-relaxed max-w-2xl mx-auto">
          An architectural digital museum exhibit documenting <strong className="text-amber-400 font-bold">{formattedTotal}</strong> verified prehistoric fauna across Earth's geological eras.
        </p>

        <div className="flex justify-center gap-4 pt-4 font-mono text-xs">
          <motion.div whileTap={{ scale: 0.94 }}>
            <Link
              to="/browse"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold uppercase tracking-wider rounded-none border border-amber-400 transition-all shadow-xl flex items-center gap-2 cursor-pointer"
            >
              Explore Museum Catalog <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.94 }}>
            <Link
              to="/map"
              className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-slate-200 font-bold uppercase tracking-wider rounded-none border border-slate-800 hover:border-amber-500/40 transition-all flex items-center gap-2 cursor-pointer"
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
          <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest bg-slate-950 px-3 py-1 border border-slate-800">
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
              {/* Artwork / Specimen Image Viewport */}
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

              {/* Specimen Dossier Details */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
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
                        <FileText className="h-3.5 w-3.5 text-amber-500" /> Diagnostic Specimen Feature
                      </div>
                      <p className="leading-relaxed">{creature.interestingFacts[0]}</p>
                    </div>
                  )}

                  {/* Redesigned Asymmetric Specimen Stat Boxes (Ban-list compliant, raw typographic readouts) */}
                  <div className="grid grid-cols-3 divide-x divide-slate-800 border-y border-slate-800 py-3 font-mono">
                    <div className="pr-3 space-y-0.5">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-amber-500 shrink-0" /> Length
                      </div>
                      <div className="text-xl font-black text-slate-100">
                        {creature.lengthM ? `${creature.lengthM}m` : 'N/A'}
                      </div>
                    </div>

                    <div className="px-3 space-y-0.5">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-amber-500 shrink-0" /> Height
                      </div>
                      <div className="text-xl font-black text-slate-100">
                        {creature.heightM ? `${creature.heightM}m` : 'N/A'}
                      </div>
                    </div>

                    <div className="pl-3 space-y-0.5">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-amber-500 shrink-0" /> Mass
                      </div>
                      <div className="text-xl font-black text-amber-400">
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
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
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

      {/* Redesigned Editorial Museum Access Portals (Ban-list compliant) */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 font-mono">
        {/* Portal 1: Catalog Index */}
        <Link
          to="/browse"
          className="group relative bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-8 transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                EXHIBIT 01 / CATALOG INDEX
              </span>
              <span className="text-xs text-slate-400 font-bold">
                {formattedTotal} SPECIMENS
              </span>
            </div>

            <h3 className="text-3xl font-black uppercase text-slate-100 group-hover:text-amber-400 transition-colors tracking-tight">
              Fauna Search Index
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Filter cataloged species by period, diet, habitat, and taxonomic clade with interactive 3D scale inspection and physical human reference models.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-amber-400 transition-colors">
            <span>Access Catalog Pavilion</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Portal 2: Time Map */}
        <Link
          to="/map"
          className="group relative bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-8 transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                EXHIBIT 02 / PALEOCONTINENTS
              </span>
              <span className="text-xs text-slate-400 font-bold">
                30 FORMATIONS
              </span>
            </div>

            <h3 className="text-3xl font-black uppercase text-slate-100 group-hover:text-amber-400 transition-colors tracking-tight">
              Geological Formations
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Explore major fossil sites around the globe dynamically filtered by geological time period from Cambrian marine explosion to Pleistocene megafauna.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-amber-400 transition-colors">
            <span>Open Interactive Map</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>
    </div>
  );
}
