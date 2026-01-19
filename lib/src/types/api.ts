import * as v from 'valibot';

// Scrape API
export const ScrapeRequestSchema = v.object({
  username: v.pipe(v.string(), v.minLength(1)),
});

export type ScrapeRequest = v.InferOutput<typeof ScrapeRequestSchema>;

// Query API
export const HistoryMessageSchema = v.object({
  role: v.picklist(['user', 'assistant']),
  content: v.string(),
  sql: v.optional(v.string()),
});

export type HistoryMessage = v.InferOutput<typeof HistoryMessageSchema>;

export const QueryRequestSchema = v.object({
  question: v.pipe(v.string(), v.minLength(1)),
  history: v.optional(v.array(HistoryMessageSchema), []),
});

export type QueryRequest = v.InferOutput<typeof QueryRequestSchema>;

// Response types
export interface QueryResponse {
  answer: string;
  sql: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
