import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Bookmark,
  Trash2,
  Edit3,
  Check,
  X,
  ExternalLink,
  ArrowRight,
  Printer,
  Download,
  Tag,
  Plus,
  Scale
} from 'lucide-react';
import {
  getNotebookEntries,
  removeEntry,
  updateEntry,
  NOTEBOOK_UPDATED_EVENT,
  NotebookEntry
} from '../utils/notebookStorage.js';
import { fetchSpeciesCompare, Species } from '../services/api.js';
import { getSpeciesDisplayNames } from '../utils/formatSpeciesNames.js';
import { formatFeetLong } from '../utils/formatDimensions.js';

export default function FieldNotebook() {
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [newTagInput, setNewTagInput] = useState<{ id: number; text: string } | null>(null);
  const navigate = useNavigate();

  const reloadData = () => {
    const savedEntries = getNotebookEntries();
    setEntries(savedEntries);

    if (savedEntries.length === 0) {
      setSpeciesList([]);
      setLoading(false);
      return;
    }

    const ids = savedEntries.map((e) => e.id);
    fetchSpeciesCompare(ids)
      .then((data) => {
        setSpeciesList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load bookmarked species details:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = 'Archival Field Notebook | Prehistorica Museum';
    reloadData();

    const handleUpdate = () => reloadData();
    window.addEventListener(NOTEBOOK_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(NOTEBOOK_UPDATED_EVENT, handleUpdate);
  }, []);

  const allAvailableTags = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      e.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [entries]);

  const filteredSpecies = useMemo(() => {
    return speciesList.filter((sp) => {
      const entry = entries.find((e) => e.id === sp.id);
      if (!entry) return false;

      // Tag filter
      if (selectedTag !== 'all' && (!entry.tags || !entry.tags.includes(selectedTag))) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = sp.name.toLowerCase().includes(q) || sp.scientificName.toLowerCase().includes(q);
        const matchesClade = sp.clade.toLowerCase().includes(q);
        const matchesNotes = (entry.notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesClade && !matchesNotes) return false;
      }

      return true;
    });
  }, [speciesList, entries, selectedTag, searchQuery]);

  const handleSaveNote = (id: number) => {
    updateEntry(id, { notes: tempNote });
    setEditingNoteId(null);
  };

  const handleAddTag = (id: number, tag: string) => {
    const clean = tag.trim();
    if (!clean) return;
    const entry = entries.find((e) => e.id === id);
    const existingTags = entry?.tags || [];
    if (!existingTags.includes(clean)) {
      updateEntry(id, { tags: [...existingTags, clean] });
    }
    setNewTagInput(null);
  };

  const handleRemoveTag = (id: number, tagToRemove: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry && entry.tags) {
      updateEntry(id, { tags: entry.tags.filter((t) => t !== tagToRemove) });
    }
  };

  const handleSendAllToRunway = () => {
    const idsToSend = filteredSpecies.slice(0, 6).map((s) => s.id);
    if (idsToSend.length > 0) {
      navigate(`/runway?ids=${idsToSend.join(',')}`);
    }
  };

  const handleExportMarkdown = () => {
    let md = `# Prehistorica Museum — Archival Field Notebook Dossier\n`;
    md += `*Generated: ${new Date().toLocaleDateString()} — Total Curated Records: ${speciesList.length}*\n\n---\n\n`;

    speciesList.forEach((s) => {
      const entry = entries.find((e) => e.id === s.id);
      md += `## ${s.name} (*${s.scientificName}*)\n`;
      md += `- **Clade:** ${s.clade}\n`;
      md += `- **Geologic Period:** ${s.timePeriod} (${s.myaStart}–${s.myaEnd} Ma)\n`;
      md += `- **Fossil Formation:** ${s.fossilFormation || 'Unknown'}\n`;
      md += `- **Length:** ${s.lengthM ? `${s.lengthM}m` : 'Disputed'} | **Height:** ${s.heightM ? `${s.heightM}m` : 'Disputed'} | **Weight:** ${s.weightKg ? `${s.weightKg} kg` : 'Disputed'}\n`;
      if (entry?.tags?.length) {
        md += `- **Curatorial Tags:** ${entry.tags.join(', ')}\n`;
      }
      if (entry?.notes) {
        md += `\n> **Field Notes:**\n> ${entry.notes}\n`;
      }
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prehistorica_Field_Notebook_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 py-4 font-sans">
      {/* Header Plinth */}
      <div className="museum-plinth rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest">
              <BookOpen className="h-3.5 w-3.5" />
              Visitor Research Desk
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-100 font-sans">
              Archival Field Notebook
            </h1>
            <p className="text-sm text-slate-400 font-mono max-w-xl">
              Personal research binder holding curated prehistoric specimens, excavation logs, and curatorial comparative notes.
            </p>
          </div>

          {/* Action Toolbar */}
          {speciesList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
              <button
                onClick={handleSendAllToRunway}
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                title="Send first 6 specimens to the Caliper Runway"
              >
                <Scale className="h-4 w-4" /> Send to Runway
              </button>

              <button
                onClick={handleExportMarkdown}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-white/[0.08] text-slate-300 hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download Markdown Field Notes"
              >
                <Download className="h-4 w-4 text-amber-400" /> Export Dossier
              </button>

              <button
                onClick={() => window.print()}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Print Notebook Dossier"
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        {speciesList.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
            {/* Tag Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-3 py-1 rounded-md transition-all uppercase tracking-wider ${
                  selectedTag === 'all'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                All ({speciesList.length})
              </button>
              {allAvailableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-md transition-all uppercase tracking-wider flex items-center gap-1 ${
                    selectedTag === tag
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </button>
              ))}
            </div>

            {/* Quick search inside notebook */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notebook notes & taxa..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950/80 border border-white/[0.08] text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content Stream */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-slate-900/60 rounded-xl border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : speciesList.length === 0 ? (
        /* Empty State */
        <div className="museum-plinth rounded-2xl p-12 text-center border border-white/[0.08] space-y-5 max-w-2xl mx-auto shadow-2xl">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
            <Bookmark className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold uppercase tracking-wider text-slate-100 font-sans">
              Your Field Notebook is Empty
            </h3>
            <p className="text-xs font-mono text-slate-400 max-w-md mx-auto leading-relaxed">
              Explore the museum catalog and bookmark species to build your personal research collection, write field notes, and run custom multi-specimen size scale analyses.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-black uppercase tracking-wider rounded-lg shadow-lg transition-transform active:scale-95"
            >
              Explore Catalog Archive <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : filteredSpecies.length === 0 ? (
        /* No Search / Tag Matches */
        <div className="museum-plinth rounded-xl p-8 text-center border border-white/[0.08] space-y-3 font-mono">
          <p className="text-sm text-slate-400">No saved specimens match the selected tag or search filter.</p>
          <button
            onClick={() => {
              setSelectedTag('all');
              setSearchQuery('');
            }}
            className="text-xs text-amber-400 hover:underline uppercase tracking-wider font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Specimen Notebook Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AnimatePresence>
            {filteredSpecies.map((sp) => {
              const entry = entries.find((e) => e.id === sp.id);
              const names = getSpeciesDisplayNames(sp);
              const isEditing = editingNoteId === sp.id;
              const imgUrl = sp.reconstructionImageUrl || sp.media?.[0]?.url || '/logo.png';

              return (
                <motion.div
                  key={sp.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="museum-card rounded-2xl p-5 border border-white/[0.08] hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4 shadow-xl"
                >
                  {/* Specimen Header Row */}
                  <div className="flex items-start gap-4">
                    <Link
                      to={`/species/${sp.id}`}
                      className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-white/[0.08] group"
                    >
                      <img
                        src={imgUrl}
                        alt={sp.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                        <span className="text-[9px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1">
                          View <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      </div>
                    </Link>

                    <div className="flex-grow min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                          {sp.clade}
                        </span>
                        <button
                          onClick={() => removeEntry(sp.id)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                          title="Remove specimen from notebook"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <Link to={`/species/${sp.id}`} className="block group">
                        <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors uppercase font-sans truncate">
                          {names.heading}
                        </h3>
                        <p className="text-xs italic font-mono text-amber-400 truncate">
                          {names.subheading}
                        </p>
                      </Link>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-400 pt-1 border-t border-white/[0.06]">
                        <span>{sp.timePeriod}</span>
                        <span>&bull;</span>
                        <span className="text-slate-300 font-bold">{formatFeetLong(sp.lengthM)}</span>
                        {sp.fossilFormation && (
                          <>
                            <span>&bull;</span>
                            <span className="truncate max-w-[140px] text-amber-300/80">{sp.fossilFormation}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Personal Field Notes Section */}
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <Edit3 className="h-3 w-3" /> Field Observation Notes
                      </span>
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingNoteId(sp.id);
                            setTempNote(entry?.notes || '');
                          }}
                          className="hover:text-white transition-colors cursor-pointer"
                        >
                          {entry?.notes ? 'Edit Notes' : '+ Add Notes'}
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="Record osteology notes, diet hypotheses, or exhibit remarks..."
                          className="w-full p-2 rounded bg-slate-900 border border-white/[0.08] text-xs font-sans text-slate-200 focus:outline-none focus:border-amber-500/40 min-h-[60px]"
                        />
                        <div className="flex justify-end gap-2 text-xs font-mono">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-2.5 py-1 rounded bg-slate-900 text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(sp.id)}
                            className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-sans text-slate-300 italic min-h-[28px] leading-relaxed">
                        {entry?.notes ? `"${entry.notes}"` : <span className="text-slate-600 not-italic">No notes recorded yet.</span>}
                      </p>
                    )}
                  </div>

                  {/* Tags Row */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                    {(entry?.tags || []).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-white/[0.08] text-slate-300"
                      >
                        <Tag className="h-2.5 w-2.5 text-amber-400" />
                        {t}
                        <button
                          onClick={() => handleRemoveTag(sp.id, t)}
                          className="hover:text-red-400 ml-0.5"
                          title={`Remove ${t}`}
                        >
                          &times;
                        </button>
                      </span>
                    ))}

                    {newTagInput?.id === sp.id ? (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          autoFocus
                          value={newTagInput.text}
                          onChange={(e) => setNewTagInput({ id: sp.id, text: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddTag(sp.id, newTagInput.text);
                            if (e.key === 'Escape') setNewTagInput(null);
                          }}
                          placeholder="Tag..."
                          className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-amber-500/50 text-[10px] text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddTag(sp.id, newTagInput.text)}
                          className="text-amber-400 hover:text-white"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button onClick={() => setNewTagInput(null)} className="text-slate-500 hover:text-white">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setNewTagInput({ id: sp.id, text: '' })}
                        className="px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-900 border border-dashed border-white/[0.12] text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-2.5 w-2.5" /> Tag
                      </button>
                    )}
                  </div>

                  {/* Quick Action Footer */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px]">
                    <button
                      onClick={() => navigate(`/runway?ids=${sp.id}`)}
                      className="text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Scale className="h-3.5 w-3.5 text-amber-400" /> Lineup on Runway
                    </button>

                    <Link
                      to={`/species/${sp.id}`}
                      className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      Exhibit Details <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
