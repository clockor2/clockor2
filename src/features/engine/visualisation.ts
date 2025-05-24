import { date_decimal, numToScientific } from "./utils";
import { Model } from "./types";
const chroma = require("chroma-js");

function getColorScale(length: number, isDarkMode: boolean) {
  return length
    ? chroma.scale(['#fafa6e', '#2A4858']).mode('lch').colors(length)
    : isDarkMode ? 'rgb(148,163,184)' : '#000000';
}

function getLegendGroup(groupNames: string[], idx: number) {
  return groupNames[idx] && groupNames[idx].length > 1
    ? groupNames[idx]
    : `Local Clock ${idx}`;
}

export function formatPlotly(lcm: Model | null, isDarkMode = false): any[] | null {
  if (!lcm) return null;

  const plotType = "scattergl";
  const plot: any[] = [];
  const cols = lcm.localClock
    ? getColorScale(lcm.localClock.length, isDarkMode)
    : isDarkMode ? 'rgb(148,163,184)' : '#000000';

  // Global points
  plot.push({
    x: lcm.baseClock.x.map(date_decimal),
    y: lcm.baseClock.y,
    text: lcm.baseClock.tip,
    marker: { color: isDarkMode ? 'rgb(148,163,184)' : '#000000', size: 7 },
    mode: "markers",
    name: "Global",
    legendgroup: "Global",
    showlegend: false,
    type: plotType
  });

  // Global line
  plot.push({
    x: lcm.baseClock.x.map(date_decimal),
    y: lcm.baseClock.fitY,
    name: "Global",
    marker: { color: isDarkMode ? 'rgb(148,163,184)' : '#000000' },
    mode: "lines",
    text: lcm.localClock
      ? `Global<br>R2: ${lcm.baseClock.r2.toFixed(2)}, RMS: ${numToScientific(lcm.baseClock.rms, 2)}`
      : `R2: ${lcm.baseClock.r2.toFixed(2)}, RMS: ${numToScientific(lcm.baseClock.rms, 2)}`,
    legendgroup: "Global",
    type: plotType
  });

  // Local clocks
  lcm.localClock?.forEach((clock, i) => {
    const legendGroup = getLegendGroup(lcm.groupNames, i + 1);
    const color = Array.isArray(cols) ? cols[i] : cols;

    plot.push({
      x: clock.x.map(date_decimal),
      y: clock.y,
      text: clock.tip,
      marker: { color, line: { width: 1, color: isDarkMode ? '#94a3b8' : 'black' } },
      mode: "markers",
      legendgroup: legendGroup,
      name: lcm.groupNames[i + 1],
      showlegend: false,
      type: plotType
    });

    plot.push({
      x: clock.x.map(date_decimal),
      y: clock.fitY,
      text: `${lcm.groupNames[i + 1] ?? `Local Clock ${i + 1}`}<br>R2: ${clock.r2.toFixed(2)}, RMS: ${numToScientific(clock.rms, 2)}`,
      marker: { color, line: { width: 1 } },
      mode: "lines",
      legendgroup: legendGroup,
      name: lcm.groupNames[i + 1],
      type: plotType
    });
  });

  return plot;
}
