import { useRef, type ReactNode, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, HTMLMotionProps, type SpringOptions } from 'framer-motion';

interface SpotlightCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  spotlightColor?: string; // Kept for backwards compatibility
  enableTilt?: boolean;
}

const tiltSpring: SpringOptions = {
  damping: 24,
  stiffness: 180,
  mass: 0.6
};

/**
 * Architectural Museum Plinth Card
 * Features crisp solid borders, deep museum shadow, and clean spring-tilt elevation.
 * Cursor spotlight glow has been intentionally removed per museum pavilion styling.
 */
export default function SpotlightCard({
  children,
  className = '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  spotlightColor,
  enableTilt = true,
  ...motionProps
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), tiltSpring);
  const rotateY = useSpring(useMotionValue(0), tiltSpring);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -2.5);
    rotateY.set((offsetX / (rect.width / 2)) * 2.5);
  };

  const handleMouseLeave = () => {
    if (!enableTilt) return;
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div className="[perspective:1000px] w-full h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={enableTilt ? { rotateX, rotateY } : undefined}
        className={`relative overflow-hidden group museum-card will-change-transform ${className}`}
        {...motionProps}
      >
        {children}
      </motion.div>
    </div>
  );
}
