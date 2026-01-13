import { Command } from 'commander';
import { handleTui } from '../utils/tui-handler';
import { withErrorHandling } from '../utils/error-handler';

export const uiCommand = new Command('ui')
  .description('Terminal UI for viewing prompts')
  .action(
    withErrorHandling(async () => {
      await handleTui();
    })
  );
