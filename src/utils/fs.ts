import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Ensures a directory exists, creating it if necessary.
 * @param dirPath - The directory path to ensure exists
 * @throws Never - Errors are caught and directory is created
 * @example
 * // Creates /path/to/dir if it doesn't exist
 * await ensureDir('/path/to/dir');
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Reads a file's content as a UTF-8 string.
 * @param filePath - The absolute path to the file
 * @returns The file content as a string
 * @throws Error if file cannot be read
 * @example
 * const content = await readFile('/path/to/file.txt');
 * console.log(content);
 */
export async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file: ${filePath}`);
  }
}

/**
 * Writes content to a file, creating parent directories if needed.
 * @param filePath - The absolute path to the file
 * @param content - The content to write
 * @throws Error if file cannot be written
 * @example
 * await writeFile('/path/to/file.txt', 'Hello, World!');
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    const dir = path.dirname(filePath);
    await ensureDir(dir);
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file: ${filePath}`);
  }
}

/**
 * Checks if a file exists.
 * @param filePath - The absolute path to the file
 * @returns True if file exists, false otherwise
 * @example
 * if (await fileExists('/path/to/file.txt')) {
 *   console.log('File exists!');
 * }
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deletes a file.
 * @param filePath - The absolute path to the file
 * @throws Error if file cannot be deleted
 * @example
 * await deleteFile('/path/to/file.txt');
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    throw new Error(`Failed to delete file: ${filePath}`);
  }
}

/**
 * Reads and parses a JSON file.
 * @param filePath - The absolute path to the JSON file
 * @returns The parsed data or null if file doesn't exist or is invalid
 * @example
 * const data = await readJsonFile<{name: string}>('/path/to/config.json');
 * if (data) {
 *   console.log(data.name);
 * }
 */
export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await readFile(filePath);
    return JSON.parse(content) as T;
  } catch (error) {
    // Log the specific error for debugging while still returning null for compatibility
    if (error instanceof SyntaxError) {
      console.warn(`Invalid JSON in file ${filePath}: ${error.message}`);
    } else if (error instanceof Error) {
      console.warn(`Failed to read JSON file ${filePath}: ${error.message}`);
    } else {
      console.warn(`Unknown error reading JSON file ${filePath}`);
    }
    return null;
  }
}

/**
 * Writes data to a JSON file with formatting.
 * @param filePath - The absolute path to the JSON file
 * @param data - The data to serialize and write
 * @example
 * await writeJsonFile('/path/to/config.json', { name: 'test', value: 123 });
 */
export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  await createAtomicWrite(filePath, content);
}

/**
 * Performs an atomic file write operation.
 * Writes to a temp file first, then renames to final path.
 * This prevents partial writes if the process is interrupted.
 * @param filePath - The absolute path to the final file
 * @param content - The content to write
 * @throws Error if write fails
 * @example
 * await createAtomicWrite('/path/to/important.json', criticalData);
 */
export async function createAtomicWrite(filePath: string, content: string): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  await writeFile(tempPath, content);
  await fs.rename(tempPath, filePath);
}

/**
 * Gets the current working directory.
 * @returns The absolute path of the current working directory
 * @example
 * const cwd = getCurrentDirectory();
 * console.log('Current directory:', cwd);
 */
export function getCurrentDirectory(): string {
  return process.cwd();
}

/**
 * Resolves a sequence of paths into an absolute path.
 * @param paths - Sequence of path segments
 * @returns Resolved absolute path
 * @example
 * const fullPath = resolvePath('/home/user', 'project', 'file.txt');
 * // Returns: /home/user/project/file.txt
 */
export function resolvePath(...paths: string[]): string {
  return path.resolve(...paths);
}
