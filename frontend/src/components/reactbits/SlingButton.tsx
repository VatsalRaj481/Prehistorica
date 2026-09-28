import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, animate } from 'framer-motion';

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
  dragElastic = 0.45,
  stiffness = 380,
  damping = 10, // Underdamped for authentic harmonic bounce & recoil oscillations
  ariaLabel = 'Interactive Sling Button',
}: SlingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const isLaunchingRef = useRef(false);

  // Motion values tracking drag offset from origin
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Smooth springs for tether / sling visuals with harmonic bounce
  const springX = useSpring(x, { stiffness, damping, mass: 0.75 });
  const springY = useSpring(y, { stiffness, damping, mass: 0.75 });

  // Calculate stretch distance for tension effect
  const distance = useTransform([springX, springY], ([latestX, latestY]: number[]) => {
    return Math.sqrt(latestX * latestX + latestY * latestY);
  });

  // Calculate rotation slightly towards pull angle
  const rotate = useTransform([springX, springY], ([latestX, latestY]: number[]) => {
    if (Math.abs(latestX) < 1 && Math.abs(latestY) < 1) return 0;
    return Math.atan2(latestY, latestX) * (180 / Math.PI) * 0.18;
  });

  /**
   * Automated tactile physical sequence:
   * 1. PUSH: Button presses down / compresses.
   * 2. DRAG: Button pulls back into the slingshot, tensioning the cord and glowing ring.
   * 3. BOUNCE: Released! Snaps forward, overshoots past (0,0), and oscillates back to its original position.
   * 4. OPEN: Only once fully settled at its original position does the docent window open.
   */
  const triggerSlingshotLaunch = async () => {
    if (isLaunchingRef.current) return;
    isLaunchingRef.current = true;
    setIsSettling(false);

    try {
      // Step 1: PUSH (compress button into page)
      await animate(scale, 0.82, { duration: 0.12, ease: 'easeOut' });

      // Step 2: DRAG (draw back along the diagonal slingshot vector)
      await Promise.all([
        animate(x, -48, { duration: 0.22, ease: [0.16, 1, 0.3, 1] }),
        animate(y, -48, { duration: 0.22, ease: [0.16, 1, 0.3, 1] }),
        animate(scale, 0.92, { duration: 0.22, ease: 'easeOut' }),
      ]);

      // Brief tension hold at peak draw
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Step 3: BOUNCE TO ORIGINAL POSITION (slingshot release & harmonic oscillation)
      setIsSettling(true);
      // Snapping x and y to 0 causes springX and springY to overshoot past 0 and oscillate naturally
      x.set(0);
      y.set(0);

      await Promise.all([
        animate(scale, [0.92, 1.18, 0.96, 1], { duration: 0.5, ease: 'easeOut' }),
        new Promise((resolve) => setTimeout(resolve, 520)),
      ]);

      setIsSettling(false);

      // Step 4: OPEN DOCENT WINDOW (now that button has bounced and fully settled at original position)
      if (onClick) {
        onClick();
      }
    } finally {
      // Re-arm launcher after slight pause once modal handles state
      setTimeout(() => {
        isLaunchingRef.current = false;
      }, 400);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
    setIsSettling(false);
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    setIsDragging(false);
    const pullDist = Math.hypot(info.offset.x, info.offset.y);

    // If dragged manually with conviction (> 15px), let it spring back, bounce, and then trigger docent
    if (pullDist > 15) {
      if (isLaunchingRef.current) return;
      isLaunchingRef.current = true;
      setIsSettling(true);

      // Framer Motion's dragSnapToOrigin will spring back the button with bounce
      // We wait for the spring bounce to fully oscillate and settle at (0,0) before opening
      window.setTimeout(() => {
        setIsSettling(false);
        isLaunchingRef.current = false;
        if (onClick) {
          onClick();
        }
      }, 520);
    } else {
      // If clicked/tapped or released without dragging, run the complete push-drag-bounce sequence
      triggerSlingshotLaunch();
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

      {/* SVG Slingshot Tether / Elastic Cord (visible when pulled) */}
      <svg
        className="absolute inset-0 pointer-events-none overflow-visible w-full h-full -z-10"
        aria-hidden="true"
      >
        {/* Origin anchor glow */}
        <circle
          cx="50%"
          cy="50%"
          r="26"
          className="fill-amber-500/10 stroke-amber-500/25"
          strokeDasharray="3 3"
        />

        {/* Dynamic slingshot band from origin to moving button */}
        <motion.line
          x1="50%"
          y1="50%"
          x2={useTransform(springX, (val) => `calc(50% + ${val}px)`)}
          y2={useTransform(springY, (val) => `calc(50% + ${val}px)`)}
          className="stroke-amber-400/50"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            opacity: useTransform(distance, [0, 10, 30], [0, 0.4, 0.9]),
          }}
        />
      </svg>

      {/* Main Draggable / Spring Slingshot Body */}
      <motion.button
        type="button"
        aria-label={ariaLabel}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={dragElastic}
        dragSnapToOrigin
        dragTransition={{
          power: 0.2,
          bounceStiffness: stiffness,
          bounceDamping: damping,
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => {
          // Trigger the tactile push, drag, and bounce sequence before opening
          if (!isDragging && !isSettling && !isLaunchingRef.current) {
            triggerSlingshotLaunch();
          }
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{
          x: springX,
          y: springY,
          scale,
          rotate,
        }}
        whileHover={{ scale: (isDragging || isSettling || isLaunchingRef.current) ? 1 : 1.08 }}
        whileTap={{ scale: 0.92 }}
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

        {/* Dynamic tension glow ring when pulled */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-amber-400 pointer-events-none"
          style={{
            opacity: useTransform(distance, [0, 35], [0, 0.95]),
            scale: useTransform(distance, [0, 45], [1, 1.2]),
            boxShadow: useTransform(
              distance,
              [0, 40],
              ['0 0 0px rgba(245,158,11,0)', '0 0 25px rgba(245,158,11,0.6)']
            ),
          }}
        />

        {/* Post-bounce ripple flash upon settling home */}
        {isSettling && (
          <motion.div
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-amber-300 pointer-events-none"
          />
        )}
      </motion.button>
    </div>
  );
}
