// eslint-disable-next-line 


// import {phylotree, rootToTip} from "phylotree" // for clock search TODO: Add best fitting root soon!
// import { group } from "console";
// import { maxHeaderSize } from "http";

const chroma = require("chroma-js") // TODO: Learn about why this works instead of import

// class to contain local clock model, incl. data points and information criteria
export class LocalClockModel {
  clocks: Regression[];
  aic: number;
  aicc: number;
  bic: number;

  constructor(data: dataGroup[]) {
    this.clocks = data.map(e => linearRegression(e));
    this.aic = AIC(this.clocks);
    this.aicc = AICc(this.clocks);
    this.bic = BIC(this.clocks);
  };

  // method for plotly plotting
  plotify (): Plotly.Data[] {
    const plot = [];
    // generate colour scale. Use viridis-ish default
    const cols = chroma.scale(['#fafa6e','#2A4858']).mode('lch').colors(this.clocks.length);
    console.log(cols);

    for (let i = 0; i < this.clocks.length; i++) {
      var point = {
        x: this.clocks[i].x,
        y: this.clocks[i].y,
        text: this.clocks[i].tip,
        marker: {color: cols[i]},
        mode: "markers"
      }

      console.log(point);
      plot.push(point);

      var line = {
        x: this.clocks[i].x,
        y: this.clocks[i].fitY,
        text: `Local Clock: ${i}`,
        color: cols[i],
        marker : {color: cols[i]},
        mode: "lines"
      }

      console.log(line)
      plot.push(line);
    }
      return plot;
    }
}


interface Style {
  color: string;
}

// Class to pass back to plot later. Will be produced by plotify method in 
// flcModel class
// interface Data extends Plotly.PlotData {
//   color: string
// }

// class regression for storing the points, r^2, slope, fit for a set of points x, y
// inferface for ouput of regression functions
interface Regression {
  x: Array<number>;
  y: Array<number>;
  tip: Array<string>;
  fitY: Array<number>;
  slope: number;
  r2: number;
  logLik: number;
}

// Groups of points pertaining to one local clock
// To be apended in array for linearRegression()
interface dataGroup {
  x: Array<number>;
  y: Array<number>;
  tip: Array<string>;
}

//////////////////////////////////////////////////////
// BELOW: CORE ENGINE FUNCTIONS SUCH AS SOMETHING() //
// INCORPORATE FUNCTIONS DEFINED BELOW              //
//////////////////////////////////////////////////////

// Core function. Functionality for groups to be added
export const regression = (tipHeights: Array<number>, dates: Array<number>, groupings: Array<number>, tipNames: Array<string>) => {
  var dataPoints = basePoints(tipHeights, dates, groupings, tipNames);
  
  return new LocalClockModel(dataPoints);
}

// Clock search function. Conver to a generator later
// icMetric is the information criterion used to find 'best' state. TODO: Need to read these as part of input: aic | aicc | bic
export const clockSearch = (tree: any,
  minCladeSize: number,
  numClocks: number,
  tipHeights: Array<number>,
  dates: Array<number>,
  tipNames: Array<string>,
  icMetric: string) => {

  // generate all possibilities for groupings
  let allGroups = getGroups(tree, minCladeSize, numClocks);

  // Loop through group possibilities and append to fits
  let fits: LocalClockModel[] = [];
  for (let i = 0; i < allGroups.length; i++){
      fits.push(regression(tipHeights, dates, allGroups[i], tipNames)); 
  }

  // Now find the most supported configuration
  // Getting array of IC values based on selected IC TODO: Add capability for multiple ICs
  const ic = fits.map(e => e[icMetric as keyof LocalClockModel]) // TODO: Test here!

  var icMaxStep = ic.indexOf(Math.max(...(ic as number[]))); // TODO: This might throw an error if we never see output

  return fits[icMaxStep];
}

////////////////////////////////////////////////////////
// BELOW: FUNCTIONS USED INSIDE CORE ENGINE FUNCTIONS //
////////////////////////////////////////////////////////

// function gets base points for whole regression. Later subdivided by `group`
const basePoints = (tipHeights: Array<number>, dates: Array<number>, groupings: Array<number>, tipNames: Array<string>): dataGroup[] => { 
  let unique = groupings.filter((v, i, a) => a.indexOf(v) === i);

  const points: dataGroup[] = [];

  for (let i = 0; i < unique.length; i++) {
    var tmp: dataGroup = {x: [], y: [], tip: []};
    points.push(tmp);
  }

  for (let i = 0; i < groupings.length; i++) {
    points[groupings[i]].x.push(
      dates[i]
    )
    points[groupings[i]].y.push(
      tipHeights[i]
    )
    points[groupings[i]].tip.push(
      tipNames[i]
    )
  }

  // if  num groups > 1, append the baseline fit (all points in one group)
  // For this, we can exclude points
  if (unique.length > 1) {
    points.unshift({
      x: dates,
      y: tipHeights,
      tip: tipNames
    })
  }
  
  return points;
}

