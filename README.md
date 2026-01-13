# Promptie

> CLI-based prompt management for humans & agents!

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Promptie is a powerful CLI tool that lets you write AI prompts once and apply them across Claude, Gemini, Codex, Cursor, and other AI development assistants. Perfect for teams and individuals who want consistent AI behavior across multiple tools and projects.

## Table of Contents

- [Key Features](#key-features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Configuration](#configuration)
- [Examples](#examples)
- [Supported Tools](#supported-tools)
- [Advanced Usage](#advanced-usage)
- [Contributing](#contributing)

## Key Features

- ✨ **Multi-Tool Support** - Apply prompts to Claude, Gemini, Codex, Cursor, Zed, Warp, Aider, RooCode, and more
- 🔍 **Fuzzy Search** - Find prompts by name or content with intelligent matching
- 🔄 **Import/Export** - Backup, share, and transfer your prompts
- 🏠 **Global Storage** - Store prompts in OS-specific config directories
- 🗂️ **Category Management** - Organize prompts with custom categories
- 🔧 **Variable Substitution** - Use placeholders like {{name}} for dynamic prompt content
- 📊 **Statistics & Analytics** - Track prompt usage and get insights with the stats command

## Installation

### Global Installation (Recommended)

```bash
npm install -g promptie
```

This installs the `pti` command globally on your system.

### Verify Installation

```bash
pti --version
pti --help
```

### Local Development Installation

```bash
git clone <repository-url>
cd promptie
npm install
npm run build
npm link  # Creates global symlink for development
```

## Quick Start

Get up and running in 3 minutes:

### 1. Install Promptie

```bash
npm install -g promptie
```

### 2. Create Your First Prompt

```bash
pti create
```

When prompted:

- **Name**: `my-first-prompt` (or press Enter for default)
- **Content**: Write your custom AI instructions (e.g., "You are a helpful coding assistant who writes clean, well-documented code.")

### 3. Apply to Your Projects

```bash
pti apply
```

Select:

- Your saved prompt
- Target AI tools (Claude, Gemini, etc.)

### 4. Verify Installation

Check that agent files were created:

```bash
ls -la CLAUDE.md AGENTS.md GEMINI.md .github/copilot-instructions.md
cat CLAUDE.md  # Should contain your prompt in markers
```

**🎉 You're done!** Your AI assistants now have consistent behavior across all tools.

### The Marker System

Your prompts are wrapped in special HTML comments:

```markdown
<!-- Existing agent file content -->

<!-- USER-RULES-START -->

You are a helpful coding assistant who writes clean, well-documented code.

<!-- USER-RULES-END -->

<!-- More existing content -->
```

## Usage

### Basic Commands

```bash
# Create and manage prompts
pti create                    # Create a new prompt (interactive)
pti create --name my-prompt --content "Your content here"
pti edit my-prompt           # Edit existing prompt
pti get my-prompt            # Display prompt content
pti ui                      # Terminal UI for viewing prompts
pti list                     # List all prompts
pti search "typescript"      # Search prompts

# Apply to AI tools
pti apply                    # Apply prompts to agent files (interactive)
pti apply --prompts "prompt1,prompt2" --files CLAUDE.md AGENTS.md

# Manage storage
pti export backup.json       # Export prompts to file
pti import backup.json       # Import prompts from file
pti delete --all --yes       # Delete all prompts
pti clean --prompts "old-prompt"  # Remove prompts from agent files

# Categories
pti category create          # Create prompt categories
pti category list            # List all categories
pti list --category "AI"     # Filter prompts by category

# Configuration
pti location                 # Show current data storage location
pti location /new/path -y    # Change storage location

# Information
pti stats                    # Show prompt statistics
pti onboard                  # Show detailed command reference
```

### Complete Command Reference

| Command                                                                   | Description                                                        | Options                                                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| `pti create [--name] [--content] [--file] [--categories] [--marker]`      | Create a new prompt                                                | `--name`, `--content`, `--file`, `--categories`, `--marker`   |
| `pti edit [name] [--name] [--content] [--file] [--marker] [--categories]` | Edit existing prompts                                              | `--name`, `--content`, `--file`, `--marker`, `--categories`   |
| `pti get [name] [--all]`                                                  | Get prompt content and display                                     | `--all`                                                       |
| `pti ui`                                                                  | Terminal UI for managing prompts                       |                                                               |
| `pti apply [--prompts] [--files] [--dry-run]`                             | Apply prompts to agent files                                       | `--prompts`, `--files`, `--dry-run`                           |
| `pti list [--full] [--json] [--category] [--sort-by] [--sort-order]`      | List saved prompts                                                 | `--full`, `--json`, `--category`, `--sort-by`, `--sort-order` |
| `pti search <query> [--category]`                                         | Search through saved prompts using fuzzy matching                  | `--category`                                                  |
| `pti run [name] [--vars]`                                                 | Run prompt with placeholder substitution                           | `--vars`                                                      |
| `pti clean [--prompts] [--dry-run]`                                       | Clean prompts and remove from agent files                          | `--prompts`, `--dry-run`                                      |
| `pti delete [--all] [--prompts] [--yes]`                                  | Delete prompts from storage                                        | `--all`, `--prompts`, `--yes`                                 |
| `pti export <path>`                                                       | Export prompts to JSON file                                        |                                                               |
| `pti import <path> [--overwrite-all]`                                     | Import prompts from JSON file                                      | `--overwrite-all`                                             |
| `pti category create`                                                     | Create a new prompt category                                       |                                                               |
| `pti category edit [name] [--name] [--description]`                       | Edit an existing prompt category                                   | `--name`, `--description`                                     |
| `pti category delete <name>`                                              | Delete a prompt category                                           |                                                               |
| `pti category get <name>`                                                 | Get detailed information about a prompt category                   |                                                               |
| `pti category list`                                                       | List all prompt categories                                         |                                                               |
| `pti category search <keyword>`                                           | Search prompt categories by keyword                                |                                                               |
| `pti stats [--json] [--category] [--recent]`                              | Display statistics about prompts                                   | `--json`, `--category`, `--recent`                            |
| `pti location [new-path] [--confirm]`                                     | Manage the data storage location for prompts and categories        | `--confirm`                                                   |
| `pti onboard`                                                             | Display all commands with non-interactive usage for bots/AI agents |                                                               |

For detailed help on any command:

```bash
pti --help          # Show all available commands
pti <command> --help # Show help for specific command
pti onboard         # Show comprehensive command reference
```

## Configuration

### Data Storage Location

Promptie stores data in OS-specific locations:

- **Windows**: `%APPDATA%\promptie\`
- **macOS**: `~/Library/Application Support/promptie/`
- **Linux**: `~/.config/promptie/`

Change the location with:

```bash
pti location /custom/path
```

## Examples

### Team Development Setup

```bash
# 1. Create team coding standards prompt
pti create --name team-standards --content "Follow our team's coding standards: use TypeScript, add JSDoc comments, write tests."

# 2. Apply to all team projects
pti apply --prompts "team-standards"

# 3. Team members get consistent AI behavior
```

### Personal Workflow

```bash
# Different prompts for different project types
pti create --name react-expert --content "You are a React expert..." --categories "React" "Frontend"
pti create --name node-expert --content "You are a Node.js expert..." --categories "Node" "Backend"

# Apply context-appropriate prompts
cd ~/projects/react-app
pti apply --prompts "react-expert"

cd ~/projects/api-server
pti apply --prompts "node-expert"
```

### Backup and Sharing

```bash
# Backup your prompts
pti export ~/backups/prompts-$(date +%Y%m%d).json

# Share with team
pti export team-prompts.json

# Restore on new machine
pti import ~/backups/prompts-20241201.json
```

### Advanced Multi-Prompt Setup

```bash
# Create specialized prompts
pti create --name typescript-focus --content "Focus on TypeScript best practices..."
pti create --name testing-emphasis --content "Emphasize comprehensive testing..."
pti create --name security-conscious --content "Prioritize security considerations..."

# Apply multiple prompts to same project
pti apply --prompts "typescript-focus,testing-emphasis,security-conscious"
```

### Finding the Right Prompt

```bash
# Search by keyword
pti search "typescript"
pti search "security"

# Filter by category
pti search "expert" --category "Development"

# List with categories
pti list --category "AI"
```

## Supported Tools

Promptie currently supports these AI development assistants:

| Tool                                    | File Pattern                      | Description                       |
| --------------------------------------- | --------------------------------- | --------------------------------- |
| **Claude Code**                         | `CLAUDE.md`                       | Anthropic's Claude Code assistant |
| **Codex/Cursor/Zed/Warp/Aider/RooCode** | `AGENTS.md`                       | GitHub Copilot and similar tools  |
| **Gemini Code Assist**                  | `GEMINI.md`                       | Google's Gemini AI assistant      |
| **GitHub Copilot**                      | `.github/copilot-instructions.md` | GitHub Copilot Instructions       |

## Advanced Usage

### Variable Substitution

Use placeholders in your prompts for dynamic content:

```bash
# Create prompt with variables
pti create --name template-prompt --content "Hello {{name}}, you work with {{language}}."

# Run with variable substitution
pti run template-prompt --vars name=Alice language=TypeScript
# Output: Hello Alice, you work with TypeScript.
```

### Category Management

```bash
# Create categories
pti category create
pti category edit "AI"
pti category rename "OldName" "NewName"
pti category delete "Unused"

# Filter by categories
pti list --category "Development"
pti search "typescript" --category "Frontend"
```

### Statistics and Analytics

```bash
# View prompt statistics
pti stats
pti stats --json
pti stats --category "AI"
pti stats --recent 7  # Last 7 days
```

### Data Management

```bash
# Export specific data
pti export my-prompts.json

# Import with conflict resolution
pti import shared-prompts.json --overwrite-all

# Clean up old prompts
pti clean --prompts "obsolete-prompt"
pti delete --prompts "another-prompt"
```

## Contributing

We welcome contributions! Here's how you can help:

### Setting Up Development

```bash
git clone <repository-url>
cd promptie
npm install
npm run build
npm link
```

### Development Workflow

1. **Create a feature branch**: `git checkout -b feature/your-feature`
2. **Make changes**: Follow existing code style and patterns
3. **Test thoroughly**: Run `npm test` and manual testing
4. **Update documentation**: Keep README.md and AGENTS.md current
5. **Submit a PR**: Include clear description of changes

### Code Quality

- Follow TypeScript strict mode requirements
- Add tests for new functionality
- Update documentation for API changes
- Run `npm run lint` and `npm run typecheck` before submitting

## License

Promptie is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

**Promptie** - Consistent AI behavior across all your development tools.

Built with ❤️ using TypeScript</content>
<parameter name="filePath">README.md
