import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import treeReducer from '../features/tree/treeSlice';
import counterReducer from '../features/counter/counterSlice';
import regressionReducer from '../features/regression/regressionSlice';

export const store = configureStore({
  reducer: {
    tree: treeReducer,
    regression: regressionReducer,
    counter: counterReducer, // here for demo only
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
