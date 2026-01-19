export interface ScrapeRequest {
  username: string;
}

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
}

export interface QueryRequest {
  question: string;
  history?: HistoryMessage[];
}

export interface QueryResponse {
  answer: string;
  sql: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
