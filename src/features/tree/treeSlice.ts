import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface TreeState {
  source: string
  bestRootTree: string
  currentTree: string
  tipNames: string[]
  tipHeights: number[]
  tipData: any // is object with tip names as keys for objects with date and group.
  selectedIds: string[]
  highlightedId: null | string
}

const initialState: TreeState = {
  source: '',
  bestRootTree: '',
  currentTree: '',
  tipNames: [],
  tipHeights: [],
  tipData: {},
  selectedIds: [],
  highlightedId: null
};


export const treeSlice = createSlice({
  name: 'tree',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
     // Use the PayloadAction type to declare the contents of `action.payload`
    setSelectedIds: (state, action: PayloadAction<Array<string>>) => {
      state.selectedIds = action.payload;
    },
    setHighlightedId: (state, action: PayloadAction<null|string>) => {
      state.highlightedId = action.payload;
    },
    setSource: (state, action: PayloadAction<string>) => {
      // validate newick?
      state.source = action.payload;
      state.currentTree = state.source;
    },
    setBestFittingRoot: (state, action: PayloadAction<string>) => {
      state.bestRootTree = action.payload;
    },
    setCurrentTree: (state, action: PayloadAction<string>) => {
      state.currentTree = action.payload;
    },
    setTipData: (state, action: PayloadAction<string>) => {
      state.tipData = action.payload;
    }
  },
});

export const { 
  setSelectedIds,
  setHighlightedId,
  setSource,
  setBestFittingRoot,
  setCurrentTree,
  setTipData
} = treeSlice.actions;

// The functions below are called selectors and allow us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectSource = (state: RootState) => state.tree.source;
export const selectTipNames = (state: RootState) => state.tree.tipNames;
export const selectTipHeights = (state: RootState) => state.tree.tipHeights;
export const selectSelectedIds = (state: RootState) => state.tree.selectedIds;
export const selectHighlightedId = (state: RootState) => state.tree.highlightedId;
export const selectBestFittingRoot = (state: RootState) => state.tree.bestRootTree;
export const selectCurrentTree = (state: RootState) => state.tree.currentTree;
export const selectTipData= (state: RootState) => state.tree.tipData;

export default treeSlice.reducer;
