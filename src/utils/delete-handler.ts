import inquirer from 'inquirer';
import { createStorage } from '../storage';
import { colors } from './colors';
import { parseAndMatchPrompts } from './prompt-matcher';

interface Answers {
  prompts?: string[];
  confirm?: boolean;
}

export async function handleDelete(
  deleteAll: boolean = false,
  skipConfirm: boolean = false,
  specificPrompts?: string
): Promise<void> {
  const storage = await createStorage();
  const prompts = await storage.getAll();

  if (prompts.length === 0) {
    console.log(colors.warning(`No prompts found in storage.`));
    return;
  }

  if (deleteAll) {
    if (!skipConfirm) {
      const { confirm } = await inquirer.prompt<Answers>([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Delete ALL ${prompts.length} prompts from storage? This action cannot be undone.`,
          default: false,
        },
      ]);

      if (!confirm) {
        console.log(colors.warning('Operation cancelled.'));
        return;
      }
    }

    for (const prompt of prompts) {
      await storage.delete(prompt.name);
    }
    console.log(colors.success(`Deleted all ${prompts.length} prompts from storage.`));
  } else {
    let selectedPrompts: string[];

    if (specificPrompts && specificPrompts.trim() !== '') {
      // Non-interactive mode: use specified prompts
      const promptNames = prompts.map(p => p.name);
      const { matched, unmatched } = parseAndMatchPrompts(specificPrompts, promptNames);

      if (matched.length === 0) {
        console.log(colors.error(`No prompts matched the specified patterns: ${specificPrompts}`));
        return;
      }

      selectedPrompts = matched;

      if (unmatched.length > 0) {
        console.log(
          colors.warning(`Some patterns didn't match any prompts: ${unmatched.join(', ')}`)
        );
      }
    } else {
      // Interactive mode: prompt user to select
      const choices = prompts.map(prompt => ({
        name: prompt.name,
        value: prompt.name,
      }));

      const answers = await inquirer.prompt<Answers>([
        {
          type: 'checkbox',
          name: 'prompts',
          message: 'Select prompts to delete (use space to toggle, enter to confirm):',
          choices,
          validate: (answer: string[]) => {
            if (answer.length < 1) {
              return 'You must select at least one prompt to delete.';
            }
            return true;
          },
        },
      ]);

      selectedPrompts = answers.prompts!;
    }

    console.log('');
    for (const name of selectedPrompts) {
      await storage.delete(name);
      console.log(colors.success(`Deleted prompt "${name}" from storage.`));
    }
  }
}
