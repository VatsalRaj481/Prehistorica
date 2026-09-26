export interface MediaItem {
  url: string;
  type: 'photo' | 'art' | 'scale_diagram' | 'fossil_specimen' | 'skeletal_reconstruction' | 'comparative_anatomy' | 'scientific_figure' | 'taxonomy_diagram' | 'placeholder' | string;
  credit: string;
  sourceUrl: string;
}

export interface TaxonomyHierarchy {
  domain: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
}

export interface SizeMetricEstimate {
  value: number | null;
  unit: string;
  confidence: 'well-supported' | 'estimated' | 'disputed';
}

export interface SizeEstimate {
  length: SizeMetricEstimate;
  height: SizeMetricEstimate;
  weight: SizeMetricEstimate;
}

export interface SourceCitation {
  citation: string;
  url: string;
}

export interface Species {
  id: number;
  name: string;
  scientificName: string;
  nameMeaning: string;
  timePeriod: string;
  epoch?: string | null;
  myaStart: number;
  myaEnd: number;
  dietType: string;
  diet: 'carnivore' | 'herbivore' | 'omnivore' | 'piscivore' | 'filter_feeder' | 'unknown';
  dietDetails: string;
  habitat: 'terrestrial' | 'marine' | 'freshwater' | 'aerial' | 'semi_aquatic';
  clade: string;
  locations: string[];
  country?: string | null;
  fossilFormation?: string | null;
  geographicRange?: { region: string; country: string; fossilFormation: string } | null;
  taxonomicClassification: string;
  taxonomy?: TaxonomyHierarchy | null;
  taxonomicStatus: 'valid' | 'disputed' | 'synonym' | 'nomen_dubium';
  genus?: string | null;
  family?: string | null;
  creatureType?: string | null;
  reconstructionImageUrl: string | null;
  fossilImageUrl: string | null;
  media?: MediaItem[];
  discoveryHistory: string;
  interestingFacts: string[];
  lengthM: number | null;
  heightM: number | null;
  weightKg: number | null;
  sizeNotes: string;
  sizeEstimate?: SizeEstimate | null;
  sizeComparisonToHuman: boolean;
  extinctionEvent?: string | null;
  closestLivingRelatives?: string[];
  sources?: SourceCitation[];
  placeholder?: boolean;
  isMapFallback?: boolean;
  comparisonSilhouette?: {
    url?: string | null;
    sourceUrl?: string | null;
    license?: string | null;
    credit?: string | null;
    taxon?: string | null;
    taxonMatch?: 'species-specific' | 'generic approximation, not species-specific' | string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  relatedSpecies?: Species[];
}

export interface PaginatedSpeciesResponse {
  data: Species[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AutocompleteItem {
  id: number;
  name: string;
  scientificName: string;
  clade: string;
  fossilFormation?: string | null;
  reconstructionImageUrl?: string | null;
}

const rawApiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://prehistorica.onrender.com/api');
const cleanApiUrl = rawApiUrl.replace(/\/$/, '');
const API_BASE = cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`;

/**
 * Canonical Single Source of Truth for verified cataloged specimens count across Prehistorica.
 */
export const TOTAL_CATALOGED_SPECIMENS = 596;

/**
 * Fire-and-forget wake ping to wake up a sleeping backend immediately upon app load.
 * Does not block rendering and silently ignores errors.
 */
export function wakePing(): void {
  const healthUrl = `${API_BASE}/health`;
  fetch(healthUrl, { method: 'GET' }).catch(() => {
    // Silently ignore errors
  });
}

/**
 * Fetch wrapper with retry-with-backoff for handling cold starts / temporary gateway timeouts.
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries = 3,
  delayMs = 3000
): Promise<Response> {
  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok && [502, 503, 504].includes(response.status) && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      return response;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error(`Request failed after ${retries} retries`);
}

export async function fetchSpecies(filters?: {
  diet?: string | string[];
  habitat?: string | string[];
  clade?: string | string[];
  location?: string;
  time_period?: string;
  mya_start?: number;
  mya_end?: number;
  search?: string;
  fossil_formation?: string;
  country?: string;
  creature_type?: string;
  min_length?: number;
  max_length?: number;
  page?: number;
  limit?: number;
}): Promise<Species[] | PaginatedSpeciesResponse> {
  const params = new URLSearchParams();

  if (filters?.diet) {
    const dietVal = Array.isArray(filters.diet) ? filters.diet.join(',') : filters.diet;
    if (dietVal) params.append('diet', dietVal);
  }
  if (filters?.habitat) {
    const habVal = Array.isArray(filters.habitat) ? filters.habitat.join(',') : filters.habitat;
    if (habVal) params.append('habitat', habVal);
  }
  if (filters?.clade) {
    const cladeVal = Array.isArray(filters.clade) ? filters.clade.join(',') : filters.clade;
    if (cladeVal) params.append('clade', cladeVal);
  }

  if (filters?.location) params.append('location', filters.location);
  if (filters?.time_period) params.append('time_period', filters.time_period);
  if (filters?.mya_start !== undefined) params.append('mya_start', filters.mya_start.toString());
  if (filters?.mya_end !== undefined) params.append('mya_end', filters.mya_end.toString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.creature_type) params.append('creature_type', filters.creature_type);
  if (filters?.fossil_formation) params.append('fossil_formation', filters.fossil_formation);
  if (filters?.country) params.append('country', filters.country);
  if (filters?.min_length !== undefined) params.append('min_length', filters.min_length.toString());
  if (filters?.max_length !== undefined) params.append('max_length', filters.max_length.toString());
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const url = `${API_BASE}/species?${params.toString()}`;
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error('Failed to fetch species');
  }
  return response.json();
}

export async function fetchSpeciesById(id: number): Promise<Species> {
  const response = await fetchWithRetry(`${API_BASE}/species/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch species with id ${id}`);
  }
  return response.json();
}

export async function fetchCreatureOfTheDay(): Promise<Species> {
  const response = await fetchWithRetry(`${API_BASE}/species/creature-of-the-day`);
  if (!response.ok) {
    throw new Error('Failed to fetch creature of the day');
  }
  return response.json();
}

export async function fetchSpeciesAutocomplete(q: string): Promise<AutocompleteItem[]> {
  if (!q || q.trim().length < 2) return [];
  const response = await fetchWithRetry(`${API_BASE}/species/search/autocomplete?q=${encodeURIComponent(q.trim())}`);
  if (!response.ok) {
    throw new Error('Failed to fetch search autocomplete suggestions');
  }
  return response.json();
}

export interface SpeciesRosterItem {
  id: number;
  name: string;
  scientificName: string;
  clade: string;
  timePeriod: string;
  fossilFormation?: string | null;
  reconstructionImageUrl?: string | null;
  lengthM?: number | null;
  heightM?: number | null;
  weightKg?: number | null;
}

let rosterCache: SpeciesRosterItem[] | null = null;
let rosterPromise: Promise<SpeciesRosterItem[]> | null = null;

export async function fetchSpeciesRoster(): Promise<SpeciesRosterItem[]> {
  if (rosterCache) return rosterCache;
  if (rosterPromise) return rosterPromise;

  rosterPromise = (async () => {
    try {
      const response = await fetchWithRetry(`${API_BASE}/species/roster`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          rosterCache = data;
          return data;
        }
      }
    } catch {
      // Fallback if /species/roster fails or is deploying
    }

    try {
      const fallbackRes = await fetchSpecies({ limit: 1000 });
      const rawList = Array.isArray(fallbackRes) ? fallbackRes : (fallbackRes as any).data || [];
      const mapped: SpeciesRosterItem[] = rawList.map((s: any) => ({
        id: s.id,
        name: s.name,
        scientificName: s.scientificName,
        clade: s.clade,
        timePeriod: s.timePeriod,
        fossilFormation: s.fossilFormation,
        reconstructionImageUrl: s.reconstructionImageUrl,
        lengthM: s.lengthM,
        heightM: s.heightM,
        weightKg: s.weightKg
      }));
      rosterCache = mapped;
      return mapped;
    } finally {
      rosterPromise = null;
    }
  })();

  return rosterPromise;
}

const speciesCompareCache = new Map<number, Species>();

export function primeSpeciesCache(species: Species): void {
  if (species && species.id) {
    speciesCompareCache.set(species.id, species);
  }
}

export async function fetchSpeciesCompare(ids: number[]): Promise<Species[]> {
  if (!ids || ids.length === 0) return [];

  const missingIds = ids.filter(id => !speciesCompareCache.has(id));

  if (missingIds.length > 0) {
    const response = await fetchWithRetry(`${API_BASE}/species/compare?ids=${missingIds.join(',')}`);
    if (!response.ok) {
      throw new Error('Failed to fetch species comparison data');
    }
    const fetchedSpecies: Species[] = await response.json();
    for (const s of fetchedSpecies) {
      speciesCompareCache.set(s.id, s);
    }
  }

  return ids.map(id => speciesCompareCache.get(id)).filter(Boolean) as Species[];
}

// ══════════════════════════════════════════════════════════════════════════════
// 🏛️ AI RESEARCH PAVILION CLIENT APIS
// ══════════════════════════════════════════════════════════════════════════════

export interface CuratorGroundingSpecimen {
  id: number;
  name: string;
  scientificName: string;
  clade: string;
  timePeriod: string;
  similarity: number;
  imageUrl?: string | null;
  silhouetteUrl?: string | null;
}

export interface CuratorChatResponse {
  answer: string;
  referencedSpeciesIds: number[];
  groundedSpecimens: CuratorGroundingSpecimen[];
}

export async function askChiefCurator(
  query: string,
  history?: { role: 'user' | 'assistant'; content: string }[]
): Promise<CuratorChatResponse> {
  const response = await fetchWithRetry(`${API_BASE}/ai/curator/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, history })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to communicate with Chief Curator');
  }
  return response.json();
}

