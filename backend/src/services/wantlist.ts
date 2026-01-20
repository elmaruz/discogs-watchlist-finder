import { discogs } from '../clients/index.js';
import { DiscogsWantlistResponseSchema } from '../types/discogs.js';
import { insertRelease, insertWantlistItem } from '../db/queries/index.js';
import { validate } from '../utils/validation.js';

export async function fetchWantlist(
  username: string,
  userId: number
): Promise<void> {
  let page = 1;
  let pages = 1;

  while (page <= pages) {
    const res = await discogs.get(`/users/${username}/wants`, {
      params: { page, per_page: 100 },
    });

    const wantlist = validate(
      DiscogsWantlistResponseSchema,
      res.data,
      `Wantlist for ${username}, page ${page}`
    );
    pages = wantlist.pagination.pages;

    for (const want of wantlist.wants) {
      const release = want.basic_information;

      insertRelease(
        release.id,
        release.title,
        JSON.stringify(release.artists?.map((artist) => artist.name)),
        JSON.stringify(release.labels?.map((label) => label.name)),
        JSON.stringify(release.labels?.map((label) => label.catno)),
        release.year ?? null
      );

      insertWantlistItem(userId, release.id);
    }

    console.log(`✔ Wantlist page ${page}/${pages}`);
    page++;
  }
}
