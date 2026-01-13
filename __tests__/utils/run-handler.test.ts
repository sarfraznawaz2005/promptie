import { Prompt } from '../../src/types';
import { handleRun } from '../../src/utils/run-handler';

jest.mock('../../src/storage', () => ({
  createStorage: jest.fn(),
}));

jest.mock('../../src/utils/colors', () => ({
  colors: {
    error: jest.fn(text => text),
    metadata: jest.fn(text => text),
  },
}));

jest.mock('../../src/utils/placeholder', () => ({
  parsePlaceholders: jest.fn(() => []),
  substitutePlaceholders: jest.fn(content => content),
}));

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

const mockCreateStorage = require('../../src/storage').createStorage;
const mockParsePlaceholders = require('../../src/utils/placeholder').parsePlaceholders;
const mockSubstitutePlaceholders = require('../../src/utils/placeholder').substitutePlaceholders;

describe('Run Handler', () => {
  let mockGet: jest.Mock;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGet = jest.fn();
    mockCreateStorage.mockReturnValue({
      get: mockGet,
      getAll: jest.fn(),
    });
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
  });

  it('should run prompt and output content', async () => {
    const prompt: Prompt = {
      name: 'test-prompt',
      content: 'Hello {{name}}!',
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-01 11:00:00',
      marker: 'TEST-PROMPT',
    };
    mockGet.mockResolvedValue(prompt);
    mockParsePlaceholders.mockReturnValue(['name']);
    mockSubstitutePlaceholders.mockReturnValue('Hello World!');

    await handleRun('test-prompt', ['name=World']);

    expect(mockGet).toHaveBeenCalledWith('test-prompt');
    expect(mockSubstitutePlaceholders).toHaveBeenCalledWith('Hello {{name}}!', { name: 'World' });
    expect(consoleSpy).toHaveBeenCalledWith('Hello World!');
  });
});
