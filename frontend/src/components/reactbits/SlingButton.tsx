import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

export interface SlingButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  tooltipText?: string;
  badgeContent?: React.ReactNode;
  dragElastic?: number;
  stiffness?: number;
  damping?: number;
  ariaLabel?: string;
}

export default function SlingButton({
  children,
  onClick,
  className = '',
  tooltipText,
  badgeContent,
  dragElastic = 0.42,
  stiffness = 520, // Hooke's restoring stiffness (N/m equivalent) for authentic snap acceleration
  damping = 14,   // Underdamped ratio (zeta ~ 0.3) for crisp harmonic recoil & 2-3 decaying oscillations
  ariaLabel = 'Interactive Sling Button',
}: SlingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [impactRipple, setImpactRipple] = useState(false);

  // Synchronization refs to prevent synthetic DOM click events from firing during or right after drag release
  const hasDraggedRef = useRef(false);
  const isSettlingRef = useRef(false);
  const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rippleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Motion values tracking drag offset from origin
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Hooke's radial distance: d = sqrt(x^2 + y^2)
  const distance = useTransform([x, y], ([lx, ly]: number[]) => Math.hypot(lx, ly));

  // Natural tilt towards tension vector (bounded to prevent upside-down flipping)
  const rotate = useTransform(x, [-90, 90], [-13, 13]);

  // Dynamic band stretch coordinates in 300x300 SVG canvas (origin at 150, 150)
  const bxCenter = useTransform(x, (val) => 150 + val);
  const byCenter = useTransform(y, (val) => 150 + val);

  // Elastic strain properties: Poisson ratio thinning & opacity under tension
  const bandOpacity = useTransform(distance, [3, 16], [0, 0.95]);
  const bandStrokeWidth = useTransform(distance, [4, 90], [3.2, 1.6]);

  useEffect(() => {
    return () => {
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
      if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
    };
  }, []);

  const handleDragStart = () => {
    if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
    if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
    hasDraggedRef.current = true;
    isSettlingRef.current = false;
    setIsDragging(true);
    setIsSettling(false);
    setImpactRipple(false);
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    setIsDragging(false);
    const pullDist = Math.hypot(info.offset.x, info.offset.y);

    // If dragged with conviction (> 10px), trigger authentic harmonic snap-back sequence
    if (pullDist > 10) {
      hasDraggedRef.current = true;
      isSettlingRef.current = true;
      setIsSettling(true);

      // Trigger kinetic impact shockwave right when harmonic snap crosses origin plinth (~65ms)
      rippleTimerRef.current = setTimeout(() => {
        setImpactRipple(true);
      }, 65);

      // The underdamped harmonic oscillator (stiffness: 520, damping: 14) snaps home,
      // overshoots, and dampens out in ~420ms. Open the AI Docent only after settling into plinth:
      bounceTimerRef.current = setTimeout(() => {
        setIsSettling(false);
        isSettlingRef.current = false;
        hasDraggedRef.current = false;
        setImpactRipple(false);
        if (onClick) {
          onClick();
        }
      }, 420);
    } else {
      // Very slight twitch / micro-click (< 10px), reset drag ref quickly so click can fire normally
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If dragged or currently settling, suppress synthetic click event
    if (hasDraggedRef.current || isSettlingRef.current || isSettling) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Direct click/tap: instantaneous opening
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center select-none touch-none">
      {/* Tooltip on desktop hover when not dragging or settling */}
      <AnimatePresence>
        {tooltipText && isHovered && !isDragging && !isSettling && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="hidden md:flex absolute right-full mr-3.5 px-3 py-1.5 rounded-full bg-slate-900/95 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold tracking-wide whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md pointer-events-none items-center gap-1.5 z-50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {tooltipText}
            <span className="text-[10px] text-amber-400/60 font-sans tracking-normal ml-1">
              (Pull & Sling)
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Kinetic Physics Stage: Slingshot Prongs, Dual Elastic Bands, and Origin Reticle */}
      <svg
        className="absolute pointer-events-none overflow-visible -z-10"
        style={{
          width: 300,
          height: 300,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        viewBox="0 0 300 300"
        aria-hidden="true"
      >
        <defs>
          {/* Tension Glow Filter */}
          <filter id="slingGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#f59e0b" floodOpacity="0.75" />
          </filter>

          {/* Elastic Rubber Band Gradient */}
          <linearGradient id="slingBandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Origin Cradle Plinth & Target Reticle */}
        <g opacity="0.6">
          <circle
            cx="150"
            cy="150"
            r="26"
            className="fill-slate-950/40 stroke-amber-500/30"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <line x1="145" y1="150" x2="155" y2="150" className="stroke-amber-400/40" strokeWidth="1" />
          <line x1="150" y1="145" x2="150" y2="155" className="stroke-amber-400/40" strokeWidth="1" />
        </g>

        {/* Single Kinetic Elastic Tether Band */}
        <motion.line
          x1={150}
          y1={150}
          x2={bxCenter}
          y2={byCenter}
          stroke="url(#slingBandGrad)"
          filter="url(#slingGlow)"
          strokeLinecap="round"
          style={{
            opacity: bandOpacity,
            strokeWidth: bandStrokeWidth,
          }}
        />

        {/* Central Origin Anchor Rivet */}
        <circle cx="150" cy="150" r="3.5" className="fill-amber-400 stroke-slate-950" strokeWidth="1" />

        {/* Kinetic Impact Shockwave (fires when oscillator snaps back to origin) */}
        {impactRipple && (
          <motion.circle
            cx={150}
            cy={150}
            initial={{ r: 20, opacity: 0.9, strokeWidth: 3 }}
            animate={{ r: 56, opacity: 0, strokeWidth: 0.5 }}
            transition={{ duration: 0.35, ease: [0.12, 0.9, 0.2, 1] }}
            className="stroke-amber-300 fill-amber-400/10 pointer-events-none"
          />
        )}
      </svg>

      {/* Main Draggable Slingshot Pouch Button */}
      <motion.button
        type="button"
        aria-label={ariaLabel}
        drag={!isSettling}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={dragElastic}
        dragSnapToOrigin
        dragTransition={{
          power: 0.08,
          bounceStiffness: stiffness,
          bounceDamping: damping,
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{
          x,
          y,
          rotate,
        }}
        whileHover={{ scale: (isDragging || isSettling) ? 1 : 1.08 }}
        whileTap={{ scale: 0.94 }}
        className={`relative cursor-grab active:cursor-grabbing rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-shadow ${className}`}
      >
        {/* Child avatar / icon */}
        <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center pointer-events-none">
          {children}
        </div>

        {/* Optional Badge (e.g. online dot or sparkle) */}
        {badgeContent && (
          <div className="absolute -top-1 -right-1 pointer-events-none z-10">
            {badgeContent}
          </div>
        )}

        {/* Dynamic Strain & Tension Glow Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-amber-400 pointer-events-none"
          style={{
            opacity: useTransform(distance, [4, 40], [0, 0.95]),
            scale: useTransform(distance, [0, 70], [1, 1.14]),
            boxShadow: useTransform(
              distance,
              [0, 50],
              ['0 0 0px rgba(245,158,11,0)', '0 0 24px rgba(245,158,11,0.65)']
            ),
          }}
        />

        {/* Settling Flash Ring */}
        {isSettling && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0.9 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-amber-300 pointer-events-none"
          />
        )}
      </motion.button>
    </div>
  );
}
