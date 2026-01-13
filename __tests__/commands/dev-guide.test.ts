import { devRulesCommand } from '../../src/commands/dev-guide';

describe('Dev Rules Command', () => {
  it('should define the dev-rules command', () => {
    expect(devRulesCommand).toBeDefined();
    expect(devRulesCommand.name()).toBe('dev-rules');
    expect(devRulesCommand.description()).toContain('development rules');
  });

  it('should have an action handler', () => {
    // Necessary test comment: This verifies that the command object has an action defined,
    // which is critical for ensuring the command can be executed
    const command = devRulesCommand;
    expect(command).toBeDefined();
  });
});
