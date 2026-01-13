import { handleError, withErrorHandling } from '../../src/utils/error-handler';
import { PromptieError } from '../../src/utils/errors';

describe('Error Handler', () => {
  let exitSpy: jest.SpyInstance;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    exitSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should handle PromptieError', () => {
    const error = new PromptieError('Test error');

    expect(() => handleError(error)).toThrow();
    expect(consoleSpy).toHaveBeenCalledWith('\x1b[31mError: Test error\x1b[0m');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle generic Error', () => {
    const error = new Error('Generic error');

    expect(() => handleError(error)).toThrow();
    expect(consoleSpy).toHaveBeenCalledWith('\x1b[31mError: Generic error\x1b[0m');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle unknown error', () => {
    expect(() => handleError('string error')).toThrow();
    expect(consoleSpy).toHaveBeenCalledWith('\x1b[31mAn unexpected error occurred\x1b[0m');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should wrap function with error handling', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Wrapped error'));
    const wrappedFn = withErrorHandling(mockFn);

    await expect(wrappedFn()).rejects.toThrow('process.exit called');

    expect(mockFn).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('\x1b[31mError: Wrapped error\x1b[0m');
  });
});
