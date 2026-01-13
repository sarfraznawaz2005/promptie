jest.mock('chalk', () => ({
  yellow: { bold: jest.fn(text => text) },
  cyan: jest.fn(text => text),
  green: jest.fn(text => text),
  red: jest.fn(text => text),
  blue: jest.fn(text => text),
  magenta: { bold: jest.fn(text => text) },
  white: jest.fn(text => text),
  gray: jest.fn(text => text),
  hex: jest.fn(() => jest.fn(text => text)),
  rgb: jest.fn(() => jest.fn(text => text)),
}));

import { colorsCommand } from '../../src/commands/colors';

describe('Colors Command', () => {
  it('should define the colors command', () => {
    expect(colorsCommand.name()).toBe('colors');
    expect(colorsCommand.description()).toContain('Preview all colors');
  });
});
