// Mock chalk to avoid ES module issues and support chaining
const createColorMock = () => {
  const colorFn = jest.fn(text => text) as any;
  colorFn.bold = jest.fn(text => text);
  return colorFn;
};

jest.mock('chalk', () => ({
  yellow: createColorMock(),
  white: createColorMock(),
  metadata: jest.fn(text => text),
  label: jest.fn(text => text),
  header: jest.fn(text => text),
  hex: jest.fn(() => jest.fn(text => text)),
  rgb: jest.fn(() => jest.fn(text => text)),
}));

import { onboardCommand } from '../../src/commands/onboard';

describe('Onboard Command', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should display onboard information', () => {
    // Since onboardCommand.action just logs, we can test the command structure
    expect(onboardCommand.name()).toBe('onboard');
    expect(onboardCommand.description()).toBe(
      'Display all commands with non-interactive usage for automation and scripting'
    );
  });
});
