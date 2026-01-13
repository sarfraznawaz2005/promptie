# Promptie - Agent Instructions

Note: Always use backlog for task/issue tracking.

## 🤖 AI Agent Development Guide

**IMPORTANT**: If you are an AI agent working on developing or modifying the Promptie codebase, start by running:

```bash
pti dev-rules
```

## Project Overview

Promptie is a TypeScript-based CLI tool for managing custom AI instructions (prompts) across multiple AI development assistants like Claude, Gemini, Codex, Cursor, Zed, Warp, Aider, RooCode, and more. It allows developers to write prompts once and apply them consistently across all AI tools with project-specific and global storage options.

**Key Capabilities:**

- **Unified Prompt Management**: Create, edit, organize, and search prompts with a professional CLI interface
- **Multi-Tool Support**: Apply prompts to Claude Code, GitHub Copilot, Gemini Code Assist, and various other AI assistants
- **Advanced Organization**: Category-based organization, fuzzy search, and comprehensive filtering
- **Developer Experience**: Interactive TUI, variable substitution, statistics, and export/import functionality
- **Enterprise Ready**: Safe injection system, comprehensive error handling, and cross-platform compatibility

**Key Features:**

- Cross-platform CLI (Windows, macOS, Linux)
- Dual storage modes (global + project-specific)
- Interactive Terminal UI (TUI) for prompt management
- Fuzzy search with intelligent matching
- Import/export functionality for backup and sharing
- Category system for organizing prompts
- Marker-based safe prompt injection
- Variable substitution in prompts
- Comprehensive error handling and validation
- Statistics and analytics

## Architecture

### Core Components

```
src/
├── commands/        # CLI command implementations
├── config/          # OS-specific configuration paths
├── storage/         # Prompt storage (global/local)
├── types/           # TypeScript interfaces
├── utils/           # Business logic handlers
└── index.ts         # CLI entry point
```

### Data Flow

1. **User Input** → Command parsing (Commander.js)
2. **Validation** → Type checking and business logic
3. **Storage** → JSON file operations (global/local)
4. **Processing** → Marker injection for agent files
5. **Output** → Formatted CLI responses

### Key Patterns

- **Command-Handler Pattern**: Each CLI command has a dedicated handler
- **Storage Abstraction**: Interface-based storage with global/local implementations
- **Error Boundaries**: Comprehensive error handling with custom error classes
- **Marker System**: HTML comments for safe prompt injection

## Development Environment

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 8.0.0
```

### Setup

```bash
# Install dependencies
npm install

# Development mode (watch)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Quality checks
npm run lint
npm run typecheck
```

### Project Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode compilation
- `npm test` - Run Jest test suite
- `npm run lint` - ESLint code quality checks
- `npm run typecheck` - TypeScript type checking

## Code Standards

### TypeScript

- **Strict Mode**: All TypeScript strict checks enabled
- **Interface Usage**: Define interfaces for all data structures
- **Type Safety**: No `any` types except in test mocks
- **JSDoc Comments**: Required for all public functions

### Code Style

- **ESLint**: Strict rules with TypeScript support
- **Prettier**: Consistent code formatting
- **Imports**: Grouped by external/internal with blank lines
- **Functions**: Small, focused, single responsibility
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces

### Error Handling

- **Custom Errors**: Use specific error classes from `utils/errors.ts`
- **Global Handler**: All commands wrapped with `withErrorHandling()`
- **User-Friendly**: Clear error messages with suggestions
- **Debug Mode**: Stack traces available with `DEBUG=true`

## Testing Strategy

### Test Structure

```
__tests__/
├── commands/
│   ├── colors.test.ts          # Colors command tests
│   ├── onboard.test.ts         # Onboard command tests
│   └── tui.test.ts             # TUI command tests
├── config/
│   └── config.test.ts          # Configuration tests
├── storage/
│   ├── global.test.ts          # Global storage tests
│   └── global-category.test.ts # Category storage tests
└── utils/
    ├── apply-handler.test.ts
    ├── category-handler.test.ts
    ├── clean-handler.test.ts
    ├── colors.test.ts
    ├── delete-handler.test.ts
    ├── edit-handler.test.ts
    ├── error-handler.test.ts
    ├── export-handler.test.ts
    ├── fs.test.ts
    ├── get-handler.test.ts
    ├── import-handler.test.ts
    ├── list-handler.test.ts
    ├── marker.test.ts
    ├── prompt-matcher.test.ts
    ├── run-handler.test.ts
    ├── save-handler.test.ts
    ├── save-handler-category.test.ts
    ├── search-handler.test.ts
    ├── stats-handler.test.ts
    ├── table.test.ts
    └── tui-handler.test.ts
