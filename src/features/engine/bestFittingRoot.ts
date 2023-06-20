import { linearRegression } from "./core";
import { Tree, readNewick, writeNewick } from "phylojs";
var minimize = require("minimize-golden-section-1d");

export interface localOptima {
  method: "R2" | "RSS";
  value: number;
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
function createWorker(nwk: string, dates: number[], nodes: number[], tipData: any, bfrMode: "R2" | "RSS") {
  return new Promise(function (resolve, reject) {
    const worker = new Worker(new URL("./bfrWorker.ts", import.meta.url));
    worker.postMessage({
      nwk: nwk,
      dates: dates,
      nodeNums: nodes,
      tipData: tipData,
      bfrMode: bfrMode
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
export async function globalRootParallel(nwk: string, dates: number[], tipData: any, bfrMode: "R2" | "RSS") {

  var t0 = new Date().getTime();

  const tree: Tree = readNewick(nwk);
  var nodes = tree.getNodeList();
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
    createWorker(nwk, dates, e, tipData, bfrMode)
  );

  var prime = (await Promise.all(promises));
  
  if (bfrMode == "R2") {
    prime.unshift({
      ...localRootR2(tree, tipData),
      nodeIndx: 0,
    })

    let r2 = prime.map((e: any) => e.value);
    let bestR2 = Math.max(...r2);
    let bestIndx = r2.indexOf(bestR2);
    var best: any = prime[bestIndx];

  } else if (bfrMode == "RSS") {
    prime.unshift({
      ...localRootRSS(tree, tipData),
      nodeIndx: 0,
    })

    let rss = prime.map((e: any) => e.value);
    let minRSS = Math.min(...rss);
    let bestIndx = rss.indexOf(minRSS);
    var best: any = prime[bestIndx];

  }

  let bestTree = readNewick(nwk);

  rerootAndScale(bestTree, best);

  let t1 = new Date().getTime()

  console.log("Time Taken for BFR " + Math.abs(t1 - t0) / 1000 + "s")

  return writeNewick(bestTree);
}

/**
 * Reroots at best node and rescales basal branch lengths.
 * 
 * @param {Tree} bestTree - The best rooted phylotree instance.
 * @param {any} best - The best local optima information.
 * @returns {void} - Only manipulates bestTree
 */
export function rerootAndScale(bestTree: Tree, best: any): void {

  if (best.nodeIndx !== 0) {
    bestTree.reroot(bestTree.getNodeList()[best.nodeIndx]);
  }

  let bl = bestTree.root.children.map(
    e => e.branchLength
  ).map(
    e => e === undefined ? 0 : e
  )

  let len = bl.reduce((a, b) => a + b, 0)

  bestTree.root.children[0].branchLength = (best.alpha * len);
  bestTree.root.children[1].branchLength = ((1 - best.alpha) * len);
}


/**
 * Finds the best local root for a given phylogenetic tree base on R^{2}.
 *
 * @param {any} tree - A phylotree instance representing the phylogenetic tree.
 * @param {any} tipData - Object associating dates and tip names.
 * @returns {object} - An object containing the best alpha value and the corresponding R2 value.
 */
export function localRootR2(tree: Tree, tipData: any) {
  var tipNames: string[] = tree.getTipLabels();
  var tipHeights: number[] = tree.getRTTDist();
  var dates = tipNames.map(e => tipData[e].date)

  var desc0: string[] = tree.getSubtree(tree.root.children[0]).getTipLabels();

  var indicator: number[] = [];
  for (let i = 0; i < tipNames.length; i++) {
    desc0.includes(tipNames[i]) ? indicator.push(1) : indicator.push(0);
  }

  let bl = tree.root.children.map(
    e => e.branchLength
  ).map(
    e => e === undefined ? 0 : e
  )
  let len = bl.reduce((a, b) => a + b, 0)

  // Skipping opimisation for effectively 0-length branches
  // if (len < Number.EPSILON) {
  //   console.log('BFR Skipping node! <==> Sum Basal Branch Lengths < Number.EPSILON');
  //   return { 
  //     alpha: 0.5, 
  //     r2: linearRegression({ x: dates, y: tipHeights, tip: tipNames, name: 'NA' }).r2
  //   }
  // }

  function univariateFunction(x: number) {
    let tipHeightsNew = tipHeights.map((e, i) =>
      indicator[i] * (e - bl[0] + (x * len)) +
      (1 - indicator[i]) * (e - bl[1] + ((1 - x) * len))
    );
    return -1 * linearRegression({ x: dates, y: tipHeightsNew, tip: tipNames, name: 'NA' }).r2;
  };

  let alpha = minimize(univariateFunction, { lowerBound: 0, upperBound: 1, tolerance: Number.EPSILON, maxIterations: 1000 });

  return { alpha: alpha, value: -1 * univariateFunction(alpha), method: "R2" };

}

/**
 * Finds the best local root for a given phylogenetic tree base on residual sum of swuares.
 *
 * @param {any} tree - A phylotree instance representing the phylogenetic tree.
 * @param {any} tipData - Object associating dates and tip names.
 * @returns {object} - An object containing the best alpha value and the corresponding R2 value.
 */
export function localRootRSS(tree: Tree, tipData: any) {
  var tipNames: string[] = tree.getTipLabels();
  var tipHeights: number[] = tree.getRTTDist();
  var dates = tipNames.map(e => tipData[e].date)

  var desc0: string[] = tree.getSubtree(tree.root.children[0]).getTipLabels();

  var indicator: number[] = [];
  for (let i = 0; i < tipNames.length; i++) {
    desc0.includes(tipNames[i]) ? indicator.push(1) : indicator.push(0);
  }

  let bl = tree.root.children.map(
    e => e.branchLength
  ).map(
    e => e === undefined ? 0 : e
  )
  let len = bl.reduce((a, b) => a + b, 0)

  // sum variables for alpha
  let sum_y = 0.0;
  let sum_yc = 0.0;
  let sum_yt = 0.0;
  let sum_t = 0.0;
  let sum_tt = 0.0;
  let sum_tc = 0.0;
  let sum_cc = indicator.reduce((a,b) => a+b) // bc 0 and 1 squared
  let n = tipHeights.length;

  for (let i=0; i<tipHeights.length; i++){
    sum_y += tipHeights[i]
    sum_yc += tipHeights[i] * indicator[i]
    sum_yt += tipHeights[i] * dates[i]
    sum_t += dates[i]
    sum_tt += dates[i] * dates[i]
    sum_tc += indicator[i] * dates[i]
  }

  let numerator = sum_yc - sum_y + sum_yt * (2 * sum_tc - sum_t);
  let denominator = (4 * sum_cc) - (4 * sum_y) - n -Math.pow((2 * sum_tc - sum_t), 2);

  let alpha = 2 * (numerator / denominator) + (bl[0] / len)
  alpha = Math.max(Math.min(alpha, 1), 0.0)

  // get rms now
  let yprime = tipHeights
    .map(
      (e,i) => e + indicator[i] * (alpha * len) + (1 - indicator[i]) * (1 - alpha) * len
    )
  let sum_yyprime = yprime
      .map(e => Math.pow(e, 2))
      .reduce((a,b) => a+b)
  let sum_typrime = yprime
      .map((e,i) => e * dates[i])
      .reduce((a,b) => a+b)
  
  let rms = sum_yyprime - (Math.pow(sum_typrime, 2) / sum_tt)

  return { alpha: alpha, value: rms, method: "RSS" };

}

/**
 * Splits an array into chunks of the specified size.
 *
 * @param {number[]} arr - The array to be split into chunks.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {number[][]} - An array of chunks.
 */
export function spliceIntoChunks(arr: number[], chunkSize: number) {
  const res = [];
  while (arr.length > 0) {
    const chunk = arr.splice(0, chunkSize);
    res.push(chunk);
  }
  return res;
}