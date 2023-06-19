import { localRootR2, localRootRSS, rerootAndScale, spliceIntoChunks } from './bestFittingRoot';
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


describe('localRootRSS()', () => {
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
    let est: any = localRootRSS(testTree, tipData);

    console.log(est)
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

    let obj = localRootRSS(
      tree,
      tipData
    )
    
    expect(obj.method).toBe("RSS")
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

// // Would ideally have tests for wrapper globalRootParallel() Too
// describe('Testing globalRootParallel()', () => {
//     test('Ladder tree with 5 tips - branch lengths equal?', () => {

//       var testTree = readNewick(bestTree.getNewick())
//       // testTree.reroot(testTree.nodes.descendants()[3])
//       // testTree.nodes.data.name = 'root';

//       var dates = [1,2,3,4,5];
//       const estTree = globalRootParallel(testTree, dates);

//       rootToTip(bestTree);
//       rootToTip(estTree);

//       expect(estTree.getNewick()).toEqual(bestTree.getNewick())
//       expect(
//         estTree.getTips().map((e: any) => e.data.rootToTip)
//         ).toEqual(
//           bestTree.getTips().map((e: any) => e.data.rootToTip)
//           )
//     });
//   });

  // describe('Testing globalRootParallel()', () => {
  //   test('Ladder tree with 5 tips - newick?', () => {

  //     var bestTree = readNewick('(A:1,(B:1,(C:1,(D:1, E:2):1):1):1);')
  //     var testTree = readNewick(bestTree.newick_string)
  //     testTree.reroot(testTree.nodes.descendants()[3])
  //     testTree.nodes.data.name = 'root';

  //     var dates = [1,2,3,4,5];
  //     const estTree = globalRootParallel(testTree, dates);

  //     rootToTip(bestTree);
  //     rootToTip(estTree);

  //     expect(estTree.getNewick()).toEqual(bestTree.getNewick())
  //     expect(
  //       estTree.getTips().map((e: any) => e.data.rootToTip)
  //       ).toEqual(
  //         bestTree.getTips().map((e: any) => e.data.rootToTip)
  //         )
  //   });
  // });