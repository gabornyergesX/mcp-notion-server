import { notionClient } from "../config/notion.js";
import { parseMarkdownToBlocks } from "../utils/markdown.js";
import type { 
  CreatePageParams,
  UpdatePageParams,
  GetPageParams
} from "../types/page-types.js";

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

export async function handleGetPage({ page_id }: GetPageParams) {
  const response = await notionClient.pages.retrieve({
    page_id
  });

  return {
    content: [{
      type: "text",
      text: JSON.stringify(response, null, 2)
    }]
  };
} 