import { useState } from 'react';
import { TextInput, Label, Select, Tooltip } from 'flowbite-react';
import { useAppSelector } from '../../../app/hooks';
import { decimal_date } from '../../engine/utils';
import { selectRegressionInputDefaults } from '../regressionSlice';
import { extractPartOfTipName } from '../../engine/utils';

export function TipLabelForm(props: any) {
    const defaults = useAppSelector(selectRegressionInputDefaults);
    const [format, setFormat] = useState<"yyyy-mm-dd" | "decimal">(defaults.format);
    const [delimiter, setDelimiter] = useState<string>(defaults.delimiter);
    const [loc, setLoc] = useState<string>(defaults.loc);
    const [group, setGroup] = useState<string>(defaults.group);
  
    const decimal_dates = props.tipNames.map( (name: string) => {
      let date = extractPartOfTipName(name, delimiter, loc)
      return decimal_date(date, format)
    })
  
    let groupings: string[]
    if (group) {
      groupings = props.tipNames.map((name: string) => {
        return extractPartOfTipName(name, delimiter, group)
      })
    } else {
      groupings = props.tipNames.map(() => "none")
    }
  
    const handleSubmit = (event: any) => {
      event.preventDefault();
      props.onSubmit(decimal_dates, groupings)
    }
  
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <div className='text-xl'>Parse from tip labels</div>
        <div className='text-slate-400 text-sm pt-1'>e.g. {props.tipNames[0]}</div>
      </div>
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
        Parse Tips
      </button>
    </form>
    )
  
  }