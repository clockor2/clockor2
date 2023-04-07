import { phylotree } from "phylotree";
import { linearRegression } from "./core";
import { getTipHeights, getTipNames } from "./utils";
import { useAppSelector } from "../../app/hooks";
import { selectTipData } from "../tree/treeSlice";
import { regression } from "../engine/core";

var minimize = require("minimize-golden-section-1d");

export interface localOptima {
  r2: number;
  alpha: number;
  nodeIndx: number;
}

/**
 * Creates a web worker for parallel processing and sets up message passing with the worker.
 *
 * @param {string} nwk - The Newick string representing the phylogenetic tree.
 * @param {number[]} dates - An array of dates associated with each tip of the tree.
 * @param {number[]} nodes - An array of node indices to be processed by the worker.
 * @returns {Promise} - A Promise that resolves with the worker's response data.
 */
function createWorker(nwk: string, dates: number[], nodes: number[], tipData: any) {
  return new Promise(function (resolve, reject) {
    const worker = new Worker(new URL("./bfrWorker.ts", import.meta.url));
    worker.postMessage({
      nwk: nwk,
      dates: dates,
      nodeNums: nodes,
      tipData: tipData
    });
    worker.onmessage = (e) => {
      resolve(e.data);
    };
    worker.onerror = (e) => reject(e.error);
  });
}

/**
 * Finds the best root for a phylogenetic tree by searching through all possible roots in parallel.
 *
 * @param {string} nwk - The Newick string representing the phylogenetic tree.
 * @param {number[]} dates - An array of dates associated with each tip of the tree.
 * @returns {Promise<string>} - A Promise that resolves with the Newick string of the best rooted tree.
 */
export async function globalRootParallel(nwk: string, dates: number[], tipData: any) {

  var t0 = new Date().getTime();

  const tree = new phylotree(nwk);
  var nodes = tree.nodes.descendants();
  var nodeNums = nodes.map((e: any, i: number) => i).slice(1);

  var nodeNumsChunked = 
  nodeNums.length > window.navigator.hardwareConcurrency
  ?
    spliceIntoChunks(
      nodeNums,
      (nodeNums.length - 1) / window.navigator.hardwareConcurrency
    )
  :
    [nodeNums];

  var promises = nodeNumsChunked.map((e: number[]) =>
    createWorker(nwk, dates, e, tipData)
  );

  var prime = (await Promise.all(promises));

  prime.unshift({
    ...localRoot(tree, tipData),
    nodeIndx: 0,
  });

  var r2 = prime.map((e: any) => e.r2);

  var bestR2 = Math.max(...r2);

  var bestIndx = r2.indexOf(bestR2);
  var best: any = prime[bestIndx];

  let bestTree = new phylotree(nwk);

  rerootAndScale(bestTree, best);

  bestTree.nodes.each( (n: any) => {
    console.log(typeof n.data.__mapped_bl)
  if (n.data.__mapped_bl){
    n.data.attribute = n.data.__mapped_bl.toString()
   } else {
    n.data.attribute = "0"
   }
  })
  bestTree.setBranchLength( (n: any) => {
     return n.data.attribute
  })

  var t1 = new Date().getTime()

  console.log("Time Taken for BFR " + Math.abs(t1-t0) / 1000 + "s")

  return bestTree.getNewick();
}

/**
 * Reroots at best node and rescales basal branch lengths.
 * 
 * @param {any} bestTree - The best rooted phylotree instance.
 * @param {any} best - The best local optima information.
 */
export function rerootAndScale(bestTree: any, best: any) {

  if (best.nodeIndx !== 0) {

    bestTree.reroot(bestTree.nodes.descendants()[best.nodeIndx]);

  } else if (best.nodeIndx === 0) {
    bestTree.nodes.each((n: any) => {
      n.data.__mapped_bl = bestTree.branch_length_accessor(n);
    });
    bestTree.setBranchLength((node:any) => node.data.__mapped_bl)
  }

    let bl = [
      bestTree.branch_length_accessor(bestTree.nodes.children[0]),
      bestTree.branch_length_accessor(bestTree.nodes.children[1])
    ].map (
      e => parseFloat(e)
    )

    let len = bl.reduce((a,b) => a+b, 0)

    bestTree.nodes.children[0].data.__mapped_bl = (best.alpha * len).toString();
    bestTree.nodes.children[1].data.__mapped_bl = ((1 - best.alpha) * len).toString();
}


/**
 * Finds the best local root for a given phylogenetic tree.
 *
 * @param {any} tree - A phylotree instance representing the phylogenetic tree.
 * @param {number[]} dates - An array of dates associated with each tip of the tree.
 * @returns {object} - An object containing the best alpha value and the corresponding R2 value.
 */
export function localRoot(tree: any, tipData: any) {
  var tipNames: string[] = getTipNames(tree);
  var tipHeights: number[] = getTipHeights(tree); 
  var dates = tipNames.map(e => tipData[e].date)

  var desc0: string[] = tree.nodes.children[0].leaves().map(
    (e: any) => e.data.name
  );

  var indicator: number[] = [];
  for (let i = 0; i < tipNames.length; i++) {
    desc0.includes(tipNames[i]) ? indicator.push(1) : indicator.push(0);
  }

  let bl = [
    tree.branch_length_accessor(tree.nodes.children[0]),
    tree.branch_length_accessor(tree.nodes.children[1])
  ].map(e => parseFloat(e))

  let length = bl.reduce((a, b) => a+b, 0)

  // Skipping opimisation for effectively 0-length branches
  if (length < Number.EPSILON) {
    console.log('Skipping node!');
    return { 
      alpha: 0.5, 
      r2: linearRegression({ x: dates, y: tipHeights, tip: tipNames, name: 'NA' }).r2
    }
  }

  function univariateFunction(x: number) {
    let tipHeightsNew = tipHeights.map((e, i) =>
        indicator[i] * (e - bl[0] + (x * length)) +
        (1 - indicator[i]) * (e - bl[1] + ((1 - x) * length))
    );
    return -1 * linearRegression({ x: dates, y: tipHeightsNew, tip: tipNames, name: 'NA' }).r2;
  };

  let alpha = minimize(univariateFunction, { lowerBound: 0, upperBound: 1, tolerance: Number.EPSILON, maxIterations: 1000});
  
  return { alpha: alpha, r2: -1 * univariateFunction(alpha) };
}

interface TipIndices {
  [key: string]: number;
}

/**
 * Reorders an array of data based on the correspondence between the current and target tip names.
 *
 * @param {number[]} arr - The array of data to be reordered.
 * @param {string[]} currentTip - An array of the current tip names.
 * @param {string[]} targetTip - An array of the target tip names.
 * @returns {number[]} - The reordered array of data.
 */
export function reorderData(arr: number[], currentTip: string[], targetTip: string[]) {
  const targetTipIndices: TipIndices = {};
  for (let i = 0; i < targetTip.length; i++) {
    targetTipIndices[targetTip[i]] = i;
  }

  const arrOrdered = currentTip.map((tip) => {
    const index = targetTipIndices[tip];
    return arr[index];
  });

  return arrOrdered;
}

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