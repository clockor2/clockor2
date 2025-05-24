import { Badge } from "flowbite-react";
import { useEffect, useState } from "react";
import { useAppSelector } from '../../app/hooks';
import { selectCurrentData, selectMode } from '../regression/regressionSlice';
import { MetricCard } from './components/cards';
import { ResultsTable } from "./components/resultsTable";
import { ClockSearchButton } from "./clockSearchButton";
import { BFRButton } from "./bfrButton";
import { selectSelectedIds } from "../tree/treeSlice";
import { AddClockButton } from "./addClockButton"
import { ResetDataButton } from "./resetButton";
import { InfoCriteria } from "../engine/types";
import { PanelToggleButton } from "./components/panelToggleButton";
import { useDarkMode } from "../utils/darkmode";

export function InfoPanel() {
  const selectedIds = useAppSelector(selectSelectedIds)
  const [isOpen, setOpen] = useState(false);
  const isDarkMode = useDarkMode();
  const togglePanel = () => {
    setOpen(!isOpen)
    // dispatch event to trigger plotly resize
    window.dispatchEvent(new Event('resize'));
  }
  
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

  const renderRegressionInfo = (criteria: InfoCriteria, global: boolean) => {
    return (
      <div>
        <div className="flex flex-wrap ml-2 my-4 align-middle items-center">
          <div className="w-48 text-3xl font-bold dark:text-slate-300">
            {global ? "Global" : "Local"} Clock
          </div>
          <div className="flex flex-wrap pt-4">
            <div className="mr-3 mb-3">
              <MetricCard text="AICc" value={criteria.aicc} isMin={global ? baseFavoured["aic"] : ! baseFavoured["aic"]} />
            </div>
            <div className="mr-3 mb-3">
              <MetricCard text="AIC" value={criteria.aic} isMin={global ? baseFavoured["aicc"] : ! baseFavoured["aicc"]} />
            </div>
            <div className="mr-3 mb-3">
              <MetricCard text="BIC" value={criteria.bic} isMin={global ? baseFavoured["bic"] : ! baseFavoured["bic"]} />
            </div>
          </div>
        </div>
      <div className=" overflow-x-auto">
        <ResultsTable model={data ?? undefined} clock={global ? "global" : "local"} />
      </div>
    </div>
    )
  }

  const renderPanelToggleButtonIfNotMobile = () => {
    const is_mobile = window.innerWidth < 768
    if (is_mobile) {
      if (!isOpen) {
        setOpen(true)
      }
      return <div></div>
    }
    return (
      <div className="flex dark:text-slate-400">
        <PanelToggleButton onClick={togglePanel} isOpen={isOpen} />
      </div>
    )

  }

  return (
    <div>
      <div className="flex justify-between items-center space-x-3 border-t-2 dark:border-slate-500 px-2 bg-slate-50 dark:bg-slate-700 overflow-x-auto">
        <div className="flex flex-row items-center space-x-3 py-4" >
          {renderPanelToggleButtonIfNotMobile()}
          <div className="flex items-center">
            <span className="pr-1 dark:text-slate-400">Tips</span>
            <Badge color={isDarkMode ? "dark" : "blue"}>{data?.baseClock.tip.length}</Badge>
          </div>
          <div className="flex items-center">
            <span className="pr-1 dark:text-slate-400">Clocks</span>
            <Badge color={isDarkMode ? "dark" : "blue"}>{data?.localClock ? data?.localClock.length : 1}</Badge>
          </div>
          {mode
            ? <ResetDataButton />
            : <></>
          }
          {selectedIds.length > 0
            ? <div className="flex items-center">
                <span className="pr-1 dark:text-slate-400">Selected</span>
                <Badge color={isDarkMode ? "dark" : "blue"}>{selectedIds.length}</Badge>
                <div className="flex ml-1">
                  <AddClockButton />
                </div>
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
          <div className="md:max-h-[62.5vh] overflow-y-auto border-t dark:border-slate-500">
            <div className="flex shrink flex-col px-5 pb-5 bg-slate-50 dark:bg-slate-600 justify-center">
              {renderRegressionInfo(data.baseIC, true)}
              {typeof data?.localClock !== "undefined"
                ? 
                renderRegressionInfo(data.localIC, false)
                :
                <div></div>
              }
            </div>
          </div>
        : <div></div>
      }
    </div>
  )
}