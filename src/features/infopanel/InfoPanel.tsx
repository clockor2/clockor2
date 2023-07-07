import { Badge } from "flowbite-react";
import { useEffect, useState } from "react";
import { useAppSelector } from '../../app/hooks';
import { selectCurrentData, selectMode } from '../regression/regressionSlice';
import { MetricCard } from './components/cards';
import { ResultsTable } from "./components/resultsTable";
import { ClockSearchButton } from "./clockSearchButton";
import { BFRButton } from "./bfrButton";
import { selectBestFittingRoot, selectSelectedIds } from "../tree/treeSlice";
import { AddClockButton } from "./addClockButton"
import { ResetDataButton } from "./resetButton";

export function InfoPanel() {
  const selectedIds = useAppSelector(selectSelectedIds)
  const [isOpen, setOpen] = useState(false);
  const togglePanel = () => {
    setOpen(!isOpen)
    // dispatch event to trigger plotly resize
    window.dispatchEvent(new Event('resize'));
  }

  const bfrStatus = useAppSelector(selectBestFittingRoot);
  const data = useAppSelector(selectCurrentData);
  const mode = useAppSelector(selectMode)
  let startMinIC = undefined
  if (data) {
    startMinIC =  
    {
      aic: (data.localIC !== undefined ? data.baseIC.aic < data.localIC.aic : false),
      aicc: (data.localIC !== undefined ? data.baseIC.aicc < data.localIC.aicc : false),
      bic: (data.localIC !== undefined ? data.baseIC.bic < data.localIC.bic : false)
    }
  }

  // switch for metric card highlight
  const [baseFavoured, setFavoured] = useState(startMinIC ?? { aic: false, aicc: false, bic: false });
  useEffect(() => {
    setFavoured(
      (baseFavoured) => {
        if (data) {
          let op =  
          {
            aic: (data.localIC !== undefined ? data.baseIC.aic < data.localIC.aic : false),
            aicc: (data.localIC !== undefined ? data.baseIC.aicc < data.localIC.aicc : false),
            bic: (data.localIC !== undefined ? data.baseIC.bic < data.localIC.bic : false)
          }
          console.log(op)
          return op
        } else {
          return baseFavoured
        }
      }
    )
  }, [data])


  return (
    <div>
      <div className="flex justify-between items-center space-x-3 border-t-2 shadow-lg px-2 bg-slate-50">
        <div className="flex flex-row items-center space-x-3 py-4" >
          <button onClick={togglePanel}>
            {isOpen
              ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 hover:text-blue-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
              : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 hover:text-blue-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>

            }
          </button>
          <div className="flex items-center">
            <span className="pr-1">Tips</span>
            <Badge>{data?.baseClock.tip.length}</Badge>
          </div>
          <div className="flex items-center">
            <span className="pr-1">Clocks</span>
            <Badge>{data?.localClock ? data?.localClock.length : 1}</Badge>
          </div>
          {mode
            ? <ResetDataButton />
            : <div></div>
          }
          {selectedIds.length > 0
            ? <div className="flex items-center">
                <span className="pr-1">Selected</span>
                <Badge>{selectedIds.length}</Badge>
                <AddClockButton />
              </div>
            : <div></div>
          }
        </div>
        <div className="flex items-center space-x-3 py-2">
          <BFRButton />
          <ClockSearchButton />
        </div>
      </div>
      {isOpen && data
        ? // Nesting ternary operator for 1 or more clocks
        <div className="max-h-[62.5vh] overflow-y-auto border-t">
          {typeof data?.localClock == "undefined"
            ?
            <div className="shrink flex flex-col space-x-8 bg-slate-50 justify-center">
              <div className=" flex text-2xl font-bold justify-center">
                Global Clock
              </div>
              <div className="flex space-x-8 p-10 bg-slate-50 justify-center">
                <MetricCard text="AICc" value={data?.baseIC.aicc} isMin={false} />
                <MetricCard text="AIC" value={data?.baseIC.aic} isMin={false} />
                <MetricCard text="BIC" value={data?.baseIC.bic} isMin={false} />
              </div>
              <ResultsTable model={data ?? undefined} clock={"global"} />
            </div>

            :
            <div className="flex shrink flex-col px-5 pb-5 bg-slate-50 justify-center">
              <div className="flex items-center">
                <div className="pl-2 w-48 flex text-3xl font-bold justify-center ">
                  Global Clock
                </div>
                <div className="flex space-x-8 p-10 bg-slate-50 justify-center">
                  <MetricCard text="AICc" value={data?.baseIC.aicc} isMin={baseFavoured["aic"]} />
                  <MetricCard text="AIC" value={data?.baseIC.aic} isMin={baseFavoured["aicc"]} />
                  <MetricCard text="BIC" value={data?.baseIC.bic} isMin={baseFavoured["bic"]} />
                </div>
              </div>
              <ResultsTable model={data ?? undefined} clock={"global"} />
              <div className="flex items-center">
                <div className="pl-2 w-48 flex text-3xl font-bold justify-center">
                  Local Clock
                </div>
                <div className="flex space-x-8 p-10 bg-slate-50 justify-center">
                  <MetricCard text="AICc" value={data?.localIC.aicc} isMin={!baseFavoured["aic"]} />
                  <MetricCard text="AIC" value={data?.localIC.aic} isMin={!baseFavoured["aicc"]} />
                  <MetricCard text="BIC" value={data?.localIC.bic} isMin={!baseFavoured["bic"]} />
                </div>
              </div>
              <ResultsTable model={data ?? undefined} clock={"local"} />

            </div>
          }
        </div>
        :
        <div></div>

      }

    </div>
  )
}