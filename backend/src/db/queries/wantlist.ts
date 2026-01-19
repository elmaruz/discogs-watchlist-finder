import * as v from 'valibot';
import { db } from '../index.js';
import { ReleaseIdSchema, type ReleaseId } from '../../types/database.js';

export function insertWantlistItem(userId: number, releaseId: number): void {
  db.prepare(
    `
    INSERT OR IGNORE INTO wantlist
    (user_id, release_id)
    VALUES (?, ?)
  `
  ).run(userId, releaseId);
}

export function getAllWantlistReleases(): ReleaseId[] {
  const results = db
    .prepare(
      `
    SELECT release_id FROM wantlist
  `
    )
    .all();
  return v.parse(v.array(ReleaseIdSchema), results);
}
