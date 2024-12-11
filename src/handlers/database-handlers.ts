import type { MCPResponse } from "@modelcontextprotocol/sdk/types.js";
import { notionClient } from "../config/notion.js";
import type { 
  CreateDatabaseParams,
  GetDatabaseParams,
  QueryDatabaseParams 
} from "../types/database-types.js";

export async function handleListDatabases(): Promise<MCPResponse> {
  const response = await notionClient.search({
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

export async function handleCreateDatabase({ parent_id, title, properties }: CreateDatabaseParams): Promise<MCPResponse> {
  const response = await notionClient.databases.create({
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

export async function handleGetDatabase({ database_id }: GetDatabaseParams): Promise<MCPResponse> {
  const response = await notionClient.databases.retrieve({
    database_id
  });

  return {
    content: [{
      type: "text",
      text: JSON.stringify(response, null, 2)
    }]
  };
}

export async function handleQueryDatabase({ 
  database_id,
  filter,
  sorts,
  page_size,
  start_cursor 
}: QueryDatabaseParams): Promise<MCPResponse> {
  const response = await notionClient.databases.query({
    database_id,
    filter,
    sorts,
    page_size,
    start_cursor
  });

  return {
    content: [{
      type: "text",
      text: JSON.stringify(response.results, null, 2)
    }]
  };
}