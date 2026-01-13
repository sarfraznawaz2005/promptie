import { Command } from 'commander';
import { handleLocation } from '../utils/location-handler';
import { withErrorHandling } from '../utils/error-handler';

interface LocationOptions {
  confirm?: boolean;
}

export const locationCommand = new Command('location')
  .description('Manage the data storage location for prompts and categories')
  .argument('[new-path]', 'New path to set as data storage location')
  .option('-y, --confirm', 'Skip confirmation prompt when setting new location')
  .addHelpText(
    'after',
    `
 Examples:
   $ pti location                          # Show current data storage location
   $ pti location /home/user/promptie-data  # Set new data storage location
   $ pti location /path/to/new/dir -y       # Set new location without confirmation

 Note: This will move your existing prompt and category data to the new location.`
  )
  .action(
    withErrorHandling(async (newPath: string | undefined, options: LocationOptions) => {
      await handleLocation(newPath, options.confirm);
    })
  );
