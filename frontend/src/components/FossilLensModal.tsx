import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  X,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ScanLine
} from 'lucide-react';
import { identifyFossil, FossilAnalysis } from '../services/api.js';

interface FossilLensModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_SPECIMENS = [
  {
    name: 'Kem Kem Spinosaur Tooth',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Spinosaurus_tooth_Cenomanian_Morocco.jpg/640px-Spinosaurus_tooth_Cenomanian_Morocco.jpg'
  },
  {
    name: 'Theropod Ungual (Claw)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Allosaurus_claw.jpg/640px-Allosaurus_claw.jpg'
  },
  {
    name: 'Ammonite Suture Pattern',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Ammonite_Asteroceras.jpg/640px-Ammonite_Asteroceras.jpg'
  }
];

export default function FossilLensModal({ isOpen, onClose }: FossilLensModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FossilAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setError(null);
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setError(null);
    setAnalysis(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compress and scale down to max 800x800 for optimal processing
        const canvas = document.createElement('canvas');
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        setSelectedImage(compressedBase64);
        runAnalysis(compressedBase64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async (base64: string) => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await identifyFossil(base64, 'image/jpeg');
      setAnalysis(res.analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect fossil specimen. Please try another image.');
    } finally {
      setAnalyzing(false);
    }
  };

  const loadSampleSpecimen = async (url: string) => {
    try {
      setAnalyzing(true);
      setError(null);
      // Fetch sample via image element to canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(dataUrl);
        runAnalysis(dataUrl);
      };
      img.src = url;
    } catch {
      setError('Could not load sample specimen. Please upload your own photo.');
      setAnalyzing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.08] bg-slate-950/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold tracking-wide font-mono text-slate-100 uppercase">
                      Fossil Lens
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                      Multimodal Osteology
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Identify bones, teeth, claws, and match to Prehistorica silhouettes
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  resetState();
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-white/[0.08] text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {!selectedImage ? (
                <div className="space-y-6">
                  {/* Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files[0]) handleImageUpload(e.dataTransfer.files[0]);
                    }}
                    className="border-2 border-dashed border-white/[0.15] hover:border-amber-500/50 bg-slate-950/60 hover:bg-slate-950 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                    />
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-200 group-hover:text-amber-300 font-mono">
                        Drop fossil photo here or click to browse
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        Supports high-resolution photos of teeth, vertebrae, claws, osteoderms, and casts
                      </p>
                    </div>
                  </div>

                  {/* Sample Specimens */}
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Or analyze a curated specimen:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {SAMPLE_SPECIMENS.map((sample, idx) => (
                        <button
                          key={idx}
                          onClick={() => loadSampleSpecimen(sample.url)}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/[0.08] hover:border-amber-500/30 text-left transition-all cursor-pointer group"
                        >
                          <img
                            src={sample.url}
                            alt={sample.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-white/[0.08]"
                          />
                          <span className="text-xs font-bold font-mono text-slate-200 group-hover:text-amber-300">
                            {sample.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Image Preview & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    <div className="md:col-span-4 relative rounded-xl overflow-hidden border border-white/[0.1] bg-slate-950 flex items-center justify-center aspect-square">
                      <img
                        src={selectedImage}
                        alt="Uploaded fossil"
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={resetState}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-white/[0.1] text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Change</span>
                      </button>
                    </div>

                    <div className="md:col-span-8 space-y-4">
                      {analyzing ? (
                        <div className="p-8 rounded-xl bg-slate-950/60 border border-white/[0.08] flex flex-col items-center justify-center text-center gap-3">
                          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                          <h3 className="text-sm font-bold font-mono text-slate-200">
                            Morphological Osteology Scan in Progress...
                          </h3>
                          <p className="text-xs text-slate-400 font-mono max-w-sm">
                            Inspecting denticle carinae, trabecular bone porosity, and phylogenetic cladograms
                          </p>
                        </div>
                      ) : error ? (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono space-y-2">
                          <div className="flex items-center gap-2 font-bold">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span>Scan Interrupted</span>
                          </div>
                          <p>{error}</p>
                          <button
                            onClick={() => runAnalysis(selectedImage)}
                            className="px-3 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 font-bold uppercase tracking-wider"
                          >
                            Retry Inspection
                          </button>
                        </div>
                      ) : analysis ? (
                        <div className="space-y-4">
                          {/* Authenticity & Element Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs">
                              {analysis.fossilAuthenticity}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/[0.1] text-slate-200 font-mono text-xs">
                              Element: {analysis.anatomicalElement}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs">
                              Confidence: {analysis.overallConfidence}%
                            </span>
                          </div>

                          {/* Morphological Observations */}
                          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.08] space-y-2">
                            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                              Comparative Osteology Observations:
                            </h4>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                              {analysis.morphologicalObservations.map((obs, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                                  <span>{obs}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Preservation & Tests */}
                          <div className="text-xs text-slate-400 font-mono space-y-1">
                            <p>
                              <strong className="text-slate-300">Taphonomy:</strong>{' '}
                              {analysis.preservationNotes}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Prehistorica Species Candidate Matches */}
                  {analysis && analysis.candidatePrehistoricaSpecies.length > 0 && (
                    <div className="pt-4 border-t border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                          <ScanLine className="w-4 h-4" />
                          Prehistorica Catalog Matches ({analysis.candidatePrehistoricaSpecies.length})
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          Calibrated Silhouette & Profile Verification
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {analysis.candidatePrehistoricaSpecies.map((cand, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-500/30 transition-all flex flex-col justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-14 h-14 rounded-lg bg-slate-900 border border-white/[0.08] p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                {cand.silhouetteUrl ? (
                                  <img
                                    src={cand.silhouetteUrl}
                                    alt={cand.name}
                                    className="w-10 h-10 object-contain filter invert opacity-80"
                                  />
                                ) : cand.reconstructionUrl ? (
                                  <img
                                    src={cand.reconstructionUrl}
                                    alt={cand.name}
                                    className="w-full h-full object-cover rounded"
                                  />
                                ) : (
                                  <Camera className="w-6 h-6 text-slate-600" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-sm font-bold text-slate-100 font-mono">
                                    {cand.name}
                                  </h5>
                                  <span
                                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                      cand.confidence === 'High'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : cand.confidence === 'Moderate'
                                          ? 'bg-amber-500/20 text-amber-300'
                                          : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {cand.confidence}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 italic">
                                  {cand.scientificName}
                                </p>
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-850 text-slate-400 text-[10px] font-mono">
                                  {cand.clade}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-sans">
                              {cand.rationale}
                            </p>

                            {cand.speciesId && (
                              <Link
                                to={`/species/${cand.speciesId}`}
                                onClick={onClose}
                                className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold transition-all"
                              >
                                <span>Inspect Specimen Exhibit</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
