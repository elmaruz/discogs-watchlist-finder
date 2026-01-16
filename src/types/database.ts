import * as v from 'valibot';

// Type helpers
export type Nullable<T> = T | null;

// SQLite metadata schemas
export const SqliteTableSchema = v.object({
  name: v.string(),
});

export const SqliteColumnInfoSchema = v.object({
  name: v.string(),
  type: v.string(),
});

// Query result schemas
export const ReleaseIdSchema = v.object({
  release_id: v.number(),
});

// Inferred types
export type SqliteTable = v.InferOutput<typeof SqliteTableSchema>;
export type SqliteColumnInfo = v.InferOutput<typeof SqliteColumnInfoSchema>;
export type ReleaseId = v.InferOutput<typeof ReleaseIdSchema>;
