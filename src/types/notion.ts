export interface Note {
  title: string;
  content: string;
}

export interface NotesStore {
  [id: string]: Note;
}

export type ParentType = "database" | "page";

export interface CreatePageParams {
  parent_type: ParentType;
  parent_id: string;
  title?: string;
  properties?: Record<string, any>;
  content?: string;
}

export interface CreateDatabaseParams {
  parent_id: string;
  title: string;
  properties: Record<string, any>;
}

export interface UpdatePageParams {
  page_id: string;
  properties: Record<string, any>;
}

export interface AppendBlocksParams {
  page_id: string;
  blocks: any[];
}