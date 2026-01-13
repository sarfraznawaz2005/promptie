import { Command } from 'commander';
import { handleStats } from '../utils/stats-handler';
import { withErrorHandling } from '../utils/error-handler';

interface StatsOptions {
  json?: boolean;
  category?: string;
  recent?: number;
}

export const statsCommand = new Command('stats')
  .description('Display statistics about prompts and categories [--json] [--category] [--recent]')
  .option('-j, --json', 'Output in JSON format')
  .option('-c, --category <category>', 'Show statistics for specific category')
  .option(
    '-r, --recent <days>',
    'Show statistics for prompts created/updated in last N days',
    parseInt
  )
  .addHelpText(
    'after',
    `
Examples:
  $ pti stats
  $ pti stats --json
  $ pti stats --category "AI"
  $ pti stats --recent 7  # Last 7 days`
  )
  .action(
    withErrorHandling(async (options: StatsOptions) => {
      await handleStats(options.json, options.category, options.recent);
    })
  );
