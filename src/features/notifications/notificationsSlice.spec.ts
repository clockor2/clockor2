import notificationsReducer, {
  NotificationsState,
} from './notificationsSlice';

describe('tree reducer', () => { //TODO: Make test meaningful
  const initialState: NotificationsState = {
    notifications: [],
  };
  it('should handle initial state', () => {
    expect(notificationsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

});
