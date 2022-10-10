// eslint-disable-next-line 

/* TO DO LIST @ 2022-10-10
- Add if/for flow control to handle groups
- Add core function for tree clock search
*/


import {phylotree, rootToTip} from "phylotree"

//////////////////////////////////////////////////////
// BELOW: CORE ENGINE FUNCTIONS SUCH AS SOMETHING() //
// INCORPORATE FUNCTIONS DEFINED BELOW              //
//////////////////////////////////////////////////////

// Core function. Functionality for groups to be added
export const something = (dates: Array<number>, group: Array<number>, nwk: string) => {
  var dataPoints = basePoints(nwk, dates);
  const data = [
    dataPoints,
    linearRegression(dataPoints)
    ];
  return data;
}

////////////////////////////////////////////////////////
// BELOW: FUNCTIONS USED INSIDE CORE ENGINE FUNCTIONS //
////////////////////////////////////////////////////////

// Define basic plot class, instances of which will form the data part of the plotly command
class plotData {
  x: Array<number> = [];
  y: Array<number> = [];
  mode: string = "";
}


// function gets base points for whole regression. Later subdivided by `group`
const basePoints = (nwk: string, dates: Array<number>) => { 
  const tree = new phylotree(nwk);
  let y =   rootToTip(tree).getTips().map((tip: any) => tip.data.rootToTip); // TODO: find tip type
  let x = dates;
  const points = new plotData()
  points.x = x;
  points.y = y;
  points.mode = "markers";

  return points;
}

// regression function takes basePoints() output as input
function linearRegression(points: plotData){
  let x = points.x;
  let y = points.y;

  var n = y.length;
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var sum_yy = 0;

  for (var i = 0; i < y.length; i++) {
      sum_x += x[i];
      sum_y += y[i];
      sum_xy += (x[i]*y[i]);
      sum_xx += (x[i]*x[i]);
      sum_yy += (y[i]*y[i]);
  } 

  // Include these later after agreeing on how to pass to front end
  let slope = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
  let intercept = (sum_y - slope * sum_x)/n;
  let r2 = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

  const lr = new plotData();
  lr.x = [x[0], x[x.length - 1]];
  lr.y = [
    x[0] * slope + intercept,
    x[x.length - 1] * slope + intercept
    ];
  lr.mode = "lines+markers";

  return lr;
}