import { Prompt, PromptStorage, Category, CategoryStorage } from '../types';
import { fileExists, readJsonFile, writeJsonFile, ensureDir, deleteFile } from '../utils/fs';
import * as path from 'path';

interface PromptsData {
  prompts: Prompt[];
}

interface CategoriesData {
  categories: Category[];
}

export class FilePromptStorage implements PromptStorage {
  private filePath: string;

  constructor(dataLocation: string) {
    this.filePath = path.join(dataLocation, 'promptie.json');
  }

  async save(prompt: Prompt): Promise<void> {
    await ensureDir(path.dirname(this.filePath));

    const data = await this.load();
    const existingIndex = data.prompts.findIndex(p => p.name === prompt.name);

    if (existingIndex >= 0) {
      data.prompts[existingIndex] = prompt;
    } else {
      data.prompts.push(prompt);
    }

    await writeJsonFile(this.filePath, data);
  }

  async get(name: string): Promise<Prompt | null> {
    const data = await this.load();
    return data.prompts.find(p => p.name === name) || null;
  }

  async getAll(): Promise<Prompt[]> {
    const data = await this.load();
    return data.prompts.sort((a, b) => a.name.localeCompare(b.name));
  }

  async delete(name: string): Promise<void> {
    const data = await this.load();
    data.prompts = data.prompts.filter(p => p.name !== name);
    await writeJsonFile(this.filePath, data);
  }

  async deleteAll(): Promise<void> {
    if (await fileExists(this.filePath)) {
      await deleteFile(this.filePath);
    }
  }

  async exists(name: string): Promise<boolean> {
    const data = await this.load();
    return data.prompts.some(p => p.name === name);
  }

  private async load(): Promise<PromptsData> {
    const exists = await fileExists(this.filePath);
    if (!exists) {
      return { prompts: [] };
    }

    const data = await readJsonFile<PromptsData>(this.filePath);
    return data || { prompts: [] };
  }
}

export class FileCategoryStorage implements CategoryStorage {
  private filePath: string;

  constructor(dataLocation: string) {
    this.filePath = path.join(dataLocation, 'promptie_categories.json');
  }

  async save(category: Category): Promise<void> {
    await ensureDir(path.dirname(this.filePath));

    const data = await this.load();
    const existingIndex = data.categories.findIndex(c => c.name === category.name);

    if (existingIndex >= 0) {
      data.categories[existingIndex] = category;
    } else {
      data.categories.push(category);
    }

    await writeJsonFile(this.filePath, data);
  }

  async get(name: string): Promise<Category | null> {
    const data = await this.load();
    return data.categories.find(c => c.name === name) || null;
  }

  async getAll(): Promise<Category[]> {
    const data = await this.load();
    return data.categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  async delete(name: string): Promise<void> {
    const data = await this.load();
    data.categories = data.categories.filter(c => c.name !== name);
    await writeJsonFile(this.filePath, data);
  }

  async exists(name: string): Promise<boolean> {
    const data = await this.load();
    return data.categories.some(c => c.name === name);
  }

  private async load(): Promise<CategoriesData> {
    const exists = await fileExists(this.filePath);
    if (!exists) {
      return { categories: [] };
    }

    const data = await readJsonFile<CategoriesData>(this.filePath);
    return data || { categories: [] };
  }
}
