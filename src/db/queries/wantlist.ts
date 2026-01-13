import { db } from '../../db.js';
import type { Statement } from 'better-sqlite3';

export let insertWantlistItem: Statement;
export let getAllReleases: Statement<unknown[], { release_id: number }>;

export function initWantlistQueries() {
  insertWantlistItem = db.prepare(`
    INSERT OR IGNORE INTO wantlist
    (release_id, user_id, artists, title, labels, catno, year)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  getAllReleases = db.prepare<unknown[], { release_id: number }>(`
    SELECT release_id FROM wantlist
  `);
}
