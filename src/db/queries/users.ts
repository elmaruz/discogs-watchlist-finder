import { db } from '../../db.js';
import type { Statement } from 'better-sqlite3';

export let insertUser: Statement;

export function initUserQueries() {
  insertUser = db.prepare(`
    INSERT OR REPLACE INTO users
    (user_id, username, name, profile, registered, num_wantlist, num_collection)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
}
