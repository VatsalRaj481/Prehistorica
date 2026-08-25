import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { fetchSpeciesById, Species } from '../services/api.js';
import TaxonomyBreadcrumbs from '../components/TaxonomyBreadcrumbs.js';
import SizeComparisonSilhouette from '../components/SizeComparisonSilhouette.js';
import ConfidenceBadge from '../components/ConfidenceBadge.js';
import MediaGallery from '../components/MediaGallery.js';
import { Calendar, Compass, ArrowLeft, Dna, FileText, Scale, BookOpen, AlertCircle, Bookmark, BookmarkCheck, ExternalLink, Globe, Zap } from 'lucide-react';

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
        document.title = `${data.name} (${data.scientificName}) | Prehistorica Encyclopedia`;

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
        setError('Failed to load species profile details.');
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
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 350, damping: 26 }
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8 py-6">
        <div className="h-6 w-32 bg-slate-900 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 h-96 bg-slate-900 rounded-2xl" />
          <div className="lg:col-span-6 h-96 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !species) {
    return (
      <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-12 text-center text-red-400 flex flex-col items-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold">Profile Unavailable</h2>
        <p className="text-sm max-w-md">{error || 'The requested prehistoric species could not be found.'}</p>
        <Link
          to="/browse"
          className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-750 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const lengthConf = species.sizeEstimate?.length?.confidence || (species.lengthM ? 'well-supported' : 'estimated');
  const heightConf = species.sizeEstimate?.height?.confidence || (species.heightM ? 'well-supported' : 'estimated');
  const weightConf = species.sizeEstimate?.weight?.confidence || (species.weightKg ? 'estimated' : 'disputed');

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="space-y-12"
    >
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
        <motion.div whileTap={{ scale: 0.94 }}>
          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Browse Catalog
          </Link>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleBookmark}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
            isBookmarked
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-slate-900/80 backdrop-blur-md border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          {isBookmarked ? (
            <>
              <BookmarkCheck className="h-4 w-4 text-amber-400" /> Bookmarked in Favorites
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4 text-slate-400" /> Bookmark Species
            </>
          )}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
        <div className="lg:col-span-6 space-y-6">
          <MediaGallery
            media={species.media}
            reconstructionImageUrl={species.reconstructionImageUrl}
            fossilImageUrl={species.fossilImageUrl}
            speciesName={species.name}
          />

          <SizeComparisonSilhouette
            speciesName={species.name}
            lengthM={species.lengthM}
            heightM={species.heightM}
            weightKg={species.weightKg}
            clade={species.clade}
          />
        </div>

        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-3 border-b border-slate-800 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <Calendar className="h-3.5 w-3.5" />
                {species.timePeriod} &bull; {species.myaStart}–{species.myaEnd} MYA
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                {species.clade}
              </span>
              <ConfidenceBadge status={species.taxonomicStatus} type="taxonomic" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-100 mt-2">
              {species.name}
            </h1>
            <p className="text-base italic text-slate-300">
              {species.scientificName}
            </p>
            <p className="text-xs text-slate-400 pt-1 leading-relaxed">
              <strong className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Etymology:</strong> "{species.nameMeaning}"
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Dna className="h-4 w-4 text-indigo-400" /> Full Classification Rank
            </h3>
            <TaxonomyBreadcrumbs
              taxonomy={species.taxonomy}
              taxonomicClassification={species.taxonomicClassification}
            />
          </div>

          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-blue-400" /> Physical Measurements & Confidence Ratings
            </h3>
            
            <div className="grid grid-cols-3 gap-3 border-b border-slate-800 pb-4 text-center">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Length</span>
                <p className="text-xl font-extrabold text-blue-400">
                  {species.lengthM ? `${species.lengthM} m` : 'Unknown'}
                </p>
                <ConfidenceBadge confidence={lengthConf} />
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Height</span>
                <p className="text-xl font-extrabold text-blue-400">
                  {species.heightM ? `${species.heightM} m` : 'Unknown'}
                </p>
                <ConfidenceBadge confidence={heightConf} />
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Weight</span>
                <p className="text-xl font-extrabold text-blue-400">
                  {species.weightKg ? `${species.weightKg.toLocaleString()} kg` : 'Unknown'}
                </p>
                <ConfidenceBadge confidence={weightConf} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Globe className="h-3 w-3 text-emerald-400" /> Geographic Range
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {species.geographicRange?.region || species.country || 'Global distribution'} &bull; {species.fossilFormation || 'Various Formations'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Compass className="h-3 w-3 text-amber-400" /> Discovery Details
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {species.discoveryHistory || 'Fossilized remains documented in paleontology catalog.'}
                </p>
              </div>
            </div>
          </div>

          {species.interestingFacts && species.interestingFacts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-400" /> Distinctive Key Scientific Facts
              </h3>
              <ul className="space-y-2">
                {species.interestingFacts.map((fact, i) => (
                  <li
                    key={i}
                    className="p-3 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl text-xs text-slate-300 leading-relaxed flex items-start gap-2.5 shadow-sm"
                  >
                    <Zap className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {species.sources && species.sources.length > 0 && (
            <div className="space-y-3 border-t border-slate-800/80 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-400" /> Academic & Literature Sources
              </h3>
              <div className="space-y-2">
                {species.sources.map((src, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/60 border border-slate-855 rounded-xl text-xs text-slate-400 flex items-center justify-between gap-3 shadow-inner"
                  >
                    <span className="truncate">{src.citation}</span>
                    {src.url && (
                      <motion.a
                        whileTap={{ scale: 0.92 }}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold shrink-0"
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
    </motion.div>
  );
}
