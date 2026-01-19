import { db } from '../index.js';
import type { Nullable } from '../../types/database.js';

export function insertListing(
  listingId: number,
  releaseId: number,
  sellerId: number,
  price: number,
  currency: string,
  condition: Nullable<string>,
  sleeveCondition: Nullable<string>,
  genres: string,
  formatNames: string
): void {
  db.prepare(
    `
    INSERT OR IGNORE INTO listings
    (listing_id, release_id, seller_id, price, currency, condition, sleeve_condition, genres, format_names)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    listingId,
    releaseId,
    sellerId,
    price,
    currency,
    condition,
    sleeveCondition,
    genres,
    formatNames
  );
}
