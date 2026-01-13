import { FileCategoryStorage } from '../../src/storage/global';
import { Category } from '../../src/types';
import * as fs from 'fs/promises';

jest.mock('fs/promises');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('FileCategoryStorage', () => {
  let storage: FileCategoryStorage;
  const testDataDir = '/tmp/test-data';

  beforeEach(() => {
    storage = new FileCategoryStorage(testDataDir);
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a new category', async () => {
      const category: Category = {
        name: 'test-category',
        description: 'Test description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockedFs.access.mockRejectedValue(new Error('File not found'));
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.readFile.mockResolvedValue(JSON.stringify({ categories: [] }));
      mockedFs.writeFile.mockResolvedValue(undefined);

      await storage.save(category);

      expect(mockedFs.writeFile).toHaveBeenCalled();
    });

    it('should update an existing category', async () => {
      const existingCategory: Category = {
        name: 'test-category',
        description: 'Old description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const updatedCategory: Category = {
        ...existingCategory,
        description: 'New description',
        updatedAt: new Date().toISOString(),
      };

      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.readFile.mockResolvedValue(JSON.stringify({ categories: [existingCategory] }));
      mockedFs.writeFile.mockResolvedValue(undefined);

      await storage.save(updatedCategory);

      expect(mockedFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return null for non-existent category', async () => {
      mockedFs.access.mockRejectedValue(new Error('File not found'));

      const result = await storage.get('nonexistent');

      expect(result).toBeNull();
    });

    it('should return category by name', async () => {
      const category: Category = {
        name: 'test-category',
        description: 'Test description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.readFile.mockResolvedValue(JSON.stringify({ categories: [category] }));

      const result = await storage.get('test-category');

      expect(result).toEqual(category);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no categories exist', async () => {
      mockedFs.access.mockRejectedValue(new Error('File not found'));

      const result = await storage.getAll();

      expect(result).toEqual([]);
    });

    it('should return all categories sorted by name', async () => {
      const categories: Category[] = [
        {
          name: 'zebra',
          description: 'Zebra category',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'apple',
          description: 'Apple category',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.readFile.mockResolvedValue(JSON.stringify({ categories }));

      const result = await storage.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('apple');
      expect(result[1].name).toBe('zebra');
    });
  });

  describe('delete', () => {
    it('should delete category by name', async () => {
      const categories: Category[] = [
        {
          name: 'test1',
          description: 'Test 1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: 'test2',
          description: 'Test 2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.readFile.mockResolvedValue(JSON.stringify({ categories }));
      mockedFs.writeFile.mockResolvedValue(undefined);

      await storage.delete('test1');

      expect(mockedFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    it('should return true for existing category', async () => {
      const category: Category = {
        name: 'test-category',
        description: 'Test description',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.readFile.mockResolvedValue(JSON.stringify({ categories: [category] }));

      const result = await storage.exists('test-category');

      expect(result).toBe(true);
    });

    it('should return false for non-existent category', async () => {
      mockedFs.access.mockRejectedValue(new Error('File not found'));

      const result = await storage.exists('nonexistent');

      expect(result).toBe(false);
    });
  });
});
