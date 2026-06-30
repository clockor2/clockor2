import { Badge } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from '../../app/hooks';
import { selectCurrentData, selectMode } from '../regression/regressionSlice';
import { MetricCard } from './components/cards';
import { ResultsTable } from "./components/resultsTable";
import { ClockSearchButton } from "./clockSearchButton";
import { BFRButton } from "./bfrButton";
import { selectSelectedIds } from "../tree/treeSlice";
import { AddClockButton } from "./addClockButton"
import { ResetDataButton } from "./resetButton";
import { InfoMetric } from "../engine/core";
import { PanelToggleButton } from "./components/panelToggleButton";
import { useDarkMode } from "../utils/darkmode";
import { BFRMethod } from "../engine/dateRandomisation";
import { DateRandomisationModal } from "./dateRandomisationModal";

export function InfoPanel() {
  const selectedIds = useAppSelector(selectSelectedIds)
  const [isOpen, setOpen] = useState(false);
  const [openAnalysisModal, setOpenAnalysisModal] = useState<"clockSearch" | "dateRandomisation" | undefined>();
  const [isAnalysisMenuOpen, setAnalysisMenuOpen] = useState(false);
  const [analysisMenuPosition, setAnalysisMenuPosition] = useState({ top: 0, left: 0 });
  const analysisMenuRef = useRef<HTMLDivElement>(null);
  const [bfrMethod, setBFRMethod] = useState<BFRMethod>("RMS");
  const [allowNegativeRates, setAllowNegativeRates] = useState(true);
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

  useEffect(() => {
    if (!isAnalysisMenuOpen) return;

    const closeMenu = (event: MouseEvent) => {
      if (analysisMenuRef.current?.contains(event.target as Node)) return;
      setAnalysisMenuOpen(false);
    }

    const closeOnViewportChange = () => {
      setAnalysisMenuOpen(false);
    }

    document.addEventListener("mousedown", closeMenu);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    }
  }, [isAnalysisMenuOpen])

  const renderRegressionInfo = (criteria: InfoMetric, global: boolean) => {
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

  const openAnalysisMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 230;
    const menuHeight = 90;
    const margin = 2;
    const hasSpaceBelow = rect.bottom + menuHeight + margin <= window.innerHeight;

    setAnalysisMenuPosition({
      top: hasSpaceBelow ? rect.bottom + margin : rect.top - menuHeight - margin,
      left: Math.min(
        window.innerWidth - menuWidth - margin,
        Math.max(margin, rect.right - menuWidth)
      )
    });
    setAnalysisMenuOpen(open => !open);
  }

  const openAnalysisModalFromMenu = (modal: "clockSearch" | "dateRandomisation") => {
    setAnalysisMenuOpen(false);
    setOpenAnalysisModal(modal);
  }

  const renderAnalysisMenu = () => {
    return (
      <div className="relative">
        <button
          title="Analyses"
          aria-label="Analyses"
          aria-expanded={isAnalysisMenuOpen}
          onClick={openAnalysisMenu}
          className='flex items-center text-gray-700 dark:text-gray-400 hover:text-blue-700'
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 font-medium">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
          </svg>


        </button>
        {isAnalysisMenuOpen
          ? <div
              ref={analysisMenuRef}
              className="fixed z-[100] w-[230px] rounded border border-gray-200 bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-slate-700"
              style={{ top: analysisMenuPosition.top, left: analysisMenuPosition.left }}
            >
              <button
                type="button"
                onClick={() => openAnalysisModalFromMenu("clockSearch")}
                className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <span>Local Clock Search</span>
              </button>
              <button
                type="button"
                onClick={() => openAnalysisModalFromMenu("dateRandomisation")}
                className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                </svg>
                <span>Date Randomisation</span>
              </button>
            </div>
          : <></>
        }
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
          <BFRButton
            bfrMethod={bfrMethod}
            setBFRMethod={setBFRMethod}
            allowNegativeRates={allowNegativeRates}
            setAllowNegativeRates={setAllowNegativeRates}
          />
          {renderAnalysisMenu()}
        </div>
      </div>
      <ClockSearchButton
        show={openAnalysisModal === "clockSearch"}
        onClose={() => setOpenAnalysisModal(undefined)}
      />
      <DateRandomisationModal
        show={openAnalysisModal === "dateRandomisation"}
        onClose={() => setOpenAnalysisModal(undefined)}
        bfrMethod={bfrMethod}
        allowNegativeRates={allowNegativeRates}
      />
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
