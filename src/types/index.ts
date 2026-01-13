export interface Prompt {
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  marker: string;
  categories?: string[];
}

export interface AgentFile {
  pattern: string;
  description: string;
}

export interface Category {
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptStorage {
  save(prompt: Prompt): Promise<void>;
  get(name: string): Promise<Prompt | null>;
  getAll(): Promise<Prompt[]>;
  delete(name: string): Promise<void>;
  deleteAll(): Promise<void>;
  exists(name: string): Promise<boolean>;
}

export interface CategoryStorage {
  save(category: Category): Promise<void>;
  get(name: string): Promise<Category | null>;
  getAll(): Promise<Category[]>;
  delete(name: string): Promise<void>;
  exists(name: string): Promise<boolean>;
}

export interface AppConfig {
  dataLocation: string; // Path to directory where promptie.json and promptie_categories.json are stored
  version: string; // Config version for future migrations
}
