import * as v from 'valibot';
import { db } from '../index.js';
import {
  WantlistReleaseSchema,
  type WantlistRelease,
} from '../../types/database.js';

export function insertWantlistItem(userId: number, releaseId: number): void {
  db.prepare(
    `
    INSERT OR IGNORE INTO wantlist
    (user_id, release_id)
    VALUES (?, ?)
  `,
  ).run(userId, releaseId);
}

export function getAllWantlistReleases(): WantlistRelease[] {
  const results = db
    .prepare(
      `
    SELECT 
      w.release_id
    , r.title
    , r.artists
    FROM wantlist w
    JOIN releases r
    ON w.release_id = r.release_id
  `,
    )
    .all();
  return v.parse(v.array(WantlistReleaseSchema), results);
}
