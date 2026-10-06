/**
 * Centralized display-label formatter for Prehistorica presentation layer.
 * Converts raw database/enum values (e.g. MARINE_REPTILE, Marine_Reptile, filter_feeder)
 * into elegant, human-readable museum display labels (e.g. "Marine reptile", "Filter feeder").
 *
 * Preserves scientific terminology and adheres to curated natural-history conventions.
 */

// Normalized lookup key helper (lowercase, no underscores or hyphens)
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[-_/]/g, ' ').replace(/\s+/g, ' ').trim();
}

const EXPLICIT_ENUM_MAP: Record<string, string> = {
  // Clades & Taxonomic Lineages
  'marine reptile': 'Marine reptile',
  'land reptile': 'Land reptile',
  'flying reptile': 'Flying reptile',
  'early mammal': 'Early mammal',
  'early mammal synapsid': 'Early mammal / synapsid',
  'early tetrapod amphibian': 'Early tetrapod / amphibian',
  'theropod': 'Theropod',
  'sauropod': 'Sauropod',
  'sauropodomorph': 'Sauropodomorph',
  'ornithischian': 'Ornithischian',
  'pterosaur': 'Pterosaur',
  'crocodylomorph': 'Crocodylomorph',
  'archosauriform': 'Archosauriform',
  'silesaurid': 'Silesaurid',
  'phytosaur': 'Phytosaur',
  'aetosaur': 'Aetosaur',
  'rauisuchian': 'Rauisuchian',
  'poposauroid': 'Poposauroid',
  'protorosaur': 'Protorosaur',
  'invertebrate': 'Invertebrate',
  'other': 'Other prehistoric',

  // Diets & Trophic Niches
  'carnivore': 'Carnivore',
  'herbivore': 'Herbivore',
  'omnivore': 'Omnivore',
  'piscivore': 'Piscivore',
  'insectivore': 'Insectivore',
  'filter feeder': 'Filter feeder',

  // Habitats & Paleo-Biomes
  'terrestrial': 'Terrestrial',
  'semi aquatic': 'Semi-aquatic',
  'freshwater': 'Freshwater',
  'aerial': 'Aerial',
  'marine': 'Marine',
  'open marine': 'Open marine',
  'shallow sea': 'Shallow sea',
  'coastal': 'Coastal',
  'estuarine': 'Estuarine',
  'arid': 'Arid',
  'woodland': 'Woodland',
  'polar': 'Polar',

  // Taxonomic Status
  'valid': 'Valid',
  'nomen dubium': 'Nomen dubium',
  'synonym': 'Synonym',
  'disputed': 'Disputed'
};

/**
 * Formats enum-style strings into human-readable museum labels.
 * If an explicit mapping exists, it is returned.
 * Otherwise, underscores and hyphens are replaced with spaces, and sentence case is applied.
 */
export function formatEnumLabel(raw?: string | null): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const normalized = normalizeKey(trimmed);
  if (EXPLICIT_ENUM_MAP[normalized]) {
    return EXPLICIT_ENUM_MAP[normalized];
  }

  // Handle slashes if present (e.g. "Early Mammal/Synapsid")
  if (trimmed.includes('/')) {
    return trimmed
      .split('/')
      .map((part) => formatEnumLabel(part))
      .join(' / ');
  }

  // Convert snake_case or SCREAMING_SNAKE_CASE to human-readable sentence case:
  // First character uppercase, rest lowercase unless uppercase acronyms/initialisms
  const words = trimmed
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/);

  if (words.length === 0) return '';

  const formattedWords = words.map((w, idx) => {
    if (idx === 0) {
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }
    return w.toLowerCase();
  });

  return formattedWords.join(' ');
}

export default formatEnumLabel;
