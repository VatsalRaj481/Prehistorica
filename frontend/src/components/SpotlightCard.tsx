import React, { useRef, useCallback } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface SpotlightCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(245, 158, 11, 0.08)',
  ...motionProps
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    cardRef.current.style.setProperty('--spotlight-opacity', '1');
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--spotlight-opacity', '0');
  }, []);

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative overflow-hidden group ${className}`}
      style={
        {
          '--mouse-x': '50%',
          '--mouse-y': '50%',
          '--spotlight-opacity': '0',
          ...motionProps.style
        } as React.CSSProperties
      }
      {...motionProps}
    >
      {/* Ambient Gallery Spotlight Overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-10"
        style={{
          opacity: 'var(--spotlight-opacity, 0)',
          background: `radial-gradient(420px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${spotlightColor}, transparent 65%)`
        }}
      />
      {children}
    </motion.div>
  );
}
