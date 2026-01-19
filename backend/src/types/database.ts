import * as v from 'valibot';

export type Nullable<T> = T | null;
export type SqlRow = Record<string, unknown>;

export const SqlRowSchema = v.record(v.string(), v.unknown());

export const SqliteTableSchema = v.object({
  name: v.string(),
});

export const SqliteColumnInfoSchema = v.object({
  name: v.string(),
  type: v.string(),
});

export const ReleaseIdSchema = v.object({
  release_id: v.number(),
});

export type SqliteTable = v.InferOutput<typeof SqliteTableSchema>;
export type SqliteColumnInfo = v.InferOutput<typeof SqliteColumnInfoSchema>;
export type ReleaseId = v.InferOutput<typeof ReleaseIdSchema>;
