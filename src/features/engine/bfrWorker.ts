import { phylotree } from "phylotree";
import { localRoot, localOptima, reorderData } from "./bestFittingRoot";
import { getTipNames } from "./utils";



// this runs on the webworker, created with webpack 5 syntax new
// Worker('./worker.ts'). in jest tests, this module is not used, instead the
// workerMessageHandler is directly addressed
self.onmessage = ({ data: { nwk, dates, nodeNums, tipData } }) => { /* eslint-disable-line no-restricted-globals */
  var tree = new phylotree(nwk)
  var treePrime: any = {}
  var datesPrime: number[] = []
  var localOptimum: localOptima
  var best: localOptima

  // first node case
  treePrime = new phylotree(nwk);
  treePrime.reroot(treePrime.nodes.descendants()[nodeNums[0]]);

  datesPrime = getTipNames(treePrime).map(
    e => tipData[e].date
  )
  var grpPrime = getTipNames(treePrime).map(
    e => tipData[e].group
  )

  best = {
    ...localRoot(
      treePrime,
      tipData
    ),
    nodeIndx: nodeNums[0]
    }

  // compare to rest of nodes
  for (let i=1; i<nodeNums.length; i++) {
    treePrime = new phylotree(nwk);

    treePrime.reroot(treePrime.nodes.descendants()[nodeNums[i]]);
    treePrime.setBranchLength(
      (n: any) => n.data.__mapped_bl
    )

    // // A check for length
    // // uing 10 x EPSILON to avoid false mismatches
    // if ((Math.abs(
    //     tree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0)
    //     -
    //     treePrime.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0)
    //   ) > 10 * Number.EPSILON)) {
    //   console.log("Length Not Preserved")
    //   console.log("Length before BFR: " + tree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0))
    //   console.log("Length after BFR: " + treePrime.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0))
    //   console.log("Diff: " + Math.abs(
    //     tree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0)
    //     -
    //     treePrime.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0)
    //   ))
    //   console.log("EPSILON: " + Number.EPSILON)
    // }

    localOptimum = {
      ...localRoot(
        treePrime,
        tipData
      ),
      nodeIndx: nodeNums[i]
    }

    // REMOVE AFter debug
    if (nodeNums[i] == 36) {
      console.log(localOptimum)
    }
    
    if (localOptimum.r2 - best.r2 > Number.EPSILON) {
      best = localOptimum;
    }
  }

  self.postMessage(best); /* eslint-disable-line no-restricted-globals */
}; 