import { db } from '../index.js';
import type { Statement } from 'better-sqlite3';

export let insertRelease: Statement;
export let insertWantlistItem: Statement;
export let getAllReleases: Statement<unknown[], { release_id: number }>;

export function initWantlistQueries() {
  insertRelease = db.prepare(`
    INSERT OR IGNORE INTO releases
    (release_id, title, artists, labels, catno, year)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertWantlistItem = db.prepare(`
    INSERT OR IGNORE INTO wantlist
    (user_id, release_id)
    VALUES (?, ?)
  `);

  getAllReleases = db.prepare<unknown[], { release_id: number }>(`
    SELECT release_id FROM wantlist
  `);
}
