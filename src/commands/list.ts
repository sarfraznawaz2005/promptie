import { Command } from 'commander';
import { handleList } from '../utils/list-handler';
import { withErrorHandling } from '../utils/error-handler';

interface ListOptions {
  full?: boolean;
  json?: boolean;
  category?: string[];
  sortBy?: string;
  sortOrder?: string;
}

export const listCommand = new Command('list')
  .aliases(['ls'])
  .description(
    'Display list of saved prompts [--full] [--json] [--category] [--sort-by] [--sort-order]'
  )
  .option('-f, --full', 'Show full content in detailed view')
  .option('-j, --json', 'Output in JSON format')
  .option(
    '-c, --category <category>',
    'Filter by category (can be used multiple times)',
    (value, previous: string[]) => (previous || []).concat([value]),
    []
  )
  .option('--sort-by <field>', 'Sort by field (name, date)', 'name')
  .option('--sort-order <order>', 'Sort order (asc, desc)', 'asc')
  .addHelpText(
    'after',
    `
  Examples:
    $ pti list
    $ pti ls --json
    $ pti list --full
    $ pti list --category "AI"
    $ pti list --category "AI" --category "Coding"
    $ pti list --sort-by date --sort-order desc`
  )
  .action(
    withErrorHandling(async (options: ListOptions) => {
      await handleList(
        options.full,
        options.json,
        options.category,
        options.sortBy,
        options.sortOrder
      );
    })
  );
