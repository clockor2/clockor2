// eslint-disable-next-line 

import { register } from "plotly.js";
import { RegressionData } from "../regression/regressionSlice";

/* TO DO LIST @ 2022-10-10
- Add if/for flow control to handle groups
- Add core function for tree clock search
- Add calculations for likelihood and ICs - finish from resid point
*/

//////////////////////////////////////////////////////
// BELOW: CORE ENGINE FUNCTIONS SUCH AS SOMETHING() //
// INCORPORATE FUNCTIONS DEFINED BELOW              //
//////////////////////////////////////////////////////

// Core function. Functionality for groups to be added
export const regression = (tipHeights: Array<number>, dates: Array<number>, groupings: Array<number>, tipNames: Array<string>) => {
  var dataPoints = basePoints(tipHeights, dates, groupings, tipNames);
  var regPoints = linearRegression(dataPoints);
  // Below we add each RegresionData Object in regPoints to dataPoints
  for (let i = 0; i < regPoints.length; i++){
    dataPoints.push(regPoints[i]);
  };
  /*const data = [
    dataPoints,
    linearRegression(dataPoints)
    ];*/
  return dataPoints;
}

////////////////////////////////////////////////////////
// BELOW: FUNCTIONS USED INSIDE CORE ENGINE FUNCTIONS //
////////////////////////////////////////////////////////


// function gets base points for whole regression. Later subdivided by `group`
const basePoints = (tipHeights: Array<number>, dates: Array<number>, groupings: Array<number>, tipNames: Array<string>): RegressionData[] => { 
  let unique = groupings.filter((v, i, a) => a.indexOf(v) === i);
  //let points = unique.map(() => {} as RegressionData);
  //let points:[] Array<RegressionData>
  //let groups = unique.map(() => {return {y: Array<number>; x: Array<number>}})

  const points: RegressionData[] = [];
  for (let i = 0; i < unique.length; i++) {
    var tmp: RegressionData = {x: [], y: [], mode: "markers", text: [], name: `Clock: ${unique[i]}`, logLik: 0};
    points.push(tmp);
  }
  for (let i = 0; i < groupings.length; i++) {
    points[groupings[i]].x.push(
      dates[i]
    )
    points[groupings[i]].y.push(
      tipHeights[i]
    )
    points[groupings[i]].text.push(
      tipNames[i]
    )
  }
  return points;
}

// regression function takes basePoints() output as input
function linearRegression(points: RegressionData[]){
  const reg: RegressionData[] = [];
  for (let i = 0; i < points.length; i++) {
    let x = points[i].x;
    let y = points[i].y;

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
    let slope = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
    let intercept = (sum_y - slope * sum_x)/n;
    let r2 = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
    let fitY = x.map(x => ((slope * x) + intercept));
    let error = y.map((n, i, a) => y[i] - fitY[i]); 
    // estiamted variance of error
    let sigSq = error.map(n => Math.pow(n, 2)).reduce(
      (a, b) => a + b, 0) * (1 / fitY.length);
    // likelihood
    let logLik = y.map((e, i) => Math.log(normalDensity(e, fitY[i], sigSq))).reduce((a, b) => a + b); 

    var lr = {} as RegressionData;
    lr.x = [x.sort((a, b) => a - b)[0], x.sort((a, b) => a - b)[x.length - 1]];
    lr.y = [
      x.sort((a, b) => a - b)[0] * slope + intercept,
      x.sort((a, b) => a - b)[x.length - 1] * slope + intercept
      ];
    lr.mode = "lines+markers";
    lr.name = `Clock: ${i}`; // Later change group names so there's no 0th clock
    //lr.logLik = Math.log(lik); // adding loglik
    lr.logLik = logLik;
    //lr.text = fitY.map(() => `sigmaHat: ${sigSq}`); // Later change or add  AICc, BIC, or whatever depending on input

    reg.push(lr)
  }

  // adding IC to text
  let aicc = AICc(reg);
  let aic = AIC(reg);
  let bic = BIC(reg);
  for (let i = 0; i < reg.length; i++) {
    reg[i].text = reg[i].y.map(() => `Log-Lik = ${lr.logLik.toFixed(3)}, AICc = ${aicc.toFixed(3)},<br> AIC = ${aic.toFixed(3)}, BIC = ${bic.toFixed(3)}`);
  }
  return reg;
}

// Function for likelihood in linearRegression() function
function normalDensity(y: number, mu: number, sigSq: number) {
  let exp = -0.5 * ((y - mu) ** 2) / sigSq; // exponent
  let norm = 1 / (Math.sqrt(2 * Math.PI * sigSq)); // normalising factor
  return norm * (Math.E ** exp);
}

// Information criteria function below 
function AICc(regs: RegressionData[]): number {
  var f = regs.length;
  var n = regs.map((n, i, a) => regs[i].y.length).reduce(
    (a, b) => a + b, 0)
  var totLogLik = 0;

  for (let i = 0; i < regs.length; i++) {
    if (regs[i].logLik) {
      totLogLik += regs[i].logLik; // Use optional chaining here eventually
    }
  }
    return (-2 * totLogLik + ((6 * f * n) / (n - (3 * f) - 1))); 
}

function AIC(regs: RegressionData[]): number {
  var f = regs.length;
  var n = regs.map((n, i, a) => regs[i].y.length).reduce(
    (a, b) => a + b, 0)
  var totLogLik = 0;

  for (let i = 0; i < regs.length; i++) {
    if (regs[i].logLik) {
      totLogLik += regs[i].logLik; // Use optional chaining here eventually
    }
  }
    return (-2 * totLogLik + (6 * f)); 
}

function BIC(regs: RegressionData[]): number {
  var f = regs.length;
  var n = regs.map((n, i, a) => regs[i].y.length).reduce(
    (a, b) => a + b, 0)
  var totLogLik = 0;

  for (let i = 0; i < regs.length; i++) {
    if (regs[i].logLik) {
      totLogLik += regs[i].logLik; // Use optional chaining here eventually
    }
  }
    return (3 * f * Math.log(n) - (-2 * totLogLik)); 
}
// TODO:
// - sort out issue with ?: RegressionData[] elements. Would be nice to use optional chaining