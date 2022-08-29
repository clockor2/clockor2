import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';


export interface TreeState {
  source: string;
  selectedIds: string[],
}

const initialState: TreeState = {
  source: '',
  selectedIds: [],
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
  },
});

export const { setSelectedIds } = treeSlice.actions;

// The functions below are called selectors and allow us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectSource = (state: RootState) => state.tree.source;
export const selectSelectedIds = (state: RootState) => state.tree.selectedIds;

export default treeSlice.reducer;
