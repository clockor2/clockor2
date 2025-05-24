
import { linearRegression, AIC, AICc, BIC } from "./statistical";
import { Model, DataGroup, InfoCriteria } from "./types";


// Core function. Functionality for groups to be added
export function regression(
  tipHeights: Array<number>,
  dates: Array<number>,
  groupings: Array<string>,
  tipNames: Array<string>): Model {

  var dataPoints = groupData(tipHeights, dates, groupings, tipNames);

  var lcm = {} as Model;
  
  lcm.baseClock = linearRegression(dataPoints[0]);
  lcm.baseIC = {} as InfoCriteria;
  lcm.baseIC.aic = AIC([lcm.baseClock]);
  lcm.baseIC.aicc = AICc([lcm.baseClock]);
  lcm.baseIC.bic = BIC([lcm.baseClock]);

  if (dataPoints.length > 1) {
    lcm.localClock = dataPoints.slice(1).map(e => linearRegression(e));
    lcm.localIC = {} as InfoCriteria;
    lcm.localIC.aic = AIC(lcm.localClock);
    lcm.localIC.aicc = AICc(lcm.localClock);
    lcm.localIC.bic = BIC(lcm.localClock);
  }

  lcm.groupNames = dataPoints.map(e => e.name)
  
  return lcm;
}

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