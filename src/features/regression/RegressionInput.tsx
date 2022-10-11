import React, { useState } from 'react';
import { TextInput, Label } from 'flowbite-react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectTipNames, selectSource } from '../tree/treeSlice';
import { decimal_date } from '../engine/utils';
import { something } from '../engine/core';
import { setData } from './regressionSlice';


export function RegressionInput(props: any) {
  const [format, setFormat] = useState<string>('');
  const [delimiter, setDelimiter] = useState<string>('');
  const [loc, setLoc] = useState<string>('');
  const [group, setGroup] = useState<string>('');
  const tipNames = useAppSelector(selectTipNames);
  const newick = useAppSelector(selectSource);
  const dispatch = useAppDispatch();

  const createNumericGroups = (groups: Array<string>) => {
    let unique = groups.filter((v, i, a) => a.indexOf(v) === i);
    return groups.map(group => unique.indexOf(group))
  }

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

  const handleSubmit = (event: any) => {
    event.preventDefault();
    
    const decimal_dates = tipNames.map( (name) => {
      let date = extractPartOfTipName(name, delimiter, loc)
      return decimal_date(new Date(date))
    })
    console.log(group);
    
    let groups
    if (group) {
      groups = tipNames.map( (name) => {
        return extractPartOfTipName(name, delimiter, group)
      })
      groups = createNumericGroups(groups)
    } else {
      groups = tipNames.map(() => 0)
    }

    console.log(groups);
    
    const regression_data = something(decimal_dates, groups, newick)
    console.log(regression_data);
    dispatch(setData(regression_data))
  }

  return (  
   <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className='text-xl'>Parse from tip labels</div>
      <div className='flex justify-between space-x-4 '>
        <div className='flex-auto w-64'>
          <Label
            htmlFor='format'
            value='Date format'
          />
          <TextInput
            id="format"
            placeholder="YYYY-MM-DD"
            type="text"
            required={true}
            onChange={e => setFormat(e.target.value)}
            value={format}

          />
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