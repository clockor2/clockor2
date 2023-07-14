import { useEffect, useRef } from 'react';
import Plotly from "plotly.js";
import { plotify } from '../engine/core';
import { selectCurrentData } from './regressionSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectHighlightedId, selectSelectedIds, setHighlightedId, setSelectedIds } from '../tree/treeSlice';
import Plot from "react-plotly.js";

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
  
  const currentData = plotify(useAppSelector(selectCurrentData));
  const selectedIds = useAppSelector(selectSelectedIds)
  const highlightedId = useAppSelector(selectHighlightedId)
  const isMounted = useRef(false);
  const dispatch = useAppDispatch();

  const onHover = (event:Plotly.PlotHoverEvent) => {
    // @ts-ignore
    dispatch(setHighlightedId(event.points[0].text))
  }

  const onlyUnique = (value: string, index: number, array: Array<string>) => {
    return array.indexOf(value) === index;
  }

  const onSelected = (event:Plotly.PlotSelectionEvent) => {    
    if (event) {
      // @ts-ignore
      const ids  = event.points.map((point) => point.text)
      if (ids.length > 0){
        dispatch(setSelectedIds(ids.filter(onlyUnique)))
      }
    } 
  }

  const onDeselect = () => {    
    dispatch(setSelectedIds([]))
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
  }, [highlightedId, currentData])



  // @ts-ignore
  // plotly bug fix
  var PlotlyData = currentData.map(el => {return {...el, marker:{...el.marker}}})
  if (currentData && selectedIds.length > 0) {
    let selectedpoints = currentData.map(el => {
      let points: Array<any> = [];
      if (Array.isArray(el.text)) {
        points = selectedIds.flatMap(id => {
          const index = el.text?.indexOf(id);
          return index >= 0 ? [index] : [];
        });
      }
      return points
    })
    PlotlyData = PlotlyData.map((obj, index) => {
      return { ...obj, selectedpoints: selectedpoints[index]};
    });
  }
 
  const layout = { 
    uirevision: 'time',
    showlegend: currentData && currentData?.length > 2 ? true : false,
    autosize: true,
    legend: {
      orientation: 'h', 
      x: 0.5, 
      y: 1.05,
      xanchor: 'center',
    },
    margin: {
      l: 60,
      r: 30,
      b: 30,
      t: 5,
      pad: 0
    },
    barmode: 'overlay',
    modebar: {
      // vertical modebar button layout
      orientation: 'v',
      // for demonstration purposes
    },
  };

  const isMobile = window.innerWidth < 768

  return (
    <div className='h-full'>
      <Plot 
        divId='regression' 
        onUnhover={() => dispatch(setHighlightedId(null))} 
        onHover={(event) => onHover(event)}
        onSelecting={(event) => onSelected(event)}
        onDeselect={() => onDeselect()}
        data={PlotlyData}  
        // @ts-ignore
        layout={layout}
        style={{width: "100%", height: isMobile ? "250px" : "100%" }}
        config={{
          responsive: true, 
          displaylogo: false, 
          toImageButtonOptions: {
            format: 'svg', // one of png, svg, jpeg, webp
            filename: 'clockor2',
            // height: 500,
            // width: 700,
            scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
        }}}
      />
    </div>
  );
}
