import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Species, fetchSpeciesCompare, fetchSpecies } from '../services/api.js';
import { X, ArrowRightLeft, Scale, Calendar, Dna, MapPin } from 'lucide-react';

interface CompareModalProps {
  initialSpecies?: Species | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompareModal({ initialSpecies, isOpen, onClose }: CompareModalProps) {
  const [species1, setSpecies1] = useState<Species | null>(initialSpecies || null);
  const [species2, setSpecies2] = useState<Species | null>(null);
  const [availableList, setAvailableList] = useState<Species[]>([]);
  const [selectedId2, setSelectedId2] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (initialSpecies) {
      setSpecies1(initialSpecies);
    }
  }, [initialSpecies]);

  useEffect(() => {
    if (isOpen) {
      fetchSpecies({ limit: 100 })
        .then((res: any) => {
          const list = Array.isArray(res) ? res : res.data || [];
          setAvailableList(list);
          if (list.length > 1 && !species2) {
            const second = list.find((s: Species) => s.id !== species1?.id) || list[1];
            setSpecies2(second);
            setSelectedId2(second.id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSelectSecond = (idStr: string) => {
    const id = parseInt(idStr, 10);
    setSelectedId2(id);
    if (!isNaN(id)) {
      setLoading(true);
      fetchSpeciesCompare([species1?.id || 1, id])
        .then((res) => {
          if (res.length >= 2) {
            setSpecies2(res[1]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  const formatClade = (cladeStr?: string | null) => {
    if (!cladeStr) return 'Unspecified';
    if (cladeStr === 'Early_Mammal_Synapsid') return 'Early Mammal / Synapsid';
    if (cladeStr === 'Marine_Reptile') return 'Marine Reptile';
    if (cladeStr === 'Early_Tetrapod_Amphibian') return 'Early Tetrapod / Amphibian';
    return cladeStr.replace(/_/g, ' ');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-bold text-slate-100">Species Side-by-Side Comparison</h2>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Picker for Species #2 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider shrink-0">
                Comparing: <strong className="text-blue-400">{species1?.name || 'Species 1'}</strong> vs
              </span>
              <select
                value={selectedId2}
                onChange={(e) => handleSelectSecond(e.target.value)}
                disabled={loading}
                className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-auto flex-1 disabled:opacity-50 transition-colors"
              >
                <option value="">{loading ? 'Loading comparison...' : '-- Pick Species to Compare --'}</option>
                {availableList
                  .filter(s => s.id !== species1?.id)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formatClade(s.clade)} &bull; {s.timePeriod})
                    </option>
                  ))}
              </select>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
              {/* Species 1 Column */}
              {species1 && (
                <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800 shadow-inner">
                  <div className="relative h-44 bg-slate-950 rounded-lg overflow-hidden border border-slate-850 flex items-center justify-center p-3">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                    {species1.reconstructionImageUrl ? (
                      <img src={species1.reconstructionImageUrl} alt={species1.name} className="max-w-full max-h-full object-contain rounded drop-shadow z-10" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">No Image</div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-100">{species1.name}</h3>
                    <p className="text-xs italic text-slate-400">{species1.scientificName}</p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1"><Scale className="h-3 w-3" /> Length</span>
                      <span className="font-extrabold text-blue-400">{species1.lengthM ? `${species1.lengthM} m` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1"><Scale className="h-3 w-3" /> Height</span>
                      <span className="font-extrabold text-blue-400">{species1.heightM ? `${species1.heightM} m` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1"><Scale className="h-3 w-3" /> Mass</span>
                      <span className="font-extrabold text-blue-400">{species1.weightKg ? `${species1.weightKg.toLocaleString()} kg` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" /> Era</span>
                      <span className="font-bold text-slate-200">{species1.timePeriod}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1"><Dna className="h-3 w-3" /> Clade</span>
                      <span className="font-bold text-indigo-400">{formatClade(species1.clade)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1"><MapPin className="h-3 w-3" /> Formation</span>
                      <span className="font-bold text-slate-200">{species1.fossilFormation || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Species 2 Column */}
              {species2 ? (
                <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800 shadow-inner">
                  <div className="relative h-44 bg-slate-950 rounded-lg overflow-hidden border border-slate-850 flex items-center justify-center p-3">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                    {species2.reconstructionImageUrl ? (
                      <img src={species2.reconstructionImageUrl} alt={species2.name} className="max-w-full max-h-full object-contain rounded drop-shadow z-10" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">No Image</div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-100">{species2.name}</h3>
                    <p className="text-xs italic text-slate-400">{species2.scientificName}</p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1"><Scale className="h-3 w-3" /> Length</span>
                      <span className="font-extrabold text-blue-400">{species2.lengthM ? `${species2.lengthM} m` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1"><Scale className="h-3 w-3" /> Height</span>
                      <span className="font-extrabold text-blue-400">{species2.heightM ? `${species2.heightM} m` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1"><Scale className="h-3 w-3" /> Mass</span>
                      <span className="font-extrabold text-blue-400">{species2.weightKg ? `${species2.weightKg.toLocaleString()} kg` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" /> Era</span>
                      <span className="font-bold text-slate-200">{species2.timePeriod}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1"><Dna className="h-3 w-3" /> Clade</span>
                      <span className="font-bold text-indigo-400">{formatClade(species2.clade)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500 font-semibold flex items-center gap-1"><MapPin className="h-3 w-3" /> Formation</span>
                      <span className="font-bold text-slate-200">{species2.fossilFormation || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                  <p className="text-sm font-semibold">Select a second species above to compare side-by-side.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
