import { Checkbox, Label, Spinner } from "flowbite-react";
//import { CircularProgress, CircularProgressProps } from "@mui/material"
import React, { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectCurrentData, setCurrentData, selectData, selectBestFitData } from '../regression/regressionSlice';
import { setBestFittingRegression } from "../regression/regressionSlice";
import { selectTipNames, selectSource, selectTipHeights, setBestFittingRoot, selectCurrentTree, selectBestFittingRoot, setCurrentTree} from '../tree/treeSlice';
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
const dispatch = useAppDispatch();

const bfrExists = useRef(false);

const [useBestFittingRoot, invertBestFittingRoot] = useState(false);
const toggleBestFittingRoot = () => {

  if (sourceData && !bfrExists.current) {
    var dates = sourceData.baseClock.x;

      globalRootParallel(sourceNwk, dates).then(
        (nwk: string) => { 
          dispatch(setBestFittingRoot(nwk)) 

          let bestFitTree = new phylotree(nwk) 

          let bfrTips = getTipNames(bestFitTree);
          let sourceTips = sourceData.baseClock.tip;
          var bfrDates = reorderData(
            dates,
            sourceTips, 
            bfrTips,
          )

          // handle groups
          var bfrGrp;
          if (sourceData.localClock.length > 1) {
            var sourceTipsGrouped = sourceData.localClock.map(e => e.tip)

            var sounceTipsGroupedNumbered = sourceTipsGrouped.map(
              (e, i) => e.map( e1 => i)
            )
            var sourceGrp = sounceTipsGroupedNumbered.flat()

            bfrGrp = reorderData(
              sourceGrp,
              bfrTips,
              sourceTips
            )
          } else {
            bfrGrp = bfrTips.map((e: string) => 0)
          }
      
          const bestFitRegression = regression(
            getTipHeights(bestFitTree),
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
  invertBestFittingRoot(!useBestFittingRoot);

  if (useBestFittingRoot && bestFitData && bfrExists.current) {
    dispatch(setCurrentTree(bestFitNwk));
    dispatch(setCurrentData(bestFitData));


  } else if (!useBestFittingRoot && sourceData && bfrExists.current) {
    dispatch(setCurrentTree(sourceNwk));
    dispatch(setCurrentData(sourceData));
  }
}

if (bfrExists.current) {
    return (
    <div className="flex items-center p-1 ">
      <Checkbox id="bestRoot" onClick={toggleBestFittingRoot} />
      <Label className="pl-1" htmlFor="bestRoot">
        Best Fitting Root
      </Label>
    </div>
    )
} else if (!bfrExists.current && !useBestFittingRoot) {
      return (
        <div className="flex items-center p-1 ">
          <Checkbox id="bestRoot" onClick={toggleBestFittingRoot} />
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
