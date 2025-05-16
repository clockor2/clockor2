import { localRootR2, localRootRMS, localOptima } from "./bestFittingRoot";
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
  const nodes = treePrime.nodeList;

  treePrime.reroot(nodes[nodeNums[0]]);

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
      
      treePrime.reroot(nodes[nodeNums[i]]);

      localOptimum = {
        ...localRootR2(
          treePrime,
          tipData
        ),
        nodeIndx: nodeNums[i],
        method: "R2"
      }

      if (localOptimum.value - best.value > 0) {
        best = localOptimum;
      }
    }

    self.postMessage(best); /* eslint-disable-line no-restricted-globals */
  
  } else if (bfrMode == "RMS") {
    best = {
      ...localRootRMS(
        treePrime,
        tipData
      ),
      nodeIndx: nodeNums[0],
      method: "RMS"
    }

    // compare to rest of nodes
    for (let i=1; i<nodeNums.length; i++) {

      treePrime.reroot(nodes[nodeNums[i]]);

      localOptimum = {
        ...localRootRMS(
          treePrime,
          tipData
        ),
        nodeIndx: nodeNums[i],
        method: "RMS"
      }

      if (best.value - localOptimum.value > 0) {
        best = localOptimum;
      }
    }

    self.postMessage(best); /* eslint-disable-line no-restricted-globals */
  }
}; 