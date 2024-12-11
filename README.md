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



## Integration with Claude Desktop

Create a Notion Integration:

1. [Visit the Notion Your Integrations page.](https://www.notion.so/profile/integrations)

2. Click "New Integration".
3. Name your integration and select appropriate permissions (e.g., "Read content", "Update content").
4. Retrieve the Secret Key:

5. Copy the "Internal Integration Token" from your integration.
This token will be used for authentication.

6. Add the Integration to Your Workspace:

7. Open the page or database you want the integration to access in Notion.
8. Click the navigation button in the top right corner.
9. Click "Connect to" button and select your integration.

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
      "command": "npx",
      "args": [
        "-y",
        "@gabornyerges/mcp-notion-server"
      ],
      "env": {
        "NOTION_API_KEY": "your-notion-api-key"
      }
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
