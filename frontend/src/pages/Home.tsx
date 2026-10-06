import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform, Variants } from 'framer-motion';
import { fetchCreatureOfTheDay, fetchSpecies, fetchSpeciesById, Species, TOTAL_CATALOGED_SPECIMENS } from '../services/api.js';
import SpotlightCard from '../components/SpotlightCard.js';
import SpecimenThumbnail from '../components/SpecimenThumbnail.js';
import { ArrowRight, Compass, ShieldAlert, Layers, Globe, Database, Scale, Trophy, Skull } from 'lucide-react';
import { formatMass } from '../utils/formatMass.js';
import { formatFeet } from '../utils/formatDimensions.js';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';
import { formatEnumLabel } from '../utils/formatEnumLabel.js';
import CuratorialLoader from '../components/CuratorialLoader.js';

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
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
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

  const formattedTotal = totalSpecies ? `${totalSpecies}` : `${TOTAL_CATALOGED_SPECIMENS}`;

  return (
    <div className="space-y-16 relative">
      {/* Curatorial Museum Hero Section with Subtle Parallax Falloff */}
      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="show"
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 max-w-6xl mx-auto pt-6 pb-12 space-y-8 border-b border-white/[0.08]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-8 space-y-6 text-left">
            <div className="flex items-center gap-2.5 text-xs font-mono text-amber-400 font-bold tracking-widest uppercase">
              <img src="/logo.png" alt="Prehistorica Emblem" className="h-4 w-4 object-contain shrink-0" />
              <span>Deep Time Archive &bull; 541 &ndash; 0.01 MYA</span>
            </div>

            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-100 uppercase leading-[1.02] font-sans"
            >
              Museum Archive of Prehistoric Life
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg font-sans text-slate-300 leading-relaxed max-w-2xl"
            >
              An architectural digital repository cataloging <strong className="text-amber-400 font-bold">{formattedTotal}</strong> scientifically verified prehistoric species across Earth's major geological epochs and fossil formations.
            </motion.p>

            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
              <Link
                to="/browse"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                Explore Catalog <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/map"
                className="px-6 py-3 bg-slate-900/90 hover:bg-slate-850 text-slate-200 font-bold uppercase tracking-wider rounded-lg border border-white/[0.08] hover:border-amber-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                <Compass className="h-4 w-4 text-amber-400" /> Interactive Time-Map
              </Link>
              <Link
                to="/extinctions"
                className="px-6 py-3 bg-slate-900/90 hover:bg-slate-850 text-rose-300 hover:text-white font-bold uppercase tracking-wider rounded-lg border border-rose-500/30 hover:border-rose-500/60 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                <Skull className="h-4 w-4 text-rose-400" /> Mass Extinctions
              </Link>
            </div>
          </div>

          {/* Architectural Curatorial Ledger (Whitespace & Typography hierarchy) */}
          <div className="lg:col-span-4 pl-0 lg:pl-8 lg:border-l border-white/[0.08] space-y-6 font-mono">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-amber-400" />
              <span>Curatorial Ledger</span>
            </div>

            <div className="space-y-5">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Verified Holotype Specimens</div>
                <div className="text-3xl font-black text-slate-100 tabular-nums font-sans">
                  {formattedTotal}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Geological span</div>
                <div className="text-sm font-bold text-slate-200">
                  10 Geological Eras &bull; <span className="text-amber-400 font-mono">541 MYA to Holocene</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Global Fossil Localities</div>
                <div className="text-sm font-bold text-slate-200">
                  30+ Major Geological Formations
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Projection Stage</div>
                <div className="text-sm font-bold text-amber-400">
                  1:1 Scale comparison
                </div>
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
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
              Rotational Specimen Focus
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500 tracking-wider">
            Archive Selection
          </span>
        </div>

        {loading ? (
          <div className="relative glass-panel rounded-xl overflow-hidden shadow-2xl p-4 sm:p-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              {/* Image Viewport Skeleton with Curatorial Loader */}
              <div className="lg:col-span-7 relative h-64 sm:h-96 rounded-lg bg-slate-900/80 border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                <CuratorialLoader
                  variant="amber"
                  label="Accessing Daily Specimen Exhibit..."
                  sublabel="Connecting to curated museum holotype archives"
                />
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
              {/* Artwork / Specimen Image Viewport with Adaptive Archival Mounting */}
              <div className="lg:col-span-7 relative h-64 sm:h-96 rounded-lg overflow-hidden flex items-center justify-center">
                <SpecimenThumbnail
                  src={creature.reconstructionImageUrl}
                  alt={creature.name}
                  eraLabel={`${creature.timePeriod} (${creature.myaStart}–${creature.myaEnd} MYA)`}
                  aspectRatio="aspect-auto h-full"
                  className="rounded-lg border border-white/[0.08] shadow-inner"
                />
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
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                    <div className="space-y-4">
                      {/* Stratum & Taxonomic Breadcrumb */}
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-slate-400">
                        <span className="text-amber-400 font-bold tracking-wider">{formatEnumLabel(creature.clade)}</span>
                        {(formationDisplay || regionDisplay) && (
                          <>
                            <span className="text-slate-600">/</span>
                            <span className="text-slate-300">
                              {formationDisplay || regionDisplay}
                              {formationDisplay && regionDisplay ? ` (${regionDisplay})` : ''}
                            </span>
                          </>
                        )}
                        {creature.dietType && (
                          <>
                            <span className="text-slate-600">/</span>
                            <span className="text-slate-400">{formatEnumLabel(creature.dietType)}</span>
                          </>
                        )}
                      </div>

                      {/* Specimen Heading: Name + Binomen + Etymology */}
                      <div className="space-y-1">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-slate-100 group-hover:text-amber-400 transition-colors font-sans">
                          {names.heading}
                        </h3>
                        <p className="text-sm italic text-amber-400/90 font-serif">
                          {names.subheading}
                        </p>
                        {creature.nameMeaning && (
                          <p className="text-xs text-slate-400 pt-0.5">
                            <span className="text-slate-500 font-mono text-[10px] uppercase tracking-wider">Etymology —</span> "{creature.nameMeaning}"
                          </p>
                        )}
                      </div>

                      {/* Curatorial Paleobiology Narrative (editorial, not boxed into cards) */}
                      <div className="space-y-2 border-l-2 border-amber-500/30 pl-3.5 py-0.5">
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans line-clamp-2">
                          {creature.interestingFacts?.[0] || creature.dietDetails}
                        </p>
                        {secondFact && (
                          <p className="text-xs text-slate-400 font-mono leading-relaxed line-clamp-2">
                            {secondFact}
                          </p>
                        )}
                      </div>

                      {/* Architectural Dimension Register */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 py-3 border-y border-white/[0.08] font-mono">
                        <div className="space-y-0.5 pr-4 border-r border-white/[0.06]">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Length</div>
                          <div className="text-xs sm:text-sm font-bold text-slate-100 tabular-nums">{formatFeet(creature.lengthM)}</div>
                        </div>

                        <div className="space-y-0.5 px-0 sm:px-4 sm:border-r sm:border-white/[0.06]">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Height</div>
                          <div className="text-xs sm:text-sm font-bold text-slate-100 tabular-nums">{formatFeet(creature.heightM)}</div>
                        </div>

                        <div className="space-y-0.5 pr-4 border-r border-white/[0.06] pt-2 sm:pt-0">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Mass</div>
                          <div className="text-xs sm:text-sm font-bold text-amber-400 tabular-nums">{formatMass(creature.weightKg)}</div>
                        </div>

                        <div className="space-y-0.5 pl-0 sm:pl-4 pt-2 sm:pt-0">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Habitat</div>
                          <div className="text-xs sm:text-sm font-bold text-slate-300 truncate">
                            {formatEnumLabel(creature.habitat) || 'Terrestrial'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Context + Direct Specimen Archive Action */}
                    <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
                      <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
                        <Compass className="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
                        <span className="text-[11px] truncate">
                          {coexCount && coexCount > 0 ? (
                            <Link
                              to={`/species/${creature.id}`}
                              className="text-amber-400 hover:text-amber-300 hover:underline font-semibold"
                            >
                              Coexisted with {coexCount} species in {formationDisplay ? formationDisplay.split(' ')[0] : 'strata'}
                            </Link>
                          ) : formationDisplay ? (
                            <span>Stratum: <strong className="text-slate-200">{formationDisplay}</strong></span>
                          ) : (
                            <span>Holotype verified against peer-reviewed record</span>
                          )}
                        </span>
                      </div>

                      <Link
                        to={`/species/${creature.id}`}
                        className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-wider text-xs rounded flex items-center justify-center gap-1.5 transition-all shadow hover:shadow-amber-500/10 cursor-pointer shrink-0"
                      >
                        Inspect Specimen Archive <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })()}            </div>
          </SpotlightCard>
        )}
      </motion.section>

      {/* Curatorial Museum Access Portals (Scroll Viewport Reveal) */}
      {/* Curatorial Museum Access Portals (Scroll Viewport Reveal) */}
      <motion.section
        initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 font-mono"
      >
        {/* Wing I: Systematic Paleontology */}
        <Link to="/browse" className="block group focus:outline-none">
          <SpotlightCard
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="museum-plinth rounded-xl border border-white/[0.08] hover:border-amber-500/40 p-6 sm:p-7 transition-all duration-200 shadow-xl flex flex-col justify-between h-full group-focus-visible:ring-2 group-focus-visible:ring-amber-400"
          >
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 min-h-[32px] gap-2 font-mono text-[11px]">
                <span className="text-slate-300 flex items-center gap-1.5 shrink-0 font-medium">
                  <Layers className="h-3.5 w-3.5 text-amber-400/80" /> Systematic archive
                </span>
                <span className="text-slate-500 tabular-nums">
                  {formattedTotal} taxa
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-100 group-hover:text-amber-400 transition-colors tracking-tight font-sans min-h-[56px] flex items-center leading-tight">
                Fauna Catalog &amp; Strata Pavilion
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans flex-1">
                Explore cataloged prehistoric taxa filtered by geological epoch, biome, and taxonomic clade with scale comparisons.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold tracking-wide text-slate-300 group-hover:text-amber-400 transition-colors shrink-0">
              <span>Explore systematic index</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-200" />
            </div>
          </SpotlightCard>
        </Link>

        {/* Wing II: Paleogeography */}
        <Link to="/map" className="block group focus:outline-none">
          <SpotlightCard
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="museum-plinth rounded-xl border border-white/[0.08] hover:border-amber-500/40 p-6 sm:p-7 transition-all duration-200 shadow-xl flex flex-col justify-between h-full group-focus-visible:ring-2 group-focus-visible:ring-amber-400"
          >
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 min-h-[32px] gap-2 font-mono text-[11px]">
                <span className="text-slate-300 flex items-center gap-1.5 shrink-0 font-medium">
                  <Globe className="h-3.5 w-3.5 text-amber-400/80" /> Paleogeography
                </span>
                <span className="text-slate-500">
                  Strata map
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-100 group-hover:text-amber-400 transition-colors tracking-tight font-sans min-h-[56px] flex items-center leading-tight">
                Deep Time Strata &amp; Fossil Map
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans flex-1">
                Trace global fossil formations across deep time from the Cambrian explosion through Pleistocene megafauna.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold tracking-wide text-slate-300 group-hover:text-amber-400 transition-colors shrink-0">
              <span>Inspect global strata</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-200" />
            </div>
          </SpotlightCard>
        </Link>

        {/* Wing III: Biomechanical Projection */}
        <Link to="/runway" className="block group focus:outline-none">
          <SpotlightCard
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="museum-plinth rounded-xl border border-white/[0.08] hover:border-amber-500/40 p-6 sm:p-7 transition-all duration-200 shadow-xl flex flex-col justify-between h-full group-focus-visible:ring-2 group-focus-visible:ring-amber-400"
          >
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 min-h-[32px] gap-2 font-mono text-[11px]">
                <span className="text-slate-300 flex items-center gap-1.5 shrink-0 font-medium">
                  <Scale className="h-3.5 w-3.5 text-amber-400/80" /> Scale comparison
                </span>
                <span className="text-slate-500">
                  Runway
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-100 group-hover:text-amber-400 transition-colors tracking-tight font-sans min-h-[56px] flex items-center leading-tight">
                Caliper Scale Runway
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans flex-1">
                Compare up to six prehistoric species at scale alongside familiar architectural references.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold tracking-wide text-slate-300 group-hover:text-amber-400 transition-colors shrink-0">
              <span>Open scale runway</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-200" />
            </div>
          </SpotlightCard>
        </Link>

        {/* Wing IV: Curatorial Fieldwork */}
        <Link to="/challenge" className="block group focus:outline-none">
          <SpotlightCard
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="museum-plinth rounded-xl border border-white/[0.08] hover:border-amber-500/40 p-6 sm:p-7 transition-all duration-200 shadow-xl flex flex-col justify-between h-full group-focus-visible:ring-2 group-focus-visible:ring-amber-400"
          >
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 min-h-[32px] gap-2 font-mono text-[11px]">
                <span className="text-slate-300 flex items-center gap-1.5 shrink-0 font-medium">
                  <Trophy className="h-3.5 w-3.5 text-amber-400/80" /> Field trials
                </span>
                <span className="text-slate-500">
                  Challenges
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-100 group-hover:text-amber-400 transition-colors tracking-tight font-sans min-h-[56px] flex items-center leading-tight">
                Curator Trials &amp; Notebook
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans flex-1">
                Test diagnostic intuition with Holotype Detective, Caliper Metric Guesser, and geological timeline challenges.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold tracking-wide text-slate-300 group-hover:text-amber-400 transition-colors shrink-0">
              <span>Enter curator trials</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-200" />
            </div>
          </SpotlightCard>
        </Link>
      </motion.section>
    </div>
  );
}

