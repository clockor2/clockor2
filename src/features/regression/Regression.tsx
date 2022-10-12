import React, { useEffect, useRef } from 'react';
import Plotly from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory"

import { selectData } from './regressionSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectHighlightedId, selectTipNames, setHighlightedId } from '../tree/treeSlice';

const Plot = createPlotlyComponent(Plotly)

export function Regression(props: any) {
  
  const highlightedId = useAppSelector(selectHighlightedId)
  const data = useAppSelector(selectData);
  const isMounted = useRef(false);
  const tipNames = useAppSelector(selectTipNames);
  const dispatch = useAppDispatch();

  const highlightPoint = (id: null | string, tipNames: Array<string>) => {
    let hoverPoints: Array<object>
    if (id === null) {
      hoverPoints = []
    } else {
      hoverPoints = [{curveNumber:0, pointNumber: tipNames.indexOf(id)}]
    }
    // @ts-ignore
    Plotly.Fx.hover('regression', hoverPoints);
  }
  
  useEffect(() => {    
    if (isMounted.current) {
      highlightPoint(highlightedId, tipNames);
    } else {
      isMounted.current = true;
    }
  }, [highlightedId, tipNames])
  
  
  const layout = { 
    width: props.size.width, 
    height: props.size.height,
    uirevision: 'time',
  };

  return (
    <div>
      <Plot divId='regression' onUnhover={() => dispatch(setHighlightedId(null))} onHover={(event) => dispatch(setHighlightedId(tipNames[event.points[0].pointIndex]))} data={data} layout={layout} />
    </div>
  );
}
