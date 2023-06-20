import treeReducer, {
  TreeState,
} from './treeSlice';

describe('tree reducer', () => { //TODO: Make test meaningful
  const initialState: TreeState = {
    source: '',
    bestFittingRoot: { R2: null, RSS: null, using: null },
    currentTree: '',
    tipNames: [],
    tipHeights: [],
    selectedIds: [],
    highlightedId: null,
    tipData: {}
  };
  it('should handle initial state', () => {
    expect(treeReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

});
