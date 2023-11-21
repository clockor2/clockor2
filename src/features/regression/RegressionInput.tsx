import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectCurrentTree, setTipData} from '../tree/treeSlice';
import { regression } from '../engine/core';
import { setData } from './regressionSlice';
import { TipLabelForm } from './components/tipLabelForm';
import { CSVInput } from './components/csvUploadForm';
import { readNewick } from 'phylojs'

export function RegressionInput(props: any) {
  const dispatch = useAppDispatch();
  const currentTree = useAppSelector(selectCurrentTree)
  const inputTree = readNewick(currentTree)
  const tipNames = inputTree.getTipLabels()

  const handleSubmit =  (decimal_dates: number[], groupings: string[]) => {
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
        <div className='p-2 dark:text-white'>or</div>
        <div className='border-b w-full'></div>
      </div>
      <CSVInput onSubmit={handleSubmit} tipNames={tipNames} />
  </div>
  );
}