import { Fragment, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSpeciesById, Species } from '../services/api.js';
import { Calendar, Compass, ArrowLeft, ArrowRight, Dna, FileText, Scale, BookOpen, AlertCircle } from 'lucide-react';

export default function SpeciesDetail() {
  const { id } = useParams<{ id: string }>();
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchSpeciesById(parseInt(id, 10))
      .then((data) => {
        setSpecies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load species profile details.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8 py-6">
        <div className="h-6 w-32 bg-slate-900 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 bg-slate-900 rounded-xl" />
          <div className="lg:col-span-5 h-96 bg-slate-900 rounded-xl" />
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

  return (
    <div className="space-y-12">
      {/* Back button */}
      <div>
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Browse Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
        {/* Left Column: Images Block */}
        <div className="lg:col-span-6 space-y-6">
          {/* Primary Image: Reconstruction */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-3 border-b border-slate-800/80 bg-slate-900/50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300">Life Reconstruction</span>
              <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded">Primary</span>
            </div>
            <div className="relative h-64 sm:h-96 bg-slate-950">
              {species.reconstructionImageUrl ? (
                <img
                  src={species.reconstructionImageUrl}
                  alt={`${species.name} life reconstruction`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-sm bg-slate-950 p-6 text-center">
                  <Dna className="h-12 w-12 text-slate-700 mb-2" />
                  Life reconstruction image is not available for this species.
                </div>
              )}
            </div>
          </div>

          {/* Secondary Image: Fossil Skeletal Record */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-3 border-b border-slate-800/80 bg-slate-900/50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300">Fossil Skeleton Specimen</span>
              <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 font-semibold px-2 py-0.5 rounded">Secondary</span>
            </div>
            <div className="relative h-48 sm:h-64 bg-slate-950">
              {species.fossilImageUrl ? (
                <img
                  src={species.fossilImageUrl}
                  alt={`${species.name} fossil skeletal specimen`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs bg-slate-950 p-6 text-center">
                  <Dna className="h-10 w-10 text-slate-700 mb-2" />
                  Fossil record skeleton specimen image not available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Taxonomy, Size Specs, General Info */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-2 border-b border-slate-800 pb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Calendar className="h-3.5 w-3.5" />
              {species.timePeriod} &bull; {species.myaStart}–{species.myaEnd} Million Years Ago
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-100 mt-2">
              {species.name}
            </h1>
            <p className="text-base italic text-slate-300">
              {species.scientificName}
            </p>
            <p className="text-xs text-slate-400 pt-1">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Name Meaning:</span> "{species.nameMeaning}"
            </p>
          </div>

          {/* Size Specifications Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-blue-400" /> Size & Weight Estimations
            </h3>
            
            <div className="grid grid-cols-3 gap-4 border-b border-slate-800 pb-4 text-center">
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Length</span>
                <p className="text-xl font-extrabold text-blue-400 mt-1">
                  {species.lengthM ? `${species.lengthM} m` : 'Unknown'}
                </p>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Height</span>
                <p className="text-xl font-extrabold text-blue-400 mt-1">
                  {species.heightM ? `${species.heightM} m` : 'Unknown'}
                </p>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Mass</span>
                <p className="text-xl font-extrabold text-blue-400 mt-1">
                  {species.weightKg ? `${species.weightKg.toLocaleString()} kg` : 'Unknown'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed italic">
              <span className="font-semibold text-slate-300 not-italic">Scientific Note:</span> {species.sizeNotes}
            </p>
          </div>

          {/* Taxonomy classification tree */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Dna className="h-4 w-4 text-indigo-400" /> Taxonomic Classification
            </h3>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-2 items-center text-xs text-slate-350">
              {species.taxonomicClassification.split('->').map((taxon, index, array) => (
                <Fragment key={taxon}>
                  <span className={`px-2.5 py-1 rounded bg-slate-950/50 border border-slate-850 font-medium ${index === array.length - 1 ? 'text-indigo-400 border-indigo-500/20 font-bold' : ''}`}>
                    {taxon.trim()}
                  </span>
                  {index < array.length - 1 && <span className="text-slate-600 font-bold">&rarr;</span>}
                </Fragment>
              ))}
            </div>
          </div>

          {/* Diet & Location overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Diet Classification</span>
              <p className="text-sm font-semibold text-slate-200">{species.dietType}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{species.dietDetails}</p>
            </div>
            
            <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Geographic Distribution</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {species.locations.map((loc) => (
                  <span key={loc} className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-855 text-xs text-slate-300">
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discovery History & Interesting Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-slate-900">
        {/* Discovery History */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" /> Discovery History
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

        {/* Interesting Facts */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" /> Key Scientific Facts
          </h2>
          <ul className="space-y-3">
            {species.interestingFacts.map((fact, index) => (
              <li key={index} className="flex gap-3 text-sm text-slate-350 leading-relaxed align-top">
                <span className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Related Species Section */}
      <div className="space-y-4 pt-6 border-t border-slate-900">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Compass className="h-5 w-5 text-blue-400" /> Related Prehistoric Species
        </h2>
        {species.relatedSpecies && species.relatedSpecies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {species.relatedSpecies.map((rel) => (
              <Link
                key={rel.id}
                to={`/species/${rel.id}`}
                className="group bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-755 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="h-28 bg-slate-950 overflow-hidden">
                  {rel.reconstructionImageUrl ? (
                    <img
                      src={rel.reconstructionImageUrl}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
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
                  <span>{rel.dietType}</span>
                  <span className="flex items-center gap-0.5 hover:text-white transition-colors">
                    Profile <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No closely related taxonomic sister species cataloged in current records.</p>
        )}
      </div>
    </div>
  );
}
