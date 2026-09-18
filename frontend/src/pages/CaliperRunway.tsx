import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  fetchSpeciesCompare,
  fetchSpeciesRoster,
  Species,
  SpeciesRosterItem
} from '../services/api.js';
import RunwayStage from '../components/RunwayStage.js';
import {
  Scale,
  Plus,
  Trash2,
  User,
  Car,
  Bus,
  Sparkles,
  Layers,
  Ruler,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatFeetLong } from '../utils/formatDimensions.js';

interface PresetLineup {
  name: string;
  desc: string;
  speciesNames: string[];
}

const PRESETS: PresetLineup[] = [
  {
    name: 'Clash of Megatheropods',
    desc: 'The largest predatory theropods ever to walk the Earth.',
    speciesNames: ['Tyrannosaurus', 'Spinosaurus', 'Giganotosaurus', 'Carcharodontosaurus']
  },
  {
    name: 'Titans of the South',
    desc: 'Colossal titanosaur sauropods of South America and India.',
    speciesNames: ['Argentinosaurus', 'Patagotitan', 'Dreadnoughtus', 'Isisaurus']
  },
  {
    name: 'Azhdarchid Aerial Armada',
    desc: 'Giraffe-sized apex pterosaurs of the Azhdarchidae family.',
    speciesNames: ['Quetzalcoatlus', 'Hatzegopteryx', 'Thanatosdrakon', 'Azhdarcho']
  },
  {
    name: 'Armored Bastions',
    desc: 'Heavy osteoderm armor, tail clubs, dorsal plates, and defensive horns.',
    speciesNames: ['Ankylosaurus', 'Stegosaurus', 'Triceratops', 'Doedicurus']
  }
];

