export interface SpeciesNameInput {
  name: string;
  scientificName?: string | null;
}

/**
 * Formats heading and subheading for species display cards:
 * - heading (White): Genus / Common Name (e.g., "Apatosaurus", "Araripesuchus")
 * - subheading (Yellow): Full scientific name (e.g., "Apatosaurus ajax", "Araripesuchus gomesii")
 */
export function getSpeciesDisplayNames(species: SpeciesNameInput) {
  const rawName = (species.name || '').trim();
  const rawSciName = (species.scientificName || '').trim();

  let heading = rawName;
  if (rawSciName && (rawName.toLowerCase() === rawSciName.toLowerCase() || rawName.includes(' '))) {
    heading = rawName.split(' ')[0];
  } else if (!rawSciName && rawName.includes(' ')) {
    heading = rawName.split(' ')[0];
  }

  if (heading) {
    heading = heading.charAt(0).toUpperCase() + heading.slice(1);
  }

  const subheading = rawSciName || rawName;

  return {
    heading,
    subheading
  };
}
