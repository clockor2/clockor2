import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import {phylotree} from "phylotree"

export interface TreeState {
  source: string
  tipNames: string[]
  selectedIds: string[]
  highlightedId: null | string
}

const initialState: TreeState = {
  source: '',
  tipNames: [],
  selectedIds: [],
  highlightedId: null,
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
      const phylotreeTree = new phylotree(action.payload)
      state.source = action.payload;
      state.tipNames = phylotreeTree.getTips().map((tip: any) => tip.data.name);
    },
  },
});

export const { setSelectedIds, setHighlightedId, setSource } = treeSlice.actions;

// The functions below are called selectors and allow us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectSource = (state: RootState) => state.tree.source;
export const selectTipNames = (state: RootState) => state.tree.tipNames;
export const selectSelectedIds = (state: RootState) => state.tree.selectedIds;
export const selectHighlightedId = (state: RootState) => state.tree.highlightedId;

export default treeSlice.reducer;
