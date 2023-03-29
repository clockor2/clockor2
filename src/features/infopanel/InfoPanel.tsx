import { Badge, Checkbox, Label } from "flowbite-react";
import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectCurrentData, setCurrentData, selectData, selectBestFitData } from '../regression/regressionSlice';
import { selectSource, selectBestFittingRoot, setCurrentTree } from "../tree/treeSlice"
import { MetricCard } from './components/cards';
import { ResultsTable } from "./components/resultsTable";
import { ClockSearchButton } from "./clockSearchButton";
import { BFRButton } from "./bfrButton";

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


  // Getting state to log in buttons. Eg. num clocks
  const data = useAppSelector(selectCurrentData);
  // setting num clocks using ternary operator - if local clocks defined, use that plus 1
  //const numClocks = data && data.localClock ? data?.localClock.length : 1;

  return (
    <div>
      <div className="flex flex-row items-center border-t-2 py-2 shadow-lg pl-2" >
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
          <Badge> {data?.localClock ? data?.localClock.length : 1} </Badge>
        </div>

        <div className="flex items-center p-1 ">
          <BFRButton/>
        </div>

        <div className="flex items-center p-1 ">
          <ClockSearchButton />
          <Label className="pl-1">
            Local Clock Search
          </Label>
        </div>
      </div>
        
      {isOpen
      ? // Nesting ternary operator for 1 or more clocks
      <div className="max-h-[62.5vh] overflow-y-scroll">
        {typeof data?.localClock == "undefined"
          ?
          <div className="shrink flex flex-col space-x-8 bg-slate-50 justify-center overflow-y-scroll">
            <div className=" flex text-2xl font-bold justify-center">
              Global Clock
            </div>
            <div className="flex space-x-8 p-10 bg-slate-50 justify-center">
              <MetricCard text="AICc" value={data?.baseIC.aicc} isMin={false}/>
              <MetricCard text="AIC" value={data?.baseIC.aic} isMin={false}/>
              <MetricCard text="BIC" value={data?.baseIC.bic} isMin={false}/>
            </div>
            <ResultsTable model={data ?? undefined} clock={"global"}/>
          </div>

          :
          <div className="flex shrink flex-col px-5 pb-5 bg-slate-50 justify-center overflow-y-scroll">
                <div className="pt-2 flex text-2xl font-bold justify-center ">
                  Global Clock
                </div>
                <div className="flex space-x-8 p-10 bg-slate-50 justify-center">
                  <MetricCard text="AICc" value={data?.baseIC.aicc} isMin={data?.localIC.aicc > data?.baseIC.aicc}/>
                  <MetricCard text="AIC" value={data?.baseIC.aic} isMin={data?.localIC.aic > data?.baseIC.aic}/>
                  <MetricCard text="BIC" value={data?.baseIC.bic} isMin={data?.localIC.bic > data?.baseIC.bic}/>
                </div>
                <ResultsTable model={data ?? undefined} clock={"global"}/> 
                  <div className="flex text-2xl font-bold justify-center pt-4">
                    Local Clock
                  </div>
                <div className="flex space-x-8 p-10 bg-slate-50 justify-center">
                  <MetricCard text="AICc" value={data?.localIC.aicc} isMin={data?.localIC.aicc < data?.baseIC.aicc}/>
                  <MetricCard text="AIC" value={data?.localIC.aic} isMin={data?.localIC.aic < data?.baseIC.aic}/>
                  <MetricCard text="BIC" value={data?.localIC.bic} isMin={data?.localIC.bic < data?.baseIC.bic}/>
                </div>
                <ResultsTable model={data ?? undefined} clock={"local"}/>

            </div>
        }
      </div>
      : 
      <div></div>
      
      }
      
    </div>
  )
}