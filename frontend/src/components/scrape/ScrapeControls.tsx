import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector, useSSE } from '../../hooks';
import {
  scrapeLoading,
  scrapeStarted,
  scrapeProgress,
  scrapeError,
  scrapeFailed,
  scrapeCompleted,
  scrapeReset,
  useExistingSnapshot,
} from '../../store/slices/scrapeSlice';
import type { ScrapeEvent, NullableSnapshotInfo } from '@discogs-wantlist-finder/lib';

function ScrapeControls() {
  const [username, setUsername] = useState('');
  const [snapshotInfo, setSnapshotInfo] = useState<NullableSnapshotInfo>(null);
  const dispatch = useAppDispatch();
  const { status, progress, currentRelease, currentThumbnail, errors } = useAppSelector(
    (state) => state.scrape
  );
  const { startStream, stopStream } = useSSE<ScrapeEvent>();

  useEffect(() => {
    fetch('/api/snapshot')
      .then((res) => res.json())
      .then((info: NullableSnapshotInfo) => setSnapshotInfo(info))
      .catch(() => setSnapshotInfo(null));
  }, []);

  const handleUseExisting = () => {
    if (snapshotInfo) {
      dispatch(useExistingSnapshot({
        releaseCount: snapshotInfo.releaseCount,
        listingCount: snapshotInfo.listingCount,
      }));
    }
  };

  const handleStart = () => {
    if (!username.trim()) return;

    dispatch(scrapeLoading());

    startStream(
      '/api/scrape',
      { username: username.trim() },
      {
        onMessage: (event) => {
          switch (event.type) {
            case 'started':
              dispatch(scrapeStarted(event.totalReleases));
              break;
            case 'progress':
              // Preload next thumbnail so it's ready when needed
              if (event.nextThumbnail) {
                const img = new Image();
                img.src = event.nextThumbnail;
              }
              dispatch(
                scrapeProgress({
                  current: event.current,
                  total: event.total,
                  releaseTitle: event.releaseTitle,
                  thumbnail: event.thumbnail,
                })
              );
              break;
            case 'error':
              if (event.fatal) {
                dispatch(scrapeFailed(event.message));
              } else {
                dispatch(scrapeError(event.message));
              }
              break;
            case 'completed':
              dispatch(scrapeCompleted());
              break;
          }
        },
        onError: (error) => {
          dispatch(scrapeFailed(error.message));
        },
      }
    );
  };

  const handleStop = () => {
    stopStream();
    dispatch(scrapeReset());
  };

  const progressPercent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Discogs username"
          disabled={status === 'loading' || status === 'running'}
          className="flex-1 rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />
        {status === 'loading' || status === 'running' ? (
          <button
            onClick={handleStop}
            className="rounded-md bg-red-600 px-6 py-2 font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={!username.trim()}
            className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Scrape
          </button>
        )}
      </div>

      {status === 'idle' && snapshotInfo && (
        <div className="rounded-md border border-gray-700 bg-gray-800/50 p-4">
          <p className="text-sm text-gray-300">
            Existing snapshot found for <span className="font-medium text-white">{snapshotInfo.username}</span>
            {' '}with {snapshotInfo.releaseCount} releases and {snapshotInfo.listingCount} listings.
          </p>
          <button
            onClick={handleUseExisting}
            className="mt-3 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Use Existing Snapshot
          </button>
        </div>
      )}

      {status !== 'idle' && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-400">
            <span>
              {status === 'loading' && 'Loading...'}
              {status === 'running' && 'Scraping...'}
              {status === 'completed' && 'Completed!'}
              {status === 'error' && 'Error occurred'}
            </span>
            <span>
              {progress.current} / {progress.total} releases
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-700">
            <div
              className={`h-full transition-all duration-300 ${
                status === 'completed'
                  ? 'bg-green-500'
                  : status === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {currentRelease && (
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 flex-shrink-0 rounded bg-gray-700">
                {currentThumbnail && (
                  <img
                    src={currentThumbnail}
                    alt=""
                    className="h-16 w-16 rounded object-cover"
                  />
                )}
              </div>
              <p className="text-sm text-gray-400 truncate flex-1">
                Current: {currentRelease}
              </p>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-4 rounded-md border border-red-800 bg-red-900/20 p-4">
              <h3 className="font-medium text-red-400">
                Errors ({errors.length})
              </h3>
              <ul className="mt-2 max-h-32 overflow-y-auto text-sm text-red-300">
                {errors.map((error, i) => (
                  <li key={i} className="truncate">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ScrapeControls;
