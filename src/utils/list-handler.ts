import { createStorage } from '../storage';
import { colors, formatDate } from './colors';
import { formatTable, TableColumn } from './table';

export async function handleList(
  full?: boolean,
  json?: boolean,
  categories?: string[],
  sortBy?: string,
  sortOrder?: string
): Promise<void> {
  const storage = await createStorage();
  let prompts = await storage.getAll();

  // Filter by categories if specified
  if (categories && categories.length > 0) {
    prompts = prompts.filter(
      prompt => prompt.categories && prompt.categories.some(cat => categories.includes(cat))
    );
  }

  // Sort prompts
  if (sortBy === 'date') {
    prompts.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  } else {
    // Default sort by name
    prompts.sort((a, b) => {
      return sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    });
  }

  if (prompts.length === 0) {
    console.log(colors.warning(`No prompts found in storage.`));
    console.log(colors.metadata(`Use "pti create" to create your first prompt.`));
    return;
  }

  if (json) {
    console.log(JSON.stringify(prompts, null, 2));
    return;
  }

  console.log(colors.header(`${prompts.length} prompt(s) found`));

  // Use the enhanced table formatter with responsive columns
  const tableData = prompts.map(prompt => {
    return {
      name: prompt.name,
      created: formatDate(prompt.createdAt),
      marker: prompt.marker,
      categories: prompt.categories?.join(', ') || 'None',
    };
  });

  const columns: TableColumn[] = [
    { key: 'name', header: 'Name', minWidth: 12, maxWidth: 20, priority: 1 },
    { key: 'created', header: 'Created', minWidth: 10, maxWidth: 16, priority: 1 },
    { key: 'marker', header: 'Marker', minWidth: 8, maxWidth: 100, priority: 1 },
    { key: 'categories', header: 'Categories', minWidth: 8, maxWidth: 100, priority: 1 },
  ];

  console.log();
  console.log(formatTable({ columns, data: tableData }));

  // If --full is specified, show all prompts in full detail without prompting
  if (full) {
    console.log('');
    console.log(colors.header(`Showing full details for all ${prompts.length} prompt(s)`));
    for (const prompt of prompts) {
      console.log(colors.label(`\nName: ${prompt.name}`));
      console.log(colors.metadata('---'));
      console.log(prompt.content);
      console.log(colors.metadata('---'));
      console.log(colors.metadata(`Created: ${formatDate(prompt.createdAt)}`));
      console.log(colors.metadata(`Updated: ${formatDate(prompt.updatedAt)}`));
      console.log(colors.metadata(`Marker: ${prompt.marker}`));
      console.log(colors.metadata(`Categories: ${prompt.categories?.join(', ') || 'None'}`));
    }
    return;
  }
}
