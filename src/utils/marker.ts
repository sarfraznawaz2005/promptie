/**
 * Marker utility functions for generating HTML comment markers.
 * These functions dynamically add -RULES-START and -RULES-END suffixes.
 */

/**
 * Get the start marker suffix without HTML comment wrapper.
 * @param marker - The base marker name (e.g., "USER")
 * @returns The start marker (e.g., "USER-RULES-START")
 */
export function getMarkerStart(marker: string): string {
  return `${marker}-RULES-START`;
}

/**
 * Get the end marker suffix without HTML comment wrapper.
 * @param marker - The base marker name (e.g., "USER")
 * @returns The end marker (e.g., "USER-RULES-END")
 */
export function getMarkerEnd(marker: string): string {
  return `${marker}-RULES-END`;
}

/**
 * Get the formatted start marker with HTML comment wrapper.
 * @param marker - The base marker name (e.g., "USER")
 * @returns The formatted start marker (e.g., "<!-- USER-RULES-START -->")
 */
export function getFormattedMarkerStart(marker: string): string {
  return `<!-- ${getMarkerStart(marker)} -->`;
}

/**
 * Get the formatted end marker with HTML comment wrapper.
 * @param marker - The base marker name (e.g., "USER")
 * @returns The formatted end marker (e.g., "<!-- USER-RULES-END -->")
 */
export function getFormattedMarkerEnd(marker: string): string {
  return `<!-- ${getMarkerEnd(marker)} -->`;
}
