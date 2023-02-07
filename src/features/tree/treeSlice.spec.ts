import treeReducer, {
  TreeState,
} from './treeSlice';

describe('tree reducer', () => { //TODO: Make test meaningful
  const initialState: TreeState = {
    source: '',
    bestRootTree: '',
    currentTree: '',
    tipNames: [],
    tipHeights: [],
    selectedIds: [],
    highlightedId: null,
  };
  it('should handle initial state', () => {
    expect(treeReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

});
