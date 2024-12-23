import { notionClient } from "../config/notion.js";
import type { AppendBlocksParams } from "../types/block-types.js";

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

export async function handleGetBlocks(block_id: string) {
  const response = await notionClient.blocks.children.list({
    block_id
  });

  return {
    content: [{
      type: "text",
      text: JSON.stringify(response.results, null, 2)
    }]
  };
} 