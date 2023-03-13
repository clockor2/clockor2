// Functions for best fitting root
// Implementing method used in Tempest:
// https://github.com/beast-dev/beast-mcmc/blob/cf3d7370ca1a5b697f0f49be49765dcd6ad06dfb/src/dr/app/tempest/TemporalRooting.java
// https://doi.org/10.1093/ve/vew007

//import { Console } from "console";
import { createUnparsedSourceFile, isBreakStatement } from "typescript";
import * as core from "./core";
import * as util from "./utils"
import { phylotree, rootToTip } from "phylotree"
var minimize = require('minimize-golden-section-1d');
//import  { minimize } from "minimize-golden-section-1d"

  // https://stackoverflow.com/questions/41423905/wait-for-several-web-workers-to-finish
  // for (let index = 0; index < 5; index++) {
  //   const worker = new Worker(new URL("./worker.ts", import.meta.url));
  //   worker.postMessage({
  //     nwk: tr.getNewick(),
  //   });
  //   worker.onmessage = ({ data: { answer } }) => {
  //     console.log(answer);
  //   };
  // }


  //return tr.getNewick();

  
export interface localOptima {
  r2: number,
  alpha: number,
  nodeIndx: number
}

function createWorker(nwk: string, dates: number[], nodes: number[]) {
  return new Promise(function(resolve, reject){
    const worker = new Worker(new URL("./worker.ts", import.meta.url));
    worker.postMessage({
      nwk: nwk,
      dates: dates,
      nodeNums: nodes
    });
    worker.onmessage = (e) => {
      resolve(e.data)
    }
    worker.onerror = reject;
  })
}

export async function globalRootParallel (nwk: string, dates: number[]) {

  const tree = new phylotree(nwk)
  var nodes = tree.nodes.descendants();
  var nodeNums = nodes.map(
    (e: any, i: number) => i
  ).slice(1)

  var nodeNumsChunked = spliceIntoChunks(
    nodeNums, 
    ( (nodeNums.length - 1) / window.navigator.hardwareConcurrency)
    //
  )
  console.log(nodeNums)

  var promises = nodeNumsChunked.map(
    (e: number[]) => createWorker(
      nwk,
      dates,
      e
    )
  )


  //var prime: any = [];
  var prime = (await Promise.all(promises))
  //prime = prime.map((msg: any) => msg.data)
  prime = prime.flat().slice(4) // TODO - Rooting on nodes 1 and 2 never works. Need to fix. ISsue also noted in test


  prime.unshift(
    {
    ...localRoot(
      tree,
      dates
    ),
    nodeIndx: 0
    }
  )
  //var prime = results.flat()
  var r2 = prime.map(
    (e: any) => e.r2
  )

  var bestR2 = Math.max(...r2)

  var bestIndx = r2.indexOf(bestR2)


  let bestTree = new phylotree(nwk)
  bestTree.reroot(bestTree.nodes.descendants[bestIndx])
  bestTree.nodes.data.name = nwk; 

  return bestTree.getNewick()
}

//////////////////////////////////////////////////////////////////////////////////////////////////////

export function globalRootSerial (nwk: string, dates: number[]) {

    const tree = new phylotree(nwk)

    var tr = new phylotree(nwk);
    var bestTree = new phylotree(nwk)
    const numNodes = tree.nodes.descendants().length;

    // handling root case first as base
    var best = localRoot(tr, dates); 

    for (let n = 1; n < numNodes; n++) {

      tr = new phylotree(nwk);
      tr.reroot(tr.nodes.descendants()[n]);
      tr.nodes.data.name = "root"

      var prime = localRoot(
        tr,
        reorderData(
          dates,
          util.getTipNames(tree),
          util.getTipNames(tr)
        )
      )
      if (prime.r2 - best.r2  > 1e-8) { // TODO: Better soln than 1e-08 episolon value for precision?

        best = {...prime};

        bestTree = new phylotree(nwk)
        bestTree.reroot(bestTree.nodes.descendants()[n], prime.alpha);
        bestTree.nodes.data.name = "root";

      }
    }


    return bestTree.getNewick();

}
 

export function localRoot (tree: any, dates: number[]) {

    // generating input data //
    var tipNames: string[] = util.getTipNames(tree);
    // Setting undefined edge lengths to zero
    //var tipHeights: number[] = util.getTipHeights(tree);
    var tipHeights: number[] = rootToTip(tree).getTips().map((tip: any) => tip.data.rootToTip)
    var bl = tree.getBranchLengths().slice(1);
    // Ser undefined to zero, log tree length to check
    var treeLength = bl.reduce(
      (accumulator: number, currentValue: number) => accumulator + currentValue,
      0
    )
    console.log("Tree Length " + treeLength)

    var desc1: string[] = tree.nodes.descendants()[1].leaves().map(
      (e: any) => e.data.name
      );

    var indicator: number[] = []
    for (let i=0; i<tipNames.length; i++){
        desc1.includes(tipNames[i]) 
        ? 
        indicator.push(1)
        :
        indicator.push(0)
    }

    let length = bl[1] + bl[2];

    const univariateFunction = (x: number) => {

      let tipHeightsNew = tipHeights.map(
        (e, i) => indicator[i]*(e - bl[1] + (x*length)) + (1-indicator[i])*(e - bl[2] + ((1-x)*length))
      ); 

      return -1 * core.linearRegression({x: dates, y: tipHeightsNew, tip: tipNames}).r2;
    }

    let alpha = minimize(univariateFunction, {lowerBound: 0, upperBound: 1}); // TODO: How to stop NaN results here?
    return {alpha: alpha, r2: -1 * univariateFunction(alpha)}
}

// export function reorderData (dates: number[], currentTip: string[], targetTip: string[]) {

//     let index = currentTip.map(
//       e => targetTip.indexOf(e)
//     )

//     let datesOrdered = index.map(
//       (e: number) => dates[e]
//     )

//     return datesOrdered;
// }

export function reorderData (arr: number[], currentTip: string[], targetTip: string[]) {

  let index = currentTip.map(
    e => targetTip.indexOf(e)
  )

  let arrOrdered = index.map(
    (e: number) => arr[e]
  )

  return arrOrdered;
}

function spliceIntoChunks(arr: number[], chunkSize: number) {
  const res = [];
  while (arr.length > 0) {
      const chunk = arr.splice(0, chunkSize);
      res.push(chunk);
  }
  return(res)
}
