import { Checkbox, Label, Spinner, Dropdown } from "flowbite-react";
import { useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { setCurrentData, selectData, selectBestFittingRootData, setMode } from '../regression/regressionSlice';
import { setBestFittingRootData } from "../regression/regressionSlice";
import { selectSource, setBestFittingRoot, setCurrentTree, selectTipData, selectBestFittingRoot } from '../tree/treeSlice';
import { globalRootParallel } from "../engine/bestFittingRoot";
import { regression } from "../engine/core";
import { readNewick } from "phylojs";
import { addNotification } from "../notifications/notificationsSlice";
import { BFRMethod } from "../engine/dateRandomisation";

interface BFRButtonProps {
  bfrMethod: BFRMethod;
  setBFRMethod: (method: BFRMethod) => void;
  allowNegativeRates: boolean;
  setAllowNegativeRates: (allowNegativeRates: boolean) => void;
}

export function BFRButton(props: BFRButtonProps) {

  const sourceNwk = useAppSelector(selectSource);
  const bfrTrees = useAppSelector(selectBestFittingRoot);
  const sourceData = useAppSelector(selectData);
  const bestFitData = useAppSelector(selectBestFittingRootData);
  const tipData = useAppSelector(selectTipData);
  const dispatch = useAppDispatch();

  const bfrCalculated = useRef<{ R2: boolean, RMS: boolean }>({ R2: false, RMS: false });

  const [useBestFittingRoot, invertBestFittingRoot] = useState(false);
  const [isCalculating, setCalculating] = useState(false);

  const handleMethodChange = (method: "RMS" | "R2") => {
    if (method !== props.bfrMethod && useBestFittingRoot) {

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

      props.setBFRMethod(method)
    }
    if (!useBestFittingRoot && method !== props.bfrMethod && sourceData) {
      dispatch(setCurrentTree(sourceNwk));
        dispatch(setCurrentData(sourceData));
        dispatch(setBestFittingRoot(
          {
            ...bfrTrees,
            using: null
          }
        ));

      props.setBFRMethod(method)
    }
  }

  const handleAllowNegativeRatesChange = () => {
    const nextAllowNegativeRates = !props.allowNegativeRates;
    props.setAllowNegativeRates(nextAllowNegativeRates);
    bfrCalculated.current = { R2: false, RMS: false };

    if (useBestFittingRoot && sourceData && bfrTrees) {
      dispatch(setCurrentTree(sourceNwk));
      dispatch(setCurrentData(sourceData));
      dispatch(setBestFittingRoot(
        {
          ...bfrTrees,
          using: null
        }
      ));
      invertBestFittingRoot(false);
    }
  }

  const toggleBestFittingRoot = () => {

    if (sourceData && !bfrCalculated.current[props.bfrMethod]) {
      setCalculating(true)

      var dates = sourceData.baseClock.x;
      globalRootParallel(sourceNwk, dates, tipData, props.bfrMethod, props.allowNegativeRates).then(
        (nwk: string) => {

          let newBFRState = {
            ...bfrTrees,
            [props.bfrMethod]: nwk,
            using: props.bfrMethod
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
            [props.bfrMethod]: bestFitRegression
          }
          dispatch(setBestFittingRootData(newBFRData))

          dispatch(setCurrentTree(nwk));
          dispatch(setCurrentData(bestFitRegression))
          
          bfrCalculated.current[props.bfrMethod] = true
          invertBestFittingRoot(!useBestFittingRoot);
          setCalculating(false)
        }).catch((error) => {          
          dispatch(addNotification(
            {title: "Error", message: "Failed to calculate best fitting root", type: "error"}
            )
          )
          setCalculating(false)
        }
      )

      dispatch(setMode(null))
      return;
    }

    if (useBestFittingRoot && sourceData && bfrTrees) {
      dispatch(setCurrentTree(sourceNwk));
      dispatch(setCurrentData(sourceData));
      dispatch(setBestFittingRoot(
        {
          ...bfrTrees,
          using: props.bfrMethod
        }
      ));
      invertBestFittingRoot(!useBestFittingRoot);

    } else if (!useBestFittingRoot && bestFitData[props.bfrMethod] && bfrTrees[props.bfrMethod]) {
      //@ts-ignore
      dispatch(setCurrentTree(bfrTrees[props.bfrMethod]));
      //@ts-ignore
      dispatch(setCurrentData(bestFitData[props.bfrMethod]));

      invertBestFittingRoot(!useBestFittingRoot);
    }
    
    //  TODO: Retain user selected clocks for future update
    dispatch(setMode(null))
  }

  if (isCalculating) {
    return (
      <div className="flex items-center">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-400 pr-1" htmlFor="bestRoot">
          Finding Best Fitting Root
        </Label >
        <Spinner size="md" />
      </div>
    )
  } else {
    return (
      <div className="flex items-center">
        <div className="flex items-center pr-2">
          <Label color="" className="text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-blue-700 pr-1 cursor-pointer" htmlFor="bestRoot">
            {window.innerWidth < 768 ? "BFR" : "Best Fitting Root"}
          </Label >
          <Checkbox className="cursor-pointer" id="bestRoot" onClick={toggleBestFittingRoot} checked={useBestFittingRoot} onChange={() => {}} />
        </div>
        <div className="flex items-center !text-sm text-gray-700 dark:text-gray-400 !font-medium">
          <Dropdown
            inline
            label={ props.bfrMethod === "RMS" ? "RMS" : 'R²' }
          >
            <Dropdown.Header>
              <span className="block text-sm font-bold text">
                Select a method to find the best fitting root 
              </span>
            </Dropdown.Header>
            <Dropdown.Item onClick={() => handleMethodChange("RMS")} className={props.bfrMethod === "RMS" ? "text-blue-700" : ''} >
              Residual-mean-squared
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleMethodChange("R2")} className={props.bfrMethod === "R2" ? "text-blue-700" : ''}>
              R-Squared
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item>
              <div
                className="flex items-center gap-2"
                onClick={(event) => {
                  event.stopPropagation();
                  handleAllowNegativeRatesChange();
                }}
              >
                <Checkbox
                  id="allowNegativeRates"
                  checked={props.allowNegativeRates}
                  onChange={() => {}}
                />
                <span className="cursor-pointer">
                  Allow negative rates
                </span>
              </div>
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>
    )
  }
}
