import { Badge, Checkbox, Label } from "flowbite-react";
import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectCurrentData, setCurrentData, selectData, selectBestFitData } from '../regression/regressionSlice';
import { selectSource, selectBestFittingRoot, setCurrentTree } from "../tree/treeSlice"
import { MetricCard } from './components/cards';
import { ClockSearchButton } from "./clockSearchButton";

export function InfoPanel() {
  const [isOpen, setOpen] = useState(false);
  const togglePanel = () => {
    setOpen(!isOpen)
    // dispatch event to trigger plotly resize
    window.dispatchEvent(new Event('resize'));
  }

  const sourcePhylotree = useAppSelector(selectSource);
  const bestFittingPhylotree = useAppSelector(selectBestFittingRoot);
  const sourceData = useAppSelector(selectData);
  const bestFitData = useAppSelector(selectBestFitData);
  const dispatch = useAppDispatch();

  const [useBestFittingRoot, invertBestFittingRoot] = useState(false);
  const toggleBestFittingRoot = () => {
    invertBestFittingRoot(!useBestFittingRoot);
    // Now doing things with the internal state
    if (useBestFittingRoot && sourceData) {
      dispatch(setCurrentTree(sourcePhylotree));
      dispatch(setCurrentData(sourceData));

    } else if ((!useBestFittingRoot) && bestFitData) {
      dispatch(setCurrentTree(bestFittingPhylotree));
      dispatch(setCurrentData(bestFitData));
    }
  }

  // Getting state to log in buttons. Eg. num clocks
  const data = useAppSelector(selectCurrentData);
  // setting num clocks using ternary operator - if local clocks defined, use that plus 1
  const numClocks = data && data?.localClock.length > 0 ? data?.localClock.length : 1;

  return (
    <div >
      <div className="flex items-center border-t-2 py-2 shadow-lg pl-2" >
        <div onClick={togglePanel}>
          {isOpen
            ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 hover:text-blue-200">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
            : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 hover:text-blue-200">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          }
        </div>
        <div className="flex items-center p-1 ">
          <span className="pr-2 text-xl">Clocks</span>
          <Badge> {numClocks ? numClocks : 0} </Badge>
        </div>

        <div className="flex items-center p-1 ">
          <Checkbox id="bestRoot" onClick={toggleBestFittingRoot} />
          <Label className="pl-1" htmlFor="bestRoot">
            Best Fitting Root
          </Label>
        </div>

        <div className="flex items-center p-1 ">
          <ClockSearchButton />
          <Label className="pl-1">
            Local Clock Search
          </Label>
        </div>
        
        {/*MAYBE LATER: <div className="flex items-center p-1 ">
          <Checkbox id="clockSearch" />
          <Label className="pl-1" htmlFor="bestRoot">
            Show Clock Search Data
          </Label>
        </div> */}

      </div>

      {isOpen
        ? // Nesting ternary operator for 1 or more clocks
        numClocks === 1
          ?
          <div className="flex space-x-8 p-10 bg-slate-50 justify-center overflow-y-scroll">
            <MetricCard text="AICc" value={data?.baseIC.aicc} />
            <MetricCard text="AIC" value={data?.baseIC.aic} />
            <MetricCard text="BIC" value={data?.baseIC.bic} />
          </div>
          :
          <div className="flex flex-col space-x-8 p-10 bg-slate-50 justify-center overflow-y-scroll">
            <div>
              <Label htmlFor="localFit" value="Local Clock" className="text-2xl font-bold"/>
            </div>
            <div className="flex space-x-8 p-10 bg-slate-50 justify-center overflow-y-scroll">
              <MetricCard text="AICc" value={data?.localIC.aicc} isMin={(data?.localIC.aicc && data?.baseIC.aicc) ? data?.localIC.aicc < data?.baseIC.aicc : null}/>
              <MetricCard text="AIC" value={data?.localIC.aic} isMin={(data?.localIC.aic && data?.baseIC.aic) ? data?.localIC.aic < data?.baseIC.aic : null}/>
              <MetricCard text="BIC" value={data?.localIC.bic} isMin={(data?.localIC.bic && data?.baseIC.bic) ? data?.localIC.bic < data?.baseIC.bic : null}/>
            </div>
            <div>
              <Label htmlFor="globalFit" value="Global Clock" className="text-2xl font-bold"/>
            </div>
            <div className="flex space-x-8 p-10 bg-slate-50 justify-center overflow-y-scroll">
              <MetricCard text="AICc" value={data?.localIC.aicc} isMin={(data?.localIC.aicc && data?.baseIC.aicc) ? data?.localIC.aicc > data?.baseIC.aicc : null}/>
              <MetricCard text="AIC" value={data?.localIC.aic} isMin={(data?.localIC.aic && data?.baseIC.aic) ? data?.localIC.aic > data?.baseIC.aic : null}/>
              <MetricCard text="BIC" value={data?.localIC.bic} isMin={(data?.localIC.bic && data?.baseIC.bic) ? data?.localIC.bic > data?.baseIC.bic : null}/>
            </div>
          </div>
        : <div></div>
      }
    </div>

  )
}