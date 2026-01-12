import axios from 'axios';
import { DiscogsShopApiResponseSchema } from '../types/discogs.js';
import { handleApiError } from '../utils/errorHandler.js';
import { insertSeller, insertListing } from '../db/queries/index.js';
import { validate } from '../utils/validation.js';

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

    const data = validate(
      DiscogsShopApiResponseSchema,
      res.data,
      `Listings for release ${releaseId}`
    );

    for (const listing of data.items) {
      insertSeller.run(
        listing.seller.uid,
        listing.seller.name,
        listing.seller.rating,
        listing.seller.ratingCount,
        listing.seller.shipsFrom
      );

      insertListing.run(
        listing.itemId,
        releaseId,
        listing.seller.uid,
        listing.price.amount,
        listing.price.currencyCode,
        listing.mediaCondition,
        listing.sleeveCondition,
        JSON.stringify(listing.release.genres.map((genre) => genre.name))
      );
    }

    console.log(`✔ Release ${releaseId} - ${data.items.length} listings`);
  } catch (error) {
    handleApiError(error, `Fetching listings for release ${releaseId}`);
    return;
  }
}
