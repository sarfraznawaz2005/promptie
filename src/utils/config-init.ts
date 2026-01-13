import * as fs from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline';
import { ConfigStorage } from '../config/config-storage';
import { getConfigDir } from '../config';
import { colors } from './colors';
import { readJsonFile } from './fs';

/**
 * Validates that a directory exists and is writable at the specified path.
 * Does NOT create the directory if it doesn't exist.
 * @param dirPath - The directory path to validate
 * @returns Promise that resolves if valid, rejects with error message if invalid
 */
async function validateExistingDirectory(dirPath: string): Promise<void> {
  // Basic path validation
  if (!dirPath || dirPath.trim() === '') {
    throw new Error('Path cannot be empty');
  }

  // Check if it's a valid directory path (not a file path)
  const parsedPath = path.parse(dirPath);
  if (parsedPath.ext) {
    throw new Error('Path must be a directory, not a file. Please specify a folder path.');
  }

  // Resolve the path to absolute
  const resolvedPath = path.resolve(dirPath);

  try {
    // Check if the directory exists and is actually a directory
    const stats = await fs.stat(resolvedPath);
    if (!stats.isDirectory()) {
      throw new Error(`Path "${resolvedPath}" exists but is not a directory`);
    }

    // Verify we can write to the directory by testing access
    await fs.access(resolvedPath, fs.constants.W_OK);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        throw new Error(
          `Directory "${resolvedPath}" does not exist. Please provide an existing directory path.`
        );
      }
      throw new Error(`Cannot access directory "${resolvedPath}": ${error.message}`);
    }
    throw new Error(`Cannot access directory "${resolvedPath}"`);
  }
}

/**
 * Prompts the user to choose a data location for storing prompts and categories.
 * @returns The chosen data location path
 */
async function promptForDataLocation(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Read app name from package.json
  const packageJson = await readJsonFile<{ name: string }>(
    path.join(__dirname, '../../package.json')
  );
  const appName = packageJson?.name || 'promptie';
  const appFolder = `.${appName}`;

  const defaultLocation = getConfigDir();

  console.log(colors.info('\nThis appears to be your first time running Promptie.'));
  console.log(colors.welcome('Welcome to Promptie!'));
  console.log(colors.instruction('Please choose where to store your prompts and categories:'));
  console.log(colors.option(`1. Default location: ${defaultLocation}`));
  console.log(colors.option('2. Custom location (enter full path)'));
  console.log(colors.option(`3. Current folder: ${path.join(process.cwd(), appFolder)}`));

  const getChoice = (): Promise<string> => {
    return new Promise(resolve => {
      rl.question('\nEnter your choice (1, 2, or 3): ', (choice: string) => {
        resolve(choice);
      });
    });
  };

  const getPath = (): Promise<string> => {
    return new Promise(resolve => {
      rl.question('Enter the full path for data storage: ', (customPath: string) => {
        resolve(customPath);
      });
    });
  };

  try {
    const choice = await getChoice();

    if (choice === '1' || choice.trim() === '') {
      rl.close();
      return defaultLocation;
    } else if (choice === '2') {
      let validPath = false;
      let resultPath = '';

      while (!validPath) {
        const customPath = await getPath();
        const trimmedPath = customPath.trim();

        if (!trimmedPath) {
          console.log('Path cannot be empty. Please try again.');
          continue;
        }

        try {
          await validateExistingDirectory(trimmedPath);
          validPath = true;
          resultPath = path.join(trimmedPath, appFolder);
        } catch (error) {
          console.log(
            colors.error(`Error: ${error instanceof Error ? error.message : 'Invalid path'}`)
          );
        }
      }

      rl.close();
      return resultPath;
    } else if (choice === '3') {
      rl.close();
      return path.join(process.cwd(), appFolder);
    } else {
      console.log(colors.warning('Invalid choice. Using default location.'));
      rl.close();
      return defaultLocation;
    }
  } finally {
    rl.close();
  }
}

/**
 * Initializes the application configuration.
 * Prompts user for data location on first run if config doesn't exist.
 * @returns The app configuration with data location
 */
export async function initializeAppConfig(): Promise<{ dataLocation: string }> {
  const configStorage = new ConfigStorage();

  // Check if config already exists
  const existingConfig = await configStorage.load();
  if (existingConfig) {
    return existingConfig;
  }

  // First run - prompt user
  const dataLocation = await promptForDataLocation();

  // Directory validation and creation is now handled in promptForDataLocation()
  // No additional validation needed here as it's already done

  // Save the configuration
  const config = await configStorage.initialize(dataLocation);

  console.log(colors.success(`\nConfiguration saved. Data will be stored in: ${dataLocation}\n`));

  return config;
}
