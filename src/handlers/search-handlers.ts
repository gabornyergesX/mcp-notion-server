import { notionClient } from "../config/notion.js";
import type { SearchParams } from "../types/search-types.js";

export async function handleSearch(request: SearchParams) {
  const response = await notionClient.search({
    query: request.query,
    filter: request.filter,
    sort: request.sort,
    page_size: request.page_size,
    start_cursor: request.start_cursor
  });

  return {
    content: [{
      type: "text",
      text: JSON.stringify(response.results, null, 2)
    }]
  };
} 