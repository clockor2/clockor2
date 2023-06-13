import { date_decimal } from "./utils";
const chroma = require("chroma-js") // TODO: Learn about why this works instead of import

// class to contain local clock model, incl. data points and information criteria
export interface LocalClockModel {
  baseClock: Regression;
  localClock: Regression[];
  baseIC: InfoMetric;
  localIC: InfoMetric;
  groupNames: string[];
}
// interface for info metric data
interface InfoMetric {
  aic: number;
  aicc: number;
  bic: number;
}

// function to make plottable points
// method for plotly plotting
export function plotify(lcm: LocalClockModel | null): any[] | null {
  const plot = [] as any[];
  if (lcm != null) {
    // generate colour scale. Use viridis-ish default
    const cols = lcm.localClock !== undefined
      ?
      chroma.scale(['#fafa6e', '#2A4858']).mode('lch').colors(lcm.localClock.length)
      :
      "DarkSlateGrey";

    // Pushing plotly object for base lock
    var point = {
      x: lcm.baseClock.x.map(e => date_decimal(e)),
      y: lcm.baseClock.y,
      text: lcm.baseClock.tip,
      marker: {color: '#000000', size: 5},
      mode: "markers",
      name: "Global",
      legendgroup: "Global",
      showlegend: false,
      type: "scattergl"
    }
    plot.push(point);

    var line = {
      x: lcm.baseClock.x.map(e => date_decimal(e)),
      y: lcm.baseClock.fitY,
      name: "Global",
      marker : {color: '#000000'},
      mode: "lines",
      text: lcm.localClock
      ? 
        `Global<br>R2: ${lcm.baseClock.r2.toFixed(2)}` 
      : 
        `R2: ${lcm.baseClock.r2.toFixed(2)}`,

      legendgroup: "Global",
      type: "scattergl"
    }
    plot.push(line);

    // pushing plotly object for each local clock
    if (lcm.localClock){
      for (let i = 0; i < lcm.localClock.length; i++) {
        var point1 = {
          x: lcm.localClock[i].x.map(e => date_decimal(e)),
          y: lcm.localClock[i].y,
          text: lcm.localClock[i].tip,
          marker: {color: cols[i], line: {width: 1, color: 'DarkSlateGrey'}},
          mode: "markers",
          legendgroup: lcm.groupNames[i+1].length > 1 ? lcm.groupNames[i+1] : `Local Clock ${i+1}`,
          name: lcm.groupNames[i+1],
          showlegend: false,
          type: "scattergl"
        }
        plot.push(point1);

        var line1 = {
          x: lcm.localClock[i].x.map(e => date_decimal(e)),
          y: lcm.localClock[i].fitY,
          text: `${lcm.groupNames[i+1] ?? `Local Clock ${i+1}`}<br>R2: ${lcm.localClock[i].r2.toFixed(2)}`,
          marker : {color: cols[i], line: {width: 1, color: 'DarkSlateGrey'}},
          mode: "lines",
          legendgroup: lcm.groupNames[i+1].length > 1 ? lcm.groupNames[i+1] : `Local Clock ${i+1}`,
          name: lcm.groupNames[i+1],
          type: "scattergl"
        }
        plot.push(line1);
      }
    }
      return plot;
  } else {
    return null;
  }
}

export interface Regression {
  x: Array<number>;
  y: Array<number>;
  tip: Array<string>;
  fitY: Array<number>;
  slope: number;
  intercept: number;
  sigSq: number;
  r2: number;
  logLik: number;
}

// Groups of points pertaining to one local clock
// To be apended in array for linearRegression()
interface DataGroup {
  x: Array<number>;
  y: Array<number>;
  tip: Array<string>;
  name: string;
}

//////////////////////////////////////////////////////
// BELOW: CORE ENGINE FUNCTIONS SUCH AS SOMETHING() //
// INCORPORATE FUNCTIONS DEFINED BELOW              //
//////////////////////////////////////////////////////

