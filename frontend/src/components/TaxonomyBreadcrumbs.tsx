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

  const pillVariants: Variants = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.9, y: shouldReduceMotion ? 0 : 4 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    }
  };

  if (taxonomy) {
    const ranks = [
      { label: 'Domain', val: taxonomy.domain },
      { label: 'Kingdom', val: taxonomy.kingdom },
      { label: 'Phylum', val: taxonomy.phylum },
      { label: 'Class', val: taxonomy.class },
      { label: 'Order', val: taxonomy.order },
      { label: 'Family', val: taxonomy.family },
      { label: 'Genus', val: taxonomy.genus },
      { label: 'Species', val: taxonomy.species }
    ];

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-wrap items-center gap-1.5 text-xs"
      >
        {ranks.map((r, i) => (
          <Fragment key={r.label}>
            <motion.div variants={pillVariants} whileTap={{ scale: 0.94 }}>
              <Link
                to={`/browse?search=${encodeURIComponent(r.val)}`}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 shadow-sm ${
                  i === ranks.length - 1
                    ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold'
                    : 'bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={`${r.label}: ${r.val}`}
              >
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mr-0.5">
                  {r.label[0]}:
                </span>
                <span>{r.val}</span>
              </Link>
            </motion.div>
            {i < ranks.length - 1 && <span className="text-slate-600 font-bold text-[10px]">&rarr;</span>}
          </Fragment>
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
      className="flex flex-wrap items-center gap-1.5 text-xs"
    >
      {parts.map((p, i) => (
        <Fragment key={p}>
          <motion.div variants={pillVariants} whileTap={{ scale: 0.94 }}>
            <Link
              to={`/browse?search=${encodeURIComponent(p)}`}
              className="px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
            >
              {p}
            </Link>
          </motion.div>
          {i < parts.length - 1 && <span className="text-slate-600 font-bold text-[10px]">&rarr;</span>}
        </Fragment>
      ))}
    </motion.div>
  );
}
