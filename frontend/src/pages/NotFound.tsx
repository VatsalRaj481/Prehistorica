import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Home as HomeIcon, 
  Compass, 
  Clock, 
  Dna, 
  ArrowLeft, 
  Sparkles, 
  FileQuestion,
  Search
} from 'lucide-react';

import DecryptedText from '../components/reactbits/DecryptedText.js';
import Particles from '../components/reactbits/Particles.js';
import Magnet from '../components/reactbits/Magnet.js';
import ClickSpark from '../components/reactbits/ClickSpark.js';
import SpotlightCard from '../components/SpotlightCard.js';
import { getLiveSpecimensTotal } from '../services/api.js';

interface CuratedSpecimenLink {
  id: number;
  name: string;
  epoch: string;
  clade: string;
}

const FEATURED_SPECIMENS: CuratedSpecimenLink[] = [
  { id: 1, name: 'Tyrannosaurus rex', epoch: 'Late Cretaceous', clade: 'Theropod' },
  { id: 575, name: 'Uintatherium anceps', epoch: 'Eocene', clade: 'Crown Mammal / Dinocerata' },
  { id: 5189, name: 'Ankylorhiza tiedemani', epoch: 'Oligocene', clade: 'Stem Odontocete Whale' },
  { id: 2, name: 'Spinosaurus aegyptianus', epoch: 'Cretaceous', clade: 'Theropod' },
  { id: 3, name: 'Dimetrodon grandis', epoch: 'Early Permian', clade: 'Stem-Mammal / Pelycosaur' },
  { id: 10, name: 'Mammuthus primigenius', epoch: 'Pleistocene', clade: 'Crown Mammal / Proboscidea' }
];

