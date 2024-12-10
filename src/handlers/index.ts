import { notionClient } from "../config/notion.js";
import { parseMarkdownToBlocks } from "../utils/markdown.js";
import type { 
  CreatePageParams, 
  CreateDatabaseParams,
  UpdatePageParams,
  AppendBlocksParams,
  NotesStore 
} from "../types/notion.ts";

// Sample notes data - in real app would be in a database
export const notes: NotesStore = {
  "1": { title: "First Note", content: "This is note 1" },
  "2": { title: "Second Note", content: "This is note 2" }
};

export async function handleListDatabases() {
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

export async function handleCreateDatabase({ parent_id, title, properties }: CreateDatabaseParams) {
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

export async function handleCreatePage({ 
  parent_type, 
  parent_id, 
  title, 
  properties, 
  content 
}: CreatePageParams) {
  const parent = parent_type === "database" 
    ? { database_id: parent_id }
    : { page_id: parent_id };

  const pageProperties = properties || (title ? {
    title: {
      title: [{ text: { content: title } }]
    }
  } : {});

  const response = await notionClient.pages.create({
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

export async function handleUpdatePage({ page_id, properties }: UpdatePageParams) {
  const response = await notionClient.pages.update({
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

export async function handleAppendBlocks({ page_id, blocks }: AppendBlocksParams) {
  const response = await notionClient.blocks.children.append({
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

export async function handleDeleteBlock(block_id: string) {
  await notionClient.blocks.delete({ block_id });

  return {
    content: [{
      type: "text",
      text: `Deleted block: ${block_id}`
    }]
  };
} 