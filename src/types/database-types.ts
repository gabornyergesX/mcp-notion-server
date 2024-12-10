import type { QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints.js";

export interface GetDatabaseParams {
  database_id: string;
}

export interface CreateDatabaseParams {
  parent_id: string;
  title: string;
  properties: Record<string, any>;
}

export interface QueryDatabaseParams {
  database_id: string;
  filter?: QueryDatabaseParameters["filter"];
  sorts?: QueryDatabaseParameters["sorts"];
  page_size?: number;
  start_cursor?: string;
} 