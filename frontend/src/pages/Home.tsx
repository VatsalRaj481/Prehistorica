import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCreatureOfTheDay, Species } from '../services/api.js';
import { Calendar, ArrowRight, Dna, Map, ShieldAlert, Sparkles, Scale, Compass } from 'lucide-react';

export default function Home() {
  const [creature, setCreature] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  return (
    <div className="space-y-16">
      {/* Hero Welcome Section */}
      <section className="text-center max-w-3xl mx-auto py-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="h-3 w-3" /> Earth's Deep Time Archives
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
          Prehistoric Fauna Encyclopedia
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
          Embark on an immersive journey across geological eras. Unearth verified facts, scientific measurements, and rich reconstructions of creatures that ruled the earth millions of years ago.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            to="/browse"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-2 text-sm"
          >
            Explore Catalog <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/map"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-all border border-slate-700 hover:border-slate-600 flex items-center gap-2 text-sm"
          >
            <Map className="h-4 w-4" /> View Time Map
          </Link>
        </div>
      </section>

      {/* Creature of the Day Hero Banner */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Calendar className="h-5 w-5 text-blue-400" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">
            Creature of the Day
          </h2>
          <span className="text-xs text-slate-500 ml-auto bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            Determined Daily (UTC)
          </span>
        </div>

        {loading ? (
          <div className="animate-pulse bg-slate-900 border border-slate-800 rounded-2xl h-96 flex items-center justify-center">
            <div className="text-slate-500 text-sm">Excavating daily archives...</div>
          </div>
        ) : error || !creature ? (
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-8 text-center text-red-400 flex flex-col items-center gap-2">
            <ShieldAlert className="h-10 w-10 text-red-500" />
            <p className="font-semibold">{error || 'Creature not found'}</p>
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl hover:border-slate-700/60 transition-all group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
              {/* Image Hero Container */}
              <div className="lg:col-span-7 relative h-64 sm:h-96 rounded-xl overflow-hidden bg-slate-950 border border-slate-850 group-hover:border-slate-800 transition-all">
                {creature.reconstructionImageUrl ? (
                  <img
                    src={creature.reconstructionImageUrl}
                    alt={creature.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-sm bg-slate-950">
                    <Dna className="h-12 w-12 text-slate-600 mb-2" />
                    Reconstruction illustration not available
                  </div>
                )}
                {/* Geologic Era Badge overlay */}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-semibold text-blue-400 shadow-md">
                  {creature.timePeriod} ({creature.myaStart}–{creature.myaEnd} MYA)
                </div>
              </div>

              {/* Specs & Facts Container */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
                      {creature.name}
                    </h3>
                    <p className="text-sm italic text-slate-400">
                      {creature.scientificName} &bull; "{creature.nameMeaning}"
                    </p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
                    {creature.dietDetails} {creature.discoveryHistory}
                  </p>

                  {/* Size Stat Block */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-850">
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
                    <span>{creature.dietType}</span>
                  </div>
                  <Link
                    to={`/species/${creature.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-750 text-xs font-semibold"
                  >
                    View Full Profile <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Feature Cards Showcase */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Compass className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Browse the Catalog</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Search our collection of verified prehistoric species. Filter by diet classification, global continent locations, or geologic eras.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Start Browsing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Map className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Interactive Geologic Map</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Travel through geological time. Pick a prehistoric period and click on continental regions to see which species roamed there.
          </p>
          <Link
            to="/map"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Launch Map <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
