import { Label, Modal, Select, Spinner, Tooltip, Alert } from "flowbite-react";
import { setClockSearchData, setCurrentData, selectCurrentData, setMode } from "../regression/regressionSlice";
import { selectCurrentTree } from "../tree/treeSlice";
import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { createClockSearchWorker } from "../engine/clockSearch";
import { addNotification } from "../notifications/notificationsSlice";

export function ClockSearchButton(props: any) {
  var nTips = useAppSelector(selectCurrentData)?.baseClock.x.length ?? 0;
  const [minCladeSize, setMinCladeSize] = useState<number>(Math.floor(nTips / 2));
  const [maxClocks, setMaxClocks] = useState<number>(2);
  const [icMetric, setICMetric] = useState<"aic" | "aicc" | "bic">("bic")
  const [openModal, setOpenModal] = useState<string | undefined>();
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useAppDispatch();
  const nwk = useAppSelector(selectCurrentTree);
  const currentData = useAppSelector(selectCurrentData)
  const dates = currentData ? currentData.baseClock.x : [...Array(10)] // Need something to protect against undefined case
  async function handleSubmit(event: any) {

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
    setOpenModal(undefined)
    dispatch(addNotification({ title: "Warning", message: "Please interpret the results of the Clock Search with caution", type: "warning" }))

  }

  return (
    <div>
      <Tooltip
        content="Local Clock Search"
        placement="top"
      >
        <button onClick={() => setOpenModal('default')} className='flex items-center text-gray-700 dark:text-gray-400 hover:text-blue-700 '>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.3" stroke="currentColor" className="w-6 h-6 font-medium">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </Tooltip>
      <React.Fragment>
        <Modal
          dismissible={!isSearching}
          show={openModal === 'default'}
          onClose={() => setOpenModal(undefined)}
        >
          <Modal.Header>
            Perform Local Clock Search
          </Modal.Header>
          <Modal.Body>
            {/* Warning Box for clock-search below */}
            <Alert color="warning" rounded className="mb-4">
              <span className="font-medium"><strong>Caution!</strong></span> This feature is exploratory and highly susceptible to overfitting. Refer to the Clockor2 paper and documentation to understand its limitations.
            </Alert>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className='flex justify-between space-x-4 '>
                <div className='flex-auto w-64'>
                  <Label
                    htmlFor='minGrpSize'
                    value='Minimum Group Size'
                  />
                  <div className="flex items-center">
                    <div className="w-12 text-gray-900 dark:text-white">{minCladeSize}</div>
                    <input
                      id="minGrpSize"
                      className="w-1/2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointe"
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
                  <div className="flex items-center ">
                    <input
                      className="bg-gray-200"
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