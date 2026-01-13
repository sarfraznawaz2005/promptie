import promptsLib from 'prompts';
import { Prompt } from '../types';
import { createStorage, createCategoryStorage } from '../storage';
import { colors } from './colors';
import { getMultilineInput } from './editor-input';

export async function handleSave(
  options?: { force?: boolean },
  promptName?: string,
  promptContent?: string,
  contentFile?: string,
  customMarker?: string,
  categories?: string[]
): Promise<void> {
  const storage = await createStorage();

  // Read content from file if specified
  let fileContent = '';
  if (contentFile) {
    try {
      const fs = await import('fs/promises');
      fileContent = await fs.readFile(contentFile, 'utf-8');
    } catch (error) {
      console.log(colors.error(`Failed to read file "${contentFile}": ${error}`));
      process.exit(1);
    }
  }

  let promptNameToUse = promptName;
  const isNonInteractive = promptName && (promptContent || contentFile);

  // Validate prompt name in non-interactive mode
  if (promptName) {
    const trimmedName = promptName.trim();
    if (!trimmedName) {
      console.log(colors.error('Prompt name cannot be empty.'));
      process.exit(1);
    }
    if (trimmedName.length < 3) {
      console.log(colors.error('Prompt name must be at least 3 characters.'));
      process.exit(1);
    }
    if (trimmedName.length > 50) {
      console.log(colors.error('Prompt name cannot be longer than 50 characters.'));
      process.exit(1);
    }
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$/.test(trimmedName)) {
      console.log(
        colors.error(
          'Prompt name must start and end with a letter or number, and can only contain letters, numbers, hyphens, and underscores (no spaces or special characters).'
        )
      );
      process.exit(1);
    }
    // Check for reserved names that might conflict
    const reservedNames = [
      'con',
      'prn',
      'aux',
      'nul',
      'com1',
      'com2',
      'com3',
      'com4',
      'lpt1',
      'lpt2',
      'lpt3',
    ];
    if (reservedNames.includes(trimmedName.toLowerCase())) {
      console.log(colors.error('This name is reserved and cannot be used.'));
      process.exit(1);
    }
  }

  if (!promptName) {
    const answers = await promptsLib(
      [
        {
          type: 'text',
          name: 'name',
          message: 'Enter prompt name:',
          validate: (value: string) => {
            if (!value.trim()) {
              return 'Prompt name cannot be empty.';
            }
            if (value.length < 3) {
              return 'Prompt name must be at least 3 characters.';
            }
            if (value.length > 50) {
              return 'Prompt name cannot be longer than 50 characters.';
            }
            if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$/.test(value)) {
              return 'Prompt name must start and end with a letter or number, and can only contain letters, numbers, hyphens, and underscores (no spaces or special characters).';
            }
            // Check for reserved names that might conflict
            const reservedNames = [
              'con',
              'prn',
              'aux',
              'nul',
              'com1',
              'com2',
              'com3',
              'com4',
              'lpt1',
              'lpt2',
              'lpt3',
            ];
            if (reservedNames.includes(value.toLowerCase())) {
              return 'This name is reserved and cannot be used.';
            }
            return true;
          },
        },
      ],
      {
        onCancel: () => {
          console.log('\nOperation cancelled.');
          process.exit(0);
        },
      }
    );
    promptNameToUse = answers.name;
  }

  const existingPrompt = await storage.get(promptNameToUse!);

  if (existingPrompt && !options?.force) {
    // For new saves, prevent duplicates unless force option is used
    console.log(
      colors.error(`Prompt "${promptNameToUse}" already exists. Use 'pti edit' to modify it.`)
    );
    process.exit(1);
  }

  let content = '';
  let finalContent = '';

  if (isNonInteractive) {
    // Non-interactive mode: use provided content
    if (contentFile) {
      finalContent = fileContent;
    } else if (promptContent) {
      finalContent = promptContent;
    } else {
      console.log(colors.error('No content provided. Use --content or --file.'));
      process.exit(1);
    }
  } else {
    // Interactive mode
    if (existingPrompt) {
      console.log(colors.header('Current prompt content:'));
      console.log(colors.metadata('---'));
      console.log(existingPrompt.content);
      console.log(colors.metadata('---\n'));

      if (!options?.force) {
        const editResult = await promptsLib(
          [
            {
              type: 'confirm',
              name: 'edit',
              message: 'Do you want to edit this prompt?',
              initial: true,
            },
          ],
          {
            onCancel: () => {
              console.log('\nOperation cancelled.');
              process.exit(0);
            },
          }
        );

        const { edit } = editResult;

        if (!edit) {
          console.log(colors.success('Prompt unchanged.'));
          return;
        }
      }

      content = existingPrompt.content;
    }

    const newContent = await getMultilineInput(content, '.txt');

    if (!newContent.trim()) {
      console.log(colors.error('Prompt content cannot be empty.'));
      process.exit(1);
    }

    finalContent = newContent;
  }

  let marker = customMarker || promptNameToUse!.toUpperCase();

  if (customMarker && customMarker.trim().length < 5) {
    console.log(colors.error('Custom marker must be at least 5 characters.'));
    process.exit(1);
  }

  if (!isNonInteractive) {
    const confirmResult = await promptsLib(
      [
        {
          type: 'confirm',
          name: 'useCustomMarker',
          message: `Use default marker (${marker})?`,
          initial: true,
        },
      ],
      {
        onCancel: () => {
          console.log('\nOperation cancelled.');
          process.exit(0);
        },
      }
    );

    const { useCustomMarker } = confirmResult;

    if (!useCustomMarker) {
      const customAnswers = await promptsLib(
        [
          {
            type: 'text',
            name: 'customMarker',
            message: 'Enter custom marker (without -RULES-START/END):',
            initial: marker,
            validate: (value: string) => {
              if (!value.trim()) {
                return 'Marker cannot be empty.';
              }
              if (value.length < 5) {
                return 'Marker must be at least 5 characters.';
              }
              return true;
            },
          },
        ],
        {
          onCancel: () => {
            console.log('\nOperation cancelled.');
            process.exit(0);
          },
        }
      );
      marker = customAnswers.customMarker;
    }
  }

  // Category selection
  const categoryStorage = await createCategoryStorage();

  // Ensure "Default" category exists
  if (!(await categoryStorage.exists('Default'))) {
    await categoryStorage.save({
      name: 'Default',
      description: 'Default category for prompts',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  let selectedCategories: string[];

  if (categories && categories.length > 0) {
    // Categories provided via command line - parse comma-separated values
    selectedCategories = categories
      .flatMap(cat => cat.split(',').map(c => c.trim()))
      .filter(c => c.length > 0);

    // Ensure all specified categories exist in category storage
    for (const categoryName of selectedCategories) {
      if (!(await categoryStorage.exists(categoryName))) {
        await categoryStorage.save({
          name: categoryName,
          description: `Category for ${categoryName} prompts`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } else if (isNonInteractive) {
    // Non-interactive mode: default to "Default" category
    selectedCategories = ['Default'];
  } else {
    // Interactive mode: prompt for categories
    const availableCategories = await categoryStorage.getAll();
    const categoryChoices = availableCategories.map(cat => ({
      title: cat.name,
      value: cat.name,
      description: cat.description,
    }));

    const categoryAnswers = await promptsLib(
      [
        {
          type: 'multiselect',
          name: 'categories',
          message: 'Select categories for this prompt (use space to select, enter to confirm):',
          choices: categoryChoices,
          instructions: false,
        },
      ],
      {
        onCancel: () => {
          console.log('\nOperation cancelled.');
          process.exit(0);
        },
      }
    );

    selectedCategories = categoryAnswers.categories;
  }

  const now = new Date();
  const prompt: Prompt = {
    name: promptNameToUse!,
    content: finalContent,
    createdAt: existingPrompt?.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
    marker,
    categories: selectedCategories,
  };

  // Interactive confirmation step - only when we have a TTY
  if (!isNonInteractive && process.stdout.isTTY) {
    console.log('\n--- Review Your Prompt ---');
    console.log(`Name: ${prompt.name}`);
    console.log(`Marker: ${prompt.marker}`);
    console.log(`Categories: ${prompt.categories?.join(', ') || 'None'}`);
    console.log(
      `Content: ${prompt.content.substring(0, 100)}${prompt.content.length > 100 ? '...' : ''}`
    );

    const confirmResult = await promptsLib(
      [
        {
          type: 'select',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { title: 'Save prompt', value: 'save' },
            { title: 'Edit name', value: 'edit_name' },
            { title: 'Edit marker', value: 'edit_marker' },
            { title: 'Edit categories', value: 'edit_categories' },
            { title: 'Edit content', value: 'edit_content' },
            { title: 'Cancel', value: 'cancel' },
          ],
        },
      ],
      {
        onCancel: () => {
          console.log('\nOperation cancelled.');
          process.exit(0);
        },
      }
    );

    switch (confirmResult.action) {
      case 'save': {
        // Continue to save
        break;
      }
      case 'edit_name': {
        console.log(colors.warning('Please restart the create/edit process to change the name.'));
        process.exit(0);
        break; // This won't be reached, but satisfies ESLint
      }
      case 'edit_marker': {
        const newMarkerResult = await promptsLib(
          [
            {
              type: 'text',
              name: 'marker',
              message: 'Enter new marker (without -RULES-START/END):',
              initial: marker,
              validate: (value: string) => {
                if (!value.trim()) {
                  return 'Marker cannot be empty.';
                }
                if (value.length < 5) {
                  return 'Marker must be at least 5 characters.';
                }
                return true;
              },
            },
          ],
          {
            onCancel: () => {
              console.log('\nOperation cancelled.');
              process.exit(0);
            },
          }
        );
        marker = newMarkerResult.marker;
        prompt.marker = marker;
        break;
      }
      case 'edit_categories': {
        const availableCategories = await categoryStorage.getAll();
        const categoryChoices = availableCategories.map(cat => ({
          title: cat.name,
          value: cat.name,
          description: cat.description,
          selected: selectedCategories.includes(cat.name),
        }));

        const newCategoryResult = await promptsLib(
          [
            {
              type: 'multiselect',
              name: 'categories',
              message: 'Select categories for this prompt (use space to select, enter to confirm):',
              choices: categoryChoices,
              instructions: false,
            },
          ],
          {
            onCancel: () => {
              console.log('\nOperation cancelled.');
              process.exit(0);
            },
          }
        );
        selectedCategories = newCategoryResult.categories;
        prompt.categories = selectedCategories;
        break;
      }
      case 'edit_content': {
        const editedContent = await getMultilineInput(finalContent, '.txt');
        finalContent = editedContent;
        prompt.content = finalContent;
        break;
      }
      case 'cancel': {
        console.log(colors.metadata('Operation cancelled.'));
        return;
      }
    }
  }

  await storage.save(prompt);

  console.log(colors.success(`\nPrompt "${promptNameToUse}" saved.`));
}
