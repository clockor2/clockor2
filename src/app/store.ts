import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import treeReducer from '../features/tree/treeSlice';
import regressionReducer from '../features/regression/regressionSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

export const store = configureStore({
  reducer: {
    tree: treeReducer,
    regression: regressionReducer,
    notifications: notificationsReducer,
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
