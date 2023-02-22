import { combn, unNest, getGroups, clockSearch, makeGroups } from "./clockSearch"
import { phylotree } from "phylotree"

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
      expect(
        combn([1, 2, 3], 0)
        ).toEqual(
          [ [] ]
          );
    });
  }); 

  describe('Testing combn()', () => {
    test('Edge case - Want all subsets of ["1"] of length 1', () => {
      expect(
        combn([1], 1).sort()
        ).toEqual(
          [ [1] ].sort()
          );
    });
  });

  describe('Testing getUnique()', () => {
    test('Should filter each element to unique values among array', () => {
      var x = unNest([ ['A', 'B', 'C', 'D'], ['B', 'C', 'D'], ['D'] ]).sort();

      expect(
        unNest([ ['A', 'B', 'C', 'D'], ['B', 'C', 'D'], ['D'] ]).sort()
        ).toEqual(
          [ ['A'], ['B', 'C'], ['D'] ].sort()
          );
    });
  });

  describe('Testing makeGroups()', () => {
    test('Should make groups string', () => {
      var x = makeGroups(
        ['A', 'B', 'C', 'D'],
        [ 
          ['A', 'B', 'C', 'D'],
          ['B', 'C', 'D'],
          ['D'] 
        ]
        );
  
      expect(
        x
        ).toEqual(
          [0,1,1,2]
          );
    });
  });
  
  describe('Testing getGroups()', () => {
    test('Want all groups of at least 2 tips with max number 2 clocks', () => {
      // testing functions related to clock search now
      var nwk = '((A:1, B:1):1,((C:1, D:1):1,E:1):1);';
      var tree = new phylotree(nwk);
      //console.log('Tips', tree.getTips().map((e: any ) => e.data.name))
      // Tips [ 'A', 'B', 'E', 'C', 'D' ]

      var expectedGrps = [
       [ ['A', 'B'], ['E', 'C', 'D' ] ],
       [ [ 'A', 'B', 'E'], ['C', 'D' ] ]
      ]
      var grps = getGroups(tree, 2, 2)
      expect(
        grps.map(e => e.map(e => e.sort)).sort()
        ).toEqual(
          expectedGrps.map(e => e.map(e => e.sort)).sort()
        )
    })
  })
  
  describe('Testing getGroups()', () => {
    test('Want all tips when one sub-group selected', () => {
      // testing functions related to clock search now
      var nwk = '((A:1, B:1):1,((C:1, D:1):1,E:1):1);';
      var tree = new phylotree(nwk);

      var expectedGrps = [[[ 'A', 'B', 'C', 'D', 'E' ]]]
      var grps = getGroups(tree, 2, 1)
      expect(
        grps.sort()
        ).toEqual(
          expectedGrps.sort()
        )
    })
  })

  describe('Testing getGroups()', () => {
    test('Higher number of clocks', () => {
      // testing functions related to clock search now
      var nwk = '(((A:1, B:1):1,C:1):1,((D:1, E:1):1,F:1):1);';
      var tree = new phylotree(nwk);
      // console.log('Tips', tree.getTips().map((e: any ) => e.data.name))
      // Tips [ 'C', 'F', 'A', 'B', 'D', 'E' ]

      var expectedGrps = [[
        ['A', 'B'], ['D', 'E'], ['C', 'F'] ,
      ].sort()]

      var grps = getGroups(tree, 2, 3)

      expect(
        grps.sort()
        ).toEqual(
          expectedGrps.sort()
        )
    })
  })

  // describe('Testing getGroups()', () => {
  //   test('Expect error', () => {
  //     // testing functions related to clock search now
  //     var nwk = '(((A:1, B:1):1,C:1):1,((D:1, E:1):1,F:1):1);';
  //     var tree = new phylotree(nwk);
  //     // console.log('Tips', tree.getTips().map((e: any ) => e.data.name))
  //     // Tips [ 'C', 'F', 'A', 'B', 'D', 'E' ]

  //     var expectedGrps = [
  //       [ ['A', 'B'], ['D', 'E'], ['C', 'F'] ],
  //     ]

  //     var grps = 

  //     expect(
  //       getGroups(tree, 2, 5)
  //       ).toThrow(
  //       )
  //   })
  // })

  describe('Testing clockSearch()', () => {
    test('Two Ladder tree - expect regression to output ot match', () => {
      // testing functions related to clock search now
      var nwk = '((A:1,(B:1,(C:1,(D:1, E:2):1):1):1):1,(F:5,(G:5,(H:5,(I:5,J:10):5):5):5):5);'
      var dates = [1, 5, 2, 10, 3, 15, 4, 20, 5, 25];
      var flc = clockSearch(
        nwk,
        2, // min clade size
        2, // max clocks - TODO: test ratio of max clocks and min clock size
        dates,
        "bic" // assume bic for now because it works best
      )
    expect(flc.localClock.length).toEqual(2) // TODO: Will need to compare to R output later
    })
  })