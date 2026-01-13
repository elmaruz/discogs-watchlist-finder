import axios from 'axios';
import { DiscogsShopApiResponseSchema } from '../types/discogs.js';
import { handleApiError } from '../utils/errorHandler.js';
import { insertSeller, insertListing } from '../db/queries/index.js';
import { validate } from '../utils/validation.js';

const PAGE_SIZE = 50;

export async function fetchListingsForRelease(
  releaseId: number
): Promise<void> {
  let offset = 0;
  let totalCount = 0;

  do {
    try {
      const res = await axios.get(
        `https://www.discogs.com/api/shop-page-api/sell_item`,
        {
          params: {
            release: releaseId,
            offset: offset,
          },
          headers: {
            'User-Agent': 'DiscogsSnapshot/1.0',
          },
        }
      );

      const data = validate(
        DiscogsShopApiResponseSchema,
        res.data,
        `Listings for release ${releaseId}, offset ${offset}`
      );

      totalCount = data.totalCount;

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

      offset += PAGE_SIZE;

      if (offset < totalCount) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      handleApiError(error, `Fetching listings for release ${releaseId}`);
      return;
    }
  } while (offset < totalCount);
}
