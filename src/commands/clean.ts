import { Command } from 'commander';
import { handleClean } from '../utils/clean-handler';
import { withErrorHandling } from '../utils/error-handler';

interface CleanOptions {
  dryRun?: boolean;
  prompts?: string;
}

export const cleanCommand = new Command('clean')
  .description('Clean saved prompts and remove from agent files [--prompts] [--dry-run]')
  .option('--dry-run', 'Show what would be done without making changes')
  .option(
    '-p, --prompts <prompts>',
    'Specific prompts to clean (comma-separated, supports wildcards)'
  )
  .addHelpText(
    'after',
    `
 Examples:
   $ pti clean
   $ pti clean --dry-run
   $ pti clean --prompts "prompt1,prompt2"
   $ pti clean --prompts "react-*,*api*"`
  )
  .action(
    withErrorHandling(async (options: CleanOptions) => {
      await handleClean(options.dryRun, options.prompts);
    })
  );
