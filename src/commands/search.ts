import { Command } from 'commander';
import { handleSearch } from '../utils/search-handler';
import { withErrorHandling } from '../utils/error-handler';

interface SearchOptions {
  category?: string[];
}

export const searchCommand = new Command('search')
  .description('Search through saved prompts using fuzzy matching [--category] <query>')
  .argument('<query>', 'Search query')
  .option(
    '-c, --category <category>',
    'Filter by category (can be used multiple times)',
    (value, previous: string[]) => (previous || []).concat([value]),
    []
  )
  .addHelpText(
    'after',
    `
 Examples:
   $ pti search typescript
   $ pti search "react"
   $ pti search "AI" --category "AI"
   $ pti search "coding" --category "Coding" --category "Development"`
  )
  .action(
    withErrorHandling(async (query: string, options: SearchOptions) => {
      await handleSearch(query, options.category);
    })
  );
