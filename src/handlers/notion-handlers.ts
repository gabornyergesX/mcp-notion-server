import { notionClient } from "../config/notion.js";
import type { 
  GetPageParams, 
  GetDatabaseParams,
  QueryDatabaseParams,
  SearchParams,
} from "../types/notion-api.js";

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

export async function handleGetDatabase({ database_id }: GetDatabaseParams) {
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
}: QueryDatabaseParams) {
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