export interface NotebookEntry {
  id: number;
  savedAt: string;
  notes?: string;
  tags?: string[];
}

const STORAGE_KEY_ENTRIES = 'prehistorica_notebook_entries';
const STORAGE_KEY_LEGACY_FAVS = 'prehistorica_favorites';
export const NOTEBOOK_UPDATED_EVENT = 'prehistorica_notebook_updated';

function dispatchUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTEBOOK_UPDATED_EVENT));
  }
}

export function getNotebookEntries(): NotebookEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
    if (raw) {
      return JSON.parse(raw);
    }

    // Check legacy favorites and migrate if available
    const legacyRaw = localStorage.getItem(STORAGE_KEY_LEGACY_FAVS);
    if (legacyRaw) {
      const legacyIds: number[] = JSON.parse(legacyRaw);
      if (Array.isArray(legacyIds) && legacyIds.length > 0) {
        const migrated: NotebookEntry[] = legacyIds.map((id) => ({
          id,
          savedAt: new Date().toISOString(),
          tags: ['Favorite']
        }));
        localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch (err) {
    console.error('Failed to read notebook entries:', err);
  }
  return [];
}

export function getBookmarkIds(): number[] {
  return getNotebookEntries().map((entry) => entry.id);
}

export function isBookmarked(id: number): boolean {
  return getBookmarkIds().includes(id);
}

export function getEntry(id: number): NotebookEntry | undefined {
  return getNotebookEntries().find((e) => e.id === id);
}

export function toggleBookmark(id: number, notes?: string, tags: string[] = ['Favorite']): boolean {
  try {
    const current = getNotebookEntries();
    const existingIndex = current.findIndex((e) => e.id === id);
    let isNowSaved = false;

    if (existingIndex >= 0) {
      // Remove
      current.splice(existingIndex, 1);
      isNowSaved = false;
    } else {
      // Add
      current.unshift({
        id,
        savedAt: new Date().toISOString(),
        notes: notes || '',
        tags
      });
      isNowSaved = true;
    }

    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(current));
    // Keep legacy key in sync for backwards compatibility
    localStorage.setItem(STORAGE_KEY_LEGACY_FAVS, JSON.stringify(current.map((e) => e.id)));
    dispatchUpdate();
    return isNowSaved;
  } catch (err) {
    console.error('Failed to toggle bookmark:', err);
    return false;
  }
}

export function updateEntry(id: number, updates: Partial<Omit<NotebookEntry, 'id' | 'savedAt'>>): void {
  try {
    const current = getNotebookEntries();
    const entry = current.find((e) => e.id === id);
    if (entry) {
      if (updates.notes !== undefined) entry.notes = updates.notes;
      if (updates.tags !== undefined) entry.tags = updates.tags;
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(current));
      dispatchUpdate();
    }
  } catch (err) {
    console.error('Failed to update entry:', err);
  }
}

export function removeEntry(id: number): void {
  try {
    const current = getNotebookEntries().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(current));
    localStorage.setItem(STORAGE_KEY_LEGACY_FAVS, JSON.stringify(current.map((e) => e.id)));
    dispatchUpdate();
  } catch (err) {
    console.error('Failed to remove entry:', err);
  }
}

export function clearNotebook(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ENTRIES);
    localStorage.removeItem(STORAGE_KEY_LEGACY_FAVS);
    dispatchUpdate();
  } catch (err) {
    console.error('Failed to clear notebook:', err);
  }
}
