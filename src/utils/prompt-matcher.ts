import { minimatch } from 'minimatch';

/**
 * Parse a comma-separated string of prompt names/patterns
 * @param input Comma-separated string like "prompt1,prompt2,react-*"
 * @returns Array of individual prompt names/patterns
 */
export function parsePromptList(input: string): string[] {
  if (!input || input.trim() === '') {
    return [];
  }

  return input
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Match prompt names against patterns using wildcards
 * @param promptNames Available prompt names to match against
 * @param patterns Array of patterns (can include wildcards like "react-*", "*api*")
 * @returns Array of matching prompt names
 */
export function matchPrompts(promptNames: string[], patterns: string[]): string[] {
  if (!patterns || patterns.length === 0) {
    return [];
  }

  const matches = new Set<string>();

  for (const pattern of patterns) {
    // If pattern contains wildcards, use minimatch
    if (pattern.includes('*') || pattern.includes('?') || pattern.includes('[')) {
      for (const promptName of promptNames) {
        if (minimatch(promptName, pattern)) {
          matches.add(promptName);
        }
      }
    } else {
      // Exact match
      if (promptNames.includes(pattern)) {
        matches.add(pattern);
      }
    }
  }

  return Array.from(matches);
}

/**
 * Parse and match prompts in one step
 * @param input Comma-separated string of patterns
 * @param availablePrompts Array of available prompt names
 * @returns Object with matched prompts and any unmatched patterns
 */
export function parseAndMatchPrompts(
  input: string,
  availablePrompts: string[]
): { matched: string[]; unmatched: string[] } {
  const patterns = parsePromptList(input);
  const matched = matchPrompts(availablePrompts, patterns);

  // Find patterns that didn't match anything
  const unmatched = patterns.filter(pattern => {
    if (pattern.includes('*') || pattern.includes('?') || pattern.includes('[')) {
      // For wildcard patterns, check if they matched anything
      return !availablePrompts.some(promptName => minimatch(promptName, pattern));
    } else {
      // For exact patterns, check if they exist
      return !availablePrompts.includes(pattern);
    }
  });

  return { matched, unmatched };
}