export interface FossilCandidate {
  name: string;
  scientificName: string;
  clade: string;
  confidence: 'High' | 'Moderate' | 'Tentative';
  rationale: string;
  speciesId?: number | null;
  reconstructionUrl?: string | null;
  silhouetteUrl?: string | null;
}

export interface FossilAnalysis {
  fossilAuthenticity: string;
  anatomicalElement: string;
  probableTaxa: string[];
  morphologicalObservations: string[];
  candidatePrehistoricaSpecies: FossilCandidate[];
  overallConfidence: number;
  preservationNotes: string;
  recommendedFurtherTests: string[];
}

export async function identifyFossil(
  imageBase64: string,
  mimeType = 'image/jpeg'
): Promise<{ analysis: FossilAnalysis }> {
  const response = await fetchWithRetry(`${API_BASE}/ai/fossil-lens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to analyze fossil specimen');
  }
  return response.json();
}

export interface RunwayInteractionResult {
  coexisted: boolean;
  temporalGapMa: number;
  temporalVerdict: string;
  geographicOverlap: boolean;
  geographicNotes: string;
  physicalComparison: {
    speciesA: { name: string; lengthM: number; massKg: number; heightM: number; estimatedBiteForceN?: number };
    speciesB: { name: string; lengthM: number; massKg: number; heightM: number; estimatedBiteForceN?: number };
    massRatio: number;
    kineticAdvantage: string;
  };
  biomechanicalBreakdown: {
    offensiveCapabilities: string;
    defensiveCapabilities: string;
    locomotionAndAgility: string;
    lethalVulnerabilities: string;
  };
  ecologicalInteractionNarrative: string;
  curatorConclusion: string;
}

export async function simulateRunwayMatchup(speciesIds: number[]): Promise<{ cached: boolean; simulation: RunwayInteractionResult }> {
  const response = await fetchWithRetry(`${API_BASE}/ai/runway/matchup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ speciesIds })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Biomechanical simulation failed');
  }
  return response.json();
}

