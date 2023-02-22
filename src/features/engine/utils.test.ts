import { phylotree } from "phylotree"
import { getTipHeights, getTipNames } from "./utils"

describe('Testing getTipHeights()', () => {
    test('Expect Tip heights for 3-tip tree', () => {
        var nwk = '((A:1,B:1):1,C:1):1;'
        var tree = new phylotree(nwk)

        var r2t = tree.getRootNode().data.r2t;
        console.log('Get toot node test', tree.getRootNode().data)
        console.log('R2t Test', r2t)

      expect(
        getTipHeights(tree)
        ).toEqual(
          [1, 2, 2]
          );
    });
  }); 

  describe('Testing getTipNames()', () => {
    test('Expect Tip names for 3-tip tree', () => {
        var nwk = '((A:1,B:1):1,C:1)'
        var tree = new phylotree(nwk)

      expect(
        getTipNames(tree).sort()
        ).toEqual(
          ['A', 'B', 'C'].sort()
          );
    });
  }); 