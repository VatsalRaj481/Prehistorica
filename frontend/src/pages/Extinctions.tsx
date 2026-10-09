import { useState, useEffect } from 'react';
import DeepTimeClimateGraph from '../components/DeepTimeClimateGraph.js';
import ExtinctionGatewayViewer from '../components/ExtinctionGatewayViewer.js';
import ChiefCuratorModal from '../components/ChiefCuratorModal.js';
import { fetchExtinctionEvents, fetchPaleoclimateCurves } from '../services/api.js';
import {
  Skull,
  Flame,
  Activity,
  AlertTriangle,
  Globe2,
  Layers,
  Database
} from 'lucide-react';

export default function Extinctions() {
  const [selectedExtinctionId, setSelectedExtinctionId] = useState<string>('end-permian');
  const [dbExtinctions, setDbExtinctions] = useState<any[]>([]);
  const [dbClimate, setDbClimate] = useState<any[]>([]);
  const [isCuratorOpen, setIsCuratorOpen] = useState<boolean>(false);
  const [curatorPrompt, setCuratorPrompt] = useState<string>('');

  useEffect(() => {
    document.title = 'The Big Five Mass Extinctions & Paleoclimate Chronicle | Prehistorica Museum Pavilion';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

    // Fetch live PostgreSQL database records
    fetchExtinctionEvents().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setDbExtinctions(data);
      }
    });

    fetchPaleoclimateCurves().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setDbClimate(data);
      }
    });
  }, []);

  const handleSelectExtinction = (id: string) => {
    setSelectedExtinctionId(id);
    // Smooth scroll to the detailed dossier
    const el = document.getElementById('extinction-dossier');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAskRajy = (prompt: string) => {
    setCuratorPrompt(prompt);
    setIsCuratorOpen(true);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 space-y-10 sm:space-y-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Header Section */}
      <section className="relative space-y-6 pt-2">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 sm:w-2xl h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold tracking-widest uppercase">
          <span className="text-rose-400 flex items-center gap-1.5">
            <Skull className="h-4 w-4 text-rose-500 animate-pulse" />
            Curatorial Deep-Time Special Exhibit
          </span>
          {dbExtinctions.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 normal-case tracking-normal">
              <Database className="h-3 w-3 text-emerald-400" />
              Stratigraphically Calibrated
            </span>
          )}
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 font-sans tracking-tight uppercase leading-[1.08]">
            The <span className="text-rose-500">"Big Five"</span> Mass Extinctions & Paleoclimate Chronicle
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-sans max-w-3xl leading-relaxed">
            Across more than 538 million years of the Phanerozoic Eon, the thread of terrestrial and marine life was pushed to the absolute edge of total annihilation five distinct times. Explore the synchronized planetary environmental triggers, collapsing trophic webs, and the resilient survivor lineages that inherited our world.
          </p>
        </div>

        {/* Quick Statistical Dossier Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 pt-2 font-mono">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Skull className="h-3.5 w-3.5 text-rose-400 shrink-0" />
              <span className="truncate">Great Cataclysms</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-100 mt-1">5 Pulses</div>
            <span className="text-[10px] sm:text-[11px] text-rose-400 truncate block">Hirnantian to K-Pg</span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Deep-Time Span</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-400 mt-1">&gt; 538 Ma</div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 truncate block">Phanerozoic Eon</span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <span className="truncate">Peak Mortality</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-red-400 mt-1">96%</div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 truncate block">End-Permian Marine</span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/80 border border-white/[0.08] shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Lineage Survival</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 mt-1">100%</div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 truncate block">Ancestors of Crown Life</span>
          </div>
        </div>
      </section>

      {/* Part 1: Deep-Time Paleoclimate Synchronized Dashboard */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-sans tracking-tight flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-400" />
              Phanerozoic Climate &amp; Environment Chronicle
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Hover across the timeline to scrub geological time or click any pulsing red beacon to inspect that extinction crisis below.
            </p>
          </div>
        </div>

        <DeepTimeClimateGraph
          selectedExtinctionId={selectedExtinctionId}
          onSelectExtinction={handleSelectExtinction}
          climateData={dbClimate}
          extinctionEvents={dbExtinctions}
          isDatabaseSource={dbExtinctions.length > 0}
        />
      </section>

      {/* Part 2: Interactive Extinction Gateways Dossier */}
      <section className="space-y-4 pt-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-sans tracking-tight flex items-center gap-2">
            <Skull className="h-5 w-5 text-rose-500" />
            The Extinction Gateways: Post-Mortem Dossiers
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Select one of the Big Five crises to examine the cascading kill mechanisms, extinct victim taxa, and surviving evolutionary heirs.
          </p>
        </div>

        <ExtinctionGatewayViewer
          selectedExtinctionId={selectedExtinctionId}
          onSelectExtinction={setSelectedExtinctionId}
          onAskRajy={handleAskRajy}
          events={dbExtinctions}
          isDatabaseSource={dbExtinctions.length > 0}
        />
      </section>

      {/* Part 3: Curatorial Epilogue: The "Sixth Extinction" Anthropocene Perspective */}
      <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-rose-950/30 border border-white/[0.08] shadow-2xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-amber-400">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>Curatorial Epilogue & Comparative Geochemistry</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-100 font-sans tracking-tight">
          Are We Entering the "Sixth Extinction"?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          <p>
            When examining the geochemical record across the Big Five, paleontologists have uncovered a clear pattern: life rarely collapses from a single isolated insult. The greatest wipeouts—particularly the <strong className="text-rose-400">End-Permian Great Dying</strong> and the <strong className="text-purple-400">End-Triassic</strong>—were driven by massive injections of carbon dioxide into the atmosphere and oceans, triggering lethal warming, acidification, and anoxia.
          </p>
          <p>
            Today, atmospheric <strong className="text-amber-400">CO₂ exceeds 420 ppm</strong>, climbing at a rate ten times faster than during the Siberian Traps. By comparing historical extinction mechanisms with modern habitat fragmentation, ocean acidification, and warming, Prehistorica’s climate telemetry offers an indispensable baseline: understanding how life nearly died in deep time is our most urgent guide to preserving it today.
          </p>
        </div>
      </section>

      {/* Chief Curator AI Modal for Extinction Deep-Dives */}
      <ChiefCuratorModal
        isOpen={isCuratorOpen}
        onClose={() => setIsCuratorOpen(false)}
        initialQuery={curatorPrompt}
      />
    </div>
  );
}
