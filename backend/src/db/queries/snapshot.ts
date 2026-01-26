import * as v from 'valibot';
import { db } from '../index.js';
import {
  NullableSnapshotInfoSchema,
  type NullableSnapshotInfo,
} from '@discogs-wantlist-finder/lib';

export function getSnapshotInfo(): NullableSnapshotInfo {
  const result =
    db
      .prepare(`
        SELECT
          u.username,
          (SELECT COUNT(*) FROM wantlist w WHERE w.user_id = u.user_id) as releaseCount,
          (SELECT COUNT(*) FROM listings l
            JOIN wantlist w ON l.release_id = w.release_id
            WHERE w.user_id = u.user_id) as listingCount
        FROM users u
        LIMIT 1
      `)
      .get() ?? null;

  return v.parse(NullableSnapshotInfoSchema, result);
}
