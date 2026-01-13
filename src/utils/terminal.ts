import * as process from 'process';

/**
 * Get terminal width safely
 * @returns Terminal width in columns, or default if detection fails
 */
export function getTerminalWidth(): number {
  try {
    // Try to get terminal width
    const width = process.stdout.columns || 80;
    return Math.max(width, 60); // Minimum 60 columns for readability
  } catch {
    return 80; // Default to 80 columns if detection fails
  }
}

/**
 * Wrap text to fit within specified width
 * @param text - Text to wrap
 * @param maxWidth - Maximum width in columns (default: terminal width)
 * @returns Wrapped text with line breaks
 */
export function wrapText(text: string, maxWidth?: number): string {
  const width = maxWidth || getTerminalWidth();
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '\n') {
      // Preserve explicit newlines
      lines.push(currentLine.trim());
      currentLine = '';
    } else if (currentLine.length + 1 > width) {
      // Wrap at word boundaries
      if (char === ' ') {
        lines.push(currentLine.trim());
        currentLine = '';
      } else {
        // Hard wrap in middle of word
        lines.push(currentLine.trim() + '-');
        currentLine = char;
      }
    } else {
      currentLine += char;
    }
  }

  // Add remaining content
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.join('\n');
}

/**
 * Truncate text to fit within specified width with ellipsis
 * @param text - Text to truncate
 * @param maxWidth - Maximum width in columns (default: terminal width - 10 for padding)
 * @returns Truncated text with ellipsis if too long
 */
export function truncateText(text: string, maxWidth?: number): string {
  const width = maxWidth || getTerminalWidth() - 10; // Leave room for ellipsis
  if (text.length <= width) return text;
  return text.substring(0, width) + '...';
}
