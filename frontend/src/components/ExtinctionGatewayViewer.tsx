import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MASS_EXTINCTIONS,
  MassExtinctionEvent,
  KillMechanism
} from '../data/extinctionData.js';
import {
  Skull,
  ShieldAlert,
  Flame,
  Snowflake,
  Waves,
  Zap,
  Sparkles,
  ExternalLink,
  MessageSquare,
  HeartCrack,
  Dna
} from 'lucide-react';

interface ExtinctionGatewayViewerProps {
  selectedExtinctionId: string;
  onSelectExtinction: (id: string) => void;
  onAskRajy?: (prompt: string) => void;
  events?: MassExtinctionEvent[];
  isDatabaseSource?: boolean;
}

export default function ExtinctionGatewayViewer({
  selectedExtinctionId,
  onSelectExtinction,
  onAskRajy,
  events,
  isDatabaseSource: _isDatabaseSource = false,
}: ExtinctionGatewayViewerProps) {
  const list: MassExtinctionEvent[] =
    events && events.length > 0 ? (events as MassExtinctionEvent[]) : MASS_EXTINCTIONS;
  const currentEvent: MassExtinctionEvent =
    list.find(
      (e) =>
        (e.slug && e.slug === selectedExtinctionId) ||
        (e.id && String(e.id) === selectedExtinctionId)
    ) || list[2];

  const getCategoryIcon = (cat: KillMechanism['category']) => {
    switch (cat) {
      case 'Volcanism':
        return <Flame className="h-4 w-4 text-orange-400" />;
      case 'Impact':
        return <Zap className="h-4 w-4 text-yellow-400" />;
      case 'Glaciation':
        return <Snowflake className="h-4 w-4 text-cyan-400" />;
      case 'Anoxia':
      case 'Acidification':
        return <Waves className="h-4 w-4 text-emerald-400" />;
      case 'Hyperthermal':
        return <Flame className="h-4 w-4 text-red-400" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-rose-400" />;
    }
  };

  const getSpeciesLoss = (e: any) => e?.casualtyStats?.speciesLossPercent ?? e?.speciesLossPercent ?? 0;
  const getMarineLoss = (e: any) => e?.casualtyStats?.marineGeneraLossPercent ?? e?.marineGeneraLossPercent ?? 0;
  const getTerrestrialLoss = (e: any) => e?.casualtyStats?.terrestrialLossPercent ?? e?.terrestrialLossPercent ?? 0;
  const getDuration = (e: any) => e?.casualtyStats?.estimatedDuration ?? e?.estimatedDuration ?? '';

  const killMechanisms: KillMechanism[] = Array.isArray(currentEvent?.killMechanisms)
    ? currentEvent.killMechanisms
    : typeof currentEvent?.killMechanisms === 'string'
    ? (() => { try { return JSON.parse(currentEvent.killMechanisms); } catch { return []; } })()
    : [];

  const decimatedClades: any[] = Array.isArray(currentEvent?.decimatedClades)
    ? currentEvent.decimatedClades
    : typeof currentEvent?.decimatedClades === 'string'
    ? (() => { try { return JSON.parse(currentEvent.decimatedClades); } catch { return []; } })()
    : [];

  const survivorsAndRadiators: any[] = Array.isArray(currentEvent?.survivorsAndRadiators)
    ? currentEvent.survivorsAndRadiators
    : typeof currentEvent?.survivorsAndRadiators === 'string'
    ? (() => { try { return JSON.parse(currentEvent.survivorsAndRadiators); } catch { return []; } })()
    : [];

  return (
    <div id="extinction-dossier" className="space-y-6">
      {/* Selector Navigation Plinths for the Big Five */}
      <div className="flex lg:grid overflow-x-auto lg:overflow-visible pb-2.5 lg:pb-0 scrollbar-none snap-x snap-mandatory lg:grid-cols-5 gap-2.5">
        {list.map((event: any) => {
          const eventKey = event.slug || event.id;
          const isSelected =
            eventKey === currentEvent.slug ||
            (event.id && event.id === currentEvent.id) ||
            (event.slug && event.slug === currentEvent.slug);
          return (
            <button
              key={eventKey}
              onClick={() => onSelectExtinction(event.slug || String(event.id))}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer flex-shrink-0 w-[240px] sm:w-[260px] lg:w-auto snap-start ${
                isSelected
                  ? 'bg-slate-900 border-rose-500/70 shadow-[0_0_20px_rgba(244,63,94,0.2)] ring-1 ring-rose-500/50'
                  : 'bg-slate-900/60 hover:bg-slate-850 border-white/[0.08] hover:border-white/[0.2]'
              }`}
            >
              {/* Subtle accent bar on top */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 transition-opacity ${
                  isSelected ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 opacity-100' : 'opacity-0'
                }`}
              />

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span className="font-bold text-amber-400">{event.period}</span>
                <span>{event.peakAgeMa} Ma</span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold font-sans text-slate-100 group-hover:text-white line-clamp-1">
                {event.name}
              </h4>

              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-rose-400 font-mono font-bold">
                  -{getSpeciesLoss(event)}% Taxa
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {event.epoch}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Selected Event Post-Mortem Dossier */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-slate-900/90 border border-white/[0.1] rounded-2xl p-5 sm:p-8 space-y-8 shadow-2xl backdrop-blur-2xl"
        >
          {/* Hero Banner Header */}
          <div className="space-y-4 pb-6 border-b border-white/[0.08]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                  <Skull className="h-3.5 w-3.5" />
                  Global Extinction Gateway
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-white/[0.06]">
                  {currentEvent.ageSpanLabel}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Peak at {currentEvent.peakAgeMa} Ma
                </span>
              </div>

              {/* Consultation with Rajy Button */}
              {onAskRajy && (
                <button
                  onClick={() => onAskRajy(currentEvent.rajyPrompt)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-sans flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer"
                  title="Ask Rajy about this extinction"
                >
                  <img src="/rajy-head.jpg" alt="Rajy" className="h-4 w-4 rounded-full object-cover" />
                  <span>Consult Rajy on This Crisis</span>
                  <MessageSquare className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 font-sans tracking-tight">
                {currentEvent.name}
              </h2>
              <p className="text-sm sm:text-base text-amber-400 font-mono mt-1 font-semibold">
                {currentEvent.commonName}
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-4xl">
              {currentEvent.overview}
            </p>

            {/* Casualty Metrics Scoreboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-rose-500/30">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Global Species Loss</span>
                <span className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5 block">
                  ~{getSpeciesLoss(currentEvent)}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.08]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Marine Genera Loss</span>
                <span className="text-xl sm:text-2xl font-black text-cyan-400 mt-0.5 block">
                  ~{getMarineLoss(currentEvent)}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.08]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Terrestrial Loss</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 block">
                  {getTerrestrialLoss(currentEvent) === 0
                    ? 'Pre-Land Fauna'
                    : `~${getTerrestrialLoss(currentEvent)}%`}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.08]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Pulse Span</span>
                <span className="text-xs sm:text-sm font-bold text-slate-200 mt-1.5 block line-clamp-2">
                  {getDuration(currentEvent)}
                </span>
              </div>
            </div>
          </div>

          {/* Kill Mechanisms Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-100 font-sans">
                Cascading Kill Mechanisms
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {killMechanisms.map((mech) => (
                <div
                  key={mech.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                        {getCategoryIcon(mech.category)}
                        <span>{mech.category}</span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold uppercase ${
                          mech.impactRating === 'Cataclysmic'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {mech.impactRating}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 font-sans">
                      {mech.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      {mech.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side: The Fallen (Decimated) vs The Heirs (Survivors & Radiators) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Left Column: The Fallen */}
            <div className="space-y-4 p-5 rounded-2xl bg-rose-950/20 border border-rose-500/20">
              <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
                <div className="flex items-center gap-2">
                  <HeartCrack className="h-5 w-5 text-rose-400" />
                  <h3 className="text-base sm:text-lg font-bold text-rose-200 font-sans">
                    The Fallen: Decimated Lineages
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                  Extinction Victims
                </span>
              </div>

              <div className="space-y-3">
                {decimatedClades.map((clade, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/20 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-slate-100 font-sans">
                        {clade.name}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                          clade.status === 'Completely Extinct'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {clade.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {clade.description}
                    </p>

                    {/* Museum Specimen Links */}
                    {clade.notableSpecimens && clade.notableSpecimens.length > 0 && (
                      <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-2">
                        {clade.notableSpecimens.map((spec: any, sIdx: number) => (
                          spec.speciesId ? (
                            <Link
                              key={sIdx}
                              to={`/species/${spec.speciesId}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-sans font-medium transition-colors"
                            >
                              <span>{spec.name}</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : (
                            <span
                              key={sIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[11px]"
                            >
                              {spec.name} ({spec.role})
                            </span>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: The Heirs (Survivors & Radiators) */}
            <div className="space-y-4 p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <Dna className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base sm:text-lg font-bold text-emerald-200 font-sans">
                    The Heirs: Survivors & Radiators
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Bottleneck Victors
                </span>
              </div>

              <div className="space-y-3">
                {survivorsAndRadiators.map((survivor, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-slate-100 font-sans">
                        {survivor.name}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {survivor.type}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs font-sans">
                      <div className="text-slate-300 leading-relaxed">
                        <strong className="text-emerald-400 font-semibold">Survival Key:</strong>{' '}
                        {survivor.survivalKey}
                      </div>
                      <div className="text-slate-400 leading-relaxed pt-1 border-t border-white/[0.04]">
                        <strong className="text-amber-400 font-semibold">Radiation Legacy:</strong>{' '}
                        {survivor.postExtinctionRadiation}
                      </div>
                    </div>

                    {/* Museum Specimen Links */}
                    {survivor.notableSpecimens && survivor.notableSpecimens.length > 0 && (
                      <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-2">
                        {survivor.notableSpecimens.map((spec: any, sIdx: number) => (
                          spec.speciesId ? (
                            <Link
                              key={sIdx}
                              to={`/species/${spec.speciesId}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-sans font-medium transition-colors"
                            >
                              <span>{spec.name}</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : (
                            <span
                              key={sIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[11px]"
                            >
                              {spec.name}
                            </span>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Macroevolutionary Legacy Banner */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              Macroevolutionary Legacy & Epoch Shift
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
              {currentEvent.macroevolutionaryLegacy}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
