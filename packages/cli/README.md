# Awesome AI CLI

Add agents, tools, and prompts from registries to your project.

## Installation

```bash
pnpm add -D awesome-ai
```

Or run directly with npx:

```bash
npx awesome-ai <command>
```

## Quick Start

```bash
# Initialize your project
npx awesome-ai init

# Add an agent
npx awesome-ai add coding-agent

# Add a tool
npx awesome-ai add bash --tool

# Add a prompt
npx awesome-ai add coding-agent --prompt

# Run an agent interactively
npx awesome-ai run coding-agent
```

---

## Commands

### `init`

Initialize your project and create an `agents.json` configuration file.

```bash
npx awesome-ai init [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-y, --yes` | Skip confirmation prompt | `true` |
| `-d, --defaults` | Use default configuration | `false` |
| `-c, --cwd <path>` | Working directory | Current directory |
| `-s, --silent` | Mute output | `false` |

**Examples:**

```bash
# Interactive initialization
npx awesome-ai init

# Non-interactive with defaults
npx awesome-ai init --defaults

# Initialize in a specific directory
npx awesome-ai init --cwd ./my-project
```

---

### `add`

Add an agent, tool, or prompt to your project.

```bash
npx awesome-ai add <items...> [options]
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `items` | Names of items to add (space-separated) |

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--tool` | Add a tool instead of an agent | `false` |
| `--prompt` | Add a prompt instead of an agent | `false` |
| `-y, --yes` | Skip confirmation prompt | `false` |
| `-o, --overwrite` | Overwrite existing files | `false` |
| `-c, --cwd <path>` | Working directory | Current directory |
| `-s, --silent` | Mute output | `false` |

> **Note:** By default, items are added as agents. Use `--tool` or `--prompt` to add other types.

**Examples:**

```bash
# Add a single agent (default type)
npx awesome-ai add coding-agent

# Add multiple agents
npx awesome-ai add coding-agent research-agent planning-agent

# Add a tool
npx awesome-ai add bash --tool

# Add multiple tools
npx awesome-ai add bash edit write grep --tool

# Add a prompt
npx awesome-ai add coding-agent --prompt

# Add with overwrite
npx awesome-ai add coding-agent --overwrite

# Add to a specific directory
npx awesome-ai add coding-agent --cwd ./my-project
```

---

### `list`

List available items from registries.

```bash
npx awesome-ai list [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --type <type>` | Type to list: `agents`, `tools`, or `prompts` | `agents` |
| `-r, --registry <registry>` | Registry to list from | `@awesome-ai` |
| `-c, --cwd <path>` | Working directory | Current directory |

**Examples:**

```bash
# List all agents
npx awesome-ai list

# List all tools
npx awesome-ai list --type tools

# List all prompts
npx awesome-ai list --type prompts

# List from a custom registry
npx awesome-ai list --registry @my-registry
```

---

### `search`

Search items from registries by name or description.

```bash
npx awesome-ai search [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-q, --query <query>` | Search query string | - |
| `-t, --type <type>` | Type to search: `agents`, `tools`, or `prompts` | `agents` |
| `-r, --registry <registry>` | Registry to search from | `@awesome-ai` |
| `-c, --cwd <path>` | Working directory | Current directory |

**Examples:**

```bash
# Search for agents with "coding" in name or description
npx awesome-ai search --query coding

# Search for tools
npx awesome-ai search --query bash --type tools

# Search a custom registry
npx awesome-ai search --query planning --registry @my-registry
```

---

### `view`

View detailed information about specific items from the registry.

```bash
npx awesome-ai view <items...> [options]
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `items` | Names of items to view (space-separated) |

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --type <type>` | Type of item: `agents`, `tools`, or `prompts` | Required |
| `-c, --cwd <path>` | Working directory | Current directory |

**Examples:**

```bash
# View an agent's details
npx awesome-ai view coding-agent --type agents

# View multiple tools
npx awesome-ai view bash edit --type tools

# View a prompt
npx awesome-ai view coding-agent --type prompts
```

---

### `diff`

Check for updates by comparing local files against the registry.

