import inquirer from 'inquirer';
import promptsLib from 'prompts';
import { Category } from '../types';
import { createStorage, createCategoryStorage } from '../storage';
import { SaveError, LoadError } from './errors';
import { formatTable, TableColumn } from './table';
import { colors, formatDate } from './colors';

export async function handleCreateCategory(): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Category name:',
      validate: (input: string) => {
        const trimmed = input.trim();
        if (!trimmed) {
          return 'Name is required.';
        }
        if (trimmed.length < 3) {
          return 'Category name must be at least 3 characters.';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description (optional):',
      validate: (input: string) => {
        const trimmed = input.trim();
        if (trimmed && trimmed.length < 10) {
          return 'Description must be at least 10 characters.';
        }
        return true;
      },
    },
  ]);

  const category: Category = {
    name: answers.name.trim(),
    description: answers.description.trim() || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const storage = await createCategoryStorage();

  if (await storage.exists(category.name)) {
    throw new SaveError(`Category '${category.name}' already exists`);
  }

  await storage.save(category);
  console.log(colors.success(`Category '${category.name}' added successfully`));
}

export async function handleEditCategory(
  specifiedName?: string,
  newName?: string,
  newDescription?: string
): Promise<void> {
  const storage = await createCategoryStorage();
  const allCategories = await storage.getAll();

  if (allCategories.length === 0) {
    console.log(colors.warning(`No categories found in storage.`));
    console.log(colors.metadata(`Create a category using "pti category create" first.`));
    process.exit(1);
  }

  let categoryName = specifiedName;

  if (!categoryName) {
    const answers = await promptsLib(
      [
        {
          type: 'select',
          name: 'selectedName',
          message: 'Select a category to edit:',
          choices: allCategories.map(cat => ({
            title: cat.name,
            value: cat.name,
          })),
        },
      ],
      {
        onCancel: () => {
          console.log('\nOperation cancelled.');
          process.exit(0);
        },
      }
    );

    categoryName = answers.selectedName;
  }

  const category = await storage.get(categoryName!);

  if (!category) {
    throw new LoadError(`Category '${categoryName}' not found`);
  }

  let finalName = categoryName!;
  let finalDescription: string | undefined = category.description;

  if (newName !== undefined || newDescription !== undefined) {
    if (newName !== undefined) {
      const trimmedName = newName.trim();

      if (categoryName!.toLowerCase() === 'default') {
        throw new SaveError('The "Default" category cannot be renamed');
      }

      if (!trimmedName) {
        throw new SaveError('New category name cannot be empty.');
      }
      if (trimmedName.length < 3) {
        throw new SaveError('New category name must be at least 3 characters.');
      }

      const existingCategory = await storage.get(trimmedName);
      if (existingCategory && existingCategory.name !== categoryName!) {
        throw new SaveError(`Category '${trimmedName}' already exists`);
      }

      finalName = trimmedName;
    }

    if (newDescription !== undefined) {
      const trimmedDesc = newDescription.trim();
      if (trimmedDesc && trimmedDesc.length < 10) {
        throw new SaveError('Description must be at least 10 characters.');
      }
      finalDescription = trimmedDesc || undefined;
    }
  } else {
    const answers = await promptsLib(
      [
        {
          type: 'multiselect',
          name: 'properties',
          message: 'Select properties to edit:',
          choices: [
            { title: 'Name', value: 'name' },
            { title: 'Description', value: 'description' },
          ],
          instructions: `(Press ${colors.instruction('<space>')} to select, ${colors.instruction('<a>')} to toggle all and ${colors.instruction('<enter>')} to proceed)`,
        },
      ],
      {
        onCancel: () => {
          console.log('\nOperation cancelled.');
          process.exit(0);
        },
      }
    );

    const selectedProperties = answers.properties;

    if (selectedProperties.length === 0) {
      console.log(colors.warning('No properties selected. Nothing to edit.'));
      process.exit(0);
    }

    if (selectedProperties.includes('name')) {
      if (categoryName!.toLowerCase() === 'default') {
        throw new SaveError('The "Default" category cannot be renamed');
      }

      const nameAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'newName',
          message: 'New name:',
          default: categoryName!,
          validate: (input: string) => {
            const trimmed = input.trim();
            if (!trimmed) {
              return 'Name is required.';
            }
            if (trimmed.length < 3) {
              return 'Category name must be at least 3 characters.';
            }
            return true;
          },
        },
      ]);

      const trimmedName = nameAnswers.newName.trim();
      const existingCategory = await storage.get(trimmedName);
      if (existingCategory && existingCategory.name !== categoryName!) {
        throw new SaveError(`Category '${trimmedName}' already exists`);
      }

      finalName = trimmedName;
    }

    if (selectedProperties.includes('description')) {
      const descAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'description',
          message: 'New description (leave empty to keep current):',
          default: category.description || '',
          validate: (input: string) => {
            const trimmed = input.trim();
            if (trimmed && trimmed.length < 10) {
              return 'Description must be at least 10 characters.';
            }
            return true;
          },
        },
      ]);

      const trimmedDesc = descAnswers.description.trim();
      finalDescription = trimmedDesc || undefined;
    }
  }

  const updatedCategory: Category = {
    ...category,
    name: finalName,
    description: finalDescription,
    updatedAt: new Date().toISOString(),
  };

  await storage.save(updatedCategory);

  if (finalName !== categoryName!) {
    await storage.delete(categoryName!);

    const promptStorage = await createStorage();
    const allPrompts = await promptStorage.getAll();
    const promptsToUpdate = allPrompts.filter(p => p.categories?.includes(categoryName!));

    for (const prompt of promptsToUpdate) {
      const updatedCategories = prompt.categories!.map(c => (c === categoryName! ? finalName : c));
      const updatedPrompt = {
        ...prompt,
        categories: [...new Set(updatedCategories)],
        updatedAt: new Date().toISOString(),
      };
      await promptStorage.save(updatedPrompt);
    }
  }

  console.log(colors.success(`Category '${finalName}' updated successfully`));
}

