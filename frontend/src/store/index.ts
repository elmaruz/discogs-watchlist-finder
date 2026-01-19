import { configureStore } from '@reduxjs/toolkit';
import scrapeReducer from './slices/scrapeSlice';
import queryReducer from './slices/querySlice';

export const store = configureStore({
  reducer: {
    scrape: scrapeReducer,
    query: queryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