// regression function 
function linearRegression(points: dataGroup) {
  const reg = {} as Regression;

  // carrying tips over first
  reg.tip = points.tip;

  let x = points.x;
  let y = points.y;

  var n = y.length;
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var sum_yy = 0;

  for (let j = 0; j < y.length; j++) {
      sum_x += x[j];
      sum_y += y[j];
      sum_xy += (x[j]*y[j]);
      sum_xx += (x[j]*x[j]);
      sum_yy += (y[j]*y[j]);
  } 

  // Include these later after agreeing on how to pass to front end
  reg.x = x;
  reg.y = y;
  reg.slope = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
  let intercept = (sum_y - reg.slope * sum_x)/n;
  reg.fitY = x.map(e => (reg.slope * e + intercept));
  reg.r2 = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
  //calculate log likelihood
  
  let error = y.map((n, i, a) => y[i] - reg.fitY[i]); 
  // estiamted variance of error
  let sigSq = error.map(n => Math.pow(n, 2)).reduce(
    (a, b) => a + b, 0) * (1 / reg.fitY.length);
  reg.logLik = y.map((e, i) => Math.log(normalDensity(e, reg.fitY[i], sigSq))).reduce((a, b) => a + b); 

  return reg;
}

// Function for likelihood in linearRegression() function
function normalDensity(y: number, mu: number, sigSq: number) {
  let exp = -0.5 * ((y - mu) ** 2) / sigSq; // exponent
  let norm = 1 / (Math.sqrt(2 * Math.PI * sigSq)); // normalising factor
  return norm * (Math.E ** exp);
}

// Information criteria functions below 
function AICc(regs: Regression[]): number {
  var f = regs.length;
  var n = regs.map((n, i, a) => regs[i].y.length).reduce(
    (a, b) => a + b, 0)
  var totLogLik = 0;

  for (let i = 0; i < regs.length; i++) {
    if (regs[i].logLik) {
      totLogLik += regs[i].logLik;
    }
  }
    return (-2 * totLogLik + ((6 * f * n) / (n - (3 * f) - 1))); 
}

function AIC(regs: Regression[]): number {
  var f = regs.length;
  var n = regs.map((n, i, a) => regs[i].y.length).reduce(
    (a, b) => a + b, 0)
  var totLogLik = 0;

  for (let i = 0; i < regs.length; i++) {
    if (regs[i].logLik) {
      totLogLik += regs[i].logLik;
    }
  }
    return (-2 * totLogLik + (6 * f)); 
}

function BIC(regs: Regression[]): number {
  var f = regs.length;
  var n = regs.map((n, i, a) => regs[i].y.length).reduce(
    (a, b) => a + b, 0)
  var totLogLik = 0;

  for (let i = 0; i < regs.length; i++) {
    if (regs[i].logLik) {
      totLogLik += regs[i].logLik;
    }
  }
    return (3 * f * Math.log(n) - (-2 * totLogLik)); 
}


function getGroups (tree: any, minCladeSize: number, maxNumClocks: number): Array<Array<number>> { // TODO: Review type declarations here
  // NB. Tips from tree are in identical order to that extected by regression. 
  // Conferred with L38 @ ../tree/treeSlice.ts/

  // Clades descending from each node
  var tips: any = [];
  tree.nodes.each((node: any) => tips.push(node.leaves())); 
  var tips = tips.map((e0: any) => e0.map((e1: any) => e1.data.name));

  // De-duplicate clades (artefact from d3 hierarchy)
  // Have verified that length of output = num internal nodes
  var uniqueTips = tips.map(
    (e: string[]) => JSON.stringify(e)
    ).filter(
      (e: string[], i: number, a: string[][]) => {return a.indexOf(e) === i}
      ).map(
       (e: string) => JSON.parse(e)
        )

  // Sort clades based on size. Largest (all tips) goes first
  var sortedUniqueTips = uniqueTips.sort((a: string[], b: string[]) => {return b.length - a.length});

  // Filter out all clades below certain ${minCladeSize} in size;
  var finalClades = sortedUniqueTips.filter((e: string[]) => e.length >= minCladeSize);

  // Now generate groups
  let comb = combn(Array.from(Array(finalClades.length).keys()).map((e: number, i: number ) => i+1), (maxNumClocks - 1));
  // add 0th clade for background rate
  // Issue us here adding zero!. the .unshift method modified combn in place. 
  //Assigning to a new variable only assigns lengths
  comb.map((e: number[]) => e.unshift(0)); 

  // Convert number combinations to clade combinations
  let allGroups: string[][][] = [];
  for (let i = 0; i < comb.length; i++){
    var tmp = comb[i];
    allGroups[i] = tmp.map((e: number) => finalClades[e]);
  }

  let allGroupsNumber = allGroups.map((e: string[][]) => groupToNum(e, tips));
  return allGroupsNumber;
}

// A function that takes a list of tips and returns group number based on an element of allGroups
function groupToNum(arr: string[][], tips: string[]): number[] {
    let groupings: number[] = []; 

    for (let i = 0; i < tips.length; i++){
      var tmp = [];
      for (let j = 0; j < arr.length; j++) {
        if (arr[j].indexOf(tips[i]) > -1) {
          groupings[i] = j;
        } 
      }
    }
  return groupings;
} // TODO: Include a test here to check that output is all integers


// generating combinations of groups
function combn(arr: any[], k: number): number[][] {
  // Store all possible combinations in a result array
  const result: number[][] = [];

  // Generate all combinations using a recursive helper function
  function generateCombinations(currentIndex: number, currentCombination: any[]): void {
    // If the current combination has the desired length, add it to the result array
    if (currentCombination.length === k) {
      result.push(currentCombination);
      return;
    }

    // Generate all possible combinations starting from the next element in the array
    for (let i = currentIndex; i < arr.length; i++) {
      generateCombinations(i + 1, currentCombination.concat(arr[i]));
    }
  }

  // Start the recursive process with the first element in the array
  generateCombinations(0, []);

  // Return the result array
  return result;
}