import axios from 'axios';
import * as v from 'valibot';
import { DiscogsShopApiResponseSchema } from '../types/discogs.js';
import { handleApiError } from '../utils/errorHandler.js';
import { insertSeller, insertListing } from '../db/queries/index.js';

export async function fetchListingsForRelease(
  releaseId: number
): Promise<void> {
  try {
    const res = await axios.get(
      `https://www.discogs.com/api/shop-page-api/sell_item`,
      {
        params: { release: releaseId },
        headers: {
          'User-Agent': 'DiscogsSnapshot/1.0',
        },
      }
    );

    const result = v.safeParse(DiscogsShopApiResponseSchema, res.data);

    if (!result.success) {
      console.error(`❌ Validation Error: Listings for release ${releaseId}`);
      console.error('Parse errors:', v.flatten(result.issues));
      throw new Error(`Failed to parse shop API response`);
    }

    const data = result.output;

    for (const listing of data.items) {
      insertSeller.run(
        listing.seller.uid,
        listing.seller.name,
        listing.seller.rating ?? null,
        listing.seller.ratingCount ?? null,
        listing.seller.shipsFrom ?? null
      );

      insertListing.run(
        listing.itemId,
        releaseId,
        listing.seller.uid,
        listing.price.amount,
        listing.price.currencyCode,
        listing.mediaCondition ?? null,
        listing.sleeveCondition ?? null,
        JSON.stringify(listing.release.genres.map((genre) => genre.name))
      );
    }

    console.log(`✔ Release ${releaseId} - ${data.items.length} listings`);
  } catch (error) {
    handleApiError(error, `Fetching listings for release ${releaseId}`);
    return;
  }
}
