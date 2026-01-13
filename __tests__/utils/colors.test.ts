import { colors, styled } from '../../src/utils/colors';

jest.mock('chalk', () => ({
  yellow: { bold: jest.fn(text => `yellow-bold:${text}`) },
  white: jest.fn(text => `white:${text}`),
  gray: jest.fn(text => `gray:${text}`),
  green: jest.fn(text => `green:${text}`),
  red: jest.fn(text => `red:${text}`),
  cyan: jest.fn(text => `cyan:${text}`),
  blue: jest.fn(text => `blue:${text}`),
  magenta: { bold: jest.fn(text => `magenta-bold:${text}`) },
  hex: jest.fn(() => jest.fn(text => text)),
  rgb: jest.fn(() => jest.fn(text => text)),
}));

describe('Colors Utils', () => {
  it('should apply header color', () => {
    expect(colors.header('test')).toBe('yellow-bold:test');
  });

  it('should apply success color', () => {
    expect(colors.success('done')).toBe('green:done');
  });

  it('should apply styled success message', () => {
    expect(styled.success('completed')).toBe('green:✓ completed');
  });
});
