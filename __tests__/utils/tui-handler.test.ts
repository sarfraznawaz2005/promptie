jest.mock('neo-neo-blessed', () => ({
  screen: jest.fn(() => ({
    append: jest.fn(),
    render: jest.fn(),
    destroy: jest.fn(),
    key: jest.fn(),
    focused: null,
  })),
  list: jest.fn(() => ({
    setItems: jest.fn(),
    setLabel: jest.fn(),
    select: jest.fn(),
    focus: jest.fn(),
    on: jest.fn(),
    key: jest.fn(),
    selected: 0,
    style: { border: { fg: 'white' } },
  })),
  scrollabletext: jest.fn(() => ({
    setContent: jest.fn(),
    scrollTo: jest.fn(),
    focus: jest.fn(),
    on: jest.fn(),
    key: jest.fn(),
    style: { border: { fg: 'white' } },
  })),
  escape: jest.fn(str => str),
}));

jest.mock('../../src/storage', () => ({
  createStorage: jest.fn(),
}));

import { handleTui } from '../../src/utils/tui-handler';
import { createStorage } from '../../src/storage';

const mockCreateStorage = createStorage as jest.MockedFunction<typeof createStorage>;
const mockBlessed = require('neo-neo-blessed');

describe('TUI Handler', () => {
  let mockStorage: any;
  let mockScreen: any;
  let mockPromptList: any;
  let mockPromptDetails: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock storage
    mockStorage = {
      getAll: jest.fn(),
    };
    mockCreateStorage.mockResolvedValue(mockStorage);

    // Setup mock blessed components
    mockScreen = {
      append: jest.fn(),
      render: jest.fn(),
      destroy: jest.fn(),
      key: jest.fn(),
      focused: null,
    };

    mockPromptList = {
      setItems: jest.fn(),
      setLabel: jest.fn(),
      select: jest.fn(),
      focus: jest.fn(),
      on: jest.fn(),
      key: jest.fn(),
      selected: 0,
      style: { border: { fg: 'white' } },
    };

    mockPromptDetails = {
      setContent: jest.fn(),
      scrollTo: jest.fn(),
      focus: jest.fn(),
      on: jest.fn(),
      key: jest.fn(),
      style: { border: { fg: 'white' } },
    };

    mockBlessed.screen.mockReturnValue(mockScreen);
    mockBlessed.list.mockReturnValue(mockPromptList);
    mockBlessed.scrollabletext.mockReturnValue(mockPromptDetails);
  });

  describe('handleTui', () => {
    it('should create TUI components successfully', async () => {
      const mockPrompts = [
        {
          name: 'test-prompt',
          content: 'Test content',
          marker: 'TEST-PROMPT',
          categories: ['test'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockStorage.getAll.mockResolvedValue(mockPrompts);

      await handleTui();

      expect(mockCreateStorage).toHaveBeenCalled();
      expect(mockBlessed.screen).toHaveBeenCalledWith({
        smartCSR: true,
        title: 'Promptie - AI Prompt Manager',
      });
      expect(mockBlessed.list).toHaveBeenCalled();
      expect(mockBlessed.scrollabletext).toHaveBeenCalled();
      expect(mockScreen.append).toHaveBeenCalledWith(mockPromptList);
      expect(mockScreen.append).toHaveBeenCalledWith(mockPromptDetails);
    });

    it('should load and display prompts successfully', async () => {
      const mockPrompts = [
        {
          name: 'first-prompt',
          content: 'First content',
          marker: 'FIRST-PROMPT',
          categories: ['cat1', 'cat2'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
        {
          name: 'second-prompt',
          content: 'Second content',
          marker: 'SECOND-PROMPT',
          categories: [],
          createdAt: '2024-01-03T00:00:00.000Z',
          updatedAt: '2024-01-03T00:00:00.000Z',
        },
      ];

      mockStorage.getAll.mockResolvedValue(mockPrompts);

      await handleTui();

      expect(mockStorage.getAll).toHaveBeenCalled();
      expect(mockPromptList.setItems).toHaveBeenCalledWith(['first-prompt', 'second-prompt']);
      expect(mockPromptList.setLabel).toHaveBeenCalledWith(' Prompts (2) ');
      expect(mockPromptList.select).toHaveBeenCalledWith(0);
      expect(mockScreen.render).toHaveBeenCalled();
    });

    it('should handle empty prompts list', async () => {
      mockStorage.getAll.mockResolvedValue([]);

      await handleTui();

      expect(mockPromptList.setItems).toHaveBeenCalledWith([]);
      expect(mockPromptList.setLabel).toHaveBeenCalledWith(' Prompts (0) ');
      expect(mockPromptDetails.setContent).toHaveBeenCalledWith('No prompts found');
    });

    it('should handle storage errors during prompt loading', async () => {
      const error = new Error('Storage error');
      mockStorage.getAll.mockRejectedValue(error);

      await handleTui();

      expect(mockPromptList.setItems).toHaveBeenCalledWith(['Error loading prompts']);
      expect(mockPromptDetails.setContent).toHaveBeenCalledWith('Error loading prompts');
    });

    it('should display prompt details correctly', async () => {
      const mockPrompts = [
        {
          name: 'test-prompt',
          content: 'Test content\nwith multiple lines',
          marker: 'TEST-PROMPT',
          categories: ['test', 'demo'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T12:30:45.000Z',
        },
      ];

      mockStorage.getAll.mockResolvedValue(mockPrompts);

      await handleTui();

      // Simulate selecting the first prompt
      mockPromptList.selected = 0;

      expect(mockPromptDetails.setContent).toHaveBeenCalledWith(
        expect.stringContaining('{yellow-fg}{bold}Name:{/bold}{/yellow-fg} test-prompt')
      );
      expect(mockPromptDetails.setContent).toHaveBeenCalledWith(
        expect.stringContaining('{yellow-fg}{bold}Marker:{/bold}{/yellow-fg} TEST-PROMPT')
      );
      expect(mockPromptDetails.setContent).toHaveBeenCalledWith(
        expect.stringContaining('{yellow-fg}{bold}Categories:{/bold}{/yellow-fg} test, demo')
      );
      expect(mockPromptDetails.setContent).toHaveBeenCalledWith(
        expect.stringContaining('{yellow-fg}{bold}Content:{/bold}{/yellow-fg}')
      );
      expect(mockPromptDetails.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Test content\nwith multiple lines')
      );
      expect(mockPromptDetails.scrollTo).toHaveBeenCalledWith(0);
    });

    it('should handle prompts without categories', async () => {
      const mockPrompts = [
        {
          name: 'no-categories',
          content: 'Content',
          marker: 'NO-CATEGORIES',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockStorage.getAll.mockResolvedValue(mockPrompts);

      await handleTui();

      expect(mockPromptDetails.setContent).toHaveBeenCalledWith(
        expect.stringContaining('{yellow-fg}{bold}Categories:{/bold}{/yellow-fg} None')
      );
    });

    it('should set up key bindings correctly', async () => {
      mockStorage.getAll.mockResolvedValue([]);

      await handleTui();

      expect(mockScreen.key).toHaveBeenCalledWith(['escape', 'q', 'C-c'], expect.any(Function));
      expect(mockScreen.key).toHaveBeenCalledWith(['tab', 'left', 'right'], expect.any(Function));
      expect(mockPromptList.key).toHaveBeenCalledWith(['up', 'down'], expect.any(Function));
    });

    it('should set up focus and blur handlers', async () => {
      mockStorage.getAll.mockResolvedValue([]);

      await handleTui();

      expect(mockPromptList.on).toHaveBeenCalledWith('focus', expect.any(Function));
      expect(mockPromptList.on).toHaveBeenCalledWith('blur', expect.any(Function));
      expect(mockPromptDetails.on).toHaveBeenCalledWith('focus', expect.any(Function));
      expect(mockPromptDetails.on).toHaveBeenCalledWith('blur', expect.any(Function));
    });
  });
});
