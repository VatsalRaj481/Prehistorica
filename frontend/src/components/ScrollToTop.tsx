import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useLenis } from 'lenis/react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 380);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          whileTap={{ scale: 0.92 }}
          onClick={scrollToTop}
          className="fixed bottom-18 right-5 sm:bottom-20 sm:right-6 z-40 min-h-[40px] min-w-[40px] sm:min-h-[42px] sm:min-w-[42px] p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-850 backdrop-blur-xl border border-white/[0.12] hover:border-amber-500/50 text-slate-300 hover:text-amber-300 shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex items-center justify-center cursor-pointer transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title="Return to top"
          aria-label="Return to top of page"
        >
          <ArrowUp className="h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform duration-200 group-hover:-translate-y-0.5 text-slate-300 group-hover:text-amber-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
