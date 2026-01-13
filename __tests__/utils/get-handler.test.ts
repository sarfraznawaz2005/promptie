import { handleGet } from '../../src/utils/get-handler';
import { Prompt } from '../../src/types';

jest.mock('../../src/utils/colors', () => ({
  colors: {
    label: jest.fn(text => text),
    error: jest.fn(text => text),
    metadata: jest.fn(text => text),
  },
}));

jest.mock('../../src/storage', () => ({
  createStorage: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

const { createStorage } = require('../../src/storage');

describe('Info Handler', () => {
  let consoleSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;
  let mockGet: jest.Mock;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    mockGet = jest.fn();
    createStorage.mockReturnValue({ get: mockGet });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    exitSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should display prompt information successfully', async () => {
    const prompt: Prompt = {
      name: 'test-prompt',
      content: 'Test prompt content',
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-01 11:00:00',
      marker: 'TEST-PROMPT',
    };
    mockGet.mockResolvedValue(prompt);

    await handleGet('test-prompt', true);

    expect(mockGet).toHaveBeenCalledWith('test-prompt');
    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(prompt, null, 2));
  });

  it('should handle prompt not found', async () => {
    mockGet.mockResolvedValue(null);

    await handleGet('nonexistent');

    expect(mockGet).toHaveBeenCalledWith('nonexistent');
    expect(consoleSpy).toHaveBeenCalledWith('Prompt "nonexistent" not found in storage.');
  });

  it('should display prompt content when not in all mode', async () => {
    const prompt: Prompt = {
      name: 'content-prompt',
      content: 'Display content',
      createdAt: '2024-01-01 12:00:00',
      updatedAt: '2024-01-01 13:00:00',
      marker: 'CONTENT-PROMPT',
    };
    mockGet.mockResolvedValue(prompt);

    await handleGet('content-prompt');

    expect(consoleSpy).toHaveBeenCalledWith('Display content');
  });
});
