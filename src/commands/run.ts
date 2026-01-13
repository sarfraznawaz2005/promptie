import { Command } from 'commander';
import { handleRun } from '../utils/run-handler';
import { withErrorHandling } from '../utils/error-handler';

interface RunOptions {
  vars?: string[];
}

export const runCommand = new Command('run')
  .description('Run prompt with placeholder substitution [name] [--vars]')
  .argument('[name]', 'Name of the prompt to run (optional, will prompt if not provided)')
  .option('-v, --vars <key=value...>', 'Provide placeholder values as key=value pairs')
  .addHelpText(
    'after',
    `
 Examples:
   $ pti run my-prompt
   $ pti run  # Interactive mode
   $ pti run --vars name=John age=25  # Interactive prompt selection with variables

 Note: If the prompt contains placeholders like {{param}}, you will be prompted to provide values unless --vars is used.`
  )
  .action(
    withErrorHandling(async (name: string | undefined, options: RunOptions) => {
      if (!name) {
        // Interactive mode - no name provided, will be handled in handleRun
        await handleRun('', options.vars);
      } else {
        await handleRun(name, options.vars);
      }
    })
  );
