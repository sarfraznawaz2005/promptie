import { handleSearch } from '../../src/utils/search-handler';
import { Prompt } from '../../src/types';

jest.mock('../../src/utils/colors', () => ({
  colors: {
    warning: jest.fn(text => text),
    metadata: jest.fn(text => text),
    info: jest.fn(text => text),
  },
  formatDate: jest.fn(date => date),
}));

jest.mock('../../src/storage', () => ({
  createStorage: jest.fn(() => ({
    getAll: jest.fn(),
  })),
}));

const { createStorage } = require('../../src/storage');

describe('Search Handler', () => {
  let consoleSpy: jest.SpyInstance;
  let mockGetAll: jest.Mock;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockGetAll = jest.fn();
    createStorage.mockReturnValue({ getAll: mockGetAll });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should search prompts and display results', async () => {
    const prompts: Prompt[] = [
      {
        name: 'react-component',
        content: 'Create a React component with TypeScript',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
        marker: 'REACT-COMPONENT',
      },
      {
        name: 'node-api',
        content: 'Build a REST API with Node.js and Express',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
        marker: 'NODE-API',
      },
    ];
    mockGetAll.mockResolvedValue(prompts);

    await handleSearch('react');

    expect(mockGetAll).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    const calls = consoleSpy.mock.calls;
    const logMessages = calls.flat().join('\n');
    expect(logMessages).toContain('react');
  });

  it('should display message when no prompts found', async () => {
    mockGetAll.mockResolvedValue([]);

    await handleSearch('test');

    expect(consoleSpy).toHaveBeenCalled();
    const calls = consoleSpy.mock.calls;
    const logMessages = calls.flat().join('\n');
    expect(logMessages).toContain('No prompts found');
  });

  it('should handle fuzzy matching', async () => {
    const prompts: Prompt[] = [
      {
        name: 'react-component',
        content: 'React component guidelines',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
        marker: 'REACT-COMPONENT',
      },
    ];
    mockGetAll.mockResolvedValue(prompts);

    await handleSearch('component');

    expect(consoleSpy).toHaveBeenCalled();
    const calls = consoleSpy.mock.calls;
    const logMessages = calls.flat().join('\n');
    expect(logMessages).toContain('react-component');
  });

  it('should search with categories filter', async () => {
    const prompts: Prompt[] = [
      {
        name: 'python-script',
        content: 'Write a Python script for data processing',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
        marker: 'PYTHON-SCRIPT',
        categories: ['Python', 'Scripting'],
      },
    ];
    mockGetAll.mockResolvedValue(prompts);

    await handleSearch('python', ['Python']);

    expect(consoleSpy).toHaveBeenCalled();
  });
});
