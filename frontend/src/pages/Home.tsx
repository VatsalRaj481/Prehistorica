import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform, Variants } from 'framer-motion';
import { fetchCreatureOfTheDay, fetchSpecies, fetchSpeciesById, Species } from '../services/api.js';
import SpotlightCard from '../components/SpotlightCard.js';
import { Calendar, ArrowRight, Dna, Compass, ShieldAlert, FileText, Layers, Loader2, Globe, Database, Sparkles } from 'lucide-react';
import { formatMass } from '../utils/formatMass.js';
import { formatFeet } from '../utils/formatDimensions.js';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';

export default function Home() {
  const [creature, setCreature] = useState<Species | null>(null);
  const [totalSpecies, setTotalSpecies] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Gentle scroll depth parallax on landing hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, shouldReduceMotion ? 0 : 25]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0.88]);

  useEffect(() => {
    document.title = 'Prehistorica | Museum Exhibit Pavilion & Deep Time Archives';
    setLoading(true);
    setError(null);

    // Fetch Creature of the Day
    fetchCreatureOfTheDay()
      .then((data) => {
        setCreature(data);
        setLoading(false);
        // Augment with full record details (coexisting species, full facts)
        if (data && data.id) {
          fetchSpeciesById(data.id)
            .then((fullData) => {
              if (fullData) {
                setCreature(fullData);
              }
            })
            .catch(() => {});
        }
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
  }, [retryCount]);

  const heroVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : -15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 350, damping: 26 }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15, scale: shouldReduceMotion ? 1 : 0.99 },
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
      {/* Curatorial Museum Hero Section with Subtle Parallax Falloff */}
      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="show"
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 max-w-5xl mx-auto pt-6 pb-12 space-y-8 border-b border-white/[0.08]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
              <img src="/logo.png" alt="Prehistorica Emblem" className="h-4 w-4 object-contain shrink-0 drop-shadow" />
              <span>Deep Time Archive &bull; 541 &ndash; 0.01 MYA</span>
            </div>

            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 uppercase leading-[1.05] font-sans"
            >
              Museum Archive of Prehistoric Fauna
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm sm:text-base font-sans text-slate-300 leading-relaxed max-w-2xl"
            >
              An architectural digital catalog documenting <strong className="text-amber-400 font-bold">{formattedTotal}</strong> scientifically verified prehistoric species across Earth's major geological epochs.
            </motion.p>

            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/browse"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider rounded-lg border border-amber-300 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  Explore Catalog <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/map"
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-850 text-slate-200 font-bold uppercase tracking-wider rounded-lg border border-white/[0.08] hover:border-amber-500/40 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Compass className="h-4 w-4 text-amber-400" /> Interactive Time-Map
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Curatorial Archive Stats Ticker */}
          <div className="lg:col-span-4 bg-slate-900/60 border border-white/[0.08] rounded-xl p-5 space-y-4 font-mono shadow-xl">
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-white/[0.06] pb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <img src="/logo.png" alt="Prehistorica Seal" className="h-3.5 w-3.5 object-contain shrink-0" />
                <span>Collection Dossier</span>
              </div>
              <Database className="h-3.5 w-3.5 text-amber-400" />
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Verified Specimens</span>
                <span className="text-slate-100 font-bold text-sm">{formattedTotal}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Geological Eras</span>
                <span className="text-slate-100 font-bold">10 Eras (541 MYA)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Global Formations</span>
                <span className="text-slate-100 font-bold">30+ Fossil Sites</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Scale Inspection</span>
                <span className="text-amber-400 font-bold">1:1 Metric 2D Stage</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Feature Exhibit: Specimen of the Day (Scroll Viewport Reveal) */}
      <motion.section
        initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative z-10 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 font-mono">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Calendar className="h-4 w-4 text-amber-400" />
            </div>
            <h2 className="text-base font-black uppercase tracking-wide text-slate-100 font-sans">
              Specimen of the Day
            </h2>
          </div>
          <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest bg-slate-900/80 px-2.5 py-1 rounded border border-amber-500/20">
            Daily Specimen Rotation
          </span>
        </div>

        {loading ? (
          <div className="relative glass-panel rounded-xl overflow-hidden shadow-2xl p-4 sm:p-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              {/* Image Viewport Skeleton */}
              <div className="lg:col-span-7 relative h-64 sm:h-96 rounded-lg bg-slate-900/80 border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="h-8 w-8 text-amber-400 animate-spin mb-3" />
                <p className="font-mono text-slate-300 font-bold text-sm">
                  Connecting to museum archive database...
                </p>
                <p className="font-mono text-slate-500 text-xs mt-1">
                  Loading daily specimen record
                </p>
              </div>

              {/* Specimen Dossier Details Skeleton */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2 border-l-2 border-slate-700 pl-4">
                    <div className="h-8 bg-slate-800 w-3/4 rounded" />
                    <div className="h-4 bg-slate-800/60 w-1/2 rounded" />
                  </div>
                  <div className="p-4 bg-slate-900/60 border border-white/10 rounded-lg space-y-2">
                    <div className="h-3 bg-slate-800 w-1/3 rounded" />
                    <div className="h-3 bg-slate-800/60 w-full rounded" />
                    <div className="h-3 bg-slate-800/60 w-4/5 rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 border-y border-white/10 py-4">
                    <div className="h-10 bg-slate-800/60 rounded" />
                    <div className="h-10 bg-slate-800/60 rounded" />
                    <div className="h-10 bg-slate-800/60 rounded" />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="h-4 bg-slate-800 w-28 rounded" />
                  <div className="h-9 bg-slate-800 w-36 rounded" />
                </div>
              </div>
            </div>
          </div>
        ) : error || !creature ? (
          <div className="museum-plinth border border-red-500/30 rounded-xl p-8 text-center text-red-400 flex flex-col items-center gap-3 font-mono">
            <ShieldAlert className="h-8 w-8 text-red-400" />
            <p className="font-bold text-sm">{error || 'Creature record not found'}</p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="mt-1 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              Retry Archival Lookup
            </button>
          </div>
        ) : (
          <SpotlightCard
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="relative museum-plinth rounded-xl overflow-hidden shadow-2xl hover:border-amber-500/40 transition-all duration-300 group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 p-4 sm:p-8">
              {/* Artwork / Specimen Image Viewport */}
              <div className="lg:col-span-7 relative h-64 sm:h-96 rounded-lg bg-slate-950/80 border border-white/[0.08] flex items-center justify-center p-4 sm:p-6 shadow-inner overflow-hidden">
                <div className="absolute inset-0 bg-fossil-grid opacity-30 pointer-events-none" />
                {creature.reconstructionImageUrl ? (
                  <img
                    src={creature.reconstructionImageUrl}
                    alt={creature.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-2xl z-10"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono bg-slate-950/60 rounded-lg">
                    <Dna className="h-10 w-10 text-slate-700 mb-2" />
                    Reconstruction illustration uncataloged
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md border border-amber-500/30 px-2.5 py-1 rounded text-[11px] sm:text-xs font-mono font-bold text-amber-400 tracking-wider uppercase shadow-lg z-20">
                  {creature.timePeriod} ({creature.myaStart}–{creature.myaEnd} MYA)
                </div>
              </div>

              {/* Specimen Dossier Details: Curatorial Archival Dossier (Option A) */}
              {(() => {
                const names = getSpeciesDisplayNames(creature);
                const secondFact = (creature.interestingFacts && creature.interestingFacts.length > 1)
                  ? creature.interestingFacts[1]
                  : (creature.dietDetails || creature.sizeNotes || 'Holotype specimen preserved with diagnostic morphological markers.');

                const formationDisplay = creature.fossilFormation || creature.geographicRange?.fossilFormation || '';
                const regionDisplay = creature.geographicRange?.region || creature.country || '';
                const coexCount = creature.relatedSpecies ? creature.relatedSpecies.length : null;

                return (
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3 sm:space-y-3.5">
                      {/* Top Metadata Ribbon: Clade + Formation/Region + Dietary Niche */}
                      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Layers className="h-3 w-3 text-amber-400" />
                          {creature.clade}
                        </span>

                        {(formationDisplay || regionDisplay) && (
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-900/90 border border-white/[0.08] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1 truncate max-w-[220px]">
                            <Globe className="h-3 w-3 text-amber-400 shrink-0" />
                            <span className="truncate">
                              {formationDisplay || regionDisplay}
                              {formationDisplay && regionDisplay ? ` • ${regionDisplay}` : ''}
                            </span>
                          </span>
                        )}

                        {creature.dietType && (
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-900/90 border border-white/[0.08] text-slate-300 font-bold uppercase tracking-wider capitalize">
                            {creature.dietType}
                          </span>
                        )}
                      </div>

                      {/* Specimen Heading: Name + Scientific Name + Etymology */}
                      <div className="space-y-0.5 border-l-2 border-amber-500 pl-3 sm:pl-3.5">
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-slate-100 group-hover:text-amber-400 transition-colors font-sans">
                          {names.heading}
                        </h3>
                        <p className="text-xs italic text-amber-400 font-mono">
                          {names.subheading}
                        </p>
                        {creature.nameMeaning && (
                          <p className="text-[11px] text-slate-400 font-mono pt-1 leading-snug">
                            <strong className="text-amber-400/90 uppercase tracking-wider text-[10px]">Etymology:</strong> "{creature.nameMeaning}"
                          </p>
                        )}
                      </div>

                      {/* Two Diagnostic Feature Cards (#1 and #2) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 bg-slate-950/60 border border-white/[0.08] rounded-lg space-y-1 shadow-inner">
                          <div className="font-bold flex items-center gap-1 text-amber-400 uppercase tracking-wider text-[9px]">
                            <FileText className="h-3 w-3 text-amber-400 shrink-0" />
                            <span>Feature #1 &bull; Diagnostic</span>
                          </div>
                          <p className="leading-relaxed font-sans text-xs text-slate-300 line-clamp-3">
                            {creature.interestingFacts?.[0] || creature.dietDetails}
                          </p>
                        </div>

                        <div className="p-2.5 bg-slate-950/60 border border-white/[0.08] rounded-lg space-y-1 shadow-inner">
                          <div className="font-bold flex items-center gap-1 text-amber-400 uppercase tracking-wider text-[9px]">
                            <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                            <span>Feature #2 &bull; Bio-Trait</span>
                          </div>
                          <p className="leading-relaxed font-sans text-xs text-slate-300 line-clamp-3">
                            {secondFact}
                          </p>
                        </div>
                      </div>

                      {/* 4-Stat Cluster: Length, Height, Mass, Ecological Habitat */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 border-y border-white/[0.08] py-2.5 font-mono">
                        <div className="space-y-0.5 p-1.5 sm:p-2 rounded bg-slate-900/60 border border-white/[0.04] text-center">
                          <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Length</div>
                          <div className="text-xs sm:text-sm font-black text-slate-100 truncate">{formatFeet(creature.lengthM)}</div>
                        </div>

                        <div className="space-y-0.5 p-1.5 sm:p-2 rounded bg-slate-900/60 border border-white/[0.04] text-center">
                          <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Height</div>
                          <div className="text-xs sm:text-sm font-black text-slate-100 truncate">{formatFeet(creature.heightM)}</div>
                        </div>

                        <div className="space-y-0.5 p-1.5 sm:p-2 rounded bg-slate-900/60 border border-white/[0.04] text-center">
                          <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Mass</div>
                          <div className="text-xs sm:text-sm font-black text-amber-400 truncate">{formatMass(creature.weightKg)}</div>
                        </div>

                        <div className="space-y-0.5 p-1.5 sm:p-2 rounded bg-slate-900/60 border border-white/[0.04] text-center">
                          <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Habitat</div>
                          <div className="text-xs sm:text-sm font-black text-emerald-400 truncate capitalize">
                            {creature.habitat ? creature.habitat.replace('_', '-') : 'Terrestrial'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Coexisted Teaser (Left) + Prominent Inspect Scale Stage (Right) */}
                    <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0">
                        <Compass className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="text-[11px] truncate">
                          {coexCount && coexCount > 0 ? (
                            <Link
                              to={`/species/${creature.id}`}
                              className="text-amber-300 hover:text-amber-200 hover:underline font-bold"
                            >
                              Coexisted with {coexCount} species in {formationDisplay ? formationDisplay.split(' ')[0] : 'strata'}
                            </Link>
                          ) : formationDisplay ? (
                            <span>Stratum: <strong className="text-slate-200">{formationDisplay}</strong></span>
                          ) : (
                            <span>Archival Holotype Record Verified</span>
                          )}
                        </span>
                      </div>

                      <motion.div whileTap={{ scale: 0.94 }} className="w-full sm:w-auto shrink-0">
                        <Link
                          to={`/species/${creature.id}`}
                          className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          Inspect 2D Scale Stage <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                );
              })()}            </div>
          </SpotlightCard>
        )}
      </motion.section>

      {/* Curatorial Museum Access Portals (Scroll Viewport Reveal) */}
      <motion.section
        initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono"
      >
        {/* Portal 1: Catalog Index */}
        <Link to="/browse" className="block group">
          <SpotlightCard
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="museum-plinth rounded-xl hover:border-amber-500/40 p-6 sm:p-7 transition-colors shadow-xl flex flex-col justify-between space-y-5 h-full"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  ARCHIVE INDEX
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {formattedTotal} SPECIMENS
                </span>
              </div>

              <h3 className="text-2xl font-black uppercase text-slate-100 group-hover:text-amber-400 transition-colors tracking-tight font-sans">
                Fauna Catalog & Filter Pavilion
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Filter cataloged prehistoric species by period, diet, habitat, and taxonomic clade with interactive 1:1 scale inspection and human reference models.
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-amber-400 transition-colors">
              <span>Filter All Specimens</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </SpotlightCard>
        </Link>

        {/* Portal 2: Time Map */}
        <Link to="/map" className="block group">
          <SpotlightCard
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="museum-plinth rounded-xl hover:border-amber-500/40 p-6 sm:p-7 transition-colors shadow-xl flex flex-col justify-between space-y-5 h-full"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Globe className="h-3 w-3" /> PALEOGEOGRAPHY
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  GEOLOGICAL STRATA
                </span>
              </div>

              <h3 className="text-2xl font-black uppercase text-slate-100 group-hover:text-amber-400 transition-colors tracking-tight font-sans">
                Geological Time-Map
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Explore major fossil sites around the globe dynamically filtered by geological time period from Cambrian marine explosion to Pleistocene megafauna.
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-amber-400 transition-colors">
              <span>Open Geological Map</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </SpotlightCard>
        </Link>
      </motion.section>
    </div>
  );
}

