export type TimeMapViewMode = 'modern' | 'chrono' | 'diorama' | 'paleo';

export interface TimeMapState {
  viewMode: TimeMapViewMode;
  selectedEraIndex: number;
  selectedLocation: string;
  selectedFormation: string | null;
  dioramaFormationId: string;
  targetMya: number;
  selectedExtinctionId: string | null;
  paleoEraIndex: number;
  paleoFormationName: string | null;
}

export const DEFAULT_TIMEMAP_STATE: TimeMapState = {
  viewMode: 'modern',
  selectedEraIndex: 4, // Triassic
  selectedLocation: 'North America',
  selectedFormation: null,
  dioramaFormationId: 'hell-creek',
  targetMya: 68,
  selectedExtinctionId: 'k-pg',
  paleoEraIndex: 2, // Late Cretaceous
  paleoFormationName: null,
};

const STORAGE_KEY = 'prehistorica_timemap_state';

export function getTimeMapState(): TimeMapState {
  if (typeof window === 'undefined') return DEFAULT_TIMEMAP_STATE;

  try {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode') as TimeMapViewMode | null;
    const urlLocation = params.get('location');
    const urlFormation = params.get('formation');

    const stored = sessionStorage.getItem(STORAGE_KEY);
    const parsed: Partial<TimeMapState> = stored ? JSON.parse(stored) : {};

    const validModes: TimeMapViewMode[] = ['modern', 'chrono', 'diorama', 'paleo'];
    const resolvedMode = (urlMode && validModes.includes(urlMode))
      ? urlMode
      : (parsed.viewMode && validModes.includes(parsed.viewMode))
      ? parsed.viewMode
      : DEFAULT_TIMEMAP_STATE.viewMode;

    return {
      viewMode: resolvedMode,
      selectedEraIndex: typeof parsed.selectedEraIndex === 'number'
        ? parsed.selectedEraIndex
        : DEFAULT_TIMEMAP_STATE.selectedEraIndex,
      selectedLocation: urlLocation || parsed.selectedLocation || DEFAULT_TIMEMAP_STATE.selectedLocation,
      selectedFormation: urlFormation !== null && urlFormation !== undefined
        ? urlFormation
        : (parsed.selectedFormation ?? null),
      dioramaFormationId: parsed.dioramaFormationId || DEFAULT_TIMEMAP_STATE.dioramaFormationId,
      targetMya: typeof parsed.targetMya === 'number'
        ? parsed.targetMya
        : DEFAULT_TIMEMAP_STATE.targetMya,
      selectedExtinctionId: parsed.selectedExtinctionId !== undefined
        ? parsed.selectedExtinctionId
        : DEFAULT_TIMEMAP_STATE.selectedExtinctionId,
      paleoEraIndex: typeof parsed.paleoEraIndex === 'number'
        ? parsed.paleoEraIndex
        : DEFAULT_TIMEMAP_STATE.paleoEraIndex,
      paleoFormationName: parsed.paleoFormationName !== undefined
        ? parsed.paleoFormationName
        : DEFAULT_TIMEMAP_STATE.paleoFormationName,
    };
  } catch (err) {
    console.warn('Failed to retrieve TimeMap state from storage:', err);
    return DEFAULT_TIMEMAP_STATE;
  }
}

export function saveTimeMapState(partial: Partial<TimeMapState>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getTimeMapState();
    const updated: TimeMapState = { ...current, ...partial };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save TimeMap state to storage:', err);
  }
}
