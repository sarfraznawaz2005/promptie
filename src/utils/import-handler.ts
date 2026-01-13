import inquirer from 'inquirer';
import { colors, formatDate } from './colors';
import { Prompt } from '../types';
import { createStorage } from '../storage';
import { readJsonFile, fileExists } from './fs';

interface ImportData {
  version?: string;
  exportedAt?: string;
  prompts: Prompt[];
}

interface Answers {
  conflicts: string[];
}

export async function handleImport(importPath: string, overwriteAll?: boolean): Promise<void> {
  const exists = await fileExists(importPath);
  if (!exists) {
    console.log(colors.error(`Import file not found: ${importPath}`));
    process.exit(1);
  }

  const data = await readJsonFile<ImportData>(importPath);
  if (!data || !Array.isArray(data.prompts)) {
    console.log(colors.error('Invalid import file format.'));
    process.exit(1);
  }

  const storage = await createStorage();
  const existingPrompts = await storage.getAll();

  const conflicts: Prompt[] = [];
  const newPrompts: Prompt[] = [];

  for (const prompt of data.prompts) {
    const exists = existingPrompts.some(p => p.name === prompt.name);
    if (exists) {
      conflicts.push(prompt);
    } else {
      newPrompts.push(prompt);
    }
  }

  if (conflicts.length > 0) {
    console.log(colors.warning(`\n${conflicts.length} prompt(s) already exist:\n`));

    let conflictsToOverwrite: string[];

    if (overwriteAll) {
      conflictsToOverwrite = conflicts.map(p => p.name);
      console.log(colors.info('Overwriting all conflicting prompts (--overwrite-all flag used)'));
    } else {
      const conflictChoices = conflicts.map(p => ({
        name: `${p.name} (${formatDate(p.updatedAt || p.createdAt)})`,
        value: p.name,
      }));

      const { conflicts: selectedConflicts } = await inquirer.prompt<Answers>([
        {
          type: 'checkbox',
          name: 'conflicts',
          message: 'Select prompts to overwrite (use space to toggle, enter to confirm):',
          choices: conflictChoices,
        },
      ]);
      conflictsToOverwrite = selectedConflicts;
    }

    for (const name of conflictsToOverwrite) {
      const prompt = conflicts.find(p => p.name === name);
      if (prompt) {
        await storage.save(prompt);
        console.log(colors.success(`✓ Overwrote prompt: ${name}`));
      }
    }
  }

  if (newPrompts.length > 0) {
    for (const prompt of newPrompts) {
      await storage.save(prompt);
      console.log(colors.success(`✓ Imported prompt: ${prompt.name}`));
    }
  }

  const total = newPrompts.length + (conflicts.length > 0 ? conflicts.length : 0);
  console.log(colors.text(`\n✓ Successfully imported ${total} prompt(s).`));
}
