import chalk from 'chalk';

/**
 * Format a date string to human-friendly format: dd-mm-YYYY HH:MM
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString; // Return original if invalid
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

/**
 * Color constants for consistent CLI output
 */
export const colors = {
  // System status & info messages
  info: chalk.cyan,

  // Welcome headers
  welcome: chalk.yellow.bold,

  // Instructions & guidance
  instruction: chalk.yellow,

  // Option lists & numbers
  option: chalk.hex('#FF8C00'),

  // User prompts/questions
  prompt: chalk.hex('#FF8C00'),

  // User input echo
  userInput: chalk.white,

  // Success messages
  success: chalk.green,

  // Error messages
  error: chalk.red,

  // Confirmation prompts
  confirm: chalk.hex('#FF8C00'),

  // Selection interfaces
  selection: chalk.hex('#FF8C00'),
  selectedItem: chalk.hex('#FF8C00'),
  availableItem: chalk.white,

  // Section headers
  section: chalk.yellow.bold,

  // Data display (key-value pairs)
  dataKey: chalk.yellow,
  dataValue: chalk.white,

  // Action menus
  actionPrompt: chalk.hex('#FF8C00'),
  actionSelected: chalk.white,
  actionAvailable: chalk.white,

  // Interactive indicators
  indicator: chalk.green,

  // General text content
  text: chalk.white.bold,

  // Legacy colors (for backward compatibility)
  header: chalk.yellow.bold,
  label: chalk.yellow.bold,
  content: chalk.white,
  metadata: chalk.gray,
  preview: chalk.gray,
  warning: chalk.yellow,
} as const;

/**
 * Predefined styled messages
 */
export const styled = {
  // Legacy styled messages (for backward compatibility)
  header: (text: string) => colors.header(`\n${text}\n`),
  label: (text: string) => colors.label(`${text}:`),
  success: (text: string) => colors.success(`✓ ${text}`),
  error: (text: string) => colors.error(`✗ ${text}`),
  warning: (text: string) => colors.warning(`⚠ ${text}`),

  // New styled messages for specific UI elements
  welcome: (text: string) => colors.welcome(`${text}`),
  instruction: (text: string) => colors.instruction(`${text}`),
  prompt: (text: string) => colors.prompt(`${text}`),
  confirm: (text: string) => colors.confirm(`${text}`),
  section: (text: string) => colors.section(`--- ${text} ---`),
  dataKey: (key: string) => colors.dataKey(`${key}:`),
  dataValue: (value: string) => colors.dataValue(`${value}`),
  indicator: (symbol: string) => colors.indicator(`${symbol}`),
} as const;
