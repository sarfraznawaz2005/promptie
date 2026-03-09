import { colors } from './colors';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { spawnSync } from 'child_process';

/**
 * Prompts for multi-line text input using an external editor.
 * Ideal for long-form content with paragraphs and blank lines.
 *
 * @param initial - Initial content to populate the editor with
 * @param fileExtension - File extension for the temporary file (defaults to .txt)
 * @returns The multi-line text content entered by the user
 */
export async function getMultilineInput(
  initial?: string,
  fileExtension: string = '.txt'
): Promise<string> {
  const tmpFile = path.join(os.tmpdir(), `promptie-edit-${Date.now()}${fileExtension}`);

  let content = initial || '';
  try {
    fs.writeFileSync(tmpFile, content, 'utf-8');

    const editor = process.env.VISUAL || process.env.EDITOR;

    let result: ReturnType<typeof spawnSync>;

    if (editor) {
      result = spawnSync(editor, [tmpFile], { stdio: 'inherit', shell: false });
    } else if (process.platform === 'win32') {
      result = spawnSync('cmd', ['/c', 'start', '/wait', '', tmpFile], { stdio: 'inherit', shell: false });
    } else if (process.platform === 'darwin') {
      result = spawnSync('open', ['-W', tmpFile], { stdio: 'inherit' });
    } else {
      result = spawnSync('xdg-open', [tmpFile], { stdio: 'inherit' });
    }

    if (result.error) {
      throw result.error;
    }

    content = fs.readFileSync(tmpFile, 'utf-8');
  } catch (error) {
    console.log(colors.error(`Failed to get multi-line input: ${error}`));
    process.exit(1);
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
  return content;
}
