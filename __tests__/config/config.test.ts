describe('Config', () => {
  describe('getAppName', () => {
    it('should return the app name from package.json', () => {
      const result = require('../../src/config').getAppName();
      expect(result).toBe('promptie');
    });
  });

  describe('getEnvVarName', () => {
    it('should return prefixed environment variable name', () => {
      const result = require('../../src/config').getEnvVarName('DEBUG');
      expect(result).toBe('PROMPTIE_DEBUG');
    });
  });

  describe('getConfigDir', () => {
    it('should return correct config directory path', () => {
      const result = require('../../src/config').getConfigDir();
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('getPromptsFilePath', () => {
    it('should return correct prompts file path', () => {
      const result = require('../../src/config').getPromptsFilePath();
      expect(result).toMatch(/promptie\.json$/);
    });
  });

  describe('getCategoriesFilePath', () => {
    it('should return correct categories file path', () => {
      const result = require('../../src/config').getCategoriesFilePath();
      expect(result).toMatch(/promptie_categories\.json$/);
    });
  });
});
