import { phylotree } from "phylotree";
import { localRoot, localOptima, reorderData } from "./bestFittingRoot";

// this runs on the webworker, created with webpack 5 syntax new
// Worker('./worker.ts'). in jest tests, this module is not used, instead the
// workerMessageHandler is directly addressed
self.onmessage = ({ data: { nwk, dates, nodeNums } }) => {
  var tree = new phylotree(nwk)
  var treePrime: any = {}
  var datesPrime: number[] = []
  var prime: localOptima[] = []

  for (let i=0; i<nodeNums.length; i++) {
    treePrime = new phylotree(nwk);
    treePrime.reroot(treePrime.nodes.descendants()[nodeNums[i]]);
    treePrime.nodes.data.name = "root";

    datesPrime = reorderData(
      dates,
      tree.getTips().map((e: any) => e.data.name),
      treePrime.getTips().map((e: any) => e.data.name)
    )

    var localOptimum = localRoot(
      treePrime,
      datesPrime
    )

    prime.push(
      {
        ...localOptimum,
        nodeIndx: nodeNums[i]
      }
    )
  }

  self.postMessage(prime);
}; 