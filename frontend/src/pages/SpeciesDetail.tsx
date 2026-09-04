import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { fetchSpeciesById, Species } from '../services/api.js';
import TaxonomyBreadcrumbs from '../components/TaxonomyBreadcrumbs.js';
import TwoDScaleViewer from '../components/TwoDScaleViewer.js';
import MediaGallery from '../components/MediaGallery.js';
import { Calendar, Compass, ArrowLeft, Dna, FileText, Scale, BookOpen, AlertCircle, Bookmark, BookmarkCheck, ExternalLink, Globe, Zap } from 'lucide-react';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';
import { formatFeetLong } from '../utils/formatDimensions.js';

export default function SpeciesDetail() {
  const { id } = useParams<{ id: string }>();
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchSpeciesById(parseInt(id, 10))
      .then((data) => {
        setSpecies(data);
        document.title = `${data.name} (${data.scientificName}) | Prehistorica Museum Exhibit`;

        try {
          const favs = JSON.parse(localStorage.getItem('prehistorica_favorites') || '[]');
          setIsBookmarked(favs.includes(data.id));
        } catch {
          setIsBookmarked(false);
        }

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
    try {
      const favs: number[] = JSON.parse(localStorage.getItem('prehistorica_favorites') || '[]');
      let updated: number[];
      if (favs.includes(species.id)) {
        updated = favs.filter(i => i !== species.id);
        setIsBookmarked(false);
      } else {
        updated = [...favs, species.id];
        setIsBookmarked(true);
      }
      localStorage.setItem('prehistorica_favorites', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
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
      <div className="animate-pulse space-y-8 py-6">
        <div className="h-6 w-48 bg-slate-900 rounded border border-white/[0.06]" />
        <div className="h-[450px] bg-slate-950 rounded-xl border border-white/[0.06]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 h-96 bg-slate-900 rounded-xl border border-white/[0.06]" />
          <div className="lg:col-span-6 h-96 bg-slate-900 rounded-xl border border-white/[0.06]" />
        </div>
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
          to="/browse"
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
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4 text-amber-400" /> Catalog Index
            </Link>
          </motion.div>
          <span className="text-slate-700">|</span>
          <span className="text-amber-400 font-bold uppercase tracking-widest text-[11px]">
            Specimen #{species.id.toString().padStart(4, '0')}
          </span>
        </div>

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
      </div>

      {/* Main Specimen Title & Classification Headline */}
      {(() => {
        const names = getSpeciesDisplayNames(species);
        return (
          <div className="space-y-3 sm:space-y-4 border-l-2 border-amber-500 pl-3 sm:pl-5">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1.5 rounded-md text-[10px] sm:text-xs">
                <Calendar className="h-3.5 w-3.5" />
                {species.timePeriod} &bull; {species.myaStart}–{species.myaEnd} MYA
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-white/[0.08] text-slate-300 font-bold uppercase tracking-widest rounded-md text-[10px] sm:text-xs">
                Clade: {species.clade}
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-white/[0.08] text-amber-300/90 font-bold uppercase tracking-widest rounded-md text-[10px] sm:text-xs">
                Status: {species.taxonomicStatus}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-100 uppercase break-words leading-tight sm:leading-none font-sans">
              {names.heading}
            </h1>
            <p className="text-sm sm:text-lg italic font-mono text-amber-400">
              {names.subheading}
            </p>

            {species.nameMeaning && (
              <p className="text-xs font-mono text-slate-400 leading-relaxed border-t border-white/[0.08] pt-2 sm:pt-3">
                <strong className="font-bold text-amber-400 uppercase tracking-widest">Etymology & Translation:</strong> "{species.nameMeaning}"
              </p>
            )}
          </div>
        );
      })()}

      {/* 3D Scale Specimen Stage */}
      {/* 2D Silhouette Scale Comparison Stage */}
      <TwoDScaleViewer
        speciesName={species.name}
        scientificName={species.scientificName}
        lengthM={species.lengthM}
        heightM={species.heightM}
        weightKg={species.weightKg}
        clade={species.clade}
        silhouette={species.comparisonSilhouette}
      />

      {/* Architectural Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        <div className="museum-card py-3.5 px-4 rounded-xl space-y-1 text-center shadow-md border border-white/[0.06]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-amber-400" /> Total Length
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400">
            {formatFeetLong(species.lengthM)}
          </p>
        </div>

        <div className="museum-card py-3.5 px-4 rounded-xl space-y-1 text-center shadow-md border border-white/[0.06]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-amber-400" /> Standing Height
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400">
            {formatFeetLong(species.heightM)}
          </p>
        </div>

        <div className="museum-card py-3.5 px-4 rounded-xl space-y-1 text-center shadow-md border border-white/[0.06]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-amber-400" /> Estimated Mass
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400">
            {species.weightKg ? `${species.weightKg.toLocaleString()} KG` : 'Disputed'}
          </p>
        </div>
      </div>

      {/* Specimen Deep Dive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Media Reconstruction & Visual Archive */}
        <div className="lg:col-span-6 space-y-5">
          <div className="glass-panel rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-3 shadow-xl">
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
          <div className="glass-panel rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-3 shadow-xl">
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
            </div>
          </div>
        </div>

        {/* Right Column: Taxonomy Rank, Scientific Facts & Literature */}
        <div className="lg:col-span-6 space-y-5">
          {/* Architectural Taxonomic Hierarchy */}
          <div className="glass-panel rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-3 shadow-xl">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2 border-b border-white/[0.08] pb-2.5">
              <Dna className="h-4 w-4 text-amber-400" /> Structural Taxonomic Hierarchy
            </h3>

            <TaxonomyBreadcrumbs
              taxonomy={species.taxonomy}
              taxonomicClassification={species.taxonomicClassification}
            />
          </div>

          {/* Scientific Key Facts Monograph */}
          {species.interestingFacts && species.interestingFacts.length > 0 && (
            <div className="glass-panel rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-3 shadow-xl">
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
            <div className="glass-panel rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-3 shadow-xl">
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
                      <motion.a
                        whileTap={{ scale: 0.92 }}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold uppercase tracking-wider shrink-0 text-[10px]"
                      >
                        View Source <ExternalLink className="h-3 w-3" />
                      </motion.a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-Width Horizontal Coexisting Species Ribbon */}
      {species.relatedSpecies && species.relatedSpecies.length > 0 && (
        <div className="glass-panel rounded-xl p-6 border border-white/[0.08] space-y-4 shadow-2xl">
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
                <Link
                  key={rel.id}
                  to={`/species/${rel.id}`}
                  className="group museum-card rounded-xl p-3 flex flex-col justify-between w-64 sm:w-72 shrink-0 snap-start shadow-lg overflow-hidden"
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
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

