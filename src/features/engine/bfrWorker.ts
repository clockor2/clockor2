import { localRootR2, localRootRSS, localOptima } from "./bestFittingRoot";
import { readNewick, Tree } from "phylojs";


// this runs on the webworker, created with webpack 5 syntax new
// Worker('./worker.ts'). in jest tests, this module is not used, instead the
// workerMessageHandler is directly addressed
self.onmessage = ({ data: { nwk, nodeNums, tipData, bfrMode } }) => { /* eslint-disable-line no-restricted-globals */
  var treePrime: Tree
  var localOptimum: localOptima
  var best: localOptima

  // first node case
  treePrime = readNewick(nwk);
  treePrime.reroot(treePrime.getNodeList()[nodeNums[0]]);

  if (bfrMode == "R2") {
    best = {
      ...localRootR2(
        treePrime,
        tipData
      ),
      nodeIndx: nodeNums[0],
      method: "R2"
    }

    // compare to rest of nodes
    for (let i=1; i<nodeNums.length; i++) {
      
      treePrime = readNewick(nwk);
      treePrime.reroot(treePrime.getNodeList()[nodeNums[i]]);

      localOptimum = {
        ...localRootR2(
          treePrime,
          tipData
        ),
        nodeIndx: nodeNums[i],
        method: "R2"
      }

      if (localOptimum.value - best.value > Number.EPSILON) {
        best = localOptimum;
      }
    }

    self.postMessage(best); /* eslint-disable-line no-restricted-globals */
  
  } else if (bfrMode == "RSS") {
    best = {
      ...localRootRSS(
        treePrime,
        tipData
      ),
      nodeIndx: nodeNums[0],
      method: "RSS"
    }

    // compare to rest of nodes
    for (let i=1; i<nodeNums.length; i++) {
      
      treePrime = readNewick(nwk);
      treePrime.reroot(treePrime.getNodeList()[nodeNums[i]]);

      localOptimum = {
        ...localRootRSS(
          treePrime,
          tipData
        ),
        nodeIndx: nodeNums[i],
        method: "RSS"
      }

      if (localOptimum.value - best.value < 0) {
        best = localOptimum;
      }
    }
    self.postMessage(best); /* eslint-disable-line no-restricted-globals */
  }
}; 