```bash
npx awesome-ai diff <item> [options]
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `item` | Name of the item to diff |

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --type <type>` | Type of item: `agents`, `tools`, or `prompts` | Required |
| `-c, --cwd <path>` | Working directory | Current directory |

**Examples:**

```bash
# Check if an agent has updates
npx awesome-ai diff coding-agent --type agents

# Check a tool for updates
npx awesome-ai diff bash --type tools

# Check a prompt for updates
npx awesome-ai diff coding-agent --type prompts
```

---

### `run`

Start an interactive TUI (Terminal User Interface) chat session with an agent.

```bash
npx awesome-ai run [agent] [options]
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `agent` | Name of the agent to run (optional) |

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-c, --cwd <path>` | Working directory | Current directory |

> **Note:** Requires an initialized project with `agents.json` configuration.

**Examples:**

```bash
# Run the default agent interactively
npx awesome-ai run

# Run a specific agent
npx awesome-ai run coding-agent

# Run an agent in a specific directory
npx awesome-ai run coding-agent --cwd ./my-project
```

---

## Configuration

The CLI uses an `agents.json` file for configuration. This file is created when you run `init`.

### Example `agents.json`

```json
{
  "$schema": "https://awesome-ai.com/schema.json",
  "tsx": true,
  "aliases": {
    "agents": "@/agents",
    "tools": "@/tools",
    "prompts": "@/prompts"
  }
}
```

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `$schema` | `string` | JSON schema URL for validation |
| `tsx` | `boolean` | Whether the project uses TypeScript |
| `aliases.agents` | `string` | Import alias for agents directory |
| `aliases.tools` | `string` | Import alias for tools directory |
| `aliases.prompts` | `string` | Import alias for prompts directory |
| `registries` | `object` | Custom registry configurations |

### Custom Registries

You can add custom registries to your `agents.json`:

```json
{
  "tsx": true,
  "aliases": {
    "agents": "@/agents",
    "tools": "@/tools",
    "prompts": "@/prompts"
  },
  "registries": {
    "@my-registry": "https://my-registry.com/{type}/{name}.json",
    "@private": {
      "url": "https://private-registry.com/{type}/{name}.json",
      "params": {
        "version": "latest"
      },
      "headers": {
        "Authorization": "Bearer ${MY_AUTH_TOKEN}"
      }
    }
  }
}
```

**Registry URL Requirements:**
- Registry names must start with `@` (e.g., `@my-registry`)
- URLs must include `{type}` and `{name}` placeholders
- Headers can reference environment variables using `${VAR_NAME}` syntax

---

## Environment Variables

### `AWESOME_AI_REGISTRY_URL` / `REGISTRY_URL`

Override the default registry URL:

```bash
AWESOME_AI_REGISTRY_URL=https://my-registry.com npx awesome-ai list
```

The CLI checks `AWESOME_AI_REGISTRY_URL` first, then falls back to `REGISTRY_URL`.

### Authentication

For private registries, use environment variables in headers:

```json
{
  "registries": {
    "@private": {
      "url": "https://api.example.com/{type}/{name}.json",
      "headers": {
        "Authorization": "Bearer ${AUTH_TOKEN}"
      }
    }
  }
}
```

---

## Available Registry Items

### Agents

| Agent | Description |
|-------|-------------|
| `coding-agent` | Full-featured coding assistant with read, write, edit, bash, and search tools |
| `research-agent` | Read-only agent for exploring and understanding codebases |
| `planning-agent` | Agent for planning tasks with read-only bash access |
| `migration-planning-agent` | Specialized agent for planning code migrations |

### Tools

| Tool | Description |
|------|-------------|
| `read` | Read files with line numbers, binary detection, and partial reads |
| `write` | Create or overwrite files with diff output |
| `edit` | Search and replace with fuzzy matching and multiple strategies |
| `bash` | Execute shell commands with streaming output and timeout |
| `list` | List directory contents using ripgrep |
| `grep` | Search file contents with regex patterns |
| `glob` | Find files matching glob patterns |
| `todo` | Task management for tracking work items |

### Prompts

