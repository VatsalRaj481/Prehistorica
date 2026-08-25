import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { fetchCreatureOfTheDay, Species } from '../services/api.js';
import { Calendar, ArrowRight, Dna, Map, ShieldAlert, Sparkles, Scale, FileText } from 'lucide-react';

export default function Home() {
  const [creature, setCreature] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    document.title = 'Prehistorica | Deep Time Prehistoric Fauna Encyclopedia';
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
    <div className="space-y-16">
      {/* Hero Welcome Section */}
      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="show"
        className="text-center max-w-3xl mx-auto py-6 space-y-6"
      >
        <motion.div
          whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" /> Earth's Deep Time Archives
        </motion.div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-blue-200 to-indigo-300 bg-clip-text text-transparent leading-tight">
          Prehistoric Fauna Encyclopedia
        </h1>

        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Embark on an immersive journey across geological eras. Unearth verified facts, scientific measurements, and rich reconstructions of creatures that ruled the earth millions of years ago.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <motion.div whileTap={{ scale: 0.94 }}>
            <Link
              to="/browse"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-2 text-sm"
            >
              Explore Catalog <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div whileTap={{ scale: 0.94 }}>
            <Link
              to="/map"
              className="px-6 py-3 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-slate-200 font-semibold rounded-xl transition-all border border-slate-750 hover:border-slate-600 flex items-center gap-2 text-sm"
            >
              <Map className="h-4 w-4 text-blue-400" /> View Time Map
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Creature of the Day Hero Banner */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Calendar className="h-5 w-5 text-blue-400" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">
            Random Creature of the Day
          </h2>
          <span className="text-xs text-slate-400 ml-auto bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800">
            Determined Daily (UTC)
          </span>
        </div>

        {loading ? (
          <div className="animate-pulse bg-slate-900/80 border border-slate-800 rounded-2xl h-96 flex items-center justify-center">
            <div className="text-slate-500 text-sm">Excavating daily archives...</div>
          </div>
        ) : error || !creature ? (
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-8 text-center text-red-400 flex flex-col items-center gap-2">
            <ShieldAlert className="h-10 w-10 text-red-500" />
            <p className="font-semibold">{error || 'Creature not found'}</p>
          </div>
        ) : (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl hover:border-blue-500/30 transition-all duration-500 group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
              <div className="lg:col-span-7 relative h-64 sm:h-96 rounded-xl overflow-hidden bg-slate-950 border border-slate-850 group-hover:border-slate-800 transition-all flex items-center justify-center p-4 sm:p-6 shadow-inner">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                {creature.reconstructionImageUrl ? (
                  <img
                    src={creature.reconstructionImageUrl}
                    alt={creature.name}
                    className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105 drop-shadow-lg z-10"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-sm bg-slate-950">
                    <Dna className="h-12 w-12 text-slate-600 mb-2" />
                    Reconstruction illustration not available
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-semibold text-blue-400 shadow-md z-20">
                  {creature.timePeriod} ({creature.myaStart}–{creature.myaEnd} MYA)
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 group-hover:text-blue-400 transition-colors">
                      {creature.name}
                    </h3>
                    <p className="text-sm italic text-slate-400">
                      {creature.scientificName} &bull; "{creature.nameMeaning}"
                    </p>
                  </div>

                  {creature.interestingFacts && creature.interestingFacts.length > 0 && (
                    <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 space-y-1 backdrop-blur-sm">
                      <div className="font-bold flex items-center gap-1 uppercase tracking-wider text-[10px]">
                        <FileText className="h-3 w-3" /> Distinctive Key Fact
                      </div>
                      <p className="leading-relaxed">{creature.interestingFacts[0]}</p>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {creature.dietDetails}
                  </p>

                  <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-850 shadow-inner">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Length</div>
                      <div className="text-sm font-extrabold text-blue-400 mt-0.5">
                        {creature.lengthM ? `${creature.lengthM} m` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Height</div>
                      <div className="text-sm font-extrabold text-blue-400 mt-0.5">
                        {creature.heightM ? `${creature.heightM} m` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Weight</div>
                      <div className="text-sm font-extrabold text-blue-400 mt-0.5">
                        {creature.weightKg ? `${creature.weightKg.toLocaleString()} kg` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Scale className="h-4 w-4 text-indigo-400" />
                    <span>Clade: <strong className="text-slate-200">{creature.clade}</strong></span>
                  </div>
                  <motion.div whileTap={{ scale: 0.93 }}>
                    <Link
                      to={`/species/${creature.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      Inspect Specimen <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
