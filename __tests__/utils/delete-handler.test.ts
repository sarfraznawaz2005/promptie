import { Prompt } from '../../src/types';
import { handleDelete } from '../../src/utils/delete-handler';

jest.mock('../../src/storage', () => ({
  createStorage: jest.fn(),
}));

jest.mock('../../src/utils/colors', () => ({
  colors: {
    warning: jest.fn(text => text),
    error: jest.fn(text => text),
    success: jest.fn(text => text),
  },
}));

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

const mockCreateStorage = require('../../src/storage').createStorage;
const mockPrompt = require('inquirer').prompt;

describe('Delete Handler', () => {
  let mockGetAll: jest.Mock;
  let mockDelete: jest.Mock;
  let mockDeleteAll: jest.Mock;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGetAll = jest.fn();
    mockDelete = jest.fn();
    mockDeleteAll = jest.fn();
    mockCreateStorage.mockReturnValue({
      getAll: mockGetAll,
      delete: mockDelete,
      deleteAll: mockDeleteAll,
    });
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
  });

  it('should show warning when no prompts found', async () => {
    mockGetAll.mockResolvedValue([]);

    await handleDelete();

    expect(consoleSpy).toHaveBeenCalledWith('No prompts found in storage.');
  });

  it('should delete all prompts with confirmation', async () => {
    const prompts: Prompt[] = [
      {
        name: 'prompt1',
        content: 'Content 1',
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 11:00:00',
        marker: 'PROMPT1',
      },
    ];
    mockGetAll.mockResolvedValue(prompts);
    mockPrompt.mockResolvedValue({ confirm: true });

    await handleDelete(true);

    expect(mockDelete).toHaveBeenCalledWith('prompt1');
    expect(consoleSpy).toHaveBeenCalledWith('Deleted all 1 prompts from storage.');
  });

  it('should delete specific prompts', async () => {
    const prompts: Prompt[] = [
      {
        name: 'prompt1',
        content: 'Content 1',
        createdAt: '2024-01-01 10:00:00',
        updatedAt: '2024-01-01 11:00:00',
        marker: 'PROMPT1',
      },
    ];
    mockGetAll.mockResolvedValue(prompts);

    await handleDelete(false, false, 'prompt1');

    expect(mockDelete).toHaveBeenCalledWith('prompt1');
    expect(consoleSpy).toHaveBeenCalledWith('Deleted prompt "prompt1" from storage.');
  });
});
