import promptsLib from 'prompts';
import * as path from 'path';
import { Prompt } from '../types';
import { createStorage } from '../storage';
import { fileExists, readFile, writeFile, deleteFile } from './fs';
import { colors } from './colors';
import { getFormattedMarkerStart, getFormattedMarkerEnd } from './marker';
import { parseAndMatchPrompts } from './prompt-matcher';

export async function handleClean(
  dryRun: boolean = false,
  specificPrompts?: string
): Promise<void> {
  const storage = await createStorage();
  const allPrompts = await storage.getAll();

  if (allPrompts.length === 0) {
    console.log(colors.warning(`No prompts found in storage.`));
    return;
  }

  let selectedPrompts: Prompt[];

  if (specificPrompts && specificPrompts.trim() !== '') {
    // Non-interactive mode: use specified prompts
    const promptNames = allPrompts.map(p => p.name);
    const { matched, unmatched } = parseAndMatchPrompts(specificPrompts, promptNames);

    if (matched.length === 0) {
      console.log(colors.error(`No prompts matched the specified patterns: ${specificPrompts}`));
      return;
    }

    selectedPrompts = allPrompts.filter(p => matched.includes(p.name));

    if (unmatched.length > 0) {
      console.log(
        colors.warning(`Some patterns didn't match any prompts: ${unmatched.join(', ')}`)
      );
    }
  } else {
    // Interactive mode: ask whether to clean all or select specific prompts
    const modeAnswer = await promptsLib(
      [
        {
          type: 'select',
          name: 'mode',
          message: 'How would you like to clean prompts?',
          choices: [
            { title: 'Clean all prompts', value: 'all' },
            { title: 'Select specific prompts', value: 'select' },
          ],
        },
      ],
      {
        onCancel: () => {
          console.log('\nOperation cancelled.');
          process.exit(0);
        },
      }
    );

    if (modeAnswer.mode === 'all') {
      // Confirm cleaning all prompts
      const confirmAnswer = await promptsLib(
        [
          {
            type: 'confirm',
            name: 'confirm',
            message: `Clean ALL ${allPrompts.length} prompts from agent files? This will remove prompts from instruction files but keep them in storage.`,
            initial: false,
          },
        ],
        {
          onCancel: () => {
            console.log('\nOperation cancelled.');
            process.exit(0);
          },
        }
      );

      if (confirmAnswer.confirm) {
        selectedPrompts = allPrompts;
      } else {
        console.log(colors.warning('Operation cancelled.'));
        return;
      }
    } else {
      // Select specific prompts
      const choices = allPrompts.map(prompt => ({
        title: prompt.name,
        value: prompt.name,
      }));

      const answers = await promptsLib(
        [
          {
            type: 'multiselect',
            name: 'prompts',
            message: 'Select prompts to clean (remove from agent files):',
            choices,
            validate: (value: string[]) => {
              if (value.length < 1) {
                return 'You must select at least one prompt to clean.';
              }
              return true;
            },
          },
        ],
        {
          onCancel: () => {
            console.log('\nOperation cancelled.');
            process.exit(0);
          },
        }
      );

      const { prompts: selectedPromptNames } = answers;
      selectedPrompts = allPrompts.filter(p => selectedPromptNames.includes(p.name));
    }
  }

  if (dryRun) {
    console.log(colors.warning('DRY RUN MODE - No changes will be made'));
  }

  console.log('');
  console.log(colors.header('Searching for agent files containing cleaned prompts...'));
  await removePromptsFromAgentFiles(selectedPrompts, dryRun);
}

async function removePromptsFromAgentFiles(
  selectedPrompts: Prompt[],
  dryRun: boolean = false
): Promise<void> {
  const baseDir = process.cwd();
  let filesUpdated = 0;
  let filesDeleted = 0;

  const AGENT_FILES = [
    { pattern: 'CLAUDE.md', description: 'Claude Code' },
    { pattern: 'AGENTS.md', description: 'Codex, Cursor, Zed, Warp, Aider, RooCode, etc.' },
    { pattern: 'GEMINI.md', description: 'Google Gemini Code Assist CLI' },
    { pattern: '.github/copilot-instructions.md', description: 'GitHub Copilot' },
  ];

  for (const agentFile of AGENT_FILES) {
    const filePath = path.join(baseDir, agentFile.pattern);

    if (await fileExists(filePath)) {
      const content = await readFile(filePath);
      let updated = false;
      let modifiedContent = content;

      // For each deleted prompt, remove its specific markers
      for (const prompt of selectedPrompts) {
        const markerStart = getFormattedMarkerStart(prompt.marker);
        const markerEnd = getFormattedMarkerEnd(prompt.marker);

        const startRegex = new RegExp(escapeRegex(markerStart), 'g');

        const startMatches = content.match(startRegex);
        if (startMatches && startMatches.length > 0) {
          for (let i = 0; i < startMatches.length; i++) {
            modifiedContent = removeMarkerSection(modifiedContent, markerStart, markerEnd);
            updated = true;
          }
        }
      }

      if (updated) {
        const trimmedContent = modifiedContent.trim();
        if (trimmedContent.length === 0 || trimmedContent === '') {
          if (!dryRun) {
            await deleteFile(filePath);
          }
          filesDeleted++;
          console.log(
            colors.success(
              `${dryRun ? 'Would delete' : 'Deleted'} empty file: ${agentFile.pattern}`
            )
          );
        } else {
          if (!dryRun) {
            await writeFile(filePath, modifiedContent);
          }
          filesUpdated++;
          console.log(
            colors.success(`${dryRun ? 'Would update' : 'Updated'} file: ${agentFile.pattern}`)
          );
        }
      }
    }
  }

  if (filesUpdated === 0 && filesDeleted === 0) {
    console.log(colors.metadata('No agent files needed updating.'));
  } else {
    console.log(
      colors.success(
        `\n${dryRun ? 'Dry run summary' : 'Summary'}: ${filesUpdated} file(s) ${dryRun ? 'would be updated' : 'updated'}, ${filesDeleted} file(s) ${dryRun ? 'would be deleted' : 'deleted'}.`
      )
    );
  }
}

function removeMarkerSection(content: string, markerStart: string, markerEnd: string): string {
  let result = content;
  let startIndex = result.indexOf(markerStart);

  // Remove all instances of the marker pair
  while (startIndex !== -1) {
    const endIndex = result.indexOf(markerEnd, startIndex + markerStart.length);

    if (endIndex !== -1) {
      const before = result.substring(0, startIndex).trim();
      const after = result.substring(endIndex + markerEnd.length).trim();

      if (before && after) {
        result = before + '\n\n' + after;
      } else if (before) {
        result = before;
      } else if (after) {
        result = after;
      } else {
        result = '';
      }
    } else {
      // No matching end marker found, break to avoid infinite loop
      break;
    }

    // Look for the next instance
    startIndex = result.indexOf(markerStart);
  }

  return result;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
