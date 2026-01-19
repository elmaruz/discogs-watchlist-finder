import 'dotenv/config';
import { initSchema, clearSnapshot } from './db/index.js';
import { fetchAndStoreUser } from './services/user.js';
import { fetchWantlist } from './services/wantlist.js';
import { fetchListingsForRelease } from './services/listings.js';
import { getAllWantlistReleases } from './db/queries/index.js';
import { startQueryMode } from './query/index.js';
import { initBrowser, closeBrowser } from './clients/browser.js';

const shouldQuery = process.argv.includes('--query');

initSchema();
clearSnapshot();

const username = process.env.DISCOGS_USERNAME!;
if (!username) throw new Error('Missing DISCOGS_USERNAME');

const userId = await fetchAndStoreUser(username);
await fetchWantlist(username, userId);

const releases = getAllWantlistReleases();

console.log(`🎯 ${releases.length} releases to process\n`);

// Initialize browser before fetching listings
await initBrowser();

try {
  for (let i = 0; i < releases.length; i++) {
    const { release_id } = releases[i];
    await fetchListingsForRelease(release_id);

    process.stdout.write(
      `\r📀 Progress: ${i + 1}/${releases.length} releases done`
    );

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  console.log('\n✅ Snapshot complete');
} finally {
  // Always close browser, even if there's an error
  await closeBrowser();
}

// Launch query mode if --query flag is present
if (shouldQuery) {
  await startQueryMode();
}
