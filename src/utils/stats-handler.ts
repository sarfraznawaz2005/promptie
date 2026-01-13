import { createStorage, createCategoryStorage } from '../storage';

import { colors, formatDate } from './colors';
import { formatTable, TableColumn } from './table';

interface StatsData {
  prompts: {
    total: number;
    averageLength: number;
    oldest?: {
      name: string;
      createdAt: string;
    };
    newest?: {
      name: string;
      updatedAt: string;
    };
  };
  categories: {
    total: number;
    usage: Array<{
      name: string;
      count: number;
      description?: string;
    }>;
  };
}

export async function handleStats(
  json?: boolean,
  categoryFilter?: string,
  recentDays?: number
): Promise<void> {
  const globalStorage = await createStorage();
  const globalCategories = await createCategoryStorage();

  const stats: StatsData = {
    prompts: {
      total: 0,
      averageLength: 0,
    },
    categories: {
      total: 0,
      usage: [],
    },
  };

  // Get prompts
  const prompts = await globalStorage.getAll();
  let allPrompts = prompts;

  if (categoryFilter) {
    allPrompts = allPrompts.filter(
      prompt => prompt.categories && prompt.categories.includes(categoryFilter)
    );
  }

  if (recentDays && recentDays > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - recentDays);
    allPrompts = allPrompts.filter(
      prompt => new Date(prompt.updatedAt) >= cutoffDate || new Date(prompt.createdAt) >= cutoffDate
    );
  }
  stats.prompts.total = allPrompts.length;

  // Calculate average length
  if (allPrompts.length > 0) {
    const totalLength = allPrompts.reduce((sum, prompt) => sum + prompt.content.length, 0);
    stats.prompts.averageLength = Math.round(totalLength / allPrompts.length);
  }

  // Find oldest and newest prompts
  if (allPrompts.length > 0) {
    const sortedByCreated = allPrompts.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const sortedByUpdated = allPrompts.sort(
      (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );

    stats.prompts.oldest = {
      name: sortedByCreated[0].name,
      createdAt: sortedByCreated[0].createdAt,
    };
    stats.prompts.newest = {
      name: sortedByUpdated[sortedByUpdated.length - 1].name,
      updatedAt: sortedByUpdated[sortedByUpdated.length - 1].updatedAt,
    };
  }

  // Get categories
  const globalCats = await globalCategories.getAll();
  stats.categories.total = globalCats.length;

  // Calculate category usage
  const categoryUsage: { [key: string]: { count: number; description?: string } } = {};

  allPrompts.forEach(prompt => {
    if (prompt.categories) {
      prompt.categories.forEach((catName: string) => {
        if (!categoryUsage[catName]) {
          categoryUsage[catName] = { count: 0 };
        }
        categoryUsage[catName].count++;
      });
    }
  });

  // Add descriptions from categories
  globalCats.forEach(cat => {
    if (categoryUsage[cat.name]) {
      categoryUsage[cat.name].description = cat.description;
    }
  });

  stats.categories.usage = Object.entries(categoryUsage)
    .map(([name, data]) => ({
      name,
      count: data.count,
      description: data.description,
    }))
    .sort((a, b) => b.count - a.count);

  // Output
  if (json) {
    console.log(JSON.stringify(stats, null, 2));
    return;
  }

  // Human-readable output
  console.log(colors.header('📊 Promptie Statistics\n'));

  // Prompts section
  console.log(colors.label('Prompts:'));
  console.log(`  Total: ${colors.content(stats.prompts.total.toString())}`);

  if (stats.prompts.total > 0) {
    console.log(`  Average length: ${colors.content(stats.prompts.averageLength + ' chars')}`);

    if (stats.prompts.oldest) {
      console.log(
        `  Oldest: ${colors.content(stats.prompts.oldest.name)} (${formatDate(stats.prompts.oldest.createdAt)})`
      );
    }

    if (stats.prompts.newest) {
      console.log(
        `  Newest: ${colors.content(stats.prompts.newest.name)} (${formatDate(stats.prompts.newest.updatedAt)})`
      );
    }
  }
  console.log();

  // Categories section
  console.log(colors.label('Categories:'));
  console.log(`  Total: ${colors.content(stats.categories.total.toString())}`);

  if (stats.categories.usage.length > 0) {
    console.log('\n  Usage by category:');

    const tableData = stats.categories.usage.slice(0, 5).map(cat => ({
      category: cat.name,
      prompts: cat.count.toString(),
      description: cat.description || '',
    }));

    const columns: TableColumn[] = [
      { key: 'category', header: 'Category', width: 20 },
      { key: 'prompts', header: 'Prompts', width: 8 },
      { key: 'description', header: 'Description', width: 30 },
    ];

    console.log(formatTable({ columns, data: tableData }));

    if (stats.categories.usage.length > 5) {
      console.log(`    ... and ${stats.categories.usage.length - 5} more`);
    }
  }
  console.log();
}
