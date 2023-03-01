// tests for best fitting root functions
import * as best from './bestFittingRoot';
const phylotree = require("phylotree");

describe('Testing reorderDates()', () => {
  let bestTree = new phylotree.phylotree('((A:1, B:2):1,(C:1, D:2):3);')
  let expDates = [2, 3, 4, 5];
  let testDates = [5, 4, 3, 2];
  let testTips = bestTree.getTips().map((e: any) => e.data.name).reverse();
  let targetTips = bestTree.getTips().map((e: any) => e.data.name);

  test('Should match predefined order', () => {
    expect(
      best.reorderDates(testDates, testTips, targetTips)
      ).toEqual(
        expDates
        )
  });
});

describe('Testing localRoot()', () => {
  test('Approx. equality for 5-tip tree', () => {
    let testTree = new phylotree.phylotree('((A:1, B:2):3,(C:1, D:2):1);') // note swapping of both 1st order branch lengths
    let dates = [2,3,4,5];
    let bl = testTree.getBranchLengths()
    let est: any = best.localRoot(testTree, dates);

    expect(
      est.alpha
      ).toBeCloseTo(
        0.25,
        2
        )
    expect(
      est.r2
      ).toBeCloseTo(
        1,
        2
        );
  });
})

describe('Testing localRoot()', () => {
  test('Approx. equality for 5-tip ladder tree used in globalRootParallel() test', () => {
    let testTree = new phylotree.phylotree('(A:1.5,(B:1,(C:1,(D:1, E:2):1):1):0.5);')
    let dates = [1,2,3,4,5];
    let est: any = best.localRoot(testTree, dates);

    expect(
      est.alpha
      ).toBeCloseTo(
        0.5,
        5
        )
    expect(
      est.r2
      ).toBeCloseTo(
        1,
        2
        );
  });
})

describe('Testing globalRootParallel()', () => {
    test('Ladder tree with 5 tips - branch lengths equal?', () => {

      var bestTree = new phylotree.phylotree('(A:1,(B:1,(C:1,(D:1, E:2):1):1):1);')
      var testTree = new phylotree.phylotree(bestTree.newick_string)
      testTree.reroot(testTree.nodes.descendants()[3])
      testTree.nodes.data.name = 'root';

      var dates = [1,2,3,4,5];
      const estTree = best.globalRootParallel(testTree, dates);

      phylotree.rootToTip(bestTree);
      phylotree.rootToTip(estTree);

      expect(estTree.getNewick()).toEqual(bestTree.getNewick())
      expect(
        estTree.getTips().map((e: any) => e.data.rootToTip)
        ).toEqual(
          bestTree.getTips().map((e: any) => e.data.rootToTip)
          )
    });
  });

  describe('Testing globalRootParallel()', () => {
    test('Ladder tree with 5 tips - newick?', () => {

      var bestTree = new phylotree.phylotree('(A:1,(B:1,(C:1,(D:1, E:2):1):1):1);')
      var testTree = new phylotree.phylotree(bestTree.newick_string)
      testTree.reroot(testTree.nodes.descendants()[3])
      testTree.nodes.data.name = 'root';

      var dates = [1,2,3,4,5];
      const estTree = best.globalRootParallel(testTree, dates);

      phylotree.rootToTip(bestTree);
      phylotree.rootToTip(estTree);

      expect(estTree.getNewick()).toEqual(bestTree.getNewick())
      expect(
        estTree.getTips().map((e: any) => e.data.rootToTip)
        ).toEqual(
          bestTree.getTips().map((e: any) => e.data.rootToTip)
          )
    });
  });

  // TODO: get a good test case from Tempest