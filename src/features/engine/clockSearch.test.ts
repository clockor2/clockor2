import { combn, unNestGroups, getGroups, clockSearch } from "./clockSearch"
import { phylotree } from "phylotree"
import { mkdirSync } from "fs";
// Clock search functions below
describe('Testing combn()', () => {
    test('Want all subsets of [1, 2, 3] of length 2', () => {
      expect(
        combn([1, 2, 3], 2).sort()
        ).toEqual(
          [ [1, 2], [1, 3], [2, 3] ].sort()
          );
    });
  }); 

  describe('Testing combn()', () => {
    test('Case when 0 groups selected', () => {
      console.log('Combn Test', combn([1, 2, 3], 0))
      expect(
        combn([1, 2, 3], 0)
        ).toEqual(
          [ [] ]
          );
    });
  }); 

  describe('Testing combn()', () => {
    test('Edge case - Want all subsets of ["a"] of length 2', () => {
      expect(
        combn(['a'], 1).sort()
        ).toEqual(
          [ ['a'] ].sort()
          );
    });
  });
  
  describe('Testing getUnique()', () => {
    test('Should filter each element to unique values among array', () => {
      var x = unNestGroups([ ['A', 'B', 'C', 'D'], ['B', 'C', 'D'], ['D'] ]).sort();
  
      expect(
        unNestGroups([ ['A', 'B', 'C', 'D'], ['B', 'C', 'D'], ['D'] ]).sort()
        ).toEqual(
          [ ['A'], ['B', 'C'], ['D'] ].sort()
          );
    });
  });
  
  describe('Testing getGroups()', () => {
    test('Want all groups of at least 2 tips with max number 4', () => {
      // testing functions related to clock search now
      var nwk = '((A:1, B:1):1,((C:1, D:1):1,E:1):1);';
      var tree = new phylotree(nwk);
      var expectedGrps = [
        [ [ 'A', 'B'], [ 'C', 'D', 'E' ] ],
        [ [ 'C', 'D', 'E' ], [ 'A', 'B' ] ].sort(), // TODO. Deal with suplication issue later
        [ [ 'A', 'B', 'E' ], [ 'C', 'D' ] ]
      ]
      // testing 4 clocks max - more than possible but testing bahviour
      var grps = getGroups(tree, 2, 2)
  console.log(expectedGrps)
      expect(
        grps.sort()
        ).toEqual(
          expectedGrps.sort()
        )
    })
  })
  
  describe('Testing getGroups()', () => {
    test('Want array of zeros when we select only one subgroup', () => {
      // testing functions related to clock search now
      var nwk = '((A:1, B:1):1,((C:1, D:1):1,E:1):1);';
      var tree = new phylotree(nwk);
      var expectedGrps = [
        [ [ 'A', 'B', 'C', 'D', 'E' ] ]
      ]

      var grps = getGroups(tree, 2, 1)

      expect(
        grps.sort()
        ).toEqual(
          expectedGrps.sort()
        )
    })
  })
  //TODO: Test edge case where more clocks than possible asked for in clock search
  // TODO: Test group to num?

  describe('Testing clockSearch()', () => {
    test('Two Ladder tree - expect regression to output ot match', () => {
      // testing functions related to clock search now
      var nwk = '((A:1,(B:1,(C:1,(D:1, E:2):1):1):1):1,(F:5,(G:5,(H:5,(I:5,J:10):5):5):5):5);'
      var tree = new phylotree(nwk)
      var dates = [1, 5, 2, 10, 3, 15, 4, 20, 5, 25];
      var flc = clockSearch(
        nwk,
        2, // min clade size
        2, // max clocks - TODO: test ratio of max clocks and min clock size
        dates,
        "bic" // assume bic for now because it works best
      )
    console.log(flc.localClock.map((e:any) => e.tip))
    expect(flc.localClock.length).toEqual(2) // TODO: Will need to compare to R output later
    })
  })