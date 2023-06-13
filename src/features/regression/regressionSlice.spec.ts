import counterReducer, {
  RegressionState,
} from './regressionSlice';

describe('counter reducer', () => {
  const initialState: RegressionState = {
    data: null,
    bestFitData: null,
    currentData: null,
    clockSearchData: null,
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