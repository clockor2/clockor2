import { Label, Modal, Select, Spinner } from "flowbite-react";
import { setClockSearchData, setCurrentData, selectCurrentData, setMode  } from "../regression/regressionSlice";
import { selectCurrentTree } from "../tree/treeSlice";
import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { createClockSearchWorker } from "../engine/clockSearch";

export function ClockSearchButton(props: any) {
    var nTips = useAppSelector(selectCurrentData)?.baseClock.x.length ?? 0;
    const [minCladeSize, setMinCladeSize] = useState<number>(Math.floor(nTips / 2));
    const [maxClocks, setMaxClocks] = useState<number>(2);
    const [icMetric, setICMetric] = useState<"aic" | "aicc" | "bic">("bic")
    const [isToggled, setToggle] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const toggleModal = () => {
      if (!isSearching) {
        setToggle(!isToggled)
      }
    }

    const dispatch = useAppDispatch(); 
    const nwk = useAppSelector(selectCurrentTree);
    const currentData = useAppSelector(selectCurrentData)
    const dates = currentData ? currentData.baseClock.x : [...Array(10)] // Need something to protect against undefined case
    async function handleSubmit (event: any) {

      event.preventDefault(); // TODO: Understand event.preventDefault()

      setIsSearching(true)
      var groupConfig = await createClockSearchWorker(
        nwk,
        minCladeSize,
        maxClocks,
        dates,
        icMetric,
      )

      dispatch(setClockSearchData(groupConfig))
      dispatch(setCurrentData(groupConfig))
      dispatch(setMode("clockSearch"))
      setIsSearching(false)
      toggleModal()

    }

return (
<div>
        <button onClick={toggleModal} className='flex items-center text-gray-700 hover:text-blue-700 '>
            <div className="text-sm font-medium  dark:text-gray-300 cursor-pointer" >
              Local Clock Search
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>
        <React.Fragment>
          <Modal
            dismissible={!isSearching}
            show={isToggled}
            onClose={toggleModal}
          >
            <Modal.Header>
              Perform Local Clock Search
            </Modal.Header>
            <Modal.Body>
<form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className='flex justify-between space-x-4 '>
        <div className='flex-auto w-64'>
          <Label
            htmlFor='minGrpSize'
            value='Minimum Group Size'
          /> 
          <div className = "flex items-center">
            <div className="w-12">{minCladeSize}</div>
            <input
            id="minGrpSize"
            className="w-1/2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            placeholder={minCladeSize.toString()}
            type="range"
            min={3} 
            max={nTips} 
            required={true}
            onChange={e => setMinCladeSize(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div className='flex justify-between space-x-4 '>
        <div className='flex-auto w-64'>
          <Label
            htmlFor='maxClocks'
            value='Maximum number of local clocks'
          />
          <div className="flex items-center">
            {/* <div className="w-12">{maxClocks}</div> */}
            <input
              id="maxClocks"
              placeholder={maxClocks.toString()}
              type="number"
              min={1}
              max={Math.floor(nTips / minCladeSize)}
              required={true}
              onChange={e => setMaxClocks(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div id="icSelection">
      <div className="mb-2 block">
        <Label
              htmlFor='ic'
              value='Information Criterion'
            />
      </div>
      <div className="flex items-center">
        <Select
                    id="ic"
                    required={true}
                    name="type"
                    value={icMetric}
                    onChange={e => setICMetric(e.target.value as "aic" | "aicc" | "bic")}
                  >
                    <option value={"bic"}>
                      BIC
                    </option>
                    <option value={"aicc"}>
                      AICc
                    </option>
                    <option value={"aic"}>
                      AIC
                    </option>
        </Select>
        </div>
      </div>
      {isSearching
      ?
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-2"
       disabled={isSearching}
       >
        <Spinner aria-label="Spinner button example" />
      </button>
      :
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-2">
        Perform Clock Search
      </button>
      }
    </form>
    </Modal.Body>
    </Modal>
    </React.Fragment>
    </div>
);
}