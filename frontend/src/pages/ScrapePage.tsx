import ScrapeControls from '../components/scrape/ScrapeControls';

function ScrapePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Scrape Wantlist</h2>
        <p className="mt-1 text-gray-400">
          Enter your Discogs username to fetch your wantlist and available
          listings.
        </p>
      </div>
      <ScrapeControls />
    </div>
  );
}

export default ScrapePage;
