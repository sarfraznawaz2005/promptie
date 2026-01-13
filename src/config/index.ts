import * as os from 'os';
import * as path from 'path';
import pkg from '../../package.json';

const CONFIG_DIR_NAME = 'promptie';
const PROMPTS_FILE = 'promptie.json';
const CATEGORIES_FILE = 'promptie_categories.json';
const CONFIG_FILE = 'config.json';

/**
 * Get the application name from package.json.
 * @returns The application name in lowercase
 */
export function getAppName(): string {
  return pkg.name;
}

/**
 * Get prefixed environment variable name.
 * @param suffix - The suffix for the env var (e.g., 'DEBUG', 'EDITOR')
 * @returns The full env var name (e.g., 'PROMPTIE_DEBUG')
 */
export function getEnvVarName(suffix: string): string {
  return `${getAppName().toUpperCase()}_${suffix}`;
}

/**
 * Get the config directory path for the current operating system.
 * @returns The absolute path to the config directory
 * @example
 * // On Windows: C:\Users\username\AppData\Roaming\promptie
 * // On macOS: /Users/username/Library/Application Support/promptie
 * // On Linux: /home/username/.config/promptie
 */
export function getConfigDir(): string {
  const platform = os.platform();
  let configDir: string;

  if (platform === 'win32') {
    configDir = path.join(process.env.APPDATA || '', CONFIG_DIR_NAME);
  } else if (platform === 'darwin') {
    configDir = path.join(os.homedir(), 'Library', 'Application Support', CONFIG_DIR_NAME);
  } else {
    configDir = path.join(os.homedir(), '.config', CONFIG_DIR_NAME);
  }

  return configDir;
}

/**
 * Get the file path for prompts storage.
 * @returns The absolute path to promptie.json in config directory
 */
export function getPromptsFilePath(): string {
  return path.join(getConfigDir(), PROMPTS_FILE);
}

/**
 * Get the file path for categories storage.
 * @returns The absolute path to promptie_categories.json in config directory
 */
export function getCategoriesFilePath(): string {
  return path.join(getConfigDir(), CATEGORIES_FILE);
}

/**
 * Get the file path for the app configuration file.
 * @returns The absolute path to config.json in the default config directory
 */
export function getConfigFilePath(): string {
  return path.join(getConfigDir(), CONFIG_FILE);
}
