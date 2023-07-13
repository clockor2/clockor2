import { localRootR2, localRootRMS, rerootAndScale, spliceIntoChunks, sumProduct, bfrPropRMS } from './bestFittingRoot';
import { Tree, readNewick, writeNewick } from 'phylojs';
import { decimal_date } from './utils';
import { readFileSync } from 'fs';
import { extractPartOfTipName } from './utils';

describe('MOCK globalRootParallel()', () => {

  test('Finds bfr R2 for empirical tree', () => {
    const nwk = readFileSync("src/features/engine/empiricalTestTree.nwk").toString();
    const tree = readNewick(nwk);

    var tr: Tree; // dummy to iterate over
    var tipNames = tree.getTipLabels()
    var decimal_dates = tipNames.map((name: string) => {
      let date = extractPartOfTipName(name, "_", "-1")
      return decimal_date(date, "yyyy-mm-dd")
    })
    var groupings = tipNames.map(e => 0)

    let tipDataArr = tipNames.map(
      (e: string, i: number) => {
        return [
          e,
          { date: decimal_dates[i], group: groupings[i] }
        ]
      }
    )
    let tipData = Object.fromEntries(tipDataArr)

    var nodes = tree.getNodeList()
    var primes: any[] = [];

    for (let n of nodes) {
      tr = readNewick(nwk)
      if (n.id !== 0) tr.reroot(n)
      var tipNames = tr.getTipLabels()
      var decimal_dates = tipNames.map((name: string) => {
        let date = extractPartOfTipName(name, "_", "-1")
        return decimal_date(date, "yyyy-mm-dd")
      })

      primes.push(localRootR2(tr, tipData))
    }


    expect(Math.max(...primes.map(e => e.value))).toBeCloseTo(0.173, 4)

  });
})

describe('rerootAndScale()', () => {
  test('Length conserved rerooting on each node of 5-tip tree', () => {
    let tree = readNewick('((A:1, B:2):3,(C:1, D:2):1);')

    var l1 = [];
    var l2 = [];
    for (let i of [1, 2, 3, 4, 5, 6]) { // nodes 2,...,(2nTip-1)

      let best = {
        alpha: 0.25, // arbitrarily
        r2: 0.5, // dummy value
        nodeIndx: i
      }

      let bestTree = readNewick(writeNewick(tree))
      rerootAndScale(bestTree, best)

      l1.push(tree.getTotalBranchLength())
      l2.push(bestTree.getTotalBranchLength())
    }

    // length equality for all rerootings
    expect(JSON.stringify(l1)).toMatch(JSON.stringify(l2))

  });
})

describe('localRootR2()', () => {
    test('Basal branches of 5-tip tree', () => {
      let testTree = readNewick('((A:1, B:2):3,(C:1, D:2):1);') // note swapping of both 1st order branch lengths
      let tipData = {
        A: {
          date: 2
        },
        B: {
          date: 3
        },
        C: {
          date: 4
        },
        D: {
          date: 5
        }
      }
      let est: any = localRootR2(testTree, tipData);
  
      expect(est.alpha).toBeCloseTo(0.25, 2)
      expect(est.value).toBeCloseTo(1, 2);
    });
  
    test('Testing for 3-tip tree', () => {
      const nwk = '((A_2001:0.5,B_2009:1):1,C_2002:1.75):0;'
  
      let tree = readNewick(nwk)
      let tipData = {
        C_2002: {
          "date": 2002
        },
        A_2001: {
          "date": 2001
        },
        B_2009: {
          "date": 2009
        }
      };
  
      let obj = localRootR2(
        tree,
        tipData
      )
  
      expect(obj.value).toBeCloseTo(1.0)
  
    });

    test('Alpha defined for all reroots using empirical tree', () => {
      const nwk = readFileSync("src/features/engine/empiricalTestTree.nwk").toString();
      const tree = readNewick(nwk);
  
      var tr: Tree; // dummy to iterate over
      var tipNames = tree.getTipLabels()
      var decimal_dates = tipNames.map((name: string) => {
        let date = extractPartOfTipName(name, "_", "-1")
        return decimal_date(date, "yyyy-mm-dd")
      })
      var groupings = tipNames.map(e => 0)
  
      let tipDataArr = tipNames.map(
        (e: string, i: number) => {
          return [
            e,
            { date: decimal_dates[i], group: groupings[i] }
          ]
        }
      )
      let tipData = Object.fromEntries(tipDataArr)
  
      var nodes = tree.getNodeList()
      var primes: any[] = [];
  
      for (let n of nodes) {
        tr = readNewick(nwk)
        if (n.id !== 0) tr.reroot(n)
        var tipNames = tr.getTipLabels()
        var decimal_dates = tipNames.map((name: string) => {
          let date = extractPartOfTipName(name, "_", "-1")
          return decimal_date(date, "yyyy-mm-dd")
        })
  
        primes.push(localRootR2(tr, tipData))
      }
  
      expect(primes.map(e => e.alpha).filter(e => isNaN(e)).length).toEqual(0)
  
    });
})


