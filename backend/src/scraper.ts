import { initSchema, clearSnapshot } from './db/index.js';
import { fetchAndStoreUser } from './services/user.js';
import { fetchWantlist } from './services/wantlist.js';
import { fetchListingsForRelease } from './services/listings.js';
import { getAllWantlistReleases } from './db/queries/index.js';
import { initBrowser, closeBrowser } from './clients/browser.js';
import type { ScrapeEvent } from '@discogs-wantlist-finder/lib';

export async function runScrape(
  username: string,
  onProgress: (event: ScrapeEvent) => void
): Promise<void> {
  initSchema();
  clearSnapshot();

  const userId = await fetchAndStoreUser(username);
  await fetchWantlist(username, userId);

  const releases = getAllWantlistReleases();
  const totalReleases = releases.length;

  onProgress({ type: 'started', totalReleases });

  await initBrowser();

  try {
    for (let i = 0; i < releases.length; i++) {
      const { release_id } = releases[i];

      try {
        await fetchListingsForRelease(release_id);

        onProgress({
          type: 'progress',
          current: i + 1,
          total: totalReleases,
          releaseTitle: `Release ${release_id}`,
        });
      } catch (error) {
        onProgress({
          type: 'error',
          message: error instanceof Error ? error.message : String(error),
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    onProgress({ type: 'completed' });
  } finally {
    await closeBrowser();
  }
}
