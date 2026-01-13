import { Command } from 'commander';
import { handleApply } from '../utils/apply-handler';
import { withErrorHandling } from '../utils/error-handler';

interface ApplyOptions {
  dryRun?: boolean;
  prompts?: string;
  files?: string[];
}

export const applyCommand = new Command('apply')
  .description(
    'Apply saved prompts to AI agent instruction files [--prompts] [--files] [--dry-run]'
  )
  .option('--dry-run', 'Show what would be done without making changes')
  .option(
    '-p, --prompts <prompts>',
    'Specific prompts to apply (comma-separated, supports wildcards)'
  )
  .option(
    '-f, --files <files...>',
    'Specific agent files to update (CLAUDE.md, AGENTS.md, GEMINI.md, .github/copilot-instructions.md)'
  )
  .addHelpText(
    'after',
    `
 Examples:
   $ pti apply
   $ pti apply --dry-run
   $ pti apply --prompts "typescript-prompt,react-*"
   $ pti apply --prompts "*api*,debug" --files CLAUDE.md AGENTS.md`
  )
  .action(
    withErrorHandling(async (options: ApplyOptions) => {
      await handleApply(options.dryRun, options.prompts, options.files);
    })
  );
