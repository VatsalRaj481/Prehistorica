import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { TaxonomyHierarchy } from '../services/api.js';

interface TaxonomyBreadcrumbsProps {
  taxonomy?: TaxonomyHierarchy | null;
  taxonomicClassification?: string;
}

export default function TaxonomyBreadcrumbs({ taxonomy, taxonomicClassification }: TaxonomyBreadcrumbsProps) {
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
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {ranks.map((r, i) => (
          <Fragment key={r.label}>
            <Link
              to={`/browse?search=${encodeURIComponent(r.val)}`}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                i === ranks.length - 1
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={`${r.label}: ${r.val}`}
            >
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mr-0.5">
                {r.label[0]}:
              </span>
              <span>{r.val}</span>
            </Link>
            {i < ranks.length - 1 && <span className="text-slate-600 font-bold">&rarr;</span>}
          </Fragment>
        ))}
      </div>
    );
  }

  // Fallback to splitting legacy taxonomicClassification string
  const parts = (taxonomicClassification || '').split('->').map(t => t.trim());
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {parts.map((p, i) => (
        <Fragment key={p}>
          <Link
            to={`/browse?search=${encodeURIComponent(p)}`}
            className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {p}
          </Link>
          {i < parts.length - 1 && <span className="text-slate-600 font-bold">&rarr;</span>}
        </Fragment>
      ))}
    </div>
  );
}
