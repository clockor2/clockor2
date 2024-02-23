import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

type NotificationType = "info" | "warning" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType
  read: boolean;
  date: string;
}

export interface NotificationsState {
  notifications: Notification[];

}

const initialState: NotificationsState = {
  notifications: [],
};


export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    addNotification: (state, action: PayloadAction<{title: string, message: string, type: NotificationType}>) => {
      const id = state.notifications.length.toString();
      const notification = {...action.payload, read: false, date: new Date().toISOString(), id};
      state.notifications.push(notification);
    },
    removeNotification: (state, id: PayloadAction<Notification>) => {
      state.notifications = state.notifications.filter( (n) => n.id !== id.payload.id);
    }
  },
});

export const { 
  addNotification,
  removeNotification
} = notificationsSlice.actions;

// The functions below are called selectors and allow us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectNotifications = (state: RootState) => state.notifications.notifications;

export default notificationsSlice.reducer;
