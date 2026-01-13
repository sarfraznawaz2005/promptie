import {
  parsePromptList,
  matchPrompts,
  parseAndMatchPrompts,
} from '../../src/utils/prompt-matcher';

describe('Prompt Matcher Utility', () => {
  describe('parsePromptList', () => {
    it('should parse comma-separated strings', () => {
      expect(parsePromptList('prompt1,prompt2,prompt3')).toEqual(['prompt1', 'prompt2', 'prompt3']);
    });

    it('should trim whitespace', () => {
      expect(parsePromptList(' prompt1 , prompt2 , prompt3 ')).toEqual([
        'prompt1',
        'prompt2',
        'prompt3',
      ]);
    });

    it('should handle empty strings', () => {
      expect(parsePromptList('')).toEqual([]);
      expect(parsePromptList('   ')).toEqual([]);
    });

    it('should handle single prompt', () => {
      expect(parsePromptList('single-prompt')).toEqual(['single-prompt']);
    });
  });

  describe('matchPrompts', () => {
    const availablePrompts = [
      'react-component',
      'react-hook',
      'typescript-api',
      'debug-helper',
      'node-server',
    ];

    it('should match exact names', () => {
      expect(matchPrompts(availablePrompts, ['react-component'])).toEqual(['react-component']);
    });

    it('should match wildcard patterns', () => {
      expect(matchPrompts(availablePrompts, ['react-*'])).toEqual([
        'react-component',
        'react-hook',
      ]);
    });

    it('should match multiple patterns', () => {
      expect(matchPrompts(availablePrompts, ['react-*', '*api*'])).toEqual([
        'react-component',
        'react-hook',
        'typescript-api',
      ]);
    });

    it('should handle patterns that match nothing', () => {
      expect(matchPrompts(availablePrompts, ['nonexistent-*'])).toEqual([]);
    });

    it('should handle empty patterns', () => {
      expect(matchPrompts(availablePrompts, [])).toEqual([]);
    });
  });

  describe('parseAndMatchPrompts', () => {
    const availablePrompts = ['react-component', 'react-hook', 'typescript-api', 'debug-helper'];

    it('should parse and match successfully', () => {
      const result = parseAndMatchPrompts('react-*,*api*', availablePrompts);
      expect(result.matched).toEqual(['react-component', 'react-hook', 'typescript-api']);
      expect(result.unmatched).toEqual([]);
    });

    it('should return unmatched patterns', () => {
      const result = parseAndMatchPrompts('react-*,nonexistent,*api*', availablePrompts);
      expect(result.matched).toEqual(['react-component', 'react-hook', 'typescript-api']);
      expect(result.unmatched).toEqual(['nonexistent']);
    });

    it('should handle exact matches and wildcards together', () => {
      const result = parseAndMatchPrompts('debug-helper,react-*', availablePrompts);
      expect(result.matched).toEqual(['debug-helper', 'react-component', 'react-hook']);
      expect(result.unmatched).toEqual([]);
    });
  });
});
