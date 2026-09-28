import { useEffect } from 'react';
import CladogramViewer from '../components/CladogramViewer.js';

export default function Cladogram() {
  useEffect(() => {
    document.title = 'Phylogenetic Tree of Life & Cladistics | Prehistorica Museum Pavilion';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <div className="py-6 sm:py-8 space-y-8">
      <CladogramViewer />
    </div>
  );
}
