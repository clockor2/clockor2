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
  console.log("BL Reroot and rescale")
  console.log(bl)
  let len = bl.reduce((a, b) => a + b, 0)

  let tLen1 = bestTree.getTotalBranchLength()
  
  bestTree.root.children[0].branchLength = (best.alpha * len);
  bestTree.root.children[1].branchLength = ((1 - best.alpha) * len);

  let tlen2 = bestTree.getTotalBranchLength();

  console.log(`Same Tree-length? : ${tLen1-tlen2}`)
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
// export function localRootRMS(tree: Tree, tipData: any) {
//   var tipNames: string[] = tree.getTipLabels();
//   var tipHeights: number[] = tree.getRTTDist();
//   var t = tipNames.map(e => tipData[e].date)

//   var leftBranchTips: string[] = tree.getSubtree(tree.root.children[0]).getTipLabels();
//   var c: number[] = [];
//   for (let i = 0; i < tipNames.length; i++) {
//     leftBranchTips.includes(tipNames[i]) ? c.push(1) : c.push(-1);
//   }

//   let bl = tree.root.children.map(
//     e => e.branchLength
//   ).map(
//     e => e === undefined ? 0 : e
//   )
//   if (bl.length > 2) console.warn("BFR: More than 2 child branches!")
//   let len = bl.reduce((a, b) => a + b, 0)

//   // sum variables for alpha
//   let S_tt = 0.0;
//   let S_tc = 0.0;
//   let S_yc = 0.0;
//   let S_cc = 0.0;
//   let S_ty = 0.0;

//   // Adjust root-to-tip distances. All basal branch length to right child.
//   let y = tipHeights.map((e,i) => e - (c[i]*bl[0]))

//   let y_bar = y.reduce((a,b) => a+b)/y.length;
//   let t_bar = t.reduce((a,b) => a+b)/t.length;
//   let c_bar = c.reduce((a,b) => a+b)/c.length;

//   for (let i=0; i<tipHeights.length; i++){
//     S_tt += Math.pow(t_bar - t[i], 2)
//     S_tc += (t_bar - t[i])*(c_bar - c[i])
//     S_ty += (t_bar - t[i])*(y_bar - y[i])
//     S_cc += (c_bar - c[i])*(c_bar - c[i])
//   }

//   let numerator = (S_yc - (S_tc*S_ty*(1/S_tt)));
//   let denominator = ((S_cc)-(S_tc*S_tc*(1/S_tt)));
//   let alpha = numerator / (denominator*len);
//   alpha = Math.max(Math.min(alpha, 1), 0)

//   // rms
//   let yPrime = y.map((e,i) => e + c[i]*(alpha*len))
//   let Syy_prime = 0.0;
//   let Sty_prime = 0.0;
//   let y_Prime_bar = yPrime.reduce((a,b) => a+b)/yPrime.length;

//   for (let i=0; i<tipHeights.length; i++){
//     Syy_prime += (y_Prime_bar - yPrime[i])*(y_Prime_bar - yPrime[i]);
//     Sty_prime += (y_Prime_bar - yPrime[i])*(t_bar - t[i]);
//   }
//   let rms = (Syy_prime - (1/S_tt)*(Sty_prime)*(Sty_prime)) / (y.length-2);

//   return { alpha: alpha, value: rms, method: "RMS" };
// }

/////////////////////////////////////////////////////////////////////////////////////
////////////////// Implementing Tempest RMS Code For Now ////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/**
 * Finds the best local root for a given phylogenetic tree base on residual sum of swuares.
 *
 * @param {any} tree - A phylotree instance representing the phylogenetic tree.
 * @param {any} tipData - Object associating dates and tip names.
 * @returns {object} - An object containing the best alpha value and the corresponding R2 value.
 */
export function localRootRMS(tree: Tree, tipData: any) {
  var tipNames: string[] = tree.getTipLabels();
  var tipHeights: number[] = tree.getRTTDist();
  var t = tipNames.map(e => tipData[e].date)

  var leftBranchTips: string[] = tree.getSubtree(tree.root.children[0]).getTipLabels();
  var c: number[] = [];
  for (let i = 0; i < tipNames.length; i++) {
    leftBranchTips.includes(tipNames[i]) ? c.push(0) : c.push(1);
  }
  let n = c.reduce((a,b) => a+b)
  let N = c.length

  let bl = tree.root.children.map(
    e => e.branchLength
  ).map(
    e => e === undefined ? 0 : e
  )
  if (bl.length > 2) console.warn("BFR: More than 2 child branches!")
  let sumLength = bl.reduce((a, b) => a + b, 0)

   let y = tipHeights;
  for (let j = 0; j < y.length; j++) { // little fiddling with the root-to-tip divergences to get the right input vector
    y[j] = y[j] + (1-c[j])*(sumLength-bl[0]) - c[j]*(sumLength-bl[0]);
  }
  
  let sum_tt = 0.0;
  let sum_t = 0.0;
  let sum_y = 0.0;
  let sum_ty = 0.0;
  let sum_tc = 0.0;
  let Nd = N;
  let nd = n;
  
  for (let i = 0; i < N; i++) {
      sum_tt += t[i] * t[i];
      sum_t += t[i];
      sum_y += y[i];
      sum_ty += t[i] * y[i];
      sum_tc += t[i] * c[i];
  }
  let y_bar = sum_y / Nd;
  let t_bar = sum_t / Nd;

  let C = sum_tt - (sum_t * sum_t / Nd);
  let sumAB = 0.0;
  let sumAA = 0.0;

  for (let i = 0; i < N; i++) {
      let Ai = 2*c[i] - 
              ((2*nd-Nd)/Nd) +
          (2*(t_bar-t[i])/(C*Nd))*(Nd*sum_tc - nd*sum_t) - 1;
      let Bi = (y[i] - y_bar)
              + ((t_bar - t[i]) / (C * Nd)) * ((Nd * sum_ty) - (sum_t * sum_y));

      sumAB += Ai * Bi;
      sumAA += Ai * Ai;
  }
  let x = -sumAB / (sumLength * sumAA);
  x = Math.min(Math.max(x, 0.0), 1.0);
  let alpha = 1-x;

  // rms
  let yPrime = y.map((e,i) => e + c[i]*((1-alpha)*sumLength) - (1-c[i])*((1-alpha)*sumLength))

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