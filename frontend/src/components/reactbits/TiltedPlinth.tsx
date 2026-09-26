import { useRef, type ReactNode, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, type SpringOptions } from 'framer-motion';

interface TiltedPlinthProps {
  children: ReactNode;
  className?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  disabled?: boolean;
}

const springValues: SpringOptions = {
  damping: 24,
  stiffness: 160,
  mass: 0.8
};

export default function TiltedPlinth({
  children,
  className = '',
  rotateAmplitude = 4,
  scaleOnHover = 1.012,
  disabled = false
}: TiltedPlinthProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);

  function handleMouse(e: MouseEvent<HTMLDivElement>) {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotX);
    rotateY.set(rotY);
  }

  function handleMouseEnter() {
    if (disabled) return;
    scale.set(scaleOnHover);
  }

  function handleMouseLeave() {
    if (disabled) return;
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      ref={ref}
      className={`[perspective:1000px] ${className}`}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="w-full h-full [transform-style:preserve-3d] will-change-transform"
        style={{
          rotateX,
          rotateY,
          scale
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
