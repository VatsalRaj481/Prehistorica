import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

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
  dragElastic = 0.35,
  stiffness = 450,
  damping = 18,
  ariaLabel = 'Interactive Sling Button',
}: SlingButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Motion values tracking drag offset from origin
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for tether / sling visuals
  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });

  // Calculate stretch distance for tension effect
  const distance = useTransform([springX, springY], ([latestX, latestY]: number[]) => {
    return Math.sqrt(latestX * latestX + latestY * latestY);
  });

  // Calculate rotation slightly towards pull angle
  const rotate = useTransform([springX, springY], ([latestX, latestY]: number[]) => {
    if (Math.abs(latestX) < 1 && Math.abs(latestY) < 1) return 0;
    return Math.atan2(latestY, latestX) * (180 / Math.PI) * 0.15;
  });

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    setIsDragging(false);
    const pullDist = Math.sqrt(info.offset.x * info.offset.x + info.offset.y * info.offset.y);
    // If pulled with conviction (> 30px) and released, treat as a sling launch trigger
    if (pullDist > 30 && onClick) {
      onClick();
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center select-none touch-none">
      {/* Tooltip on desktop hover when not dragging */}
      <AnimatePresence>
        {tooltipText && isHovered && !isDragging && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="hidden md:flex absolute right-full mr-3.5 px-3 py-1.5 rounded-full bg-slate-900/95 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold tracking-wide whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md pointer-events-none items-center gap-1.5 z-50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {tooltipText}
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
          r="24"
          className="fill-amber-500/10 stroke-amber-500/20"
          strokeDasharray="2 3"
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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => {
          // Normal click/tap triggers action immediately
          if (!isDragging && onClick) {
            onClick();
          }
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{
          x: springX,
          y: springY,
          rotate,
        }}
        whileHover={{ scale: 1.08 }}
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
          className="absolute inset-0 rounded-full border-2 border-amber-400/80 pointer-events-none"
          style={{
            opacity: useTransform(distance, [0, 40], [0, 0.9]),
            scale: useTransform(distance, [0, 40], [1, 1.15]),
          }}
        />
      </motion.button>
    </div>
  );
}
