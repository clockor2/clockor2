// tests for best fitting root functions
import {jest} from '@jest/globals';
import { localRoot, rerootAndScale, reorderData, globalRootParallel} from './bestFittingRoot';
import { linearRegression } from './core';
//const phylotree = require("phylotree");
import { phylotree, rootToTip } from "phylotree"

describe('Testing reorderData()', () => {
  let bestTree = new phylotree('((A:1, B:2):1,(C:1, D:2):3);')
  let expDates = [2, 3, 4, 5];
  let testDates = [5, 4, 3, 2];
  let testTips = bestTree.getTips().map((e: any) => e.data.name).reverse();
  let targetTips = bestTree.getTips().map((e: any) => e.data.name);

  test('Should match predefined order', () => {
    expect(
      reorderData(testDates, testTips, targetTips)
      ).toEqual(
        expDates
        )
  });
});

describe('Testing localRoot()', () => {
  test('Approx. equality for 5-tip tree', () => {
    let testTree = new phylotree('((A:1, B:2):3,(C:1, D:2):1);') // note swapping of both 1st order branch lengths
    let dates = [2,3,4,5];
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
    let bl = testTree.getBranchLengths()
    let est: any = localRoot(testTree, tipData);

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

describe('rerootAndScale() - length conserved after reroot and rescale', () => {
  test('Length conserved', () => {
    let tree = new phylotree('((A:1, B:2):3,(C:1, D:2):1);')

    var l1 = [];
    var l2 = [];
    for (let i of [1,2,3,4,5,6]) { // nodes 2,...,(2nTip-1)

      let best  = {
        alpha: 0.25, // arbitrarily
        r2: 0.5, // dummy value
        nodeIndx: i
      }

      let bestTree = new phylotree(tree.getNewick())
      rerootAndScale(bestTree, best)

      l1.push(tree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0))
      l2.push(bestTree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0))
    }

    // length equality for all rerootings
    expect(JSON.stringify(l1)).toMatch(JSON.stringify(l2))

  });
})

describe('rerootAndScale() - length conserved after .getNewick()', () => {
  test('Length conserved', () => {
    let tree = new phylotree('((A:1, B:2):3,(C:1, D:2):1);')

    var l1 = [];
    var l3 = [];
    for (let i of [1,2,3,4,5,6]) { // 2,...,(2nTip-1)

      let best  = {
        alpha: 0.25, // arbitrarily
        r2: 0.5, // dummy value
        nodeIndx: i
      }

      let bestTree = new phylotree(tree.getNewick())
      rerootAndScale(bestTree, best)
      

      l1.push(tree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0))
      
      // reset BL to attribute to make it workable for getNewick()
      bestTree.nodes.each( (n: any) => {
        console.log(typeof n.data.__mapped_bl)
      if (n.data.__mapped_bl){
        n.data.arrribute = n.data.__mapped_bl.toString()
       } else {
        n.data.arrribute = "0"
       }
      })
      bestTree.setBranchLength( (n: any) => {
         return n.data.attribute
      })

      let bestTree2 = new phylotree(bestTree.getNewick())
      
      l3.push(bestTree2.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0))

    }

    expect(JSON.stringify(l1)).toMatch(JSON.stringify(l3))

  });
})

describe('globalRootParallel() - length conserved test()', () => {
  test('Length conserved', () => {
    let nwk = '((A:1, B:2):3,(C:1, D:2):1);';
    let tree = new phylotree('((A:1, B:2):3,(C:1, D:2):1);')
    let dates = [2,3,4,5];
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
    let bfrNewick = globalRootParallel(nwk, dates, tipData).then((bfrNewick) => {
      let bfrTree = new phylotree(bfrNewick)
      let l1 = tree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0)  
      let l2 = bfrTree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0)
      console.log(JSON.stringify(l1))
      console.log(JSON.stringify(l2))
      expect(JSON.stringify(l1)).toMatch(JSON.stringify(l2))
    });
    
  });
})

import { readFileSync } from "fs";
import { decimal_date, getTipHeights, getTipNames } from './utils';

const handelNegativeIndexes = (splitTipName: Array<string>, delimiter: string, loc: number): number => {
  if (loc < 0) {
    loc = splitTipName.length + loc
  }
  return loc
}

const extractPartOfTipName = (name: string, delimiter: string, location: string): string => {
  let splitTipName = name.split(delimiter)
  let loc = handelNegativeIndexes(splitTipName, delimiter, parseInt(location))
  return name.split(delimiter)[loc]
}

