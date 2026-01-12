import * as v from 'valibot';
import { discogs } from '../clients/index.js';
import { DiscogsWantlistResponseSchema } from '../types/discogs.js';
import { handleApiError } from '../utils/errorHandler.js';
import { insertWantlistItem } from '../db/queries/index.js';

export async function fetchWantlist(
  username: string,
  userId: number
): Promise<void> {
  let page = 1;
  let pages = 1;

  while (page <= pages) {
    try {
      const res = await discogs.get(`/users/${username}/wants`, {
        params: { page, per_page: 100 },
      });

      const result = v.safeParse(DiscogsWantlistResponseSchema, res.data);

      if (!result.success) {
        console.error(
          `❌ Validation Error: Wantlist for ${username}, page ${page}`
        );
        console.error('Parse errors:', v.flatten(result.issues));
        throw new Error(`Failed to parse wantlist`);
      }

      const data = result.output;
      pages = data.pagination.pages;

      for (const want of data.wants) {
        const release = want.basic_information;
        insertWantlistItem.run(
          release.id,
          userId,
          release.artists?.[0]?.name ?? null,
          release.title,
          release.labels?.[0]?.name ?? null,
          release.labels?.[0]?.catno ?? null,
          release.year ?? null
        );
      }

      console.log(`✔ Wantlist page ${page}/${pages}`);
      page++;
    } catch (error: unknown) {
      handleApiError(error, `Fetching wantlist for user "${username}"`, {
        throwOnNon404: true,
      });
      return;
    }
  }
}
