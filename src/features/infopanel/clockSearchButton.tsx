import { Label, Modal, Select, Spinner } from "flowbite-react";
import { setClockSearchData, setCurrentData, selectCurrentData, selectClockSearchData  } from "../regression/regressionSlice";
import { selectCurrentTree } from "../tree/treeSlice";
import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { phylotree } from "phylotree";
import { createClockSearchWorker } from "../engine/clockSearch";
import { LocalClockModel } from "../engine/core";


/* TODO
1. Define new states for clock search data - DONE
2. Setup Object for clock search input - DONE
3. Form and Modal to collect input - takes current tree, maxGroups, minGrpSize, IC metric -DONE
3.5. handle submit function -DONE
4. Run button to do clockSearch() and reset data - DONE
5. Button to show clockSearch Data after run */

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
      setIsSearching(false)
      toggleModal()

    }

return (
<div>
        <button onClick={toggleModal} className=' text-slate-600 hover:text-blue-300 p-1 m-3 rounded-md border border-transparent hover:border-blue-200'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-1 -1 20 20" strokeWidth={0.75} stroke="currentColor" className="w-6 h-6">
          <path d="M8 2C4.691 2 2 4.691 2 8s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm6.312 10.897l5.395 5.396a1 1 0 11-1.414 1.414l-5.396-5.395A7.954 7.954 0 018 16c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8a7.946 7.946 0 01-1.688 4.897zM9 5a1 1 0 10-2 0v3a1 1 0 00.293.707l2 2a1 1 0 001.414-1.414L9 7.586V5z" fill="#5C5F62"/>
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