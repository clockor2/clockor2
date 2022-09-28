import React from 'react';
import Plotly from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";
import { selectData } from './regressionSlice';
import { useAppSelector } from '../../app/hooks';
const Plot = createPlotlyComponent(Plotly);


export function Regression(props: any) {
  const data = useAppSelector(selectData);
  const layout = { width: props.size.width, height: props.size.height };
  return (
    <div>
      <Plot data={data} layout={layout} />
    </div>
  );
}
