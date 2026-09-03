export interface MediaItem {
  url: string;
  type: 'photo' | 'art' | 'scale_diagram';
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


