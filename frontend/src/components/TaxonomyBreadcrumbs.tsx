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
    let orderVal = taxonomy.order || (taxonomy as any).suborder || '';
    const famVal = taxonomy.family || '';
    if (orderVal && (orderVal.toLowerCase().endsWith('idae') || orderVal.toLowerCase() === famVal.toLowerCase())) {
      if ((taxonomy as any).suborder) {
        orderVal = (taxonomy as any).suborder;
      } else if (famVal.toLowerCase().includes('tyrannosaur') || famVal.toLowerCase().includes('allosaur') || famVal.toLowerCase().includes('dilophosaur') || famVal.toLowerCase().includes('dromaeosaur')) {
        orderVal = 'Saurischia';
      } else if (famVal.toLowerCase().includes('ceratops') || famVal.toLowerCase().includes('hadrosaur') || famVal.toLowerCase().includes('stegosaur') || famVal.toLowerCase().includes('ankylosaur')) {
        orderVal = 'Ornithischia';
      }
    }

    const ranks = [
      { label: 'Domain', val: taxonomy.domain || 'Eukaryota' },
      { label: 'Kingdom', val: taxonomy.kingdom || 'Animalia' },
      { label: 'Phylum', val: taxonomy.phylum || 'Chordata' },
      { label: 'Class', val: taxonomy.class || (taxonomy as any).clade || 'Reptilia' },
      { label: 'Order', val: orderVal || 'Saurischia' },
      { label: 'Family', val: famVal || 'Dinosauridae' },
      { label: 'Genus', val: taxonomy.genus || taxonomy.species?.split(' ')[0] || '' },
      { label: 'Species', val: taxonomy.species || '' }
    ];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="uppercase text-[10px] tracking-wider font-bold">Phylogenetic Classification</span>
          <Link
            to="/cladogram"
            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            <span>Tree of Life</span>
            <span>&rarr;</span>
          </Link>
        </div>
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
              className={`p-2 sm:p-2.5 rounded-lg border transition-all flex flex-col gap-0.5 block ${
                i === ranks.length - 1
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold'
                  : 'bg-slate-900/90 border-white/[0.08] text-slate-300 hover:border-amber-500/40 hover:text-white'
              }`}
              title={`${r.label}: ${r.val}`}
            >
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                Rank: {r.label}
              </span>
              <span
                className={`break-words text-xs font-semibold leading-snug ${
                  r.label === 'Genus' || r.label === 'Species' ? 'italic' : ''
                }`}
                title={`${r.label}: ${r.val}`}
              >
                {r.val}
              </span>
            </Link>
          </motion.div>
        ))}
        </motion.div>
      </div>
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
              className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-white/[0.08] text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all font-semibold"
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

