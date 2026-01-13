import { PromptStorage, CategoryStorage } from '../types';
import { FilePromptStorage, FileCategoryStorage } from './global';
import { initializeAppConfig } from '../utils/config-init';

/**
 * Factory function to create a PromptStorage instance.
 * Initializes app config on first run if needed.
 * @returns A Promise that resolves to a PromptStorage instance
 * @throws Never (always returns a valid storage instance)
 * @example
 * // Create storage
 * const storage = await createStorage();
 * await storage.save(prompt);
 */
export async function createStorage(): Promise<PromptStorage> {
  const config = await initializeAppConfig();
  return new FilePromptStorage(config.dataLocation);
}

/**
 * Factory function to create a CategoryStorage instance.
 * Initializes app config on first run if needed.
 * @returns A Promise that resolves to a CategoryStorage instance
 */
export async function createCategoryStorage(): Promise<CategoryStorage> {
  const config = await initializeAppConfig();
  return new FileCategoryStorage(config.dataLocation);
}
