import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';


export interface  RegressionData {
  x: Array<number>;
  y: Array<number>;
  mode: string;
  text: Array<string>;
  name: string;
  logLik: number; // want to use ?: later
  r2?: number;
  aic?: number;
  aicc?: number;
  bic?: number;
}

export interface RegressionState {
  data: Array<RegressionData>;
  selectedIds: string[],
}

const initialState: RegressionState = {
  data: [],
  selectedIds: [],
};


export const regressionSlice = createSlice({
  name: 'regression',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
     // Use the PayloadAction type to declare the contents of `action.payload`
     setData: (state, action: PayloadAction<Array<RegressionData>>) => {
      state.data = action.payload;
    },
  },
});

export const { setData } = regressionSlice.actions;

// The functions below are called selectors and allow us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectData = (state: RootState) => state.regression.data;
export const selectSelectedIds = (state: RootState) => state.regression.selectedIds;

export default regressionSlice.reducer;
