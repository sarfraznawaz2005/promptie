import { handleEdit } from '../../src/utils/edit-handler';
import { Prompt } from '../../src/types';

// Mock chalk to avoid ES module issues and support chaining
jest.mock('chalk', () => {
  const createColorMock = () => {
    const colorFn = jest.fn(text => text) as any;
    colorFn.bold = jest.fn(text => text);
    return colorFn;
  };

  return {
    yellow: createColorMock(),
    white: createColorMock(),
    gray: jest.fn(text => text),
    green: jest.fn(text => text),
    hex: jest.fn(() => jest.fn(text => text)),
    rgb: jest.fn(() => jest.fn(text => text)),
  };
});

jest.mock('prompts', () => jest.fn());

jest.mock('../../src/storage', () => ({
  createStorage: jest.fn(() => ({
    getAll: jest.fn(),
    get: jest.fn(),
    save: jest.fn(),
  })),
  createCategoryStorage: jest.fn(() => ({
    getAll: jest.fn(),
    get: jest.fn(),
    exists: jest.fn(),
    save: jest.fn(),
  })),
}));

jest.mock('../../src/utils/colors', () => ({
  colors: {
    error: jest.fn(text => text),
    warning: jest.fn(text => text),
    success: jest.fn(text => text),
    header: jest.fn(text => text),
    metadata: jest.fn(text => text),
    instruction: jest.fn(text => text),
  },
}));

const { createStorage } = require('../../src/storage');
const saveHandler = require('../../src/utils/save-handler');
const mockHandleSave = jest.fn();
saveHandler.handleSave = mockHandleSave;
const promptsLib = require('prompts');

describe('Edit Handler', () => {
  let consoleSpy: jest.SpyInstance;
  let mockGetAll: jest.Mock;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    mockGetAll = jest.fn();
    const mockGet = jest.fn();
    createStorage.mockReturnValue({ getAll: mockGetAll, get: mockGet });
    mockHandleSave.mockResolvedValue(undefined);
    promptsLib.mockResolvedValue({});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should list prompts and allow selection for editing', async () => {
    const prompts: Prompt[] = [
      {
        name: 'test-prompt',
        content: 'Test content',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
        marker: 'TEST-PROMPT',
      },
    ];
    const mockSave = jest.fn();
    const mockGetForEdit = jest.fn().mockResolvedValue(prompts[0]);
    createStorage.mockReturnValue({ getAll: mockGetAll, get: mockGetForEdit, save: mockSave });
    mockGetAll.mockResolvedValue(prompts);
    promptsLib.mockResolvedValueOnce({ selectedName: 'test-prompt' });
    promptsLib.mockResolvedValueOnce({ properties: ['content'] });

    // Mock the editor input
    const mockGetMultilineInput = jest.fn().mockResolvedValue('Updated content');
    jest.doMock('../../src/utils/editor-input', () => ({
      getMultilineInput: mockGetMultilineInput,
    }));

    await handleEdit();

    expect(mockGetAll).toHaveBeenCalled();
    expect(promptsLib).toHaveBeenCalledTimes(2);
    expect(mockSave).toHaveBeenCalledWith({
      ...prompts[0],
      content: 'Updated content',
      updatedAt: expect.any(String),
    });
  });

  it('should display message when no prompts found', async () => {
    mockGetAll.mockResolvedValue([]);

    await expect(handleEdit()).rejects.toThrow('process.exit called');

    expect(consoleSpy).toHaveBeenCalled();
    const calls = consoleSpy.mock.calls;
    const logMessages = calls.flat().join('\n');
    expect(logMessages).toContain('No prompts found in storage');
    expect(logMessages).toContain('Create a prompt using "pti create" first');
  });

  it('should work with direct prompt name', async () => {
    const prompts: Prompt[] = [
      {
        name: 'direct-prompt',
        content: 'Direct content',
        createdAt: '2024-01-01 00:00:00',
        updatedAt: '2024-01-01 00:00:00',
        marker: 'DIRECT-PROMPT',
      },
    ];
    const mockSave = jest.fn();
    mockGetAll.mockResolvedValue(prompts);
    const mockGetForDirect = jest.fn().mockResolvedValue(prompts[0]);
    createStorage.mockReturnValue({ getAll: mockGetAll, get: mockGetForDirect, save: mockSave });

    await handleEdit('direct-prompt', undefined, undefined, undefined, undefined, ['Default']);

    expect(mockGetForDirect).toHaveBeenCalledWith('direct-prompt');
    expect(mockSave).toHaveBeenCalledWith({
      ...prompts[0],
      categories: ['Default'],
      updatedAt: expect.any(String),
    });
  });
});
