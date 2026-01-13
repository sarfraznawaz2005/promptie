import { FilePromptStorage } from '../../src/storage/global';
import { Prompt } from '../../src/types';
import * as fs from 'fs/promises';

jest.mock('fs/promises');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('FilePromptStorage', () => {
  let storage: FilePromptStorage;
  const testDataDir = '/tmp/test-data';

  beforeEach(() => {
    storage = new FilePromptStorage(testDataDir);
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a new prompt', async () => {
      const prompt: Prompt = {
        name: 'test',
        content: 'test content',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
        marker: 'TEST',
        categories: ['test-category'],
      };

      mockedFs.access.mockRejectedValue(new Error('File not found'));
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.readFile.mockResolvedValue(JSON.stringify({ prompts: [] }));
      mockedFs.writeFile.mockResolvedValue(undefined);

      await storage.save(prompt);

      expect(mockedFs.writeFile).toHaveBeenCalled();
    });

    it('should update an existing prompt', async () => {
      const existingPrompt: Prompt = {
        name: 'test-prompt',
        content: 'Test content',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        marker: 'TEST-PROMPT',
      };

      const updatedPrompt: Prompt = {
        ...existingPrompt,
        content: 'new content',
        updatedAt: new Date().toISOString(),
      };

      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.readFile.mockResolvedValue(JSON.stringify({ prompts: [existingPrompt] }));
      mockedFs.writeFile.mockResolvedValue(undefined);

      await storage.save(updatedPrompt);

      expect(mockedFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return null for non-existent prompt', async () => {
      mockedFs.access.mockRejectedValue(new Error('File not found'));

      const result = await storage.get('nonexistent');

      expect(result).toBeNull();
    });

    it('should return prompt by name', async () => {
      const prompt: Prompt = {
        name: 'test',
        content: 'test content',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
        marker: 'TEST',
      };

      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.readFile.mockResolvedValue(JSON.stringify({ prompts: [prompt] }));

      const result = await storage.get('test');

      expect(result).toEqual(prompt);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no prompts exist', async () => {
      mockedFs.access.mockRejectedValue(new Error('File not found'));

      const result = await storage.getAll();

      expect(result).toEqual([]);
    });

    it('should return all prompts sorted by name', async () => {
      const prompts: Prompt[] = [
        {
          name: 'zebra',
          content: 'Zebra content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          marker: 'ZEBRA',
        },
        {
          name: 'apple',
          content: 'Apple content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          marker: 'APPLE',
        },
        {
          name: 'apple',
          content: 'content 1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          marker: 'APPLE',
        },
      ];

      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.readFile.mockResolvedValue(JSON.stringify({ prompts }));

      const result = await storage.getAll();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('apple');
      expect(result[1].name).toBe('apple');
      expect(result[2].name).toBe('zebra');
      // Verify marker is preserved
      expect(result[0].marker).toBe('APPLE');
    });
  });

  describe('delete', () => {
    it('should delete prompt by name', async () => {
      const prompts: Prompt[] = [
        {
          name: 'test1',
          content: 'Test 1 content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          marker: 'TEST1',
        },
        {
          name: 'test2',
          content: 'Test 2 content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          marker: 'TEST2',
        },
        {
          name: 'test2',
          content: 'content 2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          marker: 'TEST2',
        },
      ];

      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.readFile.mockResolvedValue(JSON.stringify({ prompts }));
      mockedFs.writeFile.mockResolvedValue(undefined);

      await storage.delete('test1');

      expect(mockedFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    it('should return true for existing prompt', async () => {
      const prompt: Prompt = {
        name: 'test',
        content: 'test content',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
        marker: 'TEST',
      };

      mockedFs.access.mockResolvedValue(undefined);
      mockedFs.readFile.mockResolvedValue(JSON.stringify({ prompts: [prompt] }));

      const result = await storage.exists('test');

      expect(result).toBe(true);
    });

    it('should return false for non-existent prompt', async () => {
      mockedFs.access.mockRejectedValue(new Error('File not found'));

      const result = await storage.exists('nonexistent');

      expect(result).toBe(false);
    });
  });
});
