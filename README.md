# mcp-notion-server

A Model Context Protocol server

This is a TypeScript-based MCP server that implements a simple notes system. It demonstrates core MCP concepts by providing:

- Resources representing text notes with URIs and metadata
- Tools for creating new notes
- Prompts for generating summaries of notes

## Features

### Resources
- Access Notion pages and databases via URIs
- Plain text mime type for content access

### Tools

#### Database Operations
- `list_databases` - List all accessible Notion databases
- `create_database` - Create a new database with custom properties

#### Page Operations
- `create_page` - Create new pages in databases or as subpages
  - Support for title, properties, and markdown content
- `update_page` - Update existing page properties

#### Block Operations
- `append_blocks` - Add new blocks to a page
- `delete_blocks` - Remove blocks from a page

### Prompts
- `summarize_notes` - Generate summaries of notes

## Setup

### Prerequisites
- Node.js
- Notion API Key

### Environment Variables
Create a `.env` file:
```bash
NOTION_API_KEY=your_api_key_here
```

### Installation
```bash
npm install
npm run build
```

### Development
```bash
npm run watch
```

## Usage with Claude Desktop

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-notion-server": {
      "command": "/path/to/mcp-notion-server/build/index.js"
    }
  }
}
```



### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
