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
  // set branch lengths
  treePrime.nodes.each((n: any) => {
    if (n.data.__mapped_bl){
      n.data.attribute = n.data.__mapped_bl.toString();
    }
  })

  // datesPrime = reorderData(
  //   dates,
  //   tree.getTips().map((e: any) => e.data.name),
  //   treePrime.getTips().map((e: any) => e.data.name)
  // )
  datesPrime = getTipNames(treePrime).map(
    e => tipData[e].date
  )

  best = {
    ...localRoot(
      treePrime,
      datesPrime
    ),
    nodeIndx: nodeNums[0]
    }

  // compare to rest of nodes
  for (let i=1; i<nodeNums.length; i++) {
    treePrime = new phylotree(nwk);
    treePrime.reroot(treePrime.nodes.descendants()[nodeNums[i]]);
    // set branch lengths
     treePrime.nodes.each((n: any) => {
      if (n.data.__mapped_bl) {
        n.data.attribute = n.data.__mapped_bl.toString();
      } 
    });

    treePrime.setBranchLength((n: any) => {
      return n.data.attribute;
    });

    // datesPrime = reorderData(
    //   dates,
    //   tree.getTips().map((e: any) => e.data.name),
    //   treePrime.getTips().map((e: any) => e.data.name)
    // )
    let datesPrime = getTipNames(treePrime).map(
      e => tipData[e].date
    )

    localOptimum = {
      ...localRoot(
        treePrime,
        datesPrime
      ),
      nodeIndx: nodeNums[i]
    }

    if (localOptimum.r2 - best.r2 > 1e-08) {
      best = localOptimum;
    }
  }

  self.postMessage(best); /* eslint-disable-line no-restricted-globals */
}; 