# mcp-notion-server

A Model Context Protocol server for Notion integration

This TypeScript-based MCP server implements a bridge between Claude and Notion, allowing seamless interaction with Notion's databases and pages. It demonstrates core MCP concepts through:

- Resource management for Notion pages and databases
- Tools for CRUD operations on Notion content
- AI-powered prompts for content analysis

## Features

### Resources
- Access Notion pages and databases via URIs
- Support for plain text and rich text content types
- Metadata extraction from Notion properties

### Tools

#### Database Operations
- `list_databases` - List all accessible Notion databases
- `create_database` - Create a new database with custom properties
- `query_database` - Search and filter database entries
- `update_database` - Modify database properties and schema

#### Page Operations
- `create_page` - Create new pages in databases or as subpages
  - Support for title, properties, and markdown content
- `update_page` - Update existing page properties
- `get_page` - Retrieve page content and metadata
- `delete_page` - Remove pages from databases or parent pages

#### Block Operations
- `append_blocks` - Add new blocks to a page
- `delete_blocks` - Remove blocks from a page
- `get_blocks` - Retrieve block content
- `update_blocks` - Modify existing block content

### Prompts
- `summarize_notes` - Generate concise summaries of notes
- `analyze_content` - Provide insights and analysis of page content
- `suggest_tags` - Recommend relevant tags based on content

## Setup

### Prerequisites
- Node.js 18 or higher
- Notion API Key and Integration setup
- Claude Desktop application

### Environment Variables
Create a `.env` file:
```bash
NOTION_API_KEY=your_api_key_here
NOTION_DATABASE_ID=optional_default_database_id
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

## Integration with Claude Desktop

### Configuration Setup

Add the server configuration to Claude Desktop:

**MacOS**:
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows**:
```bash
%APPDATA%/Claude/claude_desktop_config.json
```

Configuration content:
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

1. **MCP Inspector**
```bash
npm run inspector
```

MIT License - see [LICENSE](LICENSE) for details
