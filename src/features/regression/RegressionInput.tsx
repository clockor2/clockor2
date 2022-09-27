import React, { useState } from 'react';
import { TextInput, Label } from 'flowbite-react';
import { useAppSelector } from '../../app/hooks';
import { selectTipNames } from '../tree/treeSlice';
import { decimal_date } from '../engine/utils';

export function RegressionInput(props: any) {
  const [format, setFormat] = useState<string>('');
  const [delimiter, setDelimiter] = useState<string>('');
  const [group, setGroup] = useState<string>('');
  const tipNames = useAppSelector(selectTipNames);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    console.log(event);
    console.log(format, delimiter, group);
    
    const dates = tipNames.map( (name) => {
      let g
      if (group === '-1') {
        g = name.split(delimiter).length - 1
        console.log(g);
        
      } else {
        g = parseInt(group)
      }
      const date = name.split(delimiter)[g]
      return decimal_date(new Date(date))
    })
    console.log(dates);
    
  }

  return (  
   <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className=' text-xl'>Parse dates from tip labels</div>
      <div>
        <div className="mb-2 block">
          <Label
            htmlFor="format"
            value="Date format"
          />
        </div>
        <TextInput
          id="format"
          placeholder="YYYY-MM-DD"
          required={true}
          onChange={e => setFormat(e.target.value)}
          value={format}

        />
      </div>
      <div>
        <div className="mb-2 block">
          <Label
            htmlFor="delimiter"
            value="Delimiter"
          />
        </div>
        <TextInput
          id="delimiter"
          placeholder="e.g. _ or |"
          required={true}
          onChange={e => setDelimiter(e.target.value)}
          value={delimiter}
        />
      </div>
      <div>
        <div className="mb-2 block">
          <Label
            htmlFor="group"
            value="Group"
          />
        </div>
        <TextInput
          id="group"
          placeholder="Group to take (0-indexed)"
          required={true}
          onChange={e => setGroup(e.target.value)}
          value={group}
        />
      </div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-2">
        Parse
      </button>
    </form>
  );
}