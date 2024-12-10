#!/usr/bin/env node

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources and tools by allowing:
 * - Listing notes as resources
 * - Reading individual notes
 * - Creating new notes via a tool
 * - Summarizing all notes via a prompt
 */

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
import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.NOTION_API_KEY) {
  throw new Error("NOTION_API_KEY is required");
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

/**
 * Type alias for a note object.
 */
type Note = { title: string, content: string };

/**
 * Simple in-memory storage for notes.
 * In a real implementation, this would likely be backed by a database.
 */
const notes: { [id: string]: Note } = {
  "1": { title: "First Note", content: "This is note 1" },
  "2": { title: "Second Note", content: "This is note 2" }
};

/**
 * Create an MCP server with capabilities for resources (to list/read notes),
 * tools (to create new notes), and prompts (to summarize notes).
 */
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

/**
 * Handler for listing available notes as resources.
 * Each note is exposed as a resource with:
 * - A note:// URI scheme
 * - Plain text MIME type
 * - Human readable name and description (now including the note title)
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: Object.entries(notes).map(([id, note]) => ({
      uri: `note:///${id}`,
      mimeType: "text/plain",
      name: note.title,
      description: `A text note: ${note.title}`
    }))
  };
});

/**
 * Handler for reading the contents of a specific note.
 * Takes a note:// URI and returns the note content as plain text.
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  const id = url.pathname.replace(/^\//, '');
  const note = notes[id];

  if (!note) {
    throw new Error(`Note ${id} not found`);
  }

  return {
    contents: [{
      uri: request.params.uri,
      mimeType: "text/plain",
      text: note.content
    }]
  };
});

/**
 * Handler that lists available tools.
 * Exposes a single "create_note" tool that lets clients create new notes.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Database operations
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
            parent_id: {
              type: "string",
              description: "ID of the parent page"
            },
            title: {
              type: "string",
              description: "Title of the database"
            },
            properties: {
              type: "object",
              description: "Database properties schema"
            }
          },
          required: ["parent_id", "title", "properties"]
        }
      },
      // Page operations
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
            parent_id: {
              type: "string",
              description: "ID of the parent page or database"
            },
            title: {
              type: "string",
              description: "Title of the page"
            },
            properties: {
              type: "object",
              description: "Page properties (required for database pages)"
            },
            content: {
              type: "string",
              description: "Content in markdown format"
            }
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
            page_id: {
              type: "string",
              description: "ID of the page to update"
            },
            properties: {
              type: "object",
              description: "Updated page properties"
            }
          },
          required: ["page_id", "properties"]
        }
      },
      // Block operations
      {
        name: "append_blocks",
        description: "Append blocks to a page",
        inputSchema: {
          type: "object",
          properties: {
            page_id: {
              type: "string",
              description: "ID of the page"
            },
            blocks: {
              type: "array",
              description: "Array of block objects to append"
            }
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
            block_id: {
              type: "string",
              description: "ID of the block to delete"
            }
          },
          required: ["block_id"]
        }
      }
    ]
  };
});

/**
 * Handler for the create_note tool.
 * Creates a new note with the provided title and content, and returns success message.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      // Database operations
      case "list_databases": {
        const response = await notion.search({
          filter: {
            property: 'object',
            value: 'database'
          }
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.results, null, 2)
          }]
        };
      }

      case "create_database": {
        const { parent_id, title, properties } = request.params.arguments as {
          parent_id: string;
          title: string;
          properties: Record<string, any>;
        };

        const response = await notion.databases.create({
          parent: { page_id: parent_id },
          title: [{
            type: "text",
            text: { content: title }
          }],
          properties
        });

        return {
          content: [{
            type: "text",
            text: `Created database: ${response.id}`
          }]
        };
      }

      // Page operations
      case "create_page": {
        const { parent_type, parent_id, title, properties, content } = request.params.arguments as {
          parent_type: "database" | "page";
          parent_id: string;
          title?: string;
          properties?: Record<string, any>;
          content?: string;
        };

        const parent = parent_type === "database" 
          ? { database_id: parent_id }
          : { page_id: parent_id };

        const pageProperties = properties || (title ? {
          title: {
            title: [{ text: { content: title } }]
          }
        } : {});

        const response = await notion.pages.create({
          parent,
          properties: pageProperties,
          children: content ? parseMarkdownToBlocks(content) : []
        });

        return {
          content: [{
            type: "text",
            text: `Created page: ${response.id}`
          }]
        };
      }

      case "update_page": {
        const { page_id, properties } = request.params.arguments as {
          page_id: string;
          properties: Record<string, any>;
        };

        const response = await notion.pages.update({
          page_id,
          properties
        });

        return {
          content: [{
            type: "text",
            text: `Updated page: ${response.id}`
          }]
        };
      }

      // Block operations
      case "append_blocks": {
        const { page_id, blocks } = request.params.arguments as {
          page_id: string;
          blocks: any[];
        };

        const response = await notion.blocks.children.append({
          block_id: page_id,
          children: blocks
        });

        return {
          content: [{
            type: "text",
            text: `Appended blocks to page: ${page_id}`
          }]
        };
      }

      case "delete_blocks": {
        const { block_id } = request.params.arguments as {
          block_id: string;
        };

        await notion.blocks.delete({
          block_id
        });

        return {
          content: [{
            type: "text",
            text: `Deleted block: ${block_id}`
          }]
        };
      }

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

/**
 * Helper function to parse markdown to Notion blocks
 */
function parseMarkdownToBlocks(markdown: string): any[] {
  // Simple implementation - converts each line to a paragraph block
  return markdown.split('\n').filter(line => line.trim()).map(line => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{
        type: 'text',
        text: { content: line }
      }]
    }
  }));
}

/**
 * Handler that lists available prompts.
 * Exposes a single "summarize_notes" prompt that summarizes all notes.
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "summarize_notes",
        description: "Summarize all notes",
      }
    ]
  };
});

/**
 * Handler for the summarize_notes prompt.
 * Returns a prompt that requests summarization of all notes, with the notes' contents embedded as resources.
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name !== "summarize_notes") {
    throw new Error("Unknown prompt");
  }

  const embeddedNotes = Object.entries(notes).map(([id, note]) => ({
    type: "resource" as const,
    resource: {
      uri: `note:///${id}`,
      mimeType: "text/plain",
      text: note.content
    }
  }));

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Please summarize the following notes:"
        }
      },
      ...embeddedNotes.map(note => ({
        role: "user" as const,
        content: note
      })),
      {
        role: "user",
        content: {
          type: "text",
          text: "Provide a concise summary of all the notes above."
        }
      }
    ]
  };
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
