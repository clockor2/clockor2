import { Checkbox, Label, Spinner, Dropdown } from "flowbite-react";
import { useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { setCurrentData, selectCurrentData, selectData, selectBestFittingRootData, setMode, selectMode } from '../regression/regressionSlice';
import { setBestFittingRootData } from "../regression/regressionSlice";
import { selectSource, setBestFittingRoot, setCurrentTree, selectTipData, selectBestFittingRoot } from '../tree/treeSlice';
import { globalRootParallel } from "../engine/bestFittingRoot";
import { regression } from "../engine/core";
import { readNewick } from "phylojs";

export function BFRButton() {

  const sourceNwk = useAppSelector(selectSource);
  const bfrTrees = useAppSelector(selectBestFittingRoot);
  const sourceData = useAppSelector(selectData);
  const bestFitData = useAppSelector(selectBestFittingRootData);
  const tipData = useAppSelector(selectTipData);
  const mode = useAppSelector(selectMode);
  const currentData = useAppSelector(selectCurrentData);
  const dispatch = useAppDispatch();

  const bfrCalculated = useRef<{ R2: boolean, RMS: boolean }>({ R2: false, RMS: false });

  const [bfrMethod, swapBFRMethod] = useState<"RMS" | "R2">("RMS");

  const handleMethodChange = (method: "RMS" | "R2") => {
    if (method !== bfrMethod && useBestFittingRoot) {

      // reset if other bfr doesn't exist yet
      if (!bfrCalculated.current[method] && sourceData && bfrTrees) {
        invertBestFittingRoot(!useBestFittingRoot);
        dispatch(setCurrentTree(sourceNwk));
        dispatch(setCurrentData(sourceData));
        dispatch(setBestFittingRoot(
          {
            ...bfrTrees,
            using: null
          }
        ));

      } else if (bfrCalculated.current[method] && bestFitData[method] && bfrTrees[method]) {
        //@ts-ignore
        dispatch(setCurrentTree(bfrTrees[method]));
        //@ts-ignore
        dispatch(setCurrentData(bestFitData[method]));
        dispatch(setBestFittingRoot(
          {
            ...bfrTrees,
            using: method
          }
        ));
      }

      swapBFRMethod(method)
    }
    if (!useBestFittingRoot && method !== bfrMethod && sourceData) {
      dispatch(setCurrentTree(sourceNwk));
        dispatch(setCurrentData(sourceData));
        dispatch(setBestFittingRoot(
          {
            ...bfrTrees,
            using: null
          }
        ));

      swapBFRMethod(method)
    }
  }

  const [useBestFittingRoot, invertBestFittingRoot] = useState(false);
  const toggleBestFittingRoot = () => {

    if (sourceData && !bfrCalculated.current[bfrMethod]) {

      var dates = sourceData.baseClock.x;
      globalRootParallel(sourceNwk, dates, tipData, bfrMethod).then(
        (nwk: string) => {

          let newBFRState = {
            ...bfrTrees,
            [bfrMethod]: nwk,
            using: bfrMethod
          }
          dispatch(setBestFittingRoot(newBFRState))

          // BFR regression data
          let bestFitTree = readNewick(nwk)
          let bfrTips = bestFitTree.getTipLabels();
          let bfrDates = bfrTips.map(e => tipData[e].date);
          let bfrGrp = bfrTips.map(e => tipData[e].group);
          let bfrHeights = bestFitTree.getRTTDist();
          let bestFitRegression = regression(
            bfrHeights,
            bfrDates,
            bfrGrp,
            bfrTips
          )

          let newBFRData = {
            ...bestFitData,
            [bfrMethod]: bestFitRegression
          }
          dispatch(setBestFittingRootData(newBFRData))

          dispatch(setCurrentTree(nwk));
          dispatch(setCurrentData(bestFitRegression))
          
          bfrCalculated.current[bfrMethod] = true
          invertBestFittingRoot(!useBestFittingRoot);

        }
      )
    }

    if (useBestFittingRoot && sourceData && bfrTrees) {
      dispatch(setCurrentTree(sourceNwk));
      dispatch(setCurrentData(sourceData));
      dispatch(setBestFittingRoot(
        {
          ...bfrTrees,
          using: bfrMethod
        }
      ));
      invertBestFittingRoot(!useBestFittingRoot);

    } else if (!useBestFittingRoot && bestFitData[bfrMethod] && bfrTrees[bfrMethod]) {
      //@ts-ignore
      dispatch(setCurrentTree(bfrTrees[bfrMethod]));
      //@ts-ignore
      dispatch(setCurrentData(bestFitData[bfrMethod]));

      invertBestFittingRoot(!useBestFittingRoot);
    }

    //  TODO: Retain user selected clocks for future update
    dispatch(setMode(null))
  }

  if (!bfrCalculated.current[bfrMethod] && useBestFittingRoot) {
    return (
      <div className="flex items-center">
        <Label className="text-sm font-medium !text-gray-700 dark:text-gray-300 pr-1" htmlFor="bestRoot">
          Finding Best Fitting Root
        </Label >
        <Spinner size="md" />
      </div>
    )
  } else {
    return (
      <div className="flex items-center">
        <div className="flex items-center pr-2">
          <Label color="" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-700 pr-1 cursor-pointer" htmlFor="bestRoot">
            Best Fitting Root
          </Label >
          <Checkbox className="cursor-pointer" id="bestRoot" onClick={toggleBestFittingRoot} checked={useBestFittingRoot} onChange={() => { }} />
        </div>
        <div className="flex items-center">
          <Dropdown
            size="sm"
            inline
            label={`Method: ${bfrMethod}`}
            className="text-sm font-medium !text-gray-700 dark:text-gray-300"
          >
            <Dropdown.Item onClick={() => handleMethodChange("RMS")}>
              Residual Sum of Squares
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleMethodChange("R2")}>
              R-Squared
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>
    )
  }
}