export interface SemanticSearchItem {
  id: number;
  name: string;
  scientificName: string;
  clade: string;
  diet: string;
  habitat: string;
  timePeriod: string;
  myaStart: number;
  myaEnd: number;
  fossilFormation?: string | null;
  country?: string | null;
  reconstructionImageUrl?: string | null;
  comparisonSilhouette?: any;
  similarity: number;
}

export async function fetchSemanticSearch(query: string, limit = 12): Promise<SemanticSearchItem[]> {
  if (!query || query.trim().length < 2) return [];
  const response = await fetchWithRetry(`${API_BASE}/ai/search/semantic?q=${encodeURIComponent(query.trim())}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to perform semantic search');
  }
  return response.json();
}

export interface TrophicNode {
  id: string;
  name: string;
  scientificName?: string;
  speciesId?: number | null;
  trophicLevel: string;
  diet: string;
  relativeBiomassPercent: number;
}

export interface TrophicEdge {
  source: string;
  target: string;
  interactionType: string;
  strength: string;
}

export interface FormationFoodWebResult {
  formationName: string;
  era: string;
  paleoenvironment: string;
  climate: string;
  nodes: TrophicNode[];
  edges: TrophicEdge[];
  trophicPyramidSummary: string;
  stressorScenario?: {
    stressorName: string;
    impactDescription: string;
    vulnerableSpecies: string[];
    resilientSpecies: string[];
  };
}

export async function fetchFormationFoodWeb(
  formation: string,
  era = 'Mesozoic',
  stressor?: string
): Promise<{ cached: boolean; foodWeb: FormationFoodWebResult }> {
  const url = `${API_BASE}/ai/formation/food-web?formation=${encodeURIComponent(formation)}&era=${encodeURIComponent(era)}${stressor ? `&stressor=${encodeURIComponent(stressor)}` : ''}`;
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to synthesize formation food web');
  }
  return response.json();
}


