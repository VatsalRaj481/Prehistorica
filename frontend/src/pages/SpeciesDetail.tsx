import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { fetchSpeciesById, Species } from '../services/api.js';
import TaxonomyBreadcrumbs from '../components/TaxonomyBreadcrumbs.js';
import TwoDScaleViewer from '../components/TwoDScaleViewer.js';
import MediaGallery from '../components/MediaGallery.js';
import { isBookmarked as checkIsBookmarked, toggleBookmark as toggleBookmarkStorage } from '../utils/notebookStorage.js';
import { Calendar, Compass, ArrowLeft, Dna, FileText, Scale, BookOpen, AlertCircle, Bookmark, BookmarkCheck, ExternalLink, Globe, Zap } from 'lucide-react';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';
import { formatFeetLong } from '../utils/formatDimensions.js';
import ShinyText from '../components/reactbits/ShinyText.js';
import ClickSpark from '../components/reactbits/ClickSpark.js';
import CuratorialLoader from '../components/CuratorialLoader.js';

export default function SpeciesDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Preserve filter/search state when returning to the catalog index
  const catalogReturnUrl = (location.state as any)?.from || (typeof window !== 'undefined' ? sessionStorage.getItem('prehistorica_browse_state') : null) || '/browse';

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchSpeciesById(parseInt(id, 10))
      .then((data) => {
        setSpecies(data);
        document.title = `${data.name} (${data.scientificName}) | Prehistorica Museum Exhibit`;
        setIsBookmarked(checkIsBookmarked(data.id));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load species exhibit profile.');
        setLoading(false);
      });
  }, [id]);

  const toggleBookmark = () => {
    if (!species) return;
    const newState = toggleBookmarkStorage(species.id);
    setIsBookmarked(newState);
  };

  const pageVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 350, damping: 26 }
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <CuratorialLoader
          variant="amber"
          label="Accessing Specimen Holotype Archives..."
          sublabel="Deciphering stratigraphic age and taxonomic classification"
        />
      </div>
    );
  }

  if (error || !species) {
    return (
      <div className="bg-slate-950 border border-red-500/20 rounded-xl p-12 text-center text-red-400 flex flex-col items-center gap-4 shadow-2xl font-mono">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <h2 className="text-lg font-bold uppercase tracking-wider font-sans">Specimen Record Unavailable</h2>
        <p className="text-xs max-w-md text-slate-400 font-sans">{error || 'The requested prehistoric species exhibit could not be located.'}</p>
        <Link
          to={catalogReturnUrl}
          className="mt-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider rounded-lg border border-white/[0.08] transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Catalog Index
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Top Museum Navigation & Catalog Reference Header */}
      <div className="flex flex-wrap justify-between items-center border-b border-white/[0.08] pb-4 gap-4 font-mono">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <motion.div whileTap={{ scale: 0.94 }}>
            <ClickSpark sparkColor="#F59E0B">
              <Link
                to={catalogReturnUrl}
                className="inline-flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors font-bold uppercase tracking-wider"
              >
                <ArrowLeft className="h-4 w-4 text-amber-400" /> Catalog Index
              </Link>
            </ClickSpark>
          </motion.div>
          <span className="text-slate-700">|</span>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[11px]">
            Specimen #{species.id.toString().padStart(4, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <motion.div whileTap={{ scale: 0.94 }}>
            <ClickSpark sparkColor="#F59E0B">
              <Link
                to={`/runway?ids=${species.id}`}
                className="px-3 py-2 rounded-lg border border-white/[0.08] bg-slate-900/90 hover:bg-slate-850 hover:border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
                title="Add this creature to the Multi-Specimen Caliper Runway"
              >
                <Scale className="h-3.5 w-3.5 text-amber-400" /> Runway Lineup
              </Link>
            </ClickSpark>
          </motion.div>

          <ClickSpark sparkColor="#F59E0B">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={toggleBookmark}
              className={`px-3.5 py-2 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                isBookmarked
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900/90 border-white/[0.08] text-slate-300 hover:text-white hover:border-amber-500/40'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="h-4 w-4 text-amber-400" /> Archival Bookmarked
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 text-slate-400" /> Bookmark Specimen
                </>
              )}
            </motion.button>
          </ClickSpark>
        </div>
      </div>

      {/* Main Specimen Title & Classification Headline */}
      {(() => {
        const names = getSpeciesDisplayNames(species);
        return (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3 sm:space-y-4 border-l-2 border-amber-500 pl-3 sm:pl-5"
          >
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1.5 rounded-md text-[10px] sm:text-xs">
                <Calendar className="h-3.5 w-3.5" />
                <ShinyText text={`${species.timePeriod} • ${species.myaStart}–${species.myaEnd} MYA`} speed={4} />
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-white/[0.08] text-slate-300 font-bold uppercase tracking-widest rounded-md text-[10px] sm:text-xs">
                Clade: {species.clade}
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-widest rounded-md text-[10px] sm:text-xs">
                Diet: {species.dietType || species.diet}
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-white/[0.08] text-amber-300/90 font-bold uppercase tracking-widest rounded-md text-[10px] sm:text-xs">
                Status: {species.taxonomicStatus}
              </span>
            </div>

            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-100 uppercase break-words leading-tight sm:leading-none font-sans"
            >
              {names.heading}
            </motion.h1>
            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="text-sm sm:text-lg italic font-mono text-amber-400"
            >
              {names.subheading}
            </motion.p>

            {species.nameMeaning && (
              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="text-xs font-mono text-slate-400 leading-relaxed border-t border-white/[0.08] pt-2 sm:pt-3"
              >
                <strong className="font-bold text-amber-400 uppercase tracking-widest">Etymology & Translation:</strong> "{species.nameMeaning}"
              </motion.p>
            )}
          </motion.div>
        );
      })()}

      {/* 2D Silhouette Scale Comparison Stage (Scroll Viewport Reveal) */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        <TwoDScaleViewer
          speciesName={species.name}
          scientificName={species.scientificName}
          lengthM={species.lengthM}
          heightM={species.heightM}
          weightKg={species.weightKg}
          clade={species.clade}
          silhouette={species.comparisonSilhouette}
        />
      </motion.div>

      {/* Architectural Metrics Banner (Scroll Viewport Reveal) */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono"
      >
        <motion.div
          whileHover={shouldReduceMotion ? {} : { y: -3, transition: { duration: 0.2 } }}
          className="museum-card py-3.5 px-4 rounded-xl space-y-1 text-center shadow-md border border-white/[0.06] hover:border-amber-500/40 transition-colors"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-amber-400" /> Total Length
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums">
            {formatFeetLong(species.lengthM)}
          </p>
        </motion.div>

        <motion.div
          whileHover={shouldReduceMotion ? {} : { y: -3, transition: { duration: 0.2 } }}
          className="museum-card py-3.5 px-4 rounded-xl space-y-1 text-center shadow-md border border-white/[0.06] hover:border-amber-500/40 transition-colors"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-amber-400" /> Standing Height
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums">
            {formatFeetLong(species.heightM)}
          </p>
        </motion.div>

        <motion.div
          whileHover={shouldReduceMotion ? {} : { y: -3, transition: { duration: 0.2 } }}
          className="museum-card py-3.5 px-4 rounded-xl space-y-1 text-center shadow-md border border-white/[0.06] hover:border-amber-500/40 transition-colors"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-amber-400" /> Estimated Mass
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums">
            {species.weightKg ? `${species.weightKg.toLocaleString()} KG` : 'Disputed'}
          </p>
        </motion.div>
      </motion.div>

      {/* Specimen Deep Dive Grid (Scroll Viewport Reveal) */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8"
      >
        {/* Left Column: Media Reconstruction & Visual Archive */}
        <div className="lg:col-span-6 space-y-5">
          <div className="museum-plinth rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-3 shadow-xl">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2 border-b border-white/[0.08] pb-2.5">
              <FileText className="h-4 w-4 text-amber-400" /> Specimen Visual Archive
            </h3>

            <MediaGallery
              media={species.media}
              reconstructionImageUrl={species.reconstructionImageUrl}
              fossilImageUrl={species.fossilImageUrl}
              speciesName={species.name}
            />
          </div>

          {/* Discovery & Geographic Range Panel */}
          <div className="museum-plinth rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-3 shadow-xl">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2 border-b border-white/[0.08] pb-2.5">
              <Compass className="h-4 w-4 text-amber-400" /> Field Discovery & Provenance
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px] tracking-widest flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-amber-400" /> Geological Range & Formation
                </span>
                <p className="text-slate-200 leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-white/[0.06] font-sans text-xs">
                  {species.geographicRange?.region || species.country || 'Global distribution'} &bull; Formation:{' '}
                  <span className="text-amber-400 font-bold font-mono">{species.fossilFormation || 'Unspecified'}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px] tracking-widest flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-amber-400" /> Excavation Log Notes
                </span>
                <p className="text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-white/[0.06] italic font-sans text-xs">
                  "{species.discoveryHistory || 'Fossilized specimens cataloged in official paleontology archives.'}"
                </p>
              </div>

              {species.dietDetails && (
                <div className="space-y-1">
                  <span className="text-slate-400 uppercase font-bold text-[10px] tracking-widest flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-amber-400" /> Dietary Adaptation & Trophic Niche
                  </span>
                  <p className="text-slate-200 leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-white/[0.06] font-sans text-xs">
                    <span className="capitalize text-emerald-400 font-bold font-mono mr-1.5">[{species.dietType || species.diet}]:</span>
                    {species.dietDetails}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Taxonomy Rank, Scientific Facts & Literature */}
        <div className="lg:col-span-6 space-y-5">
          {/* Architectural Taxonomic Hierarchy */}
          <div className="museum-plinth rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-3 shadow-xl">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2 border-b border-white/[0.08] pb-2.5">
              <Dna className="h-4 w-4 text-amber-400" /> Structural Taxonomic Hierarchy
            </h3>

            <TaxonomyBreadcrumbs
              taxonomy={species.taxonomy}
              taxonomicClassification={species.taxonomicClassification}
            />

            {/* Cladistic & Evolutionary Lineage Monograph */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2 font-mono text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1.5">
                <Dna className="h-3.5 w-3.5 text-amber-400" /> Cladistic & Extant Lineage
              </span>
              <div className="bg-slate-900/90 p-3 rounded-lg border border-white/[0.06] space-y-2 text-xs font-sans">
                {species.clade === 'Theropod' ? (
                  <div className="space-y-1">
                    <p className="text-slate-200">
                      <strong className="text-amber-400 font-mono font-bold">Surviving Avian Theropods: </strong>
                      Modern Birds (<em className="font-mono">Aves / Neornithes</em>) are direct surviving avian theropod dinosaurs.
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      <strong className="text-slate-300 font-mono font-bold">Closest Living Non-Dinosaurian Outgroup: </strong>
                      Crocodilians (Crocodiles, Alligators & Gharials) form the extant sister lineage of Archosauria.
                    </p>
                  </div>
                ) : ['Sauropod', 'Sauropodomorph', 'Ornithischian'].includes(species.clade) ? (
                  <div className="space-y-1">
                    <p className="text-slate-200">
                      <strong className="text-amber-400 font-mono font-bold">Surviving Dinosaur Lineage: </strong>
                      Modern Birds (<em className="font-mono">Aves</em>) are the only surviving clade of Dinosauria.
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      <strong className="text-slate-300 font-mono font-bold">Closest Living Non-Dinosaurian Outgroup: </strong>
                      Crocodilians represent the closest extant non-dinosaurian archosaurs.
                    </p>
                  </div>
                ) : species.clade === 'Marine_Reptile' ? (
                  <div className="space-y-1">
                    <p className="text-slate-200">
                      <strong className="text-sky-400 font-mono font-bold">Ecological Evolutionary Grade: </strong>
                      "Marine Reptiles" represents an ecological convergence of distinct reptilian orders (<em className="font-mono">Ichthyosauria</em>, <em className="font-mono">Sauropterygia / Plesiosauria</em>, and <em className="font-mono">Mosasauroidea</em>) rather than a single monophyletic clade.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {species.closestLivingRelatives && species.closestLivingRelatives.length > 0 ? (
                      <p className="text-slate-300 text-xs">
                        <strong className="text-amber-400 font-mono font-bold">Closest Extant Relatives: </strong>
                        {species.closestLivingRelatives.join(' • ')}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-xs italic">
                        Extinct prehistoric lineage without immediate extant crown descendants.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scientific Key Facts Monograph */}
          {species.interestingFacts && species.interestingFacts.length > 0 && (
            <div className="museum-plinth rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" /> Key Scientific Diagnostic Features
                </h3>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  {species.interestingFacts.length} traits
                </span>
              </div>

              <div className={`grid gap-2 ${
                species.interestingFacts.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
              }`}>
                {species.interestingFacts.map((fact, i) => {
                  const isLastOdd = species.interestingFacts!.length % 2 !== 0 && i === species.interestingFacts!.length - 1;
                  return (
                    <div
                      key={i}
                      className={`p-2.5 px-3 bg-slate-900/80 hover:bg-slate-900/95 rounded-lg border border-white/[0.06] text-xs font-sans text-slate-300 leading-relaxed flex items-start gap-2.5 shadow-sm transition-colors ${
                        isLastOdd ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold font-mono text-[10px] border border-amber-500/20 shrink-0 mt-0.5">
                        #{i + 1}
                      </span>
                      <span className="text-[12px] leading-snug">{fact}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Academic Citations & Literature */}
          {species.sources && species.sources.length > 0 && (
            <div className="museum-plinth rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-3 shadow-xl">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2 border-b border-white/[0.08] pb-2.5">
                <BookOpen className="h-4 w-4 text-amber-400" /> Verified Academic Citations
              </h3>

              <div className="space-y-2">
                {species.sources.map((src, i) => (
                  <div
                    key={i}
                    className="p-2.5 px-3 bg-slate-900/90 rounded-lg border border-white/[0.06] text-xs font-mono text-slate-400 flex items-center justify-between gap-3"
                  >
                    <span className="truncate">{src.citation}</span>
                    {src.url && (
                      <ClickSpark sparkColor="#F59E0B">
                        <motion.a
                          whileTap={{ scale: 0.92 }}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold uppercase tracking-wider shrink-0 text-[10px]"
                        >
                          View Source <ExternalLink className="h-3 w-3" />
                        </motion.a>
                      </ClickSpark>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Full-Width Horizontal Coexisting Species Ribbon (Scroll Viewport Reveal) */}
      {species.relatedSpecies && species.relatedSpecies.length > 0 && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="museum-plinth rounded-xl p-6 border border-white/[0.08] space-y-4 shadow-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3 font-mono">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <Compass className="h-4 w-4 text-amber-400" /> Lived Alongside / Coexisting Species
            </h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Same Formation &bull; Era &amp; Region
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x font-mono">
            {species.relatedSpecies.map((rel: any) => {
              const imgUrl = rel.reconstructionImageUrl || rel.media?.[0]?.url || 'https://images.unsplash.com/photo-1551085254-e96b210df58a?q=80&w=1200&auto=format&fit=crop';
              const names = getSpeciesDisplayNames(rel);
              return (
                <motion.div
                  key={rel.id}
                  whileHover={shouldReduceMotion ? {} : { y: -4, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
                  whileTap={{ scale: 0.98 }}
                  className="shrink-0 snap-start"
                >
                  <Link
                    to={`/species/${rel.id}`}
                    state={{ from: catalogReturnUrl }}
                    className="group museum-card rounded-xl p-3 flex flex-col justify-between w-52 sm:w-64 lg:w-72 shadow-lg overflow-hidden h-full"
                  >
                    <div className="relative h-36 w-full bg-slate-950 rounded-lg overflow-hidden mb-3 border border-white/[0.06]">
                      <img
                        src={imgUrl}
                        alt={rel.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-950/90 backdrop-blur-md rounded text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400 border border-white/[0.08]">
                        {rel.clade || 'Prehistoric'}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold font-sans text-slate-100 group-hover:text-amber-400 transition-colors uppercase truncate">
                        {names.heading}
                      </h4>
                      <p className="text-[10px] font-mono text-amber-400 truncate">
                        {names.subheading}
                      </p>
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-2 border-t border-white/[0.06]">
                        <span className="truncate">{rel.timePeriod || 'Prehistoric'}</span>
                        <span className="text-amber-400 uppercase tracking-wider font-bold">
                          {rel.fossilFormation ? rel.fossilFormation.split(' ')[0] : 'Coexisted'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

