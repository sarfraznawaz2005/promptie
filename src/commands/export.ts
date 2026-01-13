import { Command } from 'commander';
import { handleExport } from '../utils/export-handler';
import { withErrorHandling } from '../utils/error-handler';

export const exportCommand = new Command('export')
  .description('Export prompts to a JSON file <path>')
  .argument('<path>', 'Path to export file')
  .addHelpText(
    'after',
    `
  Examples:
    $ pti export backup.json
    $ pti export ~/backups/prompts-$(date +%Y%m%d).json
    $ pti export /path/to/shared/prompts.json`
  )
  .action(
    withErrorHandling(async (path: string) => {
      await handleExport(path);
    })
  );
