import { db } from '../../db.js';
import type { Statement } from 'better-sqlite3';

export let insertListing: Statement;

export function initListingQueries() {
  insertListing = db.prepare(`
    INSERT OR IGNORE INTO listings
    (listing_id, release_id, seller_id, price, currency, condition, sleeve_condition, genres, format_names)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
}