describe('localRootRMS()', () => {
  test('Basal branches of 5-tip tree', () => {
    let testTree = readNewick('((A:1, B:2):3,(C:1, D:2):1);') // note swapping of both 1st order branch lengths
    let tipData = {
      A: {
        date: 2
      },
      B: {
        date: 3
      },
      C: {
        date: 4
      },
      D: {
        date: 5
      }
    }
    let est: any = localRootRMS(testTree, tipData);

    expect(est.alpha).toBeCloseTo(0.25, 2)
    expect(est.value).toBeCloseTo(0, 2);
  });

  test('Testing for 3-tip tree', () => {
    const nwk = '((A_2001:0.5,B_2009:1):1,C_2002:1.75):0;'

    let tree = readNewick(nwk)
    let tipData = {
      C_2002: {
        "date": 2002
      },
      A_2001: {
        "date": 2001
      },
      B_2009: {
        "date": 2009
      }
    };

    let obj = localRootRMS(
      tree,
      tipData
    )
    
    expect(obj.method).toBe("RMS")
    expect(obj.value).toBeDefined()

  });

  test('Alpha defined for all reroots using empirical tree', () => {
    const nwk = readFileSync("src/features/engine/empiricalTestTree.nwk").toString();
    const tree = readNewick(nwk);

    var tr: Tree; // dummy to iterate over
    var tipNames = tree.getTipLabels()
    var decimal_dates = tipNames.map((name: string) => {
      let date = extractPartOfTipName(name, "_", "-1")
      return decimal_date(date, "yyyy-mm-dd")
    })
    var groupings = tipNames.map(e => 0)

    let tipDataArr = tipNames.map(
      (e: string, i: number) => {
        return [
          e,
          { date: decimal_dates[i], group: groupings[i] }
        ]
      }
    )
    let tipData = Object.fromEntries(tipDataArr)

    var nodes = tree.getNodeList()
    var primes: any[] = [];

    for (let n of nodes) {
      tr = readNewick(nwk)
      if (n.id !== 0) tr.reroot(n)
      var tipNames = tr.getTipLabels()
      var decimal_dates = tipNames.map((name: string) => {
        let date = extractPartOfTipName(name, "_", "-1")
        return decimal_date(date, "yyyy-mm-dd")
      })

      primes.push(localRootR2(tr, tipData))
    }

    expect(primes.map(e => e.alpha).filter(e => isNaN(e)).length).toEqual(0)

  });
})

describe('spliceIntoChunks()', () => {
  test('All elements preserved', () => {
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    let x = spliceIntoChunks(arr, 3);

    expect(
      x
    ).toEqual(
      [
        [1, 2, 3], [4, 5, 6], [7, 8, 9]
      ]
    )
  });
})


describe('bfrProp()', () => {
  test('Dummy data from R', () => {
    const y = [1.907682, 1.239931, 1.55684, 0.9825374, 0.9554158, 2.443466, 2.567408, 1.105498, 1.282354, 1.345682];
    const t = [12.863594, 9.626995,  9.289591, 12.064168, 12.535129,  9.670782,  9.162467, 8.588300, 10.757885,  9.48504];
    const c = [1, 1, 0, 1, 0, 0, 0, 0, 1, 1];

    expect(
      bfrPropRMS(y, t, c) - bfrPropTempest(y, t, c)
    ).toBeCloseTo(
      0
    )
  })

  test('Solutions to match', () => {
    const nwk = readFileSync("src/features/engine/empiricalTestTree.nwk").toString();
    const tree = readNewick(nwk);
    var tipNames = tree.getTipLabels()

    // generate input data
    var t = tipNames.map((name: string) => {
      let date = extractPartOfTipName(name, "_", "-1")
      return decimal_date(date, "yyyy-mm-dd")
    })
    var y: number[] = tree.getRTTDist();
  
    var leftBranchTips: string[] = tree.getSubtree(tree.root.children[0]).getTipLabels();
    var c: number[] = [];
    for (let i = 0; i < tipNames.length; i++) {
      leftBranchTips.includes(tipNames[i]) ? c.push(0) : c.push(1);
    }
  
    let bl = tree.root.children.map(
      e => e.branchLength
    ).map(
      e => e === undefined ? 0 : e
    )
    if (bl.length > 2) console.warn("BFR: More than 2 child branches!")
    let sumLength = bl[0] + bl[1]

    for (let j = 0; j < y.length; j++) { // little fiddling with the root-to-tip divergences to get the right input vector
      y[j] = y[j] + (1 - c[j]) * (sumLength - bl[0]) - c[j] * (sumLength - bl[0]);
    }

    expect(
      bfrPropRMS(y, t, c)
    ).toBeCloseTo(
      bfrPropTempest(y, t, c)
    )

  });
})

/**
 * Finds scalar of basal branch length to place root with RMS optimisation from Tempest.
 * Used for comparison of clockor2 solution.
 *
 * @param {number[]} y - Starting RTT distances. Hoist to one side.
 * @param {number[]} t - Tip Dates.
 * @param {number[]} c - Indicator for which side of the root (Left/Right) that tips descend from.
 * @returns {number}  - Optimal proportion.
 */
export function bfrPropTempest(y: number[], t: number[], c: number[]): number {
  const a: number[] = [];
  const b: number[] = [];
  const N: number = y.length;
  const n: number = c.reduce((acc, curr) => acc + curr, 0);
  const t_bar: number = t.reduce((acc, curr) => acc + curr, 0) / N;
  const y_bar: number = y.reduce((acc, curr) => acc + curr, 0) / N;
  const C: number =
      t.reduce((acc, curr) => acc + curr * curr, 0) -
      (1 / t.length) * Math.pow(t.reduce((acc, curr) => acc + curr, 0), 2);

  for (let i = 0; i < y.length; i++) {
      a[i] =
          2 * c[i] -
          ((2 * n - N) / N) +
          ((2 * (t_bar - t[i]) / (C * N)) * (N * sumProduct(c, t) - n * sumProduct(t))) -
          1;

      b[i] =
          y[i] - y_bar +
          ((t_bar - t[i]) / (C * N)) * (N * sumProduct(y, t) - sumProduct(y) * sumProduct(t));
  }

  const kappa: number = (-1 * sumProduct(a, b)) / sumProduct(a, a);
  return kappa;
}