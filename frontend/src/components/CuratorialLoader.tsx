import { motion, useReducedMotion } from 'framer-motion';
import ShinyText from './reactbits/ShinyText.js';
import DinoLogoMark from './DinoLogoMark.js';

interface CuratorialLoaderProps {
  variant?: 'strata' | 'amber' | 'compact';
  label?: string;
  sublabel?: string;
  className?: string;
}

export default function CuratorialLoader({
  variant = 'strata',
  label = 'Excavating Specimen Records...',
  sublabel,
  className = ''
}: CuratorialLoaderProps) {
  const shouldReduceMotion = useReducedMotion();

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 font-mono text-xs text-amber-400 ${className}`}>
        <div className="relative w-4 h-4 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full border border-amber-500/30 animate-ping opacity-60" />
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        </div>
        {label && <span className="text-[11px] tracking-wider uppercase font-semibold">{label}</span>}
      </div>
    );
  }

  if (variant === 'amber') {
    return (
      <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center font-mono space-y-4 ${className}`}>
        {/* Amber Resin Fossil Plinth Beacon */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Pulsing Outer Resin Ring */}
          <motion.div
            animate={shouldReduceMotion ? {} : { scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-amber-600/10 to-transparent flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.2)] backdrop-blur-sm"
          >
            <DinoLogoMark className="w-9 h-9 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]" />
          </motion.div>
        </div>

        <div className="space-y-1">
          <h4 className="text-xs uppercase tracking-widest font-bold">
            <ShinyText text={label} speed={3} />
          </h4>
          {sublabel && (
            <p className="text-[10px] text-slate-400 font-sans max-w-xs leading-relaxed">
              {sublabel}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── DEFAULT & STRATA VARIANT: Fossilized Egg with Spreading Cracks & Inner Amber Glow ──
  const eggPath = 'M 30,6 C 43,6 52,24 52,44 C 52,58 42,66 30,66 C 18,66 8,58 8,44 C 8,24 17,6 30,6 Z';

  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center font-mono space-y-5 w-full ${className}`}>
      {/* Fossilized Egg Specimen Matrix Chamber */}
      <div className="w-48 sm:w-56 p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-white/[0.08] shadow-inner relative overflow-hidden flex flex-col items-center justify-center">
        {/* Soft Ambient Radial Halo behind Egg */}
        {!shouldReduceMotion && (
          <motion.div
            animate={{
              scale: [0.9, 1.18, 0.9],
              opacity: [0.2, 0.55, 0.2]
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute w-24 h-28 bg-amber-500/15 rounded-full blur-xl pointer-events-none"
          />
        )}

        {/* Fossilized Egg SVG Stage */}
        <div className="relative flex items-center justify-center">
          <svg
            viewBox="0 0 60 72"
            className="w-14 h-16 sm:w-16 sm:h-20 drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)]"
            aria-label="Fossilized egg specimen emerging"
          >
            <defs>
              {/* Shell Surface Texture Gradient */}
              <radialGradient id="eggShellGradient" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#0F172A" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#050814" stopOpacity="1" />
              </radialGradient>

              {/* Inner Radiant Core Gradient */}
              <radialGradient id="eggCoreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#D97706" stopOpacity="0.5" />
                <stop offset="80%" stopColor="#B45309" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </radialGradient>

              {/* Egg Outline Clip Path for Internal Glow */}
              <clipPath id="eggClipPath">
                <path d={eggPath} />
              </clipPath>
            </defs>

            {/* Egg Shell Body */}
            <path
              d={eggPath}
              fill="url(#eggShellGradient)"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />

            {/* Inner Light Seeping Through Shell — Clipped to Egg Boundary */}
            <g clipPath="url(#eggClipPath)">
              <motion.circle
                cx="30"
                cy="38"
                r="18"
                fill="url(#eggCoreGlow)"
                animate={
                  shouldReduceMotion
                    ? { opacity: 0.45, scale: 1 }
                    : {
                        opacity: [0.2, 0.85, 0.45, 0.9, 0.2],
                        scale: [0.85, 1.2, 0.95, 1.25, 0.85]
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 3.2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }
                }
              />
            </g>

            {/* Primary Main Fissure Line */}
            <motion.path
              d="M 28,14 L 33,22 L 27,31 L 35,40 L 29,49 L 34,58"
              stroke="#F59E0B"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                filter: 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.85))'
              }}
              initial={shouldReduceMotion ? { pathLength: 1, opacity: 0.95 } : { pathLength: 0, opacity: 0.2 }}
              animate={
                shouldReduceMotion
                  ? { pathLength: 1, opacity: 0.95 }
                  : {
                      pathLength: [0, 1, 1, 1, 0],
                      opacity: [0.25, 1, 1, 0.8, 0.25]
                    }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 3.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      times: [0, 0.48, 0.72, 0.9, 1]
                    }
              }
            />

            {/* Branching Tributary Fissures (Right & Left Lateral Cracks) */}
            <motion.path
              d="M 35,40 L 43,43 L 47,38 M 27,31 L 19,34 L 14,42 M 33,22 L 40,20 L 44,24"
              stroke="#FBBF24"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                filter: 'drop-shadow(0 0 2px rgba(245, 158, 11, 0.7))'
              }}
              initial={shouldReduceMotion ? { pathLength: 1, opacity: 0.9 } : { pathLength: 0, opacity: 0 }}
              animate={
                shouldReduceMotion
                  ? { pathLength: 1, opacity: 0.9 }
                  : {
                      pathLength: [0, 0, 1, 1, 0],
                      opacity: [0, 0.2, 1, 0.75, 0]
                    }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 3.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      times: [0, 0.22, 0.58, 0.85, 1]
                    }
              }
            />
          </svg>
        </div>
      </div>

      {/* Identical Typography and Spacing Structure for ShinyText Label & Sublabel */}
      <div className="space-y-1">
        <h4 className="text-xs uppercase tracking-widest font-bold">
          <ShinyText text={label} speed={3} />
        </h4>
        <p className="text-[10px] text-slate-400 font-mono tracking-wider">
          {sublabel || 'Excavating specimen matrix & preparing anatomical records...'}
        </p>
      </div>
    </div>
  );
}