```

### Testing Patterns

- **Unit Tests**: Pure functions and isolated logic
- **Mocking**: External dependencies (fs, inquirer, prompts) fully mocked
- **Coverage**: Core business logic comprehensively tested (133 tests across 27 test files)

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- --testPathPattern=config.test.ts

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## File Organization

### Source Files

#### `/src/commands/`

CLI command implementations using Commander.js pattern:

```typescript
export const commandName = new Command('name')
  .description('Description')
  .option('--flag', 'Description')
  .action(
    withErrorHandling(async options => {
      // Handler logic
    })
  );
```

#### `/src/config/index.ts`

OS-specific path resolution:

```typescript
export function getGlobalConfigDir(): string {
  // Platform-specific logic
}
```

#### `/src/storage/`

Prompt storage implementations:

- `global.ts` - OS-specific global storage for both prompts and categories
- `index.ts` - Storage factory

#### `/src/types/index.ts`

TypeScript interfaces and types:

```typescript
export interface Prompt {
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptStorage {
  save(prompt: Prompt): Promise<void>;
  get(name: string): Promise<Prompt | null>;
  // ... other methods
}
```

#### `/src/utils/`

Business logic handlers:

- `*-handler.ts` - Command business logic
- `errors.ts` - Custom error classes
- `error-handler.ts` - Global error handling
- `fs.ts` - File system utilities

### Test Files

#### `/__tests__/`

Jest test files mirroring source structure:

- **Mocking**: External dependencies fully mocked
- **Isolation**: Tests run without file system access
- **Coverage**: All public functions tested
- **Patterns**: Arrange-Act-Assert structure

## Commands

### Available Commands

1. **`pti create [--name] [--content] [--file] [--categories] [--marker]`** - Create a new prompt
2. **`pti edit [name] [--name] [--content] [--file] [--marker] [--categories]`** - Edit existing prompts
3. **`pti get [name] [--all]`** - Get prompt content and display
4. **`pti ui`** - Terminal UI for viewing prompts
5. **`pti apply [--prompts] [--files] [--dry-run]`** - Apply prompts to agent files
6. **`pti list [--full] [--json] [--category] [--sort-by] [--sort-order]`** - List saved prompts
7. **`pti search <query> [--category]`** - Search through saved prompts using fuzzy matching
8. **`pti run [name] [--vars]`** - Run prompt with placeholder substitution
9. **`pti clean [--prompts] [--dry-run]`** - Clean prompts and remove from agent files
10. **`pti delete [--all] [--prompts] [--yes]`** - Delete prompts from storage
11. **`pti export <path>`** - Export prompts to JSON file
12. **`pti import <path> [--overwrite-all]`** - Import prompts from JSON file
13. **`pti category create`** - Create a new prompt category
14. **`pti category edit [name] [--name] [--description]`** - Edit an existing prompt category
15. **`pti category delete <name>`** - Delete a prompt category
16. **`pti category get <name>`** - Get detailed information about a prompt category
17. **`pti category list`** - List all prompt categories
18. **`pti category search <keyword>`** - Search prompt categories by keyword
19. **`pti stats [--json] [--category] [--recent]`** - Display statistics about prompts
20. **`pti location [new-path] [--confirm]`** - Manage the data storage location for prompts and categories
21. **`pti onboard`** - Display all commands with non-interactive usage for bots/AI agents

### Command Pattern

Each command follows this structure:

```typescript
// 1. Command definition
export const commandName = new Command('name')
  .description('Description')
  .option('--flag', 'Description')