export default function CaliperRunway() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [roster, setRoster] = useState<SpeciesRosterItem[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [rosterSearch, setRosterSearch] = useState('');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [activeReference, setActiveReference] = useState<'human' | 'car' | 'bus' | 'elephant' | 'none'>('human');
  const [showGrid, setShowGrid] = useState(true);
  const [showCalipers, setShowCalipers] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // 1. Load full roster for search
  useEffect(() => {
    document.title = 'Multi-Specimen Caliper Runway | Prehistorica Museum';
    fetchSpeciesRoster()
      .then((data) => setRoster(data))
      .catch((err) => console.error('Failed to load roster:', err));
  }, []);

  // 2. Load species based on URL query params or default preset
  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      const ids = idsParam
        .split(',')
        .map((i) => parseInt(i.trim(), 10))
        .filter((i) => !isNaN(i))
        .slice(0, 6);

      if (ids.length > 0) {
        setLoading(true);
        fetchSpeciesCompare(ids)
          .then((data) => {
            setSelectedSpecies(data);
            setLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
        return;
      }
    }

    // Default to Megatheropods preset if no URL params
    if (roster.length > 0 && selectedSpecies.length === 0) {
      loadPreset(PRESETS[0]);
    }
  }, [searchParams, roster]);

  const updateUrlIds = (speciesList: Species[]) => {
    const ids = speciesList.map((s) => s.id).join(',');
    if (ids) {
      setSearchParams({ ids });
    } else {
      setSearchParams({});
    }
  };

  const loadPreset = async (preset: PresetLineup) => {
    setLoading(true);
    const matchedIds: number[] = [];

    preset.speciesNames.forEach((targetName) => {
      const lower = targetName.toLowerCase();
      const wordRegex = new RegExp(`\\b${targetName}\\b`, 'i');
      const found =
        // 1. Exact match on name or scientificName
        roster.find((r) => r.name.toLowerCase() === lower || r.scientificName.toLowerCase() === lower) ||
        // 2. Starts-with genus match (e.g. "Spinosaurus aegyptiacus" starts with "Spinosaurus ")
        roster.find((r) => r.name.toLowerCase().startsWith(lower + ' ') || r.scientificName.toLowerCase().startsWith(lower + ' ')) ||
        // 3. Whole-word boundary match (prevents "Gigantspinosaurus" from matching "Spinosaurus")
        roster.find((r) => wordRegex.test(r.name) || wordRegex.test(r.scientificName)) ||
        // 4. Fallback substring contains
        roster.find((r) => r.name.toLowerCase().includes(lower) || r.scientificName.toLowerCase().includes(lower));

      if (found) matchedIds.push(found.id);
    });

    if (matchedIds.length > 0) {
      try {
        const data = await fetchSpeciesCompare(matchedIds);
        setSelectedSpecies(data);
        updateUrlIds(data);
      } catch (e) {
        console.error('Failed to load preset species:', e);
      }
    }
    setLoading(false);
  };

  const handleAddSpecies = async (rosterItem: SpeciesRosterItem) => {
    if (selectedSpecies.some((s) => s.id === rosterItem.id)) return;
    if (selectedSpecies.length >= 6) return;

    setLoading(true);
    setIsSelectorOpen(false);
    setRosterSearch('');

    try {
      const [full] = await fetchSpeciesCompare([rosterItem.id]);
      if (full) {
        const updated = [...selectedSpecies, full];
        setSelectedSpecies(updated);
        updateUrlIds(updated);
      }
    } catch (err) {
      console.error('Failed to add species:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSpecies = (index: number) => {
    const updated = selectedSpecies.filter((_, i) => i !== index);
    setSelectedSpecies(updated);
    updateUrlIds(updated);
    if (highlightedIndex === index) setHighlightedIndex(null);
  };

  const handleMoveSpecies = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedSpecies.length) return;

    const copy = [...selectedSpecies];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    setSelectedSpecies(copy);
    updateUrlIds(copy);
    setHighlightedIndex(targetIndex);
  };

  const filteredRoster = useMemo(() => {
    if (!rosterSearch.trim()) return roster.slice(0, 15);
    const q = rosterSearch.toLowerCase().trim();
    return roster
      .filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.scientificName.toLowerCase().includes(q) ||
          r.clade.toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [roster, rosterSearch]);

  // Max metrics on stage for comparison percentages
  const maxMetrics = useMemo(() => {
    const maxLen = Math.max(1, ...selectedSpecies.map((s) => s.lengthM || 0));
    const maxH = Math.max(1, ...selectedSpecies.map((s) => s.heightM || 0));
    const maxW = Math.max(1, ...selectedSpecies.map((s) => s.weightKg || 0));
    return { maxLen, maxH, maxW };
  }, [selectedSpecies]);

  return (
    <div className="space-y-8 py-4 font-sans">
      {/* Top Architectural Header */}
      <div className="museum-plinth rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest">
              <Scale className="h-3.5 w-3.5" />
              1:1 Cartesian Caliper Stage
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-100 font-sans">
              Multi-Specimen Caliper Runway
            </h1>
            <p className="text-sm text-slate-400 font-mono max-w-xl">
              Simultaneously project up to 6 prehistoric species on a single calibrated metric runway alongside architectural reference models.
            </p>
          </div>

          {/* Reference Switcher & Tools */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="p-1 rounded-lg bg-slate-900 border border-white/[0.08] flex items-center gap-1">
              <button
                onClick={() => setActiveReference('human')}
                className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 uppercase font-bold transition-all cursor-pointer ${
                  activeReference === 'human'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="1.8m Architectural Human"
              >
                <User className="h-3 w-3" /> Human
              </button>

              <button
                onClick={() => setActiveReference('car')}
                className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 uppercase font-bold transition-all cursor-pointer ${
                  activeReference === 'car'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="4.5m Sedan Car"
              >
                <Car className="h-3 w-3" /> Vehicle
              </button>

              <button
                onClick={() => setActiveReference('bus')}
                className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 uppercase font-bold transition-all cursor-pointer ${
                  activeReference === 'bus'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="11.5m Transit Bus"
              >
                <Bus className="h-3 w-3" /> Bus
              </button>

              <button
                onClick={() => setActiveReference('none')}
                className={`px-2 py-1.5 rounded uppercase font-bold transition-all cursor-pointer ${
                  activeReference === 'none'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-white'
                }`}
                title="Hide reference models"
              >
                Off
              </button>
            </div>

            {/* Grid and Caliper toggles */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg border uppercase transition-colors cursor-pointer ${
                showGrid
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-white/[0.08] text-slate-400'
              }`}
              title="Toggle Metric Grid"
            >
              <Layers className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowCalipers(!showCalipers)}
              className={`p-2 rounded-lg border uppercase transition-colors cursor-pointer ${
                showCalipers
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-white/[0.08] text-slate-400'
              }`}
              title="Toggle Dimension Calipers"
            >
              <Ruler className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Curated Matchup Presets Bar */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" /> Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => loadPreset(p)}
              className="px-3 py-1 rounded-md bg-slate-900 hover:bg-slate-850 border border-white/[0.08] hover:border-amber-500/40 text-slate-300 hover:text-white uppercase tracking-wider text-[11px] transition-colors cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Caliper Stage Viewport */}
      {loading ? (
        <div className="h-[480px] bg-slate-950 rounded-2xl border border-white/[0.08] flex flex-col items-center justify-center gap-3 animate-pulse font-mono text-slate-400">
          <Ruler className="h-8 w-8 text-amber-400 animate-spin" />
          <span className="text-xs uppercase tracking-widest">Calibrating Runway Stage Units...</span>
        </div>
      ) : selectedSpecies.length === 0 ? (
        <div className="museum-plinth rounded-2xl p-12 text-center border border-white/[0.08] space-y-4 font-mono">
          <Scale className="h-10 w-10 text-amber-400 mx-auto" />
          <h3 className="text-base text-slate-200 uppercase font-bold">No Specimen On The Runway</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Select a preset above or add creatures from the 592-species roster below.
          </p>
        </div>
      ) : (
        <RunwayStage
          speciesList={selectedSpecies}
          activeReference={activeReference}
          showGrid={showGrid}
          showCalipers={showCalipers}
          highlightedIndex={highlightedIndex}
          onSelectIndex={(idx) => setHighlightedIndex(idx === highlightedIndex ? null : idx)}
        />
      )}

      {/* Lineup Management Tray */}
      <div className="museum-plinth rounded-2xl p-5 sm:p-6 border border-white/[0.08] space-y-4 font-mono shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Runway Lineup Tray ({selectedSpecies.length}/6)
            </h3>
            <span className="text-[10px] text-slate-500">Reorder, replace, or inspect</span>
          </div>

          {selectedSpecies.length < 6 && (
            <div className="relative">
              <button
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" /> Add Creature
              </button>

              {/* Autocomplete Dropdown Popover */}
              {isSelectorOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-900 border border-white/[0.12] rounded-xl shadow-2xl p-3 z-50 space-y-2">
                  <input
                    type="text"
                    autoFocus
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="Search 592 species..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/[0.1] text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                  />
                  <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-white/[0.04]">
                    {filteredRoster.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleAddSpecies(item)}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-slate-200 uppercase truncate font-sans">{item.name}</p>
                          <p className="text-[10px] text-amber-400 italic truncate font-mono">
                            {item.clade} &bull; {item.lengthM ? `${item.lengthM}m` : 'size unconfirmed'}
                          </p>
                        </div>
                        <Plus className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Specimen Management Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {selectedSpecies.map((sp, idx) => {
            const isHighlighted = highlightedIndex === idx;
            return (
              <div
                key={sp.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isHighlighted
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                    : 'bg-slate-900/80 border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <div
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                  onClick={() => setHighlightedIndex(idx === highlightedIndex ? null : idx)}
                >
                  <span className="h-6 w-6 rounded bg-slate-950 border border-white/[0.08] flex items-center justify-center text-[10px] font-black text-amber-400 shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 uppercase font-sans truncate">{sp.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate">
                      {formatFeetLong(sp.lengthM)} &bull; {sp.clade}
                    </p>
                  </div>
                </div>

                {/* Move Left / Right / Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveSpecies(idx, 'left')}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move Left"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={idx === selectedSpecies.length - 1}
                    onClick={() => handleMoveSpecies(idx, 'right')}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move Right"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveSpecies(idx)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors ml-1"
                    title="Remove from Runway"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparative Analytics Matrix Table */}
      {selectedSpecies.length > 1 && (
        <div className="museum-plinth rounded-2xl p-5 sm:p-6 border border-white/[0.08] space-y-4 font-mono shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <Ruler className="h-4 w-4" /> Comparative Dimensional Differential Matrix
            </h3>
            <span className="text-[10px] text-slate-500 uppercase">Proportional differential vs maximum</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400 text-[10px] uppercase">
                  <th className="py-2 pr-4">Taxon</th>
                  <th className="py-2 px-3">Total Length</th>
                  <th className="py-2 px-3">Standing Height</th>
                  <th className="py-2 px-3">Estimated Mass</th>
                  <th className="py-2 pl-3">Geologic Era</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {selectedSpecies.map((sp, idx) => {
                  const lenPct = Math.round(((sp.lengthM || 0) / maxMetrics.maxLen) * 100);
                  const isHighlighted = highlightedIndex === idx;

                  return (
                    <tr
                      key={sp.id}
                      onClick={() => setHighlightedIndex(idx === highlightedIndex ? null : idx)}
                      className={`cursor-pointer transition-colors ${
                        isHighlighted ? 'bg-amber-500/10' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="py-3 pr-4 font-sans font-bold text-slate-100 flex items-center gap-2">
                        <span className="text-amber-400 font-mono text-[10px]">#{idx + 1}</span>
                        <span>{sp.name}</span>
                        <Link
                          to={`/species/${sp.id}`}
                          className="text-slate-500 hover:text-amber-400 ml-1"
                          title="Open Specimen Profile"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <span className="text-amber-400 font-bold tabular-nums">
                            {formatFeetLong(sp.lengthM)}
                          </span>
                          <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${lenPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 tabular-nums text-slate-300">
                        {formatFeetLong(sp.heightM)}
                      </td>

                      <td className="py-3 px-3 tabular-nums text-slate-300">
                        {sp.weightKg ? `${sp.weightKg.toLocaleString()} KG` : 'Disputed'}
                      </td>

                      <td className="py-3 pl-3 text-slate-400 truncate max-w-[140px]">
                        {sp.timePeriod}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
