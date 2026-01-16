import * as v from 'valibot';
import { db } from '../index.js';
import {
  ReleaseIdSchema,
  type ReleaseId,
  type Nullable,
} from '../../types/database.js';

export function insertWantlistItem(
  releaseId: number,
  userId: number,
  artists: string,
  title: string,
  labels: string,
  catno: string,
  year: Nullable<number>
): void {
  db.prepare(
    `
    INSERT OR IGNORE INTO wantlist
    (release_id, user_id, artists, title, labels, catno, year)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  ).run(releaseId, userId, artists, title, labels, catno, year);
}

export function getAllReleases(): ReleaseId[] {
  const results = db
    .prepare(
      `
    SELECT release_id FROM wantlist
  `
    )
    .all();
  return v.parse(v.array(ReleaseIdSchema), results);
}
