import * as core from "./core";
const phylotree = require("phylotree");

describe('Testing normalDensity()', () => {
  test('density value should match', () => {
    var d = core.normalDensity(0, 0, 1)
    expect(d).toEqual(1 / (Math.sqrt(2 * Math.PI)))
  });
});

// test based on lm(y~x) in R, where x = 0:5, y = c(1, 0, 3, 2, 5, 4) 
var dummyX = [0, 1, 2, 3, 4, 5];
var dummyY = [1, 0, 3, 2, 5, 4];
var dummyTip = dummyX.map(e => `t${e}`);
var m = core.linearRegression({ x: dummyX, y: dummyY, tip: dummyTip });

// test regresion: R2, slope, intercept, logLik (critical)
describe('Testing linearRegression()', () => {
  test('Dummy data perfect fit - metrics should match', () => {
    expect(m.r2).toBeCloseTo(0.6865, 4);
    expect(m.intercept).toBeCloseTo(0.4286, 4);
    expect(m.slope).toBeCloseTo(0.8286, 4);
    expect(m.logLik).toBeCloseTo(-8.244795, 6);
  });
});

describe('Testing IC() ', () => {
  test('Value Equality should match', () => {
    expect(core.AIC([m])).toBeCloseTo(22.48959, 5);
    expect(core.AICc([m])).toBeCloseTo(34.48959, 5);
    expect(core.BIC([m])).toBeCloseTo(21.86487, 5);
  });
});

// Clock search functions below
describe('combn()', () => {
  test('Want all subsets of [1, 2, 3] of length 2', () => {
    expect(
      core.combn([1, 2, 3], 2).sort()
      ).toEqual(
        [ [1, 2], [1, 3], [2, 3] ].sort()
        );
  });
}); 

describe('Testing combn()', () => {
  test('Edge case - Want all subsets of ["a"] of length 2', () => {
    expect(
      core.combn(['a'], 1).sort()
      ).toEqual(
        [ ['a'] ].sort()
        );
  });
});

describe('getUnique()', () => {
  test('Should filter each element to unique values among array', () => {
    var x = core.getUnique([ ['A', 'B', 'C', 'D'], ['B', 'C', 'D'], ['D'] ]).sort();

    expect(
      core.getUnique([ ['A', 'B', 'C', 'D'], ['B', 'C', 'D'], ['D'] ]).sort()
      ).toEqual(
        [ ['A'], ['B', 'C'], ['D'] ].sort()
        );
  });
});

describe('Testing getGroups()', () => {
  test('Want all groups of at least 2 tips with max number 4', () => {
    // testing functions related to clock search now
    var nwk = '((A:1, B:1):1,((C:1, D:1):1,E:1):1);';
    var tree = new phylotree.phylotree(nwk);
    var expectedGrps = [
      [ [ 'A', 'B'], [ 'C', 'D', 'E' ] ],
      [ [ 'C', 'D', 'E' ], [ 'A', 'B' ] ],
      [ [ 'A', 'B', 'E' ], [ 'C', 'D' ] ]
    ]
    // testing 4 clocks max - more than possible but testing bahviour
    var grps = core.getGroups(tree, 2, 2)

    expect(
      grps.sort()
      ).toEqual(
        expectedGrps.sort()
      )
  })
})

//TODO: Test edge case where more clocks than possible asked for in clock search
