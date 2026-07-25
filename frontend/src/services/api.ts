export interface Species {
  id: number;
  name: string;
  scientificName: string;
  nameMeaning: string;
  timePeriod: string;
  myaStart: number;
  myaEnd: number;
  dietType: string;
  dietDetails: string;
  locations: string[];
  taxonomicClassification: string;
  reconstructionImageUrl: string | null;
  fossilImageUrl: string | null;
  discoveryHistory: string;
  interestingFacts: string[];
  lengthM: number | null;
  heightM: number | null;
  weightKg: number | null;
  sizeNotes: string;
  genus?: string;
  family?: string;
  fossilFormation?: string | null;
  country?: string | null;
  creatureType?: string | null;
  isMapFallback?: boolean;
  createdAt: string;
  updatedAt: string;
  relatedSpecies?: Species[];
}

const API_BASE = 'http://localhost:5000/api';

export async function fetchSpecies(filters?: {
  diet?: string;
  location?: string;
  time_period?: string;
  search?: string;
  fossil_formation?: string;
  country?: string;
  creature_type?: string;
}): Promise<Species[]> {
  const params = new URLSearchParams();
  if (filters?.diet) params.append('diet', filters.diet);
  if (filters?.location) params.append('location', filters.location);
  if (filters?.time_period) params.append('time_period', filters.time_period);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.creature_type) params.append('creature_type', filters.creature_type);
  if (filters?.fossil_formation) params.append('fossil_formation', filters.fossil_formation);
  if (filters?.country) params.append('country', filters.country);

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
