import { colors } from './colors';
import { edit } from 'external-editor';

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
  try {
    const content = edit(initial || '', {
      postfix: fileExtension,
    });

    return content;
  } catch (error) {
    console.log(colors.error(`Failed to get multi-line input: ${error}`));
    process.exit(1);
  }
}
