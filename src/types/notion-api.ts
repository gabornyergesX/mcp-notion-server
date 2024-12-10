import type { QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints.js";

export interface GetPageParams {
  page_id: string;
}

export interface GetDatabaseParams {
  database_id: string;
}

export interface QueryDatabaseParams {
  database_id: string;
  filter?: QueryDatabaseParameters["filter"];
  sorts?: QueryDatabaseParameters["sorts"];
  page_size?: number;
  start_cursor?: string;
}

export interface SearchParams {
  query: string;
  filter?: {
    property: "object";
    value: 'page' | 'database';
  };
  sort?: {
    direction: 'ascending' | 'descending';
    timestamp: 'last_edited_time';
  };
  page_size?: number;
  start_cursor?: string;
} 