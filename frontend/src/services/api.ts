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
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch species');
  }
  return response.json();
}

export async function fetchSpeciesById(id: number): Promise<Species> {
  const response = await fetch(`${API_BASE}/species/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch species with id ${id}`);
  }
  return response.json();
}

export async function fetchCreatureOfTheDay(): Promise<Species> {
  const response = await fetch(`${API_BASE}/species/creature-of-the-day`);
  if (!response.ok) {
    throw new Error('Failed to fetch creature of the day');
  }
  return response.json();
}

export async function fetchSpeciesAutocomplete(q: string): Promise<AutocompleteItem[]> {
  if (!q || q.trim().length < 2) return [];
  const response = await fetch(`${API_BASE}/species/search/autocomplete?q=${encodeURIComponent(q.trim())}`);
  if (!response.ok) {
    throw new Error('Failed to fetch search autocomplete suggestions');
  }
  return response.json();
}

export async function fetchSpeciesCompare(ids: number[]): Promise<Species[]> {
  if (!ids || ids.length === 0) return [];
  const response = await fetch(`${API_BASE}/species/compare?ids=${ids.join(',')}`);
  if (!response.ok) {
    throw new Error('Failed to fetch species comparison data');
  }
  return response.json();
}

