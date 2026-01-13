import { Command } from 'commander';
import { handleImport } from '../utils/import-handler';
import { withErrorHandling } from '../utils/error-handler';

interface ImportOptions {
  overwriteAll?: boolean;
}

export const importCommand = new Command('import')
  .description('Import prompts from a JSON file [--overwrite-all] <path>')
  .argument('<path>', 'Path to import file')
  .option('--overwrite-all', 'Overwrite all conflicting prompts without prompting')
  .addHelpText(
    'after',
    `
  Examples:
    $ pti import backup.json
    $ pti import ~/backups/prompts.json
    $ pti import shared-prompts.json --overwrite-all  # Non-interactive mode`
  )
  .action(
    withErrorHandling(async (path: string, options: ImportOptions) => {
      await handleImport(path, options.overwriteAll);
    })
  );
