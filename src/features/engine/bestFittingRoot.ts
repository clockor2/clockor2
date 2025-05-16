import { linearRegression } from "./core";
import { Tree, readNewick, writeNewick } from "phylojs";
var minimize = require("minimize-golden-section-1d");

export interface localOptima {
  method: "R2" | "RMS";
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
function createWorker(nwk: string, dates: number[], nodes: number[], tipData: any, bfrMode: "R2" | "RMS") {
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
export async function globalRootParallel(nwk: string, dates: number[], tipData: any, bfrMode: "R2" | "RMS") {

  var t0 = new Date().getTime();

  const tree: Tree = readNewick(nwk);
  var nodes = tree.nodeList;
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

  } else if (bfrMode == "RMS") {
    prime.unshift({
      ...localRootRMS(tree, tipData),
      nodeIndx: 0,
    })

    let rss = prime.map((e: any) => e.value);
    let minRSS = Math.min(...rss);
    let bestIndx = rss.indexOf(minRSS);
    var best: any = prime[bestIndx];
  }

  let bestTree = readNewick(nwk);

  console.log(`Overall Best`)
  console.log(best)
  rerootAndScale(bestTree, best);

  let t1 = new Date().getTime()

  console.log("Time Taken for BFR " + Math.abs(t1 - t0) / 1000 + "s")

  bestTree.ladderise()
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
    bestTree.reroot(bestTree.nodeList[best.nodeIndx]);
  }

  let bl = bestTree.root.children.map(
    e => e.branchLength
  ).map(
    e => e === undefined ? 0 : e
  )
  // Sanity checks commented out below:
  // console.log("BL Reroot and rescale")
  // console.log(bl)
  let len = bl[0] + bl[1] // TODO: Ensure bifurcating here

  // let tLen1 = bestTree.getTotalBranchLength()

  bestTree.root.children[0].branchLength = (best.alpha * len);
  bestTree.root.children[1].branchLength = ((1 - best.alpha) * len);

  // let tlen2 = bestTree.getTotalBranchLength();
  // console.log(`Same Tree-length? : ${tLen1 - tlen2}`)
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
  var desc0: string[] = tree.getClade(tree.root.children[0]).getTipLabels();

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
 * Finds scalar of basal branch length to place root with RMS optimisation.
 *
 * @param {number[]} y - Starting RTT distances. Hoist to one side.
 * @param {number[]} t - Tip Dates.
 * @param {number[]} c - Indicator for which side of the root (Left/Right) that tips descend from.
 * @returns {number}  - Optimal proportion.
 */
export function bfrPropRMS(y: number[], t: number[], c: number[]) {
  c = c.map((e) => -1 * ((2 * e) - 1));
  const N: number = y.length;
  const t_bar: number = t.reduce((a, b) => a + b, 0) / N;
  const d_bar: number = y.reduce((a, b) => a + b, 0) / N;
  const c_bar: number = c.reduce((a, b) => a + b, 0) / N;

  const Sdc: number = sumProduct(y.map((e) => d_bar - e), c.map((e) => c_bar - e));
  const Scc: number = sumProduct(c.map((e) => c_bar - e), c.map((e) => c_bar - e));
  const Std: number = sumProduct(t.map((e) => t_bar - e), y.map((e) => d_bar - e));
  const Stc: number = sumProduct(t.map((e) => t_bar - e), c.map((e) => c_bar - e));
  const Stt: number = sumProduct(t.map((e) => t_bar - e), t.map((e) => t_bar - e));

  const num: number = Sdc - (Std * Stc / Stt);
  const den: number = Scc - (Stc * Stc / Stt);

  return num / den;
}


// Auxiliary 
export function sumProduct(arr1: number[], arr2?: number[]): number {
  if (arr2) {
    return arr1.reduce((acc, curr, index) => acc + curr * arr2[index], 0);
  }
  return arr1.reduce((acc, curr) => acc + curr, 0);
}

/**
 * Finds the best local root for a given phylogenetic tree base on residual sum of swuares.
 *
 * @param {any} tree - A phylotree instance representing the phylogenetic tree.
 * @param {any} tipData - Object associating dates and tip names.
 * @returns {object} - An object containing the best alpha value and the corresponding R2 value.
 */
export function localRootRMS(tree: Tree, tipData: any) {
  // TODO: There is a lot of "1-x" stuff below. Refactor later to just work in terms of x / alpha
  var tipNames: string[] = tree.getTipLabels();
  var tipHeights: number[] = tree.getRTTDist();
  var t = tipNames.map(e => tipData[e].date)

  var leftBranchTips: string[] = tree.getClade(tree.root.children[0]).getTipLabels();
  var c: number[] = [];
  for (let i = 0; i < tipNames.length; i++) {
    leftBranchTips.includes(tipNames[i]) ? c.push(0) : c.push(1);
    //leftBranchTips.includes(tipNames[i]) ? c.push(1) : c.push(0);
  }

  let bl = tree.root.children.map(
    e => e.branchLength
  ).map(
    e => e === undefined ? 0 : e
  )
  if (bl.length > 2) console.warn("BFR: More than 2 child branches!")
  //let sumLength = bl.reduce((a, b) => a + b, 0)
  let sumLength = bl[0] + bl[1]

  let y = tipHeights;
  // Hoist all basal branch length to right
  for (let j = 0; j < y.length; j++) {
    y[j] = y[j] + (1 - c[j]) * (sumLength - bl[0]) - c[j] * (sumLength - bl[0]);
    //y[j] = y[j] + (1-c[j])*(bl[0]) - c[j]*(bl[0]);
  }

  let x = bfrPropRMS(y, t, c) / sumLength;
  x = Math.min(Math.max(x, 0.0), 1.0);
  let alpha = 1 - x;
  //let alpha = x;

  // rms
  let yPrime = y.map((e, i) => e + c[i] * ((1 - alpha) * sumLength) - (1 - c[i]) * ((1 - alpha) * sumLength))
  //let yPrime = y.map((e,i) => e + c[i]*(alpha*sumLength) - (1-c[i])*(alpha*sumLength))

  let rms = linearRegression({ x: t, y: yPrime, tip: tipNames, name: 'NA' }).rms

  return { alpha: alpha, value: rms, method: "RMS" };
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