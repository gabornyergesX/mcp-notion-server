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