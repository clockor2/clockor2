import React, { useState } from 'react';
import { TextInput, Label, Select, Tooltip } from 'flowbite-react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectSource, selectCurrentTree, selectBestFittingRoot, setTipData} from '../tree/treeSlice';
import { decimal_date } from '../engine/utils';
import { regression } from '../engine/core';
import { selectRegressionInputDefaults, setData } from './regressionSlice';
import {phylotree} from "phylotree"
import { getTipHeights, getTipNames } from '../engine/utils';

export function RegressionInput(props: any) {
  const defaults = useAppSelector(selectRegressionInputDefaults);
  const sourceNewick = useAppSelector(selectSource);
  const currentTree = useAppSelector(selectCurrentTree)
  const bestFitTree = useAppSelector(selectBestFittingRoot)
  const [format, setFormat] = useState<"yyyy-mm-dd" | "decimal">(defaults.format);
  const [delimiter, setDelimiter] = useState<string>(defaults.delimiter);
  const [loc, setLoc] = useState<string>(defaults.loc);
  const [group, setGroup] = useState<string>(defaults.group);

  const dispatch = useAppDispatch();

  const handelNegativeIndexes = (splitTipName: Array<string>, delimiter: string, loc: number): number => {
    if (loc < 0) {
      loc = splitTipName.length + loc
    }
    return loc
  }

  const extractPartOfTipName = (name: string, delimiter: string, location: string): string => {
    let splitTipName = name.split(delimiter)
    let loc = handelNegativeIndexes(splitTipName, delimiter, parseInt(location))
    return name.split(delimiter)[loc]
  }

  const handleSubmit =  (event: any) => {
    event.preventDefault();
    const phylotreeTree = new phylotree(currentTree)

    phylotreeTree.nodes.each((n: any) => {
      if (!n.data.attribute) {
        n.data.attribute = "0.0";
      } 
    });
    phylotreeTree.setBranchLength((n: any) => {
      return n.data.attribute;
    });
  

    const tipNames: Array<string> = getTipNames(phylotreeTree)
    const tipHeights = getTipHeights(phylotreeTree)
    
    const decimal_dates = tipNames.map( (name) => {
      let date = extractPartOfTipName(name, delimiter, loc)
      return decimal_date(date, format)
    })

      
    let groupings: string[]
    if (group) {
      groupings = tipNames.map((name) => {
        return extractPartOfTipName(name, delimiter, group)
      })
    } else {
      groupings = tipNames.map(() => "none")
    }

    const regression_data = regression(
      tipHeights,
      decimal_dates,
      groupings,
      tipNames);

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
   <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className='text-xl'>Parse from tip labels</div>
      <div className='flex justify-between space-x-4 '>
        <div className='flex-auto w-64'>

         <Tooltip
            content="Use YYYY-MM-DD for YYYY-MM"
            trigger="hover">
            <Label
              htmlFor='format'
              value='Date format'
            />
          </Tooltip>
          
          <Select
                      title="Use 'YYYY-MM-DD' for 'YYYY-MM'"
                      id="format"
                      required={true}
                      name="type"
                      value={format}
                      onChange={e => setFormat(e.target.value as "yyyy-mm-dd" | "decimal")}
                    >
                      <option value={"yyyy-mm-dd"}>
                        YYYY-MM-DD
                      </option>
                      <option value={"decimal"}>
                        Decimal Date
                      </option>
          </Select>

        </div>
        <div className='flex-auto w-16'>
          <Label
            htmlFor='delimiter'
            value='Delimiter'
          />
          <TextInput
            id="delimiter"
            placeholder="_"
            type="text"
            required={true}
            onChange={e => setDelimiter(e.target.value)}
            value={delimiter}
          />
        </div>
      </div>
      <div className='flex justify-between space-x-4 '>
          <div className='flex-auto w-32'>
            <Label
              htmlFor='loc'
              value='Date Location'
            />
            <TextInput
              id="loc"
              placeholder="-1"
              type="number"
              required={true}
              onChange={e => setLoc(e.target.value)}
              value={loc}
            />
          </div>
          <div className='flex-auto w-32'>
            <Label
              htmlFor='group'
              value='Group Location'
            />
            <TextInput
              id="group"
              placeholder="-2"
              type="number"
              onChange={e => setGroup(e.target.value)}
              value={group}
            />
          </div>
      </div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-2">
        Parse
      </button>
    </form>
  );
}