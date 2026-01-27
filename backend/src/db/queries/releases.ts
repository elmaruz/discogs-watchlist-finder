import { db } from '../index.js';
import type { Nullable } from '../../types/database.js';

export function insertRelease(
  releaseId: number,
  title: string,
  artists: string,
  labels: string,
  catno: string,
  year: Nullable<number>,
  thumb: Nullable<string>
): void {
  db.prepare(
    `
    INSERT OR IGNORE INTO releases
    (release_id, title, artists, labels, catno, year, thumb)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  ).run(releaseId, title, artists, labels, catno, year, thumb);
}
