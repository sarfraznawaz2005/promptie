import { handleSave } from '../../src/utils/save-handler';

// Mock chalk to avoid ES module issues and support chaining
jest.mock('chalk', () => {
  const createColorMock = () => {
    const colorFn = jest.fn(text => text) as any;
    colorFn.bold = jest.fn(text => text);
    return colorFn;
  };

  return {
    cyan: createColorMock(),
    yellow: createColorMock(),
    white: createColorMock(),
    gray: jest.fn(text => text),
    green: jest.fn(text => text),
    red: createColorMock(),
    hex: jest.fn(() => jest.fn(text => text)),
    rgb: jest.fn(() => jest.fn(text => text)),
  };
});

jest.mock('prompts', () => jest.fn());
jest.mock('../../src/storage', () => ({
  createStorage: jest.fn(),
  createCategoryStorage: jest.fn(),
}));
jest.mock('../../src/utils/editor-input', () => ({
  getMultilineInput: jest.fn().mockResolvedValue('test content'),
}));

const { createStorage, createCategoryStorage } = require('../../src/storage');
const promptsLib = require('prompts');

describe('Save Handler - Category Creation', () => {
  let mockStorage: {
    save: jest.Mock;
    get: jest.Mock;
    exists: jest.Mock;
  };
  let mockCategoryStorage: {
    save: jest.Mock;
    get: jest.Mock;
    getAll: jest.Mock;
    exists: jest.Mock;
  };
  let consoleSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    mockStorage = {
      save: jest.fn(),
      get: jest.fn(),
      exists: jest.fn(),
    };
    mockCategoryStorage = {
      save: jest.fn(),
      get: jest.fn(),
      getAll: jest.fn(),
      exists: jest.fn(),
    };
    createStorage.mockReturnValue(mockStorage);
    createCategoryStorage.mockReturnValue(mockCategoryStorage);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('should create Default category if it does not exist', async () => {
    // Mock the prompts for save flow
    promptsLib
      .mockResolvedValueOnce({ name: 'test-prompt' }) // prompt name
      .mockResolvedValueOnce({ newContent: 'test content' }) // content
      .mockResolvedValueOnce({ useCustomMarker: true }) // use default marker
      .mockResolvedValueOnce({ categories: ['Default'] }); // category selection

    mockStorage.get.mockResolvedValue(null); // new prompt
    mockCategoryStorage.exists.mockResolvedValue(false); // Default category doesn't exist
    mockCategoryStorage.getAll.mockResolvedValue([]); // no categories initially

    await handleSave({});

    // Should check if Default category exists
    expect(mockCategoryStorage.exists).toHaveBeenCalledWith('Default');

    // Should create Default category
    expect(mockCategoryStorage.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Default',
        description: 'Default category for prompts',
      })
    );

    // Should save the prompt
    expect(mockStorage.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test-prompt',
        content: 'test content',
        categories: ['Default'],
      })
    );
  });

  it('should not create Default category if it already exists', async () => {
    // Mock the prompts for save flow
    promptsLib
      .mockResolvedValueOnce({ name: 'test-prompt' }) // prompt name
      .mockResolvedValueOnce({ newContent: 'test content' }) // content
      .mockResolvedValueOnce({ useCustomMarker: true }) // use default marker
      .mockResolvedValueOnce({ categories: ['Default'] }); // category selection

    mockStorage.get.mockResolvedValue(null); // new prompt
    mockCategoryStorage.exists.mockResolvedValue(true); // Default category exists
    mockCategoryStorage.getAll.mockResolvedValue([
      {
        name: 'Default',
        description: 'Default category for prompts',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]);

    await handleSave({});

    // Should check if Default category exists
    expect(mockCategoryStorage.exists).toHaveBeenCalledWith('Default');

    // Should NOT create Default category again
    expect(mockCategoryStorage.save).not.toHaveBeenCalled();

    // Should save the prompt
    expect(mockStorage.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test-prompt',
        content: 'test content',
        categories: ['Default'],
      })
    );
  });
});
