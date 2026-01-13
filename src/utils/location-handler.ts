import * as fs from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline';
import { ConfigStorage } from '../config/config-storage';
import { colors } from './colors';

/**
 * Displays the current data storage location.
 */
async function showCurrentLocation(): Promise<void> {
  const configStorage = new ConfigStorage();
  const config = await configStorage.load();

  if (!config) {
    console.log(
      colors.error('No configuration found. Please run any command first to initialize.')
    );
    return;
  }

  console.log(colors.success(`Current data storage location: ${config.dataLocation}`));
}

/**
 * Validates that a path is a valid existing directory.
 */
async function validateExistingDirectory(dirPath: string): Promise<void> {
  if (!dirPath || dirPath.trim() === '') {
    throw new Error('Path cannot be empty');
  }

  const resolvedPath = path.resolve(dirPath);

  const parsedPath = path.parse(resolvedPath);
  if (parsedPath.ext) {
    throw new Error('Path must be a directory, not a file. Please specify a folder path.');
  }

  try {
    const stat = await fs.stat(resolvedPath);
    if (!stat.isDirectory()) {
      throw new Error('Path exists but is not a directory');
    }
    await fs.access(resolvedPath, fs.constants.W_OK);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        throw new Error(`Directory does not exist: ${resolvedPath}`);
      }
      throw new Error(`Cannot access directory "${resolvedPath}": ${error.message}`);
    }
    throw new Error(`Cannot access directory "${resolvedPath}"`);
  }
}

/**
 * Moves a file from source to destination, creating destination directory if needed.
 */
async function moveFile(sourcePath: string, destPath: string): Promise<void> {
  try {
    const destDir = path.dirname(destPath);
    await fs.mkdir(destDir, { recursive: true });
    await fs.rename(sourcePath, destPath);
  } catch (error) {
    throw new Error(
      `Failed to move file from ${sourcePath} to ${destPath}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Sets a new data storage location.
 */
async function setNewLocation(newPath: string, skipConfirm: boolean = false): Promise<void> {
  const resolvedPath = path.resolve(newPath);

  try {
    await validateExistingDirectory(resolvedPath);
  } catch (error) {
    console.log(
      colors.error(`Invalid location: ${error instanceof Error ? error.message : 'Unknown error'}`)
    );
    return;
  }

  const configStorage = new ConfigStorage();
  const currentConfig = await configStorage.load();

  if (!currentConfig) {
    console.log(
      colors.error('No current configuration found. Please run any command first to initialize.')
    );
    return;
  }

  if (path.resolve(currentConfig.dataLocation) === resolvedPath) {
    console.log(
      colors.metadata('New location is the same as current location. No changes needed.')
    );
    return;
  }

  if (!skipConfirm) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const confirmed = await new Promise<boolean>(resolve => {
      rl.question(
        `\nThis will move your prompt and category data from:\n  ${currentConfig.dataLocation}\nTo:\n  ${resolvedPath}\n\nContinue? (y/N): `,
        (answer: string) => {
          rl.close();
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        }
      );
    });

    if (!confirmed) {
      console.log(colors.metadata('Operation cancelled.'));
      return;
    }
  }

  console.log('Moving data files...');

  const currentPromptsPath = path.join(currentConfig.dataLocation, 'promptie.json');
  const currentCategoriesPath = path.join(currentConfig.dataLocation, 'promptie_categories.json');
  const newPromptsPath = path.join(resolvedPath, 'promptie.json');
  const newCategoriesPath = path.join(resolvedPath, 'promptie_categories.json');

  try {
    try {
      await fs.access(currentPromptsPath);
      await moveFile(currentPromptsPath, newPromptsPath);
      console.log(colors.success(`✓ Moved prompts file`));
    } catch {
      console.log(colors.metadata(`No prompts file found to move`));
    }

    try {
      await fs.access(currentCategoriesPath);
      await moveFile(currentCategoriesPath, newCategoriesPath);
      console.log(colors.success(`✓ Moved categories file`));
    } catch {
      console.log(colors.metadata(`No categories file found to move`));
    }

    const newConfig = {
      ...currentConfig,
      dataLocation: resolvedPath,
    };

    await configStorage.save(newConfig);

    console.log(colors.success(`\nData storage location updated successfully!`));
    console.log(colors.metadata(`New location: ${resolvedPath}`));
  } catch (error) {
    console.log(
      colors.error(
        `Failed to move data: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    );
    console.log(
      colors.warning('Your data may be in an inconsistent state. Please check both locations.')
    );
  }
}

/**
 * Handles the location command.
 */
export async function handleLocation(
  newPath?: string,
  skipConfirm: boolean = false
): Promise<void> {
  if (!newPath) {
    await showCurrentLocation();
  } else {
    await setNewLocation(newPath, skipConfirm);
  }
}
