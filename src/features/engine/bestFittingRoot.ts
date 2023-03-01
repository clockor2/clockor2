// Functions for best fitting root
// Implementing method used in Tempest:
// https://github.com/beast-dev/beast-mcmc/blob/cf3d7370ca1a5b697f0f49be49765dcd6ad06dfb/src/dr/app/tempest/TemporalRooting.java
// https://doi.org/10.1093/ve/vew007

//import { Console } from "console";
import { createUnparsedSourceFile, isBreakStatement } from "typescript";
import * as core from "./core";
import * as util from "./utils"
//const phylotree = require("phylotree");
import { phylotree } from "phylotree"
var _ = require('lodash');
var minimize = require('minimize-golden-section-1d');
// ran npm install https://github.com/parallel-js/parallel.js to insall from github to bypass .env error.
const Parallel = require("paralleljs") // update import b/c of bug

export function globalRootParallel (nwk: string, dates: number[]) {

  const tree = new phylotree(nwk)
  var tr = new phylotree(tree.getNewick())
  var nodes = tree.nodes.descendants()
  nodes.shift() // removing root case (is default below)
  const numNodes = nodes.length;

  // handling root case first as base
  var best = localRoot(tr, dates); 
  var nodeNums = nodes.map((e: any, i: number) => i)

  var p = new Parallel(nodeNums, {
    env: {
      dates: dates,
      baseNwk: tree.getNewick(),
    } 
  }).require(
    localRoot
  );
  
  var prime = p.map(
    (i: number) => {
      var t = new phylotree(global.env.baseNwk)
      t.reroot(t.nodes.descendants()[i]);
       return localRoot(
        t,
        global.env.dates
      )
    }
  );

  var indx = 0;
  for (let i = 0; i < prime.length; i++) {

    if (prime[i].r2 - best.r2  > 1e-8) { // TODO: Better soln than 1e-08 episolon value for precision?
      indx = i
      best = {...prime[i]}
    }

  }

  var bestTree = new phylotree(tree.newick_string)
  bestTree.reroot(bestTree.nodes.descendants()[indx], best.alpha);
  bestTree.nodes.data.name = tree.nodes.data.name;

  return bestTree.getNewick();

}


//////////////////////////////////////////////////////////////////////////////////////////////////////

export function globalRootSerial (nwk: string, dates: number[]) {

    const tree = new phylotree(nwk)

    var tr = new phylotree(nwk);
    var bestTree = new phylotree(nwk)
    const numNodes = tree.nodes.descendants().length;

    // handling root case first as base
    var base = localRoot(tr, dates); 

    for (let n = 1; n < numNodes; n++) {

      tr = new phylotree(nwk);
      tr.reroot(tr.nodes.descendants()[n]);
      tr.nodes.data.name = tree.nodes.data.name;

      var prime = localRoot(
        tr,
        reorderDates(
          dates,
          util.getTipNames(tree),
          util.getTipNames(tr)
        )
      )
      if (prime.r2 - base.r2  > 1e-8) { // TODO: Better soln than 1e-08 episolon value for precision?

        base = {...prime};

        bestTree = new phylotree(tree.newick_string)
        bestTree.reroot(bestTree.nodes.descendants()[n], prime.alpha);
        bestTree.nodes.data.name = tr.nodes.data.name;

      }
    }


    return bestTree.getNewick();

}
 

export function localRoot (tree: any, dates: number[]) {

    // generating input data //
    var tipNames: string[] = util.getTipNames(tree);
    var tipHeights: number[] = util.getTipHeights(tree);
    var bl = tree.getBranchLengths();

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

export function reorderDates (dates: number[], currentTip: string[], targetTip: string[]) {

    let index = currentTip.map(
      e => targetTip.indexOf(e)
    )

    let datesOrdered = index.map(
      (e: number) => dates[e]
    )

    return datesOrdered;
}
