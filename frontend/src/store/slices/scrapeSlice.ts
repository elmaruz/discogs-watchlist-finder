import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ScrapeState {
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: { current: number; total: number };
  currentRelease: string;
  errors: string[];
}

const initialState: ScrapeState = {
  status: 'idle',
  progress: { current: 0, total: 0 },
  currentRelease: '',
  errors: [],
};

const scrapeSlice = createSlice({
  name: 'scrape',
  initialState,
  reducers: {
    scrapeStarted(state, action: PayloadAction<number>) {
      state.status = 'running';
      state.progress = { current: 0, total: action.payload };
      state.currentRelease = '';
      state.errors = [];
    },
    scrapeProgress(
      state,
      action: PayloadAction<{ current: number; total: number; releaseTitle: string }>
    ) {
      state.progress = {
        current: action.payload.current,
        total: action.payload.total,
      };
      state.currentRelease = action.payload.releaseTitle;
    },
    scrapeError(state, action: PayloadAction<string>) {
      state.errors.push(action.payload);
    },
    scrapeFailed(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.errors.push(action.payload);
      state.currentRelease = '';
    },
    scrapeCompleted(state) {
      state.status = 'completed';
      state.currentRelease = '';
    },
    scrapeReset(state) {
      state.status = 'idle';
      state.progress = { current: 0, total: 0 };
      state.currentRelease = '';
      state.errors = [];
    },
    useExistingSnapshot(state, action: PayloadAction<{ releaseCount: number; listingCount: number }>) {
      state.status = 'completed';
      state.progress = { current: action.payload.releaseCount, total: action.payload.releaseCount };
      state.currentRelease = '';
      state.errors = [];
    },
  },
});

export const {
  scrapeStarted,
  scrapeProgress,
  scrapeError,
  scrapeFailed,
  scrapeCompleted,
  scrapeReset,
  useExistingSnapshot,
} = scrapeSlice.actions;

export default scrapeSlice.reducer;
