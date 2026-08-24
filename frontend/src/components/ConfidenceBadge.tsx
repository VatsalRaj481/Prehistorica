interface ConfidenceBadgeProps {
  confidence?: 'well-supported' | 'estimated' | 'disputed' | string;
  type?: 'size' | 'taxonomic';
  status?: 'valid' | 'disputed' | 'synonym' | 'nomen_dubium' | string;
}

export default function ConfidenceBadge({ confidence, type = 'size', status }: ConfidenceBadgeProps) {
  if (type === 'taxonomic' && status) {
    switch (status) {
      case 'valid':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            Valid Taxon
          </span>
        );
      case 'disputed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
            ⚠️ Disputed Taxon
          </span>
        );
      case 'synonym':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
            Junior Synonym
          </span>
        );
      case 'nomen_dubium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
            ⚠️ Nomen Dubium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 border border-slate-700 text-slate-400">
            {status}
          </span>
        );
    }
  }

  if (confidence) {
    switch (confidence) {
      case 'well-supported':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider">
            Well-Supported
          </span>
        );
      case 'estimated':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-wider">
            Estimated
          </span>
        );
      case 'disputed':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider">
            ⚠️ Disputed
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 border border-slate-700 text-slate-400 uppercase tracking-wider">
            {confidence}
          </span>
        );
    }
  }

  return null;
}
