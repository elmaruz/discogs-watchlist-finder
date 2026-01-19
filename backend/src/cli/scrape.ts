import 'dotenv/config';
import { runScrape } from '../scraper.js';
import type { ScrapeEvent } from '@discogs-wantlist-finder/lib';

const username = process.env.DISCOGS_USERNAME;
if (!username) {
  console.error('Missing DISCOGS_USERNAME environment variable');
  process.exit(1);
}

function handleProgress(event: ScrapeEvent): void {
  switch (event.type) {
    case 'started':
      console.log(`🎯 ${event.totalReleases} releases to process\n`);
      break;
    case 'progress':
      process.stdout.write(
        `\r📀 Progress: ${event.current}/${event.total} releases done`
      );
      break;
    case 'error':
      console.error(`\n❌ Error: ${event.message}`);
      break;
    case 'completed':
      console.log('\n✅ Snapshot complete');
      break;
  }
}

runScrape(username, handleProgress).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
