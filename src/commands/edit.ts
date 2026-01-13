import { Command } from 'commander';
import { handleEdit } from '../utils/edit-handler';
import { withErrorHandling } from '../utils/error-handler';

interface EditOptions {
  content?: string;
  file?: string;
  name?: string;
  marker?: string;
  categories?: string;
}

export const editCommand = new Command('edit')
  .description(
    'Edit an existing prompt [name] [--name] [--content] [--file] [--marker] [--categories]'
  )
  .argument('[name]', 'Name of the prompt to edit (optional, will prompt if not provided)')
  .option('-c, --content <content>', 'New content for the prompt (use quotes for multi-line)')
  .option('-f, --file <path>', 'Read new content from file')
  .option('-n, --name <name>', 'New name for the prompt')
  .option('-m, --marker <marker>', 'New marker for the prompt')
  .option('-C, --categories <categories>', 'Comma-separated list of categories')
  .addHelpText(
    'after',
    `
 Examples:
   $ pti edit
   $ pti edit my-prompt
   $ pti edit my-prompt --content "New content"
   $ pti edit my-prompt --file updated.txt
   $ pti edit my-prompt --name new-name
   $ pti edit my-prompt --marker "NEW-MARKER-TEXT"
   $ pti edit my-prompt --categories "AI,Testing"
   $ pti edit my-prompt --name new-name --content "Updated content" --categories "Dev,Docs"`
  )
  .action(
    withErrorHandling(async (name: string | undefined, options: EditOptions) => {
      const categories = options.categories
        ? options.categories.split(',').map(c => c.trim())
        : undefined;
      await handleEdit(
        name,
        options.content,
        options.file,
        options.name,
        options.marker,
        categories
      );
    })
  );