  // 2. Action with error handling
  .action(
    withErrorHandling(async options => {
      // 3. Input validation
      // 4. Business logic
      // 5. User interaction (if needed)
      // 6. Success feedback
    })
  );
```

## Storage System

### Global Storage

- **Location**: OS-specific config directories
- **Format**: JSON files (`promptie.json` for prompts, `promptie_categories.json` for categories)
- **Persistence**: Survives project changes

### Storage Interface

```typescript
interface PromptStorage {
  save(prompt: Prompt): Promise<void>;
  get(name: string): Promise<Prompt | null>;
  getAll(): Promise<Prompt[]>;
  delete(name: string): Promise<void>;
  exists(name: string): Promise<boolean>;
}
```

## Marker System

### Purpose

Safely inject prompts into existing agent files without overwriting content.

### Format

```markdown
<!-- Existing content -->

<!-- USER-RULES-START -->

[Your custom prompt content]

<!-- USER-RULES-END -->

<!-- More existing content -->
```

### Implementation

- **Detection**: Regex matching for marker presence
- **Replacement**: Replace content between markers
- **Appending**: Add markers if not present
- **Cleanup**: Remove markers and content on deletion

## Error Handling

### Custom Error Classes

```typescript
// Base error
export class PromptieError extends Error {}

// Storage errors
export class SaveError extends PromptieError {}
export class LoadError extends PromptieError {}

// Agent file errors
export class ApplyError extends PromptieError {}

// Import/export errors
export class ImportError extends PromptieError {}
```

### Global Error Handler

```typescript
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
```

## Development Workflow

### Adding New Features

1. **Plan**
2. **Implement**: Follow existing patterns
3. **Test**: Add unit tests and update integration tests
4. **Document**: Update README.md and AGENT.md
5. **Quality**: Run all checks (lint, typecheck, test)

### Code Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] ESLint passes with no errors
- [ ] Unit tests added and passing
- [ ] JSDoc comments on public functions
- [ ] Error handling implemented
- [ ] Cross-platform compatibility
- [ ] Follows existing patterns

### Commit Messages

Follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation
- `test:` - Testing
- `refactor:` - Code refactoring

## Key Dependencies

### Runtime Dependencies

- **commander**: CLI argument parsing
- **inquirer**: Interactive CLI prompts (legacy)
- **prompts**: Modern interactive CLI prompts
- **chalk**: Terminal colors and formatting
- **fuse.js**: Fuzzy search functionality
- **minimatch**: Pattern matching for wildcards

### Development Dependencies

- **typescript**: TypeScript compiler
- **jest**: Testing framework
- **eslint**: Code linting
- **prettier**: Code formatting
- **@types/\***: TypeScript definitions

## Agent File Support

### Current Support

- `CLAUDE.md` - Claude Code
- `AGENTS.md` - Codex, Cursor, Zed, Warp, Aider, RooCode
- `GEMINI.md` - Google Gemini Code Assist
- `.github/copilot-instructions.md` - GitHub Copilot

### Adding New Tools

1. Add pattern to `AGENT_FILES` array in `apply-handler.ts`
2. Update README.md supported tools section
3. Test with real agent files
4. Update documentation

## Security Considerations

- **Local Storage**: All data stored locally, no external transmission
- **File Permissions**: Respects OS file permissions
- **Input Validation**: All user inputs validated
- **Error Messages**: No sensitive data in error outputs
- **Dependencies**: Only well-maintained packages used

---
