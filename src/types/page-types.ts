export type ParentType = "database" | "page";

export interface GetPageParams {
  page_id: string;
}

export interface CreatePageParams {
  parent_type: ParentType;
  parent_id: string;
  title?: string;
  properties?: Record<string, any>;
  content?: string;
}

export interface UpdatePageParams {
  page_id: string;
  properties: Record<string, any>;
} 