import { Command } from 'commander';
import { handleSave } from '../utils/save-handler';
import { withErrorHandling } from '../utils/error-handler';

interface CreateOptions {
  name?: string;
  content?: string;
  file?: string;
  marker?: string;
  categories?: string[];
}

export const createCommand = new Command('create')
  .description('Create a new prompt [--name] [--content] [--file] [--categories]')
  .option('-n, --name <name>', 'Prompt name (alphanumeric, hyphens, underscores only)')
  .option('-c, --content <content>', 'Prompt content (use quotes for multi-line)')
  .option('-f, --file <path>', 'Read prompt content from file')
  .option('-m, --marker <marker>', 'Custom marker (defaults to "USER-RULES")')
  .option('-C, --categories <categories...>', 'Categories for this prompt (space-separated)')
  .addHelpText(
    'after',
    `
 Examples:
   $ pti create
   $ pti create --name my-prompt --content "Be helpful"
   $ pti create --name my-prompt --file prompt.txt
   $ pti create --name my-prompt --content "Be helpful" --categories "AI" "Coding"`
  )
  .action(
    withErrorHandling(async (options: CreateOptions) => {
      await handleSave(
        {},
        options.name,
        options.content,
        options.file,
        options.marker,
        options.categories
      );
    })
  );
