import counterReducer, {
  RegressionState,
} from './regressionSlice';

describe('counter reducer', () => {
  const initialState: RegressionState = {
    data: [],
    selectedIds: [],
  };
  it('should handle initial state', () => {
    expect(counterReducer(undefined, { type: 'unknown' })).toEqual({
      data: [],
      selectedIds: [],
    });
  });

});
