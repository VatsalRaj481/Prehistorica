import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import { TaxonomyHierarchy } from '../services/api.js';

interface TaxonomyBreadcrumbsProps {
  taxonomy?: TaxonomyHierarchy | null;
  taxonomicClassification?: string;
}

export default function TaxonomyBreadcrumbs({ taxonomy, taxonomicClassification }: TaxonomyBreadcrumbsProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.03
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    }
  };

  if (taxonomy) {
    const ranks = [
      { label: 'Domain', val: taxonomy.domain || 'Eukaryota' },
      { label: 'Kingdom', val: taxonomy.kingdom || 'Animalia' },
      { label: 'Phylum', val: taxonomy.phylum || 'Chordata' },
      { label: 'Class', val: taxonomy.class || (taxonomy as any).clade || 'Reptilia' },
      { label: 'Order', val: taxonomy.order || (taxonomy as any).suborder || 'Theropoda' },
      { label: 'Family', val: taxonomy.family || 'Dinosauridae' },
      { label: 'Genus', val: taxonomy.genus || taxonomy.species?.split(' ')[0] || '' },
      { label: 'Species', val: taxonomy.species || '' }
    ];

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs"
      >
        {ranks.map((r, i) => (
          <motion.div key={r.label} variants={itemVariants} whileTap={{ scale: 0.96 }}>
            <Link
              to={`/browse?search=${encodeURIComponent(r.val)}`}
              className={`p-2.5 rounded-none border transition-all flex flex-col gap-0.5 block ${
                i === ranks.length - 1
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-white'
              }`}
              title={`${r.label}: ${r.val}`}
            >
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                Rank: {r.label}
              </span>
              <span className="truncate text-xs font-semibold">{r.val}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  const parts = (taxonomicClassification || '').split('->').map(t => t.trim());
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-wrap items-center gap-2 font-mono text-xs"
    >
      {parts.map((p, i) => (
        <Fragment key={p}>
          <motion.div variants={itemVariants} whileTap={{ scale: 0.96 }}>
            <Link
              to={`/browse?search=${encodeURIComponent(p)}`}
              className="px-3 py-1.5 rounded-none bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-all font-semibold"
            >
              {p}
            </Link>
          </motion.div>
          {i < parts.length - 1 && <span className="text-amber-500 font-bold text-xs">&rarr;</span>}
        </Fragment>
      ))}
    </motion.div>
  );
}
