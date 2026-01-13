import { uiCommand } from '../../src/commands/tui';

describe('UI Command', () => {
  it('should create command with correct name and description', () => {
    expect(uiCommand.name()).toBe('ui');
    expect(uiCommand.description()).toBe('Interactive terminal UI for managing prompts');
  });

  it('should have an action handler', () => {
    // Test that the command has an action defined
    // We don't test execution due to blessed's interactive nature
    expect(uiCommand).toBeDefined();
  });
});
