import promptsLib from 'prompts';
import { colors } from './colors';
import { createStorage, createCategoryStorage } from '../storage';

export async function handleEdit(
  specifiedPromptName?: string,
  content?: string,
  file?: string,
  name?: string,
  marker?: string,
  categories?: string[]
): Promise<void> {
  const storage = await createStorage();
  const allPrompts = await storage.getAll();

  if (allPrompts.length === 0) {
    console.log(colors.warning(`No prompts found in storage.`));
    console.log(colors.metadata(`Create a prompt using "pti create" first.`));
    process.exit(1);
  }

  let promptName = specifiedPromptName;

  // Check if specified prompt exists in non-interactive mode
  if (promptName) {
    const existingPrompt = await storage.get(promptName);
    if (!existingPrompt) {
      console.log(colors.error(`Prompt "${promptName}" not found in storage.`));
      console.log(colors.metadata(`Use "pti list" to see available prompts.`));
      process.exit(1);
    }
  }

  if (!promptName) {
    const answers = await promptsLib(
      [
        {
          type: 'select',
          name: 'selectedName',
          message: 'Select a prompt to edit:',
          choices: allPrompts.map(p => ({
            title: p.name,
            value: p.name,
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

    promptName = answers.selectedName;
  }

  const originalName = promptName;
  const hasFlags = content || file || name || marker || categories;

  if (hasFlags) {
    if (name && name !== promptName) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        console.log(colors.error('New prompt name cannot be empty.'));
        process.exit(1);
      }
      if (trimmedName.length < 3) {
        console.log(colors.error('New prompt name must be at least 3 characters.'));
        process.exit(1);
      }
      if (trimmedName.length > 50) {
        console.log(colors.error('New prompt name cannot be longer than 50 characters.'));
        process.exit(1);
      }
      if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$/.test(trimmedName)) {
        console.log(
          colors.error(
            'New prompt name must start and end with a letter or number, and can only contain letters, numbers, hyphens, and underscores (no spaces or special characters).'
          )
        );
        process.exit(1);
      }

      const existingPrompt = await storage.get(trimmedName);
      if (existingPrompt && existingPrompt.name !== promptName) {
        console.log(colors.error(`A prompt with name "${trimmedName}" already exists.`));
        process.exit(1);
      }

      promptName = trimmedName;
    }

    if (marker && marker.length < 5) {
      console.log(colors.error('Custom marker must be at least 5 characters.'));
      process.exit(1);
    }

    let finalCategories: string[] | undefined;
    if (categories) {
      // Parse comma-separated category values
      const parsedCategories = categories
        .flatMap(cat => cat.split(',').map(c => c.trim()))
        .filter(c => c.length > 0);
      const categoryStorage = await createCategoryStorage();
      for (const categoryName of parsedCategories) {
        if (!(await categoryStorage.exists(categoryName))) {
          await categoryStorage.save({
            name: categoryName,
            description: `Category for ${categoryName} prompts`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
      finalCategories = parsedCategories;
    }

    let finalContent: string | undefined;
    if (content) {
      finalContent = content;
    } else if (file) {
      try {
        const fs = await import('fs/promises');
        finalContent = await fs.readFile(file, 'utf-8');
      } catch (error) {
        console.log(colors.error(`Failed to read file "${file}": ${error}`));
        process.exit(1);
      }
    }

    const existingPrompt = await storage.get(promptName!);

    if (!existingPrompt) {
      console.log(colors.error(`Prompt "${promptName}" not found in storage.`));
      process.exit(1);
    }

    const updatedPrompt = {
      ...existingPrompt,
      name: promptName!,
      ...(finalContent !== undefined && { content: finalContent }),
      ...(marker !== undefined && { marker }),
      ...(finalCategories !== undefined && { categories: finalCategories }),
      updatedAt: new Date().toISOString(),
    };

    await storage.save(updatedPrompt);
    if (originalName !== promptName) {
      await storage.delete(originalName!);
    }
    console.log(colors.success(`Prompt "${promptName}" updated successfully.`));
  } else {
    const existingPrompt = await storage.get(promptName!);
    if (!existingPrompt) {
      console.log(colors.error(`Prompt "${promptName}" not found in storage.`));
      process.exit(1);
    }

    console.log(colors.header(`Editing prompt: ${promptName}`));
    console.log();

    const propertyAnswers = await promptsLib(
      [
        {
          type: 'multiselect',
          name: 'properties',
          message: 'Select properties to edit:',
          choices: [
            { title: 'Name', value: 'name' },
            { title: 'Content', value: 'content' },
            { title: 'Marker', value: 'marker' },
            { title: 'Categories', value: 'categories' },
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

    const selectedProperties = propertyAnswers.properties;

    if (selectedProperties.length === 0) {
      console.log(colors.warning('No properties selected. Nothing to edit.'));
      process.exit(0);
    }

    let newName = promptName;
    let newMarker = existingPrompt.marker;
    let newCategories = existingPrompt.categories;
    let newContent: string | undefined;

    // Prompt for each selected property
    for (const prop of selectedProperties) {
      switch (prop) {
        case 'name': {
          const nameAnswer = await promptsLib(
            [
              {
                type: 'text',
                name: 'newName',
                message: 'New name:',
                initial: promptName,
                validate: (value: string) => {
                  const trimmed = value.trim();
                  if (!trimmed) {
                    return 'Name cannot be empty.';
                  }
                  if (trimmed.length < 3) {
                    return 'Name must be at least 3 characters.';
                  }
                  if (trimmed.length > 50) {
                    return 'Name cannot be longer than 50 characters.';
                  }
                  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$/.test(trimmed)) {
                    return 'Name must start and end with a letter or number, and can only contain letters, numbers, hyphens, and underscores (no spaces or special characters).';
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

          newName = nameAnswer.newName;

          const existingName = await storage.get(newName!);
          if (existingName && existingName.name !== promptName!) {
            console.log(colors.error(`A prompt with name "${newName}" already exists.`));
            process.exit(1);
          }

          break;
        }
        case 'marker': {
          const markerAnswer = await promptsLib(
            [
              {
                type: 'text',
                name: 'newMarker',
                message: 'New marker:',
                initial: existingPrompt.marker,
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

          newMarker = markerAnswer.newMarker;
          break;
        }
        case 'categories': {
          const categoryStorage = await createCategoryStorage();
          const availableCategories = await categoryStorage.getAll();

          const categoryChoices = availableCategories.map(cat => ({
            title: cat.name,
            value: cat.name,
            description: cat.description,
            selected: existingPrompt.categories?.includes(cat.name) || false,
          }));

          const categoryAnswer = await promptsLib(
            [
              {
                type: 'multiselect',
                name: 'categories',
                message: 'Select categories (use space to select, enter to confirm):',
                choices: categoryChoices,
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

          newCategories = categoryAnswer.categories;
          break;
        }
        case 'content': {
          console.log(colors.header('Current content:'));
          console.log(colors.metadata('---'));
          console.log(existingPrompt.content);
          console.log(colors.metadata('---\n'));

          const { getMultilineInput } = await import('./editor-input');
          const editedContent = await getMultilineInput(existingPrompt.content, '.txt');

          if (!editedContent.trim()) {
            console.log(colors.error('Prompt content cannot be empty.'));
            process.exit(1);
          }

          newContent = editedContent;
          break;
        }
      }
    }

    // Update the existing prompt with only the changed fields
    const originalPrompt = await storage.get(promptName!);
    if (!originalPrompt) {
      console.log(colors.error(`Prompt "${promptName}" not found in storage.`));
      process.exit(1);
    }

    const finalContent = selectedProperties.includes('content') ? newContent : undefined;

    const updatedPrompt = {
      ...originalPrompt,
      name: newName!,
      ...(newMarker !== originalPrompt.marker && { marker: newMarker }),
      ...(newCategories !== undefined && { categories: newCategories }),
      ...(finalContent !== undefined && { content: finalContent }),
      updatedAt: new Date().toISOString(),
    };

    await storage.save(updatedPrompt);

    // If the name changed, delete the old prompt
    if (newName !== originalName) {
      await storage.delete(originalName!);
    }

    console.log(colors.success(`Prompt "${newName}" updated successfully.`));
  }
}
