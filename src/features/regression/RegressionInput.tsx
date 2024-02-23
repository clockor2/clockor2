import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectCurrentTree, setTipData} from '../tree/treeSlice';
import { regression } from '../engine/core';
import { setData } from './regressionSlice';
import { TipLabelForm } from './components/tipLabelForm';
import { CSVInput } from './components/csvUploadForm';
import { readNewick } from 'phylojs'
import { addNotification } from '../notifications/notificationsSlice';

export function RegressionInput(props: any) {
  const dispatch = useAppDispatch();
  const currentTree = useAppSelector(selectCurrentTree)
  const inputTree = readNewick(currentTree)
  const tipNames = inputTree.getTipLabels()

  const handleSubmit =  (decimal_dates: number[], groupings: string[]) => {
    // assert all decimal dates are numbers
    if (decimal_dates.some(isNaN)) {
      // find index all the NaNs and print the corresponding tip names
      let nanIndices = decimal_dates.map((e, i) => isNaN(e) ? i : -1).filter(e => e !== -1)
      let nanTipNames = nanIndices.map(e => tipNames[e])
      console.log(nanTipNames)
      // join the tip names into a string
      // if the string is too long, truncate it
      const limit = 4
      if (nanTipNames.length > limit) {
        nanTipNames = nanTipNames.slice(0, limit)
        nanTipNames.push(`... (${nanTipNames.length} more)`)
      } 
      let nanTipNamesStr = nanTipNames.join(", ")
      dispatch(addNotification({title: "Some tips could not be parsed", message: `${nanTipNamesStr}`, type: "error"}))
      throw new Error('All dates must be numbers')
    }
    const tipHeights = inputTree.getRTTDist()

    const regression_data = regression(
      tipHeights,
      decimal_dates,
      groupings,
      tipNames
    );

    dispatch(setData(regression_data))

    let tipDataArr = tipNames.map( // TODO: Make tip date arr using phylojs
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
        <div className='p-2 dark:text-slate-300 text-slate-400'>or</div>
        <div className='border-b w-full'></div>
      </div>
      <CSVInput onSubmit={handleSubmit} tipNames={tipNames} />
  </div>
  );
}