import { useEffect, useRef } from 'react';
import Plotly, {ScatterData} from "plotly.js";
import { formatPlotly } from '../engine/visualisation';
import { decimal_date } from '../engine/utils';
import { selectCurrentData } from './regressionSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectHighlightedId, selectSelectedIds, setHighlightedId, setSelectedIds } from '../tree/treeSlice';
import { useDarkMode } from '../utils/darkmode';
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
  const isDarkMode = useDarkMode();
  // Use useRef to hold the plotly data to avoid unnecessary computations
  const plotlyDataRef = useRef<Plotly.Data[]>([]);
  const selectedIds = useAppSelector(selectSelectedIds);
  const highlightedId = useAppSelector(selectHighlightedId);
  const dispatch = useAppDispatch();
  const currentDataSelector = useAppSelector(selectCurrentData);

  useEffect(() => {
    // convert data to plotly format
    const currentData = formatPlotly(currentDataSelector, isDarkMode);
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
    plotlyDataRef.current = PlotlyData; // store data for download
  }, [currentDataSelector, isDarkMode, selectedIds]); // Dependencies
  
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
    // Ensure this runs only after the component is mounted and when highlightedId changes
    if (highlightedId) {
      highlightPoint(highlightedId, plotlyDataRef.current);
    }
  }, [highlightedId]);


  const layout: Plotly.Layout = { 
      uirevision: 'time',
      showlegend: true,
      autosize: true,
      legend: {
        orientation: 'h', 
        x: 0.5, 
        y: 1.05,
        xanchor: 'center',
        font: {color: isDarkMode ? 'rgb(148,163,184)' : '#2c3e50'},
      },
      margin: {
        l: 60,
        r: 30,
        b: 30,
        t: 5,
        pad: 0
      },
      barmode: 'overlay',
      // @ts-ignore
      modebar: {
        // vertical modebar button layout
        orientation: 'v',
      },
      plot_bgcolor: isDarkMode ? 'rgb(15,23,42)' : 'white',
      paper_bgcolor: isDarkMode ? 'rgb(15,23,42)' : 'white',
      yaxis: {showticklabels: true, zeroline: true, color: isDarkMode ? 'rgb(148,163,184)' : '#2c3e50'},
      xaxis: { zeroline: false, color: isDarkMode ? 'rgb(148,163,184)' : '#2c3e50'},
    };

  const isMobile = window.innerWidth < 768

  const downloadDataButton: Plotly.ModeBarButton = {
    name: 'Download plot data',
    title: 'Download plot data',
    icon: {
      'svg': '<svg xmlns="http://www.w3.org/2000/svg" fill="none" class="dark:text-slate-500 text-slate-300 dark:hover:text-slate-300 hover:text-slate-500 mt-1" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>',
    },
    click: () => {
      downloadObjectAsCsv('clockor2')
    }
  }

  const downloadImageButton: Plotly.ModeBarButton = {
    name: 'Download plot image',
    title: 'Download plot image',
    icon: {
      'svg': '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="dark:text-slate-500 text-slate-300 dark:hover:text-slate-300 hover:text-slate-500 mt-1" viewBox="0 0 24 24" stroke-width="3"><path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" /><path fill-rule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" /></svg>',
    },
    click: async () => {
      let updatedData: Plotly.Data[] = plotlyDataRef.current.map(data => {
        // Check if the current plot type is 'scattergl' before changing it to 'scatter'
        if (data.type === 'scattergl') {
          return {
            ...data,
            type: 'scatter' as const, // Convert to 'scatter' for download
          };
        }
        // Return the data unchanged if it's not of type 'scattergl'
        return data;
      });
      
      // re-render the plot with updatedData for download
      await Plotly.react('regression', updatedData, layout);
      Plotly.downloadImage(
        'regression', 
        // @ts-ignore
        {format: 'svg', filename: 'clockor2'}
      )
    }
  };


  const downloadObjectAsCsv = (exportName: any) => {
      // Helper function to convert an object to a CSV row string
      const convertToCsvRow = (obj: any) => {
          return Object.values(obj).map(value => `"${value}"`).join(',');
      };
      // ensure data is up to date
      let currentData = plotlyDataRef.current
      if (!currentData) return 

      // Convert exportObj to CSV
      let csvContent = "group,date,decimal-date,root-to-tip-distance,label\n"; // Adding headers

      currentData.filter(item => (item as ScatterData).mode === "markers").forEach((item: any) => {
          const group = item.name || 'Unknown Group'; // Default group if not present
          item.x.forEach((ymd: string, index: number) => {
              const rootToTipDistance = item.y[index];
              const label = item.text[index];
              const decimalDate = decimal_date(ymd, 'yyyy-mm-dd')
              const row = { group, ymd, decimalDate, rootToTipDistance, label };
              csvContent += convertToCsvRow(row) + "\n";
          });
      });

      // Create a data URI for the CSV data
      var dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);

      // Trigger the download of the CSV file
      var downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", exportName + ".csv");
      document.body.appendChild(downloadAnchorNode); // required for Firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };


  return (
    <div className='h-full'>
      <Plot 
        divId='regression' 
        onUnhover={() => dispatch(setHighlightedId(null))} 
        onHover={(event) => onHover(event)}
        onSelecting={(event) => onSelected(event)}
        onDeselect={() => onDeselect()}
        data={plotlyDataRef.current}  
        layout={layout}
        style={{width: "100%", height: isMobile ? "250px" : "100%" }}
        config={{
          modeBarButtonsToAdd: [
            downloadDataButton,
            downloadImageButton
          ],
          modeBarButtonsToRemove: ['autoScale2d', 'toImage'],
          responsive: true, 
          displaylogo: false, 
          }
        }
      />
    </div>
  );
}
