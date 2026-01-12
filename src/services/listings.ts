import axios from 'axios';
import { DiscogsShopApiResponse } from '../types/discogs.js';
import { handleApiError } from '../utils/errorHandler.js';
import { insertSeller, insertListing } from '../db/queries/index.js';

export async function fetchListingsForRelease(
  releaseId: number
): Promise<void> {
  try {
    const res = await axios.get<DiscogsShopApiResponse>(
      `https://www.discogs.com/api/shop-page-api/sell_item`,
      {
        params: { release: releaseId },
        headers: {
          'User-Agent': 'DiscogsSnapshot/1.0',
        },
      }
    );

    for (const l of res.data.items) {
      insertSeller.run(
        l.seller.uid,
        l.seller.name,
        l.seller.rating ?? null,
        l.seller.ratingCount ?? null,
        l.seller.shipsFrom ?? null
      );

      insertListing.run(
        l.itemId,
        releaseId,
        l.seller.uid,
        l.price.amount,
        l.price.currencyCode,
        l.mediaCondition ?? null,
        l.sleeveCondition ?? null,
        l.release.genres
          ? JSON.stringify(l.release.genres.map((genre) => genre.name))
          : null
      );
    }

    console.log(`✔ Release ${releaseId} - ${res.data.items.length} listings`);
  } catch (error: unknown) {
    handleApiError(error, `Fetching listings for release ${releaseId}`);
    return;
  }
}
