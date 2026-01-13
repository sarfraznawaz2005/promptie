import { Prompt } from '../../src/types';
import { handleList } from '../../src/utils/list-handler';

jest.mock('../../src/storage', () => ({
  createStorage: jest.fn(),
}));

jest.mock('../../src/utils/colors', () => ({
  colors: {
    warning: jest.fn(text => text),
    metadata: jest.fn(text => text),
    header: jest.fn(text => text),
    label: jest.fn(text => text),
  },
  formatDate: jest.fn(date => date),
}));

jest.mock('../../src/utils/table', () => ({
  formatTable: jest.fn(() => 'mocked table'),
}));

jest.mock('../../src/utils/terminal', () => ({
  wrapText: jest.fn(text => text),
}));

const mockCreateStorage = require('../../src/storage').createStorage;
const { formatTable: mockFormatTable } = require('../../src/utils/table');

describe('List Handler', () => {
  let mockGetAll: jest.Mock;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGetAll = jest.fn();
    mockCreateStorage.mockReturnValue({
      getAll: mockGetAll,
    });
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
  });

  it('should show warning when no prompts found', async () => {
    mockGetAll.mockResolvedValue([]);

    await handleList();

    expect(mockCreateStorage).toHaveBeenCalledWith();
    expect(mockGetAll).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('No prompts found in storage.');
    expect(consoleSpy).toHaveBeenCalledWith('Use "pti create" to create your first prompt.');
  });

  it('should output JSON when json flag is true', async () => {
    const prompts: Prompt[] = [
      {
        name: 'test-prompt',
        content: 'Test content',
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 11:00:00',
        marker: 'TEST-PROMPT',
      },
    ];
    mockGetAll.mockResolvedValue(prompts);

    await handleList(false, true);

    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(prompts, null, 2));
  });

  it('should display table without interactive prompts', async () => {
    const prompts: Prompt[] = [
      {
        name: 'test-prompt',
        content: 'Test content',
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 11:00:00',
        marker: 'TEST-PROMPT',
      },
    ];
    mockGetAll.mockResolvedValue(prompts);

    await handleList();

    expect(mockCreateStorage).toHaveBeenCalledWith();
    expect(mockGetAll).toHaveBeenCalled();
    expect(mockFormatTable).toHaveBeenCalled();
  });

  it('should display full details when --full flag is used', async () => {
    const prompts: Prompt[] = [
      {
        name: 'test-prompt',
        content: 'Test content\nline 2',
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 11:00:00',
        marker: 'TEST-PROMPT',
      },
    ];
    mockGetAll.mockResolvedValue(prompts);

    await handleList(true);

    expect(consoleSpy).toHaveBeenCalledWith('');
    expect(consoleSpy).toHaveBeenCalledWith('Showing full details for all 1 prompt(s)');
    expect(consoleSpy).toHaveBeenCalledWith('\nName: test-prompt');
  });

  it('should filter by categories', async () => {
    const prompts: Prompt[] = [
      {
        name: 'prompt1',
        content: 'Content 1',
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 11:00:00',
        marker: 'PROMPT1',
        categories: ['AI'],
      },
      {
        name: 'prompt2',
        content: 'Content 2',
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 11:00:00',
        marker: 'PROMPT2',
        categories: ['Coding'],
      },
    ];
    mockGetAll.mockResolvedValue(prompts);

    await handleList(false, false, ['AI']);

    expect(mockGetAll).toHaveBeenCalled();
    expect(mockFormatTable).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([expect.objectContaining({ name: 'prompt1' })]),
      })
    );
  });
});