// Core function. Functionality for groups to be added
export const regression = (
  tipHeights: Array<number>,
  dates: Array<number>,
  groupings: Array<string>,
  tipNames: Array<string>) => {

  var dataPoints = groupData(tipHeights, dates, groupings, tipNames);

  var lcm = {} as LocalClockModel;
  
  lcm.baseClock = linearRegression(dataPoints[0]);
  lcm.baseIC = {} as InfoMetric;
  lcm.baseIC.aic = AIC([lcm.baseClock]);
  lcm.baseIC.aicc = AICc([lcm.baseClock]);
  lcm.baseIC.bic = BIC([lcm.baseClock]);

  if (dataPoints.length > 1) {
    lcm.localClock = dataPoints.slice(1).map(e => linearRegression(e));
    lcm.localIC = {} as InfoMetric;
    lcm.localIC.aic = AIC(lcm.localClock);
    lcm.localIC.aicc = AICc(lcm.localClock);
    lcm.localIC.bic = BIC(lcm.localClock);
  }

  lcm.groupNames = dataPoints.map(e => e.name)
  
  return lcm;
}

////////////////////////////////////////////////////////
// BELOW: FUNCTIONS USED INSIDE CORE ENGINE FUNCTIONS //
////////////////////////////////////////////////////////

// function groups points for local clock regresion
// 0th element of array is always points for single clock
export const groupData = (
  tipHeights: Array<number>,
  dates: Array<number>,
  groupings:  Array<string>,
  tipNames: Array<string>
  ): DataGroup[] => { 

  const points: DataGroup[] = [];

  let unique = groupings.filter((v, i, a) => a.indexOf(v) === i).sort();
  let numericGroupings =  groupings.map(group => unique.indexOf(group))

  for (let i = 0; i < unique.length; i++) {
    var tmp: DataGroup = {x: [], y: [], tip: [], name: unique[i]};
    points.push(tmp);
  }

  for (let i = 0; i < groupings.length; i++) {
    points[numericGroupings[i]].x.push(
      dates[i]
    )
    points[numericGroupings[i]].y.push(
      tipHeights[i]
    )
    points[numericGroupings[i]].tip.push(
      tipNames[i]
    )
  }
  // if  num groups > 1, append the baseline fit (all points in one group)
  // In the case num groups = 1, this is automatically appended
  if (unique.length > 1) {
    points.unshift({
      x: dates,
      y: tipHeights,
      tip: tipNames,
      name: "Global"
    })}

  return points;
}

// regression function 
export function linearRegression(points: DataGroup) {
  let reg = {} as Regression;

  reg.tip = points.tip;

  let x = points.x;
  let y = points.y;

  let sum_x = 0;
  let n = y.length;
  let sum_y = 0;
  let sum_xy = 0;
  let sum_xx = 0;
  let sum_yy = 0;

  for (let j = 0; j < y.length; j++) {
      sum_x += x[j];
      sum_y += y[j];
      sum_xy += (x[j]*y[j]);
      sum_xx += (x[j]*x[j]);
      sum_yy += (y[j]*y[j]);
  } 

  reg.x = x;
  reg.y = y;
  reg.slope = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
  reg.intercept = (sum_y - reg.slope * sum_x)/n;
  reg.fitY = x.map(e => (reg.slope * e + reg.intercept));
  reg.r2 = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
  
  let error = y.map((n, i, a) => y[i] - reg.fitY[i]); 
  // estiamted variance of error
  let sigSq = error.map(n => Math.pow(n, 2)).reduce(
    (a, b) => a + b, 0) * (1 / reg.fitY.length);
  reg.logLik = y.map((e, i) => Math.log(
    normalDensity(e, reg.fitY[i], sigSq)
    )
    ).reduce(
      (a, b) => a + b
      ); 

  return reg;
}

// Function for likelihood in linearRegression() function
 export function normalDensity(y: number, mu: number, sigSq: number) {
  let exp = -0.5 * ((y - mu) ** 2) / sigSq; // exponent
  let norm = 1 / (Math.sqrt(2 * Math.PI * sigSq)); // normalising factor
  return norm * (Math.E ** exp);
}

// Information criteria functions below 
export function AICc(regs: Regression[]): number {
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

export function AIC(regs: Regression[]): number {
  var f = regs.length;
  var totLogLik = 0;

  for (let i = 0; i < regs.length; i++) {
    if (regs[i].logLik) {
      totLogLik += regs[i].logLik;
    }
  }
    return (-2 * totLogLik + (6 * f)); 
}

export function BIC(regs: Regression[]): number {
  var f = regs.length;
  var n = regs.map((n, i, a) => regs[i].y.length).reduce(
    (a, b) => a + b, 0)
  var totLogLik = 0;

  for (let i = 0; i < regs.length; i++) {
    if (regs[i].logLik) {
      totLogLik += regs[i].logLik;
    }
  }
    return (3 * f * Math.log(n) - (2 * totLogLik)); 
}