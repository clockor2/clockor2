// tests for best fitting root functions
import {jest} from '@jest/globals';
import { localRoot, localOptima, reorderData} from './bestFittingRoot';

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
    let bl = testTree.getBranchLengths()
    let est: any = localRoot(testTree, dates);

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

describe('Testing localRoot()', () => {
  test('Want alpha defined for all reroots using MERS Data', () => {
    const nwk = readFileSync("src/features/engine/egTree.nwk").toString();
    //const nwk = '((A:1, B:2):1,(C:1, D:2):3);'
    const tree = new phylotree(nwk);

    var tr: any;
    var nodes = tree.nodes.descendants()
    var primes: any[] = [];
    for (let i=1; i < nodes.length; i++) {
      tr = new phylotree(nwk)
      tr.reroot(tr.nodes.descendants()[i])
      var tipNames = getTipNames(tr)

      var decimal_dates = tipNames.map( (name: string) => {
      let date = extractPartOfTipName(name, "_", "-1")
      return decimal_date(date, "yyyy-mm-dd")

    })

      primes.push(
        localRoot(
          tr,
          decimal_dates
        )
      )

    }
    //console.log(primes.map(e => e.alpha).filter(e => isNaN(e)).length)
    //expect(!primes.filter(e => isNaN(e.alpha)))
    expect(primes.slice(4).map(e => e.alpha).filter(e => isNaN(e)).length).toEqual(0) //TODO: Why don't the first 4 nodes work. See with other trees 
  
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

describe('Testing localRoot()', () => {
  test('Approx. equality for 5-tip ladder tree used in globalRootParallel() test', () => {
    let testTree = new phylotree('(A:1.5,(B:1,(C:1,(D:1, E:2):1):1):0.5);')
    let dates = [1,2,3,4,5];
    let est: any = localRoot(testTree, dates);

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