/**
 * Base error class for Promptie application.
 * All application-specific errors should extend this class.
 */
export class PromptieError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromptieError';
    Object.setPrototypeOf(this, PromptieError.prototype);
  }
}

/**
 * Error thrown when prompts cannot be saved.
 */
export class SaveError extends PromptieError {
  constructor(message: string) {
    super(`Failed to save prompt: ${message}`);
    this.name = 'SaveError';
    Object.setPrototypeOf(this, SaveError.prototype);
  }
}

/**
 * Error thrown when prompts cannot be loaded.
 */
export class LoadError extends PromptieError {
  constructor(message: string) {
    super(`Failed to load prompt: ${message}`);
    this.name = 'LoadError';
    Object.setPrototypeOf(this, LoadError.prototype);
  }
}

/**
 * Error thrown when a prompt cannot be deleted.
 */
export class DeleteError extends PromptieError {
  constructor(message: string) {
    super(`Failed to delete prompt: ${message}`);
    this.name = 'DeleteError';
    Object.setPrototypeOf(this, DeleteError.prototype);
  }
}

/**
 * Error thrown when a prompt with the given name is not found.
 */
export class PromptNotFoundError extends PromptieError {
  constructor(promptName: string) {
    super(`Prompt "${promptName}" not found`);
    this.name = 'PromptNotFoundError';
    Object.setPrototypeOf(this, PromptNotFoundError.prototype);
  }
}

/**
 * Error thrown when prompts cannot be applied to agent files.
 */
export class ApplyError extends PromptieError {
  constructor(message: string) {
    super(`Failed to apply prompts: ${message}`);
    this.name = 'ApplyError';
    Object.setPrototypeOf(this, ApplyError.prototype);
  }
}

/**
 * Error thrown when agent file operations fail.
 */
export class AgentFileError extends PromptieError {
  constructor(message: string) {
    super(`Agent file error: ${message}`);
    this.name = 'AgentFileError';
    Object.setPrototypeOf(this, AgentFileError.prototype);
  }
}

/**
 * Error thrown when export operation fails.
 */
export class ExportError extends PromptieError {
  constructor(message: string) {
    super(`Failed to export prompts: ${message}`);
    this.name = 'ExportError';
    Object.setPrototypeOf(this, ExportError.prototype);
  }
}

/**
 * Error thrown when import operation fails.
 */
export class ImportError extends PromptieError {
  constructor(message: string) {
    super(`Failed to import prompts: ${message}`);
    this.name = 'ImportError';
    Object.setPrototypeOf(this, ImportError.prototype);
  }
}

/**
 * Error thrown when import JSON is invalid.
 */
export class InvalidImportError extends PromptieError {
  constructor(message: string) {
    super(`Invalid import format: ${message}`);
    this.name = 'InvalidImportError';
    Object.setPrototypeOf(this, InvalidImportError.prototype);
  }
}

/**
 * Error thrown when import file doesn't exist.
 */
export class ImportFileNotFoundError extends PromptieError {
  constructor(path: string) {
    super(`Import file not found: ${path}`);
    this.name = 'ImportFileNotFoundError';
    Object.setPrototypeOf(this, ImportFileNotFoundError.prototype);
  }
}

/**
 * Error thrown when a prompt name is invalid.
 */
export class InvalidPromptNameError extends PromptieError {
  constructor(message: string) {
    super(`Invalid prompt name: ${message}`);
    this.name = 'InvalidPromptNameError';
    Object.setPrototypeOf(this, InvalidPromptNameError.prototype);
  }
}

/**
 * Error thrown when prompt content is invalid.
 */
export class InvalidPromptContentError extends PromptieError {
  constructor(message: string) {
    super(`Invalid prompt content: ${message}`);
    this.name = 'InvalidPromptContentError';
    Object.setPrototypeOf(this, InvalidPromptContentError.prototype);
  }
}

/**
 * Error thrown when config cannot be read or written.
 */
export class ConfigError extends PromptieError {
  constructor(message: string) {
    super(`Configuration error: ${message}`);
    this.name = 'ConfigError';
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}

/**
 * Error thrown when there are no prompts in storage.
 */
export class NoPromptsError extends PromptieError {
  constructor() {
    super('No prompts found. Create a prompt using "pti create".');
    this.name = 'NoPromptsError';
    Object.setPrototypeOf(this, NoPromptsError.prototype);
  }
}
