import { Prompt } from '../../src/types';
import { handleExport } from '../../src/utils/export-handler';

jest.mock('../../src/utils/colors', () => ({
  colors: {
    warning: jest.fn(text => text),
    success: jest.fn(text => text),
  },
}));

jest.mock('../../src/storage', () => ({
  createStorage: jest.fn(),
}));

jest.mock('../../src/utils/fs', () => ({
  writeJsonFile: jest.fn(),
}));

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

const mockCreateStorage = require('../../src/storage').createStorage;
const mockWriteJsonFile = require('../../src/utils/fs').writeJsonFile;

describe('Export Handler', () => {
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

  it('should export prompts to file', async () => {
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

    await handleExport('export.json');

    expect(mockCreateStorage).toHaveBeenCalledWith();
    expect(mockGetAll).toHaveBeenCalled();
    expect(mockWriteJsonFile).toHaveBeenCalledWith(
      'export.json',
      expect.objectContaining({
        version: '1.0',
        prompts: prompts,
      })
    );
    expect(consoleSpy).toHaveBeenCalledWith('\n✓ Exported 1 prompt(s) to export.json');
  });
});
