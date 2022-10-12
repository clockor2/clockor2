import treeReducer, {
  TreeState,
} from './treeSlice';

describe('tree reducer', () => {
  const initialState: TreeState = {
    source: '',
    tipNames: [],
    selectedIds: [],
    highlightedId: null,
  };
  it('should handle initial state', () => {
    expect(treeReducer(undefined, { type: 'unknown' })).toEqual({
      source: '',
      tipNames: [],
      selectedIds: [],
      highlightedId: null,
    });
  });

});
