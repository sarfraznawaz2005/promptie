import promptsLib from 'prompts';
import * as path from 'path';
import { Prompt } from '../types';
import { createStorage } from '../storage';
import { fileExists, readFile, writeFile } from './fs';
import { colors } from './colors';
import { getFormattedMarkerStart, getFormattedMarkerEnd } from './marker';
import { parseAndMatchPrompts } from './prompt-matcher';

const AGENT_FILES = [
  { pattern: 'CLAUDE.md', description: 'Claude Code' },
  { pattern: 'AGENTS.md', description: 'Codex, Cursor, Zed, Warp, Aider, RooCode, etc.' },
  { pattern: 'GEMINI.md', description: 'Google Gemini Code Assist CLI' },
  { pattern: '.github/copilot-instructions.md', description: 'GitHub Copilot' },
];

export async function handleApply(
  dryRun: boolean = false,
  specificPrompts?: string,
  specificFiles?: string[]
): Promise<void> {
  const storage = await createStorage();
  const allPrompts = await storage.getAll();

  if (allPrompts.length === 0) {
    console.log(colors.warning(`No prompts found in storage.`));
    console.log(colors.metadata(`Run "pti create" to create your first prompt.`));
    process.exit(1);
  }

  console.log(colors.header('Step 1.'));

  if (dryRun) {
    console.log(colors.warning('DRY RUN MODE - No files will be modified'));
  }

  let selectedPrompts: Prompt[];
  let selectedAgentFiles: string[];

  if (
    specificPrompts &&
    specificPrompts.trim() !== '' &&
    ((specificFiles && specificFiles.length > 0) || dryRun)
  ) {
    // Non-interactive mode: use specified prompts and files (or all files for dry-run)
    const promptNames = allPrompts.map(p => p.name);
    const { matched, unmatched } = parseAndMatchPrompts(specificPrompts, promptNames);

    if (matched.length === 0) {
      console.log(colors.error(`No prompts matched the specified patterns: ${specificPrompts}`));
      process.exit(1);
    }

    selectedPrompts = allPrompts.filter(p => matched.includes(p.name));

    if (unmatched.length > 0) {
      console.log(
        colors.warning(`Some patterns didn't match any prompts: ${unmatched.join(', ')}`)
      );
    }

    // Determine agent files: use specified files or all available for dry-run
    if (specificFiles && specificFiles.length > 0) {
      // Validate specified agent files
      const validAgentFiles = AGENT_FILES.map(af => af.pattern);
      const invalidFiles = specificFiles.filter(file => !validAgentFiles.includes(file));
      if (invalidFiles.length > 0) {
        console.log(colors.error(`Invalid agent files: ${invalidFiles.join(', ')}`));
        console.log(colors.metadata(`Valid options: ${validAgentFiles.join(', ')}`));
        process.exit(1);
      }
      selectedAgentFiles = specificFiles;
    } else {
      // For dry-run without specific files, use all available agent files
      selectedAgentFiles = AGENT_FILES.map(af => af.pattern);
    }
  } else {
    // Interactive mode: prompt user to select
    const answers = await promptsLib(
      [
        {
          type: 'multiselect',
          name: 'agentFiles',
          message: 'Select instruction files for CLI-based AI tools:',
          choices: await getAgentFileChoices(),
          validate: (value: string[]) => {
            if (value.length < 1) {
              return 'You must select at least one agent file.';
            }
            return true;
          },
        },
        {
          type: 'multiselect',
          name: 'prompts',
          message: 'Select prompts to apply:',
          choices: allPrompts.map(p => ({
            title: p.name,
            value: p.name,
          })),
          validate: (value: string[]) => {
            if (value.length < 1) {
              return 'You must select at least one prompt.';
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

    const { agentFiles, prompts: selectedPromptNames } = answers;
    selectedAgentFiles = agentFiles;

    // Map selected prompt names to actual Prompt objects
    selectedPrompts = allPrompts.filter(p => selectedPromptNames.includes(p.name));
  }

  console.log('');
  console.log(
    colors.header(
      `Applying ${selectedPrompts.length} prompt(s) to ${selectedAgentFiles.length} file(s)...`
    )
  );
  let filesCreated = 0;
  let filesUpdated = 0;
  let processed = 0;

  for (const agentFilePattern of selectedAgentFiles) {
    processed++;
    console.log(
      colors.metadata(`Processing ${processed}/${selectedAgentFiles.length}: ${agentFilePattern}`)
    );

    const filePath = path.join(process.cwd(), agentFilePattern);

    if (await fileExists(filePath)) {
      if (!dryRun) {
        await updateExistingFile(filePath, selectedPrompts);
      }
      filesUpdated++;
      console.log(colors.success(`${dryRun ? 'Would update' : 'Updated'}: ${agentFilePattern}`));
    } else {
      if (!dryRun) {
        await createNewFile(filePath, selectedPrompts);
      }
      filesCreated++;
      console.log(colors.success(`${dryRun ? 'Would create' : 'Created'}: ${agentFilePattern}`));
    }
  }

  console.log(
    colors.success(
      `\n${dryRun ? 'Dry run completed' : 'Success'}! ${filesCreated} file(s) ${dryRun ? 'would be created' : 'created'}, ${filesUpdated} file(s) ${dryRun ? 'would be updated' : 'updated'}.`
    )
  );
}

async function getAgentFileChoices(): Promise<
  Array<{ title: string; value: string; selected?: boolean }>
> {
  const baseDir = process.cwd();
  const choices: Array<{ title: string; value: string; selected?: boolean }> = [];

  for (const agentFile of AGENT_FILES) {
    const filePath = path.join(baseDir, agentFile.pattern);
    const exists = await fileExists(filePath);
    choices.push({
      title: `${agentFile.pattern} — ${agentFile.description}`,
      value: agentFile.pattern,
      selected: exists,
    });
  }

  return choices;
}

async function updateExistingFile(filePath: string, selectedPrompts: Prompt[]): Promise<void> {
  const content = await readFile(filePath);

  // Remove existing sections for the prompts being applied
  let modifiedContent = content;
  for (const prompt of selectedPrompts) {
    modifiedContent = removeMarkerSection(
      modifiedContent,
      getFormattedMarkerStart(prompt.marker),
      getFormattedMarkerEnd(prompt.marker)
    );
  }

  // Add the new combined content
  const combinedContent = selectedPrompts
    .map(
      prompt =>
        `${getFormattedMarkerStart(prompt.marker)}\n\n${prompt.content}\n\n${getFormattedMarkerEnd(prompt.marker)}`
    )
    .join('\n\n');

  const finalContent = modifiedContent.trim() + '\n\n' + combinedContent;
  await writeFile(filePath, finalContent);
}

async function createNewFile(filePath: string, selectedPrompts: Prompt[]): Promise<void> {
  const content = selectedPrompts
    .map(
      prompt =>
        `${getFormattedMarkerStart(prompt.marker)}\n\n${prompt.content}\n\n${getFormattedMarkerEnd(prompt.marker)}`
    )
    .join('\n\n');

  await writeFile(filePath, content);
}

function removeMarkerSection(content: string, markerStart: string, markerEnd: string): string {
  const startIndex = content.indexOf(markerStart);
  const endIndex = content.indexOf(markerEnd, startIndex + markerStart.length);

  if (startIndex !== -1 && endIndex !== -1) {
    const before = content.substring(0, startIndex).trim();
    const after = content.substring(endIndex + markerEnd.length).trim();

    if (before && after) {
      return before + '\n\n' + after;
    } else if (before) {
      return before;
    } else if (after) {
      return after;
    } else {
      return '';
    }
  }

  return content;
}
