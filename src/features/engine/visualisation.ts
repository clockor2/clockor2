import { date_decimal, numToScientific } from "./utils";
import { LocalClockModel } from "./types";
const chroma = require("chroma-js") // TODO: Learn about why this works instead of import

// function to make plottable points
// method for plotly plotting
export function formatPlotly(lcm: LocalClockModel | null, isDarkMode=false): any[] | null {
  const plotType = "scattergl";
  const plot = [] as any[];
  if (lcm != null) {
    // generate colour scale. Use viridis-ish default
    const cols = lcm.localClock !== undefined
      ?
      chroma.scale(['#fafa6e', '#2A4858']).mode('lch').colors(lcm.localClock.length)
      :
      isDarkMode ? 'rgb(148,163,184)' : '#000000';

    // Pushing plotly object for base lock
    var point = {
      x: lcm.baseClock.x.map(e => date_decimal(e)),
      y: lcm.baseClock.y,
      text: lcm.baseClock.tip,
      marker: {color: isDarkMode ? 'rgb(148,163,184)' : '#000000', size: 7},
      mode: "markers",
      name: "Global",
      legendgroup: "Global",
      showlegend: false,
      type: plotType
    }
    plot.push(point);

    var line = {
      x: lcm.baseClock.x.map(e => date_decimal(e)),
      y: lcm.baseClock.fitY,
      name: "Global",
      marker : {color: isDarkMode ? 'rgb(148,163,184)' : '#000000'},
      mode: "lines",
      text: lcm.localClock
      ? 
        `Global<br>R2: ${lcm.baseClock.r2.toFixed(2)}, RMS: ${numToScientific(lcm.baseClock.rms, 2)}` 
      : 
        `R2: ${lcm.baseClock.r2.toFixed(2)}, RMS: ${numToScientific(lcm.baseClock.rms, 2)}`,

      legendgroup: "Global",
      type: plotType
    }
    plot.push(line);

    // pushing plotly object for each local clock
    if (lcm.localClock){
      for (let i = 0; i < lcm.localClock.length; i++) {
        let legendGroup
        if (lcm.groupNames[i+1] !== undefined) {
          legendGroup = lcm.groupNames[i+1].length > 1 ? lcm.groupNames[i+1] : `Local Clock ${i+1}`
        } else {
          legendGroup = `Local Clock ${i+1}`;
        }
        
        var point1 = {
          x: lcm.localClock[i].x.map(e => date_decimal(e)),
          y: lcm.localClock[i].y,
          text: lcm.localClock[i].tip,
          marker: {color: cols[i], line: {width: 1, color: isDarkMode ? '#94a3b8' : 'black'}},
          mode: "markers",
          legendgroup: legendGroup,
          name: lcm.groupNames[i+1],
          showlegend: false,
          type: plotType
        }
        plot.push(point1);

        var line1 = {
          x: lcm.localClock[i].x.map(e => date_decimal(e)),
          y: lcm.localClock[i].fitY,
          text: `${lcm.groupNames[i+1] ?? `Local Clock ${i+1}`}<br>R2: ${lcm.localClock[i].r2.toFixed(2)}, RMS: ${numToScientific(lcm.localClock[i].rms, 2)}`,
          marker : {color: cols[i], line: {width: 1}},
          mode: "lines",
          legendgroup: legendGroup,
          name: lcm.groupNames[i+1],
          type: plotType
        }
        plot.push(line1);
      }
    }
      return plot;
  } else {
    return null;
  }
}
