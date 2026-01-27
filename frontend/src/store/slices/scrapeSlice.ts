import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ScrapeState {
  status: 'idle' | 'loading' | 'running' | 'completed' | 'error';
  progress: { current: number; total: number };
  currentRelease: string;
  currentThumbnail: string | null;
  errors: string[];
}

const initialState: ScrapeState = {
  status: 'idle',
  progress: { current: 0, total: 0 },
  currentRelease: '',
  currentThumbnail: null,
  errors: [],
};

const scrapeSlice = createSlice({
  name: 'scrape',
  initialState,
  reducers: {
    scrapeLoading(state) {
      state.status = 'loading';
      state.progress = { current: 0, total: 0 };
      state.currentRelease = '';
      state.currentThumbnail = null;
      state.errors = [];
    },
    scrapeStarted(state, action: PayloadAction<number>) {
      state.status = 'running';
      state.progress = { current: 0, total: action.payload };
      state.currentRelease = '';
      state.currentThumbnail = null;
      state.errors = [];
    },
    scrapeProgress(
      state,
      action: PayloadAction<{ current: number; total: number; releaseTitle: string; thumbnail: string | null }>
    ) {
      state.progress = {
        current: action.payload.current,
        total: action.payload.total,
      };
      state.currentRelease = action.payload.releaseTitle;
      state.currentThumbnail = action.payload.thumbnail;
    },
    scrapeError(state, action: PayloadAction<string>) {
      state.errors.push(action.payload);
    },
    scrapeFailed(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.errors.push(action.payload);
      state.currentRelease = '';
      state.currentThumbnail = null;
    },
    scrapeCompleted(state) {
      state.status = 'completed';
      state.currentRelease = '';
      state.currentThumbnail = null;
    },
    scrapeReset(state) {
      state.status = 'idle';
      state.progress = { current: 0, total: 0 };
      state.currentRelease = '';
      state.currentThumbnail = null;
      state.errors = [];
    },
    useExistingSnapshot(state, action: PayloadAction<{ releaseCount: number; listingCount: number }>) {
      state.status = 'completed';
      state.progress = { current: action.payload.releaseCount, total: action.payload.releaseCount };
      state.currentRelease = '';
      state.currentThumbnail = null;
      state.errors = [];
    },
  },
});

export const {
  scrapeLoading,
  scrapeStarted,
  scrapeProgress,
  scrapeError,
  scrapeFailed,
  scrapeCompleted,
  scrapeReset,
  useExistingSnapshot,
} = scrapeSlice.actions;

export default scrapeSlice.reducer;