export async function handleDeleteCategory(name: string): Promise<void> {
  const categoryStorage = await createCategoryStorage();
  const category = await categoryStorage.get(name);

  if (!category) {
    throw new LoadError(`Category '${name}' not found`);
  }

  // Count prompts that use this category
  const promptStorage = await createStorage();
  const allPrompts = await promptStorage.getAll();
  const affectedPrompts = allPrompts.filter(prompt => prompt.categories?.includes(name));
  const promptCount = affectedPrompts.length;

  // If no prompts are affected, just delete the category
  if (promptCount === 0) {
    await categoryStorage.delete(name);
    console.log(colors.success(`Category '${name}' deleted successfully`));
    return;
  }

  // Present options for handling affected prompts
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: `Category '${name}' is used by ${promptCount} prompt(s). What would you like to do?`,
      choices: [
        {
          name: `Delete category and all ${promptCount} prompt(s)`,
          value: 'delete_all',
        },
        {
          name: `Delete category but move ${promptCount} prompt(s) to Default category`,
          value: 'move_to_default',
        },
        {
          name: 'Cancel',
          value: 'cancel',
        },
      ],
    },
  ]);

  if (answers.action === 'cancel') {
    console.log(colors.metadata('Operation cancelled'));
    return;
  }

  if (answers.action === 'delete_all') {
    // Delete affected prompts
    for (const prompt of affectedPrompts) {
      await promptStorage.delete(prompt.name!);
    }

    // Delete the category
    await categoryStorage.delete(name);

    console.log(
      colors.success(
        `Category '${name}' and ${promptCount} associated prompt(s) deleted successfully`
      )
    );
  } else if (answers.action === 'move_to_default') {
    // Ensure Default category exists
    let defaultCategory = await categoryStorage.get('Default');
    if (!defaultCategory) {
      defaultCategory = {
        name: 'Default',
        description: 'Default category for prompts',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await categoryStorage.save(defaultCategory);
    }

    // Update affected prompts to use Default category instead
    for (const prompt of affectedPrompts) {
      const updatedCategories = (prompt.categories || [])
        .filter(cat => cat !== name) // Remove the category being deleted
        .concat('Default'); // Add Default category

      const updatedPrompt = {
        ...prompt,
        categories: [...new Set(updatedCategories)], // Remove duplicates
        updatedAt: new Date().toISOString(),
      };

      await promptStorage.save(updatedPrompt);
    }

    // Delete the category
    await categoryStorage.delete(name);

    console.log(
      colors.success(
        `Category '${name}' deleted. ${promptCount} prompt(s) moved to Default category.`
      )
    );
  }
}

