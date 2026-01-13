import { colors } from './colors';
import { getTerminalWidth } from './terminal';

/**
 * Simple table formatter for CLI output with terminal width awareness
 */
export interface TableColumn {
  key: string;
  header: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  priority?: number; // Higher priority columns get space first
}

export interface TableOptions {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  headerColor?: (text: string) => string;
  maxWidth?: number; // Override terminal width
}

export function formatTable(options: TableOptions): string {
  const { columns, data, headerColor = colors.info, maxWidth } = options;

  if (data.length === 0) return '';

  // Get terminal width or use override
  const terminalWidth = maxWidth || getTerminalWidth();
  const availableWidth = Math.max(terminalWidth - 5, 60); // Reserve space for margins

  // Calculate responsive column widths
  const colWidths = calculateResponsiveWidths(columns, data, availableWidth);

  // Create header with color
  const headerRow = columns
    .map(col =>
      headerColor(col.header).padEnd(
        colWidths[col.key] + (headerColor(col.header).length - col.header.length)
      )
    )
    .join(' │ ');
  const separator = columns.map(col => '─'.repeat(colWidths[col.key])).join('─┼─');

  // Create data rows with truncation if needed
  const dataRows = data.map(row =>
    columns
      .map(col => {
        const value = String(row[col.key] || '');
        const maxLen = colWidths[col.key];
        return value.length > maxLen ? value.substring(0, maxLen - 1) + '…' : value.padEnd(maxLen);
      })
      .join(' │ ')
  );

  return [headerRow, separator, ...dataRows].join('\n');
}

/**
 * Calculate responsive column widths based on available space and priorities
 */
function calculateResponsiveWidths(
  columns: TableColumn[],
  data: Record<string, unknown>[],
  availableWidth: number
): Record<string, number> {
  const colWidths: Record<string, number> = {};

  // First pass: calculate natural widths and apply constraints
  columns.forEach(col => {
    const headerWidth = col.header.length;
    const dataWidth = Math.max(...data.map(row => String(row[col.key] || '').length));
    const naturalWidth = Math.max(headerWidth, dataWidth, col.width || 0);

    // Apply min/max constraints
    const minWidth = col.minWidth || 1;
    const maxWidth = col.maxWidth || naturalWidth;
    colWidths[col.key] = Math.max(minWidth, Math.min(maxWidth, naturalWidth));
  });

  // Calculate total width needed
  const separatorWidth = (columns.length - 1) * 3; // " │ " separators
  let totalWidth = Object.values(colWidths).reduce((sum, w) => sum + w, 0) + separatorWidth;

  // If we fit, return as-is
  if (totalWidth <= availableWidth) {
    return colWidths;
  }

  // Need to shrink: sort columns by priority (lowest priority first to shrink)
  const shrinkableColumns = columns
    .filter(col => colWidths[col.key] > (col.minWidth || 1))
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

  // Distribute shrinkage
  let remainingShrink = totalWidth - availableWidth;

  for (const col of shrinkableColumns) {
    if (remainingShrink <= 0) break;

    const currentWidth = colWidths[col.key];
    const minWidth = col.minWidth || 1;
    const canShrink = currentWidth - minWidth;

    if (canShrink > 0) {
      const shrinkAmount = Math.min(canShrink, remainingShrink);
      colWidths[col.key] -= shrinkAmount;
      remainingShrink -= shrinkAmount;
      totalWidth -= shrinkAmount;
    }
  }

  return colWidths;
}
