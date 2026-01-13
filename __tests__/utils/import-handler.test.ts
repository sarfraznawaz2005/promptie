import { handleImport } from '../../src/utils/import-handler';

jest.mock('../../src/utils/colors', () => ({
  colors: {
    error: jest.fn(text => text),
    warning: jest.fn(text => text),
    info: jest.fn(text => text),
    success: jest.fn(text => text),
    text: jest.fn(text => text),
  },
  formatDate: jest.fn(date => date),
}));

jest.mock('../../src/storage', () => ({
  createStorage: jest.fn(),
}));

jest.mock('../../src/utils/fs', () => ({
  readJsonFile: jest.fn(),
  fileExists: jest.fn(),
}));

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

const mockCreateStorage = require('../../src/storage').createStorage;
const mockReadJsonFile = require('../../src/utils/fs').readJsonFile;
const mockFileExists = require('../../src/utils/fs').fileExists;

describe('Import Handler', () => {
  let mockGet: jest.Mock;
  let mockSave: jest.Mock;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGet = jest.fn();
    mockSave = jest.fn();
    mockCreateStorage.mockReturnValue({
      get: mockGet,
      save: mockSave,
      getAll: jest.fn().mockResolvedValue([]),
    });
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
  });

  it('should import prompts successfully', async () => {
    const importData = {
      version: '1.0',
      prompts: [
        {
          name: 'new-prompt',
          content: 'New content',
          createdAt: '2024-01-01 10:00:00',
          updatedAt: '2024-01-01 11:00:00',
          marker: 'NEW-PROMPT',
        },
      ],
    };
    mockReadJsonFile.mockResolvedValue(importData);
    mockGet.mockResolvedValue(null);
    mockFileExists.mockResolvedValue(true);

    await handleImport('import.json');

    expect(mockReadJsonFile).toHaveBeenCalledWith('import.json');
    expect(mockSave).toHaveBeenCalledWith(importData.prompts[0]);
    expect(consoleSpy).toHaveBeenCalledWith('✓ Imported prompt: new-prompt');
  });
});