export async function handleGetCategory(name: string): Promise<void> {
  const storage = await createCategoryStorage();
  const category = await storage.get(name);

  if (!category) {
    throw new LoadError(`Category '${name}' not found`);
  }

  console.log(`${colors.dataKey('Name:')} ${colors.dataValue(category.name)}`);
  if (category.description) {
    console.log(`${colors.dataKey('Description:')} ${colors.dataValue(category.description)}`);
  }
  console.log(`${colors.dataKey('Created:')} ${colors.dataValue(formatDate(category.createdAt))}`);
  console.log(`${colors.dataKey('Updated:')} ${colors.dataValue(formatDate(category.updatedAt))}`);
}

export async function handleListCategories(): Promise<void> {
  const categoryStorage = await createCategoryStorage();
  const promptStorage = await createStorage();

  const categories = await categoryStorage.getAll();
  const prompts = await promptStorage.getAll();

  if (categories.length === 0) {
    console.log(colors.warning('No categories found'));
    return;
  }

  // Sort categories alphabetically by name
  categories.sort((a, b) => a.name.localeCompare(b.name));

  // Count prompts per category
  const categoryCounts: { [key: string]: number } = {};
  prompts.forEach(prompt => {
    if (prompt.categories) {
      prompt.categories.forEach(categoryName => {
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      });
    }
  });

  const tableData = categories.map(category => ({
    name: category.name,
    description: category.description || '',
    prompts: String(categoryCounts[category.name] ?? 0),
    created: formatDate(category.createdAt),
    updated: formatDate(category.updatedAt),
  }));

  const columns: TableColumn[] = [
    { key: 'name', header: 'Name', width: 20 },
    { key: 'description', header: 'Description', width: 30 },
    { key: 'prompts', header: 'Prompts', width: 8 },
    { key: 'created', header: 'Created', width: 12 },
    { key: 'updated', header: 'Updated', width: 12 },
  ];

  console.log();
  console.log(formatTable({ columns, data: tableData }));
}

export async function handleSearchCategories(keyword: string): Promise<void> {
  const storage = await createCategoryStorage();
  const allCategories = await storage.getAll();

  // Simple fuzzy search implementation
  const fuzzyMatch = (text: string, search: string): boolean => {
    const textLower = text.toLowerCase();
    const searchLower = search.toLowerCase();

    // Exact match
    if (textLower.includes(searchLower)) return true;

    // Fuzzy match - check if all characters of search appear in order in text
    let searchIndex = 0;
    for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
      if (textLower[i] === searchLower[searchIndex]) {
        searchIndex++;
      }
    }
    return searchIndex === searchLower.length;
  };

  const matchedCategories = allCategories.filter(
    category =>
      fuzzyMatch(category.name, keyword) ||
      (category.description && fuzzyMatch(category.description, keyword))
  );

  if (matchedCategories.length === 0) {
    console.log(colors.warning(`No categories found matching "${keyword}"`));
    return;
  }

  console.log(
    colors.info(`Found ${matchedCategories.length} category(ies) matching "${keyword}":\n`)
  );

  const tableData = matchedCategories.map(category => ({
    name: category.name,
    description: category.description || '',
    created: formatDate(category.createdAt),
  }));

  const columns: TableColumn[] = [
    { key: 'name', header: 'Name', width: 20 },
    { key: 'description', header: 'Description', width: 40 },
    { key: 'created', header: 'Created', width: 12 },
  ];

  console.log(formatTable({ columns, data: tableData }));
}
