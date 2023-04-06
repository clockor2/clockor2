import { Checkbox, Label, Spinner } from "flowbite-react";
//import { CircularProgress, CircularProgressProps } from "@mui/material"
import React, { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectCurrentData, setCurrentData, selectData, selectBestFitData } from '../regression/regressionSlice';
import { setBestFittingRegression } from "../regression/regressionSlice";
import { selectTipNames, selectSource, selectTipHeights, setBestFittingRoot, selectCurrentTree, selectBestFittingRoot, setCurrentTree, selectTipData} from '../tree/treeSlice';
import { globalRootParallel } from "../engine/bestFittingRoot";
import { getTipNames, getTipHeights } from "../engine/utils";
import { regression } from "../engine/core";
import { reorderData } from "../engine/bestFittingRoot";
import { phylotree }  from "phylotree";

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

          let bestFitTree = new phylotree(nwk) 

          let tree = new phylotree(sourceNwk)

          console.log("Length before BFR: " + tree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0))
          console.log("Length after BFR: " + bestFitTree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0))
          console.log(
            `Same Length: ${Math.abs(
              tree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0)
              -
              bestFitTree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0)
            ) < Number.EPSILON
            }`
          )
          console.log("Diff Check with basal length: " +
          Math.abs(
            tree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0)
            -
            bestFitTree.getBranchLengths().filter((e: number) => e).reduce((a: number, b: number) => a+b, 0)
          ))

          let bfrTips = getTipNames(bestFitTree);
          let bfrDates = bfrTips.map(e => tipData[e].date)
          let bfrGrp = bfrTips.map(e => tipData[e].group)
          let bfrHeights = getTipHeights(bestFitTree)

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

if (bfrExists.current) {
    return (
    <div className="flex items-center p-1 ">
      <Checkbox id="bestRoot" onClick={toggleBestFittingRoot} defaultChecked={useBestFittingRoot}/>
      <Label className="pl-1" htmlFor="bestRoot">
        Best Fitting Root
      </Label>
    </div>
    )
} else if (!bfrExists.current && !useBestFittingRoot) {
      return (
        <div className="flex items-center p-1 ">
          <Checkbox id="bestRoot" onClick={toggleBestFittingRoot} defaultChecked={useBestFittingRoot}/>
          <Label className="pl-1" htmlFor="bestRoot">
            Best Fitting Root
          </Label>
        </div>
        )
} else if (!bfrExists.current && useBestFittingRoot) {
    return (
    <div>
      <Spinner/>
      <Label className="pl-1" htmlFor="bestRoot">
        Finding Best Fitting Root
      </Label>
    </div>
    )
  } else {
    return(<div></div>)// Never happens - for completeness
  }
}
