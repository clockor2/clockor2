import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { LocalClockModel } from '../engine/core';

interface RegressionInputDefaults {
  format: "yyyy-mm-dd" | "decimal"
  delimiter: string
  loc: string
  group: string
}

export interface RegressionState {
  data: LocalClockModel | null;
  bestFitData: LocalClockModel | null;
  currentData: LocalClockModel | null;
  clockSearchData: LocalClockModel | null;
  mode: null | "userSelected" | "clockSearch";
  usingBFR: boolean;
  regressionInputDefaults: RegressionInputDefaults
}

const initialState: RegressionState = {
  data: null,
  bestFitData: null,
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

export const regressionSlice = createSlice({
  name: 'regression',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setData: (state, action: PayloadAction<LocalClockModel>) => {
      state.data = action.payload;
      state.currentData = state.data;
    },
    setCurrentData: (state, action: PayloadAction<LocalClockModel>) => {
      state.currentData = action.payload;
    },
    setBestFittingRegression: (state, action: PayloadAction<LocalClockModel>) => {
      state.bestFitData = action.payload;
    },
    setClockSearchData: (state, action: PayloadAction<LocalClockModel>) => {
      state.clockSearchData = action.payload;
    },
    setMode: (state, action: PayloadAction<null | "userSelected" | "clockSearch">) => {
      state.mode = action.payload;
    },
    setUsingBFR: (state, action: PayloadAction<boolean>) => {
      state.usingBFR = action.payload;
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    setRegressionInputDefaults: (state, action: PayloadAction<RegressionInputDefaults>) => {
      state.regressionInputDefaults = action.payload;
    },
  },
});

export const { setData, setRegressionInputDefaults, setCurrentData, setBestFittingRegression, setClockSearchData, setMode, setUsingBFR } = regressionSlice.actions;

// The functions below are called selectors and allow us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectData = (state: RootState) => state.regression.data;
export const selectRegressionInputDefaults = (state: RootState) => state.regression.regressionInputDefaults;
export const selectCurrentData = (state: RootState) => state.regression.currentData;
export const selectBestFitData = (state: RootState) => state.regression.bestFitData;
export const selectClockSearchData = (state: RootState) => state.regression.clockSearchData;
export const selectMode = (state: RootState) => state.regression.mode;
export const selectUsingBFR = (state: RootState) => state.regression.usingBFR;

export default regressionSlice.reducer;
