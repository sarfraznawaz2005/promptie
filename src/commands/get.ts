import { Command } from 'commander';
import inquirer from 'inquirer';
import { handleGet } from '../utils/get-handler';
import { withErrorHandling } from '../utils/error-handler';
import { createStorage } from '../storage';
import { colors } from '../utils/colors';

interface GetOptions {
  all?: boolean;
}

export const getCommand = new Command('get')
  .description('Get prompt content and display on CLI [name] [--all]')
  .argument('[name]', 'Name of the prompt to get (optional, will prompt if not provided)')
  .option('-a, --all', 'Get all fields (JSON format) instead of just content')
  .addHelpText(
    'after',
    `
 Examples:
   $ pti get my-prompt
   $ pti get my-prompt --all
   $ pti get  # Interactive mode

 Copy to clipboard:
   $ pti get my-prompt | clip          # Windows
   $ pti get my-prompt | pbcopy        # macOS
   $ pti get my-prompt | xclip -sel clip  # Linux (with xclip)
   $ pti get my-prompt | wl-copy       # Wayland (with wl-clipboard)`
  )
  .action(
    withErrorHandling(async (name: string | undefined, options: GetOptions) => {
      let promptName = name;
      if (!promptName) {
        // Interactive mode - prompt user to select a prompt
        const storage = await createStorage();
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
            message: 'Select a prompt to get:',
            choices,
          },
        ]);

        promptName = selectedName;
      }

      await handleGet(promptName, options.all);
    })
  );
