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

export const WantlistReleaseSchema = v.object({
  release_id: v.number(),
  title: v.string(),
  artists: v.array(v.string()),
});

export type SqliteTable = v.InferOutput<typeof SqliteTableSchema>;
export type SqliteColumnInfo = v.InferOutput<typeof SqliteColumnInfoSchema>;
export type WantlistRelease = v.InferOutput<typeof WantlistReleaseSchema>;
