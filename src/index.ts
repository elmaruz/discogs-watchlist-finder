import 'dotenv/config';
import { initSchema, clearSnapshot } from './db.js';
import { fetchAndStoreUser } from './services/user.js';
import { fetchWantlist } from './services/wantlist.js';
import { fetchListingsForRelease } from './services/listings.js';
import { getAllReleases, initQueries } from './db/queries/index.js';

initSchema();
clearSnapshot();
initQueries();

const username = process.env.DISCOGS_USERNAME!;
if (!username) throw new Error('Missing DISCOGS_USERNAME');

const userId = await fetchAndStoreUser(username);
await fetchWantlist(username, userId);

const releases = getAllReleases.all();

console.log(`🎯 ${releases.length} releases`);

for (const { release_id } of releases) {
  console.log(`📀 Release ${release_id}`);
  await fetchListingsForRelease(release_id);

  await new Promise((resolve) => setTimeout(resolve, 1000));
}

console.log('✅ Snapshot complete');
