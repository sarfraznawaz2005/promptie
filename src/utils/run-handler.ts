import inquirer from 'inquirer';
import { createStorage } from '../storage';
import { colors } from './colors';
import { parsePlaceholders, substitutePlaceholders } from './placeholder';

interface PromptAnswers {
  [key: string]: string;
}

export async function handleRun(name: string, vars?: string[]): Promise<void> {
  const storage = await createStorage();

  let promptName = name;

  if (!name) {
    // Interactive mode - prompt user to select a prompt
    const prompts = await storage.getAll();

    if (prompts.length === 0) {
      console.log(colors.error(`No prompts found in storage.`));
      console.log(colors.metadata(`Use "pti create" to create your first prompt.`));
      return;
    }

    const choices = prompts.map(prompt => ({
      name: `${prompt.name} (${prompt.content.substring(0, 50)}${prompt.content.length > 50 ? '...' : ''})`,
      value: prompt.name,
    }));

    const { selectedName } = await inquirer.prompt<{ selectedName: string }>([
      {
        type: 'list',
        name: 'selectedName',
        message: 'Select a prompt to run:',
        choices,
      },
    ]);

    promptName = selectedName;
  }

  const prompt = await storage.get(promptName);
  if (!prompt) {
    console.log(colors.error(`Prompt "${promptName}" not found in storage.`));
    console.log(colors.metadata(`Use "pti list" to see available prompts.`));
    return;
  }

  const placeholders = parsePlaceholders(prompt.content);

  if (placeholders.length === 0) {
    // No placeholders, just output the content
    console.log(prompt.content);
    return;
  }

  let answers: PromptAnswers;

  if (vars && vars.length > 0) {
    // Non-interactive mode: parse vars as key=value pairs
    answers = {};
    for (const varPair of vars) {
      const [key, ...valueParts] = varPair.split('=');
      if (!key || valueParts.length === 0) {
        console.log(colors.error(`Invalid var format: ${varPair}. Use key=value format.`));
        process.exit(1);
      }
      const value = valueParts.join('='); // In case value contains =
      if (!value.trim()) {
        console.log(colors.error(`Value for ${key} cannot be empty.`));
        process.exit(1);
      }
      answers[key] = value;
    }

    // Check that all required placeholders are provided
    const missing = placeholders.filter(p => !answers[p]);
    if (missing.length > 0) {
      console.log(colors.error(`Missing values for placeholders: ${missing.join(', ')}`));
      process.exit(1);
    }
  } else {
    // Interactive mode: prompt user for each placeholder value
    const questions = placeholders.map(placeholder => ({
      type: 'input',
      name: placeholder,
      message: `Value for ${placeholder}:`,
      validate: (input: string) => {
        if (!input.trim()) {
          return `Value for ${placeholder} cannot be empty.`;
        }
        return true;
      },
    }));

    try {
      answers = await inquirer.prompt(questions);
    } catch (error) {
      // User cancelled (Ctrl+C)
      console.log(colors.metadata('\nOperation cancelled.'));
      return;
    }
  }

  // Substitute placeholders with user values
  const result = substitutePlaceholders(prompt.content, answers);
  console.log(result);
}
