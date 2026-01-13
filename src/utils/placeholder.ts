/**
 * Parse placeholder names from text content
 * @param content The text content to parse
 * @returns Array of unique placeholder names found
 */
export function parsePlaceholders(content: string): string[] {
  const placeholderRegex = /\{\{([^}]+)\}\}/g;
  const placeholders = new Set<string>();

  let match;
  while ((match = placeholderRegex.exec(content)) !== null) {
    placeholders.add(match[1].trim());
  }

  return Array.from(placeholders);
}

/**
 * Substitute placeholders in content with provided values
 * @param content The text content with placeholders
 * @param values Object mapping placeholder names to values
 * @returns Content with placeholders substituted
 */
export function substitutePlaceholders(content: string, values: Record<string, string>): string {
  let result = content;

  for (const [key, value] of Object.entries(values)) {
    const placeholderRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(placeholderRegex, value);
  }

  return result;
}
