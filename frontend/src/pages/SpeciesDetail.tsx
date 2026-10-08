import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { fetchSpeciesById, Species } from '../services/api.js';
import TaxonomyBreadcrumbs from '../components/TaxonomyBreadcrumbs.js';
import TwoDScaleViewer from '../components/TwoDScaleViewer.js';
import MediaGallery from '../components/MediaGallery.js';
import { isBookmarked as checkIsBookmarked, toggleBookmark as toggleBookmarkStorage } from '../utils/notebookStorage.js';
import { Compass, ArrowLeft, Dna, FileText, Scale, BookOpen, AlertCircle, Bookmark, BookmarkCheck, ExternalLink, Globe } from 'lucide-react';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';
import { formatFeetLong } from '../utils/formatDimensions.js';
import { formatEnumLabel } from '../utils/formatEnumLabel.js';
import CuratorialLoader from '../components/CuratorialLoader.js';

export default function SpeciesDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Preserve filter/search state when returning to the catalog index, or navigate to exact catalog page / Time-Map
  const stateFrom = (location.state as any)?.from;
  const isFromTimeMap = stateFrom && (stateFrom === '/map' || stateFrom.startsWith('/map'));
  const storedState = typeof window !== 'undefined' ? sessionStorage.getItem('prehistorica_browse_state') : null;
  const hasSpecificCatalogReferrer = stateFrom && stateFrom.startsWith('/browse') && stateFrom !== '/browse' && stateFrom !== '/browse?page=1';
  const exactSpeciesCatalogUrl = species?.catalogPage
    ? `/browse?page=${species.catalogPage}#specimen-${species.id}`
    : '/browse';
  const catalogReturnUrl = isFromTimeMap
    ? '/map'
    : hasSpecificCatalogReferrer
    ? stateFrom
    : (storedState && storedState !== '/browse' && storedState !== '/browse?page=1')
    ? storedState
    : exactSpeciesCatalogUrl;
  const returnLabel = isFromTimeMap ? 'Time-Map Pavilion' : 'Catalog Index';

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
          <ArrowLeft className="h-4 w-4" /> Return to {returnLabel}
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
          <Link
            to={catalogReturnUrl}
            title={isFromTimeMap ? 'Return to Time-Map Pavilion' : (species.catalogPage ? `Return to Catalog Index (Page ${species.catalogPage})` : 'Return to Catalog Index')}
            className="inline-flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors font-bold uppercase tracking-wider group"
          >
            <ArrowLeft className="h-4 w-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>{returnLabel}</span>
            {!isFromTimeMap && species.catalogPage && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-amber-400/90 group-hover:border-amber-400/40 transition-colors">
                Page {species.catalogPage}
              </span>
            )}
          </Link>
          <span className="text-slate-700">|</span>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[11px]">
            Specimen #{species.id.toString().padStart(4, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/runway?ids=${species.id}`}
            className="px-3.5 py-2 rounded-lg border border-white/[0.08] bg-slate-900/90 hover:bg-slate-850 hover:border-amber-500/40 text-xs font-mono font-medium tracking-wider text-slate-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
            title="Add this creature to the Multi-Specimen Caliper Runway"
          >
            <Scale className="h-3.5 w-3.5 text-amber-400" /> Runway Lineup
          </Link>

          <button
            onClick={toggleBookmark}
            className={`px-3.5 py-2 rounded-lg border text-xs font-mono font-medium tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
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
          </button>
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
            className="space-y-3 sm:space-y-4 border-l-2 border-amber-500/40 pl-3 sm:pl-5"
          >
            {/* Stratum & Taxonomic Placement Breadcrumb */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 tracking-wide">
              <span className="text-amber-400 font-semibold">{formatEnumLabel(species.clade)}</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-slate-200">{species.timePeriod} ({species.myaStart}–{species.myaEnd} Ma)</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-slate-300">{formatEnumLabel(species.dietType || species.diet)}</span>
              {species.taxonomicStatus && (
                <>
                  <span className="text-slate-600">&bull;</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    species.taxonomicStatus === 'disputed'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : species.taxonomicStatus === 'nomen_dubium'
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400'
                  }`}>
                    {species.taxonomicStatus === 'nomen_dubium' ? 'Nomen Dubium / Lost Holotype' : formatEnumLabel(species.taxonomicStatus)}
                  </span>
                </>
              )}
            </div>

            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-100 uppercase break-words leading-tight sm:leading-none font-sans"
            >
              {names.heading}
            </motion.h1>
            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="text-base sm:text-xl italic font-serif text-amber-400/90"
            >
              {names.subheading}
            </motion.p>

            {species.nameMeaning && (
              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="text-xs text-slate-400 leading-relaxed border-t border-white/[0.08] pt-2 sm:pt-3 font-sans"
              >
                <span className="text-slate-500 font-medium mr-1.5">Etymology &amp; translation:</span> &ldquo;{species.nameMeaning}&rdquo;
              </motion.p>
            )}

            {species.taxonomicStatus === 'disputed' && (
              <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-xs font-sans flex items-start gap-3 mt-3">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-mono uppercase text-[11px] tracking-wider text-amber-400 block">
                    Curatorial Advisory • Contested Taxonomic Validity
                  </strong>
                  <p className="leading-relaxed text-slate-300 text-[11px]">
                    The generic distinction of this specimen is subject to ongoing debate in vertebrate paleontology. While substantial diagnostic fossils exist, several specialists consider the taxon congeneric with closely allied genera or an exceptionally gigantic individual of an existing species.
                  </p>
                </div>
              </div>
            )}

            {species.taxonomicStatus === 'nomen_dubium' && (
              <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-200/90 text-xs font-sans flex items-start gap-3 mt-3">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-mono uppercase text-[11px] tracking-wider text-rose-400 block">
                    Curatorial Advisory • Nomen Dubium / Lost Physical Holotype
                  </strong>
                  <p className="leading-relaxed text-slate-300 text-[11px]">
                    The physical holotype fossil material was tragically lost or decomposed before permanent museum stabilization. Reported anatomical dimensions and extreme mass metrics represent speculative biomechanical extrapolations from archived field records rather than verifiable physical museum specimens.
                  </p>
                </div>
              </div>
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

      {/* Architectural Dimension Register */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08] border-y border-white/[0.08] py-4"
      >
        <div className="py-2 sm:py-0 sm:px-6 text-center sm:text-left space-y-1">
          <span className="text-xs font-medium text-slate-400 block font-sans">
            Total length
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-100 tabular-nums font-mono">
            {formatFeetLong(species.lengthM)}
          </p>
        </div>

        <div className="py-2 sm:py-0 sm:px-6 text-center sm:text-left space-y-1">
          <span className="text-xs font-medium text-slate-400 block font-sans">
            Standing height
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-100 tabular-nums font-mono">
            {formatFeetLong(species.heightM)}
          </p>
        </div>

        <div className="py-2 sm:py-0 sm:px-6 text-center sm:text-left space-y-1">
          <span className="text-xs font-medium text-slate-400 block font-sans">
            Estimated adult mass
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums font-mono">
            {species.weightKg ? `${species.weightKg.toLocaleString()} kg` : 'Disputed / Incomplete'}
          </p>
        </div>
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
          <div className="museum-plinth rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2 border-b border-white/[0.08] pb-2.5">
              <Compass className="h-4 w-4 text-amber-400" /> Discovery &amp; Geographic Provenance
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-mono uppercase font-bold text-[10px] tracking-widest flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-amber-400" /> Geological Range &amp; Stratum
                </span>
                <p className="text-slate-200 leading-relaxed font-sans text-xs sm:text-sm pl-4 border-l border-amber-500/30">
                  {species.geographicRange?.region || species.country || 'Global distribution'} &bull; Formation:{' '}
                  <span className="text-amber-400 font-bold font-mono">{species.fossilFormation || 'Unspecified'}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-mono uppercase font-bold text-[10px] tracking-widest flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-amber-400" /> Excavation Field Notes
                </span>
                <p className="text-slate-300 leading-relaxed italic font-serif text-xs sm:text-sm pl-4 border-l border-amber-500/30">
                  "{species.discoveryHistory || 'Fossilized specimens cataloged in official paleontology archives.'}"
                </p>
              </div>

              {species.dietDetails && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-mono uppercase font-bold text-[10px] tracking-widest flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-amber-400" /> Dietary Adaptation &amp; Trophic Niche
                  </span>
                  <p className="text-slate-200 leading-relaxed font-sans text-xs sm:text-sm pl-4 border-l border-amber-500/30">
                    <span className="text-emerald-400 font-semibold mr-1.5">{formatEnumLabel(species.dietType || species.diet)} &mdash;</span>
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
              <Dna className="h-4 w-4 text-amber-400" /> Taxonomic Classification
            </h3>

            <TaxonomyBreadcrumbs
              taxonomy={species.taxonomy}
              taxonomicClassification={species.taxonomicClassification}
            />

            {/* Cladistic & Evolutionary Lineage Monograph */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2 font-mono text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1.5">
                <Dna className="h-3.5 w-3.5 text-amber-400" /> Evolutionary Lineage &amp; Extant Relatives
              </span>
              <div className="space-y-2 text-xs font-sans">
                {species.clade === 'Theropod' ? (
                  <div className="space-y-3">
                    <div className="border-l-2 border-amber-500/60 pl-3 py-0.5 space-y-0.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                        Surviving Avian Theropods
                      </span>
                      <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-sans">
                        Modern Birds (<em className="font-mono text-amber-200/90 not-italic">Aves / Neornithes</em>) are direct surviving avian theropod dinosaurs.
                      </p>
                    </div>
                    <div className="border-l-2 border-cyan-500/60 pl-3 py-0.5 space-y-0.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                        Non-Dinosaurian Sister Outgroup
                      </span>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                        Crocodilians (Crocodiles, Alligators &amp; Gharials) form the extant sister lineage of Archosauria.
                      </p>
                    </div>
                  </div>
                ) : ['Sauropod', 'Sauropodomorph', 'Ornithischian'].includes(species.clade) ? (
                  <div className="space-y-3">
                    <div className="border-l-2 border-amber-500/60 pl-3 py-0.5 space-y-0.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                        Surviving Dinosaur Lineage
                      </span>
                      <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-sans">
                        Modern Birds (<em className="font-mono text-amber-200/90 not-italic">Aves</em>) are the only surviving clade of Dinosauria.
                      </p>
                    </div>
                    <div className="border-l-2 border-cyan-500/60 pl-3 py-0.5 space-y-0.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                        Non-Dinosaurian Outgroup
                      </span>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                        Crocodilians represent the closest extant non-dinosaurian archosaurs.
                      </p>
                    </div>
                  </div>
                ) : (
                  (() => {
                    const rawRel: any = species.extantRelatives || species.closestLivingRelatives;
                    let rel: any = rawRel;
                    if (typeof rawRel === 'string') {
                      try {
                        rel = JSON.parse(rawRel);
                      } catch {
                        rel = null;
                      }
                    }

                    const isStructured = rel && typeof rel === 'object' && !Array.isArray(rel);
                    const groupsText = isStructured && Array.isArray(rel.groups) && rel.groups.length > 0
                      ? rel.groups.join(' • ')
                      : (Array.isArray(rel) && rel.length > 0 ? rel.join(' • ') : null);

                    const rationaleText = isStructured && typeof rel.rationale === 'string' ? rel.rationale : null;

                    if (!groupsText && !rationaleText) {
                      return (
                        <p className="text-slate-400 text-xs italic pl-3 border-l-2 border-slate-700 py-0.5 font-sans">
                          Extinct prehistoric lineage without immediate extant crown descendants.
                        </p>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {groupsText && (
                          <div className="border-l-2 border-amber-500/60 pl-3 py-0.5 space-y-0.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                              Closest Extant Relatives
                            </span>
                            <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed font-sans">
                              {groupsText}
                            </p>
                          </div>
                        )}
                        {rationaleText && (
                          <div className="border-l-2 border-cyan-500/60 pl-3 py-0.5 space-y-0.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                              Phylogenetic Placement
                            </span>
                            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                              {rationaleText}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>

          {/* Scientific Key Facts Monograph */}
          {species.interestingFacts && species.interestingFacts.length > 0 && (
            <div className="museum-plinth rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-400" /> Diagnostic Traits &amp; Paleobiology
                </h3>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  {species.interestingFacts.length} traits
                </span>
              </div>

              <div className="space-y-2">
                {species.interestingFacts.map((fact, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-900/60 rounded-lg border border-white/[0.05] text-xs font-sans text-slate-300 leading-relaxed flex items-start gap-3 transition-colors hover:border-amber-500/20"
                  >
                    <span className="font-mono text-amber-400 font-bold text-xs shrink-0 select-none">
                      {(i + 1).toString().padStart(2, '0')}.
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed text-slate-200">{fact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Citations & Literature */}
          {species.sources && species.sources.length > 0 && (
            <div className="museum-plinth rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-3 shadow-xl">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2 border-b border-white/[0.08] pb-2.5">
                <BookOpen className="h-4 w-4 text-amber-400" /> References &amp; Academic Literature
              </h3>

              <div className="space-y-2 font-mono text-xs">
                {species.sources.map((src, i) => (
                  <div
                    key={i}
                    className="p-2.5 px-3 bg-slate-900/60 rounded-lg border border-white/[0.05] text-xs font-mono text-slate-400 flex items-center justify-between gap-3"
                  >
                    <span className="truncate">{src.citation}</span>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400/90 hover:text-amber-300 flex items-center gap-1 font-bold uppercase tracking-wider shrink-0 text-[10px] transition-colors"
                      >
                        Source <ExternalLink className="h-3 w-3" />
                      </a>
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
              <Compass className="h-4 w-4 text-amber-400" /> Coexisting Species
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
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-950/90 backdrop-blur-md rounded text-[9px] font-mono font-bold tracking-wider text-amber-400 border border-white/[0.08]">
                        {formatEnumLabel(rel.clade) || 'Prehistoric'}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold font-sans text-slate-100 group-hover:text-amber-400 transition-colors uppercase truncate">
                        {names.heading}
                      </h4>
                      <p className="text-[11px] font-serif italic text-amber-400/90 truncate">
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

