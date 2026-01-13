import { Command } from 'commander';
import { colors } from '../utils/colors';

export const onboardCommand = new Command('onboard')
  .description('Display all commands with non-interactive usage for automation and scripting')
  .action(() => {
    console.log(colors.header('🚀 Promptie Commands for Automation & Scripting\n'));
    console.log(
      colors.metadata('This guide shows all available commands in non-interactive mode only.')
    );
    console.log(
      colors.metadata('Use these programmatic interfaces for automation and scripting.\n')
    );

    console.log(colors.header('## Core Commands\n'));

    console.log(colors.label('### create'));
    console.log(colors.text('Create a new prompt'));
    console.log(
      colors.metadata('pti create --name my-prompt --content "Your prompt content here"')
    );
    console.log(colors.metadata('pti create --name my-prompt --file prompt.txt'));
    console.log(
      colors.metadata('pti create --name my-prompt --content "Content" --categories "AI" "Coding"')
    );
    console.log(colors.metadata('pti create --name my-prompt --marker "CUSTOM-MARKER"\n'));

    console.log(colors.label('### edit'));
    console.log(colors.text('Edit an existing prompt'));
    console.log(colors.metadata('pti edit my-prompt --content "Updated prompt content"'));
    console.log(colors.metadata('pti edit my-prompt --file updated.txt'));
    console.log(colors.metadata('pti edit my-prompt --name new-name'));
    console.log(colors.metadata('pti edit my-prompt --marker "NEW-MARKER"'));
    console.log(colors.metadata('pti edit my-prompt --categories "AI,Testing"\n'));

    console.log(colors.label('### apply'));
    console.log(colors.text('Apply saved prompts to AI agent instruction files'));
    console.log(colors.metadata('pti apply'));
    console.log(
      colors.metadata('pti apply --prompts "typescript-prompt,react-*" --files CLAUDE.md AGENTS.md')
    );
    console.log(colors.metadata('pti apply --dry-run\n'));

    console.log(colors.label('### get'));
    console.log(colors.text('Get prompt content and display on CLI'));
    console.log(colors.metadata('pti get my-prompt'));
    console.log(colors.metadata('pti get my-prompt --all\n'));

    console.log(colors.label('### ui'));
    console.log(colors.text('Terminal UI for viewing prompts'));
    console.log(colors.metadata('pti ui\n'));

    console.log(colors.header('## Management Commands\n'));

    console.log(colors.label('### list'));
    console.log(colors.text('Display list of saved prompts'));
    console.log(colors.metadata('pti list'));
    console.log(colors.metadata('pti list --full'));
    console.log(colors.metadata('pti list --json'));
    console.log(colors.metadata('pti list --category "AI"'));
    console.log(colors.metadata('pti list --sort-by date --sort-order desc\n'));

    console.log(colors.label('### search'));
    console.log(colors.text('Search through saved prompts using fuzzy matching'));
    console.log(colors.metadata('pti search "typescript"'));
    console.log(colors.metadata('pti search "AI" --category "AI"\n'));

    console.log(colors.label('### run'));
    console.log(colors.text('Run prompt with placeholder substitution'));
    console.log(colors.metadata('pti run my-prompt'));
    console.log(colors.metadata('pti run my-prompt --vars name=John age=25\n'));

    console.log(colors.label('### clean'));
    console.log(colors.text('Clean saved prompts and remove from agent files'));
    console.log(colors.metadata('pti clean'));
    console.log(colors.metadata('pti clean --prompts "prompt1,prompt2"\n'));

    console.log(colors.label('### delete'));
    console.log(colors.text('Delete saved prompts from storage'));
    console.log(colors.metadata('pti delete --all --yes'));
    console.log(colors.metadata('pti delete --prompts "prompt1,prompt2"\n'));

    console.log(colors.header('## Data Commands\n'));

    console.log(colors.label('### export'));
    console.log(colors.text('Export prompts to a JSON file'));
    console.log(colors.metadata('pti export backup.json\n'));

    console.log(colors.label('### import'));
    console.log(colors.text('Import prompts from a JSON file'));
    console.log(colors.metadata('pti import backup.json'));
    console.log(colors.metadata('pti import backup.json --overwrite-all\n'));

    console.log(colors.header('## Category Commands\n'));

    console.log(colors.label('### category create'));
    console.log(colors.text('Create a new category'));
    console.log(colors.metadata('pti category create\n'));

    console.log(colors.label('### category list'));
    console.log(colors.text('List all categories'));
    console.log(colors.metadata('pti category list\n'));

    console.log(colors.label('### category get'));
    console.log(colors.text('Get detailed information about a category'));
    console.log(colors.metadata('pti category get "AI"\n'));

    console.log(colors.label('### category edit'));
    console.log(colors.text('Edit an existing category'));
    console.log(colors.metadata('pti category edit "CategoryName"'));
    console.log(colors.metadata('pti category edit "CategoryName" --name "NewName"'));
    console.log(
      colors.metadata('pti category edit "CategoryName" --description "New description"\n')
    );

    console.log(colors.label('### category delete'));
    console.log(colors.text('Delete a category'));
    console.log(colors.metadata('pti category delete "Category"\n'));

    console.log(colors.label('### category search'));
    console.log(colors.text('Search categories by keyword'));
    console.log(colors.metadata('pti category search "dev"\n'));

    console.log(colors.header('## Statistics\n'));

    console.log(colors.label('### stats'));
    console.log(colors.text('Display statistics about prompts and categories'));
    console.log(colors.metadata('pti stats'));
    console.log(colors.metadata('pti stats --json'));
    console.log(colors.metadata('pti stats --category "AI"'));
    console.log(colors.metadata('pti stats --recent 7\n'));

    console.log(colors.header('## Configuration\n'));

    console.log(colors.label('### location'));
    console.log(colors.text('Manage the data storage location for prompts and categories'));
    console.log(colors.metadata('pti location                          # Show current location'));
    console.log(colors.metadata('pti location /path/to/new/dir         # Set new location'));
    console.log(colors.metadata('pti location /path/to/new/dir -y       # Skip confirmation\n'));

    console.log(colors.header('## Development & Testing\n'));

    console.log(colors.label('### sample'));
    console.log(colors.text('Create sample prompts and categories for testing (dev only)'));
    console.log(colors.metadata('pti sample\n'));

    console.log(colors.metadata('💡 Use --help with any command for detailed options'));
  });
