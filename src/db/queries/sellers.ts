import { db } from '../../db.js';
import type { Statement } from 'better-sqlite3';

export let insertSeller: Statement;

export function initSellerQueries() {
  insertSeller = db.prepare(`
    INSERT OR IGNORE INTO sellers
    (seller_id, username, rating, num_ratings, ships_from)
    VALUES (?, ?, ?, ?, ?)
  `);
}
