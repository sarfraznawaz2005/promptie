import { AppConfig } from '../types';
import { fileExists, readJsonFile, writeJsonFile, ensureDir } from '../utils/fs';
import { getConfigFilePath, getConfigDir } from './index';

const CONFIG_VERSION = '1.0.0';

/**
 * Class for managing the application configuration file.
 * Handles reading, writing, and initializing the config that stores data location.
 */
export class ConfigStorage {
  private configFilePath: string;

  constructor() {
    this.configFilePath = getConfigFilePath();
  }

  /**
   * Loads the configuration from file.
   * @returns The app configuration, or null if config doesn't exist
   */
  async load(): Promise<AppConfig | null> {
    const exists = await fileExists(this.configFilePath);
    if (!exists) {
      return null;
    }

    const data = await readJsonFile<AppConfig>(this.configFilePath);
    return data;
  }

  /**
   * Saves the configuration to file.
   * @param config - The configuration to save
   */
  async save(config: AppConfig): Promise<void> {
    await ensureDir(getConfigDir());
    await writeJsonFile(this.configFilePath, config);
  }

  /**
   * Checks if the configuration file exists.
   * @returns True if config file exists, false otherwise
   */
  async exists(): Promise<boolean> {
    return await fileExists(this.configFilePath);
  }

  /**
   * Creates a default configuration with the default data location.
   * @returns Default app configuration
   */
  createDefaultConfig(): AppConfig {
    return {
      dataLocation: getConfigDir(),
      version: CONFIG_VERSION,
    };
  }

  /**
   * Initializes the configuration if it doesn't exist.
   * This should be called on first app run to prompt user for data location.
   * @param customDataLocation - Optional custom data location path
   * @returns The initialized configuration
   */
  async initialize(customDataLocation?: string): Promise<AppConfig> {
    const existingConfig = await this.load();
    if (existingConfig) {
      return existingConfig;
    }

    // Create new config
    const config: AppConfig = {
      dataLocation: customDataLocation || getConfigDir(),
      version: CONFIG_VERSION,
    };

    await this.save(config);
    return config;
  }
}
