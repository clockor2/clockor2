import React from 'react';
import Plotly from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);


export function Regression(props: any) {
  const data = [
    {
      x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      y: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      mode: "lines",
    },
  ];
  const layout = { width: props.size.width, height: props.size.height };
  return (
    <div>
      <Plot data={data} layout={layout} />
    </div>
  );
}
