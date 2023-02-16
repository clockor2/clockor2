import counterReducer, {
  RegressionState,
} from './regressionSlice';

describe('counter reducer', () => {
  const initialState: RegressionState = {
    data: null,
    bestFitData: null,
    currentData: null,
    clockSearchData: null,
    selectedIds: [],
    regressionInputDefaults: {
      format: "",
      delimiter: "",
      loc: "",
      group: "number"
    }
  };
  it('should handle initial state', () => {
    expect(counterReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

});