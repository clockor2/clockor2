import { phylotree } from "phylotree";
import * as core from "./core";
import * as util from "./utils";
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
function createWorker(nwk: string, dates: number[], nodes: number[]) {
  return new Promise(function (resolve, reject) {
    const worker = new Worker(new URL("./bfrWorker.ts", import.meta.url));
    worker.postMessage({
      nwk: nwk,
      dates: dates,
      nodeNums: nodes,
    });
    worker.onmessage = (e) => {
      resolve(e.data);
    };
    worker.onerror = reject;
  });
}

/**
 * Finds the best root for a phylogenetic tree by searching through all possible roots in parallel.
 *
 * @param {string} nwk - The Newick string representing the phylogenetic tree.
 * @param {number[]} dates - An array of dates associated with each tip of the tree.
 * @returns {Promise<string>} - A Promise that resolves with the Newick string of the best rooted tree.
 */
export async function globalRootParallel(nwk: string, dates: number[]) {
  const tree = new phylotree(nwk);
  var nodes = tree.nodes.descendants();
  var nodeNums = nodes.map((e: any, i: number) => i).slice(1);

  var nodeNumsChunked = spliceIntoChunks(
    nodeNums,
    (nodeNums.length - 1) / window.navigator.hardwareConcurrency
  );

  var promises = nodeNumsChunked.map((e: number[]) =>
    createWorker(nwk, dates, e)
  );

  var prime = (await Promise.all(promises));

  prime.unshift({
    ...localRoot(tree, dates),
    nodeIndx: 0,
  });

  var r2 = prime.map((e: any) => e.r2);

  var bestR2 = Math.max(...r2);

  var bestIndx = r2.indexOf(bestR2);
  var best: any = prime[bestIndx];

  let bestTree = new phylotree(nwk);

  if (best.nodeIndx === 0) {
    handleRootCase(bestTree, best);
  } else {
    handleNonRootCase(bestTree, tree, best);
  }

  return bestTree.getNewick();
}

/**
 * Handles the case when the best root found is already the root.
 *
 * @param {any} bestTree - The best rooted phylotree instance.
 * @param {any} best - The best local optima information.
 */
function handleRootCase(bestTree: any, best: any) {
  let bl = bestTree.getBranchLengths();
  let len = bl[1] + bl[2];

  bestTree.nodes.children[0].data.attribute = (best.alpha * len).toString();
  bestTree.nodes.children[1].data.attribute = ((1 - best.alpha) * len).toString();
}

/**
 * Handles the case when the best root found is not the current root.
 *
 * @param {any} bestTree - The best rooted phylotree instance.
 * @param {any} tree - The original phylotree instance.
 * @param {any} best - The best local optima information.
 */
function handleNonRootCase(bestTree: any, tree: any, best: any) {
  bestTree.reroot(bestTree.nodes.descendants()[best.nodeIndx]);

  let bl = bestTree.getBranchLengths();
  let len = bl[1] + bl[2];

  bestTree.nodes.children[0].data.attribute = (best.alpha * len).toString();
  bestTree.nodes.children[1].data.attribute = ((1 - best.alpha) * len).toString();

  bestTree.nodes.each((n: any) => {
    if (n.data.__mapped_bl) {
      n.data.attribute = n.data.__mapped_bl.toString();
    }
  });
}

/**
 * Finds the best local root for a given phylogenetic tree.
 *
 * @param {any} tree - A phylotree instance representing the phylogenetic tree.
 * @param {number[]} dates - An array of dates associated with each tip of the tree.
 * @returns {object} - An object containing the best alpha value and the corresponding R2 value.
 */
export function localRoot(tree: any, dates: number[]) {
  var tipNames: string[] = util.getTipNames(tree);
  var tipHeights: number[] = util.getTipHeights(tree);
  var bl = tree.getBranchLengths();

  var desc1: string[] = tree.nodes.children[0].leaves().map(
    (e: any) => e.data.name
  );

  var indicator: number[] = [];
  for (let i = 0; i < tipNames.length; i++) {
    desc1.includes(tipNames[i]) ? indicator.push(1) : indicator.push(0);
  }

  let length = bl[1] + bl[2];

  const univariateFunction = (x: number) => {
    let tipHeightsNew = tipHeights.map(
      (e, i) =>
        indicator[i] * (e - bl[1] + x * length) +
        (1 - indicator[i]) * (e - bl[2] + (1 - x) * length)
    );
    return -1 * core.linearRegression({ x: dates, y: tipHeightsNew, tip: tipNames }).r2;
  };

  let alpha = minimize(univariateFunction, { lowerBound: 0, upperBound: 1 });
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