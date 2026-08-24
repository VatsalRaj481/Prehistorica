import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSpeciesById, Species } from '../services/api.js';
import TaxonomyBreadcrumbs from '../components/TaxonomyBreadcrumbs.js';
import SizeComparisonSilhouette from '../components/SizeComparisonSilhouette.js';
import ConfidenceBadge from '../components/ConfidenceBadge.js';
import MediaGallery from '../components/MediaGallery.js';
import { Calendar, Compass, ArrowLeft, ArrowRight, Dna, FileText, Scale, BookOpen, AlertCircle, Bookmark, BookmarkCheck, ExternalLink, Globe, Layers, Zap } from 'lucide-react';

export default function SpeciesDetail() {
  const { id } = useParams<{ id: string }>();
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchSpeciesById(parseInt(id, 10))
      .then((data) => {
        setSpecies(data);
        document.title = `${data.name} (${data.scientificName}) | Prehistorica Encyclopedia`;

        // Check if bookmarked in localStorage
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
    <div className="space-y-12">
      {/* Navigation Top Bar */}
      <div className="flex justify-between items-center border-b border-slate-850 pb-4">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Browse Catalog
        </Link>

        <button
          onClick={toggleBookmark}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isBookmarked
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
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
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
        {/* Left Column: Media Gallery Carousel & Size Silhouette */}
        <div className="lg:col-span-6 space-y-6">
          <MediaGallery
            media={species.media}
            reconstructionImageUrl={species.reconstructionImageUrl}
            fossilImageUrl={species.fossilImageUrl}
            speciesName={species.name}
          />

          {/* Size Comparison Graphic */}
          <SizeComparisonSilhouette
            speciesName={species.name}
            lengthM={species.lengthM}
            heightM={species.heightM}
            weightKg={species.weightKg}
            clade={species.clade}
          />
        </div>

        {/* Right Column: Species Specs, Taxonomy, Size Notes */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-3 border-b border-slate-800 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <Calendar className="h-3.5 w-3.5" />
                {species.timePeriod} &bull; {species.myaStart}–{species.myaEnd} MYA
              </div>
              <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
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

          {/* Interactive Taxonomy Breadcrumbs */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Dna className="h-4 w-4 text-indigo-400" /> Full Classification Rank
            </h3>
            <TaxonomyBreadcrumbs
              taxonomy={species.taxonomy}
              taxonomicClassification={species.taxonomicClassification}
            />
          </div>

          {/* Size Specifications Card with Confidence Badges */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-blue-400" /> Physical Measurements & Confidence Ratings
            </h3>
            
            <div className="grid grid-cols-3 gap-3 border-b border-slate-800 pb-4 text-center">
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Length</span>
                <p className="text-xl font-extrabold text-blue-400">
                  {species.lengthM ? `${species.lengthM} m` : 'Unknown'}
                </p>
                <ConfidenceBadge confidence={lengthConf} />
              </div>
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Height</span>
                <p className="text-xl font-extrabold text-blue-400">
                  {species.heightM ? `${species.heightM} m` : 'Unknown'}
                </p>
                <ConfidenceBadge confidence={heightConf} />
              </div>
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Mass</span>
                <p className="text-xl font-extrabold text-blue-400">
                  {species.weightKg ? `${species.weightKg.toLocaleString()} kg` : 'Unknown'}
                </p>
                <ConfidenceBadge confidence={weightConf} />
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed italic">
              <strong className="font-semibold text-slate-300 not-italic">Measurement Notes:</strong> {species.sizeNotes}
            </p>
          </div>

          {/* Paleo-ecological Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Diet & Habitat</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold capitalize">
                  {species.diet}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold capitalize">
                  {species.habitat.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{species.dietDetails}</p>
            </div>
            
            <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Geographic Range & Fossil Formation</span>
              <div className="text-xs text-slate-200 font-semibold flex items-center gap-1.5 mt-1">
                <Globe className="h-3.5 w-3.5 text-blue-400" />
                {species.fossilFormation ? `${species.fossilFormation} (${species.country || 'Global'})` : 'Geologic Formation Record'}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {species.locations.map((loc) => (
                  <span key={loc} className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-855 text-xs text-slate-300">
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Extinction Context & Closest Living Relatives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" /> Extinction Event / Context
              </span>
              <p className="text-xs font-bold text-slate-300">
                {species.extinctionEvent || 'End of geologic epoch'}
              </p>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1">
                <Dna className="h-3 w-3 text-emerald-400" /> Closest Living Relatives
              </span>
              <div className="flex flex-wrap gap-1">
                {(species.closestLivingRelatives && species.closestLivingRelatives.length > 0
                  ? species.closestLivingRelatives
                  : ['Modern Birds (Aves)', 'Crocodilians']
                ).map(rel => (
                  <span key={rel} className="text-xs text-slate-300 font-medium bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {rel}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discovery History & Distinctive Fun Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-slate-900">
        {/* Discovery History */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" /> Holotype & Discovery History
          </h2>
          <ul className="space-y-3">
            {species.discoveryHistory.split('\n').filter(line => line.trim()).map((bullet, index) => (
              <li key={index} className="flex gap-3 text-sm text-slate-350 leading-relaxed align-top">
                <span className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <span>{bullet.replace(/^[•\-\*\s]+/, '')}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Distinctive Fun Facts */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" /> Distinctive Key Scientific Facts
          </h2>
          <ul className="space-y-3">
            {species.interestingFacts.map((fact, index) => (
              <li key={index} className="flex gap-3 text-sm text-slate-350 leading-relaxed align-top">
                <span className="h-2 w-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* References List Section */}
      <div className="space-y-4 pt-6 border-t border-slate-900">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Layers className="h-5 w-5 text-emerald-400" /> Required Scientific References & Sources
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(species.sources && species.sources.length > 0 ? species.sources : [
            { citation: 'Paleobiology Database (PBDB) taxonomical specimen archive', url: 'https://paleobiodb.org' },
            { citation: `${species.scientificName} description in peer-reviewed paleontological literature`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(species.name)}` }
          ]).map((src, i) => (
            <a
              key={i}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl transition-all flex justify-between items-center group"
            >
              <div className="space-y-1 min-w-0 pr-2">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                  {src.citation}
                </div>
                <div className="text-[10px] text-slate-500 truncate">{src.url}</div>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Similar / Related Species Section */}
      <div className="space-y-4 pt-6 border-t border-slate-900">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Compass className="h-5 w-5 text-blue-400" /> Similar Prehistoric Species ({species.clade})
        </h2>
        {species.relatedSpecies && species.relatedSpecies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {species.relatedSpecies.map((rel) => (
              <Link
                key={rel.id}
                to={`/species/${rel.id}`}
                className="group bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-755 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="h-28 bg-slate-950 overflow-hidden flex items-center justify-center p-2 border-b border-slate-900 relative">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                  {rel.reconstructionImageUrl ? (
                    <img
                      src={rel.reconstructionImageUrl}
                      alt={rel.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-103 transition-transform duration-300 drop-shadow z-10"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-655 text-[10px] bg-slate-950">
                      No Illustration
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                    {rel.name}
                  </h4>
                  <p className="text-[10px] italic text-slate-400 mt-0.5">
                    {rel.scientificName}
                  </p>
                </div>
                <div className="px-3 py-2 bg-slate-950/40 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between items-center">
                  <span>{rel.clade || rel.dietType}</span>
                  <span className="flex items-center gap-0.5 hover:text-white transition-colors">
                    Profile <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No closely related species cataloged in current records.</p>
        )}
      </div>
    </div>
  );
}

