import { Command } from 'commander';
import { handleDelete } from '../utils/delete-handler';
import { withErrorHandling } from '../utils/error-handler';

interface DeleteOptions {
  all?: boolean;
  yes?: boolean;
  prompts?: string;
}

export const deleteCommand = new Command('delete')
  .aliases(['rm'])
  .description('Delete saved prompts from storage [--all] [--prompts] [--yes]')
  .option('-a, --all', 'Delete all prompts after confirmation')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option(
    '-p, --prompts <prompts>',
    'Specific prompts to delete (comma-separated, supports wildcards)'
  )
  .addHelpText(
    'after',
    `
 Examples:
   $ pti delete
   $ pti rm --all --yes
   $ pti delete --prompts "prompt1,prompt2"
   $ pti delete --prompts "react-*,*api*"`
  )
  .action(
    withErrorHandling(async (options: DeleteOptions) => {
      await handleDelete(options.all, options.yes, options.prompts);
    })
  );
