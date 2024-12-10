#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  handleListDatabases,
  handleCreateDatabase,
  handleCreatePage,
  handleUpdatePage,
  handleAppendBlocks,
  handleDeleteBlock,
  handleGetPage,
  handleGetDatabase,
  handleQueryDatabase,
  handleSearch
} from "./handlers/index.js";


const server = new Server(
  {
    name: "mcp-notion-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);


server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_databases",
      description: "List all accessible databases",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "create_database",
      description: "Create a new database",
      inputSchema: {
        type: "object",
        properties: {
          parent_id: { type: "string", description: "ID of the parent page" },
          title: { type: "string", description: "Title of the database" },
          properties: { type: "object", description: "Database properties schema" }
        },
        required: ["parent_id", "title", "properties"]
      }
    },
    {
      name: "create_page",
      description: "Create a new page",
      inputSchema: {
        type: "object",
        properties: {
          parent_type: {
            type: "string",
            enum: ["database", "page"],
            description: "Type of parent (database or page)"
          },
          parent_id: { type: "string", description: "ID of the parent page or database" },
          title: { type: "string", description: "Title of the page" },
          properties: { type: "object", description: "Page properties (required for database pages)" },
          content: { type: "string", description: "Content in markdown format" }
        },
        required: ["parent_type", "parent_id"]
      }
    },
    {
      name: "update_page",
      description: "Update an existing page",
      inputSchema: {
        type: "object",
        properties: {
          page_id: { type: "string", description: "ID of the page to update" },
          properties: { type: "object", description: "Updated page properties" }
        },
        required: ["page_id", "properties"]
      }
    },
    {
      name: "append_blocks",
      description: "Append blocks to a page",
      inputSchema: {
        type: "object",
        properties: {
          page_id: { type: "string", description: "ID of the page" },
          blocks: { type: "array", description: "Array of block objects to append" }
        },
        required: ["page_id", "blocks"]
      }
    },
    {
      name: "delete_blocks",
      description: "Delete blocks from a page",
      inputSchema: {
        type: "object",
        properties: {
          block_id: { type: "string", description: "ID of the block to delete" }
        },
        required: ["block_id"]
      }
    },
    {
      name: "get_page",
      description: "Retrieve a page by ID",
      inputSchema: {
        type: "object",
        properties: {
          page_id: { type: "string", description: "ID of the page to retrieve" }
        },
        required: ["page_id"]
      }
    },
    {
      name: "get_database",
      description: "Retrieve a database by ID",
      inputSchema: {
        type: "object",
        properties: {
          database_id: { type: "string", description: "ID of the database to retrieve" }
        },
        required: ["database_id"]
      }
    },
    {
      name: "query_database",
      description: "Query a database with filters and sorting",
      inputSchema: {
        type: "object",
        properties: {
          database_id: { type: "string", description: "ID of the database to query" },
          filter: { type: "object", description: "Filter conditions" },
          sorts: { type: "array", description: "Sorting parameters" },
          page_size: { type: "number", description: "Number of results per page" },
          start_cursor: { type: "string", description: "Pagination cursor" }
        },
        required: ["database_id"]
      }
    },
    {
      name: "search",
      description: "Search pages and databases",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          filter: { 
            type: "object",
            description: "Filter by object type (page or database)" 
          },
          sort: { 
            type: "object",
            description: "Sort by last edited or created time" 
          },
          page_size: { type: "number", description: "Number of results per page" },
          start_cursor: { type: "string", description: "Pagination cursor" }
        },
        required: ["query"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "list_databases":
        return handleListDatabases();

      case "create_database":
        return handleCreateDatabase(request.params.arguments as any);

      case "get_database":
        return handleGetDatabase(request.params.arguments as any);

      case "query_database":
        return handleQueryDatabase(request.params.arguments as any);

      case "get_page":
        return handleGetPage(request.params.arguments as any);
  
      case "create_page":
        return handleCreatePage(request.params.arguments as any);

      case "update_page":
        return handleUpdatePage(request.params.arguments as any);

      case "append_blocks":
        return handleAppendBlocks(request.params.arguments as any);

      case "delete_blocks":
        return handleDeleteBlock((request.params.arguments as any).block_id);

      case "search":
        return handleSearch(request.params.arguments as any);

      default:
        throw new Error("Unknown tool");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Operation failed: ${error.message}`);
    }
    throw new Error("Operation failed: An unknown error occurred");
  }
});

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: "summarize_notes",
      description: "Summarize all notes",
    }
  ]
}));



async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
