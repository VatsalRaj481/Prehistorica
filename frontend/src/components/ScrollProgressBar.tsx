import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

export default function ScrollProgressBar() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Apple-grade critically damped spring for smooth momentum tracking
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 30,
    restDelta: 0.001
  });

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 h-[2.5px] z-40 pointer-events-none overflow-hidden">
      <motion.div
        className="h-full w-full origin-left bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 drop-shadow-[0_1px_6px_rgba(245,158,11,0.5)]"
        style={{ scaleX }}
      />
    </div>
  );
}
