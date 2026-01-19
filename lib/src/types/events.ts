export type ScrapeEvent =
  | { type: 'started'; totalReleases: number }
  | { type: 'progress'; current: number; total: number; releaseTitle: string }
  | { type: 'error'; message: string }
  | { type: 'completed' };

export type QueryEvent =
  | { type: 'thinking' }
  | { type: 'sql'; sql: string }
  | { type: 'chunk'; content: string }
  | { type: 'done' }
  | { type: 'error'; message: string };
