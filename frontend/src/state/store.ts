import { configureStore } from '@reduxjs/toolkit';
import batchReducer from './batch/batch.reducer';

export const store = configureStore({
  reducer: {
    batch: batchReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
