import React, { useState } from 'react';
import { TextInput, Label, Select, Tooltip } from 'flowbite-react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectCurrentTree, setTipData} from '../tree/treeSlice';
import { decimal_date } from '../engine/utils';
import { regression } from '../engine/core';
import { selectRegressionInputDefaults, setData } from './regressionSlice';
import {phylotree} from "phylotree"
import { getTipHeights, getTipNames } from '../engine/utils';
import { TipLabelForm } from './components/tipLabelForm';
import { CSVInput } from './components/csvUploadForm';


export function RegressionInput(props: any) {
  const dispatch = useAppDispatch();
  const currentTree = useAppSelector(selectCurrentTree)
  const phylotreeTree = new phylotree(currentTree)
  const tipNames: Array<string> = getTipNames(phylotreeTree)

  phylotreeTree.nodes.each((n: any) => {
    if (!n.data.attribute) {
      n.data.attribute = "0.0";
    } 
  });
  phylotreeTree.setBranchLength((n: any) => {
    return n.data.attribute;
  });

  const handleSubmit =  (decimal_dates: number[], groupings: string[]) => {
    const tipHeights = getTipHeights(phylotreeTree)

    const regression_data = regression(
      tipHeights,
      decimal_dates,
      groupings,
      tipNames
    );

    dispatch(setData(regression_data))

    let tipDataArr = tipNames.map(
      (e: string, i: number) => {
        return [
          e,
          {date: decimal_dates[i], group: groupings[i]} 
        ]
      }
    )
    let tipData = Object.fromEntries(tipDataArr)
    dispatch(setTipData(tipData))

  }

  return (  
    <div>
      <TipLabelForm onSubmit={handleSubmit} tipNames={tipNames} />
      <div className=" inline-flex items-center justify-center w-full">
        <div className='border-b w-full'></div>
        <div className='p-2'>or</div>
        <div className='border-b w-full'></div>
      </div>
      <CSVInput onSubmit={handleSubmit} tipNames={tipNames} />
  </div>
  );
}