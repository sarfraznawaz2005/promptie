import { PromptieError } from './errors';
import { getEnvVarName } from '../config';
import { colors } from './colors';

/**
 * Global error handler for Promptie CLI.
 * Catches and formats errors for user-friendly display.
 * @param error - The error to handle
 */
export function handleError(error: unknown): never {
  if (error instanceof PromptieError) {
    console.error(colors.error(`Error: ${error.message}`));
    process.exit(1);
  }

  if (error instanceof Error) {
    console.error(colors.error(`Error: ${error.message}`));

    if (process.env[getEnvVarName('DEBUG')] === 'true') {
      console.error(error.stack);
    }

    process.exit(1);
  }

  console.error(colors.error('An unexpected error occurred'));
  process.exit(1);
}

/**
 * Wraps an async function with error handling.
 * @param fn - The async function to wrap
 * @returns A wrapped function that handles errors
 * @example
 * const wrappedFn = withErrorHandling(async () => {
 *   await someAsyncOperation();
 * });
 * await wrappedFn();
 */
export function withErrorHandling<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<void> {
  return async (...args: TArgs): Promise<void> => {
    try {
      await fn(...args);
    } catch (error) {
      handleError(error);
    }
  };
}
