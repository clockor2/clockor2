import { Badge, Button, Modal, Navbar } from "flowbite-react";
import React, { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectData } from '../regression/regressionSlice';
import { MetricCard } from './components/cards';


export function InfoPanel(){
  const [isOpen,setOpen] = useState(false);
    const togglePanel = () => {
      setOpen(!isOpen)
    }
    // Getting state to log in buttons. Eg. num clocks
    const data = useAppSelector(selectData);
    const numClocks = data?.clocks.length;
    return (
     <div>
        <div className="flex" >
            <div onClick={togglePanel}>
                {isOpen 
                ?   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                :   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg> 
              }
            </div>
            <div className="flex items-center">
                <span className="pr-2 text-xl">Clocks</span>
                <Badge> {numClocks ? numClocks : 0} </Badge>
            </div>
            <div></div>
        </div>

        {/* Here goes the data popup */}
        {isOpen 
            ? <div className="flex space-x-8 p-10 h-full bg-slate-50 justify-center" hidden={isOpen}> 
            <MetricCard text="AICc" value={ data?.aicc }/>
            <MetricCard text="AIC" value={ data?.aic }/>
            <MetricCard text="BIC" value={ data?.bic }/>
            </div>
            : <div></div>
        }
     </div>
        
    )
}