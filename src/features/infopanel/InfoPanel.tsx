import { Badge, Button, Checkbox, Label, Modal, Navbar } from "flowbite-react";
import React, { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectData } from '../regression/regressionSlice';
import { MetricCard } from './components/cards';


export function InfoPanel(){
  const [isOpen,setOpen] = useState(false);
    const togglePanel = () => {
      setOpen(!isOpen)
      // dispatch event to trigger plotly resize
      window.dispatchEvent(new Event('resize'));
    }
    // Getting state to log in buttons. Eg. num clocks
    const data = useAppSelector(selectData);
    // setting num clocks using ternary operator - if local clocks defined, use that plus 1
    const numClocks = data ? data?.localClock.length : 1;
    return (
     <div >
        <div className="flex items-center border-t-2 py-2 shadow-lg pl-2" >
            <div onClick={togglePanel}>
                {isOpen 
                ?   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 hover:text-blue-200">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                :   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 hover:text-blue-200">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg> 
              }
            </div>
            <div className="flex items-center p-1 ">
                <span className="pr-2 text-xl">Clocks</span>
                <Badge> {numClocks ? numClocks : 0} </Badge>
            </div>

            <div className="flex items-center p-1 ">
              <Checkbox id="bestRoot" />
              <Label className="pl-1" htmlFor="bestRoot">
                Best Fitting Root
              </Label>
            </div>

        </div>
        {/* Here goes the data popup */}
        {isOpen 
            ? // Nesting ternary operator for 1 or more clocks
              numClocks === 1
              ?
              <div className="flex space-x-8 p-10 bg-slate-50 justify-center overflow-y-scroll"> 
              <MetricCard text="AICc" value={ data?.baseIC.aicc }/>
              <MetricCard text="AIC" value={ data?.baseIC.aic }/>
              <MetricCard text="BIC" value={ data?.baseIC.bic }/>
              </div>
              :
              <div className="flex flex-col space-x-8 p-10 bg-slate-50 justify-center overflow-y-scroll"> 
                <div className="flex space-x-8 p-10 bg-slate-50 justify-center overflow-y-scroll"> 
                <MetricCard text="AICc" value={ data?.localIC.aicc }/>
                <MetricCard text="AIC" value={ data?.localIC.aic }/>
                <MetricCard text="BIC" value={ data?.localIC.bic }/>
                </div>
                <div className="flex space-x-8 p-10 bg-slate-50 justify-center overflow-y-scroll"> 
                <MetricCard text="Baseline AICc" value={ data?.baseIC.aicc }/>
                <MetricCard text="Baseline AIC" value={ data?.baseIC.aic }/>
                <MetricCard text="Baseline BIC" value={ data?.baseIC.bic }/>
                </div>
              </div>
            : <div></div>
        }
     </div>
        
    )
}