// describe('Testing localRoot()', () => {
//   test('Want alpha defined for all reroots using MERS Data', () => {
//     const nwk = readFileSync("src/features/engine/egTree.nwk").toString();
//     //const nwk = '((A:1, B:2):1,(C:1, D:2):3);'
//     const tree = new phylotree(nwk);

//     var tr: any;
//     var nodes = tree.nodes.descendants()
//     var primes: any[] = [];
//     for (let i=1; i < nodes.length; i++) {
//       tr = new phylotree(nwk)
//       tr.reroot(tr.nodes.descendants()[i])
//       var tipNames = getTipNames(tr)

//       var decimal_dates = tipNames.map( (name: string) => {
//       let date = extractPartOfTipName(name, "_", "-1")
//       return decimal_date(date, "yyyy-mm-dd")

//     })

//       primes.push(
//         localRoot(
//           tr,
//           decimal_dates
//         )
//       )

//     }
//     //console.log(primes.map(e => e.alpha).filter(e => isNaN(e)).length)
//     //expect(!primes.filter(e => isNaN(e.alpha)))
//     expect(primes.slice(4).map(e => e.alpha).filter(e => isNaN(e)).length).toEqual(0) //TODO: Why don't the first 4 nodes work. See with other trees 
  
//   });
// })

describe('localRoot() - R^2 value for 3-tip tree', () => {
  test('Testing for 3-tip tree', () => {
    const nwk = '((A_2001:0.5,B_2009:1):1,C_2002:1.75):0;'

    let tree = new phylotree(nwk)
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

    let obj = localRoot(
      tree,
      tipData
    )

    expect(obj.r2).toBeCloseTo(1.0)
      
  });
})



// describe('Testing branch_length()', () => {
//   test('Branch length accessor', () => {
//     const nwk = readFileSync("src/features/engine/egTree.nwk").toString();
//     var tree = new phylotree(nwk)

//     // var bl = tree.branch_length_accessor

//     // var arr = []
//     // for (let i = 0; i < tree.nodes.descendants(); i++){
//     //   // console.log("### " + i + " ###" )
//     //   // console.log(bl(tree.nodes.descendants()[i]))
//     //   arr.push(bl(tree.nodes.descendants()[i]))
//     // }
//     var arr: any[][] = []
//     var tr: any;
//     for (let i = 1; i < tree.nodes.descendants().length; i++){
//       console.log("### " + i + " ###")
//       tr = new phylotree(nwk)
//       tr.reroot(tr.nodes.descendants()[i])

//       if ((tr.getBranchLengths().findIndex((e: number) => isNaN(e)))) {
//         arr.push(tr.getBranchLengths().findIndex((e: number) => isNaN(e)))
//       }

//     }
//     console.log(arr)
//     // console.log(arr.slice(0,11).map(e => tree.nodes.descendants()[e]))
//     expect(1).toEqual(0)
  
//   });
// })

// describe('Testing localRoot()', () => {
//   test('Approx. equality for 5-tip ladder tree used in globalRootParallel() test', () => {
//     let testTree = new phylotree('(A:1.5,(B:1,(C:1,(D:1, E:2):1):1):0.5);')
//     let dates = [1,2,3,4,5];
//     let est: any = localRoot(testTree, dates);

//     expect(
//       est.alpha
//       ).toBeCloseTo(
//         0.5,
//         5
//         )
//     expect(
//       est.r2
//       ).toBeCloseTo(
//         1,
//         2
//         );
//   });
// })


/**
 * Splits an array into chunks of the specified size.
 *
 * @param {number[]} arr - The array to be split into chunks.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {number[][]} - An array of chunks.
 */
function spliceIntoChunks(arr: number[], chunkSize: number) {
  const res = [];
  while (arr.length > 0) {
    const chunk = arr.splice(0, chunkSize);
    res.push(chunk);
  }
  return res;
}

describe('Testing splitIntoChunks()', () => {
  test('All elements preserved', () => {
    let arr = [1,2,3,4,5,6,7,8,9]

    let x = spliceIntoChunks(arr, 3);
    console.log("X Here")
    console.log(x)

    expect(
      x
    ).toEqual(
      [ [1,2,3], [4,5,6], [7,8,9] ]
    )
    
  });
})

// describe('Testing globalRootParallel()', () => {
//     test('Ladder tree with 5 tips - branch lengths equal?', () => {

//       var testTree = new phylotree(bestTree.getNewick())
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

  //     var bestTree = new phylotree('(A:1,(B:1,(C:1,(D:1, E:2):1):1):1);')
  //     var testTree = new phylotree(bestTree.newick_string)
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

  // TODO: get a good test case from Tempest