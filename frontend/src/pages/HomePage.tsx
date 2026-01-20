import { useAppSelector, useAppDispatch } from '../hooks';
import { scrapeReset } from '../store/slices/scrapeSlice';
import { clearMessages } from '../store/slices/querySlice';
import ScrapeControls from '../components/scrape/ScrapeControls';
import ChatInterface from '../components/query/ChatInterface';

function HomePage() {
  const dispatch = useAppDispatch();
  const scrapeStatus = useAppSelector((state) => state.scrape.status);
  const showChat = scrapeStatus === 'completed';

  const handleNewScrape = () => {
    dispatch(scrapeReset());
    dispatch(clearMessages());
  };

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Scrape Wantlist</h2>
            <p className="mt-1 text-sm text-gray-400">
              Enter your Discogs username to fetch your wantlist and available listings.
            </p>
          </div>
          {showChat && (
            <button
              onClick={handleNewScrape}
              className="rounded-md border border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-300 hover:bg-gray-700"
            >
              New Scrape
            </button>
          )}
        </div>
        <ScrapeControls />
      </section>

      {showChat && (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">Query Your Data</h2>
            <p className="mt-1 text-sm text-gray-400">
              Ask questions about your wantlist in natural language.
            </p>
          </div>
          <ChatInterface />
        </section>
      )}
    </div>
  );
}

export default HomePage;
