import { Command } from 'commander';
import {
  handleCreateCategory,
  handleEditCategory,
  handleDeleteCategory,
  handleGetCategory,
  handleListCategories,
  handleSearchCategories,
} from '../utils/category-handler';
import { withErrorHandling } from '../utils/error-handler';

const createCommand = new Command('create').description('Create a new category').action(
  withErrorHandling(async () => {
    await handleCreateCategory();
  })
);

const editCommand = new Command('edit')
  .description('Edit an existing category')
  .argument('[name]', 'Category name to edit (optional, will prompt if not provided)')
  .option('-n, --name <name>', 'New name for the category')
  .option('-d, --description <description>', 'New description for the category')
  .action(
    withErrorHandling(
      async (name: string | undefined, options: { name?: string; description?: string }) => {
        await handleEditCategory(name, options.name, options.description);
      }
    )
  );

const deleteCommand = new Command('delete')
  .aliases(['del', 'rm'])
  .description('Delete a category')
  .argument('<name>', 'Category name to delete')
  .action(
    withErrorHandling(async (name: string) => {
      await handleDeleteCategory(name);
    })
  );

const getCommand = new Command('get')
  .aliases(['info'])
  .description('Get detailed information about a category')
  .argument('<name>', 'Category name to view')
  .action(
    withErrorHandling(async (name: string) => {
      await handleGetCategory(name);
    })
  );

const listCommand = new Command('list')
  .aliases(['ls'])
  .description('List all categories')
  .action(
    withErrorHandling(async () => {
      await handleListCategories();
    })
  );

const searchCommand = new Command('search')
  .description('Search categories by keyword (fuzzy search)')
  .argument('<keyword>', 'Keyword to search for')
  .action(
    withErrorHandling(async (keyword: string) => {
      await handleSearchCategories(keyword);
    })
  );

export const categoryCommand = new Command('category')
  .aliases(['cat'])
  .description('Manage categories for prompts')
  .addCommand(createCommand)
  .addCommand(editCommand)
  .addCommand(deleteCommand)
  .addCommand(getCommand)
  .addCommand(listCommand)
  .addCommand(searchCommand)
  .addHelpText(
    'after',
    `
 Category Management:
   Categories help organize your prompts by topic, project, or use case.

  Examples:
    # List all categories and their usage
    $ pti category list

    # Create a new category
    $ pti category create

    # Get details about a specific category
    $ pti category get "AI"

    # Rename a category
    $ pti category rename "OldName" "NewName"
    $ pti category rename "OldName"  # Will prompt for new name

    # Edit a category description
    $ pti category edit "CategoryName"

    # Delete a category (will remove it from all prompts)
    $ pti category delete "UnusedCategory"

    # Search categories by keyword
    $ pti category search "dev"

   # Filter prompts by category
   $ pti list --category "AI"
   $ pti search "typescript" --category "Coding"`
  );
