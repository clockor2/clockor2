import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import treeReducer from '../features/tree/treeSlice';
import regressionReducer from '../features/regression/regressionSlice';

export const store = configureStore({
  reducer: {
    tree: treeReducer,
    regression: regressionReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
