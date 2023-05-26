import { Checkbox, Label, Spinner } from "flowbite-react";
import { useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { setCurrentData, selectData, selectBestFitData } from '../regression/regressionSlice';
import { setBestFittingRegression } from "../regression/regressionSlice";
import { selectSource, setBestFittingRoot, selectBestFittingRoot, setCurrentTree, selectTipData} from '../tree/treeSlice';
import { globalRootParallel } from "../engine/bestFittingRoot";
import { regression } from "../engine/core";
import { readNewick } from "phylojs";

export function BFRButton () {

const sourceNwk = useAppSelector(selectSource);
const bestFitNwk = useAppSelector(selectBestFittingRoot);
const sourceData = useAppSelector(selectData);
const bestFitData = useAppSelector(selectBestFitData);
const tipData = useAppSelector(selectTipData);
const dispatch = useAppDispatch();

const bfrExists = useRef(false);

const [useBestFittingRoot, invertBestFittingRoot] = useState(false);
const toggleBestFittingRoot = () => {
  invertBestFittingRoot(!useBestFittingRoot);

  if (sourceData && !bfrExists.current) {

      var dates = sourceData.baseClock.x;
      globalRootParallel(sourceNwk, dates, tipData).then(
        (nwk: string) => { 
          dispatch(setBestFittingRoot(nwk)) 

          let bestFitTree = readNewick(nwk) 

          let tree = readNewick(sourceNwk)

          console.log("Length before BFR: " + tree.getTotalBranchLength())
          console.log("Length after BFR: " + bestFitTree.getTotalBranchLength())
          console.log(
            `Same Length: ${Math.abs(
              tree.getTotalBranchLength()
              -
              bestFitTree.getTotalBranchLength()
            ) < Number.EPSILON
            }`
          )
          console.log("Diff Check with basal length: " +
          Math.abs(
            tree.getTotalBranchLength()
            -
            bestFitTree.getTotalBranchLength()
          ))

          let bfrTips = bestFitTree.getTipLabels();
          let bfrDates = bfrTips.map(e => tipData[e].date);
          let bfrGrp = bfrTips.map(e => tipData[e].group);
          let bfrHeights = bestFitTree.getRTTDist();

          const bestFitRegression = regression(
            bfrHeights,
            bfrDates,
            bfrGrp,
            bfrTips
          )

          dispatch(setBestFittingRegression(bestFitRegression))
          dispatch(setCurrentTree(nwk));
          dispatch(setCurrentData(bestFitRegression));
          
          bfrExists.current = true 
        }
        )


  }

  if (useBestFittingRoot && sourceData && bfrExists.current) {
    dispatch(setCurrentTree(sourceNwk));
    dispatch(setCurrentData(sourceData));

  } else if (!useBestFittingRoot && bestFitData && bfrExists.current) {
    dispatch(setCurrentTree(bestFitNwk));
    dispatch(setCurrentData(bestFitData));
  }
}

if (!bfrExists.current && useBestFittingRoot) {
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
        <Label  className="text-sm font-medium !text-gray-700 dark:text-gray-300 pr-1 cursor-pointer" htmlFor="bestRoot">
          Best Fitting Root
        </Label >
        <Checkbox className="cursor-pointer" id="bestRoot" onClick={toggleBestFittingRoot} defaultChecked={useBestFittingRoot}/>
      </div>
    )
}}
