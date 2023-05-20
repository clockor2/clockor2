import { localRoot, localOptima } from "./bestFittingRoot";
import { readNewick, Tree } from "phylojs";


// this runs on the webworker, created with webpack 5 syntax new
// Worker('./worker.ts'). in jest tests, this module is not used, instead the
// workerMessageHandler is directly addressed
self.onmessage = ({ data: { nwk, nodeNums, tipData } }) => { /* eslint-disable-line no-restricted-globals */
  var treePrime: Tree
  var datesPrime: number[] = []
  var localOptimum: localOptima
  var best: localOptima

  // first node case
  treePrime = readNewick(nwk);
  treePrime.reroot(treePrime.getNodeList()[nodeNums[0]]);

  datesPrime = treePrime.getTipLabels().map(
    (e: string) => tipData[e].date
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
    
    treePrime = readNewick(nwk);
    treePrime.reroot(treePrime.getNodeList()[nodeNums[i]]);

    localOptimum = {
      ...localRoot(
        treePrime,
        tipData
      ),
      nodeIndx: nodeNums[i]
    }

    if (localOptimum.r2 - best.r2 > Number.EPSILON) {
      best = localOptimum;
    }
  }

  self.postMessage(best); /* eslint-disable-line no-restricted-globals */
}; 