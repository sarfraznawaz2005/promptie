import { Prompt } from '../../src/types';
import { handleClean } from '../../src/utils/clean-handler';

jest.mock('../../src/storage', () => ({
  createStorage: jest.fn(),
}));

jest.mock('../../src/utils/fs', () => ({
  fileExists: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  deleteFile: jest.fn(),
}));

jest.mock('../../src/utils/colors', () => ({
  colors: {
    warning: jest.fn(text => text),
    error: jest.fn(text => text),
    header: jest.fn(text => text),
    metadata: jest.fn(text => text),
    success: jest.fn(text => text),
  },
}));

jest.mock('../../src/utils/marker', () => ({
  getFormattedMarkerStart: jest.fn(marker => `<!-- ${marker}-RULES-START -->`),
  getFormattedMarkerEnd: jest.fn(marker => `<!-- ${marker}-RULES-END -->`),
}));

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

const mockCreateStorage = require('../../src/storage').createStorage;
const mockFileExists = require('../../src/utils/fs').fileExists;
const mockReadFile = require('../../src/utils/fs').readFile;
const mockWriteFile = require('../../src/utils/fs').writeFile;

describe('Clean Handler', () => {
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

    await handleClean();

    expect(mockCreateStorage).toHaveBeenCalledWith();
    expect(consoleSpy).toHaveBeenCalledWith('No prompts found in storage.');
  });

  it('should handle specific prompts', async () => {
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
    mockFileExists.mockResolvedValue(true);
    mockReadFile.mockResolvedValue(
      'Some file content with <!-- PROMPT1-RULES-START --> old content <!-- PROMPT1-RULES-END --> more content'
    );

    await handleClean(false, 'prompt1');

    expect(mockReadFile).toHaveBeenCalled();
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.any(String),
      'Some file content with\n\nmore content'
    );
  });

  it('should handle dry run mode', async () => {
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
    mockFileExists.mockResolvedValue(true);
    mockReadFile.mockResolvedValue('Content with marker');

    await handleClean(true, 'prompt1');

    expect(mockWriteFile).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('DRY RUN MODE - No changes will be made');
  });
});
