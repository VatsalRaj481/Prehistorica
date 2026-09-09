import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface SpotlightCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string; // Kept for backwards compatibility
}

/**
 * Architectural Museum Plinth Card
 * Features crisp solid borders, deep museum shadow, and clean hover elevation.
 * Cursor spotlight glow has been intentionally removed per museum pavilion styling.
 */
export default function SpotlightCard({
  children,
  className = '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  spotlightColor,
  ...motionProps
}: SpotlightCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden group museum-card ${className}`}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