export default function NotFound() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [quickQuery, setQuickQuery] = useState('');

  useEffect(() => {
    document.title = '404 - Stratigraphic Discontinuity | Prehistorica Museum Pavilion';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(quickQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="relative min-h-[82vh] flex flex-col items-center justify-center py-10 sm:py-16 overflow-hidden">
      {/* ── Ambient Background: Deep-Time Sediment Particles ── */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
          <Particles
            particleCount={35}
            particleSpread={12}
            speed={0.08}
            particleBaseSize={80}
            sizeRandomness={0.8}
            particleColors={['#F59E0B', '#D97706', '#B45309', '#78350F']}
            moveParticlesOnHover={true}
            particleHoverFactor={0.5}
            cameraDistance={24}
            className="w-full h-full"
          />
        </div>
      )}

      {/* ── Subtle Background Radial Glow ── */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ── Main Museum Stage Container ── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center space-y-8">
        

        {/* Hero 404 Monolith Graphic & Decrypted Diagnostic Title */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring', damping: 20 }}
            className="relative inline-block select-none"
          >
            {/* Monumental 404 */}
            <h1 className="text-7xl sm:text-9xl font-black tracking-tighter font-sans text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-amber-200/80 to-amber-700/50 drop-shadow-[0_20px_35px_rgba(245,158,11,0.12)]">
              404
            </h1>
            {/* Decorative Strata Caliper Line */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          </motion.div>

          {/* Holographic Decrypted Classification */}
          <div className="pt-2">
            <h2 className="text-xl sm:text-2xl font-bold font-sans text-slate-100 tracking-tight flex items-center justify-center gap-2">
              <FileQuestion className="h-5 w-5 text-amber-400 inline-block" />
              <span>Specimen Horizon Unrecorded</span>
            </h2>
            <div className="mt-1 font-mono text-xs text-amber-400/90 tracking-widest uppercase">
              <DecryptedText
                text="DIAGNOSTIC: ERODED STRATUM // HIATUS IN FOSSIL RECORD"
                speed={25}
                maxIterations={10}
                animateOn="view"
                characters="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_~#//"
                className="font-bold text-amber-400"
                encryptedClassName="text-amber-600/40"
              />
            </div>
          </div>

          <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-400 font-sans leading-relaxed pt-2">
            The requested exhibition placard, corridor, or specimen record cannot be located—the geological stratum may have eroded over deep time, or the URL refers to an uncataloged horizon.
          </p>
        </div>

        {/* ── Interactive Quick Search Wayfinder ── */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-lg mx-auto"
        >
          <form
            onSubmit={handleQuickSearch}
            className="relative flex items-center rounded-xl bg-slate-900/90 border border-white/10 hover:border-amber-400/40 focus-within:border-amber-400/80 transition-all p-1.5 shadow-xl backdrop-blur-md"
          >
            <div className="pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder={`Search ${getLiveSpecimensTotal() ? getLiveSpecimensTotal() : '800+'} cataloged species (e.g. T-Rex, Spinosaurus, Dimetrodon)...`}
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-sans"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1.5 shadow-md"
            >
              <span>Examine</span>
            </button>
          </form>
        </motion.div>

        {/* ── Wayfinding Portals: Museum Wings (SpotlightCards) ── */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-left"
        >
          {/* 1. Grand Rotunda / Home */}
          <Link to="/" className="group focus:outline-none">
            <SpotlightCard className="p-4 rounded-xl border border-white/[0.08] hover:border-amber-400/40 bg-slate-900/60 backdrop-blur-md transition-all h-full flex flex-col justify-between group-hover:bg-slate-850/80">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <HomeIcon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100 font-sans group-hover:text-amber-300 transition-colors">
                  Grand Pavilion
                </h3>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Return to the central exhibition rotunda, introductory orientation stage, and curated docent halls.
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400/80 uppercase tracking-wider">
                <span>Enter Pavilion</span>
                <ArrowLeft className="h-3 w-3 rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </SpotlightCard>
          </Link>

          {/* 2. Specimen Catalog */}
          <Link to="/browse" className="group focus:outline-none">
            <SpotlightCard className="p-4 rounded-xl border border-white/[0.08] hover:border-amber-400/40 bg-slate-900/60 backdrop-blur-md transition-all h-full flex flex-col justify-between group-hover:bg-slate-850/80">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Compass className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100 font-sans group-hover:text-amber-300 transition-colors">
                  Specimen Archive
                </h3>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Filter all {getLiveSpecimensTotal() ? getLiveSpecimensTotal() : '800+'} cataloged prehistoric species by period, clade, diet, and formation.
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400/80 uppercase tracking-wider">
                <span>Open Catalog</span>
                <ArrowLeft className="h-3 w-3 rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </SpotlightCard>
          </Link>

          {/* 3. Chronostratigraphic TimeMap */}
          <Link to="/map" className="group focus:outline-none">
            <SpotlightCard className="p-4 rounded-xl border border-white/[0.08] hover:border-amber-400/40 bg-slate-900/60 backdrop-blur-md transition-all h-full flex flex-col justify-between group-hover:bg-slate-850/80">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Clock className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100 font-sans group-hover:text-amber-300 transition-colors">
                  Geological TimeMap
                </h3>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Travel over half a billion years through deep time across Earth's major eras and epochs.
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400/80 uppercase tracking-wider">
                <span>Survey Timeline</span>
                <ArrowLeft className="h-3 w-3 rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </SpotlightCard>
          </Link>

          {/* 4. Tree of Extinct Life */}
          <Link to="/cladogram" className="group focus:outline-none">
            <SpotlightCard className="p-4 rounded-xl border border-white/[0.08] hover:border-amber-400/40 bg-slate-900/60 backdrop-blur-md transition-all h-full flex flex-col justify-between group-hover:bg-slate-850/80">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Dna className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100 font-sans group-hover:text-amber-300 transition-colors">
                  Tree of Life
                </h3>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Trace anatomical synapomorphies and cladistic lineages connecting prehistoric life.
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400/80 uppercase tracking-wider">
                <span>Inspect Lineages</span>
                <ArrowLeft className="h-3 w-3 rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </SpotlightCard>
          </Link>
        </motion.div>

        {/* ── Featured Specimen Fast-Jumps ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="pt-2 border-t border-white/[0.08]"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500 mb-3 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-amber-400/70" />
            <span>Notable Cataloged Specimens</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {FEATURED_SPECIMENS.map((spec) => (
              <Link
                key={spec.id}
                to={`/species/${spec.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/[0.06] hover:border-amber-400/40 text-xs font-mono text-slate-300 hover:text-amber-300 transition-colors group"
              >
                <span className="italic">{spec.name}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-amber-400/70 font-sans not-italic">
                  ({spec.epoch})
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── Primary Tactical Navigation Controls (Magnet + ClickSpark) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <Magnet padding={40} magnetStrength={3}>
            <ClickSpark sparkColor="#F59E0B" sparkCount={10}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 text-amber-400" />
                <span>Previous Stratum (Back)</span>
              </button>
            </ClickSpark>
          </Magnet>

          <Magnet padding={40} magnetStrength={3}>
            <ClickSpark sparkColor="#F59E0B" sparkCount={10}>
              <Link
                to="/"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <HomeIcon className="h-4 w-4 text-slate-950" />
                <span>Return to Grand Pavilion</span>
              </Link>
            </ClickSpark>
          </Magnet>
        </motion.div>

        {/* ── Curatorial Footer Note (WCAG AA Compliant Contrast) ── */}
        <div className="pt-6 text-[11px] font-mono text-slate-300 max-w-lg mx-auto italic border-t border-white/[0.04]">
          &ldquo;The crust of the earth is a vast museum; but the natural collections have been made only at intervals exceedingly remote.&rdquo;
          <div className="not-italic text-[10px] text-slate-400 mt-1 uppercase tracking-widest">
            &mdash; Charles Darwin, Origin of Species (1859)
          </div>
        </div>

      </div>
    </div>
  );
}
