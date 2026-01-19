export interface ScrapeRequest {
  username: string;
}

export interface QueryRequest {
  question: string;
  conversationId?: string;
}

export interface QueryResponse {
  answer: string;
  sql: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
