import React, { useEffect, useRef } from 'react';
import Plotly from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory"
import { plotify } from '../engine/core';
import { selectCurrentData } from './regressionSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectHighlightedId, selectTipNames, setHighlightedId } from '../tree/treeSlice';
import { EnumDeclaration } from 'typescript';

const Plot = createPlotlyComponent(Plotly)

function getPointNumber(id:string, data: Plotly.Data[]) {
  let i = -1
  let curve = 0
  for (const d of data) {
    if (Array.isArray(d.text)) {
      i = d.text?.indexOf(id)
      if (i >= 0) {
        return [{curveNumber:curve, pointNumber: i}]
      }
    }
    curve++

  }
  return []
}

export function Regression(props: any) {
  
  const highlightedId = useAppSelector(selectHighlightedId)
  const currentData = plotify(useAppSelector(selectCurrentData));
  const isMounted = useRef(false);
  const dispatch = useAppDispatch();

  const onHover = (event:Plotly.PlotHoverEvent) => {
    // @ts-ignore
    dispatch(setHighlightedId(event.points[0].text))
  }

  const highlightPoint = (id: null | string, data: Plotly.Data[]) => {
    let hoverPoints: Array<object>
    if (id === null) {
      hoverPoints = []
    } else {
      hoverPoints = getPointNumber(id, data)
    }
    // @ts-ignore
    Plotly.Fx.hover('regression', hoverPoints);
  }
  
  useEffect(() => {        
    if (isMounted.current && currentData != null) {
      highlightPoint(highlightedId, currentData);
    } else {
      isMounted.current = true;
    }
    console.log('hoverPoints', currentData);
  }, [highlightedId, currentData])


   
  // @ts-ignore
  // plotly bug fix
  var PlotlyData = currentData.map(el => {return {...el, marker:{...el.marker}}})

  const layout = { 
    uirevision: 'time',
    showlegend: currentData && currentData?.length > 2 ? true : false,
    autosize: true,
    legend: {
      y: 0.5
    },
    margin: {
      l: 60,
      r: 30,
      b: 30,
      t: 30,
      pad: 0
    },
  };

  return (
    <div className='h-full'>
      <Plot 
        divId='regression' 
        onUnhover={() => dispatch(setHighlightedId(null))} 
        onHover={(event) => onHover(event)}
        data={PlotlyData}  
        layout={layout}
        style={{width: "100%", height: "100%"}}
        config={{responsive: true}}
      />
    </div>
  );
}
