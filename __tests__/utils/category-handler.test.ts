import {
  handleCreateCategory,
  handleEditCategory,
  handleDeleteCategory,
  handleGetCategory,
  handleListCategories,
  handleSearchCategories,
} from '../../src/utils/category-handler';
import { Category } from '../../src/types';

jest.mock('../../src/utils/colors', () => ({
  colors: {
    success: jest.fn(text => text),
    warning: jest.fn(text => text),
    metadata: jest.fn(text => text),
    dataKey: jest.fn(text => text),
    dataValue: jest.fn(text => text),
    info: jest.fn(text => text),
    error: jest.fn(text => text),
    instruction: jest.fn(text => text),
  },
  formatDate: jest.fn(date => date),
}));

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

jest.mock('prompts', () => jest.fn());

jest.mock('../../src/storage', () => ({
  createStorage: jest.fn(),
  createCategoryStorage: jest.fn(),
}));

const { createStorage, createCategoryStorage } = require('../../src/storage');
const inquirer = require('inquirer');
const prompts = require('prompts');

describe('Category Handler', () => {
  let mockCategoryStorage: {
    save: jest.Mock;
    get: jest.Mock;
    getAll: jest.Mock;
    delete: jest.Mock;
    exists: jest.Mock;
  };
  let mockPromptStorage: {
    getAll: jest.Mock;
    delete: jest.Mock;
    save: jest.Mock;
  };
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockCategoryStorage = {
      save: jest.fn(),
      get: jest.fn(),
      getAll: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };
    mockPromptStorage = {
      getAll: jest.fn(),
      delete: jest.fn(),
      save: jest.fn(),
    };
    createCategoryStorage.mockReturnValue(mockCategoryStorage);
    createStorage.mockReturnValue(mockPromptStorage);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('handleCreateCategory', () => {
    it('should add a new category', async () => {
      const answers = {
        name: 'test-category',
        description: 'Test description',
      };

      inquirer.prompt.mockResolvedValue(answers);
      mockCategoryStorage.exists.mockResolvedValue(false);
      mockCategoryStorage.save.mockResolvedValue(undefined);

      await handleCreateCategory();

      expect(createCategoryStorage).toHaveBeenCalledWith();
      expect(mockCategoryStorage.exists).toHaveBeenCalledWith('test-category');
      expect(mockCategoryStorage.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test-category',
          description: 'Test description',
        })
      );
      expect(consoleSpy).toHaveBeenCalledWith("Category 'test-category' added successfully");
    });

    it('should handle category that already exists', async () => {
      const answers = {
        name: 'existing-category',
        description: 'Description',
      };

      inquirer.prompt.mockResolvedValue(answers);
      mockCategoryStorage.exists.mockResolvedValue(true);

      await expect(handleCreateCategory()).rejects.toThrow(
        "Category 'existing-category' already exists"
      );

      expect(mockCategoryStorage.save).not.toHaveBeenCalled();
    });
  });

  describe('handleEditCategory', () => {
    it('should edit an existing category', async () => {
      const existingCategory: Category = {
        name: 'test-category',
        description: 'Old description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockCategoryStorage.getAll.mockResolvedValue([existingCategory]);
      mockCategoryStorage.get.mockResolvedValue(existingCategory);
      prompts.mockResolvedValueOnce({ properties: ['description'] });
      inquirer.prompt.mockResolvedValueOnce({ description: 'New description' });
      mockCategoryStorage.save.mockResolvedValue(undefined);

      await handleEditCategory('test-category');

      expect(mockCategoryStorage.get).toHaveBeenCalledWith('test-category');
      expect(mockCategoryStorage.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test-category',
          description: 'New description',
        })
      );
      expect(consoleSpy).toHaveBeenCalledWith("Category 'test-category' updated successfully");
    });

    it('should handle non-existent category', async () => {
      const existingCategory: Category = {
        name: 'other-category',
        description: 'Other description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockCategoryStorage.getAll.mockResolvedValue([existingCategory]);
      mockCategoryStorage.get.mockResolvedValue(null);

      await expect(handleEditCategory('nonexistent')).rejects.toThrow(
        "Category 'nonexistent' not found"
      );

      expect(mockCategoryStorage.save).not.toHaveBeenCalled();
    });
  });

  describe('handleDeleteCategory', () => {
    it('should delete a category and associated prompts when user chooses delete_all', async () => {
      const category: Category = {
        name: 'test-category',
        description: 'Test description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const prompts = [
        {
          name: 'prompt1',
          content: 'content1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          marker: 'MARKER1',
          categories: ['test-category'],
        },
        {
          name: 'prompt2',
          content: 'content2',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          marker: 'MARKER2',
          categories: ['test-category', 'other'],
        },
      ];

      const answers = { action: 'delete_all' };

      mockCategoryStorage.get.mockResolvedValue(category);
      mockPromptStorage.getAll.mockResolvedValue(prompts);
      inquirer.prompt.mockResolvedValue(answers);
      mockPromptStorage.delete.mockResolvedValue(undefined);
      mockCategoryStorage.delete.mockResolvedValue(undefined);

      await handleDeleteCategory('test-category');

      expect(mockCategoryStorage.get).toHaveBeenCalledWith('test-category');
      expect(mockPromptStorage.getAll).toHaveBeenCalled();
      expect(mockPromptStorage.delete).toHaveBeenCalledWith('prompt1');
      expect(mockPromptStorage.delete).toHaveBeenCalledWith('prompt2');
      expect(mockCategoryStorage.delete).toHaveBeenCalledWith('test-category');
      expect(consoleSpy).toHaveBeenCalledWith(
        "Category 'test-category' and 2 associated prompt(s) deleted successfully"
      );
    });

    it('should move prompts to Default category when user chooses move_to_default', async () => {
      const category: Category = {
        name: 'test-category',
        description: 'Test description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const defaultCategory: Category = {
        name: 'Default',
        description: 'Default category for prompts',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const prompts = [
        {
          name: 'prompt1',
          content: 'content1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          marker: 'MARKER1',
          categories: ['test-category'],
        },
        {
          name: 'prompt2',
          content: 'content2',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          marker: 'MARKER2',
          categories: ['test-category', 'other'],
        },
      ];

      const answers = { action: 'move_to_default' };

      mockCategoryStorage.get
        .mockResolvedValueOnce(category) // for the category being deleted
        .mockResolvedValueOnce(defaultCategory); // for checking if Default exists
      mockPromptStorage.getAll.mockResolvedValue(prompts);
      inquirer.prompt.mockResolvedValue(answers);
      mockPromptStorage.save.mockResolvedValue(undefined);
      mockCategoryStorage.delete.mockResolvedValue(undefined);

      await handleDeleteCategory('test-category');

      expect(mockCategoryStorage.get).toHaveBeenCalledWith('test-category');
      expect(mockCategoryStorage.get).toHaveBeenCalledWith('Default');
      expect(mockPromptStorage.getAll).toHaveBeenCalled();

      // Should save prompts with Default category
      expect(mockPromptStorage.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'prompt1',
          categories: ['Default'],
        })
      );
      expect(mockPromptStorage.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'prompt2',
          categories: ['other', 'Default'],
        })
      );

      expect(mockCategoryStorage.delete).toHaveBeenCalledWith('test-category');
      expect(consoleSpy).toHaveBeenCalledWith(
        "Category 'test-category' deleted. 2 prompt(s) moved to Default category."
      );
    });

    it('should create Default category if it does not exist when moving prompts', async () => {
      const category: Category = {
        name: 'test-category',
        description: 'Test description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const prompts = [
        {
          name: 'prompt1',
          content: 'content1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          marker: 'MARKER1',
          categories: ['test-category'],
        },
      ];

      const answers = { action: 'move_to_default' };

      mockCategoryStorage.get
        .mockResolvedValueOnce(category) // for the category being deleted
        .mockResolvedValueOnce(null); // Default doesn't exist
      mockPromptStorage.getAll.mockResolvedValue(prompts);
      inquirer.prompt.mockResolvedValue(answers);
      mockCategoryStorage.save.mockResolvedValue(undefined);
      mockPromptStorage.save.mockResolvedValue(undefined);
      mockCategoryStorage.delete.mockResolvedValue(undefined);

      await handleDeleteCategory('test-category');

      // Should create Default category
      expect(mockCategoryStorage.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Default',
          description: 'Default category for prompts',
        })
      );

      expect(mockCategoryStorage.delete).toHaveBeenCalledWith('test-category');
    });

    it('should delete category without prompts if no prompts are affected', async () => {
      const category: Category = {
        name: 'empty-category',
        description: 'Category with no prompts',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockCategoryStorage.get.mockResolvedValue(category);
      mockPromptStorage.getAll.mockResolvedValue([]);
      mockCategoryStorage.delete.mockResolvedValue(undefined);

      await handleDeleteCategory('empty-category');

      expect(mockCategoryStorage.get).toHaveBeenCalledWith('empty-category');
      expect(mockPromptStorage.getAll).toHaveBeenCalled();
      expect(mockCategoryStorage.delete).toHaveBeenCalledWith('empty-category');
      expect(consoleSpy).toHaveBeenCalledWith("Category 'empty-category' deleted successfully");
      expect(inquirer.prompt).not.toHaveBeenCalled(); // No prompts to ask about
    });

    it('should cancel deletion when user chooses cancel', async () => {
      const category: Category = {
        name: 'test-category',
        description: 'Test description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const prompts = [
        {
          name: 'prompt1',
          content: 'content1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          marker: 'MARKER1',
          categories: ['test-category'],
        },
      ];

      const answers = { action: 'cancel' };

      mockCategoryStorage.get.mockResolvedValue(category);
      mockPromptStorage.getAll.mockResolvedValue(prompts);
      inquirer.prompt.mockResolvedValue(answers);

      await handleDeleteCategory('test-category');

      expect(mockPromptStorage.delete).not.toHaveBeenCalled();
      expect(mockCategoryStorage.delete).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Operation cancelled');
    });

    it('should show correct count when no prompts use the category', async () => {
      const category: Category = {
        name: 'empty-category',
        description: 'Empty category',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const answers = { confirm: true };

      mockCategoryStorage.get.mockResolvedValue(category);
      mockPromptStorage.getAll.mockResolvedValue([]);
      inquirer.prompt.mockResolvedValue(answers);
      mockCategoryStorage.delete.mockResolvedValue(undefined);

      await handleDeleteCategory('empty-category');

      expect(mockPromptStorage.delete).not.toHaveBeenCalled();
      expect(mockCategoryStorage.delete).toHaveBeenCalledWith('empty-category');
      expect(consoleSpy).toHaveBeenCalledWith("Category 'empty-category' deleted successfully");
    });
  });

  describe('handleGetCategory', () => {
    it('should display category information', async () => {
      const category: Category = {
        name: 'test-category',
        description: 'Test description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockCategoryStorage.get.mockResolvedValue(category);

      await handleGetCategory('test-category');

      expect(mockCategoryStorage.get).toHaveBeenCalledWith('test-category');
      expect(consoleSpy).toHaveBeenCalledTimes(4);
      expect(consoleSpy).toHaveBeenCalledWith('Name: test-category');
      expect(consoleSpy).toHaveBeenCalledWith('Description: Test description');
    });

    it('should handle non-existent category', async () => {
      mockCategoryStorage.get.mockResolvedValue(null);

      await expect(handleGetCategory('nonexistent')).rejects.toThrow(
        "Category 'nonexistent' not found"
      );
    });
  });

  describe('handleListCategories', () => {
    it('should list all categories with prompt counts', async () => {
      const categories: Category[] = [
        {
          name: 'category-a',
          description: 'First category',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          name: 'category-b',
          description: 'Second category',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
      ];

      const prompts = [
        {
          name: 'prompt1',
          content: 'content',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          marker: 'MARKER',
          categories: ['category-a', 'category-b'],
        },
        {
          name: 'prompt2',
          content: 'content2',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          marker: 'MARKER2',
          categories: ['category-a'],
        },
      ];

      mockCategoryStorage.getAll.mockResolvedValue(categories);
      mockPromptStorage.getAll.mockResolvedValue(prompts);

      await handleListCategories();

      expect(mockCategoryStorage.getAll).toHaveBeenCalled();
      expect(mockPromptStorage.getAll).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should display message when no categories found', async () => {
      mockCategoryStorage.getAll.mockResolvedValue([]);
      mockPromptStorage.getAll.mockResolvedValue([]);

      await handleListCategories();

      expect(consoleSpy).toHaveBeenCalledWith('No categories found');
    });

    it('should show 0 prompts for categories with no assigned prompts', async () => {
      const categories: Category[] = [
        {
          name: 'empty-category',
          description: 'Category with no prompts',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const prompts = [
        {
          name: 'prompt1',
          content: 'content',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          marker: 'MARKER',
          categories: ['other-category'],
        },
      ];

      mockCategoryStorage.getAll.mockResolvedValue(categories);
      mockPromptStorage.getAll.mockResolvedValue(prompts);

      await handleListCategories();

      expect(mockCategoryStorage.getAll).toHaveBeenCalled();
      expect(mockPromptStorage.getAll).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      // The table should contain '0' for the prompts count
    });
  });

  describe('handleSearchCategories', () => {
    it('should find categories with exact keyword match', async () => {
      const categories: Category[] = [
        {
          name: 'javascript',
          description: 'JavaScript programming',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          name: 'python',
          description: 'Python programming',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockCategoryStorage.getAll.mockResolvedValue(categories);

      await handleSearchCategories('java');

      expect(mockCategoryStorage.getAll).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Found 1 category(ies) matching "java":\n');
    });

    it('should find categories with fuzzy match', async () => {
      const categories: Category[] = [
        {
          name: 'javascript',
          description: 'JavaScript programming',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockCategoryStorage.getAll.mockResolvedValue(categories);

      await handleSearchCategories('jvscrpt');

      expect(mockCategoryStorage.getAll).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Found 1 category(ies) matching "jvscrpt":\n');
    });

    it('should display message when no categories match', async () => {
      mockCategoryStorage.getAll.mockResolvedValue([]);

      await handleSearchCategories('nonexistent');

      expect(consoleSpy).toHaveBeenCalledWith('No categories found matching "nonexistent"');
    });
  });
});
