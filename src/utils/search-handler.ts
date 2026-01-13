import Fuse from 'fuse.js';
import { colors, formatDate } from './colors';
import { createStorage } from '../storage';
import { formatTable, TableColumn } from './table';
import { wrapText } from './terminal';

export async function handleSearch(query: string, categories?: string[]): Promise<void> {
  const storage = await createStorage();
  let prompts = await storage.getAll();

  // Filter by categories if specified
  if (categories && categories.length > 0) {
    prompts = prompts.filter(
      prompt => prompt.categories && prompt.categories.some(cat => categories.includes(cat))
    );
  }

  if (prompts.length === 0) {
    console.log(colors.warning(`No prompts found in storage.`));
    console.log(colors.metadata(`Use "pti create" to create your first prompt.`));
    return;
  }

  const fuse = new Fuse(prompts, {
    keys: ['name', 'content'],
    threshold: 0.4,
    includeScore: true,
  });

  const results = fuse.search(query);

  if (results.length === 0) {
    console.log(colors.warning(`No prompts found matching "${query}".`));
    return;
  }

  console.log(colors.info(`\nFound ${results.length} prompt(s) matching "${query}":\n`));

  const tableData = results.map(result => {
    const prompt = result.item;
    const score = result.score !== undefined ? Math.round((1 - result.score) * 100) : 0;
    const lines = prompt.content.split('\n').slice(0, 2);
    const preview = lines.join(' ').substring(0, 50);
    return {
      name: wrapText(prompt.name, 20),
      relevance: `${score}%`,
      created: formatDate(prompt.createdAt),
      preview: preview + (prompt.content.length > 50 || lines.length > 2 ? '...' : ''),
    };
  });

  const columns: TableColumn[] = [
    { key: 'name', header: 'Name', minWidth: 15, maxWidth: 25, priority: 1 },
    { key: 'relevance', header: 'Relevance', minWidth: 8, maxWidth: 12, priority: 1 },
    { key: 'created', header: 'Created', minWidth: 10, maxWidth: 16, priority: 1 },
    { key: 'preview', header: 'Preview', minWidth: 30, maxWidth: 60, priority: 2 },
  ];

  console.log(formatTable({ columns, data: tableData }));
}
