import { db } from '../index.js';
import type { Nullable } from '../../types/database.js';

export function insertSeller(
  sellerId: number,
  username: string,
  rating: Nullable<number>,
  numRatings: Nullable<number>,
  shipsFrom: Nullable<string>
): void {
  db.prepare(
    `
    INSERT OR IGNORE INTO sellers
    (seller_id, username, rating, num_ratings, ships_from)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run(sellerId, username, rating, numRatings, shipsFrom);
}
