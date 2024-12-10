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
      {
        name: "create_database_item",
        description: "Create a new item in a Notion database",
        inputSchema: {
          type: "object",
          properties: {
            database_id: {
              type: "string",
              description: "ID of the Notion database"
            },
            properties: {
              type: "object",
              description: "Properties for the new database item"
            }
          },
          required: ["database_id", "properties"]
        }
      },
      {
        name: "create_page",
        description: "Create a new page in Notion",
        inputSchema: {
          type: "object",
          properties: {
            parent_id: {
              type: "string",
              description: "ID of the parent page or database"
            },
            title: {
              type: "string",
              description: "Title of the new page"
            },
            content: {
              type: "string",
              description: "Content of the page in markdown format"
            }
          },
          required: ["parent_id", "title"]
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
  switch (request.params.name) {
    case "create_database_item": {
      const { database_id, properties } = request.params.arguments as {
        database_id: string;
        properties: Record<string, any>;
      };

      try {
        const response = await notion.pages.create({
          parent: { database_id },
          properties
        });

        return {
          content: [{
            type: "text",
            text: `Created database item: ${response.id}`
          }]
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to create database item: ${error.message}`);
        } else {
          throw new Error("Failed to create database item: An unknown error occurred");
        }
      }
    }

    case "create_page": {
      const { parent_id, title, content } = request.params.arguments as {
        parent_id: string;
        title: string;
        content?: string;
      };

      try {
        const response = await notion.pages.create({
          parent: { page_id: parent_id },
          properties: {
            title: {
              title: [
                {
                  text: {
                    content: title
                  }
                }
              ]
            }
          },
          children: content ? [
            {
              object: "block",
              type: "paragraph",
              paragraph: {
                rich_text: [
                  {
                    type: "text",
                    text: {
                      content: content
                    }
                  }
                ]
              }
            }
          ] : []
        });

        return {
          content: [{
            type: "text",
            text: `Created page: ${response.id}`
          }]
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to create page: ${error.message}`);
        } else {
          throw new Error("Failed to create page: An unknown error occurred");
        }
      }
    }

    default:
      throw new Error("Unknown tool");
  }
});

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
