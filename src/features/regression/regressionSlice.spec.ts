import counterReducer, {
  RegressionState,
} from './regressionSlice';

describe('counter reducer', () => {
  const initialState: RegressionState = {
    data: null,
    bestFittingRootData: { R2: null, RMS: null },
    currentData: null,
    clockSearchData: null,
    mode: null,
    usingBFR: false,
    regressionInputDefaults: {
      format: "yyyy-mm-dd",
      delimiter: "",
      loc: "",
      group: "number"
    }
  };
  it('should handle initial state', () => {
    expect(counterReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

});