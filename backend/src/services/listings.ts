import { DiscogsShopApiResponseSchema } from '../types/discogs.js';
import { handleApiError } from '../utils/errorHandler.js';
import { insertSeller, insertListing } from '../db/queries/index.js';
import { validate } from '../utils/validation.js';
import { fetchWithBrowser } from '../clients/browser.js';

const PAGE_SIZE = 50;

export async function fetchListingsForRelease(
  releaseId: number
): Promise<void> {
  let offset = 0;
  let totalCount = 0;

  do {
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const url = `https://www.discogs.com/api/shop-page-api/sell_item?release=${releaseId}&offset=${offset}`;
        const responseData = await fetchWithBrowser(url);

        const data = validate(
          DiscogsShopApiResponseSchema,
          responseData,
          `Listings for release ${releaseId}, offset ${offset}`
        );

        totalCount = data.totalCount;

        for (const listing of data.items) {
          insertSeller(
            listing.seller.uid,
            listing.seller.name,
            listing.seller.rating ?? null,
            listing.seller.ratingCount ?? null,
            listing.seller.shipsFrom ?? null
          );

          insertListing(
            listing.itemId,
            releaseId,
            listing.seller.uid,
            listing.price.amount,
            listing.price.currencyCode,
            listing.mediaCondition ?? null,
            listing.sleeveCondition ?? null,
            JSON.stringify(listing.release.genres.map((genre) => genre.name)),
            JSON.stringify(listing.release.formatNames)
          );
        }

        offset += PAGE_SIZE;

        if (offset < totalCount) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        break; // Success, exit retry loop
      } catch (error: any) {
        retries++;

        if (error.message?.includes('Cloudflare challenge not resolved')) {
          if (retries < maxRetries) {
            // Exponential backoff with random jitter (0.5-1s, 1-1.5s, 1.5-2s)
            const baseDelay = 500 * retries;
            const jitter = Math.random() * 500;
            const delay = baseDelay + jitter;

            console.log(`\n⚠️  Cloudflare challenge failed, retrying (${retries}/${maxRetries}) in ${Math.round(delay/1000)}s...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        // If not Cloudflare error or max retries reached, handle normally
        handleApiError(error, `Fetching listings for release ${releaseId}`);
        return;
      }
    }
  } while (offset < totalCount);
}