| Prompt | Description |
|--------|-------------|
| `coding-agent` | System prompt for the coding agent |
| `research-agent` | System prompt for the research agent |
| `planning-agent` | System prompt for the planning agent |
| `migration-planning-agent` | System prompt for the migration planning agent |

---

## Registry Item Schema

Items in the registry follow this schema:

```typescript
{
  name: string           // Item name (required)
  type: string           // "registry:agent" | "registry:tool" | "registry:prompt" | "registry:lib"
  title?: string         // Display title
  author?: string        // Author name (min 2 chars)
  description?: string   // Description
  dependencies?: string[]      // npm dependencies
  devDependencies?: string[]   // npm dev dependencies
  registryDependencies?: string[]  // Other registry items this depends on
  files?: {
    path: string         // File path
    content?: string     // File content
    type: string         // File type (registry:agent, registry:tool, etc.)
    target?: string      // Target path override
  }[]
  meta?: Record<string, any>   // Additional metadata
  docs?: string          // Documentation/usage notes
  categories?: string[]  // Categories for organization
}
```

---

## Features

- **Automatic Dependency Resolution**: When adding an agent, the CLI automatically downloads any tools, prompts, and library dependencies it requires
- **Topological Sorting**: Dependencies are resolved in the correct order, handling complex dependency trees
- **Circular Dependency Detection**: Warns when circular dependencies are detected
- **Import Transformation**: Automatically transforms imports to use your configured path aliases (`@/tools`, `@/agents`, etc.)
- **Package Manager Detection**: Detects your package manager (npm, pnpm, yarn, bun, deno) and installs npm dependencies automatically
- **TypeScript Support**: Full TypeScript support with `.ts` and `.tsx` file handling
- **File Conflict Handling**: Prompts for confirmation before overwriting existing files
- **Diff Preview**: Shows colorized diff output when checking for updates
- **Custom Registries**: Support for multiple registries with authentication
- **Interactive TUI**: Built-in terminal UI for chatting with agents

---

## Examples

### Setting Up a New Project

```bash
# Create a new project
mkdir my-ai-project && cd my-ai-project
npm init -y

# Initialize the CLI
npx awesome-ai init

# Add the coding agent with all its dependencies
npx awesome-ai add coding-agent
```

### Working with Tools

```bash
# List available tools
npx awesome-ai list --type tools

# Add multiple tools at once
npx awesome-ai add bash edit write grep --tool

# View tool details
npx awesome-ai view edit --type tools

# Check for tool updates
npx awesome-ai diff edit --type tools

# Update a tool
npx awesome-ai add edit --tool --overwrite
```

### Using Multiple Registries

```bash
# Add an agent from a custom registry
npx awesome-ai add @my-registry/custom-agent

# List items from a specific registry
npx awesome-ai list --registry @my-registry
```

### Running Agents Interactively

```bash
# Start an interactive session with the coding agent
npx awesome-ai run coding-agent

# Start with a different working directory
npx awesome-ai run coding-agent --cwd ./my-project
```

### Checking for Updates

```bash
# See what changed in an agent
npx awesome-ai diff coding-agent --type agents

# Update by overwriting
npx awesome-ai add coding-agent --overwrite
```

---

## Using Agents Programmatically

After adding an agent via the CLI, you can use it in your code:

```typescript
import { createAgent } from "@/agents/coding-agent"
import { openai } from "@ai-sdk/openai"

const agent = await createAgent({
  model: openai("gpt-4o"),
  cwd: process.cwd(),
})

// The agent is ready to use with the Vercel AI SDK
```

### Using Tools Directly

```typescript
import { readTool, editTool, bashTool } from "@/tools"
import { generateText } from "ai"

const result = await generateText({
  model: yourModel,
  tools: {
    read: readTool,
    edit: editTool,
    bash: bashTool,
  },
  prompt: "Read the package.json file",
})
```

### Standalone Tool Execution

```typescript
import { readTool } from "@/tools/read"

// Execute a tool directly using its generator
const generator = readTool.execute({
  filePath: "/path/to/file.ts",
  offset: 0,
  limit: 100,
})

for await (const output of generator) {
  if (output.status === "success") {
    console.log(output.content)
  }
}
```

---

## License

MIT
