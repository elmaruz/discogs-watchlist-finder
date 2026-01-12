export * from './users.js';
export * from './wantlist.js';
export * from './sellers.js';
export * from './listings.js';

import { initUserQueries } from './users.js';
import { initWantlistQueries } from './wantlist.js';
import { initSellerQueries } from './sellers.js';
import { initListingQueries } from './listings.js';

export function initQueries() {
  initUserQueries();
  initWantlistQueries();
  initSellerQueries();
  initListingQueries();
}
