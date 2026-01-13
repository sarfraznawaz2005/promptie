import { handleStats } from '../../src/utils/stats-handler';

jest.mock('../../src/utils/colors', () => ({
  colors: {
    header: jest.fn(text => text),
    label: jest.fn(text => text),
    content: jest.fn(text => text),
    metadata: jest.fn(text => text),
    success: jest.fn(text => text),
    error: jest.fn(text => text),
    warning: jest.fn(text => text),
    prompt: jest.fn(text => text),
    selection: jest.fn(text => text),
    info: jest.fn(text => text),
  },
  formatDate: jest.fn(date => date),
}));

jest.mock('../../src/storage', () => ({
  createStorage: jest.fn(),
  createCategoryStorage: jest.fn(),
}));

jest.mock('../../src/config', () => ({
  localConfigExists: jest.fn(),
}));

const { createStorage, createCategoryStorage } = require('../../src/storage');
const { localConfigExists } = require('../../src/config');

describe('Stats Handler', () => {
  let mockGlobalStorage: {
    getAll: jest.Mock;
  };

  let mockGlobalCategories: {
    getAll: jest.Mock;
  };
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGlobalStorage = { getAll: jest.fn() };
    mockGlobalCategories = { getAll: jest.fn() };

    createStorage.mockReturnValue(mockGlobalStorage);
    createCategoryStorage.mockReturnValue(mockGlobalCategories);

    localConfigExists.mockReturnValue(false);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should display stats with no prompts or categories', async () => {
    mockGlobalStorage.getAll.mockResolvedValue([]);
    mockGlobalCategories.getAll.mockResolvedValue([]);

    await handleStats(false);

    expect(mockGlobalStorage.getAll).toHaveBeenCalled();
    expect(mockGlobalCategories.getAll).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should display stats with prompts and categories', async () => {
    const prompts = [
      {
        name: 'test1',
        content: 'Test content 1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        marker: 'TEST1',
        categories: ['Default', 'Test'],
      },
      {
        name: 'test2',
        content: 'Test content 2 longer text',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
        marker: 'TEST2',
        categories: ['Default'],
      },
    ];

    const categories = [
      {
        name: 'Default',
        description: 'Default category for prompts',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        name: 'Test',
        description: 'Test category',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    mockGlobalStorage.getAll.mockResolvedValue(prompts);
    mockGlobalCategories.getAll.mockResolvedValue(categories);

    await handleStats(false);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Total: 2'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Average length'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Default'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('2'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('1'));
  });

  it('should handle multiple prompts correctly', async () => {
    const prompts = [
      {
        name: 'prompt1',
        content: 'Content 1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        marker: 'PROMPT1',
        categories: ['Default'],
      },
      {
        name: 'prompt2',
        content: 'Content 2',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        marker: 'PROMPT2',
        categories: ['Default'],
      },
    ];

    mockGlobalStorage.getAll.mockResolvedValue(prompts);
    mockGlobalCategories.getAll.mockResolvedValue([]);

    await handleStats(false);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Total: 2'));
  });

  it('should output JSON when requested', async () => {
    const prompts = [
      {
        name: 'test',
        content: 'Test content',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        marker: 'TEST',
        categories: ['Default'],
      },
    ];

    mockGlobalStorage.getAll.mockResolvedValue(prompts);
    mockGlobalCategories.getAll.mockResolvedValue([]);

    await handleStats(true);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('"total": 1'));
  });
});
