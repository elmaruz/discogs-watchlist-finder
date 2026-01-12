import { discogs } from '../clients/index.js';
import type { DiscogsWantlistResponse } from '../types/discogs.js';
import { handleApiError } from '../utils/errorHandler.js';
import { insertWantlistItem } from '../db/queries/index.js';

export async function fetchWantlist(username: string, userId: number): Promise<void> {
  let page = 1;
  let pages = 1;

  while (page <= pages) {
    try {
      const res = await discogs.get<DiscogsWantlistResponse>(
        `/users/${username}/wants`,
        { params: { page, per_page: 100 } }
      );

      pages = res.data.pagination.pages;

      for (const w of res.data.wants) {
        const r = w.basic_information;
        insertWantlistItem.run(
          r.id,
          userId,
          r.artists?.[0]?.name ?? null,
          r.title,
          r.labels?.[0]?.name ?? null,
          r.labels?.[0]?.catno ?? null,
          r.year ?? null
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
